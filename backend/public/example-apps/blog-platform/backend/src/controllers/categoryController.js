const { Category, Post, User } = require('../../../database');
const { cache, cacheKeys } = require('../utils/redis');
const { generateCategoryMetaTags } = require('../utils/seo');
const slugify = require('slugify');
const logger = require('../utils/logger');

// Get all categories
const getCategories = async (req, res) => {
  try {
    const { includePostCount = 'false' } = req.query;

    // Check cache first
    const cacheKey = cacheKeys.categories();
    const cachedCategories = await cache.get(cacheKey);

    if (cachedCategories && includePostCount === 'false') {
      return res.json({
        success: true,
        data: { categories: cachedCategories }
      });
    }

    const includeOptions = [];

    if (includePostCount === 'true') {
      includeOptions.push({
        model: Post,
        as: 'posts',
        attributes: [],
        where: { 
          status: 'published',
          publishedAt: { $lte: new Date() }
        },
        required: false
      });
    }

    const categories = await Category.findAll({
      where: { isActive: true },
      include: includeOptions,
      attributes: includePostCount === 'true' 
        ? ['id', 'name', 'slug', 'description', 'color', [Category.sequelize.fn('COUNT', Category.sequelize.col('posts.id')), 'postCount']]
        : ['id', 'name', 'slug', 'description', 'color'],
      group: includePostCount === 'true' ? ['Category.id'] : undefined,
      order: [['name', 'ASC']]
    });

    // Cache categories for 1 hour (without post count)
    if (includePostCount === 'false') {
      await cache.set(cacheKey, categories, 3600);
    }

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    logger.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

// Get single category by slug
const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({
      where: { slug, isActive: true }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Generate SEO data
    const seoData = {
      metaTags: generateCategoryMetaTags(category)
    };

    res.json({
      success: true,
      data: {
        category,
        seo: seoData
      }
    });
  } catch (error) {
    logger.error('Get category by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category'
    });
  }
};

// Get posts by category
const getPostsByCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const category = await Category.findOne({
      where: { slug, isActive: true }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const { count, rows: posts } = await Post.findAndCountAll({
      where: {
        categoryId: category.id,
        status: 'published',
        publishedAt: { $lte: new Date() }
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName', 'avatar']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'color']
        }
      ],
      limit,
      offset,
      order: [['publishedAt', 'DESC']],
      distinct: true
    });

    // Generate SEO data
    const seoData = {
      metaTags: generateCategoryMetaTags(category, posts)
    };

    res.json({
      success: true,
      data: {
        category,
        posts,
        seo: seoData,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalPosts: count,
          hasNext: page < Math.ceil(count / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Get posts by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category posts'
    });
  }
};

// Create new category (admin only)
const createCategory = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    // Generate slug
    let slug = slugify(name, { lower: true, strict: true });
    
    // Ensure slug is unique
    let counter = 1;
    let originalSlug = slug;
    while (await Category.findOne({ where: { slug } })) {
      slug = `${originalSlug}-${counter}`;
      counter++;
    }

    const category = await Category.create({
      name,
      slug,
      description,
      color: color || '#007bff'
    });

    // Clear category cache
    await cache.del(cacheKeys.categories());
    await cache.delPattern('posts:*');

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });
  } catch (error) {
    logger.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category'
    });
  }
};

// Update category (admin only)
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color, isActive } = req.body;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Update slug if name changed
    let slug = category.slug;
    if (name && name !== category.name) {
      slug = slugify(name, { lower: true, strict: true });
      
      // Ensure slug is unique
      let counter = 1;
      let originalSlug = slug;
      while (await Category.findOne({ where: { slug, id: { $ne: id } } })) {
        slug = `${originalSlug}-${counter}`;
        counter++;
      }
    }

    const updateData = {
      ...(name && { name }),
      ...(slug !== category.slug && { slug }),
      ...(description !== undefined && { description }),
      ...(color && { color }),
      ...(isActive !== undefined && { isActive })
    };

    await category.update(updateData);

    // Clear caches
    await cache.del(cacheKeys.categories());
    await cache.delPattern('posts:*');

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category }
    });
  } catch (error) {
    logger.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category'
    });
  }
};

// Delete category (admin only)
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has posts
    const postCount = await Post.count({
      where: { categoryId: id }
    });

    if (postCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${postCount} posts. Please move or delete the posts first.`
      });
    }

    await category.destroy();

    // Clear caches
    await cache.del(cacheKeys.categories());
    await cache.delPattern('posts:*');

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    logger.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category'
    });
  }
};

// Get category statistics (admin only)
const getCategoryStats = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: Post,
          as: 'posts',
          attributes: [],
          where: { 
            status: 'published',
            publishedAt: { $lte: new Date() }
          },
          required: false
        }
      ],
      attributes: [
        'id',
        'name',
        'slug',
        'isActive',
        [Category.sequelize.fn('COUNT', Category.sequelize.col('posts.id')), 'postCount']
      ],
      group: ['Category.id'],
      order: [
        [Category.sequelize.fn('COUNT', Category.sequelize.col('posts.id')), 'DESC']
      ]
    });

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    logger.error('Get category stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category statistics'
    });
  }
};

module.exports = {
  getCategories,
  getCategoryBySlug,
  getPostsByCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats
};
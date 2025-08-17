const { Post, User, Category, Comment, Like } = require('../../../database');
const { cache, cacheKeys } = require('../utils/redis');
const { generatePostSchema, generatePostMetaTags } = require('../utils/seo');
const slugify = require('slugify');
const logger = require('../utils/logger');

// Get all posts (public)
const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { category, tag, search, status = 'published', featured } = req.query;

    // Build cache key
    const cacheKey = cacheKeys.postList(page, limit, { category, tag, search, status, featured });
    
    // Check cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.json({
        success: true,
        data: cachedData
      });
    }

    // Build where clause
    const where = {};
    
    if (status === 'published') {
      where.status = 'published';
      where.publishedAt = { $lte: new Date() };
    } else if (req.user && ['author', 'admin'].includes(req.user.role)) {
      // Authors can see their own drafts, admins can see all
      if (req.user.role === 'author' && status !== 'published') {
        where.authorId = req.user.id;
      }
      if (status && status !== 'all') {
        where.status = status;
      }
    } else {
      where.status = 'published';
      where.publishedAt = { $lte: new Date() };
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (tag) {
      where.tags = { $contains: [tag] };
    }

    if (search) {
      where.$or = [
        { title: { $iLike: `%${search}%` } },
        { content: { $iLike: `%${search}%` } },
        { excerpt: { $iLike: `%${search}%` } }
      ];
    }

    // Include conditions
    const include = [
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
    ];

    if (category) {
      include[1].where = { slug: category };
    }

    const { count, rows: posts } = await Post.findAndCountAll({
      where,
      include,
      limit,
      offset,
      order: [['publishedAt', 'DESC'], ['createdAt', 'DESC']],
      distinct: true
    });

    const result = {
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalPosts: count,
        hasNext: page < Math.ceil(count / limit),
        hasPrev: page > 1
      }
    };

    // Cache for 5 minutes
    await cache.set(cacheKey, result, 300);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts'
    });
  }
};

// Get single post by slug
const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { incrementView = 'true' } = req.query;

    // Check cache first
    const cacheKey = cacheKeys.post(slug);
    let cachedPost = await cache.get(cacheKey);

    if (!cachedPost) {
      const post = await Post.findOne({
        where: { slug },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'firstName', 'lastName', 'avatar', 'bio']
          },
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug', 'color']
          }
        ]
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      // Check if user has permission to view post
      if (post.status !== 'published') {
        if (!req.user || 
            (req.user.role === 'author' && post.authorId !== req.user.id) ||
            (req.user.role === 'user')) {
          return res.status(404).json({
            success: false,
            message: 'Post not found'
          });
        }
      }

      cachedPost = post;
      // Cache published posts for 10 minutes
      if (post.status === 'published') {
        await cache.set(cacheKey, post, 600);
      }
    }

    // Increment view count (don't wait for it)
    if (incrementView === 'true' && cachedPost.status === 'published') {
      cachedPost.incrementViewCount().catch(err => 
        logger.error('Failed to increment view count:', err)
      );
    }

    // Generate SEO data
    const seoData = {
      metaTags: generatePostMetaTags(cachedPost, cachedPost.author, cachedPost.category),
      schema: generatePostSchema(cachedPost, cachedPost.author, cachedPost.category)
    };

    res.json({
      success: true,
      data: {
        post: cachedPost,
        seo: seoData
      }
    });
  } catch (error) {
    logger.error('Get post by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post'
    });
  }
};

// Create new post
const createPost = async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      categoryId,
      tags = [],
      status = 'draft',
      scheduledAt,
      featuredImage,
      seoTitle,
      seoDescription,
      seoKeywords = [],
      allowComments = true,
      isFeatured = false
    } = req.body;

    // Generate slug
    let slug = slugify(title, { lower: true, strict: true });
    
    // Ensure slug is unique
    let counter = 1;
    let originalSlug = slug;
    while (await Post.findOne({ where: { slug } })) {
      slug = `${originalSlug}-${counter}`;
      counter++;
    }

    const postData = {
      title,
      slug,
      content,
      excerpt,
      categoryId: categoryId || null,
      tags,
      status,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      featuredImage,
      seoTitle,
      seoDescription,
      seoKeywords,
      allowComments,
      isFeatured: req.user.role === 'admin' ? isFeatured : false,
      authorId: req.user.id
    };

    const post = await Post.create(postData);

    // Load associations
    await post.reload({
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
      ]
    });

    // Clear related caches
    await cache.delPattern('posts:*');
    await cache.delPattern('sitemap*');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post }
    });
  } catch (error) {
    logger.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post'
    });
  }
};

// Update post
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      excerpt,
      categoryId,
      tags,
      status,
      scheduledAt,
      featuredImage,
      seoTitle,
      seoDescription,
      seoKeywords,
      allowComments,
      isFeatured
    } = req.body;

    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check permissions
    if (req.user.role === 'author' && post.authorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own posts'
      });
    }

    // Update slug if title changed
    let slug = post.slug;
    if (title && title !== post.title) {
      slug = slugify(title, { lower: true, strict: true });
      
      // Ensure slug is unique
      let counter = 1;
      let originalSlug = slug;
      while (await Post.findOne({ where: { slug, id: { $ne: id } } })) {
        slug = `${originalSlug}-${counter}`;
        counter++;
      }
    }

    const updateData = {
      ...(title && { title }),
      ...(slug !== post.slug && { slug }),
      ...(content && { content }),
      ...(excerpt !== undefined && { excerpt }),
      ...(categoryId !== undefined && { categoryId }),
      ...(tags && { tags }),
      ...(status && { status }),
      ...(scheduledAt !== undefined && { scheduledAt: scheduledAt ? new Date(scheduledAt) : null }),
      ...(featuredImage !== undefined && { featuredImage }),
      ...(seoTitle !== undefined && { seoTitle }),
      ...(seoDescription !== undefined && { seoDescription }),
      ...(seoKeywords && { seoKeywords }),
      ...(allowComments !== undefined && { allowComments }),
      ...(req.user.role === 'admin' && isFeatured !== undefined && { isFeatured })
    };

    await post.update(updateData);

    // Load associations
    await post.reload({
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
      ]
    });

    // Clear caches
    await cache.delPattern('posts:*');
    await cache.del(cacheKeys.post(post.slug));
    await cache.delPattern('sitemap*');

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: { post }
    });
  } catch (error) {
    logger.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post'
    });
  }
};

// Delete post
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check permissions
    if (req.user.role === 'author' && post.authorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts'
      });
    }

    await post.destroy();

    // Clear caches
    await cache.delPattern('posts:*');
    await cache.del(cacheKeys.post(post.slug));
    await cache.delPattern('sitemap*');

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    logger.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post'
    });
  }
};

// Get posts by author
const getPostsByAuthor = async (req, res) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const author = await User.findOne({ where: { username } });

    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }

    const where = {
      authorId: author.id,
      status: 'published',
      publishedAt: { $lte: new Date() }
    };

    const { count, rows: posts } = await Post.findAndCountAll({
      where,
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

    res.json({
      success: true,
      data: {
        author: author.getPublicProfile(),
        posts,
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
    logger.error('Get posts by author error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch author posts'
    });
  }
};

// Like/unlike post
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user already liked the post
    const existingLike = await Like.findOne({
      where: {
        userId: req.user.id,
        postId: id
      }
    });

    if (existingLike) {
      // Unlike
      await existingLike.destroy();
      
      res.json({
        success: true,
        message: 'Post unliked',
        data: { liked: false }
      });
    } else {
      // Like
      await Like.create({
        userId: req.user.id,
        postId: id,
        type: 'like'
      });

      res.json({
        success: true,
        message: 'Post liked',
        data: { liked: true }
      });
    }

    // Clear post cache
    await cache.del(cacheKeys.post(post.slug));
  } catch (error) {
    logger.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like'
    });
  }
};

// Get popular posts
const getPopularPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    // Check cache first
    const cacheKey = cacheKeys.popularPosts();
    const cachedPosts = await cache.get(cacheKey);

    if (cachedPosts) {
      return res.json({
        success: true,
        data: { posts: cachedPosts.slice(0, limit) }
      });
    }

    const posts = await Post.findAll({
      where: {
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
      order: [
        ['viewCount', 'DESC'],
        ['likesCount', 'DESC'],
        ['commentsCount', 'DESC']
      ],
      limit: 10
    });

    // Cache for 1 hour
    await cache.set(cacheKey, posts, 3600);

    res.json({
      success: true,
      data: { posts: posts.slice(0, limit) }
    });
  } catch (error) {
    logger.error('Get popular posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular posts'
    });
  }
};

module.exports = {
  getPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  getPostsByAuthor,
  toggleLike,
  getPopularPosts
};
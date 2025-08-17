const { User, Post, Comment, Category, Like, Session } = require('../../../database');
const { cache } = require('../utils/redis');
const logger = require('../utils/logger');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get current date for time-based queries
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Basic counts
    const totalUsers = await User.count();
    const totalPosts = await Post.count();
    const totalComments = await Comment.count();
    const totalCategories = await Category.count();

    // Published posts
    const publishedPosts = await Post.count({
      where: {
        status: 'published'
      }
    });

    // Pending comments
    const pendingComments = await Comment.count({
      where: {
        status: 'pending'
      }
    });

    // Active sessions (last 24 hours)
    const activeSessions = await Session.count({
      where: {
        isActive: true,
        updatedAt: {
          $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
        }
      }
    });

    // Recent activity
    const recentPosts = await Post.count({
      where: {
        createdAt: {
          $gte: lastWeek
        }
      }
    });

    const recentComments = await Comment.count({
      where: {
        createdAt: {
          $gte: lastWeek
        }
      }
    });

    const recentUsers = await User.count({
      where: {
        createdAt: {
          $gte: lastWeek
        }
      }
    });

    // Growth metrics (last 30 days vs previous 30 days)
    const currentMonthUsers = await User.count({
      where: {
        createdAt: {
          $gte: lastMonth
        }
      }
    });

    const currentMonthPosts = await Post.count({
      where: {
        createdAt: {
          $gte: lastMonth
        }
      }
    });

    const currentMonthComments = await Comment.count({
      where: {
        createdAt: {
          $gte: lastMonth
        }
      }
    });

    // Top authors (by post count)
    const topAuthors = await User.findAll({
      include: [
        {
          model: Post,
          as: 'posts',
          attributes: [],
          where: {
            status: 'published'
          },
          required: false
        }
      ],
      attributes: [
        'id',
        'username',
        'firstName',
        'lastName',
        'avatar',
        [User.sequelize.fn('COUNT', User.sequelize.col('posts.id')), 'postCount']
      ],
      group: ['User.id'],
      order: [
        [User.sequelize.fn('COUNT', User.sequelize.col('posts.id')), 'DESC']
      ],
      limit: 5,
      having: User.sequelize.literal('COUNT(posts.id) > 0')
    });

    // Most popular posts (by views)
    const popularPosts = await Post.findAll({
      where: {
        status: 'published'
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['username', 'firstName', 'lastName']
        }
      ],
      attributes: ['id', 'title', 'slug', 'viewCount', 'likesCount', 'commentsCount'],
      order: [['viewCount', 'DESC']],
      limit: 5
    });

    // Recent posts
    const recentPostsList = await Post.findAll({
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['username', 'firstName', 'lastName']
        }
      ],
      attributes: ['id', 'title', 'slug', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalPosts,
          publishedPosts,
          totalComments,
          pendingComments,
          totalCategories,
          activeSessions
        },
        recentActivity: {
          posts: recentPosts,
          comments: recentComments,
          users: recentUsers
        },
        growth: {
          users: currentMonthUsers,
          posts: currentMonthPosts,
          comments: currentMonthComments
        },
        topAuthors,
        popularPosts,
        recentPosts: recentPostsList
      }
    });
  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

// Get all users with pagination
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { role, search, isActive } = req.query;

    // Build where clause
    const where = {};
    
    if (role) {
      where.role = role;
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (search) {
      where.$or = [
        { username: { $iLike: `%${search}%` } },
        { email: { $iLike: `%${search}%` } },
        { firstName: { $iLike: `%${search}%` } },
        { lastName: { $iLike: `%${search}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      include: [
        {
          model: Post,
          as: 'posts',
          attributes: [],
          required: false
        }
      ],
      attributes: [
        'id',
        'username',
        'email',
        'firstName',
        'lastName',
        'role',
        'isActive',
        'emailVerified',
        'lastLogin',
        'createdAt',
        [User.sequelize.fn('COUNT', User.sequelize.col('posts.id')), 'postCount']
      ],
      group: ['User.id'],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalUsers: count,
          hasNext: page < Math.ceil(count / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// Update user role/status
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, isActive, emailVerified } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent self-demotion
    if (req.user.id === parseInt(id) && role && role !== req.user.role) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role'
      });
    }

    const updateData = {};
    
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (emailVerified !== undefined) updateData.emailVerified = emailVerified;

    await user.update(updateData);

    // If user is deactivated, deactivate all their sessions
    if (isActive === false) {
      await Session.update(
        { isActive: false },
        { where: { userId: id } }
      );
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: user.getPublicProfile() }
    });
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has posts
    const postCount = await Post.count({
      where: { authorId: id }
    });

    if (postCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete user with ${postCount} posts. Please reassign or delete the posts first.`
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

// Get all posts with enhanced filtering
const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { status, author, category, search } = req.query;

    // Build where clause
    const where = {};
    
    if (status) {
      where.status = status;
    }

    if (search) {
      where.$or = [
        { title: { $iLike: `%${search}%` } },
        { content: { $iLike: `%${search}%` } }
      ];
    }

    // Include conditions
    const include = [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'firstName', 'lastName']
      },
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug'],
        required: false
      }
    ];

    if (author) {
      include[0].where = { username: author };
    }

    if (category) {
      include[1].where = { slug: category };
      include[1].required = true;
    }

    const { count, rows: posts } = await Post.findAndCountAll({
      where,
      include,
      attributes: [
        'id',
        'title',
        'slug',
        'status',
        'viewCount',
        'likesCount',
        'commentsCount',
        'isFeatured',
        'publishedAt',
        'createdAt'
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true
    });

    res.json({
      success: true,
      data: {
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
    logger.error('Get all posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts'
    });
  }
};

// Get all comments with moderation info
const getAllComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { status, postId } = req.query;

    // Build where clause
    const where = {};
    
    if (status) {
      where.status = status;
    }

    if (postId) {
      where.postId = postId;
    }

    const { count, rows: comments } = await Comment.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName'],
          required: false
        },
        {
          model: Post,
          as: 'post',
          attributes: ['id', 'title', 'slug']
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true
    });

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalComments: count,
          hasNext: page < Math.ceil(count / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Get all comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments'
    });
  }
};

// Clear cache
const clearCache = async (req, res) => {
  try {
    const { pattern } = req.body;

    if (pattern) {
      await cache.delPattern(pattern);
      res.json({
        success: true,
        message: `Cache cleared for pattern: ${pattern}`
      });
    } else {
      // Clear all cache (dangerous operation)
      const redisClient = require('../utils/redis').getRedisClient();
      if (redisClient) {
        await redisClient.flushAll();
        res.json({
          success: true,
          message: 'All cache cleared'
        });
      } else {
        res.json({
          success: true,
          message: 'No cache to clear (Redis not connected)'
        });
      }
    }
  } catch (error) {
    logger.error('Clear cache error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache'
    });
  }
};

// Get system health
const getSystemHealth = async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {}
    };

    // Check database
    try {
      await User.findOne({ limit: 1 });
      health.services.database = { status: 'healthy' };
    } catch (error) {
      health.services.database = { status: 'unhealthy', error: error.message };
      health.status = 'unhealthy';
    }

    // Check Redis
    const redisClient = require('../utils/redis').getRedisClient();
    if (redisClient) {
      try {
        await redisClient.ping();
        health.services.redis = { status: 'healthy' };
      } catch (error) {
        health.services.redis = { status: 'unhealthy', error: error.message };
      }
    } else {
      health.services.redis = { status: 'not_configured' };
    }

    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    logger.error('Get system health error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check system health'
    });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUser,
  deleteUser,
  getAllPosts,
  getAllComments,
  clearCache,
  getSystemHealth
};
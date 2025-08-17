const { Comment, User, Post, Like } = require('../../../database');
const { cache, cacheKeys } = require('../utils/redis');
const { sendCommentNotification } = require('../utils/email');
const logger = require('../utils/logger');

// Get comments for a post
const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { status = 'approved' } = req.query;

    // Check cache first for approved comments
    if (status === 'approved') {
      const cacheKey = cacheKeys.comments(postId, page);
      const cachedComments = await cache.get(cacheKey);
      
      if (cachedComments) {
        return res.json({
          success: true,
          data: cachedComments
        });
      }
    }

    // Verify post exists
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Build where clause
    const where = { postId };
    
    // Only show approved comments to public
    if (!req.user || req.user.role === 'user') {
      where.status = 'approved';
    } else if (status !== 'all') {
      where.status = status;
    }

    // Get top-level comments with their replies
    const { count, rows: comments } = await Comment.findAndCountAll({
      where: {
        ...where,
        parentId: null // Only top-level comments
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName', 'avatar'],
          required: false
        },
        {
          model: Comment,
          as: 'replies',
          where: { status: where.status },
          required: false,
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'firstName', 'lastName', 'avatar'],
              required: false
            }
          ],
          order: [['createdAt', 'ASC']]
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true
    });

    const result = {
      comments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalComments: count,
        hasNext: page < Math.ceil(count / limit),
        hasPrev: page > 1
      }
    };

    // Cache approved comments for 5 minutes
    if (status === 'approved') {
      await cache.set(cacheKeys.comments(postId, page), result, 300);
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments'
    });
  }
};

// Create new comment
const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentId, guestName, guestEmail } = req.body;

    // Verify post exists and allows comments
    const post = await Post.findOne({
      where: { 
        id: postId,
        allowComments: true,
        status: 'published'
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or comments are disabled'
      });
    }

    // Verify parent comment exists if provided
    if (parentId) {
      const parentComment = await Comment.findOne({
        where: { 
          id: parentId, 
          postId,
          status: 'approved'
        }
      });

      if (!parentComment) {
        return res.status(400).json({
          success: false,
          message: 'Parent comment not found'
        });
      }
    }

    // Build comment data
    const commentData = {
      content,
      postId,
      parentId: parentId || null,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      status: 'pending' // Default to pending for moderation
    };

    if (req.user) {
      commentData.authorId = req.user.id;
      // Auto-approve comments from verified users with good standing
      if (req.user.emailVerified && req.user.role !== 'user') {
        commentData.status = 'approved';
      }
    } else {
      // Guest comment
      commentData.guestName = guestName;
      commentData.guestEmail = guestEmail;
    }

    const comment = await Comment.create(commentData);

    // Load associations
    await comment.reload({
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName', 'avatar'],
          required: false
        }
      ]
    });

    // Send notification to post author (if comment is approved)
    if (comment.status === 'approved' && req.user && req.user.id !== post.authorId) {
      try {
        await sendCommentNotification(post.author, req.user, post, comment);
      } catch (emailError) {
        logger.error('Failed to send comment notification:', emailError);
      }
    }

    // Clear comment cache
    await cache.delPattern(`comments:${postId}:*`);
    
    // Clear post cache to update comment count
    await cache.del(cacheKeys.post(post.slug));

    res.status(201).json({
      success: true,
      message: comment.status === 'approved' 
        ? 'Comment posted successfully' 
        : 'Comment submitted for moderation',
      data: { comment }
    });
  } catch (error) {
    logger.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create comment'
    });
  }
};

// Update comment
const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await Comment.findByPk(id, {
      include: [
        {
          model: Post,
          as: 'post',
          attributes: ['slug']
        }
      ]
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check permissions
    if (!req.user || 
        (req.user.role === 'user' && comment.authorId !== req.user.id) ||
        (req.user.role === 'author' && comment.authorId !== req.user.id && comment.post.authorId !== req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own comments'
      });
    }

    await comment.update({ content });

    // Clear caches
    await cache.delPattern(`comments:${comment.postId}:*`);
    await cache.del(cacheKeys.post(comment.post.slug));

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: { comment }
    });
  } catch (error) {
    logger.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update comment'
    });
  }
};

// Delete comment
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findByPk(id, {
      include: [
        {
          model: Post,
          as: 'post',
          attributes: ['slug', 'authorId']
        }
      ]
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check permissions
    if (!req.user || 
        (req.user.role === 'user' && comment.authorId !== req.user.id) ||
        (req.user.role === 'author' && comment.authorId !== req.user.id && comment.post.authorId !== req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments'
      });
    }

    await comment.destroy();

    // Clear caches
    await cache.delPattern(`comments:${comment.postId}:*`);
    await cache.del(cacheKeys.post(comment.post.slug));

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    logger.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment'
    });
  }
};

// Moderate comment (approve/reject/spam)
const moderateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // approve, reject, spam

    if (!['approve', 'reject', 'spam'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be approve, reject, or spam'
      });
    }

    const comment = await Comment.findByPk(id, {
      include: [
        {
          model: Post,
          as: 'post',
          attributes: ['slug', 'authorId'],
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'firstName', 'lastName', 'email']
            }
          ]
        },
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check permissions (post authors can moderate their post comments, admins can moderate all)
    if (req.user.role !== 'admin' && 
        (req.user.role !== 'author' || comment.post.authorId !== req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    // Update comment status
    const statusMap = {
      approve: 'approved',
      reject: 'rejected',
      spam: 'spam'
    };

    await comment.update({ status: statusMap[action] });

    // Send notification to post author if comment was approved
    if (action === 'approve' && comment.author && comment.author.id !== comment.post.authorId) {
      try {
        await sendCommentNotification(comment.post.author, comment.author, comment.post, comment);
      } catch (emailError) {
        logger.error('Failed to send comment notification:', emailError);
      }
    }

    // Clear caches
    await cache.delPattern(`comments:${comment.postId}:*`);
    await cache.del(cacheKeys.post(comment.post.slug));

    res.json({
      success: true,
      message: `Comment ${action}d successfully`,
      data: { comment }
    });
  } catch (error) {
    logger.error('Moderate comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to moderate comment'
    });
  }
};

// Like/unlike comment
const toggleCommentLike = async (req, res) => {
  try {
    const { id } = req.params;
    const { type = 'like' } = req.body; // like or dislike

    if (!['like', 'dislike'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be like or dislike'
      });
    }

    const comment = await Comment.findByPk(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user already liked/disliked the comment
    const existingLike = await Like.findOne({
      where: {
        userId: req.user.id,
        commentId: id
      }
    });

    if (existingLike) {
      if (existingLike.type === type) {
        // Remove like/dislike
        await existingLike.destroy();
        
        res.json({
          success: true,
          message: `Comment ${type} removed`,
          data: { [type]: false }
        });
      } else {
        // Change like to dislike or vice versa
        await existingLike.update({ type });
        
        res.json({
          success: true,
          message: `Comment ${type}d`,
          data: { [type]: true, [type === 'like' ? 'dislike' : 'like']: false }
        });
      }
    } else {
      // Create new like/dislike
      await Like.create({
        userId: req.user.id,
        commentId: id,
        type
      });

      res.json({
        success: true,
        message: `Comment ${type}d`,
        data: { [type]: true }
      });
    }

    // Clear comment cache
    await cache.delPattern(`comments:${comment.postId}:*`);
  } catch (error) {
    logger.error('Toggle comment like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like'
    });
  }
};

// Get pending comments (for moderation)
const getPendingComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Build where clause based on user role
    const where = { status: 'pending' };
    
    if (req.user.role === 'author') {
      // Authors can only see pending comments on their posts
      where['$post.authorId$'] = req.user.id;
    }

    const { count, rows: comments } = await Comment.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName', 'avatar'],
          required: false
        },
        {
          model: Post,
          as: 'post',
          attributes: ['id', 'title', 'slug', 'authorId']
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
    logger.error('Get pending comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending comments'
    });
  }
};

module.exports = {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  moderateComment,
  toggleCommentLike,
  getPendingComments
};
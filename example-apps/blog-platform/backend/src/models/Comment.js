module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 2000]
      }
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    guestName: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 50]
      }
    },
    guestEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'spam'),
      defaultValue: 'pending',
      allowNull: false
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    likesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    dislikesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    editedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    hooks: {
      beforeUpdate: (comment) => {
        if (comment.changed('content')) {
          comment.isEdited = true;
          comment.editedAt = new Date();
        }
      },
      afterCreate: async (comment) => {
        // Increment post comment count
        const Post = sequelize.models.Post;
        await Post.increment('commentsCount', {
          where: { id: comment.postId }
        });
      },
      afterDestroy: async (comment) => {
        // Decrement post comment count
        const Post = sequelize.models.Post;
        await Post.decrement('commentsCount', {
          where: { id: comment.postId }
        });
      }
    },
    scopes: {
      approved: {
        where: {
          status: 'approved'
        }
      },
      pending: {
        where: {
          status: 'pending'
        }
      },
      topLevel: {
        where: {
          parentId: null
        }
      }
    }
  });

  Comment.prototype.approve = function() {
    this.status = 'approved';
    return this.save();
  };

  Comment.prototype.reject = function() {
    this.status = 'rejected';
    return this.save();
  };

  Comment.prototype.markAsSpam = function() {
    this.status = 'spam';
    return this.save();
  };

  Comment.prototype.getAuthorName = function() {
    if (this.author) {
      return this.author.getFullName();
    }
    return this.guestName || 'Anonymous';
  };

  return Comment;
};
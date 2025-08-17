module.exports = (sequelize, DataTypes) => {
  const Like = sequelize.define('Like', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    commentId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('like', 'dislike'),
      allowNull: false
    }
  }, {
    hooks: {
      afterCreate: async (like) => {
        if (like.postId) {
          const Post = sequelize.models.Post;
          if (like.type === 'like') {
            await Post.increment('likesCount', { where: { id: like.postId } });
          }
        } else if (like.commentId) {
          const Comment = sequelize.models.Comment;
          if (like.type === 'like') {
            await Comment.increment('likesCount', { where: { id: like.commentId } });
          } else {
            await Comment.increment('dislikesCount', { where: { id: like.commentId } });
          }
        }
      },
      afterDestroy: async (like) => {
        if (like.postId) {
          const Post = sequelize.models.Post;
          if (like.type === 'like') {
            await Post.decrement('likesCount', { where: { id: like.postId } });
          }
        } else if (like.commentId) {
          const Comment = sequelize.models.Comment;
          if (like.type === 'like') {
            await Comment.decrement('likesCount', { where: { id: like.commentId } });
          } else {
            await Comment.decrement('dislikesCount', { where: { id: like.commentId } });
          }
        }
      }
    },
    validate: {
      eitherPostOrComment() {
        if ((this.postId && this.commentId) || (!this.postId && !this.commentId)) {
          throw new Error('Like must be associated with either a post or a comment, but not both');
        }
      }
    }
  });

  return Like;
};
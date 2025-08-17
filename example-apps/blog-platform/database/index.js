const { Sequelize } = require('sequelize');
const config = require('./config');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

// Import models
const User = require('../backend/src/models/User')(sequelize, Sequelize.DataTypes);
const Category = require('../backend/src/models/Category')(sequelize, Sequelize.DataTypes);
const Post = require('../backend/src/models/Post')(sequelize, Sequelize.DataTypes);
const Comment = require('../backend/src/models/Comment')(sequelize, Sequelize.DataTypes);
const Like = require('../backend/src/models/Like')(sequelize, Sequelize.DataTypes);
const Session = require('../backend/src/models/Session')(sequelize, Sequelize.DataTypes);

// Define associations
const db = {
  sequelize,
  Sequelize,
  User,
  Category,
  Post,
  Comment,
  Like,
  Session
};

// User associations
User.hasMany(Post, { foreignKey: 'authorId', as: 'posts' });
User.hasMany(Comment, { foreignKey: 'authorId', as: 'comments' });
User.hasMany(Like, { foreignKey: 'userId', as: 'likes' });
User.hasMany(Session, { foreignKey: 'userId', as: 'sessions' });

// Category associations
Category.hasMany(Post, { foreignKey: 'categoryId', as: 'posts' });

// Post associations
Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
Post.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Post.hasMany(Like, { foreignKey: 'postId', as: 'likes' });

// Comment associations
Comment.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });
Comment.belongsTo(Comment, { foreignKey: 'parentId', as: 'parent' });
Comment.hasMany(Comment, { foreignKey: 'parentId', as: 'replies' });
Comment.hasMany(Like, { foreignKey: 'commentId', as: 'likes' });

// Like associations
Like.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Like.belongsTo(Post, { foreignKey: 'postId', as: 'post' });
Like.belongsTo(Comment, { foreignKey: 'commentId', as: 'comment' });

// Session associations
Session.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = db;
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Likes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      postId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Posts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      commentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Comments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.ENUM('like', 'dislike'),
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add unique constraint to prevent duplicate likes
    await queryInterface.addConstraint('Likes', {
      fields: ['userId', 'postId'],
      type: 'unique',
      name: 'unique_user_post_like',
      where: {
        postId: {
          [Sequelize.Op.ne]: null
        }
      }
    });

    await queryInterface.addConstraint('Likes', {
      fields: ['userId', 'commentId'],
      type: 'unique',
      name: 'unique_user_comment_like',
      where: {
        commentId: {
          [Sequelize.Op.ne]: null
        }
      }
    });

    // Add indexes
    await queryInterface.addIndex('Likes', ['userId']);
    await queryInterface.addIndex('Likes', ['postId']);
    await queryInterface.addIndex('Likes', ['commentId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Likes');
  }
};
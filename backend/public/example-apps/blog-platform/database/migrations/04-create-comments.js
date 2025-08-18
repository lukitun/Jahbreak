'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Comments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      postId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Posts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      authorId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      parentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Comments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      guestName: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Name for guest comments'
      },
      guestEmail: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Email for guest comments'
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'spam'),
        defaultValue: 'pending',
        allowNull: false
      },
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: true
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      likesCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      dislikesCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      isEdited: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      editedAt: {
        type: Sequelize.DATE,
        allowNull: true
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

    // Add indexes for better performance
    await queryInterface.addIndex('Comments', ['postId']);
    await queryInterface.addIndex('Comments', ['authorId']);
    await queryInterface.addIndex('Comments', ['parentId']);
    await queryInterface.addIndex('Comments', ['status']);
    await queryInterface.addIndex('Comments', ['createdAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Comments');
  }
};
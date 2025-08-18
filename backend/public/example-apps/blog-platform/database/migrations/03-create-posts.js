'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Posts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      excerpt: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      featuredImage: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'scheduled', 'archived'),
        defaultValue: 'draft',
        allowNull: false
      },
      publishedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      scheduledAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      authorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: []
      },
      viewCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      likesCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      commentsCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      readTime: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Estimated reading time in minutes'
      },
      seoTitle: {
        type: Sequelize.STRING,
        allowNull: true
      },
      seoDescription: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      seoKeywords: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: []
      },
      allowComments: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      isFeatured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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

    // Add indexes for better performance
    await queryInterface.addIndex('Posts', ['slug']);
    await queryInterface.addIndex('Posts', ['status']);
    await queryInterface.addIndex('Posts', ['publishedAt']);
    await queryInterface.addIndex('Posts', ['authorId']);
    await queryInterface.addIndex('Posts', ['categoryId']);
    await queryInterface.addIndex('Posts', ['isFeatured']);
    await queryInterface.addIndex('Posts', ['tags'], {
      using: 'gin'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Posts');
  }
};
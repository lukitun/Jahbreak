'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('task_list_members', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      taskListId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'task_lists',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      role: {
        type: Sequelize.ENUM('admin', 'member', 'viewer'),
        defaultValue: 'member',
      },
      joinedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('task_list_members', ['userId']);
    await queryInterface.addIndex('task_list_members', ['taskListId']);
    await queryInterface.addConstraint('task_list_members', {
      fields: ['userId', 'taskListId'],
      type: 'unique',
      name: 'unique_user_task_list'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('task_list_members');
  }
};
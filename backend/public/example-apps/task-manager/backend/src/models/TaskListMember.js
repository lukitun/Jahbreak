module.exports = (sequelize, DataTypes) => {
  const TaskListMember = sequelize.define('TaskListMember', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    taskListId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'task_lists',
        key: 'id',
      },
    },
    role: {
      type: DataTypes.ENUM('admin', 'member', 'viewer'),
      defaultValue: 'member',
    },
    joinedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'task_list_members',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'taskListId'],
      },
    ],
  });

  TaskListMember.associate = (models) => {
    TaskListMember.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    TaskListMember.belongsTo(models.TaskList, {
      foreignKey: 'taskListId',
      as: 'taskList',
    });
  };

  return TaskListMember;
};
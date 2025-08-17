module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('todo', 'in_progress', 'done'),
      defaultValue: 'todo',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium',
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    position: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    assignedTo: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    createdBy: {
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
    parentTaskId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tasks',
        key: 'id',
      },
    },
  }, {
    tableName: 'tasks',
    timestamps: true,
    hooks: {
      beforeUpdate: (task) => {
        if (task.changed('status') && task.status === 'done') {
          task.completedAt = new Date();
        } else if (task.changed('status') && task.status !== 'done') {
          task.completedAt = null;
        }
      },
    },
  });

  Task.associate = (models) => {
    Task.belongsTo(models.User, {
      foreignKey: 'assignedTo',
      as: 'assignee',
    });
    Task.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator',
    });
    Task.belongsTo(models.TaskList, {
      foreignKey: 'taskListId',
      as: 'taskList',
    });
    Task.belongsTo(models.Task, {
      foreignKey: 'parentTaskId',
      as: 'parentTask',
    });
    Task.hasMany(models.Task, {
      foreignKey: 'parentTaskId',
      as: 'subtasks',
    });
  };

  return Task;
};
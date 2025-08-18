module.exports = (sequelize, DataTypes) => {
  const TaskList = sequelize.define('TaskList', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
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
    color: {
      type: DataTypes.STRING,
      defaultValue: '#1976d2',
      validate: {
        is: /^#[0-9A-Fa-f]{6}$/,
      },
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  }, {
    tableName: 'task_lists',
    timestamps: true,
  });

  TaskList.associate = (models) => {
    TaskList.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator',
    });
    TaskList.hasMany(models.Task, {
      foreignKey: 'taskListId',
      as: 'tasks',
    });
    TaskList.belongsToMany(models.User, {
      through: 'TaskListMembers',
      foreignKey: 'taskListId',
      as: 'members',
    });
  };

  return TaskList;
};
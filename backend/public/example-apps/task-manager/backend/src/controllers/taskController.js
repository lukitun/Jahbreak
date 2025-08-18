const { Task, User, TaskList } = require('../models');
const { Op } = require('sequelize');

const getTasks = async (req, res) => {
  try {
    const { status, priority, assignedTo, taskListId, includeSubtasks = true } = req.query;
    
    const whereClause = {};
    
    // Filter by task list access
    if (taskListId) {
      whereClause.taskListId = taskListId;
    }
    
    // Apply filters
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (assignedTo) whereClause.assignedTo = assignedTo;
    
    // Only show parent tasks unless explicitly including subtasks
    if (includeSubtasks !== 'true') {
      whereClause.parentTaskId = null;
    }

    const tasks = await Task.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: TaskList,
          as: 'taskList',
          attributes: ['id', 'name', 'color'],
        },
        {
          model: Task,
          as: 'subtasks',
          include: [
            {
              model: User,
              as: 'assignee',
              attributes: ['id', 'firstName', 'lastName', 'email'],
            },
          ],
        },
      ],
      order: [['position', 'ASC'], ['createdAt', 'DESC']],
    });

    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

const getTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id, {
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: TaskList,
          as: 'taskList',
          attributes: ['id', 'name', 'color'],
        },
        {
          model: Task,
          as: 'parentTask',
          attributes: ['id', 'title'],
        },
        {
          model: Task,
          as: 'subtasks',
          include: [
            {
              model: User,
              as: 'assignee',
              attributes: ['id', 'firstName', 'lastName', 'email'],
            },
          ],
        },
      ],
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status = 'todo',
      priority = 'medium',
      dueDate,
      assignedTo,
      taskListId,
      parentTaskId,
      tags = [],
    } = req.body;

    // Verify task list exists and user has access
    const taskList = await TaskList.findByPk(taskListId);
    if (!taskList) {
      return res.status(404).json({ error: 'Task list not found' });
    }

    // Get position for new task
    const lastTask = await Task.findOne({
      where: { taskListId, parentTaskId: parentTaskId || null },
      order: [['position', 'DESC']],
    });
    const position = lastTask ? lastTask.position + 1 : 0;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      taskListId,
      parentTaskId,
      tags,
      position,
      createdBy: req.user.id,
    });

    // Fetch the created task with associations
    const createdTask = await Task.findByPk(task.id, {
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: TaskList,
          as: 'taskList',
          attributes: ['id', 'name', 'color'],
        },
      ],
    });

    // Emit socket event for real-time updates
    req.io.to(`taskList:${taskListId}`).emit('task:created', createdTask);

    res.status(201).json({
      message: 'Task created successfully',
      task: createdTask,
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check permissions - user must be creator, assignee, or admin
    const canEdit = task.createdBy === req.user.id || 
                   task.assignedTo === req.user.id || 
                   req.user.role === 'admin';

    if (!canEdit) {
      return res.status(403).json({ error: 'Insufficient permissions to edit this task' });
    }

    await task.update(updates);

    // Fetch updated task with associations
    const updatedTask = await Task.findByPk(id, {
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: TaskList,
          as: 'taskList',
          attributes: ['id', 'name', 'color'],
        },
      ],
    });

    // Emit socket event for real-time updates
    req.io.to(`taskList:${task.taskListId}`).emit('task:updated', updatedTask);

    res.json({
      message: 'Task updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check permissions - user must be creator or admin
    const canDelete = task.createdBy === req.user.id || req.user.role === 'admin';
    if (!canDelete) {
      return res.status(403).json({ error: 'Insufficient permissions to delete this task' });
    }

    const taskListId = task.taskListId;
    await task.destroy();

    // Emit socket event for real-time updates
    req.io.to(`taskList:${taskListId}`).emit('task:deleted', { id });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

const reorderTasks = async (req, res) => {
  try {
    const { tasks } = req.body; // Array of { id, position }

    if (!Array.isArray(tasks)) {
      return res.status(400).json({ error: 'Tasks must be an array' });
    }

    // Update positions
    const updatePromises = tasks.map(({ id, position }) =>
      Task.update({ position }, { where: { id } })
    );

    await Promise.all(updatePromises);

    // Get first task to determine task list for socket emission
    if (tasks.length > 0) {
      const firstTask = await Task.findByPk(tasks[0].id);
      if (firstTask) {
        req.io.to(`taskList:${firstTask.taskListId}`).emit('tasks:reordered', tasks);
      }
    }

    res.json({ message: 'Tasks reordered successfully' });
  } catch (error) {
    console.error('Reorder tasks error:', error);
    res.status(500).json({ error: 'Failed to reorder tasks' });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
};
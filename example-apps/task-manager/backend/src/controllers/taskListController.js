const { TaskList, User, Task, TaskListMember } = require('../models');
const { Op } = require('sequelize');

const getTaskLists = async (req, res) => {
  try {
    const taskLists = await TaskList.findAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          through: {
            attributes: ['role', 'joinedAt'],
          },
        },
        {
          model: Task,
          as: 'tasks',
          attributes: ['id', 'status'],
        },
      ],
      order: [['isDefault', 'DESC'], ['createdAt', 'ASC']],
    });

    // Filter task lists where user is a member or creator
    const userTaskLists = taskLists.filter(taskList => 
      taskList.createdBy === req.user.id || 
      taskList.members.some(member => member.id === req.user.id)
    );

    res.json({ taskLists: userTaskLists });
  } catch (error) {
    console.error('Get task lists error:', error);
    res.status(500).json({ error: 'Failed to fetch task lists' });
  }
};

const getTaskList = async (req, res) => {
  try {
    const { id } = req.params;

    const taskList = await TaskList.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          through: {
            attributes: ['role', 'joinedAt'],
          },
        },
        {
          model: Task,
          as: 'tasks',
          where: { parentTaskId: null },
          required: false,
          include: [
            {
              model: User,
              as: 'assignee',
              attributes: ['id', 'firstName', 'lastName', 'email'],
            },
            {
              model: Task,
              as: 'subtasks',
            },
          ],
          order: [['position', 'ASC']],
        },
      ],
    });

    if (!taskList) {
      return res.status(404).json({ error: 'Task list not found' });
    }

    // Check if user has access
    const hasAccess = taskList.createdBy === req.user.id || 
                     taskList.members.some(member => member.id === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to this task list' });
    }

    res.json({ taskList });
  } catch (error) {
    console.error('Get task list error:', error);
    res.status(500).json({ error: 'Failed to fetch task list' });
  }
};

const createTaskList = async (req, res) => {
  try {
    const { name, description, color = '#1976d2' } = req.body;

    const taskList = await TaskList.create({
      name,
      description,
      color,
      createdBy: req.user.id,
    });

    // Add creator as admin member
    await TaskListMember.create({
      userId: req.user.id,
      taskListId: taskList.id,
      role: 'admin',
    });

    // Fetch the created task list with associations
    const createdTaskList = await TaskList.findByPk(taskList.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          through: {
            attributes: ['role', 'joinedAt'],
          },
        },
      ],
    });

    res.status(201).json({
      message: 'Task list created successfully',
      taskList: createdTaskList,
    });
  } catch (error) {
    console.error('Create task list error:', error);
    res.status(500).json({ error: 'Failed to create task list' });
  }
};

const updateTaskList = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const taskList = await TaskList.findByPk(id);
    if (!taskList) {
      return res.status(404).json({ error: 'Task list not found' });
    }

    // Check if user is creator or admin member
    const member = await TaskListMember.findOne({
      where: { userId: req.user.id, taskListId: id },
    });

    const canEdit = taskList.createdBy === req.user.id || 
                   (member && member.role === 'admin');

    if (!canEdit) {
      return res.status(403).json({ error: 'Insufficient permissions to edit this task list' });
    }

    await taskList.update(updates);

    // Fetch updated task list with associations
    const updatedTaskList = await TaskList.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          through: {
            attributes: ['role', 'joinedAt'],
          },
        },
      ],
    });

    // Emit socket event for real-time updates
    req.io.to(`taskList:${id}`).emit('taskList:updated', updatedTaskList);

    res.json({
      message: 'Task list updated successfully',
      taskList: updatedTaskList,
    });
  } catch (error) {
    console.error('Update task list error:', error);
    res.status(500).json({ error: 'Failed to update task list' });
  }
};

const deleteTaskList = async (req, res) => {
  try {
    const { id } = req.params;

    const taskList = await TaskList.findByPk(id);
    if (!taskList) {
      return res.status(404).json({ error: 'Task list not found' });
    }

    // Only creator can delete task list
    if (taskList.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Only the creator can delete this task list' });
    }

    await taskList.destroy();

    // Emit socket event for real-time updates
    req.io.to(`taskList:${id}`).emit('taskList:deleted', { id });

    res.json({ message: 'Task list deleted successfully' });
  } catch (error) {
    console.error('Delete task list error:', error);
    res.status(500).json({ error: 'Failed to delete task list' });
  }
};

const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role = 'member' } = req.body;

    const taskList = await TaskList.findByPk(id);
    if (!taskList) {
      return res.status(404).json({ error: 'Task list not found' });
    }

    // Check if user can add members (creator or admin)
    const userMember = await TaskListMember.findOne({
      where: { userId: req.user.id, taskListId: id },
    });

    const canAddMembers = taskList.createdBy === req.user.id || 
                         (userMember && userMember.role === 'admin');

    if (!canAddMembers) {
      return res.status(403).json({ error: 'Insufficient permissions to add members' });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found with this email' });
    }

    // Check if user is already a member
    const existingMember = await TaskListMember.findOne({
      where: { userId: user.id, taskListId: id },
    });

    if (existingMember) {
      return res.status(409).json({ error: 'User is already a member of this task list' });
    }

    // Add member
    await TaskListMember.create({
      userId: user.id,
      taskListId: id,
      role,
    });

    // Fetch updated task list
    const updatedTaskList = await TaskList.findByPk(id, {
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          through: {
            attributes: ['role', 'joinedAt'],
          },
        },
      ],
    });

    // Emit socket event for real-time updates
    req.io.to(`taskList:${id}`).emit('member:added', {
      taskListId: id,
      member: user,
      role,
    });

    res.json({
      message: 'Member added successfully',
      taskList: updatedTaskList,
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
};

const removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;

    const taskList = await TaskList.findByPk(id);
    if (!taskList) {
      return res.status(404).json({ error: 'Task list not found' });
    }

    // Check if user can remove members (creator or admin)
    const userMember = await TaskListMember.findOne({
      where: { userId: req.user.id, taskListId: id },
    });

    const canRemoveMembers = taskList.createdBy === req.user.id || 
                            (userMember && userMember.role === 'admin');

    if (!canRemoveMembers) {
      return res.status(403).json({ error: 'Insufficient permissions to remove members' });
    }

    // Cannot remove creator
    if (taskList.createdBy === memberId) {
      return res.status(400).json({ error: 'Cannot remove the creator from the task list' });
    }

    const member = await TaskListMember.findOne({
      where: { userId: memberId, taskListId: id },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found in this task list' });
    }

    await member.destroy();

    // Emit socket event for real-time updates
    req.io.to(`taskList:${id}`).emit('member:removed', {
      taskListId: id,
      memberId,
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
};

const updateMemberRole = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const { role } = req.body;

    const taskList = await TaskList.findByPk(id);
    if (!taskList) {
      return res.status(404).json({ error: 'Task list not found' });
    }

    // Check if user can update member roles (creator or admin)
    const userMember = await TaskListMember.findOne({
      where: { userId: req.user.id, taskListId: id },
    });

    const canUpdateRoles = taskList.createdBy === req.user.id || 
                          (userMember && userMember.role === 'admin');

    if (!canUpdateRoles) {
      return res.status(403).json({ error: 'Insufficient permissions to update member roles' });
    }

    // Cannot change creator's role
    if (taskList.createdBy === memberId) {
      return res.status(400).json({ error: 'Cannot change the creator\'s role' });
    }

    const member = await TaskListMember.findOne({
      where: { userId: memberId, taskListId: id },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found in this task list' });
    }

    await member.update({ role });

    // Emit socket event for real-time updates
    req.io.to(`taskList:${id}`).emit('member:roleUpdated', {
      taskListId: id,
      memberId,
      role,
    });

    res.json({ message: 'Member role updated successfully' });
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({ error: 'Failed to update member role' });
  }
};

module.exports = {
  getTaskLists,
  getTaskList,
  createTaskList,
  updateTaskList,
  deleteTaskList,
  addMember,
  removeMember,
  updateMemberRole,
};
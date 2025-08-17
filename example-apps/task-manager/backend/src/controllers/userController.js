const { User, Task, TaskList } = require('../models');
const { Op } = require('sequelize');

const getUsers = async (req, res) => {
  try {
    const { search, role } = req.query;
    
    const whereClause = { isActive: true };
    
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }
    
    if (role) {
      whereClause.role = role;
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [['firstName', 'ASC'], ['lastName', 'ASC']],
      limit: 50, // Limit results for performance
    });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Task,
          as: 'assignedTasks',
          attributes: ['id', 'title', 'status', 'priority', 'dueDate'],
          limit: 10,
          order: [['createdAt', 'DESC']],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Only admins can update user roles
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update user roles' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Cannot change own role
    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    await user.update({ role });

    // Fetch updated user
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
    });

    res.json({
      message: 'User role updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Only admins can deactivate users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can deactivate users' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Cannot deactivate own account
    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    await user.update({ isActive: false });

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
};

const reactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Only admins can reactivate users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can reactivate users' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ isActive: true });

    res.json({ message: 'User reactivated successfully' });
  } catch (error) {
    console.error('Reactivate user error:', error);
    res.status(500).json({ error: 'Failed to reactivate user' });
  }
};

const getUserStats = async (req, res) => {
  try {
    const { id } = req.params;

    // Users can only view their own stats, unless they're admin
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Cannot view other users\' statistics' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get task statistics
    const [totalTasks, completedTasks, overdueTasks] = await Promise.all([
      Task.count({ where: { assignedTo: id } }),
      Task.count({ where: { assignedTo: id, status: 'done' } }),
      Task.count({
        where: {
          assignedTo: id,
          status: { [Op.ne]: 'done' },
          dueDate: { [Op.lt]: new Date() },
        },
      }),
    ]);

    const stats = {
      totalTasks,
      completedTasks,
      overdueTasks,
      pendingTasks: totalTasks - completedTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
};

const getOnlineUsers = async (req, res) => {
  try {
    // Users who have been active in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const onlineUsers = await User.findAll({
      where: {
        isActive: true,
        lastSeenAt: { [Op.gte]: fiveMinutesAgo },
      },
      attributes: ['id', 'firstName', 'lastName', 'email', 'lastSeenAt'],
      order: [['lastSeenAt', 'DESC']],
    });

    res.json({ users: onlineUsers });
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({ error: 'Failed to fetch online users' });
  }
};

module.exports = {
  getUsers,
  getUser,
  updateUserRole,
  deactivateUser,
  reactivateUser,
  getUserStats,
  getOnlineUsers,
};
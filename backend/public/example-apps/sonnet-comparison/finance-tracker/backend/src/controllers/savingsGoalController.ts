import { Response } from 'express';
import mongoose from 'mongoose';
import SavingsGoal, { ISavingsGoal } from '../models/SavingsGoal';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { createError } from '../middleware/errorHandler';
import currencyConverter from '../utils/currencyConverter';

export const createSavingsGoal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const {
      name,
      targetAmount,
      currentAmount,
      targetDate,
      category,
      description,
      currency
    } = req.body;

    const savingsGoal = new SavingsGoal({
      userId,
      name,
      targetAmount,
      currentAmount: currentAmount || 0,
      targetDate: new Date(targetDate),
      category,
      description,
      currency: currency || req.user!.preferredCurrency
    });

    await savingsGoal.save();

    res.status(201).json({
      success: true,
      message: 'Savings goal created successfully',
      savingsGoal
    });
  } catch (error) {
    throw error;
  }
};

export const getSavingsGoals = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const {
      page = 1,
      limit = 10,
      category,
      isCompleted,
      sortBy = 'targetDate',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    const query: any = { userId };

    if (category) {
      query.category = category;
    }

    if (isCompleted !== undefined) {
      query.isCompleted = isCompleted === 'true';
    }

    // Sort configuration
    const sortConfig: any = {};
    sortConfig[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [savingsGoals, total] = await Promise.all([
      SavingsGoal.find(query)
        .sort(sortConfig)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      SavingsGoal.countDocuments(query)
    ]);

    // Convert amounts to user's preferred currency if needed
    const userCurrency = req.user!.preferredCurrency;
    const convertedGoals = await Promise.all(
      savingsGoals.map(async (goal) => {
        if (goal.currency !== userCurrency) {
          try {
            const [convertedTarget, convertedCurrent] = await Promise.all([
              currencyConverter.convertAmount(goal.targetAmount, goal.currency, userCurrency),
              currencyConverter.convertAmount(goal.currentAmount, goal.currency, userCurrency)
            ]);
            
            return {
              ...goal,
              originalTargetAmount: goal.targetAmount,
              originalCurrentAmount: goal.currentAmount,
              originalCurrency: goal.currency,
              targetAmount: convertedTarget,
              currentAmount: convertedCurrent,
              currency: userCurrency,
              progressPercentage: convertedTarget > 0 ? Math.round((convertedCurrent / convertedTarget) * 100) : 0,
              remainingAmount: Math.max(0, convertedTarget - convertedCurrent)
            };
          } catch (error) {
            console.error('Currency conversion failed:', error);
            return {
              ...goal,
              progressPercentage: goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0,
              remainingAmount: Math.max(0, goal.targetAmount - goal.currentAmount)
            };
          }
        }
        return {
          ...goal,
          progressPercentage: goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0,
          remainingAmount: Math.max(0, goal.targetAmount - goal.currentAmount)
        };
      })
    );

    res.json({
      success: true,
      savingsGoals: convertedGoals,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum
      }
    });
  } catch (error) {
    throw error;
  }
};

export const getSavingsGoalById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError('Invalid savings goal ID', 400);
    }

    const savingsGoal = await SavingsGoal.findOne({ _id: id, userId });
    if (!savingsGoal) {
      throw createError('Savings goal not found', 404);
    }

    res.json({
      success: true,
      savingsGoal
    });
  } catch (error) {
    throw error;
  }
};

export const updateSavingsGoal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError('Invalid savings goal ID', 400);
    }

    const savingsGoal = await SavingsGoal.findOne({ _id: id, userId });
    if (!savingsGoal) {
      throw createError('Savings goal not found', 404);
    }

    // Update savings goal
    Object.assign(savingsGoal, updateData);
    if (updateData.targetDate) {
      savingsGoal.targetDate = new Date(updateData.targetDate);
    }

    await savingsGoal.save();

    res.json({
      success: true,
      message: 'Savings goal updated successfully',
      savingsGoal
    });
  } catch (error) {
    throw error;
  }
};

export const deleteSavingsGoal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError('Invalid savings goal ID', 400);
    }

    const savingsGoal = await SavingsGoal.findOne({ _id: id, userId });
    if (!savingsGoal) {
      throw createError('Savings goal not found', 404);
    }

    await SavingsGoal.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Savings goal deleted successfully'
    });
  } catch (error) {
    throw error;
  }
};

export const addToSavingsGoal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, note } = req.body;
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError('Invalid savings goal ID', 400);
    }

    if (!amount || amount <= 0) {
      throw createError('Amount must be a positive number', 400);
    }

    const savingsGoal = await SavingsGoal.findOne({ _id: id, userId });
    if (!savingsGoal) {
      throw createError('Savings goal not found', 404);
    }

    // Add to current amount
    savingsGoal.currentAmount += amount;
    await savingsGoal.save();

    // You could also create a transaction log here for tracking contributions

    res.json({
      success: true,
      message: 'Amount added to savings goal successfully',
      savingsGoal: {
        ...savingsGoal.toJSON(),
        progressPercentage: savingsGoal.targetAmount > 0 ? Math.round((savingsGoal.currentAmount / savingsGoal.targetAmount) * 100) : 0,
        remainingAmount: Math.max(0, savingsGoal.targetAmount - savingsGoal.currentAmount)
      }
    });
  } catch (error) {
    throw error;
  }
};

export const withdrawFromSavingsGoal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, note } = req.body;
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError('Invalid savings goal ID', 400);
    }

    if (!amount || amount <= 0) {
      throw createError('Amount must be a positive number', 400);
    }

    const savingsGoal = await SavingsGoal.findOne({ _id: id, userId });
    if (!savingsGoal) {
      throw createError('Savings goal not found', 404);
    }

    if (amount > savingsGoal.currentAmount) {
      throw createError('Cannot withdraw more than current amount', 400);
    }

    // Subtract from current amount
    savingsGoal.currentAmount -= amount;
    
    // If goal was completed and amount goes below target, mark as incomplete
    if (savingsGoal.isCompleted && savingsGoal.currentAmount < savingsGoal.targetAmount) {
      savingsGoal.isCompleted = false;
      savingsGoal.completedAt = undefined;
    }

    await savingsGoal.save();

    res.json({
      success: true,
      message: 'Amount withdrawn from savings goal successfully',
      savingsGoal: {
        ...savingsGoal.toJSON(),
        progressPercentage: savingsGoal.targetAmount > 0 ? Math.round((savingsGoal.currentAmount / savingsGoal.targetAmount) * 100) : 0,
        remainingAmount: Math.max(0, savingsGoal.targetAmount - savingsGoal.currentAmount)
      }
    });
  } catch (error) {
    throw error;
  }
};

export const getSavingsGoalsSummary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!._id;

    const goals = await SavingsGoal.find({ userId }).lean();

    const summary = {
      totalGoals: goals.length,
      completedGoals: goals.filter(g => g.isCompleted).length,
      activeGoals: goals.filter(g => !g.isCompleted).length,
      totalTargetAmount: 0,
      totalCurrentAmount: 0,
      totalProgress: 0,
      overallProgressPercentage: 0
    };

    let totalProgressSum = 0;

    for (const goal of goals) {
      summary.totalTargetAmount += goal.targetAmount;
      summary.totalCurrentAmount += goal.currentAmount;
      
      const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
      totalProgressSum += progress;
    }

    if (goals.length > 0) {
      summary.overallProgressPercentage = Math.round(totalProgressSum / goals.length);
    }

    if (summary.totalTargetAmount > 0) {
      summary.totalProgress = Math.round((summary.totalCurrentAmount / summary.totalTargetAmount) * 100);
    }

    res.json({
      success: true,
      summary,
      goals: goals.map(goal => ({
        ...goal,
        progressPercentage: goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0,
        remainingAmount: Math.max(0, goal.targetAmount - goal.currentAmount),
        daysRemaining: Math.max(0, Math.ceil((goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      }))
    });
  } catch (error) {
    throw error;
  }
};
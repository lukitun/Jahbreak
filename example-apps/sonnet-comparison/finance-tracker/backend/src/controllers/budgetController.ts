import { Response } from 'express';
import mongoose from 'mongoose';
import Budget, { IBudget } from '../models/Budget';
import Expense from '../models/Expense';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { createError } from '../middleware/errorHandler';
import currencyConverter from '../utils/currencyConverter';

export const createBudget = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const {
      name,
      amount,
      category,
      period,
      startDate,
      endDate,
      currency,
      alertAt80Percent,
      alertAt100Percent
    } = req.body;

    // Check for overlapping budgets with same category
    if (category) {
      const existingBudget = await Budget.findOne({
        userId,
        category,
        isActive: true,
        $or: [
          {
            startDate: { $lte: new Date(startDate) },
            endDate: { $gte: new Date(startDate) }
          },
          {
            startDate: { $lte: new Date(endDate) },
            endDate: { $gte: new Date(endDate) }
          },
          {
            startDate: { $gte: new Date(startDate) },
            endDate: { $lte: new Date(endDate) }
          }
        ]
      });

      if (existingBudget) {
        throw createError(
          `A budget for ${category} category already exists for this period`,
          400
        );
      }
    }

    const budget = new Budget({
      userId,
      name,
      amount,
      category,
      period,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      currency: currency || req.user!.preferredCurrency,
      alertAt80Percent: alertAt80Percent !== undefined ? alertAt80Percent : true,
      alertAt100Percent: alertAt100Percent !== undefined ? alertAt100Percent : true
    });

    await budget.save();

    // Calculate current spending for this budget
    await calculateBudgetSpending(budget);

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      budget
    });
  } catch (error) {
    throw error;
  }
};

export const getBudgets = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const {
      page = 1,
      limit = 10,
      category,
      period,
      isActive,
      includeExpired = 'false'
    } = req.query;

    // Build query
    const query: any = { userId };

    if (category) {
      query.category = category;
    }

    if (period) {
      query.period = period;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (includeExpired === 'false') {
      query.endDate = { $gte: new Date() };
    }

    // Execute query with pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [budgets, total] = await Promise.all([
      Budget.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Budget.countDocuments(query)
    ]);

    // Convert amounts to user's preferred currency if needed
    const userCurrency = req.user!.preferredCurrency;
    const convertedBudgets = await Promise.all(
      budgets.map(async (budget) => {
        if (budget.currency !== userCurrency) {
          try {
            const [convertedAmount, convertedSpent] = await Promise.all([
              currencyConverter.convertAmount(budget.amount, budget.currency, userCurrency),
              currencyConverter.convertAmount(budget.spent, budget.currency, userCurrency)
            ]);
            
            return {
              ...budget,
              originalAmount: budget.amount,
              originalSpent: budget.spent,
              originalCurrency: budget.currency,
              amount: convertedAmount,
              spent: convertedSpent,
              currency: userCurrency,
              progressPercentage: convertedAmount > 0 ? Math.round((convertedSpent / convertedAmount) * 100) : 0,
              remaining: Math.max(0, convertedAmount - convertedSpent)
            };
          } catch (error) {
            console.error('Currency conversion failed:', error);
            return {
              ...budget,
              progressPercentage: budget.amount > 0 ? Math.round((budget.spent / budget.amount) * 100) : 0,
              remaining: Math.max(0, budget.amount - budget.spent)
            };
          }
        }
        return {
          ...budget,
          progressPercentage: budget.amount > 0 ? Math.round((budget.spent / budget.amount) * 100) : 0,
          remaining: Math.max(0, budget.amount - budget.spent)
        };
      })
    );

    res.json({
      success: true,
      budgets: convertedBudgets,
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

export const getBudgetById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError('Invalid budget ID', 400);
    }

    const budget = await Budget.findOne({ _id: id, userId });
    if (!budget) {
      throw createError('Budget not found', 404);
    }

    res.json({
      success: true,
      budget
    });
  } catch (error) {
    throw error;
  }
};

export const updateBudget = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError('Invalid budget ID', 400);
    }

    const budget = await Budget.findOne({ _id: id, userId });
    if (!budget) {
      throw createError('Budget not found', 404);
    }

    // Check for overlapping budgets if category or dates are being changed
    if (updateData.category || updateData.startDate || updateData.endDate) {
      const category = updateData.category || budget.category;
      const startDate = updateData.startDate || budget.startDate;
      const endDate = updateData.endDate || budget.endDate;

      if (category) {
        const existingBudget = await Budget.findOne({
          _id: { $ne: id },
          userId,
          category,
          isActive: true,
          $or: [
            {
              startDate: { $lte: new Date(startDate) },
              endDate: { $gte: new Date(startDate) }
            },
            {
              startDate: { $lte: new Date(endDate) },
              endDate: { $gte: new Date(endDate) }
            },
            {
              startDate: { $gte: new Date(startDate) },
              endDate: { $lte: new Date(endDate) }
            }
          ]
        });

        if (existingBudget) {
          throw createError(
            `A budget for ${category} category already exists for this period`,
            400
          );
        }
      }
    }

    // Update budget
    Object.assign(budget, updateData);
    if (updateData.startDate) budget.startDate = new Date(updateData.startDate);
    if (updateData.endDate) budget.endDate = new Date(updateData.endDate);

    await budget.save();

    // Recalculate spending if dates or category changed
    if (updateData.startDate || updateData.endDate || updateData.category) {
      await calculateBudgetSpending(budget);
    }

    res.json({
      success: true,
      message: 'Budget updated successfully',
      budget
    });
  } catch (error) {
    throw error;
  }
};

export const deleteBudget = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError('Invalid budget ID', 400);
    }

    const budget = await Budget.findOne({ _id: id, userId });
    if (!budget) {
      throw createError('Budget not found', 404);
    }

    await Budget.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    throw error;
  }
};

export const getBudgetProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError('Invalid budget ID', 400);
    }

    const budget = await Budget.findOne({ _id: id, userId });
    if (!budget) {
      throw createError('Budget not found', 404);
    }

    // Get detailed spending breakdown
    const expenses = await Expense.find({
      userId,
      date: { $gte: budget.startDate, $lte: budget.endDate },
      ...(budget.category && { category: budget.category })
    }).sort({ date: -1 });

    // Calculate daily spending for chart data
    const dailySpending = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: budget.startDate, $lte: budget.endDate },
          ...(budget.category && { category: budget.category })
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      budget,
      expenses,
      dailySpending,
      progressPercentage: budget.amount > 0 ? Math.round((budget.spent / budget.amount) * 100) : 0,
      remaining: Math.max(0, budget.amount - budget.spent),
      daysRemaining: Math.max(0, Math.ceil((budget.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    });
  } catch (error) {
    throw error;
  }
};

export const getBudgetSummary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const { period = 'current' } = req.query;

    let dateFilter: any = {};
    const now = new Date();

    if (period === 'current') {
      dateFilter = {
        startDate: { $lte: now },
        endDate: { $gte: now }
      };
    } else if (period === 'upcoming') {
      dateFilter = {
        startDate: { $gt: now }
      };
    } else if (period === 'expired') {
      dateFilter = {
        endDate: { $lt: now }
      };
    }

    const budgets = await Budget.find({
      userId,
      isActive: true,
      ...dateFilter
    }).lean();

    // Calculate summary statistics
    const summary = {
      totalBudgets: budgets.length,
      totalAllocated: 0,
      totalSpent: 0,
      totalRemaining: 0,
      budgetsOverLimit: 0,
      budgetsNearLimit: 0, // 80%+ spent
      averageProgress: 0
    };

    let totalProgress = 0;

    for (const budget of budgets) {
      summary.totalAllocated += budget.amount;
      summary.totalSpent += budget.spent;
      summary.totalRemaining += Math.max(0, budget.amount - budget.spent);

      const progress = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
      totalProgress += progress;

      if (progress >= 100) {
        summary.budgetsOverLimit++;
      } else if (progress >= 80) {
        summary.budgetsNearLimit++;
      }
    }

    if (budgets.length > 0) {
      summary.averageProgress = Math.round(totalProgress / budgets.length);
    }

    res.json({
      success: true,
      summary,
      budgets: budgets.map(budget => ({
        ...budget,
        progressPercentage: budget.amount > 0 ? Math.round((budget.spent / budget.amount) * 100) : 0,
        remaining: Math.max(0, budget.amount - budget.spent)
      }))
    });
  } catch (error) {
    throw error;
  }
};

// Helper function to calculate budget spending
const calculateBudgetSpending = async (budget: IBudget) => {
  try {
    const query: any = {
      userId: budget.userId,
      date: { $gte: budget.startDate, $lte: budget.endDate }
    };

    if (budget.category) {
      query.category = budget.category;
    }

    const expenses = await Expense.find(query);
    
    let totalSpent = 0;
    
    for (const expense of expenses) {
      let amount = expense.amount;
      
      // Convert currency if needed
      if (expense.currency !== budget.currency) {
        try {
          amount = await currencyConverter.convertAmount(
            expense.amount,
            expense.currency,
            budget.currency
          );
        } catch (error) {
          console.error('Currency conversion failed:', error);
          continue;
        }
      }
      
      totalSpent += amount;
    }

    budget.spent = totalSpent;
    await budget.save();
  } catch (error) {
    console.error('Error calculating budget spending:', error);
  }
};
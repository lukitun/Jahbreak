import { Response } from 'express';
import mongoose from 'mongoose';
import Expense, { IExpense } from '../models/Expense';
import Budget from '../models/Budget';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { createError } from '../middleware/errorHandler';
import { deleteFromCloudinary } from '../utils/cloudinary';
import currencyConverter from '../utils/currencyConverter';
import emailService from '../utils/emailService';

export const createExpense = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const { 
      amount, 
      category, 
      description, 
      date, 
      paymentMethod, 
      currency, 
      location, 
      tags, 
      isRecurring, 
      recurringFrequency 
    } = req.body;

    // Handle receipt upload
    let receiptUrl, receiptPublicId;
    if (req.file) {
      receiptUrl = (req.file as any).path;
      receiptPublicId = (req.file as any).filename;
    }

    const expense = new Expense({
      userId,
      amount,
      category,
      description,
      date: new Date(date),
      paymentMethod,
      currency: currency || req.user!.preferredCurrency,
      location,
      tags: tags || [],
      isRecurring: isRecurring || false,
      recurringFrequency,
      receiptUrl,
      receiptPublicId
    });

    await expense.save();

    // Update related budgets
    await updateBudgetSpending(userId, expense);

    // Populate user info for response
    await expense.populate('userId', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      expense
    });
  } catch (error) {
    // Clean up uploaded file if expense creation fails
    if (req.file && (req.file as any).filename) {
      try {
        await deleteFromCloudinary((req.file as any).filename);
      } catch (deleteError) {
        console.error('Failed to delete uploaded file:', deleteError);
      }
    }
    throw error;
  }
};

export const getExpenses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const {
      page = 1,
      limit = 10,
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      paymentMethod,
      search,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query: any = { userId };

    if (category) {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }

    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount as string);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount as string);
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }

    // Sort configuration
    const sortConfig: any = {};
    sortConfig[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .sort(sortConfig)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Expense.countDocuments(query)
    ]);

    // Convert amounts to user's preferred currency if needed
    const userCurrency = req.user!.preferredCurrency;
    const convertedExpenses = await Promise.all(
      expenses.map(async (expense) => {
        if (expense.currency !== userCurrency) {
          try {
            const convertedAmount = await currencyConverter.convertAmount(
              expense.amount,
              expense.currency,
              userCurrency
            );
            return {
              ...expense,
              originalAmount: expense.amount,
              originalCurrency: expense.currency,
              amount: convertedAmount,
              currency: userCurrency
            };
          } catch (error) {
            console.error('Currency conversion failed:', error);
            return expense;
          }
        }
        return expense;
      })
    );

    res.json({
      success: true,
      expenses: convertedExpenses,
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

export const getExpenseById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError('Invalid expense ID', 400);
    }

    const expense = await Expense.findOne({ _id: id, userId });
    if (!expense) {
      throw createError('Expense not found', 404);
    }

    res.json({
      success: true,
      expense
    });
  } catch (error) {
    throw error;
  }
};

export const updateExpense = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError('Invalid expense ID', 400);
    }

    const expense = await Expense.findOne({ _id: id, userId });
    if (!expense) {
      throw createError('Expense not found', 404);
    }

    // Store old values for budget adjustment
    const oldAmount = expense.amount;
    const oldCurrency = expense.currency;
    const oldCategory = expense.category;
    const oldDate = expense.date;

    // Handle receipt upload
    if (req.file) {
      // Delete old receipt if exists
      if (expense.receiptPublicId) {
        try {
          await deleteFromCloudinary(expense.receiptPublicId);
        } catch (deleteError) {
          console.error('Failed to delete old receipt:', deleteError);
        }
      }
      updateData.receiptUrl = (req.file as any).path;
      updateData.receiptPublicId = (req.file as any).filename;
    }

    // Update expense
    Object.assign(expense, updateData);
    if (updateData.date) {
      expense.date = new Date(updateData.date);
    }

    await expense.save();

    // Update budget spending if amount, category, or date changed
    if (
      oldAmount !== expense.amount ||
      oldCurrency !== expense.currency ||
      oldCategory !== expense.category ||
      oldDate.getTime() !== expense.date.getTime()
    ) {
      await updateBudgetSpending(userId, expense, oldAmount, oldCurrency, oldCategory, oldDate);
    }

    res.json({
      success: true,
      message: 'Expense updated successfully',
      expense
    });
  } catch (error) {
    // Clean up uploaded file if update fails
    if (req.file && (req.file as any).filename) {
      try {
        await deleteFromCloudinary((req.file as any).filename);
      } catch (deleteError) {
        console.error('Failed to delete uploaded file:', deleteError);
      }
    }
    throw error;
  }
};

export const deleteExpense = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError('Invalid expense ID', 400);
    }

    const expense = await Expense.findOne({ _id: id, userId });
    if (!expense) {
      throw createError('Expense not found', 404);
    }

    // Delete receipt from Cloudinary
    if (expense.receiptPublicId) {
      try {
        await deleteFromCloudinary(expense.receiptPublicId);
      } catch (deleteError) {
        console.error('Failed to delete receipt:', deleteError);
      }
    }

    // Remove expense from budget calculations
    await removeBudgetSpending(userId, expense);

    await Expense.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    throw error;
  }
};

export const getExpenseStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const { startDate, endDate, groupBy = 'category' } = req.query;

    // Build date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = new Date(startDate as string);
    if (endDate) dateFilter.$lte = new Date(endDate as string);

    const matchStage: any = { userId };
    if (Object.keys(dateFilter).length > 0) {
      matchStage.date = dateFilter;
    }

    // Aggregation pipeline
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: `$${groupBy}`,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          averageAmount: { $avg: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ];

    const stats = await Expense.aggregate(pipeline);

    // Calculate total spending
    const totalStats = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' },
          totalTransactions: { $sum: 1 },
          averageTransaction: { $avg: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      stats,
      summary: totalStats[0] || {
        totalSpent: 0,
        totalTransactions: 0,
        averageTransaction: 0
      }
    });
  } catch (error) {
    throw error;
  }
};

// Helper function to update budget spending
const updateBudgetSpending = async (
  userId: mongoose.Types.ObjectId,
  expense: IExpense,
  oldAmount?: number,
  oldCurrency?: string,
  oldCategory?: string,
  oldDate?: Date
) => {
  try {
    const userCurrency = expense.currency;

    // Find relevant budgets
    const budgets = await Budget.find({
      userId,
      isActive: true,
      startDate: { $lte: expense.date },
      endDate: { $gte: expense.date },
      $or: [
        { category: expense.category },
        { category: { $exists: false } } // General budgets without specific category
      ]
    });

    for (const budget of budgets) {
      let amountToAdd = expense.amount;
      
      // Convert currency if needed
      if (expense.currency !== budget.currency) {
        try {
          amountToAdd = await currencyConverter.convertAmount(
            expense.amount,
            expense.currency,
            budget.currency
          );
        } catch (error) {
          console.error('Currency conversion failed:', error);
          continue;
        }
      }

      // Subtract old amount if this is an update
      if (oldAmount !== undefined) {
        let oldAmountToSubtract = oldAmount;
        if (oldCurrency && oldCurrency !== budget.currency) {
          try {
            oldAmountToSubtract = await currencyConverter.convertAmount(
              oldAmount,
              oldCurrency,
              budget.currency
            );
          } catch (error) {
            console.error('Currency conversion failed for old amount:', error);
            continue;
          }
        }
        budget.spent -= oldAmountToSubtract;
      }

      // Add new amount
      budget.spent += amountToAdd;
      budget.spent = Math.max(0, budget.spent); // Ensure non-negative

      await budget.save();

      // Check for budget alerts
      await checkBudgetAlerts(budget, userId);
    }
  } catch (error) {
    console.error('Error updating budget spending:', error);
  }
};

// Helper function to remove spending from budgets
const removeBudgetSpending = async (userId: mongoose.Types.ObjectId, expense: IExpense) => {
  try {
    const budgets = await Budget.find({
      userId,
      isActive: true,
      startDate: { $lte: expense.date },
      endDate: { $gte: expense.date },
      $or: [
        { category: expense.category },
        { category: { $exists: false } }
      ]
    });

    for (const budget of budgets) {
      let amountToSubtract = expense.amount;
      
      if (expense.currency !== budget.currency) {
        try {
          amountToSubtract = await currencyConverter.convertAmount(
            expense.amount,
            expense.currency,
            budget.currency
          );
        } catch (error) {
          console.error('Currency conversion failed:', error);
          continue;
        }
      }

      budget.spent = Math.max(0, budget.spent - amountToSubtract);
      await budget.save();
    }
  } catch (error) {
    console.error('Error removing budget spending:', error);
  }
};

// Helper function to check budget alerts
const checkBudgetAlerts = async (budget: any, userId: mongoose.Types.ObjectId) => {
  try {
    const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
    
    // Get user email
    const user = await mongoose.model('User').findById(userId);
    if (!user) return;

    // 80% alert
    if (percentage >= 80 && budget.alertAt80Percent && !budget.alert80PercentSent) {
      await emailService.sendBudgetAlert(
        user.email,
        budget.name,
        Math.round(percentage),
        budget.spent,
        budget.amount,
        budget.currency
      );
      budget.alert80PercentSent = true;
    }

    // 100% alert
    if (percentage >= 100 && budget.alertAt100Percent && !budget.alert100PercentSent) {
      await emailService.sendBudgetAlert(
        user.email,
        budget.name,
        Math.round(percentage),
        budget.spent,
        budget.amount,
        budget.currency
      );
      budget.alert100PercentSent = true;
    }

    await budget.save();
  } catch (error) {
    console.error('Error checking budget alerts:', error);
  }
};
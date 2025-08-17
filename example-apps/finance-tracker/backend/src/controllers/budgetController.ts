import { Request, Response } from 'express';
import Budget from '../models/Budget';
import Expense from '../models/Expense';

export const createBudget = async (req: Request, res: Response) => {
  try {
    const { category, amount, period, year, month } = req.body;

    // Check for existing budget
    const existingBudget = await Budget.findOne({
      user: req.userId,
      category,
      period,
      year,
      ...(period === 'monthly' && { month })
    });

    if (existingBudget) {
      return res.status(400).json({ message: 'Budget for this category and period already exists' });
    }

    // Create new budget
    const newBudget = new Budget({
      user: req.userId,
      category,
      amount,
      period,
      year,
      ...(period === 'monthly' && { month })
    });

    await newBudget.save();

    res.status(201).json(newBudget);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating budget' });
  }
};

export const getBudgets = async (req: Request, res: Response) => {
  try {
    const { year, period, category } = req.query;

    const filter: any = { user: req.userId };

    if (year) {
      filter.year = parseInt(year as string);
    }

    if (period) {
      filter.period = period;
    }

    if (category) {
      filter.category = category;
    }

    const budgets = await Budget.find(filter);
    res.json(budgets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching budgets' });
  }
};

export const getBudgetSummary = async (req: Request, res: Response) => {
  try {
    const { year, month } = req.query;

    // Validate year and month
    const currentYear = parseInt(year as string);
    const currentMonth = parseInt(month as string);

    // Retrieve budgets for the specified period
    const budgets = await Budget.find({
      user: req.userId,
      $or: [
        { period: 'yearly', year: currentYear },
        { 
          period: 'monthly', 
          year: currentYear, 
          month: currentMonth 
        }
      ]
    });

    // Calculate expenses for each budget category
    const budgetSummary = await Promise.all(budgets.map(async (budget) => {
      const startDate = budget.period === 'yearly' 
        ? new Date(budget.year, 0, 1) 
        : new Date(budget.year, budget.month! - 1, 1);

      const endDate = budget.period === 'yearly' 
        ? new Date(budget.year, 11, 31) 
        : new Date(budget.year, budget.month!, 0);

      const expenses = await Expense.aggregate([
        { 
          $match: { 
            user: req.userId, 
            category: budget.category,
            date: { $gte: startDate, $lte: endDate }
          } 
        },
        { $group: { _id: null, totalExpense: { $sum: '$amount' } } }
      ]);

      const totalExpense = expenses[0]?.totalExpense || 0;
      const percentageSpent = (totalExpense / budget.amount) * 100;

      return {
        category: budget.category,
        budgetAmount: budget.amount,
        totalExpense,
        percentageSpent,
        period: budget.period,
        year: budget.year,
        ...(budget.period === 'monthly' && { month: budget.month })
      };
    }));

    res.json(budgetSummary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching budget summary' });
  }
};

export const updateBudget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, category } = req.body;

    const budget = await Budget.findOneAndUpdate(
      { _id: id, user: req.userId },
      { amount, category },
      { new: true }
    );

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json(budget);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating budget' });
  }
};

export const deleteBudget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const budget = await Budget.findOneAndDelete({ 
      _id: id, 
      user: req.userId 
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting budget' });
  }
};
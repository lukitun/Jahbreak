import { Request, Response } from 'express';
import Expense from '../models/Expense';
import Budget from '../models/Budget';
import cloudinary from '../utils/cloudinaryConfig';
import multer from 'multer';

// Multer upload configuration
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB file limit
});

export const createExpense = async (req: Request, res: Response) => {
  try {
    const { amount, category, description, date, currency } = req.body;
    
    // Check if budget exists and is not exceeded
    const currentDate = date ? new Date(date) : new Date();
    const budget = await Budget.findOne({
      user: req.userId,
      category,
      period: 'monthly',
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1
    });

    // Handle receipt image upload if exists
    let receiptImageUrl;
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
        { folder: 'finance-tracker/receipts' }
      );
      receiptImageUrl = uploadResult.secure_url;
    }

    // Create expense
    const newExpense = new Expense({
      user: req.userId,
      amount,
      category,
      description,
      date: currentDate,
      currency: currency || 'USD',
      receiptImage: receiptImageUrl
    });

    await newExpense.save();

    // Check budget alert
    if (budget) {
      const monthlyExpenses = await Expense.aggregate([
        { 
          $match: { 
            user: req.userId, 
            category,
            date: {
              $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
              $lt: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
            }
          } 
        },
        { $group: { _id: null, totalExpense: { $sum: '$amount' } } }
      ]);

      const totalMonthlyExpense = monthlyExpenses[0]?.totalExpense || 0;
      const budgetExceededPercentage = (totalMonthlyExpense / budget.amount) * 100;

      return res.status(201).json({ 
        expense: newExpense,
        budgetAlert: budgetExceededPercentage >= 80 ? {
          message: budgetExceededPercentage >= 100 
            ? 'Budget fully exceeded!' 
            : 'Budget is 80% utilized',
          percentage: budgetExceededPercentage
        } : null
      });
    }

    res.status(201).json({ expense: newExpense });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating expense' });
  }
};

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, category } = req.query;
    
    const filter: any = { user: req.userId };

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    if (category) {
      filter.category = category;
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching expenses' });
  }
};

export const updateExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, category, description, date, currency } = req.body;

    const expense = await Expense.findOneAndUpdate(
      { _id: id, user: req.userId },
      { amount, category, description, date, currency },
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating expense' });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findOneAndDelete({ 
      _id: id, 
      user: req.userId 
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // If there's a receipt image, delete from cloudinary
    if (expense.receiptImage) {
      const publicId = expense.receiptImage.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`finance-tracker/receipts/${publicId}`);
      }
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting expense' });
  }
};
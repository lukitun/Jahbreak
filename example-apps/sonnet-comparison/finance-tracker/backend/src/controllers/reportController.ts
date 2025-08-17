import { Response } from 'express';
import PDFDocument from 'pdfkit';
import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';
import fs from 'fs';
import Expense from '../models/Expense';
import Budget from '../models/Budget';
import SavingsGoal from '../models/SavingsGoal';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { createError } from '../middleware/errorHandler';
import currencyConverter from '../utils/currencyConverter';

export const getFinancialSummary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const { startDate, endDate, currency } = req.query;

    // Date range setup
    const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate as string) : new Date();
    const userCurrency = (currency as string) || req.user!.preferredCurrency;

    // Get expenses in date range
    const expenses = await Expense.find({
      userId,
      date: { $gte: start, $lte: end }
    });

    // Convert all amounts to user currency
    let totalExpenses = 0;
    const categoryBreakdown: { [key: string]: number } = {};
    
    for (const expense of expenses) {
      let amount = expense.amount;
      if (expense.currency !== userCurrency) {
        try {
          amount = await currencyConverter.convertAmount(expense.amount, expense.currency, userCurrency);
        } catch (error) {
          console.error('Currency conversion failed:', error);
          continue;
        }
      }
      
      totalExpenses += amount;
      categoryBreakdown[expense.category] = (categoryBreakdown[expense.category] || 0) + amount;
    }

    // Get active budgets
    const budgets = await Budget.find({
      userId,
      isActive: true,
      startDate: { $lte: end },
      endDate: { $gte: start }
    });

    let totalBudgeted = 0;
    for (const budget of budgets) {
      let amount = budget.amount;
      if (budget.currency !== userCurrency) {
        try {
          amount = await currencyConverter.convertAmount(budget.amount, budget.currency, userCurrency);
        } catch (error) {
          console.error('Currency conversion failed:', error);
          continue;
        }
      }
      totalBudgeted += amount;
    }

    // Get savings goals
    const savingsGoals = await SavingsGoal.find({ userId });
    let totalSavingsTarget = 0;
    let totalSavingsCurrent = 0;
    
    for (const goal of savingsGoals) {
      let targetAmount = goal.targetAmount;
      let currentAmount = goal.currentAmount;
      
      if (goal.currency !== userCurrency) {
        try {
          targetAmount = await currencyConverter.convertAmount(goal.targetAmount, goal.currency, userCurrency);
          currentAmount = await currencyConverter.convertAmount(goal.currentAmount, goal.currency, userCurrency);
        } catch (error) {
          console.error('Currency conversion failed:', error);
          continue;
        }
      }
      
      totalSavingsTarget += targetAmount;
      totalSavingsCurrent += currentAmount;
    }

    // Calculate trends (compare with previous period)
    const previousStart = new Date(start);
    previousStart.setMonth(previousStart.getMonth() - 1);
    const previousEnd = new Date(end);
    previousEnd.setMonth(previousEnd.getMonth() - 1);

    const previousExpenses = await Expense.find({
      userId,
      date: { $gte: previousStart, $lte: previousEnd }
    });

    let previousTotal = 0;
    for (const expense of previousExpenses) {
      let amount = expense.amount;
      if (expense.currency !== userCurrency) {
        try {
          amount = await currencyConverter.convertAmount(expense.amount, expense.currency, userCurrency);
        } catch (error) {
          continue;
        }
      }
      previousTotal += amount;
    }

    const expenseChange = previousTotal > 0 ? ((totalExpenses - previousTotal) / previousTotal) * 100 : 0;

    res.json({
      success: true,
      summary: {
        totalExpenses,
        totalBudgeted,
        budgetVariance: totalBudgeted - totalExpenses,
        budgetUtilization: totalBudgeted > 0 ? (totalExpenses / totalBudgeted) * 100 : 0,
        totalSavingsTarget,
        totalSavingsCurrent,
        savingsProgress: totalSavingsTarget > 0 ? (totalSavingsCurrent / totalSavingsTarget) * 100 : 0,
        expenseChange,
        categoryBreakdown,
        currency: userCurrency,
        period: {
          start,
          end
        }
      }
    });
  } catch (error) {
    throw error;
  }
};

export const getMonthlyReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const { year, month } = req.query;

    const targetYear = year ? parseInt(year as string) : new Date().getFullYear();
    const targetMonth = month ? parseInt(month as string) - 1 : new Date().getMonth();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);

    // Get daily spending data
    const dailySpending = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: '$date' },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get category breakdown
    const categorySpending = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          averageAmount: { $avg: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // Get payment method breakdown
    const paymentMethodBreakdown = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    res.json({
      success: true,
      report: {
        period: {
          year: targetYear,
          month: targetMonth + 1,
          startDate,
          endDate
        },
        dailySpending,
        categorySpending,
        paymentMethodBreakdown
      }
    });
  } catch (error) {
    throw error;
  }
};

export const getIncomeVsExpenses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const { startDate, endDate, groupBy = 'month' } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear() - 1, 0, 1);
    const end = endDate ? new Date(endDate as string) : new Date();

    let groupStage: any;
    
    switch (groupBy) {
      case 'day':
        groupStage = {
          year: { $year: '$date' },
          month: { $month: '$date' },
          day: { $dayOfMonth: '$date' }
        };
        break;
      case 'week':
        groupStage = {
          year: { $year: '$date' },
          week: { $week: '$date' }
        };
        break;
      case 'year':
        groupStage = {
          year: { $year: '$date' }
        };
        break;
      default: // month
        groupStage = {
          year: { $year: '$date' },
          month: { $month: '$date' }
        };
    }

    const expenseData = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: groupStage,
          totalExpenses: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ]);

    // Note: In a real application, you would also have income tracking
    // For now, we'll return expense data with placeholder income data
    const data = expenseData.map(item => ({
      period: item._id,
      expenses: item.totalExpenses,
      income: 0, // This would come from income tracking
      net: -item.totalExpenses,
      transactionCount: item.transactionCount
    }));

    res.json({
      success: true,
      data,
      summary: {
        totalExpenses: expenseData.reduce((sum, item) => sum + item.totalExpenses, 0),
        totalIncome: 0, // Placeholder
        netAmount: -expenseData.reduce((sum, item) => sum + item.totalExpenses, 0),
        period: { start, end },
        groupBy
      }
    });
  } catch (error) {
    throw error;
  }
};

export const exportCSV = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const { startDate, endDate, type = 'expenses' } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate as string) : new Date();

    let data: any[] = [];
    let headers: any[] = [];
    let filename = '';

    if (type === 'expenses') {
      const expenses = await Expense.find({
        userId,
        date: { $gte: start, $lte: end }
      }).sort({ date: -1 });

      headers = [
        { id: 'date', title: 'Date' },
        { id: 'category', title: 'Category' },
        { id: 'description', title: 'Description' },
        { id: 'amount', title: 'Amount' },
        { id: 'currency', title: 'Currency' },
        { id: 'paymentMethod', title: 'Payment Method' },
        { id: 'location', title: 'Location' },
        { id: 'tags', title: 'Tags' }
      ];

      data = expenses.map(expense => ({
        date: expense.date.toISOString().split('T')[0],
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        currency: expense.currency,
        paymentMethod: expense.paymentMethod,
        location: expense.location || '',
        tags: expense.tags.join(', ')
      }));

      filename = `expenses_${start.toISOString().split('T')[0]}_to_${end.toISOString().split('T')[0]}.csv`;
    } else if (type === 'budgets') {
      const budgets = await Budget.find({ userId }).sort({ createdAt: -1 });

      headers = [
        { id: 'name', title: 'Budget Name' },
        { id: 'category', title: 'Category' },
        { id: 'amount', title: 'Amount' },
        { id: 'spent', title: 'Spent' },
        { id: 'remaining', title: 'Remaining' },
        { id: 'currency', title: 'Currency' },
        { id: 'period', title: 'Period' },
        { id: 'startDate', title: 'Start Date' },
        { id: 'endDate', title: 'End Date' },
        { id: 'progress', title: 'Progress %' }
      ];

      data = budgets.map(budget => ({
        name: budget.name,
        category: budget.category || 'General',
        amount: budget.amount,
        spent: budget.spent,
        remaining: Math.max(0, budget.amount - budget.spent),
        currency: budget.currency,
        period: budget.period,
        startDate: budget.startDate.toISOString().split('T')[0],
        endDate: budget.endDate.toISOString().split('T')[0],
        progress: budget.amount > 0 ? Math.round((budget.spent / budget.amount) * 100) : 0
      }));

      filename = `budgets_${new Date().toISOString().split('T')[0]}.csv`;
    }

    // Create CSV file
    const csvPath = path.join('/tmp', filename);
    const csvWriter = createObjectCsvWriter({
      path: csvPath,
      header: headers
    });

    await csvWriter.writeRecords(data);

    // Send file
    res.download(csvPath, filename, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      // Clean up temp file
      fs.unlink(csvPath, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
      });
    });
  } catch (error) {
    throw error;
  }
};

export const exportPDF = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const { startDate, endDate, type = 'summary' } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate as string) : new Date();

    const doc = new PDFDocument();
    const filename = `financial_report_${start.toISOString().split('T')[0]}_to_${end.toISOString().split('T')[0]}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // Add header
    doc.fontSize(20).text('Financial Report', 50, 50);
    doc.fontSize(12).text(`${req.user!.firstName} ${req.user!.lastName}`, 50, 80);
    doc.text(`Period: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`, 50, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 50, 120);

    let yPosition = 160;

    if (type === 'summary') {
      // Get summary data
      const expenses = await Expense.find({
        userId,
        date: { $gte: start, $lte: end }
      });

      const categoryBreakdown = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {} as { [key: string]: number });

      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

      // Add summary section
      doc.fontSize(16).text('Summary', 50, yPosition);
      yPosition += 30;

      doc.fontSize(12).text(`Total Expenses: ${currencyConverter.formatAmount(totalExpenses, req.user!.preferredCurrency)}`, 50, yPosition);
      yPosition += 20;

      doc.text(`Total Transactions: ${expenses.length}`, 50, yPosition);
      yPosition += 20;

      if (totalExpenses > 0) {
        doc.text(`Average Transaction: ${currencyConverter.formatAmount(totalExpenses / expenses.length, req.user!.preferredCurrency)}`, 50, yPosition);
        yPosition += 40;
      }

      // Add category breakdown
      doc.fontSize(16).text('Category Breakdown', 50, yPosition);
      yPosition += 30;

      Object.entries(categoryBreakdown)
        .sort(([,a], [,b]) => b - a)
        .forEach(([category, amount]) => {
          const percentage = ((amount / totalExpenses) * 100).toFixed(1);
          doc.fontSize(12).text(`${category}: ${currencyConverter.formatAmount(amount, req.user!.preferredCurrency)} (${percentage}%)`, 50, yPosition);
          yPosition += 20;
        });
    }

    doc.end();
  } catch (error) {
    throw error;
  }
};
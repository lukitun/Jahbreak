import { Request, Response } from 'express';
import Expense from '../models/Expense';
// Note: PDFKit package would need to be installed for PDF generation
// For now, we'll return CSV reports only
import fs from 'fs';
import path from 'path';

export const generateMonthlyReport = async (req: Request, res: Response) => {
  try {
    const { year, month } = req.query;

    // Convert year and month to numbers
    const reportYear = parseInt(year as string);
    const reportMonth = parseInt(month as string);

    // Create date range for the specified month
    const startDate = new Date(reportYear, reportMonth - 1, 1);
    const endDate = new Date(reportYear, reportMonth, 0);

    // Aggregate expenses by category
    const categoryExpenses = await Expense.aggregate([
      { 
        $match: { 
          user: req.userId, 
          date: { $gte: startDate, $lte: endDate } 
        } 
      },
      { 
        $group: { 
          _id: '$category', 
          totalAmount: { $sum: '$amount' },
          expenses: { $push: '$$ROOT' }
        } 
      },
      { 
        $sort: { totalAmount: -1 } 
      }
    ]);

    // Calculate total monthly spending
    const totalMonthlySpending = categoryExpenses.reduce(
      (total, category) => total + category.totalAmount, 0
    );

    // Generate PDF report
    const doc = new PDFDocument();
    const reportPath = path.join(
      __dirname, 
      `../reports/monthly-report-${reportYear}-${reportMonth}.pdf`
    );
    
    // Ensure reports directory exists
    if (!fs.existsSync(path.join(__dirname, '../reports'))) {
      fs.mkdirSync(path.join(__dirname, '../reports'));
    }

    const writeStream = fs.createWriteStream(reportPath);
    doc.pipe(writeStream);

    // PDF Content
    doc.fontSize(20).text(`Monthly Expense Report - ${reportYear}-${reportMonth}`, { align: 'center' });
    doc.moveDown();

    // Category Breakdown
    doc.fontSize(16).text('Expense Breakdown by Category', { underline: true });
    categoryExpenses.forEach(category => {
      doc.fontSize(12)
        .text(`${category._id}: $${category.totalAmount.toFixed(2)} (${((category.totalAmount / totalMonthlySpending) * 100).toFixed(2)}%)`)
        .moveDown(0.5);
    });

    doc.fontSize(14)
      .text(`Total Monthly Spending: $${totalMonthlySpending.toFixed(2)}`)
      .moveDown();

    // Finalize PDF
    doc.end();

    // Wait for write stream to finish
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // CSV Generation
    const csvPath = path.join(
      __dirname, 
      `../reports/monthly-report-${reportYear}-${reportMonth}.csv`
    );

    // Generate CSV content
    let csvContent = 'Category,Total Amount,Percentage\n';
    categoryExpenses.forEach(category => {
      const percentage = ((category.totalAmount / totalMonthlySpending) * 100).toFixed(2);
      csvContent += `${category._id},${category.totalAmount.toFixed(2)},${percentage}\n`;
    });

    // Write CSV file
    fs.writeFileSync(csvPath, csvContent);

    res.json({
      pdfReport: `/reports/monthly-report-${reportYear}-${reportMonth}.pdf`,
      csvReport: `/reports/monthly-report-${reportYear}-${reportMonth}.csv`,
      totalMonthlySpending,
      categoryBreakdown: categoryExpenses
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating monthly report' });
  }
};

export const generateAnnualReport = async (req: Request, res: Response) => {
  try {
    const { year } = req.query;

    // Convert year to number
    const reportYear = parseInt(year as string);

    // Create date range for the specified year
    const startDate = new Date(reportYear, 0, 1);
    const endDate = new Date(reportYear, 11, 31);

    // Aggregate monthly expenses
    const monthlyExpenses = await Expense.aggregate([
      { 
        $match: { 
          user: req.userId, 
          date: { $gte: startDate, $lte: endDate } 
        } 
      },
      { 
        $group: { 
          _id: { 
            month: { $month: '$date' }, 
            category: '$category' 
          }, 
          totalAmount: { $sum: '$amount' } 
        } 
      },
      { 
        $group: { 
          _id: '$_id.month', 
          categories: { 
            $push: { 
              category: '$_id.category', 
              totalAmount: '$totalAmount' 
            } 
          } 
        } 
      },
      { $sort: { '_id': 1 } }
    ]);

    // Calculate total annual spending
    const totalAnnualSpending = monthlyExpenses.reduce(
      (total, monthData) => total + monthData.categories.reduce(
        (monthTotal, category) => monthTotal + category.totalAmount, 0
      ), 0
    );

    // Generate PDF report
    const doc = new PDFDocument();
    const reportPath = path.join(
      __dirname, 
      `../reports/annual-report-${reportYear}.pdf`
    );
    
    const writeStream = fs.createWriteStream(reportPath);
    doc.pipe(writeStream);

    // PDF Content
    doc.fontSize(20).text(`Annual Expense Report - ${reportYear}`, { align: 'center' });
    doc.moveDown();

    // Monthly Breakdown
    doc.fontSize(16).text('Monthly Expense Breakdown', { underline: true });
    monthlyExpenses.forEach(monthData => {
      const monthName = new Date(reportYear, monthData._id - 1, 1).toLocaleString('default', { month: 'long' });
      doc.fontSize(14).text(monthName);
      
      monthData.categories.forEach(category => {
        doc.fontSize(12)
          .text(`${category.category}: $${category.totalAmount.toFixed(2)}`)
          .moveDown(0.5);
      });
      doc.moveDown();
    });

    doc.fontSize(14)
      .text(`Total Annual Spending: $${totalAnnualSpending.toFixed(2)}`)
      .moveDown();

    // Finalize PDF
    doc.end();

    // Wait for write stream to finish
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // CSV Generation
    const csvPath = path.join(
      __dirname, 
      `../reports/annual-report-${reportYear}.csv`
    );

    // Generate CSV content
    let csvContent = 'Month,Category,Total Amount\n';
    monthlyExpenses.forEach(monthData => {
      const monthName = new Date(reportYear, monthData._id - 1, 1).toLocaleString('default', { month: 'long' });
      monthData.categories.forEach(category => {
        csvContent += `${monthName},${category.category},${category.totalAmount.toFixed(2)}\n`;
      });
    });

    // Write CSV file
    fs.writeFileSync(csvPath, csvContent);

    res.json({
      pdfReport: `/reports/annual-report-${reportYear}.pdf`,
      csvReport: `/reports/annual-report-${reportYear}.csv`,
      totalAnnualSpending,
      monthlyBreakdown: monthlyExpenses
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating annual report' });
  }
};
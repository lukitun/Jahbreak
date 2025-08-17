import express from 'express';
import {
  getFinancialSummary,
  getMonthlyReport,
  getIncomeVsExpenses,
  exportCSV,
  exportPDF
} from '../controllers/reportController';

const router = express.Router();

// Financial reports
router.get('/summary', getFinancialSummary);
router.get('/monthly', getMonthlyReport);
router.get('/income-vs-expenses', getIncomeVsExpenses);

// Export functionality
router.get('/export/csv', exportCSV);
router.get('/export/pdf', exportPDF);

export default router;
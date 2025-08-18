import React, { useState } from 'react';
import { reportsAPI } from '../services/api';
import { Report } from '../types';

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState<'monthly' | 'annual'>('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateReport = async () => {
    setLoading(true);
    setError('');
    setReport(null);

    try {
      let reportData: Report;
      
      if (reportType === 'monthly') {
        reportData = await reportsAPI.getMonthlyReport({
          year: selectedYear,
          month: selectedMonth,
        });
      } else {
        reportData = await reportsAPI.getAnnualReport({
          year: selectedYear,
        });
      }

      setReport(reportData);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = async (csvUrl: string) => {
    try {
      const blob = await reportsAPI.downloadCSV(csvUrl);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}-report-${selectedYear}${reportType === 'monthly' ? `-${selectedMonth}` : ''}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      setError('Failed to download CSV report');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 5; year <= currentYear; year++) {
      years.push(year);
    }
    return years;
  };

  const generateMonthOptions = () => {
    return [
      { value: 1, label: 'January' },
      { value: 2, label: 'February' },
      { value: 3, label: 'March' },
      { value: 4, label: 'April' },
      { value: 5, label: 'May' },
      { value: 6, label: 'June' },
      { value: 7, label: 'July' },
      { value: 8, label: 'August' },
      { value: 9, label: 'September' },
      { value: 10, label: 'October' },
      { value: 11, label: 'November' },
      { value: 12, label: 'December' },
    ];
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <h2>Financial Reports</h2>
        <p>Generate detailed reports of your expenses and financial activity</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Report Configuration */}
      <div className="report-config">
        <h3>Report Configuration</h3>
        
        <div className="config-section">
          <div className="form-group">
            <label>Report Type:</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="monthly"
                  checked={reportType === 'monthly'}
                  onChange={(e) => setReportType(e.target.value as 'monthly' | 'annual')}
                />
                Monthly Report
              </label>
              <label>
                <input
                  type="radio"
                  value="annual"
                  checked={reportType === 'annual'}
                  onChange={(e) => setReportType(e.target.value as 'monthly' | 'annual')}
                />
                Annual Report
              </label>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="year">Year:</label>
              <select
                id="year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {generateYearOptions().map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {reportType === 'monthly' && (
              <div className="form-group">
                <label htmlFor="month">Month:</label>
                <select
                  id="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
                  {generateMonthOptions().map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button 
            onClick={generateReport}
            disabled={loading}
            className="generate-report-btn"
          >
            {loading ? 'Generating Report...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Report Results */}
      {report && (
        <div className="report-results">
          <div className="report-header">
            <h3>
              {reportType === 'monthly' 
                ? `${generateMonthOptions()[selectedMonth - 1]?.label} ${selectedYear} Report`
                : `${selectedYear} Annual Report`
              }
            </h3>
            
            <div className="download-buttons">
              <button 
                onClick={() => downloadCSV(report.csvReport)}
                className="download-btn csv-btn"
              >
                Download CSV
              </button>
              {report.pdfReport && (
                <button 
                  onClick={() => window.open(report.pdfReport, '_blank')}
                  className="download-btn pdf-btn"
                >
                  View PDF
                </button>
              )}
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="report-summary">
            <div className="summary-cards">
              <div className="summary-card">
                <h4>Total Spending</h4>
                <div className="summary-value">
                  {formatCurrency(report.totalMonthlySpending || report.totalAnnualSpending || 0)}
                </div>
              </div>
              
              <div className="summary-card">
                <h4>Categories</h4>
                <div className="summary-value">
                  {report.categoryBreakdown?.length || report.monthlyBreakdown?.length || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown (Monthly Report) */}
          {report.categoryBreakdown && (
            <div className="category-breakdown">
              <h4>Spending by Category</h4>
              <div className="breakdown-table">
                <table>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Percentage</th>
                      <th>Transactions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.categoryBreakdown.map((category) => {
                      const percentage = ((category.totalAmount / (report.totalMonthlySpending || 1)) * 100);
                      return (
                        <tr key={category._id}>
                          <td>
                            <span className={`category-tag category-${category._id.toLowerCase()}`}>
                              {category._id}
                            </span>
                          </td>
                          <td className="amount">{formatCurrency(category.totalAmount)}</td>
                          <td>{percentage.toFixed(1)}%</td>
                          <td>{category.expenses.length}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Monthly Breakdown (Annual Report) */}
          {report.monthlyBreakdown && (
            <div className="monthly-breakdown">
              <h4>Monthly Spending Overview</h4>
              <div className="breakdown-table">
                <table>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Total Amount</th>
                      <th>Top Categories</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.monthlyBreakdown.map((monthData) => {
                      const monthName = new Date(selectedYear, monthData._id - 1, 1)
                        .toLocaleString('default', { month: 'long' });
                      const monthTotal = monthData.categories.reduce(
                        (sum, cat) => sum + cat.totalAmount, 0
                      );
                      const topCategories = monthData.categories
                        .sort((a, b) => b.totalAmount - a.totalAmount)
                        .slice(0, 3);

                      return (
                        <tr key={monthData._id}>
                          <td>{monthName}</td>
                          <td className="amount">{formatCurrency(monthTotal)}</td>
                          <td>
                            <div className="top-categories">
                              {topCategories.map((cat, index) => (
                                <span key={cat.category} className="category-chip">
                                  {cat.category} ({formatCurrency(cat.totalAmount)})
                                  {index < topCategories.length - 1 && ', '}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Export Instructions */}
          <div className="export-instructions">
            <h4>Export Options</h4>
            <ul>
              <li><strong>CSV Export:</strong> Download a spreadsheet-compatible file for further analysis</li>
              {report.pdfReport && (
                <li><strong>PDF Report:</strong> View or download a formatted PDF report</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="reports-help">
        <h3>About Reports</h3>
        <div className="help-content">
          <div className="help-item">
            <h4>Monthly Reports</h4>
            <p>
              Get a detailed breakdown of your expenses for a specific month, including 
              category-wise spending, percentage distribution, and transaction details.
            </p>
          </div>
          
          <div className="help-item">
            <h4>Annual Reports</h4>
            <p>
              View your entire year's financial activity with month-by-month breakdowns, 
              yearly totals, and spending trends across all categories.
            </p>
          </div>
          
          <div className="help-item">
            <h4>Export Formats</h4>
            <p>
              Download your reports in CSV format for use in spreadsheet applications 
              like Excel or Google Sheets for further analysis and record keeping.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
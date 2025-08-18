import React, { useState, useEffect } from 'react';
import { BudgetSummary as BudgetSummaryType } from '../../types';
import { budgetsAPI } from '../../services/api';

interface BudgetSummaryProps {
  year: number;
  month?: number;
  refreshTrigger?: number;
}

const BudgetSummary: React.FC<BudgetSummaryProps> = ({ year, month, refreshTrigger }) => {
  const [budgetSummaries, setBudgetSummaries] = useState<BudgetSummaryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBudgetSummary();
  }, [year, month, refreshTrigger]);

  const fetchBudgetSummary = async () => {
    setLoading(true);
    setError('');

    try {
      const params = { year, ...(month && { month }) };
      const data = await budgetsAPI.getSummary(params);
      setBudgetSummaries(data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch budget summary');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 100) return '#e74c3c'; // Red
    if (percentage >= 80) return '#f39c12'; // Orange
    return '#27ae60'; // Green
  };

  const getStatusText = (percentage: number) => {
    if (percentage >= 100) return 'Over Budget';
    if (percentage >= 80) return 'Near Limit';
    return 'On Track';
  };

  if (loading) {
    return <div className="loading">Loading budget summary...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (budgetSummaries.length === 0) {
    return (
      <div className="no-budgets">
        <p>No budgets set for this period. Create your first budget to track your spending!</p>
      </div>
    );
  }

  return (
    <div className="budget-summary">
      <h3>Budget Overview</h3>
      <p className="summary-period">
        {month 
          ? `${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}`
          : `Year ${year}`
        }
      </p>

      <div className="budget-cards">
        {budgetSummaries.map((summary) => (
          <div key={`${summary.category}-${summary.period}`} className="budget-card">
            <div className="budget-card-header">
              <h4>{summary.category}</h4>
              <span className={`budget-status status-${getStatusText(summary.percentageSpent).toLowerCase().replace(' ', '-')}`}>
                {getStatusText(summary.percentageSpent)}
              </span>
            </div>

            <div className="budget-amounts">
              <div className="amount-row">
                <span>Spent:</span>
                <span className="amount-spent">{formatCurrency(summary.totalExpense)}</span>
              </div>
              <div className="amount-row">
                <span>Budget:</span>
                <span className="amount-budget">{formatCurrency(summary.budgetAmount)}</span>
              </div>
              <div className="amount-row">
                <span>Remaining:</span>
                <span className={`amount-remaining ${summary.totalExpense > summary.budgetAmount ? 'negative' : 'positive'}`}>
                  {formatCurrency(summary.budgetAmount - summary.totalExpense)}
                </span>
              </div>
            </div>

            <div className="progress-section">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{
                    width: `${Math.min(summary.percentageSpent, 100)}%`,
                    backgroundColor: getProgressBarColor(summary.percentageSpent)
                  }}
                />
              </div>
              <div className="progress-text">
                {summary.percentageSpent.toFixed(1)}% used
              </div>
            </div>

            {summary.percentageSpent >= 80 && (
              <div className={`budget-alert ${summary.percentageSpent >= 100 ? 'alert-danger' : 'alert-warning'}`}>
                {summary.percentageSpent >= 100 
                  ? `You've exceeded your budget by ${formatCurrency(summary.totalExpense - summary.budgetAmount)}`
                  : `You're approaching your budget limit`
                }
              </div>
            )}

            <div className="budget-meta">
              <small>
                {summary.period === 'monthly' ? 'Monthly' : 'Yearly'} Budget
              </small>
            </div>
          </div>
        ))}
      </div>

      {/* Overall Summary */}
      <div className="overall-summary">
        <h4>Total Summary</h4>
        <div className="summary-stats">
          <div className="stat">
            <span className="stat-label">Total Spent:</span>
            <span className="stat-value">
              {formatCurrency(budgetSummaries.reduce((sum, budget) => sum + budget.totalExpense, 0))}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Total Budget:</span>
            <span className="stat-value">
              {formatCurrency(budgetSummaries.reduce((sum, budget) => sum + budget.budgetAmount, 0))}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Categories:</span>
            <span className="stat-value">{budgetSummaries.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetSummary;
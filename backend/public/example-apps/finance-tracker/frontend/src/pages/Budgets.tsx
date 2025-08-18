import React, { useState, useEffect } from 'react';
import BudgetForm from '../components/budgets/BudgetForm';
import BudgetSummary from '../components/budgets/BudgetSummary';
import { budgetsAPI } from '../services/api';
import { Budget } from '../types';

const Budgets: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [viewPeriod, setViewPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBudgets();
  }, [selectedYear, viewPeriod, selectedMonth, refreshTrigger]);

  const fetchBudgets = async () => {
    setLoading(true);
    setError('');

    try {
      const params = { 
        year: selectedYear, 
        period: viewPeriod,
        ...(viewPeriod === 'monthly' && { month: selectedMonth })
      };
      const data = await budgetsAPI.getAll(params);
      setBudgets(data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = async (budgetData: {
    category: string;
    amount: number;
    period: 'monthly' | 'yearly';
    year: number;
    month?: number;
  }) => {
    try {
      await budgetsAPI.create(budgetData);
      setShowForm(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      throw error;
    }
  };

  const handleEditBudget = async (budgetData: {
    category: string;
    amount: number;
    period: 'monthly' | 'yearly';
    year: number;
    month?: number;
  }) => {
    if (!editingBudget) return;

    try {
      await budgetsAPI.update(editingBudget._id, {
        amount: budgetData.amount,
        category: budgetData.category,
      });
      setEditingBudget(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }

    try {
      await budgetsAPI.delete(budgetId);
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete budget');
    }
  };

  const handleEditClick = (budget: Budget) => {
    setEditingBudget(budget);
    setShowForm(false);
  };

  const handleCancelEdit = () => {
    setEditingBudget(null);
  };

  const handleCancelAdd = () => {
    setShowForm(false);
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
    for (let year = currentYear - 1; year <= currentYear + 5; year++) {
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
    <div className="budgets-page">
      <div className="page-header">
        <h2>Budget Management</h2>
        <button 
          onClick={() => {
            setShowForm(true);
            setEditingBudget(null);
          }}
          className="add-budget-btn"
          disabled={showForm || editingBudget}
        >
          Create New Budget
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Period Selection */}
      <div className="period-controls">
        <div className="period-selector">
          <label>
            <input
              type="radio"
              value="monthly"
              checked={viewPeriod === 'monthly'}
              onChange={(e) => setViewPeriod(e.target.value as 'monthly' | 'yearly')}
            />
            Monthly View
          </label>
          <label>
            <input
              type="radio"
              value="yearly"
              checked={viewPeriod === 'yearly'}
              onChange={(e) => setViewPeriod(e.target.value as 'monthly' | 'yearly')}
            />
            Yearly View
          </label>
        </div>

        <div className="date-controls">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {generateYearOptions().map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          {viewPeriod === 'monthly' && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {generateMonthOptions().map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="budgets-content">
        {/* Add/Edit Form */}
        {(showForm || editingBudget) && (
          <div className="form-section">
            <BudgetForm
              onSubmit={editingBudget ? handleEditBudget : handleCreateBudget}
              onCancel={editingBudget ? handleCancelEdit : handleCancelAdd}
              initialData={editingBudget || undefined}
              isEditing={!!editingBudget}
            />
          </div>
        )}

        {/* Budget Summary */}
        <div className="summary-section">
          <BudgetSummary
            year={selectedYear}
            month={viewPeriod === 'monthly' ? selectedMonth : undefined}
            refreshTrigger={refreshTrigger}
          />
        </div>

        {/* Budget List */}
        <div className="budgets-list">
          <h3>Your Budgets</h3>
          
          {loading ? (
            <div className="loading">Loading budgets...</div>
          ) : budgets.length === 0 ? (
            <div className="no-budgets">
              <p>No budgets found for this period. Create your first budget!</p>
            </div>
          ) : (
            <div className="budgets-table">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Period</th>
                    <th>Year</th>
                    {viewPeriod === 'monthly' && <th>Month</th>}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {budgets.map((budget) => (
                    <tr key={budget._id}>
                      <td>
                        <span className={`category-tag category-${budget.category.toLowerCase()}`}>
                          {budget.category}
                        </span>
                      </td>
                      <td className="amount">{formatCurrency(budget.amount)}</td>
                      <td>
                        <span className={`period-tag period-${budget.period}`}>
                          {budget.period}
                        </span>
                      </td>
                      <td>{budget.year}</td>
                      {viewPeriod === 'monthly' && (
                        <td>
                          {budget.month ? 
                            new Date(budget.year, budget.month - 1).toLocaleString('default', { month: 'long' }) 
                            : 'All Year'
                          }
                        </td>
                      )}
                      <td>
                        <div className="actions">
                          <button 
                            onClick={() => handleEditClick(budget)}
                            className="edit-btn"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteBudget(budget._id)}
                            className="delete-btn"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Budgets;
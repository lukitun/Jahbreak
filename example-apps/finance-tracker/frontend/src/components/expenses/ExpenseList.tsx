import React, { useState, useEffect } from 'react';
import { Expense, EXPENSE_CATEGORIES } from '../../types';
import { expensesAPI } from '../../services/api';

interface ExpenseListProps {
  onEdit: (expense: Expense) => void;
  refreshTrigger?: number;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ onEdit, refreshTrigger }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
    searchTerm: '',
  });

  useEffect(() => {
    fetchExpenses();
  }, [refreshTrigger]);

  useEffect(() => {
    applyFilters();
  }, [expenses, filters]);

  const fetchExpenses = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await expensesAPI.getAll();
      setExpenses(data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...expenses];

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(expense => expense.category === filters.category);
    }

    // Date range filter
    if (filters.startDate) {
      filtered = filtered.filter(expense => 
        new Date(expense.date) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(expense => 
        new Date(expense.date) <= new Date(filters.endDate)
      );
    }

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(expense =>
        expense.description?.toLowerCase().includes(searchLower) ||
        expense.category.toLowerCase().includes(searchLower)
      );
    }

    setFilteredExpenses(filtered);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleDelete = async (expenseId: string) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await expensesAPI.delete(expenseId);
      setExpenses(expenses.filter(expense => expense._id !== expenseId));
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete expense');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (loading) {
    return <div className="loading">Loading expenses...</div>;
  }

  return (
    <div className="expense-list">
      <div className="list-header">
        <h3>Your Expenses</h3>
        <div className="expense-summary">
          <span>Total: {filteredExpenses.length} expenses</span>
          <span>
            Amount: {formatCurrency(
              filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0),
              'USD'
            )}
          </span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Filters */}
      <div className="filters">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="searchTerm">Search:</label>
            <input
              type="text"
              id="searchTerm"
              name="searchTerm"
              value={filters.searchTerm}
              onChange={handleFilterChange}
              placeholder="Search description or category..."
            />
          </div>

          <div className="filter-group">
            <label htmlFor="category">Category:</label>
            <select
              id="category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="startDate">From:</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="endDate">To:</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>

          <button 
            onClick={() => setFilters({ category: '', startDate: '', endDate: '', searchTerm: '' })}
            className="clear-filters-btn"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Expense Table */}
      {filteredExpenses.length === 0 ? (
        <div className="no-expenses">
          {expenses.length === 0 ? 'No expenses found. Add your first expense!' : 'No expenses match your filters.'}
        </div>
      ) : (
        <div className="expenses-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Receipt</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => (
                <tr key={expense._id}>
                  <td>{formatDate(expense.date)}</td>
                  <td>
                    <span className={`category-tag category-${expense.category.toLowerCase()}`}>
                      {expense.category}
                    </span>
                  </td>
                  <td>{expense.description || '-'}</td>
                  <td className="amount">
                    {formatCurrency(expense.amount, expense.currency)}
                  </td>
                  <td>
                    {expense.receiptImage ? (
                      <a href={expense.receiptImage} target="_blank" rel="noopener noreferrer">
                        View Receipt
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <div className="actions">
                      <button 
                        onClick={() => onEdit(expense)}
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(expense._id)}
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
  );
};

export default ExpenseList;
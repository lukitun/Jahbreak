import React, { useState } from 'react';
import { EXPENSE_CATEGORIES, Budget } from '../../types';

interface BudgetFormProps {
  onSubmit: (budgetData: {
    category: string;
    amount: number;
    period: 'monthly' | 'yearly';
    year: number;
    month?: number;
  }) => Promise<void>;
  onCancel?: () => void;
  initialData?: Budget;
  isEditing?: boolean;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData, 
  isEditing = false 
}) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [formData, setFormData] = useState({
    category: initialData?.category || 'Food',
    amount: initialData?.amount?.toString() || '',
    period: initialData?.period || 'monthly' as 'monthly' | 'yearly',
    year: initialData?.year || currentYear,
    month: initialData?.month || currentMonth,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'year' || name === 'month' ? parseInt(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData = {
        category: formData.category,
        amount: parseFloat(formData.amount),
        period: formData.period,
        year: formData.year,
        ...(formData.period === 'monthly' && { month: formData.month }),
      };

      await onSubmit(submitData);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to save budget');
    } finally {
      setLoading(false);
    }
  };

  const generateYearOptions = () => {
    const years = [];
    for (let year = currentYear - 1; year <= currentYear + 5; year++) {
      years.push(year);
    }
    return years;
  };

  const generateMonthOptions = () => {
    return [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
  };

  return (
    <div className="budget-form">
      <h3>{isEditing ? 'Edit Budget' : 'Create New Budget'}</h3>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category:</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={loading || isEditing} // Don't allow category change when editing
            >
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="amount">Budget Amount:</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="period">Period:</label>
            <select
              id="period"
              name="period"
              value={formData.period}
              onChange={handleChange}
              disabled={loading || isEditing} // Don't allow period change when editing
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="year">Year:</label>
            <select
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              disabled={loading || isEditing} // Don't allow year change when editing
            >
              {generateYearOptions().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {formData.period === 'monthly' && (
            <div className="form-group">
              <label htmlFor="month">Month:</label>
              <select
                id="month"
                name="month"
                value={formData.month}
                onChange={handleChange}
                disabled={loading || isEditing} // Don't allow month change when editing
              >
                {generateMonthOptions().map((month, index) => (
                  <option key={month} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Saving...' : (isEditing ? 'Update Budget' : 'Create Budget')}
          </button>
          
          {onCancel && (
            <button type="button" onClick={onCancel} className="cancel-btn">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default BudgetForm;
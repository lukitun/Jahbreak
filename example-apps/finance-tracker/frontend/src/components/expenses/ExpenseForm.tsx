import React, { useState } from 'react';
import { EXPENSE_CATEGORIES, CURRENCIES, Expense } from '../../types';

interface ExpenseFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: Expense;
  isEditing?: boolean;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData, 
  isEditing = false 
}) => {
  const [formData, setFormData] = useState({
    amount: initialData?.amount?.toString() || '',
    category: initialData?.category || 'Food',
    description: initialData?.description || '',
    date: initialData?.date?.split('T')[0] || new Date().toISOString().split('T')[0],
    currency: initialData?.currency || 'USD',
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      setReceiptFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('amount', formData.amount);
      submitData.append('category', formData.category);
      submitData.append('description', formData.description);
      submitData.append('date', formData.date);
      submitData.append('currency', formData.currency);
      
      if (receiptFile) {
        submitData.append('receipt', receiptFile);
      }

      await onSubmit(submitData);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="expense-form">
      <h3>{isEditing ? 'Edit Expense' : 'Add New Expense'}</h3>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="amount">Amount:</label>
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

          <div className="form-group">
            <label htmlFor="currency">Currency:</label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              disabled={loading}
            >
              {CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category:</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={loading}
            >
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Optional description..."
            disabled={loading}
            rows={3}
          />
        </div>

        {!isEditing && (
          <div className="form-group">
            <label htmlFor="receipt">Receipt Image (optional):</label>
            <input
              type="file"
              id="receipt"
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
            />
            <small>Max file size: 5MB. Accepted formats: JPG, PNG, GIF</small>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Saving...' : (isEditing ? 'Update Expense' : 'Add Expense')}
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

export default ExpenseForm;
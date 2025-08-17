import React, { useState } from 'react';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseList from '../components/expenses/ExpenseList';
import { expensesAPI } from '../services/api';
import { Expense, BudgetAlert } from '../types';

const Expenses: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [budgetAlert, setBudgetAlert] = useState<BudgetAlert | null>(null);

  const handleAddExpense = async (formData: FormData) => {
    try {
      const response = await expensesAPI.create(formData);
      
      // Show budget alert if present
      if (response.budgetAlert) {
        setBudgetAlert(response.budgetAlert);
        setTimeout(() => setBudgetAlert(null), 5000); // Hide after 5 seconds
      }
      
      setShowForm(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      throw error;
    }
  };

  const handleEditExpense = async (formData: FormData) => {
    if (!editingExpense) return;

    try {
      // Convert FormData to regular object for update
      const updateData: Partial<Expense> = {
        amount: parseFloat(formData.get('amount') as string),
        category: formData.get('category') as string,
        description: formData.get('description') as string,
        date: formData.get('date') as string,
        currency: formData.get('currency') as string,
      };

      await expensesAPI.update(editingExpense._id, updateData);
      setEditingExpense(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      throw error;
    }
  };

  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(false);
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  const handleCancelAdd = () => {
    setShowForm(false);
  };

  return (
    <div className="expenses-page">
      <div className="page-header">
        <h2>Expense Management</h2>
        <button 
          onClick={() => {
            setShowForm(true);
            setEditingExpense(null);
          }}
          className="add-expense-btn"
          disabled={showForm || editingExpense}
        >
          Add New Expense
        </button>
      </div>

      {/* Budget Alert */}
      {budgetAlert && (
        <div className={`budget-alert ${budgetAlert.percentage >= 100 ? 'alert-danger' : 'alert-warning'}`}>
          <strong>Budget Alert:</strong> {budgetAlert.message} ({budgetAlert.percentage.toFixed(1)}%)
          <button 
            onClick={() => setBudgetAlert(null)}
            className="close-alert"
          >
            ×
          </button>
        </div>
      )}

      <div className="expenses-content">
        {/* Add/Edit Form */}
        {(showForm || editingExpense) && (
          <div className="form-section">
            <ExpenseForm
              onSubmit={editingExpense ? handleEditExpense : handleAddExpense}
              onCancel={editingExpense ? handleCancelEdit : handleCancelAdd}
              initialData={editingExpense || undefined}
              isEditing={!!editingExpense}
            />
          </div>
        )}

        {/* Expense List */}
        <div className="list-section">
          <ExpenseList 
            onEdit={handleEditClick}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>
    </div>
  );
};

export default Expenses;
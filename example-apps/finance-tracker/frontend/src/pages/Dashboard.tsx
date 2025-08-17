import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { expensesAPI } from '../services/api';
import { Expense } from '../types';
import ExpenseChart from '../components/dashboard/ExpenseChart';
import BudgetSummary from '../components/budgets/BudgetSummary';

const Dashboard: React.FC = () => {
  const { state } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedChart, setSelectedChart] = useState<'category' | 'monthly' | 'daily'>('category');
  const [dateFilter, setDateFilter] = useState({
    period: 'month' as 'week' | 'month' | 'year',
    customStart: '',
    customEnd: '',
  });

  useEffect(() => {
    fetchDashboardData();
  }, [dateFilter]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      // Calculate date range based on selected period
      const now = new Date();
      let startDate: Date;
      let endDate = now;

      switch (dateFilter.period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Use custom dates if provided
      if (dateFilter.customStart && dateFilter.customEnd) {
        startDate = new Date(dateFilter.customStart);
        endDate = new Date(dateFilter.customEnd);
      }

      const allExpenses = await expensesAPI.getAll({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });

      setExpenses(allExpenses);
      
      // Get recent expenses (last 10)
      const recent = allExpenses
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);
      setRecentExpenses(recent);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const categoryTotals: { [key: string]: number } = {};
    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    
    const topCategory = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)[0];

    const averageExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;

    return {
      totalExpenses,
      expenseCount: expenses.length,
      averageExpense,
      topCategory: topCategory ? { category: topCategory[0], amount: topCategory[1] } : null,
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const stats = calculateStats();
  const currentDate = new Date();

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Welcome back, {state.user?.firstName}!</h2>
        <p>Here's your financial overview</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Period Filter */}
      <div className="period-filter">
        <div className="filter-buttons">
          <button 
            className={dateFilter.period === 'week' ? 'active' : ''}
            onClick={() => setDateFilter({ ...dateFilter, period: 'week', customStart: '', customEnd: '' })}
          >
            This Week
          </button>
          <button 
            className={dateFilter.period === 'month' ? 'active' : ''}
            onClick={() => setDateFilter({ ...dateFilter, period: 'month', customStart: '', customEnd: '' })}
          >
            This Month
          </button>
          <button 
            className={dateFilter.period === 'year' ? 'active' : ''}
            onClick={() => setDateFilter({ ...dateFilter, period: 'year', customStart: '', customEnd: '' })}
          >
            This Year
          </button>
        </div>
        
        <div className="custom-date-range">
          <input
            type="date"
            value={dateFilter.customStart}
            onChange={(e) => setDateFilter({ ...dateFilter, customStart: e.target.value })}
            placeholder="Start date"
          />
          <input
            type="date"
            value={dateFilter.customEnd}
            onChange={(e) => setDateFilter({ ...dateFilter, customEnd: e.target.value })}
            placeholder="End date"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Expenses</h3>
          <div className="stat-value">{formatCurrency(stats.totalExpenses)}</div>
          <div className="stat-label">{expenses.length} transactions</div>
        </div>

        <div className="stat-card">
          <h3>Average Expense</h3>
          <div className="stat-value">{formatCurrency(stats.averageExpense)}</div>
          <div className="stat-label">per transaction</div>
        </div>

        <div className="stat-card">
          <h3>Top Category</h3>
          <div className="stat-value">
            {stats.topCategory ? stats.topCategory.category : 'None'}
          </div>
          <div className="stat-label">
            {stats.topCategory ? formatCurrency(stats.topCategory.amount) : 'No expenses'}
          </div>
        </div>

        <div className="stat-card">
          <h3>Transaction Count</h3>
          <div className="stat-value">{stats.expenseCount}</div>
          <div className="stat-label">
            {dateFilter.period === 'week' ? 'this week' : 
             dateFilter.period === 'month' ? 'this month' : 'this year'}
          </div>
        </div>
      </div>

      {/* Budget Summary */}
      <div className="dashboard-section">
        <h3>Budget Overview</h3>
        <BudgetSummary 
          year={currentDate.getFullYear()} 
          month={currentDate.getMonth() + 1}
        />
      </div>

      {/* Charts Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3>Expense Analysis</h3>
          <div className="chart-controls">
            <button 
              className={selectedChart === 'category' ? 'active' : ''}
              onClick={() => setSelectedChart('category')}
            >
              By Category
            </button>
            <button 
              className={selectedChart === 'monthly' ? 'active' : ''}
              onClick={() => setSelectedChart('monthly')}
            >
              Monthly Trend
            </button>
            <button 
              className={selectedChart === 'daily' ? 'active' : ''}
              onClick={() => setSelectedChart('daily')}
            >
              Daily Trend
            </button>
          </div>
        </div>
        
        <div className="chart-section">
          <ExpenseChart expenses={expenses} chartType={selectedChart} />
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="dashboard-section">
        <h3>Recent Expenses</h3>
        {recentExpenses.length === 0 ? (
          <div className="no-data">
            <p>No recent expenses found. Start tracking your expenses!</p>
          </div>
        ) : (
          <div className="recent-expenses">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentExpenses.map((expense) => (
                  <tr key={expense._id}>
                    <td>{formatDate(expense.date)}</td>
                    <td>
                      <span className={`category-tag category-${expense.category.toLowerCase()}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td>{expense.description || '-'}</td>
                    <td className="amount">{formatCurrency(expense.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
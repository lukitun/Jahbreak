import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider } from '../contexts/AuthContext';
import Dashboard from '../pages/Dashboard';
import { expensesAPI } from '../services/api';

// Mock the API
jest.mock('../services/api', () => ({
  expensesAPI: {
    getAll: jest.fn(),
  },
}));

// Mock child components
jest.mock('../components/dashboard/ExpenseChart', () => {
  return function MockExpenseChart({ expenses, chartType }: any) {
    return (
      <div data-testid="expense-chart">
        <div data-testid="chart-type">{chartType}</div>
        <div data-testid="expense-count">{expenses.length}</div>
      </div>
    );
  };
});

jest.mock('../components/budgets/BudgetSummary', () => {
  return function MockBudgetSummary({ year, month }: any) {
    return (
      <div data-testid="budget-summary">
        <div data-testid="budget-year">{year}</div>
        <div data-testid="budget-month">{month}</div>
      </div>
    );
  };
});

// Mock AuthContext with authenticated user
const mockAuthState = {
  user: {
    id: 'user123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe'
  },
  token: 'mock-token',
  isAuthenticated: true
};

jest.mock('../contexts/AuthContext', () => ({
  ...jest.requireActual('../contexts/AuthContext'),
  useAuth: () => ({
    state: mockAuthState,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    enable2FA: jest.fn(),
    verify2FA: jest.fn(),
  }),
}));

describe('Dashboard Component', () => {
  const mockExpenses = [
    {
      _id: '1',
      amount: 50.00,
      category: 'Food',
      date: '2024-01-15',
      description: 'Lunch',
      currency: 'USD'
    },
    {
      _id: '2',
      amount: 30.00,
      category: 'Transportation',
      date: '2024-01-14',
      description: 'Bus fare',
      currency: 'USD'
    },
    {
      _id: '3',
      amount: 100.00,
      category: 'Food',
      date: '2024-01-13',
      description: 'Groceries',
      currency: 'USD'
    },
    {
      _id: '4',
      amount: 25.00,
      category: 'Entertainment',
      date: '2024-01-12',
      description: 'Movie',
      currency: 'USD'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (expensesAPI.getAll as jest.Mock).mockResolvedValue(mockExpenses);
  });

  test('renders welcome message with user name', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Welcome back, John!')).toBeInTheDocument();
    });
  });

  test('displays loading state initially', () => {
    (expensesAPI.getAll as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<Dashboard />);

    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  test('fetches and displays expense data', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(expensesAPI.getAll).toHaveBeenCalled();
    });

    // Check if stats are calculated correctly
    expect(screen.getByText('$205.00')).toBeInTheDocument(); // Total expenses
    expect(screen.getByText('4 transactions')).toBeInTheDocument();
  });

  test('calculates stats correctly', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      // Total expenses: 50 + 30 + 100 + 25 = 205
      expect(screen.getByText('$205.00')).toBeInTheDocument();
      
      // Average expense: 205 / 4 = 51.25
      expect(screen.getByText('$51.25')).toBeInTheDocument();
      
      // Top category should be Food (50 + 100 = 150)
      expect(screen.getByText('Food')).toBeInTheDocument();
      expect(screen.getByText('$150.00')).toBeInTheDocument();
      
      // Transaction count
      expect(screen.getByText('4')).toBeInTheDocument();
    });
  });

  test('displays recent expenses table', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Recent Expenses')).toBeInTheDocument();
      expect(screen.getByText('Lunch')).toBeInTheDocument();
      expect(screen.getByText('Bus fare')).toBeInTheDocument();
      expect(screen.getByText('Groceries')).toBeInTheDocument();
      expect(screen.getByText('Movie')).toBeInTheDocument();
    });
  });

  test('handles period filter changes', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('This Month')).toBeInTheDocument();
    });

    // Click on "This Week" filter
    fireEvent.click(screen.getByText('This Week'));

    await waitFor(() => {
      expect(expensesAPI.getAll).toHaveBeenCalledTimes(2); // Initial + filter change
    });
  });

  test('handles custom date range', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('')).toBeInTheDocument();
    });

    const startDateInput = screen.getAllByDisplayValue('')[0];
    const endDateInput = screen.getAllByDisplayValue('')[1];

    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2024-01-31' } });

    await waitFor(() => {
      expect(expensesAPI.getAll).toHaveBeenCalledWith({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });
    });
  });

  test('changes chart type', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-type')).toHaveTextContent('category');
    });

    // Click on "Monthly Trend" button
    fireEvent.click(screen.getByText('Monthly Trend'));

    await waitFor(() => {
      expect(screen.getByTestId('chart-type')).toHaveTextContent('monthly');
    });

    // Click on "Daily Trend" button
    fireEvent.click(screen.getByText('Daily Trend'));

    await waitFor(() => {
      expect(screen.getByTestId('chart-type')).toHaveTextContent('daily');
    });
  });

  test('displays no data message when no expenses', async () => {
    (expensesAPI.getAll as jest.Mock).mockResolvedValue([]);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No recent expenses found. Start tracking your expenses!')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    (expensesAPI.getAll as jest.Mock).mockRejectedValue({
      response: { data: { message: 'Server error' } }
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  test('handles API error without response data', async () => {
    (expensesAPI.getAll as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch dashboard data')).toBeInTheDocument();
    });
  });

  test('formats currency correctly', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      // Check if amounts are formatted as USD currency
      expect(screen.getByText('$205.00')).toBeInTheDocument();
      expect(screen.getByText('$51.25')).toBeInTheDocument();
      expect(screen.getByText('$150.00')).toBeInTheDocument();
    });
  });

  test('formats dates correctly in recent expenses', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      // Dates should be formatted using toLocaleDateString
      const dateElements = screen.getAllByText(/\d+\/\d+\/\d+/);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  test('displays budget summary component', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('budget-summary')).toBeInTheDocument();
      expect(screen.getByTestId('budget-year')).toHaveTextContent('2024');
      expect(screen.getByTestId('budget-month')).toHaveTextContent(/\d+/);
    });
  });

  test('passes correct data to ExpenseChart', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('expense-chart')).toBeInTheDocument();
      expect(screen.getByTestId('expense-count')).toHaveTextContent('4');
    });
  });

  test('calculates correct stats with no top category', async () => {
    (expensesAPI.getAll as jest.Mock).mockResolvedValue([]);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('$0.00')).toBeInTheDocument(); // Total expenses
      expect(screen.getByText('0 transactions')).toBeInTheDocument();
      expect(screen.getByText('None')).toBeInTheDocument(); // Top category
      expect(screen.getByText('No expenses')).toBeInTheDocument();
    });
  });

  test('applies active class to period filter buttons', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      const monthButton = screen.getByText('This Month');
      expect(monthButton).toHaveClass('active');
    });

    fireEvent.click(screen.getByText('This Week'));

    await waitFor(() => {
      const weekButton = screen.getByText('This Week');
      const monthButton = screen.getByText('This Month');
      expect(weekButton).toHaveClass('active');
      expect(monthButton).not.toHaveClass('active');
    });
  });

  test('applies active class to chart control buttons', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      const categoryButton = screen.getByText('By Category');
      expect(categoryButton).toHaveClass('active');
    });

    fireEvent.click(screen.getByText('Monthly Trend'));

    await waitFor(() => {
      const monthlyButton = screen.getByText('Monthly Trend');
      const categoryButton = screen.getByText('By Category');
      expect(monthlyButton).toHaveClass('active');
      expect(categoryButton).not.toHaveClass('active');
    });
  });
});
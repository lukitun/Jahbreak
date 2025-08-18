import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExpenseChart from '../components/dashboard/ExpenseChart';
import { Expense } from '../types';

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  BarElement: jest.fn(),
  ArcElement: jest.fn(),
  LineElement: jest.fn(),
  PointElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
}));

jest.mock('react-chartjs-2', () => ({
  Bar: ({ data, options }: any) => (
    <div data-testid="bar-chart">
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <div data-testid="chart-options">{JSON.stringify(options)}</div>
    </div>
  ),
  Pie: ({ data, options }: any) => (
    <div data-testid="pie-chart">
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <div data-testid="chart-options">{JSON.stringify(options)}</div>
    </div>
  ),
  Line: ({ data, options }: any) => (
    <div data-testid="line-chart">
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <div data-testid="chart-options">{JSON.stringify(options)}</div>
    </div>
  ),
}));

describe('ExpenseChart Component', () => {
  const mockExpenses: Expense[] = [
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

  test('renders category chart correctly', () => {
    render(<ExpenseChart expenses={mockExpenses} chartType="category" />);
    
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    
    const chartData = JSON.parse(screen.getByTestId('chart-data').textContent || '{}');
    expect(chartData.labels).toContain('Food');
    expect(chartData.labels).toContain('Transportation');
    expect(chartData.labels).toContain('Entertainment');
    
    // Food should have total of 150 (50 + 100)
    const foodIndex = chartData.labels.indexOf('Food');
    expect(chartData.datasets[0].data[foodIndex]).toBe(150);
  });

  test('renders monthly chart correctly', () => {
    render(<ExpenseChart expenses={mockExpenses} chartType="monthly" />);
    
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    
    const chartData = JSON.parse(screen.getByTestId('chart-data').textContent || '{}');
    expect(chartData.labels).toContain('Jan 2024');
    expect(chartData.datasets[0].label).toBe('Monthly Expenses');
  });

  test('renders daily chart correctly', () => {
    render(<ExpenseChart expenses={mockExpenses} chartType="daily" />);
    
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    
    const chartData = JSON.parse(screen.getByTestId('chart-data').textContent || '{}');
    expect(chartData.datasets[0].label).toBe('Daily Expenses');
  });

  test('displays no data message when expenses array is empty', () => {
    render(<ExpenseChart expenses={[]} chartType="category" />);
    
    expect(screen.getByText('No expense data available for chart')).toBeInTheDocument();
    expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();
  });

  test('generates correct colors for categories', () => {
    render(<ExpenseChart expenses={mockExpenses} chartType="category" />);
    
    const chartData = JSON.parse(screen.getByTestId('chart-data').textContent || '{}');
    const backgroundColor = chartData.datasets[0].backgroundColor;
    
    expect(backgroundColor).toHaveLength(3); // 3 unique categories
    expect(backgroundColor[0]).toMatch(/^#[0-9A-F]{6}$/i); // Valid hex color
  });

  test('calculates category totals correctly', () => {
    render(<ExpenseChart expenses={mockExpenses} chartType="category" />);
    
    const chartData = JSON.parse(screen.getByTestId('chart-data').textContent || '{}');
    const totalExpenses = chartData.datasets[0].data.reduce((sum: number, value: number) => sum + value, 0);
    
    expect(totalExpenses).toBe(205); // 50 + 30 + 100 + 25
  });

  test('formats monthly data correctly', () => {
    const monthlyExpenses: Expense[] = [
      {
        _id: '1',
        amount: 100,
        category: 'Food',
        date: '2023-12-15',
        currency: 'USD'
      },
      {
        _id: '2',
        amount: 200,
        category: 'Food',
        date: '2024-01-15',
        currency: 'USD'
      },
      {
        _id: '3',
        amount: 150,
        category: 'Food',
        date: '2024-01-20',
        currency: 'USD'
      }
    ];

    render(<ExpenseChart expenses={monthlyExpenses} chartType="monthly" />);
    
    const chartData = JSON.parse(screen.getByTestId('chart-data').textContent || '{}');
    
    expect(chartData.labels).toContain('Dec 2023');
    expect(chartData.labels).toContain('Jan 2024');
    
    // January should have 350 (200 + 150)
    const janIndex = chartData.labels.indexOf('Jan 2024');
    expect(chartData.datasets[0].data[janIndex]).toBe(350);
  });

  test('limits daily chart to last 30 days', () => {
    // Create 40 days worth of expenses
    const dailyExpenses: Expense[] = Array.from({ length: 40 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      return {
        _id: `expense_${i}`,
        amount: 10,
        category: 'Food',
        date: date.toISOString().split('T')[0],
        currency: 'USD'
      };
    });

    render(<ExpenseChart expenses={dailyExpenses} chartType="daily" />);
    
    const chartData = JSON.parse(screen.getByTestId('chart-data').textContent || '{}');
    
    // Should only show last 30 days
    expect(chartData.labels.length).toBeLessThanOrEqual(30);
  });

  test('applies correct chart options for tooltip formatting', () => {
    render(<ExpenseChart expenses={mockExpenses} chartType="category" />);
    
    const chartOptions = JSON.parse(screen.getByTestId('chart-options').textContent || '{}');
    
    expect(chartOptions.responsive).toBe(true);
    expect(chartOptions.maintainAspectRatio).toBe(false);
    expect(chartOptions.plugins.tooltip).toBeDefined();
  });

  test('handles different chart types with same data', () => {
    const { rerender } = render(<ExpenseChart expenses={mockExpenses} chartType="category" />);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();

    rerender(<ExpenseChart expenses={mockExpenses} chartType="monthly" />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();

    rerender(<ExpenseChart expenses={mockExpenses} chartType="daily" />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  test('defaults to category chart for invalid chart type', () => {
    render(<ExpenseChart expenses={mockExpenses} chartType={'invalid' as any} />);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });
});
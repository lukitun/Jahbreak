import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Expense } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface ExpenseChartProps {
  expenses: Expense[];
  chartType: 'category' | 'monthly' | 'daily';
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ expenses, chartType }) => {
  const generateColors = (count: number) => {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
      '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
    ];
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  };

  const getCategoryData = () => {
    const categoryTotals: { [key: string]: number } = {};
    
    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    const colors = generateColors(labels.length);

    return {
      labels,
      datasets: [
        {
          label: 'Expenses by Category',
          data,
          backgroundColor: colors,
          borderColor: colors.map(color => color + '80'),
          borderWidth: 1,
        },
      ],
    };
  };

  const getMonthlyData = () => {
    const monthlyTotals: { [key: string]: number } = {};
    
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + expense.amount;
    });

    const sortedMonths = Object.keys(monthlyTotals).sort();
    const data = sortedMonths.map(month => monthlyTotals[month]);

    return {
      labels: sortedMonths.map(month => {
        const [year, monthNum] = month.split('-');
        return new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleString('default', { 
          month: 'short', 
          year: 'numeric' 
        });
      }),
      datasets: [
        {
          label: 'Monthly Expenses',
          data,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          fill: true,
        },
      ],
    };
  };

  const getDailyData = () => {
    const dailyTotals: { [key: string]: number } = {};
    
    expenses.forEach(expense => {
      const date = new Date(expense.date).toISOString().split('T')[0];
      dailyTotals[date] = (dailyTotals[date] || 0) + expense.amount;
    });

    const sortedDates = Object.keys(dailyTotals).sort();
    const last30Days = sortedDates.slice(-30); // Show last 30 days
    const data = last30Days.map(date => dailyTotals[date]);

    return {
      labels: last30Days.map(date => {
        return new Date(date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      }),
      datasets: [
        {
          label: 'Daily Expenses',
          data,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          tension: 0.1,
        },
      ],
    };
  };

  const getChartData = () => {
    switch (chartType) {
      case 'category':
        return getCategoryData();
      case 'monthly':
        return getMonthlyData();
      case 'daily':
        return getDailyData();
      default:
        return getCategoryData();
    }
  };

  const getChartOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const value = context.parsed.y || context.parsed;
              return `${context.label}: $${value.toFixed(2)}`;
            },
          },
        },
      },
    };

    if (chartType === 'category') {
      return {
        ...baseOptions,
        plugins: {
          ...baseOptions.plugins,
          legend: {
            position: 'right' as const,
          },
        },
      };
    }

    return {
      ...baseOptions,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value: any) => `$${value}`,
          },
        },
      },
    };
  };

  const chartData = getChartData();
  const chartOptions = getChartOptions();

  if (expenses.length === 0) {
    return (
      <div className="chart-container">
        <div className="no-data">
          <p>No expense data available for chart</p>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    switch (chartType) {
      case 'category':
        return <Pie data={chartData} options={chartOptions} />;
      case 'monthly':
        return <Line data={chartData} options={chartOptions} />;
      case 'daily':
        return <Bar data={chartData} options={chartOptions} />;
      default:
        return <Pie data={chartData} options={chartOptions} />;
    }
  };

  return (
    <div className="chart-container">
      <div className="chart-wrapper">
        {renderChart()}
      </div>
    </div>
  );
};

export default ExpenseChart;
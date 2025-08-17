import React from 'react';

const SavingsGoals: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Savings Goals</h1>
        <p className="mt-2 text-gray-600">
          Set and track your savings goals with progress visualization.
        </p>
      </div>

      <div className="card p-8 text-center">
        <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Savings Goals</h3>
        <p className="text-gray-600 mb-6">
          Comprehensive savings goal management coming soon. Features will include:
        </p>
        <ul className="text-sm text-gray-600 space-y-2 mb-8">
          <li>• Goal creation with target amounts and dates</li>
          <li>• Progress tracking and visualization</li>
          <li>• Multiple goal categories (Emergency, Vacation, etc.)</li>
          <li>• Contribution and withdrawal logging</li>
          <li>• Goal completion celebrations</li>
        </ul>
        <button className="btn-primary">
          Set Your First Goal
        </button>
      </div>
    </div>
  );
};

export default SavingsGoals;
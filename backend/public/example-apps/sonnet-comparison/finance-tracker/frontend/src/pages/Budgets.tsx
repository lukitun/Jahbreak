import React from 'react';

const Budgets: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
        <p className="mt-2 text-gray-600">
          Create and manage monthly and yearly budgets with smart alerts.
        </p>
      </div>

      <div className="card p-8 text-center">
        <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Budget Management</h3>
        <p className="text-gray-600 mb-6">
          Advanced budget management interface coming soon. Features will include:
        </p>
        <ul className="text-sm text-gray-600 space-y-2 mb-8">
          <li>• Monthly and yearly budget creation</li>
          <li>• Category-specific budget allocation</li>
          <li>• Real-time spending tracking</li>
          <li>• 80% and 100% email alerts</li>
          <li>• Budget vs actual comparisons</li>
        </ul>
        <button className="btn-primary">
          Create Your First Budget
        </button>
      </div>
    </div>
  );
};

export default Budgets;
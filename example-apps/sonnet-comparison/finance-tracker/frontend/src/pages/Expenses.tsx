import React from 'react';

const Expenses: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
        <p className="mt-2 text-gray-600">
          Track and manage your expenses with receipt uploads and categorization.
        </p>
      </div>

      <div className="card p-8 text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Expense Tracking</h3>
        <p className="text-gray-600 mb-6">
          Full expense management interface coming soon. Features will include:
        </p>
        <ul className="text-sm text-gray-600 space-y-2 mb-8">
          <li>• Manual expense entry with categories</li>
          <li>• Receipt photo upload and OCR</li>
          <li>• Payment method tracking</li>
          <li>• Expense filtering and search</li>
          <li>• Recurring expense management</li>
        </ul>
        <button className="btn-primary">
          Add Your First Expense
        </button>
      </div>
    </div>
  );
};

export default Expenses;
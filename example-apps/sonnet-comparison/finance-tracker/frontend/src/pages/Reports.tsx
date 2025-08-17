import React from 'react';

const Reports: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="mt-2 text-gray-600">
          Generate detailed financial reports with charts and export options.
        </p>
      </div>

      <div className="card p-8 text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Financial Reports</h3>
        <p className="text-gray-600 mb-6">
          Advanced reporting and analytics coming soon. Features will include:
        </p>
        <ul className="text-sm text-gray-600 space-y-2 mb-8">
          <li>• Monthly spending breakdown charts</li>
          <li>• Category-wise pie charts</li>
          <li>• Income vs expenses line graphs</li>
          <li>• Budget performance analysis</li>
          <li>• CSV and PDF export options</li>
        </ul>
        <button className="btn-primary">
          Generate Report
        </button>
      </div>
    </div>
  );
};

export default Reports;
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
          <div className="space-y-4">
            <div>
              <label className="label">First Name</label>
              <div className="input bg-gray-50">{user?.firstName}</div>
            </div>
            <div>
              <label className="label">Last Name</label>
              <div className="input bg-gray-50">{user?.lastName}</div>
            </div>
            <div>
              <label className="label">Email</label>
              <div className="input bg-gray-50">{user?.email}</div>
            </div>
            <div>
              <label className="label">Preferred Currency</label>
              <div className="input bg-gray-50">{user?.preferredCurrency}</div>
            </div>
            <button className="btn-primary">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Security Settings */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">
                  {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <div className={`w-12 h-6 rounded-full ${user?.twoFactorEnabled ? 'bg-green-500' : 'bg-gray-300'} relative transition-colors`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${user?.twoFactorEnabled ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
              </div>
            </div>
            
            <button className="btn-secondary w-full">
              Change Password
            </button>
            
            <button className="btn-secondary w-full">
              {user?.twoFactorEnabled ? 'Disable' : 'Enable'} Two-Factor Auth
            </button>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
        <div className="space-y-4">
          <button className="btn-secondary">
            Export Data
          </button>
          <button className="btn-danger">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
import React from 'react';

const AdminSettings = () => {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Settings</h2>
          <p className="text-sm text-slate-500 mt-1">General admin settings and configuration.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Account Settings</h3>
          <p className="text-sm text-slate-500">Update admin user preferences, email notifications and password policies.</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">System Settings</h3>
          <p className="text-sm text-slate-500">Configure global dashboard behavior and manage app integrations.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;

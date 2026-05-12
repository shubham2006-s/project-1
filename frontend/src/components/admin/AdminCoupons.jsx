import React from 'react';

const AdminCoupons = () => {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Coupons</h2>
          <p className="text-sm text-slate-500 mt-1">Manage discount codes and promotions.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
        <p className="text-lg font-semibold text-slate-900">Coupons area coming soon.</p>
        <p className="mt-3 text-sm text-slate-500">In a real project this section would include coupon creation, expiration settings, and usage tracking.</p>
      </div>
    </div>
  );
};

export default AdminCoupons;

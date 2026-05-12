import React, { useEffect, useState } from 'react';
import API from '../../util/api';

const AnalyticsCard = ({ label, value, accent }) => (
  <div className={`rounded-3xl border ${accent} p-6 shadow-lg shadow-slate-900/5 bg-white/90`}>
    <p className="text-sm font-semibold text-slate-500 uppercase tracking-[0.18em]">{label}</p>
    <p className="mt-4 text-3xl font-semibold text-slate-900">{value}</p>
  </div>
);

const AdminAnalytics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await API.get('/api/admin/dashboard');
        setMetrics(response.data);
      } catch (error) {
        console.error('Error fetching analytics metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Analytics</h2>
          <p className="text-sm text-slate-500 mt-1">Overview of admin performance metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <AnalyticsCard label="Total Users" value={metrics?.totalUsers ?? 0} accent="border-cyan-300/60" />
        <AnalyticsCard label="Total Products" value={metrics?.totalProducts ?? 0} accent="border-violet-300/60" />
        <AnalyticsCard label="Total Orders" value={metrics?.totalOrders ?? 0} accent="border-emerald-300/60" />
        <AnalyticsCard label="Total Revenue" value={`$${metrics?.totalRevenue?.toLocaleString() ?? 0}`} accent="border-amber-300/60" />
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Status Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {metrics?.orderStatusBreakdown?.length ? (
            metrics.orderStatusBreakdown.map((item) => (
              <div key={item._id} className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">{item._id}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{item.count}</p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-slate-500">No status data available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;

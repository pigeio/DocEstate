import React, { useState, useEffect } from 'react';
import api, { formatCurrency } from '../api';
import { Users, Briefcase, ArchiveRestore, IndianRupee } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState({
    total_people: 0,
    active_services: 0,
    closed_services: 0,
    total_advance: 0,
    total_complete: 0,
    total_receipts: 0,
    recent_services: [],
    recent_cashflows: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div></div>;

  const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="card-container flex items-center p-6 group hover:border-zinc-700 transition duration-300">
      <div className={`p-4 rounded-xl ${colorClass} mr-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-400 mb-1">{title}</h3>
        <p className="text-3xl font-black tracking-tight text-black dark:text-white">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black text-black dark:text-white tracking-tight mb-2">Dashboard</h1>
        <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Welcome back. Here is the overview of bridge operations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total People" value={data.total_people} icon={Users} colorClass="bg-blue-600 shadow-blue-900/50" />
        <StatCard title="Active Services" value={data.active_services} icon={Briefcase} colorClass="bg-emerald-600 shadow-emerald-900/50" />
        <StatCard title="Closed Services" value={data.closed_services} icon={ArchiveRestore} colorClass="bg-zinc-600 shadow-zinc-900/50" />
        <StatCard title="Total Receipts" value={formatCurrency(data.total_receipts)} icon={IndianRupee} colorClass="bg-indigo-600 shadow-indigo-900/50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Services */}
        <div className="card-container p-0 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Recent Services</h2>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full">
              <thead className="bg-zinc-900/80">
                <tr>
                  <th className="table-header w-1/4">ID</th>
                  <th className="table-header">Person</th>
                  <th className="table-header">Type</th>
                  <th className="table-header text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {data.recent_services?.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-8 text-zinc-800 font-semibold dark:text-zinc-500 text-sm">No recent services.</td></tr>
                ) : (
                  data.recent_services?.map(srv => (
                    <tr key={srv.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="table-cell font-mono font-bold text-xs text-indigo-700 dark:text-indigo-400">{srv.id}</td>
                      <td className="table-cell font-bold text-black dark:text-zinc-200">
                        {srv.Person?.name} <span className="text-xs text-zinc-800 font-semibold ml-1 dark:text-zinc-400">({srv.person_id})</span>
                      </td>
                      <td className="table-cell text-zinc-900 font-bold dark:text-zinc-400">{srv.type}</td>
                      <td className="table-cell text-right">
                        <span className={
                          srv.status === 'Work Initiated' ? 'badge-initiated' : 
                          srv.status === 'Reviewing' ? 'badge-reviewing' : 
                          'badge-closed'
                        }>{srv.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Cash Flows */}
        <div className="card-container p-0 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Recent Cash Flows</h2>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full">
              <thead className="bg-zinc-900/80">
                <tr>
                  <th className="table-header w-1/4">ID</th>
                  <th className="table-header">Person</th>
                  <th className="table-header">Type</th>
                  <th className="table-header text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {data.recent_cashflows?.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-8 text-zinc-800 font-semibold dark:text-zinc-500 text-sm">No recent cash flows.</td></tr>
                ) : (
                  data.recent_cashflows?.map(cf => (
                    <tr key={cf.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="table-cell font-mono font-bold text-xs text-indigo-700 dark:text-indigo-400">{cf.id}</td>
                      <td className="table-cell font-bold text-black dark:text-zinc-200">
                        {cf.Person?.name} <span className="text-xs text-zinc-800 font-semibold ml-1 dark:text-zinc-400">({cf.person_id})</span>
                      </td>
                      <td className="table-cell">
                        <span className={cf.type === 'advance' ? 'badge-advance' : 'badge-complete'}>{cf.type}</span>
                      </td>
                      <td className="table-cell text-right font-medium text-emerald-400">
                        {formatCurrency(cf.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

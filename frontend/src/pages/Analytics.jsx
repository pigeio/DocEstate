import React, { useState, useEffect } from 'react';
import api, { formatCurrency } from '../api';
import { TrendingUp, Users, CheckCircle, BarChart3, Briefcase } from 'lucide-react';

export default function Analytics() {
  const [agentData, setAgentData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/agents');
        if (res.data.success) {
          // Sort by revenue descending
          setAgentData(res.data.data.sort((a, b) => b.total_revenue - a.total_revenue));
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center">
          <TrendingUp className="mr-3 text-indigo-500" />
          Analytics Dashboard
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Track business performance across all agents.</p>
      </div>

      <div className="card-container p-6">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center">
          <BarChart3 className="mr-2 text-emerald-500" size={20} />
          Agent Leaderboard
        </h2>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
        ) : agentData.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">No agent data available yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {agentData.map((agent, index) => (
              <div 
                key={agent.agent} 
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {/* Ranking Medals */}
                {index === 0 && <div className="absolute -right-2 -top-2 w-16 h-16 bg-amber-400/20 text-amber-500 rounded-full flex items-center justify-center transform -rotate-12"><span className="text-2xl font-black mt-2 mr-2">#1</span></div>}
                {index === 1 && <div className="absolute -right-2 -top-2 w-16 h-16 bg-zinc-300/20 text-zinc-400 rounded-full flex items-center justify-center transform -rotate-12"><span className="text-2xl font-black mt-2 mr-2">#2</span></div>}
                {index === 2 && <div className="absolute -right-2 -top-2 w-16 h-16 bg-orange-400/20 text-orange-500 rounded-full flex items-center justify-center transform -rotate-12"><span className="text-2xl font-black mt-2 mr-2">#3</span></div>}

                <div className="flex items-center mb-5">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg mr-4 border border-indigo-100 dark:border-indigo-800">
                    {agent.agent.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white truncate pr-10">{agent.agent}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Sales Agent</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center text-zinc-600 dark:text-zinc-400 text-sm font-medium">
                      <Users size={16} className="mr-2" /> Intakes
                    </div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{agent.total_intakes}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center text-zinc-600 dark:text-zinc-400 text-sm font-medium">
                      <Briefcase size={16} className="mr-2 text-blue-500" /> Active Files
                    </div>
                    <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">{agent.active_files}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
                    <div className="flex items-center text-emerald-700 dark:text-emerald-500 text-sm font-bold">
                      <TrendingUp size={16} className="mr-2" /> Revenue
                    </div>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-lg">
                      {formatCurrency(agent.total_revenue)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

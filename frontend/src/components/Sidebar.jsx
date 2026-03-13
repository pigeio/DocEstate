import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, IndianRupee, Plus, FileSpreadsheet, LogOut, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'H Cloud', path: '/hcloud', icon: <Users size={20} /> },
    { name: 'Services', path: '/services', icon: <Briefcase size={20} /> },
    { name: 'C Flow', path: '/cflow', icon: <IndianRupee size={20} /> },
    { name: 'Analytics', path: '/analytics', icon: <TrendingUp size={20} /> },
    { name: '+ New Client', path: '/intake', icon: <FileSpreadsheet size={20} />, isPrimary: true },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-r border-zinc-200 dark:border-zinc-900 border-opacity-50 shadow-2xl z-20 transition-colors duration-300">
      <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-300">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/30">
          <span className="text-white font-bold text-lg leading-none tracking-tighter">B</span>
        </div>
        <span className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white bg-clip-text transition-colors duration-300">BridgeDesk</span>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-zinc-200 dark:bg-zinc-800/80 text-black dark:text-white shadow-md border border-zinc-300 dark:border-zinc-700/50 relative overflow-hidden font-bold'
                  : 'text-zinc-900 font-semibold dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-900/50 hover:text-black dark:hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                )}
                <span className={`mr-3 transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : (item.isPrimary ? 'text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300' : 'group-hover:text-zinc-700 dark:group-hover:text-zinc-300')}`}>
                  {item.icon}
                </span>
                <span className={`font-medium text-sm ${item.isPrimary ? 'text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300' : ''}`}>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
      
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-900 transition-colors duration-300">
        <div className="flex items-center px-4 py-3 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800 mb-3 transition-colors duration-300">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium mr-3 shadow-md shadow-indigo-500/20">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-black dark:text-zinc-100 truncate transition-colors duration-300">{user?.name || 'Admin Staff'}</p>
            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-400 truncate">{user?.role === 'admin' ? 'Administrator' : 'Agent Workspace'}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center py-2 text-sm font-bold text-zinc-800 dark:text-zinc-300 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/30"
        >
          <LogOut size={16} className="mr-2" /> Sign Out
        </button>
      </div>
    </div>
    
    {/* Mobile Floating Action Button */}
    <div className="md:hidden fixed bottom-6 right-6 z-50">
      <button 
        onClick={() => navigate('/intake')}
        className="w-14 h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-transform active:scale-95"
      >
        <Plus size={28} />
      </button>
    </div>
    </>
  );
};

export default Sidebar;

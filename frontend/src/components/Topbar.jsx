import React from 'react';
import { Bell, Search, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Topbar = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="h-16 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-10 transition-all">
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-zinc-600 dark:text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
          </span>
          <input
            type="text"
            className="w-full bg-white/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-full py-1.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 transition-all shadow-inner"
            placeholder="Search anywhere..."
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-3 sm:space-x-5">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors relative group p-2">
          <Bell size={20} />
          <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-zinc-950 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default Topbar;

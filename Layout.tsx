
import React, { useState } from 'react';
import { MoreVertical, Download, Upload, User, GraduationCap, Clock, X } from 'lucide-react';
import { ActiveTab, Theme } from '../types';
import { APP_VERSION, APP_CREDITS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onBackup: () => void;
  onRestore: (file: File) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  onBackup,
  onRestore
}) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-center px-4 z-40 shadow-sm transition-colors">
        <div className="font-bold text-xl tracking-tighter text-indigo-600 dark:text-indigo-400">
          BIOM
        </div>
        <button 
          onClick={() => setSidebarOpen(true)}
          className="absolute right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-400"
          aria-label="Open settings"
        >
          <MoreVertical size={24} />
        </button>
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Menu */}
      <aside className={`fixed top-0 right-0 h-full w-72 bg-white dark:bg-slate-900 z-50 shadow-2xl transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} border-l border-slate-200 dark:border-slate-800`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-bold">Settings</h2>
            <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4 flex-grow overflow-y-auto custom-scrollbar">
            {/* Theme option removed as requested */}
            
            <button 
              onClick={onBackup}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Download size={20} className="text-green-500" />
              <span className="font-semibold">Backup Data</span>
            </button>

            <label className="w-full flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
              <Upload size={20} className="text-blue-500" />
              <span className="font-semibold">Restore Data</span>
              <input 
                type="file" 
                accept=".json" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onRestore(file);
                    setSidebarOpen(false);
                  }
                }} 
              />
            </label>
            
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-4">
               <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300">
                  <p className="font-bold text-sm mb-1">{APP_CREDITS.title}</p>
                  <p className="text-xs opacity-80">App by {APP_CREDITS.author}</p>
                  <p className="text-xs font-medium mt-1">Messenger: {APP_CREDITS.messenger}</p>
                  <p className="text-[10px] mt-3 opacity-60">Version {APP_VERSION}</p>
               </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      {children}

      {/* Bottom Navigation App Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 z-40 transition-colors shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <NavButton 
          active={activeTab === 'Admin'} 
          onClick={() => setActiveTab('Admin')} 
          icon={<User size={24} />} 
          label="Admin" 
        />
        <NavButton 
          active={activeTab === 'Sedulous'} 
          onClick={() => setActiveTab('Sedulous')} 
          icon={<Clock size={24} />} 
          label="Sedulous" 
        />
        <NavButton 
          active={activeTab === 'Courses'} 
          onClick={() => setActiveTab('Courses')} 
          icon={<GraduationCap size={24} />} 
          label="Courses" 
        />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 flex-1 py-2 transition-all duration-300 ${active ? 'text-indigo-600 dark:text-indigo-400 scale-110' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}
  >
    <div className={`p-2 rounded-xl transition-colors ${active ? 'bg-indigo-100 dark:bg-indigo-900/40' : ''}`}>
      {icon}
    </div>
    <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
  </button>
);

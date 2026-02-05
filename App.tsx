
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { AdminPage } from './components/AdminPage';
import { SedulousPage } from './components/SedulousPage';
import { CoursesPage } from './components/CoursesPage';
import { ActiveTab, AppData, Theme, Admin, Sedulous as SedulousType, Course } from './types';
import { INITIAL_DATA } from './constants';

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem('biom_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_DATA;
      }
    }
    return INITIAL_DATA;
  });

  // Theme is kept for system preference but manual toggle is removed from UI
  const [theme] = useState<Theme>(() => {
    const saved = localStorage.getItem('biom_theme');
    if (saved) return saved as Theme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? Theme.DARK : Theme.LIGHT;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('Admin');

  useEffect(() => {
    localStorage.setItem('biom_data', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    // Apply initial theme
    if (theme === Theme.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleBackup = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `biom_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [data]);

  const handleRestore = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        setData(json);
        alert('Data restored successfully!');
      } catch (err) {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const setAdmins = (newAdmins: Admin[] | ((prev: Admin[]) => Admin[])) => {
    setData(prev => ({ 
      ...prev, 
      admins: typeof newAdmins === 'function' ? newAdmins(prev.admins) : newAdmins 
    }));
  };

  const setSedulous = (newSedulous: SedulousType[] | ((prev: SedulousType[]) => SedulousType[])) => {
    setData(prev => ({ 
      ...prev, 
      sedulous: typeof newSedulous === 'function' ? newSedulous(prev.sedulous) : newSedulous 
    }));
  };

  const setCourses = (newCourses: Course[] | ((prev: Course[]) => Course[])) => {
    setData(prev => ({
      ...prev,
      courses: typeof newCourses === 'function' ? newCourses(prev.courses) : newCourses
    }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Admin':
        return <AdminPage admins={data.admins} setAdmins={setAdmins} />;
      case 'Sedulous':
        return <SedulousPage schedules={data.sedulous} setSchedules={setSedulous} />;
      case 'Courses':
        return <CoursesPage courses={data.courses} setCourses={setCourses} admins={data.admins} />;
      default:
        return (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-lg border border-slate-200 dark:border-slate-800 text-center">
            <h2 className="text-xl font-bold mb-4">{activeTab} Section</h2>
            <p className="text-slate-500 dark:text-slate-400 italic">
              Coming soon! I'm waiting for your next update instructions for the {activeTab} section.
            </p>
          </div>
        );
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onBackup={handleBackup}
      onRestore={handleRestore}
    >
      <main className="p-4 pt-20 pb-28 max-w-lg mx-auto min-h-screen">
        {renderContent()}
      </main>
    </Layout>
  );
};

export default App;

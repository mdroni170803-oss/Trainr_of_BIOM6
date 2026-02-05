
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Clock, Trash2, X, Check, Timer, BookOpen, Calendar, Save, AlertCircle, ListChecks } from 'lucide-react';
import { Sedulous } from '../types';

interface SedulousPageProps {
  schedules: Sedulous[];
  setSchedules: (newSchedules: Sedulous[] | ((prev: Sedulous[]) => Sedulous[])) => void;
}

export const SedulousPage: React.FC<SedulousPageProps> = ({ schedules, setSchedules }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingSchedule, setDeletingSchedule] = useState<Sedulous | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getNextOccurrence = (classTime: string, days: string[]) => {
    if (!days || days.length === 0) return 0;

    const [time, modifier] = classTime.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    const possibleTimes = days.map(dayName => {
      let targetDay = DAYS_OF_WEEK.indexOf(dayName);
      const jsTargetDay = (targetDay + 1) % 7;
      
      let nextDate = new Date(now);
      nextDate.setHours(hours, minutes, 0, 0);
      
      let dayDiff = (jsTargetDay - now.getDay() + 7) % 7;
      if (dayDiff === 0 && nextDate < now) {
        dayDiff = 7;
      }
      nextDate.setDate(now.getDate() + dayDiff);
      return nextDate.getTime();
    });

    return Math.min(...possibleTimes);
  };

  const sortedSchedules = useMemo(() => {
    const filtered = (schedules || []).filter(s => 
      s.courseName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return filtered.sort((a, b) => {
      const timeA = getNextOccurrence(a.classTime, a.days);
      const timeB = getNextOccurrence(b.classTime, b.days);
      const valA = isFinite(timeA) ? timeA : Number.MAX_SAFE_INTEGER;
      const valB = isFinite(timeB) ? timeB : Number.MAX_SAFE_INTEGER;
      return valA - valB;
    });
  }, [schedules, searchTerm, now]);

  const confirmDelete = () => {
    if (deletingSchedule) {
      setSchedules(prev => prev.filter(s => s.id !== deletingSchedule.id));
      setDeletingSchedule(null);
      if (navigator.vibrate) {
        try { navigator.vibrate(50); } catch (err) {}
      }
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
      {/* Stats Counter */}
      <div className="flex justify-start px-1">
        <div className="glass px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-900/30 flex items-center gap-2">
          <ListChecks size={14} className="text-indigo-600 dark:text-indigo-400" />
          <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-tight">Total Schedules: {schedules.length}</span>
        </div>
      </div>

      {/* Header & Search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="Search schedules..."
            className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center"
        >
          <Plus size={20} strokeWidth={3} />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-4 pb-10">
        {sortedSchedules.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Clock size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-medium">No schedules found</p>
          </div>
        ) : (
          sortedSchedules.map((schedule) => {
            const nextTime = getNextOccurrence(schedule.classTime, schedule.days);
            const diff = nextTime - now.getTime();
            
            const daysCount = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            const isUrgent = diff > 0 && diff < 1000 * 60 * 60; // Less than 1 hour

            return (
              <div 
                key={schedule.id}
                onClick={() => setDeletingSchedule(schedule)}
                className={`glass relative p-5 rounded-3xl border transition-all cursor-pointer active:scale-[0.98] ${
                  isUrgent 
                    ? 'border-orange-200 dark:border-orange-900/30 shadow-md bg-orange-50/30' 
                    : 'border-slate-100 dark:border-slate-800/50 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex flex-col items-center text-center mb-4">
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight leading-tight">{schedule.courseName}</h3>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full mt-1.5 uppercase tracking-wider">
                    {schedule.classType}
                  </span>
                </div>

                <div className="flex justify-between items-end border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">BATCH {schedule.batchNumber}</p>
                    <div className="flex flex-wrap gap-1">
                      {schedule.days.map(d => (
                        <span key={d} className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded uppercase">
                          {d.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-100 font-black text-lg justify-end">
                      <Clock size={16} className="text-indigo-500" />
                      {schedule.classTime}
                    </div>
                    {nextTime > 0 && isFinite(nextTime) && (
                      <div className={`flex items-center gap-1.5 text-[11px] font-black mt-1 ${isUrgent ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}>
                        <Timer size={12} />
                        {daysCount > 0 ? `${daysCount}d ` : ''}{hours}h {minutes}m {seconds}s
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingSchedule && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-sm rounded-[2rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center mb-6">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Delete Schedule?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
                Are you sure you want to delete the schedule for <span className="font-bold text-slate-800 dark:text-slate-200">{deletingSchedule.courseName} (Batch {deletingSchedule.batchNumber})</span>? This action cannot be undone.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-8">
              <button 
                onClick={() => setDeletingSchedule(null)}
                className="py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-sm rounded-2xl transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="py-3.5 bg-red-500 hover:bg-red-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-red-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Add Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[120] bg-white dark:bg-slate-950 flex flex-col animate-in fade-in slide-in-from-right duration-400">
          {/* Header */}
          <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl sticky top-0 z-20">
            <div className="flex flex-col">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">New Schedule</h2>
              <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mt-1">BIOM Class Manager</p>
            </div>
            <button 
              onClick={() => setIsFormOpen(false)} 
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400 transition-all active:scale-90"
            >
              <X size={24} strokeWidth={2.5} />
            </button>
          </div>
          
          <form 
            className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 pb-40"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const selectedDays = DAYS_OF_WEEK.filter(d => formData.get(`day-${d}`));
              
              if (selectedDays.length === 0) return alert("Select at least one day.");
              
              const newSchedule: Sedulous = {
                id: Date.now().toString(),
                courseName: formData.get('courseName') as string,
                classType: formData.get('classType') as string,
                batchNumber: formData.get('batchNumber') as string,
                classTime: `${formData.get('timeHour')}:${formData.get('timeMinute')} ${formData.get('timeMod')}`,
                days: selectedDays
              };
              
              setSchedules(prev => [...prev, newSchedule]);
              setIsFormOpen(false);
            }}
          >
            {/* Section: Basic Info */}
            <FormSection title="Class Details" icon={<BookOpen size={18} />}>
              <div className="space-y-4">
                <FormInput label="Course Name" name="courseName" placeholder="Enter Course Name" required />
                <div className="grid grid-cols-2 gap-4">
                  <FormInput label="Class Type" name="classType" placeholder="e.g., Live Zoom" required />
                  <FormInput label="Batch Number" name="batchNumber" placeholder="e.g., 20" required />
                </div>
              </div>
            </FormSection>

            {/* Section: Time Settings */}
            <FormSection title="Timing" icon={<Clock size={18} />}>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Hour</label>
                  <select name="timeHour" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 font-bold text-sm outline-none shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all appearance-none">
                    {Array.from({length: 12}, (_, i) => String(i + 1).padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Minute</label>
                  <select name="timeMinute" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 font-bold text-sm outline-none shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all appearance-none">
                    {['00', '15', '30', '45'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">AM/PM</label>
                  <select name="timeMod" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 font-bold text-sm outline-none shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all appearance-none">
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            </FormSection>

            {/* Section: Day Selection */}
            <FormSection title="Weekly Schedule" icon={<Calendar size={18} />}>
              <div className="grid grid-cols-1 gap-2.5">
                {DAYS_OF_WEEK.map(day => (
                  <label key={day} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer group active:scale-[0.98] transition-all shadow-sm">
                    <div className="relative flex items-center justify-center">
                      <input type="checkbox" name={`day-${day}`} className="peer sr-only" />
                      <div className="w-6 h-6 border-2 border-slate-300 dark:border-slate-600 rounded-lg peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all flex items-center justify-center">
                        <Check size={14} strokeWidth={4} className="text-white opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-all" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">{day}</span>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{day.slice(0, 3)} Class Day</span>
                    </div>
                  </label>
                ))}
              </div>
            </FormSection>
          </form>

          {/* Floating Action Bar */}
          <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white dark:from-slate-950 via-white/90 dark:via-slate-950/90 to-transparent flex gap-4 z-30">
            <button 
              type="button" 
              onClick={() => setIsFormOpen(false)}
              className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-base rounded-[1.5rem] transition-all active:scale-95 border border-slate-200 dark:border-slate-700"
            >
              Discard
            </button>
            <button 
              type="submit" 
              onClick={(e: any) => {
                const form = e.target.closest('div').previousElementSibling;
                form.requestSubmit();
              }}
              className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base rounded-[1.5rem] shadow-2xl shadow-indigo-500/40 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Save size={20} />
              Save Schedule
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const FormSection = ({ title, icon, children }: { title: string, icon: React.ReactNode, children?: React.ReactNode }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3 px-1">
      <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
        {icon}
      </div>
      <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{title}</h3>
    </div>
    <div className="bg-slate-50/50 dark:bg-slate-900/30 p-5 rounded-3xl border border-slate-100 dark:border-slate-800/50">
      {children}
    </div>
  </div>
);

const FormInput = ({ label, name, type = 'text', placeholder, required }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{label} {required && <span className="text-red-500">*</span>}</label>
    <input 
      name={name}
      type={type}
      placeholder={placeholder}
      required={required}
      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-sm shadow-sm placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-900 dark:text-white"
    />
  </div>
);

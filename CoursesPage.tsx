
import React, { useState, useMemo, useRef } from 'react';
import { Search, Plus, Trash2, X, ChevronRight, Calendar, User, Edit2, ArrowLeft, MoreHorizontal, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';
import { Course, Batch, Admin } from '../types';

interface CoursesPageProps {
  courses: Course[];
  setCourses: (newCourses: Course[] | ((prev: Course[]) => Course[])) => void;
  admins: Admin[];
}

export const CoursesPage: React.FC<CoursesPageProps> = ({ courses, setCourses, admins }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);
  const [activeCourseForBatch, setActiveCourseForBatch] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<{courseId: string, batch: Batch} | null>(null);
  const [isEditingBatch, setIsEditingBatch] = useState(false);
  const [confirmingDeleteCourse, setConfirmingDeleteCourse] = useState<Course | null>(null);
  const [confirmingDeleteBatch, setConfirmingDeleteBatch] = useState<{courseId: string, batch: Batch} | null>(null);
  
  const longPressTimer = useRef<number | null>(null);

  // Filtered Courses
  const filteredCourses = useMemo(() => {
    return (courses || []).filter(c => 
      c.courseName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [courses, searchTerm]);

  const handleAddCourse = (courseName: string) => {
    const newCourse: Course = {
      id: Date.now().toString(),
      courseName,
      batches: []
    };
    setCourses(prev => [...prev, newCourse]);
    setIsCourseFormOpen(false);
  };

  const startLongPress = (course: Course) => {
    longPressTimer.current = window.setTimeout(() => {
      setConfirmingDeleteCourse(course);
      if (navigator.vibrate) navigator.vibrate(100);
    }, 2000);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleConfirmDeleteCourse = () => {
    if (confirmingDeleteCourse) {
      setCourses(prev => prev.filter(c => c.id !== confirmingDeleteCourse.id));
      setConfirmingDeleteCourse(null);
    }
  };

  const handleConfirmDeleteBatch = () => {
    if (confirmingDeleteBatch) {
      const { courseId, batch } = confirmingDeleteBatch;
      setCourses(prev => prev.map(c => {
        if (c.id === courseId) {
          return { ...c, batches: c.batches.filter(b => b.id !== batch.id) };
        }
        return c;
      }));
      setConfirmingDeleteBatch(null);
      setSelectedBatch(null);
    }
  };

  const handleSaveBatch = (courseId: string, batchData: Partial<Batch>) => {
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        if (isEditingBatch && selectedBatch) {
          return {
            ...c,
            batches: c.batches.map(b => b.id === selectedBatch.batch.id ? { ...b, ...batchData } : b)
          };
        } else {
          const newBatch: Batch = {
            id: Date.now().toString(),
            batchNumber: batchData.batchNumber || '',
            startDate: batchData.startDate || '',
            admissionDate: batchData.admissionDate || '',
            headTeacher: batchData.headTeacher || '',
            status: batchData.status || 'Coming Soon',
            adminIds: batchData.adminIds || [],
            createdAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          return { ...c, batches: [...c.batches, newBatch] };
        }
      }
      return c;
    }));
    setActiveCourseForBatch(null);
    setSelectedBatch(null);
    setIsEditingBatch(false);
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
      {/* Search & Add Course */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="Search courses..."
            className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsCourseFormOpen(true)}
          className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center"
        >
          <Plus size={20} strokeWidth={3} />
        </button>
      </div>

      {/* Courses List - Scrollable */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-8 pb-10">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <MoreHorizontal size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-medium">No courses available</p>
          </div>
        ) : (
          filteredCourses.map((course) => (
            <div key={course.id} className="space-y-4">
              {/* Course Header */}
              <div 
                onMouseDown={() => startLongPress(course)}
                onMouseUp={cancelLongPress}
                onMouseLeave={cancelLongPress}
                onTouchStart={() => startLongPress(course)}
                onTouchEnd={cancelLongPress}
                className="glass p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800/50 flex items-center shadow-sm relative overflow-hidden select-none active:bg-slate-50 dark:active:bg-slate-800 transition-colors"
              >
                <div className="flex-1 text-center font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight text-lg truncate px-10">
                  {course.courseName}
                </div>
                
                <div className="absolute right-4 flex gap-2">
                  <button 
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={() => setActiveCourseForBatch(course.id)}
                    className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl active:scale-90 transition-all border border-indigo-100 dark:border-indigo-800"
                    title="Add Batch"
                  >
                    <Plus size={18} strokeWidth={3} />
                  </button>
                </div>
              </div>

              {/* Batches List */}
              <div className="flex flex-wrap gap-2 px-2">
                {course.batches.length === 0 ? (
                  <p className="text-[10px] text-slate-400 font-black uppercase italic tracking-[0.2em] pl-4 opacity-50">No batches</p>
                ) : (
                  course.batches.sort((a,b) => b.batchNumber.localeCompare(a.batchNumber)).map(batch => (
                    <button 
                      key={batch.id}
                      onClick={() => setSelectedBatch({ courseId: course.id, batch })}
                      className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-black text-slate-700 dark:text-slate-200 shadow-sm hover:border-indigo-400 hover:text-indigo-600 active:scale-95 transition-all"
                    >
                      {batch.batchNumber}
                    </button>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Course Form */}
      {isCourseFormOpen && (
        <Dialog onClose={() => setIsCourseFormOpen(false)} title="New Course">
          <form onSubmit={(e) => {
            e.preventDefault();
            const name = (e.currentTarget.elements.namedItem('courseName') as HTMLInputElement).value;
            if (name) handleAddCourse(name);
          }} className="space-y-6">
            <FormInput label="Course Name" name="courseName" placeholder="e.g., Arabic Language" required autoFocus />
            <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/30 active:scale-95 transition-all">Create Course</button>
          </form>
        </Dialog>
      )}

      {/* Delete Course Confirmation */}
      {confirmingDeleteCourse && (
        <Dialog onClose={() => setConfirmingDeleteCourse(null)} title="Delete Course?">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center mb-4">
              <AlertCircle size={32} />
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">"{confirmingDeleteCourse.courseName}"</span> and all its batches?
            </p>
            <div className="grid grid-cols-2 gap-3 w-full">
              <button onClick={() => setConfirmingDeleteCourse(null)} className="py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-sm rounded-2xl transition-all active:scale-95">Cancel</button>
              <button onClick={handleConfirmDeleteCourse} className="py-3.5 bg-red-500 hover:bg-red-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-red-500/30 transition-all active:scale-95 flex items-center justify-center gap-2">
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Delete Batch Confirmation */}
      {confirmingDeleteBatch && (
        <Dialog onClose={() => setConfirmingDeleteBatch(null)} title="Delete Batch?">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center mb-4">
              <AlertCircle size={32} />
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-6">
              Delete <span className="font-bold text-slate-900 dark:text-white">Batch {confirmingDeleteBatch.batch.batchNumber}</span> permanently?
            </p>
            <div className="grid grid-cols-2 gap-3 w-full">
              <button onClick={() => setConfirmingDeleteBatch(null)} className="py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-sm rounded-2xl transition-all active:scale-95">Cancel</button>
              <button onClick={handleConfirmDeleteBatch} className="py-3.5 bg-red-500 hover:bg-red-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-red-500/30 transition-all active:scale-95 flex items-center justify-center gap-2">
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Batch Form */}
      {activeCourseForBatch && (
        <BatchForm 
          courseId={activeCourseForBatch} 
          admins={admins}
          onClose={() => setActiveCourseForBatch(null)}
          onSave={(data) => handleSaveBatch(activeCourseForBatch, data)}
        />
      )}

      {/* Batch Details Modal */}
      {selectedBatch && !isEditingBatch && (
        <BatchDetails 
          courseId={selectedBatch.courseId}
          batch={selectedBatch.batch}
          admins={admins}
          onClose={() => setSelectedBatch(null)}
          onEdit={() => setIsEditingBatch(true)}
          onDelete={() => setConfirmingDeleteBatch({ courseId: selectedBatch.courseId, batch: selectedBatch.batch })}
        />
      )}

      {/* Edit Batch Form */}
      {selectedBatch && isEditingBatch && (
        <BatchForm 
          courseId={selectedBatch.courseId} 
          initialData={selectedBatch.batch}
          admins={admins}
          onClose={() => setIsEditingBatch(false)}
          onSave={(data) => handleSaveBatch(selectedBatch.courseId, data)}
        />
      )}
    </div>
  );
};

// UI Components
const Dialog = ({ children, onClose, title }: { children?: React.ReactNode, onClose: () => void, title: string }) => (
  <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">{title}</h3>
        <button onClick={onClose} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-red-500"><X size={20} /></button>
      </div>
      {children}
    </div>
  </div>
);

const BatchForm = ({ courseId, initialData, admins, onClose, onSave }: { courseId: string, initialData?: Batch, admins: Admin[], onClose: () => void, onSave: (data: Partial<Batch>) => void }) => {
  const [formData, setFormData] = useState<Partial<Batch>>(initialData || {
    batchNumber: '', startDate: '', admissionDate: '', headTeacher: '', status: 'Coming Soon', adminIds: []
  });
  const [isAdminPickerOpen, setIsAdminPickerOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-[120] bg-white dark:bg-slate-950 flex flex-col animate-in slide-in-from-right duration-400">
      <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex flex-col">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{initialData ? 'Edit Batch' : 'New Batch'}</h2>
          <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mt-1">Configure batch parameters</p>
        </div>
        <button onClick={onClose} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-500"><X size={24} strokeWidth={2.5} /></button>
      </div>

      <form className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 pb-40" onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
        <div className="space-y-5">
          <FormInput label="Batch Number" value={formData.batchNumber} onChange={(v:string) => setFormData({...formData, batchNumber: v})} placeholder="e.g., 20" required />
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Batch Start Date" type="date" value={formData.startDate} onChange={(v:string) => setFormData({...formData, startDate: v})} required />
            <FormInput label="Admission Start Date" type="date" value={formData.admissionDate} onChange={(v:string) => setFormData({...formData, admissionDate: v})} required />
          </div>
          <FormInput label="Head Teacher" value={formData.headTeacher} onChange={(v:string) => setFormData({...formData, headTeacher: v})} placeholder="Lead Instructor Name" required />
          
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Batch Status</label>
            <div className="flex gap-2">
              {(['Coming Soon', 'Ongoing', 'Ended'] as const).map((s) => (
                <button key={s} type="button" onClick={() => setFormData({...formData, status: s})} className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-wider border-2 transition-all ${formData.status === s ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">My Admin</label>
            <button type="button" onClick={() => setIsAdminPickerOpen(true)} className="w-full p-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl text-left flex items-center justify-between group active:scale-[0.98] transition-all">
              <div className="flex flex-col">
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">Choose Admin</span>
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  {formData.adminIds?.length ? `${formData.adminIds.length} Admins Selected` : 'Tap to select from Admin Page'}
                </span>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </button>
          </div>
        </div>
      </form>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white dark:from-slate-950 via-white/95 dark:via-slate-950/95 flex gap-4 z-30">
        <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black rounded-[1.5rem]">Discard</button>
        <button type="button" onClick={() => onSave(formData)} className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-[1.5rem] shadow-2xl shadow-indigo-500/40 active:scale-95 transition-all">Save Batch</button>
      </div>

      {isAdminPickerOpen && (
        <div className="fixed inset-0 z-[160] bg-white dark:bg-slate-950 flex flex-col animate-in slide-in-from-bottom duration-500">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md">
             <div className="flex flex-col">
               <h3 className="text-xl font-black uppercase tracking-tight">Select Admins</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pick from your BIOM network</p>
             </div>
             <button onClick={() => setIsAdminPickerOpen(false)} className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-500/30"><CheckCircle2 size={24} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-3 pb-32">
            {admins.length === 0 ? (
              <div className="text-center py-20 opacity-30">
                 <UserCheck size={48} className="mx-auto mb-2" />
                 <p className="font-bold uppercase tracking-widest">No admins found</p>
              </div>
            ) : (
              admins.map(admin => {
                const isSelected = formData.adminIds?.includes(admin.id);
                return (
                  <div key={admin.id} onClick={() => {
                      const current = formData.adminIds || [];
                      const next = isSelected ? current.filter(id => id !== admin.id) : [...current, admin.id];
                      setFormData({...formData, adminIds: next});
                    }} className={`p-4 rounded-3xl border transition-all flex items-center justify-between cursor-pointer ${isSelected ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-900 border-transparent text-slate-500'}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center font-black text-indigo-600 text-lg">{admin.name.charAt(0)}</div>
                      <div className="flex flex-col">
                        <p className={`font-black ${isSelected ? 'text-indigo-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{admin.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{admin.batch}</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                      {isSelected && <X size={14} className="text-white rotate-45" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const BatchDetails = ({ courseId, batch, admins, onClose, onEdit, onDelete }: { courseId: string, batch: Batch, admins: Admin[], onClose: () => void, onEdit: () => void, onDelete: () => void }) => {
  const selectedAdmins = admins.filter(a => batch.adminIds.includes(a.id));
  const [isAdminsExpanded, setIsAdminsExpanded] = useState(false);

  return (
    <div className="fixed inset-0 z-[140] bg-white dark:bg-slate-950 flex flex-col animate-in slide-in-from-bottom duration-400">
      <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md z-20">
        <button onClick={onClose} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-500"><ArrowLeft size={20} /></button>
        <div className="flex gap-2">
          <button onClick={onEdit} className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl border border-indigo-100 dark:border-indigo-800"><Edit2 size={18} /></button>
          <button onClick={onDelete} className="p-2.5 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-xl border border-red-100 dark:border-red-800"><Trash2 size={18} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
        <div className="text-center">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-[2.5rem] flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-sm border border-indigo-100 dark:border-indigo-800">
            <Calendar size={40} strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Batch {batch.batchNumber}</h2>
          <span className={`inline-block px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mt-3 ${batch.status === 'Ongoing' ? 'bg-green-100 text-green-700' : batch.status === 'Ended' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
            {batch.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <DetailCard icon={<Calendar size={18} />} label="Batch Start Date" value={batch.startDate || 'N/A'} color="indigo" />
          <DetailCard icon={<CheckCircle2 size={18} />} label="Admission Open" value={batch.admissionDate || 'N/A'} color="green" />
        </div>

        <DetailCard icon={<User size={18} />} label="Head Teacher" value={batch.headTeacher} color="purple" fullWidth />

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">My Admin List</h4>
             <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">{selectedAdmins.length} Selected</span>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
            <button onClick={() => setIsAdminsExpanded(!isAdminsExpanded)} className="w-full p-5 flex items-center justify-between text-left active:bg-slate-100 dark:active:bg-slate-800 transition-colors">
              <div className="flex items-center gap-3">
                <UsersGroup avatars={selectedAdmins.map(a => a.name.charAt(0))} />
                <span className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">Manage View</span>
              </div>
              <ChevronRight size={20} className={`text-slate-400 transition-transform duration-300 ${isAdminsExpanded ? 'rotate-90' : ''}`} />
            </button>
            
            {isAdminsExpanded && (
              <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-in fade-in slide-in-from-top-2">
                {selectedAdmins.length === 0 ? (
                  <div className="flex flex-col items-center py-6 opacity-30">
                    <AlertCircle size={32} className="mb-2" />
                    <p className="text-xs font-black uppercase tracking-widest">No assigned admins</p>
                  </div>
                ) : (
                  selectedAdmins.map(admin => (
                    <div key={admin.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/50 flex items-center justify-center font-black text-indigo-600 text-sm shadow-inner">{admin.name.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-800 dark:text-slate-100 truncate uppercase tracking-tight">{admin.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{admin.batch}</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${admin.status === 'Active' ? 'bg-green-500' : 'bg-red-500'} shadow-[0_0_8px_rgba(34,197,94,0.4)]`}></div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="pt-10 text-center opacity-50">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Form Filled: {batch.createdAt}</p>
        </div>
      </div>
    </div>
  );
};

const DetailCard = ({ icon, label, value, color, fullWidth }: any) => {
  const colors: any = {
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
  };
  return (
    <div className={`bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-3 ${fullWidth ? 'col-span-2' : ''}`}>
      <div className={`w-10 h-10 rounded-2xl ${colors[color]} flex items-center justify-center shadow-sm`}>{icon}</div>
      <div className="flex flex-col">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        <p className="text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5">{value || 'N/A'}</p>
      </div>
    </div>
  );
};

const UsersGroup = ({ avatars }: { avatars: string[] }) => (
  <div className="flex -space-x-2.5">
    {avatars.slice(0, 3).map((a, i) => (
      <div key={i} className="w-8 h-8 rounded-xl border-2 border-white dark:border-slate-900 bg-indigo-100 dark:bg-indigo-900 text-[10px] font-black flex items-center justify-center text-indigo-600 shadow-sm">{a}</div>
    ))}
    {avatars.length > 3 && (
      <div className="w-8 h-8 rounded-xl border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 text-[9px] font-black flex items-center justify-center text-slate-500 shadow-sm">+{avatars.length - 3}</div>
    )}
  </div>
);

const FormInput = ({ label, type = 'text', value, onChange, placeholder, required, autoFocus, name }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">{label} {required && <span className="text-red-500">*</span>}</label>
    <input name={name} type={type} value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder} required={required} autoFocus={autoFocus} className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-sm shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-700 text-slate-900 dark:text-white" />
  </div>
);

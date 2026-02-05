
import React, { useState, useMemo, useRef } from 'react';
import { Search, Plus, Star, Camera, Edit2, Download, X, ArrowLeft, Calendar, Phone, MapPin, Briefcase, Facebook, UserCheck, UserX, Files, MessageSquare, Info, User, GraduationCap } from 'lucide-react';
import { Admin } from '../types';

interface AdminPageProps {
  admins: Admin[];
  setAdmins: (newAdmins: Admin[] | ((prev: Admin[]) => Admin[])) => void;
}

const CompactInfoItem = ({ icon, color, label, value }: { icon: React.ReactNode, color: string, label: string, value: string }) => {
  const bgColors: Record<string, string> = { 
    blue: 'bg-[#eff6ff] text-[#3b82f6]', 
    orange: 'bg-[#fff7ed] text-[#f97316]', 
    purple: 'bg-[#f5f3ff] text-[#8b5cf6]', 
    green: 'bg-[#f0fdf4] text-[#22c55e]', 
    indigo: 'bg-[#e0e7ff] text-[#4f46e5]' 
  };
  return (
    <div className="flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl ${bgColors[color]} flex items-center justify-center shadow-sm shrink-0`}>{icon}</div>
      <div className="flex flex-col overflow-hidden">
        <p className="text-[9px] font-black text-[#94a3b8] uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-[#0f172a] truncate">{value}</p>
      </div>
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

const FormInput = ({ label, type = 'text', value, onChange, placeholder, required = false }: { label: string; type?: string; value: any; onChange: (v: string) => void; placeholder?: string; required?: boolean }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest px-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input 
      type={type} 
      placeholder={placeholder}
      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-sm shadow-sm placeholder:text-slate-300 dark:placeholder:text-slate-600" 
      value={value} 
      onChange={e => onChange(e.target.value)} 
      required={required} 
    />
  </div>
);

export const AdminPage: React.FC<AdminPageProps> = ({ admins, setAdmins }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showDocGallery, setShowDocGallery] = useState(false);

  const detailRef = useRef<HTMLDivElement>(null);

  const filteredAdmins = useMemo(() => {
    return (admins || [])
      .filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => b.rating - a.rating);
  }, [admins, searchTerm]);

  const calculateExperience = (joinDate: string) => {
    const start = new Date(joinDate);
    const end = new Date();
    if (isNaN(start.getTime())) return 'N/A';
    
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    
    if (months < 0 || (months === 0 && end.getDate() < start.getDate())) {
      years--;
      months += 12;
    }
    
    let result = '';
    if (years > 0) result += `${years}y `;
    if (months > 0) result += `${months}m`;
    return result || 'Newly Joined';
  };

  const handleToggleStatus = (e: React.MouseEvent, id: string, currentStatus: string) => {
    e.stopPropagation(); 
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setAdmins(prev => prev.map(a => a.id === id ? { ...a, status: nextStatus as 'Active' | 'Inactive' } : a));
  };

  const handleUpdateRating = (id: string, rating: number) => {
    setAdmins(prev => prev.map(a => a.id === id ? { ...a, rating } : a));
    setIsRatingModalOpen(null);
  };

  const downloadSingleImage = (base64: string, filename: string) => {
    const link = document.createElement('a');
    link.href = base64;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAsImage = async () => {
    const win = window as any;
    if (detailRef.current && win.html2canvas && selectedAdmin) {
      try {
        const element = detailRef.current;
        const canvas = await win.html2canvas(element, {
          backgroundColor: '#ffffff',
          scale: 2.5,
          useCORS: true,
          logging: false,
          width: element.offsetWidth,
          height: element.scrollHeight,
          windowHeight: element.scrollHeight,
          scrollY: 0,
        });
        
        const summaryFilename = `Admin_${selectedAdmin.name.replace(/\s+/g, '_')}_Details.png`;
        downloadSingleImage(canvas.toDataURL('image/png', 0.9), summaryFilename);

        if (selectedAdmin.documents && selectedAdmin.documents.length > 0) {
          selectedAdmin.documents.forEach((doc, index) => {
            setTimeout(() => {
              downloadSingleImage(doc, `Admin_${selectedAdmin.name.replace(/\s+/g, '_')}_Doc_${index + 1}.png`);
            }, (index + 1) * 400);
          });
        }
      } catch (err) {
        console.error("Capture failed", err);
      }
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex justify-between items-center px-1">
        <div className="flex gap-2">
          <div className="glass px-3 py-1.5 rounded-xl border border-green-200 dark:border-green-900/30 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black text-green-700 dark:text-green-400 uppercase tracking-tight">Active: {admins.filter(a => a.status === 'Active').length}</span>
          </div>
          <div className="glass px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/30 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="text-[10px] font-black text-red-700 dark:text-red-400 uppercase tracking-tight">Inactive: {admins.filter(a => a.status === 'Inactive').length}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="Search admins..."
            className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm text-slate-900 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg active:scale-90 flex items-center justify-center transition-all"
        >
          <Plus size={20} strokeWidth={3} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3 pb-4">
        {filteredAdmins.map((admin, index) => (
          <div 
            key={admin.id}
            onClick={() => setSelectedAdmin(admin)}
            className="glass group relative flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800/50 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-xs font-black text-indigo-600">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base leading-tight">
                  {admin.name}
                </h3>
                <div 
                  className="flex gap-0.5 mt-0.5"
                  onClick={(e) => { e.stopPropagation(); setIsRatingModalOpen(admin.id); }}
                >
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={10} className={i < admin.rating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-700"} />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => handleToggleStatus(e, admin.id, admin.status)}
                className={`min-w-[65px] px-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                  admin.status === 'Active' 
                  ? 'bg-green-500/10 text-green-600 border border-green-500/20' 
                  : 'bg-red-500/10 text-red-600 border border-red-500/20'
                }`}
              >
                {admin.status}
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedAdmin && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col overflow-y-auto custom-scrollbar animate-in slide-in-from-right duration-300">
          <div className="fixed top-0 left-0 right-0 h-14 px-4 flex items-center justify-between z-[110] pointer-events-none">
            <button onClick={() => setSelectedAdmin(null)} className="p-2.5 bg-black/20 backdrop-blur-md rounded-xl text-white pointer-events-auto">
              <ArrowLeft size={20} />
            </button>
            <div className="flex gap-2 pointer-events-auto">
              <button onClick={() => { setEditingAdmin(selectedAdmin); setSelectedAdmin(null); setIsFormOpen(true); }} className="p-2.5 bg-black/20 backdrop-blur-md text-white rounded-xl">
                <Edit2 size={18} />
              </button>
              <button onClick={downloadAsImage} className="p-2.5 bg-black/20 backdrop-blur-md text-white rounded-xl">
                <Download size={18} />
              </button>
            </div>
          </div>

          <div ref={detailRef} data-capture="true" className="w-full flex flex-col bg-white text-[#0f172a] min-h-full">
            <div className="h-44 bg-[#22c55e] relative overflow-hidden shrink-0">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10">
                <UserX size={180} strokeWidth={1} className="text-white" />
              </div>
            </div>

            <div className="relative px-6 pb-12 -mt-12 flex flex-col items-center flex-1 bg-white rounded-t-[2.5rem]">
              <div className="relative -mt-12">
                <div className="w-32 h-32 rounded-full border-[5px] border-white bg-[#f0fdf4] shadow-xl flex items-center justify-center text-4xl font-bold text-[#22c55e]">
                  {selectedAdmin.name.charAt(0)}
                </div>
                {selectedAdmin.status === 'Active' && (
                  <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-[#22c55e] border-[3px] border-white shadow-lg"></div>
                )}
              </div>

              <h2 className="text-3xl font-bold mt-4 tracking-tight text-center">{selectedAdmin.name}</h2>
              <div className="flex gap-0.5 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className={i < (selectedAdmin?.rating || 0) ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                ))}
              </div>
              <p className="text-[10px] font-black tracking-[0.2em] text-[#94a3b8] mt-2 uppercase">{selectedAdmin.status} ADMIN</p>

              <div className="grid grid-cols-2 gap-3 w-full mt-8 max-w-sm">
                <div className="bg-[#f8fafc] p-5 rounded-[1.5rem] flex flex-col gap-1 border border-slate-50">
                  <p className="text-[9px] font-black text-[#94a3b8] uppercase tracking-widest">EXPERIENCE</p>
                  <p className="text-[#22c55e] font-bold text-base">{calculateExperience(selectedAdmin.joinDate)}</p>
                </div>
                <div className="bg-[#f8fafc] p-5 rounded-[1.5rem] flex flex-col gap-1 border border-slate-50">
                  <p className="text-[9px] font-black text-[#94a3b8] uppercase tracking-widest">BATCH</p>
                  <p className="text-[#0f172a] font-bold text-base">{selectedAdmin.batch}</p>
                </div>
              </div>

              <div className="w-full mt-6 space-y-5 max-w-sm">
                <CompactInfoItem icon={<Phone size={20} />} color="blue" label="MOBILE" value={selectedAdmin.mobile} />
                {selectedAdmin.whatsapp && <CompactInfoItem icon={<MessageSquare size={20} />} color="green" label="WHATSAPP" value={selectedAdmin.whatsapp} />}
                <CompactInfoItem icon={<MapPin size={20} />} color="orange" label="ADDRESS" value={selectedAdmin.address} />
                <CompactInfoItem icon={<Info size={20} />} color="purple" label="PERSONAL" value={`${selectedAdmin.age}yrs • ${selectedAdmin.gender}`} />
                <CompactInfoItem icon={<Calendar size={20} />} color="indigo" label="JOINED" value={selectedAdmin.joinDate} />
                
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#f0fdf4] text-[#22c55e] flex items-center justify-center shrink-0"><Briefcase size={20} /></div>
                  <div className="flex flex-col">
                    <p className="text-[9px] font-black text-[#94a3b8] uppercase tracking-widest">TRAINER PATH</p>
                    <p className="text-sm font-bold">Current: {selectedAdmin.currentTrainer}</p>
                    <p className="text-[11px] font-medium text-slate-500">Latest: {selectedAdmin.latestTrainer}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center shrink-0"><Facebook size={20} /></div>
                  <div className="flex flex-col">
                    <p className="text-[9px] font-black text-[#94a3b8] uppercase tracking-widest">SOCIAL</p>
                    <a href={selectedAdmin.facebookLink} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#2563eb]">{selectedAdmin.name}'s Profile</a>
                  </div>
                </div>

                <div className="flex items-center gap-4 cursor-pointer" onClick={() => setShowDocGallery(true)}>
                  <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0"><Files size={20} /></div>
                  <div className="flex flex-col">
                    <p className="text-[9px] font-black text-[#94a3b8] uppercase tracking-widest">VERIFICATION</p>
                    <p className="text-sm font-bold">{selectedAdmin.documents.length} Images Uploaded</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDocGallery && selectedAdmin && (
        <div className="fixed inset-0 z-[150] bg-white dark:bg-slate-950 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black">Verification Docs</h2>
            <button onClick={() => setShowDocGallery(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl"><X size={20} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3 overflow-y-auto flex-1 pb-8">
            {selectedAdmin.documents.map((doc, i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 shadow-sm" onClick={() => setPreviewImage(doc)}>
                <img src={doc} className="w-full h-full object-cover" alt="Doc" />
              </div>
            ))}
          </div>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => setPreviewImage(null)} className="p-2 bg-white/10 text-white rounded-xl"><X size={22} /></button>
            <button onClick={() => downloadSingleImage(previewImage || '', "Doc.png")} className="p-2 bg-indigo-600 text-white rounded-xl"><Download size={20} /></button>
          </div>
          <div className="flex-1 flex items-center justify-center p-4"><img src={previewImage} className="max-w-full max-h-full object-contain" alt="Preview" /></div>
        </div>
      )}

      {isFormOpen && (
        <AdminForm 
          initialData={editingAdmin} 
          onClose={() => { setIsFormOpen(false); setEditingAdmin(null); }}
          onSave={(data) => {
            if (editingAdmin) {
              setAdmins(prev => prev.map(a => a.id === editingAdmin.id ? { ...a, ...data } as Admin : a));
            } else {
              setAdmins(prev => [...prev, { ...data, id: Date.now().toString(), rating: 0, status: 'Active' } as Admin]);
            }
            setIsFormOpen(false);
            setEditingAdmin(null);
          }}
        />
      )}

      {isRatingModalOpen && (
        <div className="fixed inset-0 z-[250] bg-black/60 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="glass w-full max-w-xs p-6 rounded-3xl text-center border border-slate-200 dark:border-slate-800">
            <h3 className="font-black text-lg mb-4 text-slate-900 dark:text-white">Update Rating</h3>
            <div className="flex justify-center gap-1.5 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => handleUpdateRating(isRatingModalOpen, star)} className="p-1 hover:scale-125 transition-all">
                  <Star size={30} className={star <= (admins.find(a => a.id === isRatingModalOpen)?.rating || 0) ? "fill-amber-400 text-amber-400" : "text-slate-200 dark:text-slate-700"} />
                </button>
              ))}
            </div>
            <button onClick={() => setIsRatingModalOpen(null)} className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-slate-100">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminForm = ({ initialData, onClose, onSave }: { initialData: Admin | null; onClose: () => void; onSave: (data: Partial<Admin>) => void }) => {
  const [formData, setFormData] = useState<Partial<Admin>>(initialData || {
    name: '', age: '', gender: 'Male', address: '', mobile: '', whatsapp: '', batch: '', 
    joinDate: new Date().toISOString().split('T')[0], currentTrainer: '', latestTrainer: '', facebookLink: '', documents: [], status: 'Active'
  });

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];
    const base64Files = await Promise.all(files.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target?.result as string);
        reader.readAsDataURL(file);
      });
    }));
    setFormData(prev => ({ ...prev, documents: [...(prev.documents || []), ...base64Files] }));
  };

  return (
    <div className="fixed inset-0 z-[120] bg-white dark:bg-slate-950 flex flex-col animate-in fade-in slide-in-from-right duration-400">
      <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex flex-col">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {initialData ? 'Edit Admin' : 'New Admin Account'}
          </h2>
          <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mt-1">
            BIOM TRAINER NETWORK
          </p>
        </div>
        <button 
          onClick={onClose} 
          className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400 transition-all active:scale-90"
        >
          <X size={24} strokeWidth={2.5} />
        </button>
      </div>
      
      <form 
        className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 pb-40" 
        onSubmit={(e) => { e.preventDefault(); onSave(formData); }}
      >
        <FormSection title="Personal Information" icon={<User size={18} />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormInput label="Full Name" value={formData.name || ''} onChange={v => setFormData({ ...formData, name: v })} placeholder="Admin's Legal Name" required />
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Age" type="number" value={formData.age || ''} onChange={v => setFormData({ ...formData, age: v })} placeholder="00" required />
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest px-1">Gender</label>
                <select 
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm transition-all shadow-sm appearance-none" 
                  value={formData.gender || 'Male'} 
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <FormInput label="Full Address" value={formData.address || ''} onChange={v => setFormData({ ...formData, address: v })} placeholder="Full permanent address" required />
            <FormInput label="Join Date" type="date" value={formData.joinDate || ''} onChange={v => setFormData({ ...formData, joinDate: v })} required />
          </div>
        </FormSection>

        <FormSection title="Contact & Connectivity" icon={<Phone size={18} />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormInput label="Mobile Number" type="tel" value={formData.mobile || ''} onChange={v => setFormData({ ...formData, mobile: v })} placeholder="01XXX-XXXXXX" required />
            <FormInput label="WhatsApp (Optional)" type="tel" value={formData.whatsapp || ''} onChange={v => setFormData({ ...formData, whatsapp: v })} placeholder="01XXX-XXXXXX" />
            <FormInput label="Facebook Profile Link" type="url" value={formData.facebookLink || ''} onChange={v => setFormData({ ...formData, facebookLink: v })} placeholder="https://facebook.com/..." required />
          </div>
        </FormSection>

        <FormSection title="Academic & Training" icon={<GraduationCap size={18} />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormInput label="Batch ID" value={formData.batch || ''} onChange={v => setFormData({ ...formData, batch: v })} placeholder="e.g. 20th Batch" required />
            <div className="hidden sm:block"></div>
            <FormInput label="Current Assigned Trainer" value={formData.currentTrainer || ''} onChange={v => setFormData({ ...formData, currentTrainer: v })} placeholder="Trainer Name" required />
            <FormInput label="Last Promoted By (Latest)" value={formData.latestTrainer || ''} onChange={v => setFormData({ ...formData, latestTrainer: v })} placeholder="Latest Trainer" required />
          </div>
        </FormSection>
        
        <FormSection title="Identity Verification" icon={<Files size={18} />}>
          <div className="space-y-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 italic">
              Upload photos of Identity Cards or Verification Documents.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              {formData.documents?.map((doc, i) => (
                <div key={i} className="relative w-28 h-28 group">
                  <img src={doc} className="w-full h-full object-cover rounded-[1.25rem] border-2 border-slate-100 dark:border-slate-700 shadow-lg" alt="Doc" />
                  <button 
                    type="button" 
                    onClick={() => setFormData({ ...formData, documents: formData.documents?.filter((_, idx) => idx !== i) })} 
                    className="absolute -top-3 -right-3 p-1.5 bg-red-500 text-white rounded-xl shadow-xl hover:scale-110 active:scale-90 transition-all border-2 border-white dark:border-slate-900"
                  >
                    <X size={16} strokeWidth={3} />
                  </button>
                </div>
              ))}
              <label className="w-28 h-28 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[1.25rem] cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all group active:scale-95">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Camera size={20} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Add Photo</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleDocUpload} />
              </label>
            </div>
          </div>
        </FormSection>
      </form>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white dark:from-slate-950 via-white/90 dark:via-slate-950/90 to-transparent flex gap-4 z-30">
        <button 
          type="button" 
          onClick={onClose}
          className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-base rounded-[1.5rem] transition-all active:scale-95 border border-slate-200 dark:border-slate-700"
        >
          Discard
        </button>
        <button 
          type="button" 
          onClick={() => onSave(formData)} 
          className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base rounded-[1.5rem] shadow-2xl shadow-indigo-500/40 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <UserCheck size={20} />
          {initialData ? 'Update Profile' : 'Confirm & Save'}
        </button>
      </div>
    </div>
  );
};

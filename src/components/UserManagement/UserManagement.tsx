import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Edit3, 
  Mail, 
  Building2, 
  Lock, 
  X, 
  Save,
  Search,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserAccount } from '../../types';

export const UserManagement: React.FC = () => {
  const { users, currentUser, addUser, updateUser, deleteUser, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    if (!isAddModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsAddModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddModalOpen]);

  // Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserAccount['role']>('Appraiser');
  const [department, setDepartment] = useState('Appraisal & Assessment Division');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFullName('');
    setUsername('');
    setEmail('');
    setRole('Appraiser');
    setDepartment('Appraisal & Assessment Division');
    setStatus('Active');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (user: UserAccount) => {
    setEditingUser(user);
    setFullName(user.fullName);
    setUsername(user.username);
    setEmail(user.email);
    setRole(user.role);
    setDepartment(user.department);
    setStatus(user.status);
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !username.trim() || !email.trim()) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      if (editingUser) {
        updateUser(editingUser.id, {
          fullName: fullName.trim(),
          username: username.trim(),
          email: email.trim(),
          role,
          department,
          status,
        });
      } else {
        addUser({
          fullName: fullName.trim(),
          username: username.trim(),
          email: email.trim(),
          role,
          department,
          status,
          avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 90000000)}?w=150&auto=format&fit=crop&q=80`,
        });
      }
      setIsSubmitting(false);
      setIsAddModalOpen(false);
    }, 300);
  };

  return (
    <div id="user-management-view" className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-blue-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
              Assessor Staff & Role Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage municipal assessors, appraisers, tax mappers, and archival records officers
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 sm:flex-initial">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search personnel..."
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-blue-100 rounded-full focus:bg-white focus:ring-2 focus:ring-blue-200 text-slate-800"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-3.5 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-md shadow-blue-100 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff Account</span>
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/70 border-b border-blue-50 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              <th className="p-4">Personnel Profile</th>
              <th className="p-4">Assigned Role</th>
              <th className="p-4">Department / Division</th>
              <th className="p-4">Account Status</th>
              <th className="p-4">Last Activity</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-50">
            {filteredUsers.map((user) => {
              const isSelf = currentUser.id === user.id;

              return (
                <tr key={user.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-blue-100"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-slate-800">{user.fullName}</p>
                          {isSelf && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">@{user.username} &bull; {user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      <ShieldCheck className="w-3 h-3 text-blue-600" />
                      <span>{user.role}</span>
                    </span>
                  </td>

                  <td className="p-4">
                    <p className="font-medium text-slate-700">{user.department}</p>
                  </td>

                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        user.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {user.status === 'Active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{user.status}</span>
                    </span>
                  </td>

                  <td className="p-4 text-slate-500 text-[11px]">
                    {user.lastLogin || 'Never'}
                  </td>

                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(user)}
                        title="Edit User Profile"
                        className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm(`Remove user account for ${user.fullName}?`)) {
                            deleteUser(user.id);
                          }
                        }}
                        disabled={isSelf}
                        title={isSelf ? 'Cannot delete your active account' : 'Delete Account'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isSelf
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-slate-400 hover:text-rose-700 hover:bg-rose-50 cursor-pointer'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div 
            id="user-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsAddModalOpen(false);
            }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div 
              id="user-modal-card"
              initial={{ opacity: 0, scale: 0.96, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 14 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="bg-white rounded-2xl shadow-2xl border border-blue-100 max-w-md w-full overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-5 flex items-center justify-between">
                <h3 className="font-bold text-base">
                  {editingUser ? 'Edit Staff Account' : 'Add New Staff Account'}
                </h3>
                <button 
                  onClick={() => setIsAddModalOpen(false)} 
                  title="Press Esc to close"
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Full Name & Title</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Atty. Eduardo M. Santos, REA"
                    className="w-full px-3 py-2 bg-slate-50 border border-blue-100 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Username</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. e.santos"
                      className="w-full px-3 py-2 bg-slate-50 border border-blue-100 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-blue-100 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.santos@assessor.gov.ph"
                    className="w-full px-3 py-2 bg-slate-50 border border-blue-100 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Role Designation</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-blue-100 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="Municipal Assessor">Municipal Assessor (Chief Executive / Approval)</option>
                    <option value="Assistant Assessor">Assistant Assessor (Deputy Review)</option>
                    <option value="Appraiser">Appraiser (Valuation & Assessment)</option>
                    <option value="Tax Mapper">Tax Mapper (PIN & Cadastral Mapping)</option>
                    <option value="Records Officer">Records Officer (Archival & Certificates)</option>
                    <option value="Viewer">Public / Viewer (Read Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Assessment & Valuation Division"
                    className="w-full px-3 py-2 bg-slate-50 border border-blue-100 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-[10px]">Esc</kbd> to close</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-100 cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>{editingUser ? 'Save User' : 'Create Account'}</span>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

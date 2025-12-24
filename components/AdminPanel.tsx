import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Shield, Search, Coins, Save, Edit2, RefreshCw } from 'lucide-react';

interface AdminPanelProps {
  users: User[];
  onUpdateCredits: (email: string, amount: number) => void;
  onRefresh: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ users, onUpdateCredits, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleSave = (email: string) => {
    const amount = parseInt(editAmount);
    if (!isNaN(amount) && amount >= 0) {
      onUpdateCredits(email, amount);
    }
    setEditingEmail(null);
    setEditAmount('');
  };

  const startEdit = (user: User) => {
    setEditingEmail(user.email);
    setEditAmount(user.credits.toString());
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="text-brand-500" size={32} />
            Bảng quản trị
          </h2>
          <p className="text-slate-400 mt-1">Quản lý người dùng và cấp phát điểm.</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-brand-500 outline-none placeholder:text-slate-600"
            />
          </div>
          <div className="text-sm text-slate-500 font-medium">
            Tổng người dùng: <span className="text-brand-400 font-bold ml-1">{users.length}</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Người dùng</th>
                <th className="px-6 py-4 font-semibold">Vai trò</th>
                <th className="px-6 py-4 font-semibold">Điểm</th>
                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredUsers.map((user) => (
                <tr key={user.email} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                        {user.email[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-white">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${
                      user.role === UserRole.ADMIN 
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {editingEmail === user.email ? (
                      <input 
                        type="number" 
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="w-24 bg-slate-950 border border-brand-500 rounded px-2 py-1 text-white text-sm focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-brand-300">
                        <Coins size={14} />
                        <span className="font-bold">{user.credits}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingEmail === user.email ? (
                      <button 
                        onClick={() => handleSave(user.email)}
                        className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg transition-colors shadow-lg shadow-green-900/20 flex items-center gap-2 ml-auto"
                      >
                        <Save size={16} /> Lưu
                      </button>
                    ) : (
                      <button 
                        onClick={() => startEdit(user)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ml-auto text-sm"
                      >
                        <Edit2 size={16} /> Cập nhật
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              Không tìm thấy người dùng nào "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
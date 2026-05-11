import { useState, useEffect } from 'react';
import { userAPI } from '../api/services';
import { getErrorMessage, formatDateTime } from '../utils/helpers';
import Spinner from '../components/shared/Spinner';
import toast from 'react-hot-toast';
import { RiShieldLine, RiUserLine, RiToggleLine, RiToggleFill } from 'react-icons/ri';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [toggling, setToggling] = useState(null);

  const load = async (page = 1) => {
    try {
      setLoading(true);
      const { data } = await userAPI.getAll({ page, limit: 20 });
      setUsers(data.data.users);
      setPagination(data.data.pagination);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (id) => {
    setToggling(id);
    try {
      const { data } = await userAPI.toggleStatus(id);
      setUsers(prev => prev.map(u => u._id === id ? data.data.user : u));
      toast.success(data.message);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-violet-500/20 flex items-center justify-center">
          <RiShieldLine size={16} className="text-violet-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <p className="text-sm text-gray-500">{pagination?.total || 0} total users</p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Users', val: pagination?.total || 0, color: 'text-white' },
          { label: 'Active', val: users.filter(u => u.isActive).length, color: 'text-emerald-400' },
          { label: 'Admins', val: users.filter(u => u.role === 'admin').length, color: 'text-violet-400' },
        ].map(({ label, val, color }) => (
          <div key={label} className="card text-center py-3">
            <p className="text-xs text-gray-500">{label}</p>
            <p className={`font-bold text-lg ${color}`}>{val}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5">
          <h2 className="font-semibold text-sm">All Users</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12"><Spinner /></div>
        ) : (
          <div className="divide-y divide-white/5">
            {users.map(u => (
              <div key={u._id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/2 transition-colors">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-sm font-semibold text-indigo-300 shrink-0">
                  {u.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.name}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>
                <div className="hidden sm:block text-xs text-gray-600">
                  {u.lastLogin ? formatDateTime(u.lastLogin) : 'Never'}
                </div>
                <span className={`badge ${u.role === 'admin' ? 'badge-purple' : 'badge-blue'} shrink-0`}>
                  {u.role}
                </span>
                <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'} shrink-0`}>
                  {u.isActive ? 'active' : 'disabled'}
                </span>
                <button
                  onClick={() => handleToggle(u._id)}
                  disabled={toggling === u._id}
                  title={u.isActive ? 'Deactivate user' : 'Activate user'}
                  className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                    u.isActive
                      ? 'hover:bg-red-500/10 text-emerald-400 hover:text-red-400'
                      : 'hover:bg-emerald-500/10 text-red-400 hover:text-emerald-400'
                  }`}
                >
                  {toggling === u._id
                    ? <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    : u.isActive ? <RiToggleFill size={18} /> : <RiToggleLine size={18} />
                  }
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => load(pagination.page - 1)} disabled={pagination.page <= 1}
            className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-30">← Prev</button>
          <span className="text-sm text-gray-500 flex items-center">{pagination.page} / {pagination.pages}</span>
          <button onClick={() => load(pagination.page + 1)} disabled={pagination.page >= pagination.pages}
            className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-30">Next →</button>
        </div>
      )}
    </div>
  );
}

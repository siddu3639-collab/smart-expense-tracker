import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api/services';
import { getErrorMessage, formatDateTime } from '../utils/helpers';
import toast from 'react-hot-toast';
import { RiUserLine, RiLockLine, RiShieldLine } from 'react-icons/ri';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');

  const [profile, setProfile] = useState({ name: user?.name || '', currency: user?.currency || 'INR' });
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdErrors, setPwdErrors] = useState({});

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profile.name.trim() || profile.name.length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }
    setProfileLoading(true);
    try {
      const { data } = await userAPI.updateProfile(profile);
      updateUser(data.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!passwords.currentPassword) errs.currentPassword = 'Current password required';
    if (!passwords.newPassword || passwords.newPassword.length < 6) errs.newPassword = 'Min. 6 characters';
    if (passwords.newPassword !== passwords.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setPwdErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setPwdLoading(true);
    try {
      await userAPI.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwdErrors({});
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPwdLoading(false);
    }
  };

  const setPwd = (f) => (e) => { setPasswords(p => ({ ...p, [f]: e.target.value })); setPwdErrors(p => ({ ...p, [f]: '' })); };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: RiUserLine },
    { id: 'security', label: 'Security', icon: RiLockLine },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-xl font-bold">Account Settings</h1>
        <p className="text-sm text-gray-500">Manage your profile and preferences</p>
      </div>

      {/* Avatar card */}
      <div className="card flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl font-bold text-indigo-300">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-semibold">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`badge ${user?.role === 'admin' ? 'badge-purple' : 'badge-blue'}`}>
              {user?.role === 'admin' ? '👑' : '👤'} {user?.role}
            </span>
            {user?.lastLogin && (
              <span className="text-xs text-gray-600">Last login: {formatDateTime(user.lastLogin)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/5 pb-0">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === id ? 'border-indigo-500 text-indigo-300' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <form onSubmit={handleProfileSave} className="card space-y-4 animate-fade-in">
          <div>
            <label className="label">Full Name</label>
            <input type="text" className="input" value={profile.name}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} placeholder="Your name" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input opacity-50 cursor-not-allowed" value={user?.email} disabled />
            <p className="text-xs text-gray-600 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="label">Currency</label>
            <select className="input" value={profile.currency} onChange={e => setProfile(p => ({ ...p, currency: e.target.value }))}>
              {[['INR', '₹ Indian Rupee'], ['USD', '$ US Dollar'], ['EUR', '€ Euro'], ['GBP', '£ British Pound']].map(([val, label]) => (
                <option key={val} value={val} style={{ background: '#1a1d2e' }}>{label}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={profileLoading} className="btn-primary w-full">
            {profileLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {/* Security tab */}
      {tab === 'security' && (
        <form onSubmit={handlePasswordChange} className="card space-y-4 animate-fade-in">
          <div>
            <label className="label">Current Password</label>
            <input type="password" className={`input ${pwdErrors.currentPassword ? 'border-red-500/50' : ''}`}
              value={passwords.currentPassword} onChange={setPwd('currentPassword')} placeholder="••••••••" />
            {pwdErrors.currentPassword && <p className="text-xs text-red-400 mt-1">{pwdErrors.currentPassword}</p>}
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className={`input ${pwdErrors.newPassword ? 'border-red-500/50' : ''}`}
              value={passwords.newPassword} onChange={setPwd('newPassword')} placeholder="Min. 6 characters with a number" />
            {pwdErrors.newPassword && <p className="text-xs text-red-400 mt-1">{pwdErrors.newPassword}</p>}
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" className={`input ${pwdErrors.confirmPassword ? 'border-red-500/50' : ''}`}
              value={passwords.confirmPassword} onChange={setPwd('confirmPassword')} placeholder="Repeat new password" />
            {pwdErrors.confirmPassword && <p className="text-xs text-red-400 mt-1">{pwdErrors.confirmPassword}</p>}
          </div>
          <button type="submit" disabled={pwdLoading} className="btn-primary w-full">
            {pwdLoading ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      )}
    </div>
  );
}

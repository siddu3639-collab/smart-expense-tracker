import { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import { GOAL_CATEGORIES } from '../../utils/helpers';
import { format, addMonths } from 'date-fns';

const GOAL_ICONS = ['🎯', '✈️', '🏠', '🚗', '📚', '💍', '🏖️', '💪', '🎓', '💰'];

const defaultForm = {
  title: '', description: '', targetAmount: '', savedAmount: '',
  targetDate: format(addMonths(new Date(), 6), 'yyyy-MM-dd'),
  category: 'Other', icon: '🎯', color: '#6366f1',
};

export default function GoalForm({ isOpen, onClose, onSubmit, editData = null }) {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title || '',
        description: editData.description || '',
        targetAmount: editData.targetAmount || '',
        savedAmount: editData.savedAmount || '',
        targetDate: format(new Date(editData.targetDate), 'yyyy-MM-dd'),
        category: editData.category || 'Other',
        icon: editData.icon || '🎯',
        color: editData.color || '#6366f1',
      });
    } else {
      setForm(defaultForm);
    }
    setErrors({});
  }, [editData, isOpen]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title required';
    if (!form.targetAmount || parseFloat(form.targetAmount) <= 0) e.targetAmount = 'Valid target amount required';
    if (!form.targetDate) e.targetDate = 'Target date required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({
        ...form,
        targetAmount: parseFloat(form.targetAmount),
        savedAmount: parseFloat(form.savedAmount) || 0,
      });
      onClose();
    } catch {}
    finally { setLoading(false); }
  };

  const set = (f) => (e) => { setForm(p => ({ ...p, [f]: e.target.value })); setErrors(p => ({ ...p, [f]: '' })); };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Edit Goal' : 'New Savings Goal'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Icon picker */}
        <div>
          <label className="label">Icon</label>
          <div className="flex gap-2 flex-wrap">
            {GOAL_ICONS.map(icon => (
              <button
                key={icon}
                type="button"
                onClick={() => setForm(p => ({ ...p, icon }))}
                className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                  form.icon === icon ? 'bg-indigo-500/20 border border-indigo-500/40 scale-110' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Goal Title</label>
          <input type="text" className={`input ${errors.title ? 'border-red-500/50' : ''}`}
            placeholder="e.g. Europe Trip 2025" value={form.title} onChange={set('title')} autoFocus />
          {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="label">Description <span className="text-gray-600">(optional)</span></label>
          <input type="text" className="input" placeholder="What are you saving for?"
            value={form.description} onChange={set('description')} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Target Amount (₹)</label>
            <input type="number" min="1" className={`input ${errors.targetAmount ? 'border-red-500/50' : ''}`}
              placeholder="0" value={form.targetAmount} onChange={set('targetAmount')} />
            {errors.targetAmount && <p className="text-xs text-red-400 mt-1">{errors.targetAmount}</p>}
          </div>
          <div>
            <label className="label">Already Saved (₹)</label>
            <input type="number" min="0" className="input" placeholder="0"
              value={form.savedAmount} onChange={set('savedAmount')} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Target Date</label>
            <input type="date" className={`input ${errors.targetDate ? 'border-red-500/50' : ''}`}
              value={form.targetDate} onChange={set('targetDate')} />
            {errors.targetDate && <p className="text-xs text-red-400 mt-1">{errors.targetDate}</p>}
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={set('category')}>
              {GOAL_CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#1a1d2e' }}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : editData ? 'Update Goal' : 'Create Goal'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

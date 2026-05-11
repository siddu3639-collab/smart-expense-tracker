import { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import { EXPENSE_CATEGORIES } from '../../utils/helpers';
import { getCurrentMonthYear } from '../../utils/helpers';

const { month, year } = getCurrentMonthYear();

const defaultForm = { category: 'Food & Dining', limit: '', month, year, alertThreshold: 80, notes: '' };

export default function BudgetForm({ isOpen, onClose, onSubmit, editData = null }) {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        category: editData.category || 'Food & Dining',
        limit: editData.limit || '',
        month: editData.month || month,
        year: editData.year || year,
        alertThreshold: editData.alertThreshold || 80,
        notes: editData.notes || '',
      });
    } else {
      setForm(defaultForm);
    }
    setErrors({});
  }, [editData, isOpen]);

  const validate = () => {
    const e = {};
    if (!form.category) e.category = 'Category required';
    if (!form.limit || parseFloat(form.limit) <= 0) e.limit = 'Valid limit required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({ ...form, limit: parseFloat(form.limit), month: parseInt(form.month), year: parseInt(form.year) });
      onClose();
    } catch {}
    finally { setLoading(false); }
  };

  const set = (f) => (e) => { setForm(p => ({ ...p, [f]: e.target.value })); setErrors(p => ({ ...p, [f]: '' })); };

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Edit Budget' : 'Set Budget'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Category</label>
          <select className="input" value={form.category} onChange={set('category')}>
            {EXPENSE_CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#1a1d2e' }}>{c}</option>)}
          </select>
          {errors.category && <p className="text-xs text-red-400 mt-1">{errors.category}</p>}
        </div>

        <div>
          <label className="label">Monthly Limit (₹)</label>
          <input type="number" min="1" className={`input ${errors.limit ? 'border-red-500/50' : ''}`}
            placeholder="Enter budget amount" value={form.limit} onChange={set('limit')} />
          {errors.limit && <p className="text-xs text-red-400 mt-1">{errors.limit}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Month</label>
            <select className="input" value={form.month} onChange={set('month')}>
              {monthNames.map((name, i) => <option key={i} value={i + 1} style={{ background: '#1a1d2e' }}>{name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Year</label>
            <input type="number" className="input" value={form.year} onChange={set('year')} min="2020" max="2100" />
          </div>
        </div>

        <div>
          <label className="label">Alert at <span className="text-indigo-400 font-mono">{form.alertThreshold}%</span></label>
          <input type="range" min="50" max="100" step="5" className="w-full accent-indigo-500"
            value={form.alertThreshold} onChange={set('alertThreshold')} />
        </div>

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : editData ? 'Update' : 'Set Budget'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

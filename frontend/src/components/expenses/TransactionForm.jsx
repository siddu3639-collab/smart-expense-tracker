import { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import { EXPENSE_CATEGORIES, CATEGORY_ICONS } from '../../utils/helpers';
import { format } from 'date-fns';

const defaultForm = {
  title: '', amount: '', type: 'expense',
  category: 'Food & Dining', date: format(new Date(), 'yyyy-MM-dd'), notes: '',
};

export default function TransactionForm({ isOpen, onClose, onSubmit, editData = null }) {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title || '',
        amount: editData.amount || '',
        type: editData.type || 'expense',
        category: editData.category || 'Food & Dining',
        date: format(new Date(editData.date), 'yyyy-MM-dd'),
        notes: editData.notes || '',
      });
    } else {
      setForm(defaultForm);
    }
    setErrors({});
  }, [editData, isOpen]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.amount || parseFloat(form.amount) <= 0) e.amount = 'Valid amount required';
    if (!form.category) e.category = 'Category is required';
    if (!form.date) e.date = 'Date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({ ...form, amount: parseFloat(form.amount) });
      onClose();
    } catch {}
    finally { setLoading(false); }
  };

  const set = (f) => (e) => { setForm(p => ({ ...p, [f]: e.target.value })); setErrors(p => ({ ...p, [f]: '' })); };

  const allCategories = form.type === 'income' ? ['Income', ...EXPENSE_CATEGORIES] : EXPENSE_CATEGORIES;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Edit Transaction' : 'Add Transaction'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type toggle */}
        <div className="flex rounded-xl overflow-hidden border border-white/10 p-0.5 bg-white/3">
          {['expense', 'income'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setForm(p => ({ ...p, type: t, category: t === 'income' ? 'Income' : 'Food & Dining' }))}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                form.type === t
                  ? t === 'expense' ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t === 'expense' ? '↑ Expense' : '↓ Income'}
            </button>
          ))}
        </div>

        <div>
          <label className="label">Title</label>
          <input type="text" className={`input ${errors.title ? 'border-red-500/50' : ''}`}
            placeholder="e.g. Coffee, Salary..." value={form.title} onChange={set('title')} autoFocus />
          {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Amount (₹)</label>
            <input type="number" min="0.01" step="0.01" className={`input ${errors.amount ? 'border-red-500/50' : ''}`}
              placeholder="0.00" value={form.amount} onChange={set('amount')} />
            {errors.amount && <p className="text-xs text-red-400 mt-1">{errors.amount}</p>}
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" className={`input ${errors.date ? 'border-red-500/50' : ''}`}
              value={form.date} onChange={set('date')} />
          </div>
        </div>

        <div>
          <label className="label">Category</label>
          <select className="input" value={form.category} onChange={set('category')}>
            {allCategories.map(c => (
              <option key={c} value={c} style={{ background: '#1a1d2e' }}>
                {CATEGORY_ICONS[c]} {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Notes <span className="text-gray-600">(optional)</span></label>
          <textarea className="input resize-none" rows={2} placeholder="Add a note..."
            value={form.notes} onChange={set('notes')} />
        </div>

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : editData ? 'Update' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

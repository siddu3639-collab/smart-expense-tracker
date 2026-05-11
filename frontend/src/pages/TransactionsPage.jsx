import { useState, useCallback } from 'react';
import { useExpenses } from '../hooks/useData';
import { formatCurrency, formatDate, CATEGORY_COLORS, CATEGORY_ICONS, EXPENSE_CATEGORIES } from '../utils/helpers';
import Spinner from '../components/shared/Spinner';
import EmptyState from '../components/shared/EmptyState';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import TransactionForm from '../components/expenses/TransactionForm';
import { RiAddLine, RiSearchLine, RiEdit2Line, RiDeleteBin2Line, RiFilterLine } from 'react-icons/ri';

export default function TransactionsPage() {
  const { expenses, pagination, loading, load, createExpense, updateExpense, deleteExpense } = useExpenses();

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [filters, setFilters] = useState({ search: '', type: '', category: '', page: 1 });
  const [showFilters, setShowFilters] = useState(false);

  const applyFilters = useCallback((updated) => {
    const f = { ...filters, ...updated, page: 1 };
    setFilters(f);
    load({ search: f.search, type: f.type, category: f.category, page: f.page, limit: 20 });
  }, [filters, load]);

  const handlePageChange = (page) => {
    const f = { ...filters, page };
    setFilters(f);
    load({ search: f.search, type: f.type, category: f.category, page, limit: 20 });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await deleteExpense(deleteId); setDeleteId(null); }
    catch {}
    finally { setDeleting(false); }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Transactions</h1>
          <p className="text-sm text-gray-500">{pagination?.total || 0} total</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowForm(true); }} className="btn-primary flex items-center gap-1.5 text-sm py-2">
          <RiAddLine size={15} /> Add
        </button>
      </div>

      {/* Search + Filters */}
      <div className="card p-3 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
            <input
              type="text"
              className="input pl-9 text-sm py-2"
              placeholder="Search transactions..."
              value={filters.search}
              onChange={e => applyFilters({ search: e.target.value })}
            />
          </div>
          <button
            onClick={() => setShowFilters(p => !p)}
            className={`btn-secondary text-sm py-2 px-3 flex items-center gap-1.5 ${showFilters ? 'border-indigo-500/40 text-indigo-300' : ''}`}
          >
            <RiFilterLine size={14} /> Filter
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 gap-2 pt-1 animate-fade-in">
            <div>
              <label className="label text-xs">Type</label>
              <select className="input text-sm py-2" value={filters.type} onChange={e => applyFilters({ type: e.target.value })}>
                <option value="">All types</option>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <label className="label text-xs">Category</label>
              <select className="input text-sm py-2" value={filters.category} onChange={e => applyFilters({ category: e.target.value })}>
                <option value="">All categories</option>
                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Active filters pills */}
        {(filters.type || filters.category) && (
          <div className="flex gap-2 flex-wrap">
            {filters.type && (
              <span className="badge badge-blue gap-1">
                {filters.type}
                <button onClick={() => applyFilters({ type: '' })} className="ml-0.5 hover:text-white">×</button>
              </span>
            )}
            {filters.category && (
              <span className="badge badge-purple gap-1">
                {filters.category}
                <button onClick={() => applyFilters({ category: '' })} className="ml-0.5 hover:text-white">×</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Transaction list */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner />
          </div>
        ) : expenses.length === 0 ? (
          <EmptyState
            icon="💸"
            title="No transactions found"
            description="Add your first transaction to start tracking your finances."
            action={
              <button onClick={() => { setEditItem(null); setShowForm(true); }} className="btn-primary text-sm">
                + Add Transaction
              </button>
            }
          />
        ) : (
          <div className="divide-y divide-white/5">
            {expenses.map((tx) => (
              <div key={tx._id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/2 transition-colors group">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                  style={{ background: `${CATEGORY_COLORS[tx.category]}20` }}>
                  {CATEGORY_ICONS[tx.category] || '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tx.title}</p>
                  <p className="text-xs text-gray-500">
                    <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: CATEGORY_COLORS[tx.category] || '#6b7280' }} />
                    {tx.category} · {formatDate(tx.date)}
                  </p>
                </div>
                <div className="text-right mr-2">
                  <p className={`text-sm font-semibold font-mono ${tx.type === 'income' ? 'text-emerald-400' : 'text-gray-200'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                  <span className={`text-xs ${tx.type === 'income' ? 'text-emerald-500' : 'text-gray-600'}`}>
                    {tx.type}
                  </span>
                </div>
                {/* Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditItem(tx); setShowForm(true); }}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-gray-200 transition-colors"
                  >
                    <RiEdit2Line size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteId(tx._id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <RiDeleteBin2Line size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(filters.page - 1)}
            disabled={filters.page <= 1}
            className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-30"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-500">
            {filters.page} / {pagination.pages}
          </span>
          <button
            onClick={() => handlePageChange(filters.page + 1)}
            disabled={filters.page >= pagination.pages}
            className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}

      {/* Modals */}
      <TransactionForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={editItem ? (data) => updateExpense(editItem._id, data) : createExpense}
        editData={editItem}
      />
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
      />
    </div>
  );
}

import { useState } from 'react';
import { useBudgets } from '../hooks/useData';
import { formatCurrency, CATEGORY_COLORS, CATEGORY_ICONS, getCurrentMonthYear, getMonthName } from '../utils/helpers';
import Spinner from '../components/shared/Spinner';
import EmptyState from '../components/shared/EmptyState';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import BudgetForm from '../components/budgets/BudgetForm';
import { RiAddLine, RiEdit2Line, RiDeleteBin2Line, RiAlertLine } from 'react-icons/ri';

const { month: curMonth, year: curYear } = getCurrentMonthYear();

export default function BudgetsPage() {
  const [viewMonth, setViewMonth] = useState(curMonth);
  const [viewYear, setViewYear] = useState(curYear);
  const { budgets, loading, load, createBudget, updateBudget, deleteBudget } = useBudgets({ month: viewMonth, year: viewYear });

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const changeMonth = (dir) => {
    let m = viewMonth + dir;
    let y = viewYear;
    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }
    setViewMonth(m);
    setViewYear(y);
    load({ month: m, year: y });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await deleteBudget(deleteId); setDeleteId(null); }
    catch {}
    finally { setDeleting(false); }
  };

  const totalBudgeted = budgets.reduce((a, b) => a + b.limit, 0);
  const totalSpent = budgets.reduce((a, b) => a + (b.spent || 0), 0);

  return (
    <div className="p-4 md:p-6 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Budgets</h1>
          <p className="text-sm text-gray-500">Plan your monthly spending</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowForm(true); }} className="btn-primary flex items-center gap-1.5 text-sm py-2">
          <RiAddLine size={15} /> Set Budget
        </button>
      </div>

      {/* Month navigation */}
      <div className="flex items-center gap-3">
        <button onClick={() => changeMonth(-1)} className="btn-secondary py-1.5 px-3 text-sm">←</button>
        <span className="font-semibold text-sm w-28 text-center">{getMonthName(viewMonth)} {viewYear}</span>
        <button onClick={() => changeMonth(1)} className="btn-secondary py-1.5 px-3 text-sm">→</button>
      </div>

      {/* Summary */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Budgeted', val: formatCurrency(totalBudgeted), color: 'text-indigo-400' },
            { label: 'Spent', val: formatCurrency(totalSpent), color: totalSpent > totalBudgeted ? 'text-red-400' : 'text-gray-200' },
            { label: 'Remaining', val: formatCurrency(Math.max(totalBudgeted - totalSpent, 0)), color: 'text-emerald-400' },
          ].map(({ label, val, color }) => (
            <div key={label} className="card text-center py-3">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`font-semibold font-mono text-sm ${color}`}>{val}</p>
            </div>
          ))}
        </div>
      )}

      {/* Budgets list */}
      {loading ? (
        <div className="flex items-center justify-center py-16"><Spinner /></div>
      ) : budgets.length === 0 ? (
        <EmptyState
          icon="💰"
          title="No budgets set"
          description={`Set spending limits for ${getMonthName(viewMonth)} ${viewYear} to stay on track.`}
          action={<button onClick={() => setShowForm(true)} className="btn-primary text-sm">+ Set Budget</button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {budgets.map(budget => (
            <div key={budget._id} className="card hover:border-white/10 transition-colors group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                    style={{ background: `${CATEGORY_COLORS[budget.category]}20` }}>
                    {CATEGORY_ICONS[budget.category] || '📦'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{budget.category}</p>
                    <p className="text-xs text-gray-500 font-mono">{formatCurrency(budget.spent || 0)} / {formatCurrency(budget.limit)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {budget.isAlert && !budget.isOverBudget && (
                    <span title="Approaching limit"><RiAlertLine className="text-amber-400" size={14} /></span>
                  )}
                  <button onClick={() => { setEditItem(budget); setShowForm(true); }}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-gray-200 transition-colors">
                    <RiEdit2Line size={13} />
                  </button>
                  <button onClick={() => setDeleteId(budget._id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors">
                    <RiDeleteBin2Line size={13} />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="progress-bar mb-2">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(budget.percentage || 0, 100)}%`,
                    background: budget.isOverBudget
                      ? '#ef4444'
                      : budget.isAlert
                      ? '#f59e0b'
                      : CATEGORY_COLORS[budget.category] || '#6366f1',
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className={
                  budget.isOverBudget ? 'text-red-400' :
                  budget.isAlert ? 'text-amber-400' : 'text-gray-500'
                }>
                  {budget.isOverBudget ? '⚠ Over budget!' :
                   budget.isAlert ? `${budget.percentage}% used` :
                   `${budget.percentage}% used`}
                </span>
                <span className="text-gray-500 font-mono">{formatCurrency(budget.remaining)} left</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <BudgetForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={editItem ? (d) => updateBudget(editItem._id, d) : createBudget}
        editData={editItem}
      />
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Budget"
        message="Remove this budget? Your transaction data won't be affected."
      />
    </div>
  );
}

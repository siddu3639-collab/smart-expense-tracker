import { useState } from 'react';
import { useGoals } from '../hooks/useData';
import { formatCurrency, formatDate } from '../utils/helpers';
import Spinner from '../components/shared/Spinner';
import EmptyState from '../components/shared/EmptyState';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import GoalForm from '../components/goals/GoalForm';
import Modal from '../components/shared/Modal';
import { RiAddLine, RiEdit2Line, RiDeleteBin2Line, RiCheckLine } from 'react-icons/ri';
import { differenceInDays } from 'date-fns';

const STATUS_STYLES = {
  active: 'badge-blue',
  completed: 'badge-green',
  paused: 'badge-yellow',
};

export default function GoalsPage() {
  const { goals, loading, createGoal, updateGoal, deleteGoal, contributeToGoal } = useGoals();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [contributeGoal, setContributeGoal] = useState(null);
  const [contribAmount, setContribAmount] = useState('');
  const [contribLoading, setContribLoading] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try { await deleteGoal(deleteId); setDeleteId(null); }
    catch {}
    finally { setDeleting(false); }
  };

  const handleContribute = async () => {
    const amt = parseFloat(contribAmount);
    if (!amt || amt <= 0) return;
    setContribLoading(true);
    try {
      await contributeToGoal(contributeGoal._id, amt);
      setContributeGoal(null);
      setContribAmount('');
    } catch {}
    finally { setContribLoading(false); }
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <div className="p-4 md:p-6 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Savings Goals</h1>
          <p className="text-sm text-gray-500">{activeGoals.length} active · {completedGoals.length} completed</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowForm(true); }} className="btn-primary flex items-center gap-1.5 text-sm py-2">
          <RiAddLine size={15} /> New Goal
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Spinner /></div>
      ) : goals.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="No savings goals yet"
          description="Set a target, track your progress, and achieve your financial dreams."
          action={<button onClick={() => setShowForm(true)} className="btn-primary text-sm">+ Create Goal</button>}
        />
      ) : (
        <>
          {activeGoals.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-gray-400 mb-3">Active Goals</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeGoals.map(goal => <GoalCard key={goal._id} goal={goal} onEdit={() => { setEditItem(goal); setShowForm(true); }} onDelete={() => setDeleteId(goal._id)} onContribute={() => setContributeGoal(goal)} />)}
              </div>
            </div>
          )}

          {completedGoals.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-gray-400 mb-3">Completed 🎉</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {completedGoals.map(goal => <GoalCard key={goal._id} goal={goal} onEdit={() => { setEditItem(goal); setShowForm(true); }} onDelete={() => setDeleteId(goal._id)} />)}
              </div>
            </div>
          )}
        </>
      )}

      <GoalForm isOpen={showForm} onClose={() => setShowForm(false)}
        onSubmit={editItem ? (d) => updateGoal(editItem._id, d) : createGoal} editData={editItem} />

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={handleDelete} loading={deleting}
        title="Delete Goal" message="Delete this savings goal? Your progress data will be lost." />

      {/* Contribute modal */}
      <Modal isOpen={!!contributeGoal} onClose={() => { setContributeGoal(null); setContribAmount(''); }} title="Add Contribution" size="sm">
        <p className="text-sm text-gray-400 mb-4">
          Adding to <span className="text-white font-medium">{contributeGoal?.title}</span>
          <br />
          <span className="text-xs">Remaining: {formatCurrency(contributeGoal ? contributeGoal.targetAmount - contributeGoal.savedAmount : 0)}</span>
        </p>
        <div className="space-y-3">
          <div>
            <label className="label">Amount (₹)</label>
            <input type="number" min="1" className="input" placeholder="Enter amount"
              value={contribAmount} onChange={e => setContribAmount(e.target.value)} autoFocus />
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setContributeGoal(null); setContribAmount(''); }} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleContribute} disabled={contribLoading || !contribAmount} className="btn-primary flex-1">
              {contribLoading ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Add'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function GoalCard({ goal, onEdit, onDelete, onContribute }) {
  const progress = goal.progressPercent || Math.min(Math.round((goal.savedAmount / goal.targetAmount) * 100), 100);
  const daysLeft = differenceInDays(new Date(goal.targetDate), new Date());
  const isCompleted = goal.status === 'completed';

  return (
    <div className={`card hover:border-white/10 transition-colors group ${isCompleted ? 'opacity-80' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: `${goal.color}20` }}>
            {goal.icon || '🎯'}
          </div>
          <div>
            <p className="text-sm font-semibold">{goal.title}</p>
            <span className={`badge ${STATUS_STYLES[goal.status]} text-xs`}>{goal.status}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isCompleted && onContribute && (
            <button onClick={onContribute} className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-gray-500 hover:text-emerald-400 transition-colors" title="Add contribution">
              <RiCheckLine size={13} />
            </button>
          )}
          <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-gray-200 transition-colors">
            <RiEdit2Line size={13} />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors">
            <RiDeleteBin2Line size={13} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span className="font-mono">{formatCurrency(goal.savedAmount)}</span>
          <span className="font-mono">{formatCurrency(goal.targetAmount)}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%`, background: isCompleted ? '#10b981' : goal.color }} />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className={`font-semibold ${isCompleted ? 'text-emerald-400' : 'text-gray-300'}`}>{progress}% saved</span>
          <span className="text-gray-500">
            {isCompleted ? '✅ Completed!' : daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}
          </span>
        </div>
      </div>

      {goal.description && <p className="text-xs text-gray-600 mt-2 truncate">{goal.description}</p>}
    </div>
  );
}

import { useDashboard } from '../hooks/useData';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, CATEGORY_COLORS, CATEGORY_ICONS } from '../utils/helpers';
import Spinner from '../components/shared/Spinner';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { RiArrowUpLine, RiArrowDownLine, RiExchangeDollarLine, RiWalletLine, RiFocus3Line, RiAddLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';

const StatCard = ({ label, value, sub, subColor = 'text-gray-500', icon: Icon, iconBg }) => (
  <div className="card hover:border-white/10 transition-colors">
    <div className="flex items-start justify-between mb-3">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center`}>
        <Icon size={15} />
      </div>
    </div>
    <p className="text-xl font-bold font-mono">{value}</p>
    {sub && <p className={`text-xs mt-1 ${subColor}`}>{sub}</p>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1d2e] border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { summary, trend, loading } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  const { totalExpenses = 0, totalIncome = 0, netSavings = 0, expenseTrend = 0 } = summary?.summary || {};

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Here's your financial overview</p>
        </div>
        <Link to="/transactions" className="btn-primary text-sm flex items-center gap-1.5 py-2">
          <RiAddLine size={15} /> Add
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Expenses"
          value={formatCurrency(totalExpenses)}
          sub={expenseTrend !== 0 ? `${expenseTrend > 0 ? '+' : ''}${expenseTrend}% vs last month` : 'Same as last month'}
          subColor={expenseTrend > 0 ? 'text-red-400' : 'text-emerald-400'}
          icon={RiArrowUpLine}
          iconBg="bg-red-500/15 text-red-400"
        />
        <StatCard
          label="Total Income"
          value={formatCurrency(totalIncome)}
          icon={RiArrowDownLine}
          iconBg="bg-emerald-500/15 text-emerald-400"
        />
        <StatCard
          label="Net Savings"
          value={formatCurrency(netSavings)}
          subColor={netSavings >= 0 ? 'text-emerald-400' : 'text-red-400'}
          sub={netSavings >= 0 ? 'On track' : 'Over budget'}
          icon={RiWalletLine}
          iconBg="bg-indigo-500/15 text-indigo-400"
        />
        <StatCard
          label="Active Budgets"
          value={summary?.activeBudgets || 0}
          sub={`${summary?.goals?.totalGoals || 0} savings goals`}
          icon={RiFocus3Line}
          iconBg="bg-violet-500/15 text-violet-400"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area chart */}
        <div className="card lg:col-span-2">
          <h2 className="font-semibold text-sm mb-4">Income vs Expenses (6 months)</h2>
          {trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trend} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" fill="url(#incomeGrad)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#6366f1" fill="url(#expenseGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-600 text-sm">No data yet</div>
          )}
        </div>

        {/* Pie chart */}
        <div className="card">
          <h2 className="font-semibold text-sm mb-4">Spending by Category</h2>
          {summary?.categoryBreakdown?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={summary.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  dataKey="total"
                  nameKey="_id"
                  paddingAngle={2}
                >
                  {summary.categoryBreakdown.map((entry) => (
                    <Cell key={entry._id} fill={CATEGORY_COLORS[entry._id] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => formatCurrency(v)}
                  contentStyle={{ background: '#1a1d2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-600 text-sm">No data yet</div>
          )}

          {/* Legend */}
          <div className="space-y-1.5 mt-2">
            {summary?.categoryBreakdown?.slice(0, 4).map(item => (
              <div key={item._id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[item._id] || '#6b7280' }} />
                  <span className="text-gray-400">{CATEGORY_ICONS[item._id]} {item._id}</span>
                </div>
                <span className="text-gray-300 font-medium font-mono">{formatCurrency(item.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm">Recent Transactions</h2>
          <Link to="/transactions" className="text-xs text-indigo-400 hover:text-indigo-300">View all →</Link>
        </div>
        {summary?.recentTransactions?.length > 0 ? (
          <div className="space-y-2">
            {summary.recentTransactions.map(tx => (
              <div key={tx._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/3 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-base shrink-0">
                  {CATEGORY_ICONS[tx.category] || '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tx.title}</p>
                  <p className="text-xs text-gray-500">{tx.category} · {formatDate(tx.date)}</p>
                </div>
                <span className={`text-sm font-semibold font-mono ${tx.type === 'income' ? 'text-emerald-400' : 'text-gray-200'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-600 text-sm">
            No transactions yet.{' '}
            <Link to="/transactions" className="text-indigo-400">Add one →</Link>
          </div>
        )}
      </div>
    </div>
  );
}

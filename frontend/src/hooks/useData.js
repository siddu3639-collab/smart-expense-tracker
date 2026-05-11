import { useState, useEffect, useCallback } from 'react';
import { expenseAPI, budgetAPI, goalAPI, dashboardAPI } from '../api/services';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

// Generic fetch hook
export const useFetch = (fetchFn, deps = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchFn();
      setData(res.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
      if (options.showError) toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

// Expenses hook
export const useExpenses = (params = {}) => {
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p = params) => {
    try {
      setLoading(true);
      const { data } = await expenseAPI.getAll(p);
      setExpenses(data.data.expenses);
      setPagination(data.data.pagination);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => { load(); }, []); // eslint-disable-line

  const createExpense = async (formData) => {
    const { data } = await expenseAPI.create(formData);
    setExpenses(prev => [data.data.expense, ...prev]);
    toast.success('Transaction added!');
    return data.data.expense;
  };

  const updateExpense = async (id, formData) => {
    const { data } = await expenseAPI.update(id, formData);
    setExpenses(prev => prev.map(e => e._id === id ? data.data.expense : e));
    toast.success('Transaction updated!');
    return data.data.expense;
  };

  const deleteExpense = async (id) => {
    await expenseAPI.delete(id);
    setExpenses(prev => prev.filter(e => e._id !== id));
    toast.success('Transaction deleted!');
  };

  return { expenses, pagination, loading, load, createExpense, updateExpense, deleteExpense };
};

// Dashboard hook
export const useDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryRes, trendRes] = await Promise.all([
        dashboardAPI.getSummary(),
        dashboardAPI.getTrend(),
      ]);
      setSummary(summaryRes.data.data);
      setTrend(trendRes.data.data.trend);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { summary, trend, loading, refetch: load };
};

// Budgets hook
export const useBudgets = (params = {}) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p = params) => {
    try {
      setLoading(true);
      const { data } = await budgetAPI.getAll(p);
      setBudgets(data.data.budgets);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => { load(); }, []); // eslint-disable-line

  const createBudget = async (formData) => {
    const { data } = await budgetAPI.create(formData);
    setBudgets(prev => [...prev, data.data.budget]);
    toast.success('Budget created!');
    return data.data.budget;
  };

  const updateBudget = async (id, formData) => {
    const { data } = await budgetAPI.update(id, formData);
    await load();
    toast.success('Budget updated!');
    return data.data.budget;
  };

  const deleteBudget = async (id) => {
    await budgetAPI.delete(id);
    setBudgets(prev => prev.filter(b => b._id !== id));
    toast.success('Budget deleted!');
  };

  return { budgets, loading, load, createBudget, updateBudget, deleteBudget };
};

// Goals hook
export const useGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await goalAPI.getAll();
      setGoals(data.data.goals);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createGoal = async (formData) => {
    const { data } = await goalAPI.create(formData);
    setGoals(prev => [data.data.goal, ...prev]);
    toast.success('Goal created!');
    return data.data.goal;
  };

  const updateGoal = async (id, formData) => {
    const { data } = await goalAPI.update(id, formData);
    setGoals(prev => prev.map(g => g._id === id ? data.data.goal : g));
    toast.success('Goal updated!');
    return data.data.goal;
  };

  const contributeToGoal = async (id, amount) => {
    const { data } = await goalAPI.contribute(id, amount);
    setGoals(prev => prev.map(g => g._id === id ? data.data.goal : g));
    toast.success('Contribution added!');
    return data.data.goal;
  };

  const deleteGoal = async (id) => {
    await goalAPI.delete(id);
    setGoals(prev => prev.filter(g => g._id !== id));
    toast.success('Goal deleted!');
  };

  return { goals, loading, load, createGoal, updateGoal, deleteGoal, contributeToGoal };
};

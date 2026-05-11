const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Expense = require('./models/Expense');
const Budget = require('./models/Budget');
const Goal = require('./models/Goal');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([User.deleteMany({}), Expense.deleteMany({}), Budget.deleteMany({}), Goal.deleteMany({})]);
    console.log('🧹 Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@finio.com',
      password: 'admin123',
      role: 'admin',
    });

    // Create demo user
    const demo = await User.create({
      name: 'Demo User',
      email: 'demo@finio.com',
      password: 'demo123456',
    });

    console.log('👤 Created users: admin@finio.com / admin123, demo@finio.com / demo123456');

    const now = new Date();
    const categories = ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Health & Medical', 'Housing & Utilities', 'Education'];
    const expenseData = [];

    // Generate 3 months of expenses for demo user
    for (let m = 0; m < 3; m++) {
      for (let i = 0; i < 15; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - m, Math.floor(Math.random() * 28) + 1);
        expenseData.push({
          userId: demo._id,
          title: ['Coffee', 'Groceries', 'Uber', 'Netflix', 'Gym', 'Rent', 'Electricity', 'Zomato', 'Amazon', 'Movie tickets', 'Petrol', 'Medicine', 'Course fee'][Math.floor(Math.random() * 13)],
          amount: Math.floor(Math.random() * 3000) + 50,
          type: 'expense',
          category: categories[Math.floor(Math.random() * categories.length)],
          date: d,
        });
      }
      // Add income
      expenseData.push({
        userId: demo._id, title: 'Monthly Salary', amount: 75000, type: 'income', category: 'Income',
        date: new Date(now.getFullYear(), now.getMonth() - m, 1),
      });
    }

    await Expense.insertMany(expenseData);
    console.log('💸 Created sample transactions');

    // Budgets for current month
    const budgetCategories = ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment'];
    const budgetLimits = [8000, 3000, 5000, 2000];
    await Budget.insertMany(budgetCategories.map((c, i) => ({
      userId: demo._id, category: c, limit: budgetLimits[i],
      month: now.getMonth() + 1, year: now.getFullYear(),
    })));
    console.log('💰 Created sample budgets');

    // Goals
    await Goal.insertMany([
      { userId: demo._id, title: 'Europe Vacation', icon: '✈️', targetAmount: 150000, savedAmount: 35000, targetDate: new Date(now.getFullYear() + 1, 5, 1), category: 'Travel', color: '#6366f1' },
      { userId: demo._id, title: 'Emergency Fund', icon: '🏦', targetAmount: 100000, savedAmount: 60000, targetDate: new Date(now.getFullYear(), now.getMonth() + 3, 1), category: 'Emergency Fund', color: '#10b981' },
      { userId: demo._id, title: 'New Laptop', icon: '💻', targetAmount: 80000, savedAmount: 80000, targetDate: new Date(), category: 'Other', color: '#f59e0b', status: 'completed' },
    ]);
    console.log('🎯 Created sample goals');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('  Admin: admin@finio.com / admin123');
    console.log('  Demo:  demo@finio.com / demo123456');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();

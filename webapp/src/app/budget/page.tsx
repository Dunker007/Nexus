'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

const budgetData = {
    income: 8500,
    spent: 4250,
    remaining: 4250,
    savingsGoal: 2000,
    saved: 1850,
};

const categories = [
    { name: 'Housing', budget: 1800, spent: 1800, icon: '🏠', color: 'bg-blue-500' },
    { name: 'Food & Dining', budget: 600, spent: 520, icon: '🍔', color: 'bg-orange-500' },
    { name: 'Transportation', budget: 400, spent: 380, icon: '🚗', color: 'bg-green-500' },
    { name: 'Utilities', budget: 300, spent: 285, icon: '💡', color: 'bg-yellow-500' },
    { name: 'Entertainment', budget: 200, spent: 175, icon: '🎬', color: 'bg-purple-500' },
    { name: 'Shopping', budget: 300, spent: 450, icon: '🛍️', color: 'bg-pink-500' },
    { name: 'Subscriptions', budget: 150, spent: 140, icon: '📱', color: 'bg-cyan-500' },
    { name: 'Health', budget: 200, spent: 150, icon: '💊', color: 'bg-red-500' },
];

const transactions = [
    { name: 'Netflix', amount: -15.99, date: 'Today', category: 'Subscriptions', icon: '📺' },
    { name: 'Grocery Store', amount: -87.45, date: 'Today', category: 'Food & Dining', icon: '🛒' },
    { name: 'Gas Station', amount: -45.00, date: 'Yesterday', category: 'Transportation', icon: '⛽' },
    { name: 'Salary Deposit', amount: 4250.00, date: 'Dec 1', category: 'Income', icon: '💰' },
    { name: 'Amazon', amount: -156.78, date: 'Nov 30', category: 'Shopping', icon: '📦' },
    { name: 'Electric Bill', amount: -125.40, date: 'Nov 29', category: 'Utilities', icon: '⚡' },
];

const goals = [
    { name: 'Emergency Fund', target: 10000, current: 6500, icon: '🛡️' },
    { name: 'Vacation', target: 3000, current: 1200, icon: '✈️' },
    { name: 'New Laptop', target: 2500, current: 800, icon: '💻' },
];

export default function BudgetPage() {
    const [selectedMonth, setSelectedMonth] = useState('December 2024');

    const overBudgetCategories = categories.filter(c => c.spent > c.budget);

    return (
        <div className="min-h-screen pt-8">
            {/* Header */}
            <section className="section-padding pb-8">
                <div className="container-main">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">
                            <span className="text-gradient">Budget</span>
                        </h1>
                        <p className="text-gray-400">Track spending, set goals, build wealth. Like Monarch, but local.</p>
                    </motion.div>
                </div>
            </section>

            {/* Overview */}
            <section className="container-main pb-8">
                <motion.div
                    className="glass-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">📊 {selectedMonth}</h2>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm"
                        >
                            <option>December 2024</option>
                            <option>November 2024</option>
                            <option>October 2024</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Income</p>
                            <p className="text-3xl font-bold text-green-400">${budgetData.income.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Spent</p>
                            <p className="text-3xl font-bold text-red-400">${budgetData.spent.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Remaining</p>
                            <p className="text-3xl font-bold text-cyan-400">${budgetData.remaining.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Saved</p>
                            <p className="text-3xl font-bold text-purple-400">${budgetData.saved.toLocaleString()}</p>
                            <div className="w-full h-2 bg-gray-700 rounded-full mt-2">
                                <div
                                    className="h-full bg-purple-500 rounded-full"
                                    style={{ width: `${(budgetData.saved / budgetData.savingsGoal) * 100}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">${budgetData.saved} / ${budgetData.savingsGoal} goal</p>
                        </div>
                    </div>
                </motion.div>
            </section>

            <div className="container-main pb-16 grid lg:grid-cols-3 gap-6">
                {/* Categories */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">📂 Categories</h2>
                        {overBudgetCategories.length > 0 && (
                            <span className="text-sm text-red-400">
                                ⚠️ {overBudgetCategories.length} over budget
                            </span>
                        )}
                    </div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        initial="initial"
                        animate="animate"
                        variants={{ animate: { transition: { staggerChildren: 0.03 } } }}
                    >
                        {categories.map((cat) => {
                            const percent = (cat.spent / cat.budget) * 100;
                            const isOver = cat.spent > cat.budget;

                            return (
                                <motion.div
                                    key={cat.name}
                                    className={`glass-card ${isOver ? 'border border-red-500/30' : ''}`}
                                    variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{cat.icon}</span>
                                            <span className="font-medium">{cat.name}</span>
                                        </div>
                                        <span className={isOver ? 'text-red-400' : 'text-gray-400'}>
                                            ${cat.spent} / ${cat.budget}
                                        </span>
                                    </div>

                                    <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${isOver ? 'bg-red-500' : percent > 80 ? 'bg-yellow-500' : cat.color
                                                }`}
                                            style={{ width: `${Math.min(percent, 100)}%` }}
                                        />
                                    </div>

                                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                                        <span>{percent.toFixed(0)}% used</span>
                                        {isOver ? (
                                            <span className="text-red-400">${cat.spent - cat.budget} over</span>
                                        ) : (
                                            <span>${cat.budget - cat.spent} left</span>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {/* Transactions */}
                    <div className="mt-8">
                        <h2 className="text-xl font-bold mb-4">💳 Recent Transactions</h2>
                        <div className="glass-card p-0 overflow-hidden">
                            {transactions.map((tx, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-4 border-b border-gray-700/50 last:border-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{tx.icon}</span>
                                        <div>
                                            <div className="font-medium">{tx.name}</div>
                                            <div className="text-xs text-gray-500">{tx.category} • {tx.date}</div>
                                        </div>
                                    </div>
                                    <span className={`font-bold ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {tx.amount >= 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Savings Goals */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h3 className="font-bold mb-4">🎯 Savings Goals</h3>
                        <div className="space-y-4">
                            {goals.map((goal) => {
                                const percent = (goal.current / goal.target) * 100;
                                return (
                                    <div key={goal.name}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span>{goal.icon}</span>
                                                <span className="text-sm">{goal.name}</span>
                                            </div>
                                            <span className="text-sm text-gray-400">
                                                ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-700 rounded-full">
                                            <div
                                                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <button className="w-full mt-4 py-2 bg-white/10 rounded-lg text-sm">
                            + Add Goal
                        </button>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h3 className="font-bold mb-4">⚡ Quick Actions</h3>
                        <div className="space-y-2">
                            <button className="w-full py-3 bg-green-500/20 text-green-400 rounded-lg text-sm">
                                + Add Income
                            </button>
                            <button className="w-full py-3 bg-red-500/20 text-red-400 rounded-lg text-sm">
                                + Add Expense
                            </button>
                            <button className="w-full py-3 bg-white/10 rounded-lg text-sm">
                                📊 Generate Report
                            </button>
                        </div>
                    </motion.div>

                    {/* Resources */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="font-bold mb-4">🔗 Resources</h3>
                        <div className="space-y-2">
                            <a href="https://monarchmoney.com" target="_blank" className="block px-3 py-2 bg-white/5 rounded hover:bg-white/10">
                                Monarch Money
                            </a>
                            <a href="https://ynab.com" target="_blank" className="block px-3 py-2 bg-white/5 rounded hover:bg-white/10">
                                YNAB
                            </a>
                            <a href="https://mint.intuit.com" target="_blank" className="block px-3 py-2 bg-white/5 rounded hover:bg-white/10">
                                Mint
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Back link */}
            <div className="container-main pb-8">
                <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}

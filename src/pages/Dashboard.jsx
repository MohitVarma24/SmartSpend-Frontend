import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  TrendingDown,
  PiggyBank,
  Wallet,
  Percent,
  Receipt,
  Calendar,
  AlertTriangle,
  Lightbulb,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Edit2,
  Trash2
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { analyticsApi } from '../api/analyticsApi';
import { expenseApi } from '../api/expenseApi';
import { insightApi } from '../api/insightApi';
import { budgetApi } from '../api/budgetApi';
import { formatCurrency, formatCompactCurrency } from '../utils/currency';
import { formatDate, getMonthName } from '../utils/date';
import StatCard from '../components/StatCard';
import BudgetProgress from '../components/BudgetProgress';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import ExpenseFormModal from '../components/ExpenseFormModal';

const CHART_COLORS = [
  '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B',
  '#EC4899', '#14B8A6', '#6366F1', '#F97316',
  '#06B6D4', '#EF4444', '#D946EF', '#64748B'
];

export default function Dashboard() {
  const { selectedMonth, selectedYear, openAddExpense, refreshTrigger, triggerRefresh } = useOutletContext();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [dailyTrend, setDailyTrend] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [insights, setInsights] = useState([]);
  const [budgets, setBudgets] = useState([]);

  // Edit / Delete modal states
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [selectedMonth, selectedYear, refreshTrigger]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [
        summaryData,
        catData,
        monthTrendData,
        dayTrendData,
        recentData,
        insightsData,
        budgetsData
      ] = await Promise.all([
        analyticsApi.getDashboardSummary(selectedMonth, selectedYear),
        analyticsApi.getCategoryBreakdown(selectedMonth, selectedYear),
        analyticsApi.getMonthlyTrend(),
        analyticsApi.getDailyTrend(selectedMonth, selectedYear),
        analyticsApi.getRecentExpenses(8, selectedMonth, selectedYear),
        insightApi.getInsights(selectedMonth, selectedYear),
        budgetApi.getBudgets(selectedMonth, selectedYear)
      ]);

      setSummary(summaryData);
      setCategoryBreakdown(catData);
      setMonthlyTrend(monthTrendData);
      setDailyTrend(dayTrendData);
      setRecentExpenses(recentData);
      setInsights(insightsData.insights || []);
      setBudgets(budgetsData || []);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;
    setDeleting(true);
    try {
      await expenseApi.deleteExpense(expenseToDelete.id);
      setShowDeleteModal(false);
      setExpenseToDelete(null);
      triggerRefresh();
    } catch (err) {
      console.error('Failed to delete expense', err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading && !summary) {
    return <LoadingSpinner text="Fetching financial records & calculating metrics..." />;
  }

  const isOverBudget = (summary?.remainingBudget || 0) < 0;

  return (
    <div className="dashboard-page">
      
      {/* Top Banner Alert (if budget exceeded or warning) */}
      {summary?.budgetStatus === 'EXCEEDED' && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between p-3 rounded-4 mb-4 border-danger shadow-sm">
          <div className="d-flex align-items-center gap-2">
            <AlertTriangle className="text-danger flex-shrink-0" size={22} />
            <div>
              <span className="fw-bold">Budget Exceeded Alert: </span>
              You have surpassed your {getMonthName(selectedMonth)} budget by{' '}
              <span className="fw-bold">{formatCurrency(Math.abs(summary.remainingBudget))}</span>.
            </div>
          </div>
          <Link to="/budgets" className="btn btn-sm btn-outline-danger fw-semibold">
            Adjust Budget
          </Link>
        </div>
      )}

      {summary?.budgetStatus === 'CRITICAL' && (
        <div className="alert alert-warning d-flex align-items-center justify-content-between p-3 rounded-4 mb-4 shadow-sm" style={{ backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }}>
          <div className="d-flex align-items-center gap-2">
            <AlertTriangle className="text-warning flex-shrink-0" size={22} />
            <div>
              <span className="fw-bold">Caution: </span>
              You have utilized <span className="fw-bold">{summary.budgetUsedPercentage.toFixed(1)}%</span> of your monthly budget. Only {formatCurrency(summary.remainingBudget)} remains.
            </div>
          </div>
          <Link to="/insights" className="btn btn-sm btn-warning text-dark fw-semibold">
            View Insights
          </Link>
        </div>
      )}

      {/* 6 Summary Metric Cards */}
      <div className="row g-3 mb-4">
        {/* Total Expenses */}
        <div className="col-12 col-sm-6 col-xl-2">
          <StatCard
            title="Total Spent"
            value={formatCurrency(summary?.totalExpensesThisMonth || 0)}
            subtitle={`${getMonthName(selectedMonth)} ${selectedYear}`}
            icon={TrendingDown}
            iconBg="#FEF2F2"
            iconColor="#EF4444"
          />
        </div>

        {/* Monthly Budget */}
        <div className="col-12 col-sm-6 col-xl-2">
          <StatCard
            title="Monthly Budget"
            value={formatCurrency(summary?.monthlyBudget || 0)}
            subtitle={summary?.monthlyBudget > 0 ? 'Allocated ceiling' : 'None configured'}
            icon={PiggyBank}
            iconBg="#ECFDF5"
            iconColor="#10B981"
          />
        </div>

        {/* Remaining Budget */}
        <div className="col-12 col-sm-6 col-xl-2">
          <StatCard
            title="Remaining Budget"
            value={formatCurrency(summary?.remainingBudget || 0)}
            subtitle={isOverBudget ? 'Deficit' : 'Available balance'}
            icon={Wallet}
            iconBg={isOverBudget ? '#FEF2F2' : '#EFF6FF'}
            iconColor={isOverBudget ? '#EF4444' : '#3B82F6'}
            badgeText={isOverBudget ? 'Over Budget' : 'On Track'}
            badgeClass={isOverBudget ? 'badge-exceeded' : 'badge-normal'}
          />
        </div>

        {/* Budget Used % */}
        <div className="col-12 col-sm-6 col-xl-2">
          <StatCard
            title="Budget Used"
            value={`${(summary?.budgetUsedPercentage || 0).toFixed(1)}%`}
            subtitle="Consumption rate"
            icon={Percent}
            iconBg="#F5F3FF"
            iconColor="#8B5CF6"
            badgeText={summary?.budgetStatusLabel || 'Normal'}
            badgeClass={
              summary?.budgetStatus === 'EXCEEDED' ? 'badge-exceeded' :
              summary?.budgetStatus === 'CRITICAL' ? 'badge-critical' :
              summary?.budgetStatus === 'APPROACHING' ? 'badge-approaching' : 'badge-normal'
            }
          />
        </div>

        {/* Transactions Count */}
        <div className="col-12 col-sm-6 col-xl-2">
          <StatCard
            title="Transactions"
            value={String(summary?.transactionCount || 0)}
            subtitle="Logged transactions"
            icon={Receipt}
            iconBg="#F1F5F9"
            iconColor="#64748B"
          />
        </div>

        {/* Average Daily Spending */}
        <div className="col-12 col-sm-6 col-xl-2">
          <StatCard
            title="Daily Average"
            value={formatCurrency(summary?.averageDailySpending || 0)}
            subtitle="Average per day"
            icon={Calendar}
            iconBg="#FFFBEB"
            iconColor="#F59E0B"
          />
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="row g-4 mb-4">
        {/* Doughnut Chart: Category Breakdown */}
        <div className="col-12 col-lg-5">
          <div className="smart-card h-100">
            <div className="smart-card-header">
              <h3 className="smart-card-title">
                Category Breakdown
              </h3>
              <span className="badge-status badge-normal">
                {categoryBreakdown.length} Categories
              </span>
            </div>

            {categoryBreakdown.length === 0 ? (
              <EmptyState
                title="No Categorized Spending"
                message={`No expenses logged for ${getMonthName(selectedMonth)} ${selectedYear}.`}
                actionText="Add First Expense"
                onAction={openAddExpense}
              />
            ) : (
              <div>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        dataKey="amount"
                        nameKey="categoryName"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                      >
                        {categoryBreakdown.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value) => [formatCurrency(value), 'Spent']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Category List with % pills */}
                <div className="mt-3 pt-2 border-top" style={{ maxHeight: '140px', overflowY: 'auto' }}>
                  <div className="row g-2">
                    {categoryBreakdown.map((cat, idx) => (
                      <div key={cat.categoryId} className="col-6 d-flex align-items-center justify-content-between small py-1">
                        <div className="d-flex align-items-center gap-2 text-truncate">
                          <span
                            className="rounded-circle d-inline-block flex-shrink-0"
                            style={{
                              width: '10px',
                              height: '10px',
                              backgroundColor: cat.color || CHART_COLORS[idx % CHART_COLORS.length]
                            }}
                          />
                          <span className="text-truncate fw-medium">{cat.categoryName}</span>
                        </div>
                        <span className="text-muted ms-2 flex-shrink-0">
                          {cat.percentage.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Spending Comparison - Bar Chart */}
        <div className="col-12 col-lg-7">
          <div className="smart-card h-100">
            <div className="smart-card-header">
              <h3 className="smart-card-title">
                Monthly Spending Trend (Last 6 Months)
              </h3>
              <Link to="/analytics" className="text-success small fw-semibold text-decoration-none">
                Full Analytics &rarr;
              </Link>
            </div>

            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="monthLabel" stroke="#94A3B8" fontSize={12} tickLine={false} />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={formatCompactCurrency}
                  />
                  <RechartsTooltip
                    formatter={(value) => [formatCurrency(value)]}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="totalSpent" name="Total Spent" fill="#10B981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="budgetAmount" name="Monthly Budget" fill="#CBD5E1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Spending Trend Line Chart */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="smart-card">
            <div className="smart-card-header">
              <h3 className="smart-card-title">
                Daily Spending Rhythm — {getMonthName(selectedMonth)} {selectedYear}
              </h3>
              <span className="text-muted small">Daily Outlays</span>
            </div>

            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <LineChart data={dailyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="dayOfMonth" stroke="#94A3B8" fontSize={12} tickLine={false} />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={formatCompactCurrency}
                  />
                  <RechartsTooltip
                    formatter={(value) => [formatCurrency(value), 'Spent on Day']}
                    labelFormatter={(day) => `Day ${day} of ${getMonthName(selectedMonth)}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    name="Daily Spend"
                    stroke="#3B82F6"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#3B82F6' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Transactions & Active Budgets & Insights Preview */}
      <div className="row g-4">
        
        {/* Recent Transactions Table */}
        <div className="col-12 col-xl-7">
          <div className="smart-card h-100">
            <div className="smart-card-header">
              <h3 className="smart-card-title">
                Recent Transactions
              </h3>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-emerald btn-sm py-1 px-2 d-flex align-items-center gap-1"
                  onClick={openAddExpense}
                >
                  <Plus size={14} /> Add
                </button>
                <Link to="/transactions" className="btn btn-secondary-custom btn-sm py-1 px-2">
                  View All
                </Link>
              </div>
            </div>

            {recentExpenses.length === 0 ? (
              <EmptyState
                title="No Transactions"
                message="No expenses recorded yet. Click 'Add' to record your first transaction."
                actionText="Add Expense"
                onAction={openAddExpense}
              />
            ) : (
              <div className="table-responsive">
                <table className="smart-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th className="text-end">Amount</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentExpenses.map((exp) => (
                      <tr key={exp.id}>
                        <td className="text-muted small" style={{ whiteSpace: 'nowrap' }}>
                          {formatDate(exp.expenseDate)}
                        </td>
                        <td>
                          <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '200px' }}>
                            {exp.description}
                          </div>
                          {exp.paymentMethod && (
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                              via {exp.paymentMethod}
                            </span>
                          )}
                        </td>
                        <td>
                          <span
                            className="badge py-1 px-2 fw-medium rounded-pill"
                            style={{
                              backgroundColor: `${exp.category?.color || '#10B981'}15`,
                              color: exp.category?.color || '#059669',
                              border: `1px solid ${exp.category?.color || '#10B981'}30`,
                              fontSize: '0.8rem'
                            }}
                          >
                            {exp.category?.name || 'General'}
                          </span>
                        </td>
                        <td className="text-end fw-bold text-dark" style={{ whiteSpace: 'nowrap' }}>
                          {formatCurrency(exp.amount)}
                        </td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-1">
                            <button
                              type="button"
                              className="btn btn-sm btn-light p-1 text-muted"
                              title="Edit"
                              onClick={() => {
                                setExpenseToEdit(exp);
                                setShowEditModal(true);
                              }}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-light p-1 text-danger"
                              title="Delete"
                              onClick={() => {
                                setExpenseToDelete(exp);
                                setShowDeleteModal(true);
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Budgets & Smart Insights Side Column */}
        <div className="col-12 col-xl-5 d-flex flex-column gap-4">
          
          {/* Active Budgets Progress Card */}
          <div className="smart-card">
            <div className="smart-card-header">
              <h3 className="smart-card-title">
                Monthly Budget Limits
              </h3>
              <Link to="/budgets" className="text-success small fw-semibold text-decoration-none">
                Manage &rarr;
              </Link>
            </div>

            {budgets.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted small mb-3">No budget configured for this month.</p>
                <Link to="/budgets" className="btn btn-outline-emerald btn-sm">
                  Set Monthly Budget
                </Link>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {budgets.slice(0, 3).map((b) => (
                  <BudgetProgress key={b.id} budget={b} />
                ))}
                {budgets.length > 3 && (
                  <Link to="/budgets" className="text-center text-muted small text-decoration-none pt-2 border-top">
                    + View {budgets.length - 3} more category budgets
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Smart Insights Preview Card */}
          <div className="smart-card flex-grow-1">
            <div className="smart-card-header">
              <h3 className="smart-card-title">
                <Sparkles size={18} className="text-success" />
                Smart Insights
              </h3>
              <Link to="/insights" className="text-success small fw-semibold text-decoration-none">
                All Insights &rarr;
              </Link>
            </div>

            {insights.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                Log expenses to activate the rule-based financial insights engine.
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {insights.slice(0, 2).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-3 border"
                    style={{
                      backgroundColor:
                        item.severity === 'DANGER' ? '#FEF2F2' :
                        item.severity === 'WARNING' ? '#FFFBEB' : '#F8FAFC'
                    }}
                  >
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className={`badge-status ${
                        item.severity === 'DANGER' ? 'badge-exceeded' :
                        item.severity === 'WARNING' ? 'badge-approaching' : 'badge-normal'
                      }`}>
                        {item.type.replace('_', ' ')}
                      </span>
                      <span className="fw-bold text-dark small">{item.title}</span>
                    </div>
                    <p className="text-muted small mb-2">{item.message}</p>
                    <div className="d-flex align-items-center gap-1 text-success small fw-semibold">
                      <Lightbulb size={14} /> Tip: {item.actionableTip}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Edit Expense Modal */}
      <ExpenseFormModal
        show={showEditModal}
        expenseToEdit={expenseToEdit}
        onClose={() => {
          setShowEditModal(false);
          setExpenseToEdit(null);
        }}
        onSuccess={triggerRefresh}
      />

      {/* Delete Expense Dialog */}
      <ConfirmDialog
        show={showDeleteModal}
        title="Delete Expense"
        message={`Are you sure you want to delete "${expenseToDelete?.description}" of ${formatCurrency(expenseToDelete?.amount)}? This will update your budget calculations.`}
        onConfirm={handleDeleteExpense}
        onCancel={() => {
          setShowDeleteModal(false);
          setExpenseToDelete(null);
        }}
        loading={deleting}
      />

    </div>
  );
}

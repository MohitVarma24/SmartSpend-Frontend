import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  PieChart as PieChartIcon,
  BarChart3,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Layers,
  Sparkles
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
import { formatCurrency, formatCompactCurrency } from '../utils/currency';
import { getMonthName } from '../utils/date';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const CHART_COLORS = [
  '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B',
  '#EC4899', '#14B8A6', '#6366F1', '#F97316',
  '#06B6D4', '#EF4444', '#D946EF', '#64748B'
];

export default function Analytics() {
  const { selectedMonth, selectedYear, refreshTrigger } = useOutletContext();

  const [loading, setLoading] = useState(true);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [dailyTrend, setDailyTrend] = useState([]);
  const [comparison, setComparison] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, [selectedMonth, selectedYear, refreshTrigger]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [catData, monthData, dailyData, compData] = await Promise.all([
        analyticsApi.getCategoryBreakdown(selectedMonth, selectedYear),
        analyticsApi.getMonthlyTrend(),
        analyticsApi.getDailyTrend(selectedMonth, selectedYear),
        analyticsApi.getMonthComparison(selectedMonth, selectedYear)
      ]);

      setCategoryBreakdown(catData || []);
      setMonthlyTrend(monthData || []);
      setDailyTrend(dailyData || []);
      setComparison(compData);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Computing spending breakdown & comparative trends..." />;
  }

  return (
    <div className="analytics-page">
      
      {/* Top Header */}
      <div className="mb-4">
        <h2 className="fs-4 fw-bold text-dark m-0">
          Financial Analytics — {getMonthName(selectedMonth)} {selectedYear}
        </h2>
        <p className="text-muted small m-0">
          Gain deep visibility into your spending categories, velocity, and month-over-month trajectory
        </p>
      </div>

      {/* Month-over-Month Comparison Banner Card */}
      {comparison && (
        <div className="smart-card bg-white mb-4 border shadow-sm">
          <div className="row g-4 align-items-center">
            <div className="col-12 col-md-4">
              <span className="text-muted small fw-semibold text-uppercase">Current Month Spend</span>
              <div className="fs-3 fw-extrabold text-dark mt-1">
                {formatCurrency(comparison.currentMonthSpending)}
              </div>
              <span className="text-muted small">
                {getMonthName(comparison.currentMonth)} {comparison.currentYear}
              </span>
            </div>

            <div className="col-12 col-md-4 border-start-md">
              <span className="text-muted small fw-semibold text-uppercase">Previous Month Spend</span>
              <div className="fs-3 fw-bold text-muted mt-1">
                {formatCurrency(comparison.previousMonthSpending)}
              </div>
              <span className="text-muted small">
                {getMonthName(comparison.previousMonth)} {comparison.previousYear}
              </span>
            </div>

            <div className="col-12 col-md-4 border-start-md">
              <span className="text-muted small fw-semibold text-uppercase">MoM Shift</span>
              <div className="d-flex align-items-center gap-2 mt-1">
                <div className={`fs-3 fw-bold ${comparison.increased ? 'text-danger' : 'text-success'}`}>
                  {comparison.increased ? '+' : '-'}{formatCurrency(Math.abs(comparison.difference))}
                </div>
                {comparison.hasPreviousData && (
                  <span className={`badge-status ${comparison.increased ? 'badge-exceeded' : 'badge-normal'}`}>
                    {comparison.increased ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {comparison.percentageChange.toFixed(1)}%
                  </span>
                )}
              </div>
              <span className="text-muted small">
                {comparison.hasPreviousData 
                  ? (comparison.increased ? 'Spending increased vs last month' : 'Spending decreased vs last month')
                  : 'No previous month baseline data'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="row g-4 mb-4">
        
        {/* Category Breakdown (Doughnut) */}
        <div className="col-12 col-lg-6">
          <div className="smart-card h-100">
            <div className="smart-card-header">
              <h3 className="smart-card-title">
                <PieChartIcon size={18} className="text-success" /> Category Distribution
              </h3>
              <span className="badge-status badge-normal">
                {categoryBreakdown.length} Categories
              </span>
            </div>

            {categoryBreakdown.length === 0 ? (
              <EmptyState
                title="No Data for Selected Month"
                message="Log expenses to see an interactive category breakdown chart."
              />
            ) : (
              <div>
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        dataKey="amount"
                        nameKey="categoryName"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={105}
                        paddingAngle={3}
                      >
                        {categoryBreakdown.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(val) => [formatCurrency(val), 'Spent']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="table-responsive mt-3 border-top pt-2">
                  <table className="table table-sm table-borderless align-middle mb-0">
                    <tbody>
                      {categoryBreakdown.map((c, idx) => (
                        <tr key={c.categoryId} className="small">
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <span
                                className="rounded-circle d-inline-block flex-shrink-0"
                                style={{
                                  width: '10px',
                                  height: '10px',
                                  backgroundColor: c.color || CHART_COLORS[idx % CHART_COLORS.length]
                                }}
                              />
                              <span className="fw-medium text-dark">{c.categoryName}</span>
                            </div>
                          </td>
                          <td className="text-muted text-center">{c.count} txs</td>
                          <td className="text-muted text-center">{c.percentage.toFixed(1)}%</td>
                          <td className="text-end fw-bold text-dark">{formatCurrency(c.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Multi-Month Trend (Bar Chart) */}
        <div className="col-12 col-lg-6">
          <div className="smart-card h-100">
            <div className="smart-card-header">
              <h3 className="smart-card-title">
                <BarChart3 size={18} className="text-success" /> Multi-Month Trend
              </h3>
              <span className="text-muted small">Spent vs Budget</span>
            </div>

            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <BarChart data={monthlyTrend} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="monthLabel" stroke="#94A3B8" fontSize={12} tickLine={false} />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={formatCompactCurrency}
                  />
                  <RechartsTooltip formatter={(val) => [formatCurrency(val)]} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="totalSpent" name="Total Spent" fill="#10B981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="budgetAmount" name="Budget Ceiling" fill="#CBD5E1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

      {/* Daily Rhythm Line Chart */}
      <div className="smart-card mb-4">
        <div className="smart-card-header">
          <h3 className="smart-card-title">
            <Calendar size={18} className="text-success" /> Daily Outlay Rhythm
          </h3>
          <span className="text-muted small">Daily totals across {getMonthName(selectedMonth)}</span>
        </div>

        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={dailyTrend} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="dayOfMonth" stroke="#94A3B8" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#94A3B8"
                fontSize={12}
                tickLine={false}
                tickFormatter={formatCompactCurrency}
              />
              <RechartsTooltip
                formatter={(val) => [formatCurrency(val), 'Spent on Day']}
                labelFormatter={(day) => `Day ${day} of ${getMonthName(selectedMonth)}`}
              />
              <Line
                type="monotone"
                dataKey="amount"
                name="Daily Amount"
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
  );
}

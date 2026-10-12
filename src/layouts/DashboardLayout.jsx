import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ExpenseFormModal from '../components/ExpenseFormModal';
import { getCurrentMonthAndYear } from '../utils/date';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const initial = getCurrentMonthAndYear();
  const [selectedMonth, setSelectedMonth] = useState(initial.month);
  const [selectedYear, setSelectedYear] = useState(initial.year);

  const location = useLocation();

  // Determine page title based on current path
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Financial Dashboard';
      case '/transactions':
        return 'Transaction History';
      case '/budgets':
        return 'Monthly Budgets';
      case '/analytics':
        return 'Spending Analytics';
      case '/insights':
        return 'Smart Insights';
      case '/reports':
        return 'Monthly Reports & Statements';
      case '/settings':
        return 'Account Settings';
      default:
        return 'SmartSpend';
    }
  };

  const handleExpenseAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const showPeriodFilters = ['/dashboard', '/budgets', '/analytics', '/insights', '/reports'].includes(location.pathname);

  return (
    <div className="app-wrapper">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenAddExpense={() => setShowAddExpense(true)}
      />

      <div className="main-wrapper">
        <Navbar
          pageTitle={getPageTitle()}
          selectedMonth={showPeriodFilters ? selectedMonth : undefined}
          selectedYear={showPeriodFilters ? selectedYear : undefined}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenAddExpense={() => setShowAddExpense(true)}
        />

        <main className="dashboard-content">
          <Outlet context={{
            selectedMonth,
            selectedYear,
            setSelectedMonth,
            setSelectedYear,
            openAddExpense: () => setShowAddExpense(true),
            refreshTrigger,
            triggerRefresh: handleExpenseAdded
          }} />
        </main>
      </div>

      <ExpenseFormModal
        show={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        onSuccess={handleExpenseAdded}
      />
    </div>
  );
}

import React from 'react';
import { Menu, Plus } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { getAllMonths, getAvailableYears } from '../utils/date';

export default function Navbar({
  pageTitle,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  onToggleSidebar,
  onOpenAddExpense
}) {
  const months = getAllMonths();
  const years = getAvailableYears();

  return (
    <header className="top-navbar">
      <div className="d-flex align-items-center gap-3">
        <button
          type="button"
          className="btn btn-light d-lg-none p-2 border rounded-md"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
        >
          <Menu size={20} />
        </button>
        <h1 className="navbar-page-title">{pageTitle}</h1>
      </div>

      <div className="navbar-actions">
        {/* Month & Year Selectors (if page supports period filtering) */}
        {selectedMonth !== undefined && onMonthChange && (
          <div className="d-none d-sm-flex align-items-center gap-2">
            <select
              className="form-select form-select-sm"
              value={selectedMonth}
              onChange={(e) => onMonthChange(parseInt(e.target.value))}
              style={{ width: '130px' }}
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.name}
                </option>
              ))}
            </select>

            <select
              className="form-select form-select-sm"
              value={selectedYear}
              onChange={(e) => onYearChange(parseInt(e.target.value))}
              style={{ width: '90px' }}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quick Add Expense Action */}
        {onOpenAddExpense && (
          <button
            type="button"
            className="btn btn-emerald btn-sm d-flex align-items-center gap-1 shadow-sm"
            onClick={onOpenAddExpense}
          >
            <Plus size={16} />
            <span className="d-none d-md-inline">Add Expense</span>
          </button>
        )}

        {/* Notifications */}
        <NotificationDropdown />
      </div>
    </header>
  );
}

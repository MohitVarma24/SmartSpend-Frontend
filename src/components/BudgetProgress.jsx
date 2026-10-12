import React from 'react';
import { formatCurrency } from '../utils/currency';

export default function BudgetProgress({ budget, showDetails = true }) {
  if (!budget) return null;

  const {
    category,
    amount,
    spentAmount = 0,
    remainingAmount = 0,
    percentageUsed = 0,
    status = 'NORMAL',
    statusLabel = 'On Track'
  } = budget;

  // Determine progress bar CSS class
  let progressClass = 'normal';
  let badgeClass = 'badge-normal';

  if (status === 'EXCEEDED' || percentageUsed >= 100) {
    progressClass = 'exceeded';
    badgeClass = 'badge-exceeded';
  } else if (status === 'CRITICAL' || percentageUsed >= 90) {
    progressClass = 'critical';
    badgeClass = 'badge-critical';
  } else if (status === 'APPROACHING' || percentageUsed >= 75) {
    progressClass = 'approaching';
    badgeClass = 'badge-approaching';
  }

  const cappedPercentage = Math.min(percentageUsed, 100);
  const isOverBudget = remainingAmount < 0;

  return (
    <div className="py-2">
      <div className="d-flex align-items-center justify-content-between mb-1">
        <div className="d-flex align-items-center gap-2">
          <span className="fw-bold text-dark fs-6">
            {category ? category.name : 'Overall Monthly Budget'}
          </span>
          <span className={`badge-status ${badgeClass}`}>
            {statusLabel}
          </span>
        </div>
        <div className="text-end">
          <span className="fw-bold text-dark">{formatCurrency(spentAmount)}</span>
          <span className="text-muted small"> / {formatCurrency(amount)}</span>
        </div>
      </div>

      <div className="budget-progress-track">
        <div
          className={`budget-progress-bar ${progressClass}`}
          style={{ width: `${cappedPercentage}%` }}
          role="progressbar"
          aria-valuenow={percentageUsed}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>

      {showDetails && (
        <div className="d-flex justify-content-between align-items-center small mt-1">
          <span className="text-muted">
            {percentageUsed.toFixed(1)}% consumed
          </span>
          <span className={isOverBudget ? 'text-danger fw-bold' : 'text-success fw-semibold'}>
            {isOverBudget 
              ? `Exceeded by ${formatCurrency(Math.abs(remainingAmount))}` 
              : `${formatCurrency(remainingAmount)} remaining`}
          </span>
        </div>
      )}
    </div>
  );
}

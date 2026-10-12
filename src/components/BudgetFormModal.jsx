import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { budgetApi } from '../api/budgetApi';
import { categoryApi } from '../api/categoryApi';
import { getAllMonths, getAvailableYears } from '../utils/date';
import { validateAmount } from '../utils/validation';

export default function BudgetFormModal({
  show,
  onClose,
  onSuccess,
  budgetToEdit = null,
  currentMonth,
  currentYear
}) {
  const [categories, setCategories] = useState([]);
  const [amount, setAmount] = useState('');
  const [budgetMonth, setBudgetMonth] = useState(currentMonth || new Date().getMonth() + 1);
  const [budgetYear, setBudgetYear] = useState(currentYear || new Date().getFullYear());
  const [categoryId, setCategoryId] = useState(''); // empty string means overall
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const months = getAllMonths();
  const years = getAvailableYears();

  useEffect(() => {
    if (show) {
      loadCategories();
      if (budgetToEdit) {
        setAmount(budgetToEdit.amount || '');
        setBudgetMonth(budgetToEdit.budgetMonth);
        setBudgetYear(budgetToEdit.budgetYear);
        setCategoryId(budgetToEdit.category?.id ? String(budgetToEdit.category.id) : '');
      } else {
        setAmount('');
        setBudgetMonth(currentMonth || new Date().getMonth() + 1);
        setBudgetYear(currentYear || new Date().getFullYear());
        setCategoryId('');
      }
      setErrors({});
      setServerError('');
    }
  }, [show, budgetToEdit, currentMonth, currentYear]);

  const loadCategories = async () => {
    try {
      const data = await categoryApi.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories for budget', err);
    }
  };

  const validate = () => {
    const newErrors = {};
    const amtErr = validateAmount(amount);
    if (amtErr) newErrors.amount = amtErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');

    const payload = {
      amount: parseFloat(amount),
      budgetMonth: parseInt(budgetMonth),
      budgetYear: parseInt(budgetYear),
      categoryId: categoryId ? parseInt(categoryId) : null
    };

    try {
      if (budgetToEdit) {
        await budgetApi.updateBudget(budgetToEdit.id, payload);
      } else {
        await budgetApi.createBudget(payload);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save budget. A budget may already exist for this category and month.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
          
          <div className="modal-header border-bottom px-4 py-3 align-items-center">
            <h5 className="modal-title fw-bold text-dark m-0">
              {budgetToEdit ? 'Edit Budget' : 'Set New Budget'}
            </h5>
            <button type="button" className="btn btn-sm btn-light border-0 p-1" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body px-4 py-3">
              {serverError && (
                <div className="alert alert-danger py-2 small mb-3">
                  {serverError}
                </div>
              )}

              {/* Scope (Category or Overall) */}
              <div className="mb-3">
                <label className="form-label">Budget Scope</label>
                <select
                  className="form-select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">Overall Monthly Budget (All Expenses)</option>
                  <optgroup label="Category Specific Budgets">
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} Budget
                      </option>
                    ))}
                  </optgroup>
                </select>
                <div className="form-text text-muted small">
                  Leave as 'Overall Monthly Budget' to cap your total spending for the month.
                </div>
              </div>

              {/* Amount */}
              <div className="mb-3">
                <label className="form-label">Budget Amount (₹) *</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
                    placeholder="e.g. 15000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                  {errors.amount && <div className="invalid-feedback">{errors.amount}</div>}
                </div>
              </div>

              {/* Month & Year */}
              <div className="row g-3 mb-2">
                <div className="col-md-6">
                  <label className="form-label">Month</label>
                  <select
                    className="form-select"
                    value={budgetMonth}
                    onChange={(e) => setBudgetMonth(e.target.value)}
                  >
                    {months.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Year</label>
                  <select
                    className="form-select"
                    value={budgetYear}
                    onChange={(e) => setBudgetYear(e.target.value)}
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer border-top px-4 py-3 bg-light" style={{ borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
              <button type="button" className="btn btn-secondary-custom btn-sm" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-emerald btn-sm" disabled={loading}>
                {loading ? 'Saving...' : budgetToEdit ? 'Update Budget' : 'Create Budget'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}

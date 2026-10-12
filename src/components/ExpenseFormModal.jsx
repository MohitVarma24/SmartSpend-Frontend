import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Tag, CreditCard, FileText } from 'lucide-react';
import { expenseApi } from '../api/expenseApi';
import { categoryApi } from '../api/categoryApi';
import { validateAmount } from '../utils/validation';

const PAYMENT_METHODS = [
  'UPI',
  'Cash',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Other'
];

export default function ExpenseFormModal({
  show,
  onClose,
  onSuccess,
  expenseToEdit = null
}) {
  const [categories, setCategories] = useState([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notes, setNotes] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (show) {
      loadCategories();
      if (expenseToEdit) {
        setAmount(expenseToEdit.amount || '');
        setDescription(expenseToEdit.description || '');
        setCategoryId(expenseToEdit.category?.id || '');
        setExpenseDate(expenseToEdit.expenseDate || new Date().toISOString().split('T')[0]);
        setPaymentMethod(expenseToEdit.paymentMethod || 'UPI');
        setNotes(expenseToEdit.notes || '');
      } else {
        // Reset form
        setAmount('');
        setDescription('');
        setExpenseDate(new Date().toISOString().split('T')[0]);
        setPaymentMethod('UPI');
        setNotes('');
      }
      setErrors({});
      setServerError('');
    }
  }, [show, expenseToEdit]);

  const loadCategories = async () => {
    try {
      const data = await categoryApi.getCategories();
      setCategories(data);
      if (!expenseToEdit && data.length > 0) {
        setCategoryId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const validate = () => {
    const newErrors = {};
    const amountErr = validateAmount(amount);
    if (amountErr) newErrors.amount = amountErr;

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    if (!expenseDate) {
      newErrors.expenseDate = 'Expense date is required';
    }

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
      description: description.trim(),
      categoryId: parseInt(categoryId),
      expenseDate,
      paymentMethod,
      notes: notes.trim()
    };

    try {
      if (expenseToEdit) {
        await expenseApi.updateExpense(expenseToEdit.id, payload);
      } else {
        await expenseApi.createExpense(payload);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save expense. Please check input.';
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
              {expenseToEdit ? 'Edit Expense' : 'Add New Expense'}
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

              {/* Amount */}
              <div className="mb-3">
                <label className="form-label">Amount (₹) *</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                  {errors.amount && <div className="invalid-feedback">{errors.amount}</div>}
                </div>
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="form-label">Description *</label>
                <input
                  type="text"
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  placeholder="e.g. Grocery shopping, Metro recharge, Books"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
                {errors.description && <div className="invalid-feedback">{errors.description}</div>}
              </div>

              {/* Category & Date in 2 columns */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">Category *</label>
                  <select
                    className={`form-select ${errors.categoryId ? 'is-invalid' : ''}`}
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.custom ? '(Custom)' : ''}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && <div className="invalid-feedback">{errors.categoryId}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label">Expense Date *</label>
                  <input
                    type="date"
                    className={`form-control ${errors.expenseDate ? 'is-invalid' : ''}`}
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    required
                  />
                  {errors.expenseDate && <div className="invalid-feedback">{errors.expenseDate}</div>}
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-3">
                <label className="form-label">Payment Method</label>
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div className="mb-2">
                <label className="form-label">Notes (Optional)</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Add any additional details or receipts reference..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer border-top px-4 py-3 bg-light" style={{ borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
              <button type="button" className="btn btn-secondary-custom btn-sm" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-emerald btn-sm" disabled={loading}>
                {loading ? 'Saving...' : expenseToEdit ? 'Update Expense' : 'Add Expense'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';
import { expenseApi } from '../api/expenseApi';
import { categoryApi } from '../api/categoryApi';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import ExpenseFormModal from '../components/ExpenseFormModal';

const PAYMENT_METHODS = ['UPI', 'Cash', 'Debit Card', 'Credit Card', 'Bank Transfer', 'Other'];

export default function Transactions() {
  const { openAddExpense, refreshTrigger, triggerRefresh } = useOutletContext();

  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Pagination & Sort state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState('expenseDate');
  const [sortDir, setSortDir] = useState('desc');

  // Filter state
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals state
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [page, pageSize, sortBy, sortDir, refreshTrigger]);

  const loadCategories = async () => {
    try {
      const data = await categoryApi.getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: pageSize,
        sortBy,
        sortDir,
        search: search.trim() || undefined,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        paymentMethod: paymentMethod || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      };

      const data = await expenseApi.getExpenses(params);
      setExpenses(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('Failed to load transactions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setPage(0);
    loadExpenses();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategoryId('');
    setPaymentMethod('');
    setStartDate('');
    setEndDate('');
    setPage(0);
    // Reload with cleared filters
    setTimeout(() => {
      expenseApi.getExpenses({ page: 0, size: pageSize, sortBy, sortDir })
        .then(data => {
          setExpenses(data.content || []);
          setTotalPages(data.totalPages || 0);
          setTotalElements(data.totalElements || 0);
        });
    }, 50);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
    setPage(0);
  };

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;
    setDeleting(true);
    try {
      await expenseApi.deleteExpense(expenseToDelete.id);
      setShowDeleteModal(false);
      setExpenseToDelete(null);
      loadExpenses();
      triggerRefresh();
    } catch (err) {
      console.error('Failed to delete transaction', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="transactions-page">
      
      {/* Top Action Bar */}
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fs-4 fw-bold text-dark m-0">Transactions History</h2>
          <p className="text-muted small m-0">
            Track, filter, and inspect all your personal expenses
          </p>
        </div>

        <button
          type="button"
          className="btn btn-emerald btn-sm px-3 d-flex align-items-center gap-2"
          onClick={openAddExpense}
        >
          <Plus size={16} /> Add New Expense
        </button>
      </div>

      {/* Filter Card */}
      <div className="smart-card mb-4 p-3 bg-white">
        <form onSubmit={handleApplyFilters}>
          <div className="row g-3 align-items-end">
            
            {/* Search */}
            <div className="col-12 col-md-3">
              <label className="form-label small">Search Description</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light text-muted">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Keyword or notes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="col-6 col-md-2">
              <label className="form-label small">Category</label>
              <select
                className="form-select form-select-sm"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method Filter */}
            <div className="col-6 col-md-2">
              <label className="form-label small">Payment Method</label>
              <select
                className="form-select form-select-sm"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="">All Methods</option>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div className="col-6 col-md-2">
              <label className="form-label small">From Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {/* End Date */}
            <div className="col-6 col-md-2">
              <label className="form-label small">To Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* Filter Buttons */}
            <div className="col-12 col-md-1 d-flex gap-2">
              <button
                type="submit"
                className="btn btn-emerald btn-sm w-100 p-2 d-flex align-items-center justify-content-center"
                title="Apply Filters"
              >
                <Filter size={14} />
              </button>
              <button
                type="button"
                className="btn btn-secondary-custom btn-sm w-100 p-2 d-flex align-items-center justify-content-center"
                onClick={handleClearFilters}
                title="Reset Filters"
              >
                <RotateCcw size={14} />
              </button>
            </div>

          </div>
        </form>
      </div>

      {/* Transactions Table Card */}
      <div className="smart-card p-0 bg-white shadow-sm overflow-hidden mb-4">
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
          <span className="small text-muted fw-semibold">
            Showing {expenses.length} of {totalElements} Transactions
          </span>
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted">Rows per page:</span>
            <select
              className="form-select form-select-sm"
              style={{ width: '70px' }}
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value));
                setPage(0);
              }}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading transactions..." />
        ) : expenses.length === 0 ? (
          <EmptyState
            title="No Matching Transactions"
            message="No expenses matched your filter criteria. Try clearing filters or adding an expense."
            actionText="Clear Filters"
            onAction={handleClearFilters}
          />
        ) : (
          <div className="table-responsive">
            <table className="smart-table">
              <thead>
                <tr>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('expenseDate')}>
                    <div className="d-flex align-items-center gap-1">
                      Date <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Method</th>
                  <th>Notes</th>
                  <th className="text-end" style={{ cursor: 'pointer' }} onClick={() => handleSort('amount')}>
                    <div className="d-flex align-items-center justify-content-end gap-1">
                      Amount <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((tx) => (
                  <tr key={tx.id}>
                    <td className="text-muted small" style={{ whiteSpace: 'nowrap' }}>
                      {formatDate(tx.expenseDate)}
                    </td>
                    <td>
                      <span className="fw-semibold text-dark">{tx.description}</span>
                    </td>
                    <td>
                      <span
                        className="badge py-1 px-2 fw-medium rounded-pill"
                        style={{
                          backgroundColor: `${tx.category?.color || '#10B981'}15`,
                          color: tx.category?.color || '#059669',
                          border: `1px solid ${tx.category?.color || '#10B981'}30`,
                          fontSize: '0.8rem'
                        }}
                      >
                        {tx.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="text-muted small">
                      {tx.paymentMethod || 'Other'}
                    </td>
                    <td className="text-muted small text-truncate" style={{ maxWidth: '180px' }}>
                      {tx.notes || '-'}
                    </td>
                    <td className="text-end fw-bold text-dark" style={{ whiteSpace: 'nowrap' }}>
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-light p-1 text-muted"
                          title="Edit"
                          onClick={() => {
                            setExpenseToEdit(tx);
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
                            setExpenseToDelete(tx);
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3 border-top d-flex align-items-center justify-content-between">
            <span className="small text-muted">
              Page {page + 1} of {totalPages}
            </span>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-secondary-custom btn-sm"
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button
                type="button"
                className="btn btn-secondary-custom btn-sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <ExpenseFormModal
        show={showEditModal}
        expenseToEdit={expenseToEdit}
        onClose={() => {
          setShowEditModal(false);
          setExpenseToEdit(null);
        }}
        onSuccess={() => {
          loadExpenses();
          triggerRefresh();
        }}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        show={showDeleteModal}
        title="Delete Transaction"
        message={`Delete "${expenseToDelete?.description}" of ${formatCurrency(expenseToDelete?.amount)}? This action cannot be reversed.`}
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

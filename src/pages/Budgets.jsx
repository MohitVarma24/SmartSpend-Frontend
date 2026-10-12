import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  PiggyBank,
  Plus,
  AlertTriangle,
  Edit2,
  Trash2,
  CheckCircle,
  TrendingDown,
  Layers
} from 'lucide-react';
import { budgetApi } from '../api/budgetApi';
import { formatCurrency } from '../utils/currency';
import { getMonthName } from '../utils/date';
import BudgetProgress from '../components/BudgetProgress';
import BudgetFormModal from '../components/BudgetFormModal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Budgets() {
  const { selectedMonth, selectedYear, refreshTrigger, triggerRefresh } = useOutletContext();

  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadBudgets();
  }, [selectedMonth, selectedYear, refreshTrigger]);

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const data = await budgetApi.getBudgets(selectedMonth, selectedYear);
      setBudgets(data || []);
    } catch (err) {
      console.error('Failed to load budgets', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBudget = async () => {
    if (!budgetToDelete) return;
    setDeleting(true);
    try {
      await budgetApi.deleteBudget(budgetToDelete.id);
      setShowDeleteModal(false);
      setBudgetToDelete(null);
      loadBudgets();
      triggerRefresh();
    } catch (err) {
      console.error('Failed to delete budget', err);
    } finally {
      setDeleting(false);
    }
  };

  const overallBudget = budgets.find((b) => b.category === null);
  const categoryBudgets = budgets.filter((b) => b.category !== null);

  const totalBudgetCap = budgets.reduce((acc, b) => acc + (b.category ? 0 : Number(b.amount)), 0);
  const totalCategoryBudgetCap = categoryBudgets.reduce((acc, b) => acc + Number(b.amount), 0);

  return (
    <div className="budgets-page">
      
      {/* Top Header */}
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fs-4 fw-bold text-dark m-0">
            Budgets for {getMonthName(selectedMonth)} {selectedYear}
          </h2>
          <p className="text-muted small m-0">
            Set spending ceilings to maintain financial discipline and receive threshold alerts
          </p>
        </div>

        <button
          type="button"
          className="btn btn-emerald btn-sm px-3 d-flex align-items-center gap-2"
          onClick={() => {
            setBudgetToEdit(null);
            setShowAddModal(true);
          }}
        >
          <Plus size={16} /> Create Budget
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Calculating budget consumption..." />
      ) : budgets.length === 0 ? (
        <EmptyState
          title="No Budgets Defined"
          message={`You haven't configured any budgets for ${getMonthName(selectedMonth)} ${selectedYear}. Set an overall budget to track your spending.`}
          actionText="Create Monthly Budget"
          onAction={() => setShowAddModal(true)}
          icon={PiggyBank}
        />
      ) : (
        <div className="d-flex flex-column gap-4">
          
          {/* Overall Monthly Budget Card */}
          {overallBudget && (
            <div className="smart-card bg-white border-2" style={{ borderColor: '#10B981' }}>
              <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <div className="p-2 rounded-3 bg-emerald-light text-emerald" style={{ backgroundColor: '#ECFDF5', color: '#10B981' }}>
                    <PiggyBank size={24} />
                  </div>
                  <div>
                    <h4 className="fw-bold text-dark m-0 fs-5">Overall Monthly Budget</h4>
                    <span className="text-muted small">Capping all expenses for {getMonthName(selectedMonth)} {selectedYear}</span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-light p-2 text-muted rounded-circle border"
                    title="Edit Overall Budget"
                    onClick={() => {
                      setBudgetToEdit(overallBudget);
                      setShowAddModal(true);
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-light p-2 text-danger rounded-circle border"
                    title="Delete Overall Budget"
                    onClick={() => {
                      setBudgetToDelete(overallBudget);
                      setShowDeleteModal(true);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Progress and Numbers */}
              <div className="row g-4 align-items-center">
                <div className="col-12 col-md-8">
                  <BudgetProgress budget={overallBudget} showDetails={true} />
                </div>
                <div className="col-12 col-md-4 text-md-end border-start-md">
                  <div className="small text-muted mb-1">Status Summary</div>
                  <div className="fs-5 fw-bold text-dark">
                    {overallBudget.remainingAmount < 0 ? (
                      <span className="text-danger">Deficit: {formatCurrency(Math.abs(overallBudget.remainingAmount))}</span>
                    ) : (
                      <span className="text-success">Available: {formatCurrency(overallBudget.remainingAmount)}</span>
                    )}
                  </div>
                  <span className="text-muted small">
                    {overallBudget.percentageUsed.toFixed(1)}% of {formatCurrency(overallBudget.amount)} used
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Category Budgets Grid */}
          <div>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h3 className="fs-5 fw-bold text-dark m-0 d-flex align-items-center gap-2">
                <Layers size={18} className="text-success" />
                Category Specific Budgets ({categoryBudgets.length})
              </h3>
            </div>

            {categoryBudgets.length === 0 ? (
              <div className="smart-card p-4 text-center text-muted small bg-white">
                No category-specific budgets set for this month. You can create targeted caps for Food, Shopping, Transport, etc.
              </div>
            ) : (
              <div className="row g-3">
                {categoryBudgets.map((b) => (
                  <div key={b.id} className="col-12 col-md-6 col-lg-4">
                    <div className="smart-card h-100 bg-white p-3">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="fw-bold text-dark fs-6 d-flex align-items-center gap-2">
                          <span
                            className="rounded-circle d-inline-block"
                            style={{
                              width: '12px',
                              height: '12px',
                              backgroundColor: b.category?.color || '#3B82F6'
                            }}
                          />
                          {b.category?.name}
                        </span>

                        <div className="d-flex align-items-center gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-light p-1 text-muted"
                            title="Edit"
                            onClick={() => {
                              setBudgetToEdit(b);
                              setShowAddModal(true);
                            }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-light p-1 text-danger"
                            title="Delete"
                            onClick={() => {
                              setBudgetToDelete(b);
                              setShowDeleteModal(true);
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <BudgetProgress budget={b} showDetails={true} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Add / Edit Budget Modal */}
      <BudgetFormModal
        show={showAddModal}
        budgetToEdit={budgetToEdit}
        currentMonth={selectedMonth}
        currentYear={selectedYear}
        onClose={() => {
          setShowAddModal(false);
          setBudgetToEdit(null);
        }}
        onSuccess={() => {
          loadBudgets();
          triggerRefresh();
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        show={showDeleteModal}
        title="Delete Budget"
        message={`Delete this budget limit of ${formatCurrency(budgetToDelete?.amount)}? You will no longer receive alerts for this target.`}
        onConfirm={handleDeleteBudget}
        onCancel={() => {
          setShowDeleteModal(false);
          setBudgetToDelete(null);
        }}
        loading={deleting}
      />

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FileText,
  Download,
  FileSpreadsheet,
  Calendar,
  CheckCircle2,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { reportApi } from '../api/reportApi';
import { formatCurrency } from '../utils/currency';
import { formatDate, getMonthName } from '../utils/date';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Reports() {
  const { selectedMonth, selectedYear, refreshTrigger } = useOutletContext();

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReport();
  }, [selectedMonth, selectedYear, refreshTrigger]);

  const loadReport = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await reportApi.getMonthlyReport(selectedMonth, selectedYear);
      setReport(data);
    } catch (err) {
      console.error('Failed to load report', err);
      setError('Failed to generate report for selected period.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      await reportApi.downloadPdfReport(selectedMonth, selectedYear);
    } catch (err) {
      console.error('PDF download failed', err);
      alert('Could not download PDF report. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadCsv = async () => {
    setDownloadingCsv(true);
    try {
      await reportApi.downloadCsvReport(selectedMonth, selectedYear);
    } catch (err) {
      console.error('CSV download failed', err);
      alert('Could not download CSV export. Please try again.');
    } finally {
      setDownloadingCsv(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Compiling monthly financial report..." />;
  }

  return (
    <div className="reports-page">
      
      {/* Top Header & Export Actions */}
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fs-4 fw-bold text-dark m-0">
            Monthly Statement — {getMonthName(selectedMonth)} {selectedYear}
          </h2>
          <p className="text-muted small m-0">
            Official summary of your monthly spending, budget health, and transaction ledger
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Download CSV */}
          <button
            type="button"
            className="btn btn-secondary-custom btn-sm d-flex align-items-center gap-2"
            onClick={handleDownloadCsv}
            disabled={downloadingCsv}
          >
            <FileSpreadsheet size={16} />
            <span>{downloadingCsv ? 'Exporting...' : 'Export CSV'}</span>
          </button>

          {/* Download PDF */}
          <button
            type="button"
            className="btn btn-emerald btn-sm d-flex align-items-center gap-2 shadow-sm"
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
          >
            <Download size={16} />
            <span>{downloadingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mb-4">
          {error}
        </div>
      )}

      {report && (
        <div className="d-flex flex-column gap-4">
          
          {/* Executive Summary Card */}
          <div className="smart-card bg-white p-4">
            <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
              <div>
                <span className="badge-status badge-info mb-1">Official Statement</span>
                <h4 className="fw-bold text-dark m-0 fs-5">SmartSpend Monthly Financial Summary</h4>
                <span className="text-muted small">
                  Issued for: {report.user?.fullName} ({report.user?.email})
                </span>
              </div>
              <div className="text-end text-muted small">
                Currency: <span className="fw-bold text-dark">{report.user?.currency || 'INR (₹)'}</span>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-6 col-md-3">
                <span className="text-muted small fw-semibold text-uppercase">Total Spend</span>
                <div className="fs-4 fw-extrabold text-dark mt-1">
                  {formatCurrency(report.totalSpending)}
                </div>
                <span className="text-muted small">{report.transactionCount} transactions</span>
              </div>

              <div className="col-6 col-md-3">
                <span className="text-muted small fw-semibold text-uppercase">Monthly Budget</span>
                <div className="fs-4 fw-bold text-dark mt-1">
                  {formatCurrency(report.monthlyBudget)}
                </div>
                <span className="text-muted small">{report.budgetUsedPercentage.toFixed(1)}% utilized</span>
              </div>

              <div className="col-6 col-md-3">
                <span className="text-muted small fw-semibold text-uppercase">Remaining Balance</span>
                <div className={`fs-4 fw-bold mt-1 ${report.remainingBudget < 0 ? 'text-danger' : 'text-success'}`}>
                  {formatCurrency(report.remainingBudget)}
                </div>
                <span className="text-muted small">{report.remainingBudget < 0 ? 'Over budget' : 'Surplus headroom'}</span>
              </div>

              <div className="col-6 col-md-3">
                <span className="text-muted small fw-semibold text-uppercase">Top Category</span>
                <div className="fs-4 fw-bold text-dark mt-1 text-truncate">
                  {report.highestCategoryName}
                </div>
                <span className="text-muted small">{formatCurrency(report.highestCategoryAmount)}</span>
              </div>
            </div>
          </div>

          {/* Category Breakdown Summary Table */}
          <div className="smart-card bg-white p-0 overflow-hidden">
            <div className="p-3 border-bottom bg-light d-flex align-items-center justify-content-between">
              <h5 className="fw-bold text-dark m-0 fs-6">Category Breakdown Summary</h5>
              <span className="text-muted small">{report.categoryBreakdown?.length || 0} Categories</span>
            </div>

            <div className="table-responsive">
              <table className="smart-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th className="text-center">Transactions</th>
                    <th className="text-end">Percentage</th>
                    <th className="text-end">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {report.categoryBreakdown?.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center text-muted p-4">
                        No expenses recorded for this month.
                      </td>
                    </tr>
                  ) : (
                    report.categoryBreakdown?.map((cat) => (
                      <tr key={cat.categoryId}>
                        <td className="fw-semibold text-dark">
                          <span
                            className="rounded-circle d-inline-block me-2"
                            style={{ width: '10px', height: '10px', backgroundColor: cat.color || '#10B981' }}
                          />
                          {cat.categoryName}
                        </td>
                        <td className="text-center text-muted">{cat.count}</td>
                        <td className="text-end text-muted">{cat.percentage.toFixed(1)}%</td>
                        <td className="text-end fw-bold text-dark">{formatCurrency(cat.amount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transactions Log Preview */}
          <div className="smart-card bg-white p-0 overflow-hidden">
            <div className="p-3 border-bottom bg-light d-flex align-items-center justify-content-between">
              <h5 className="fw-bold text-dark m-0 fs-6">Detailed Transactions Ledger</h5>
              <span className="text-muted small">Showing up to 25 items</span>
            </div>

            <div className="table-responsive">
              <table className="smart-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Method</th>
                    <th className="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {report.transactions?.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-muted p-4">
                        No transactions logged in this statement period.
                      </td>
                    </tr>
                  ) : (
                    report.transactions?.slice(0, 25).map((tx) => (
                      <tr key={tx.id}>
                        <td className="text-muted small">{formatDate(tx.expenseDate)}</td>
                        <td className="fw-medium text-dark">{tx.description}</td>
                        <td>
                          <span className="badge-status badge-info py-0 px-2" style={{ fontSize: '0.75rem' }}>
                            {tx.category?.name || 'Other'}
                          </span>
                        </td>
                        <td className="text-muted small">{tx.paymentMethod || 'Other'}</td>
                        <td className="text-end fw-bold text-dark">{formatCurrency(tx.amount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

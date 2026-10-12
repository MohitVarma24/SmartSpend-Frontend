import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Lightbulb,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import { insightApi } from '../api/insightApi';
import { getMonthName } from '../utils/date';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function Insights() {
  const { selectedMonth, selectedYear, refreshTrigger } = useOutletContext();

  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    loadInsights();
  }, [selectedMonth, selectedYear, refreshTrigger]);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const data = await insightApi.getInsights(selectedMonth, selectedYear);
      setInsights(data.insights || []);
    } catch (err) {
      console.error('Failed to load insights', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'DANGER':
        return <span className="badge-status badge-exceeded">High Alert</span>;
      case 'WARNING':
        return <span className="badge-status badge-approaching">Attention</span>;
      case 'SUCCESS':
        return <span className="badge-status badge-normal">Positive Habit</span>;
      default:
        return <span className="badge-status badge-info">Observation</span>;
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'DANGER':
        return <ShieldAlert size={22} className="text-danger" />;
      case 'WARNING':
        return <AlertTriangle size={22} className="text-warning" />;
      case 'SUCCESS':
        return <CheckCircle2 size={22} className="text-success" />;
      default:
        return <Info size={22} className="text-info" />;
    }
  };

  return (
    <div className="insights-page">
      
      {/* Top Header */}
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 mb-1">
          <Sparkles size={20} className="text-success" />
          <h2 className="fs-4 fw-bold text-dark m-0">
            Smart Financial Insights — {getMonthName(selectedMonth)} {selectedYear}
          </h2>
        </div>
        <p className="text-muted small m-0">
          Transparent, rule-based algorithmic recommendations derived from your verified database transactions
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Running rule-based analytics engine on your financial ledger..." />
      ) : insights.length === 0 ? (
        <EmptyState
          title="No Insights Available"
          message={`Log transactions for ${getMonthName(selectedMonth)} ${selectedYear} to activate algorithmic analysis.`}
          icon={Lightbulb}
        />
      ) : (
        <div className="row g-4">
          {insights.map((item, idx) => (
            <div key={idx} className="col-12 col-lg-6">
              <div 
                className="smart-card h-100 p-4 border transition"
                style={{
                  borderLeft: `5px solid ${
                    item.severity === 'DANGER' ? '#EF4444' :
                    item.severity === 'WARNING' ? '#F59E0B' :
                    item.severity === 'SUCCESS' ? '#10B981' : '#06B6D4'
                  }`
                }}
              >
                {/* Header */}
                <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
                  <div className="d-flex align-items-center gap-2">
                    {getSeverityIcon(item.severity)}
                    <h5 className="fw-bold text-dark m-0 fs-6">{item.title}</h5>
                  </div>
                  {getSeverityBadge(item.severity)}
                </div>

                {/* Message & Context */}
                <p className="text-dark small mb-2 fw-medium lh-base">
                  {item.message}
                </p>

                {item.details && (
                  <p className="text-muted small mb-3">
                    {item.details}
                  </p>
                )}

                {/* Actionable Tip Box */}
                <div 
                  className="p-3 rounded-3 mb-3"
                  style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}
                >
                  <div className="d-flex align-items-start gap-2">
                    <Lightbulb size={16} className="text-success flex-shrink-0 mt-1" />
                    <div>
                      <span className="fw-bold text-dark small">Actionable Recommendation: </span>
                      <span className="text-muted small">{item.actionableTip}</span>
                    </div>
                  </div>
                </div>

                {/* Mathematical / Calculation Explanation */}
                {item.calculationExplanation && (
                  <div className="pt-2 border-top d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.75rem' }}>
                    <HelpCircle size={13} className="flex-shrink-0" />
                    <span>How it was computed: {item.calculationExplanation}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

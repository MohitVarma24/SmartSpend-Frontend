import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  show,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false
}) {
  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
          <div className="modal-body p-4 text-center">
            <div 
              className="d-inline-flex align-items-center justify-content-center mb-3 rounded-circle"
              style={{ width: '56px', height: '56px', backgroundColor: '#FEF2F2', color: '#EF4444' }}
            >
              <AlertTriangle size={28} />
            </div>
            <h5 className="fw-bold mb-2 text-dark">{title}</h5>
            <p className="text-muted small mb-4">{message}</p>
            <div className="d-flex justify-content-center gap-3">
              <button 
                type="button" 
                className="btn btn-secondary-custom px-4" 
                onClick={onCancel}
                disabled={loading}
              >
                {cancelText}
              </button>
              <button 
                type="button" 
                className="btn btn-danger px-4 fw-semibold" 
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? 'Deleting...' : confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

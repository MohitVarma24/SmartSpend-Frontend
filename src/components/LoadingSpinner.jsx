import React from 'react';

export default function LoadingSpinner({ text = 'Loading data...', size = 'medium' }) {
  const spinnerSize = size === 'small' ? 'spinner-border-sm' : '';

  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-5 my-4">
      <div className={`spinner-border text-success ${spinnerSize}`} role="status" style={{ color: '#10B981' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      {text && <p className="mt-3 text-muted small fw-medium">{text}</p>}
    </div>
  );
}

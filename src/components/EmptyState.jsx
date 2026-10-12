import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  title = 'No Data Found',
  message = 'There are no records to display for this period.',
  actionText,
  onAction,
  icon: Icon = Inbox
}) {
  return (
    <div className="text-center p-5 smart-card bg-white my-3">
      <div 
        className="d-inline-flex align-items-center justify-content-center mb-3 rounded-circle"
        style={{ width: '64px', height: '64px', backgroundColor: '#F1F5F9', color: '#64748B' }}
      >
        <Icon size={32} />
      </div>
      <h5 className="fw-bold mb-2 text-dark">{title}</h5>
      <p className="text-muted small mb-4 mx-auto" style={{ maxWidth: '400px' }}>
        {message}
      </p>
      {actionText && onAction && (
        <button className="btn btn-emerald btn-sm" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
}

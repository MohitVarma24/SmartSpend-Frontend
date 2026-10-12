import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-4 text-center">
      <div className="smart-card bg-white p-5 shadow-sm border" style={{ maxWidth: '440px' }}>
        <div 
          className="d-inline-flex p-3 rounded-circle mb-3 text-muted"
          style={{ backgroundColor: '#F1F5F9' }}
        >
          <Compass size={40} />
        </div>
        <h2 className="fw-bold text-dark mb-2">404 - Page Not Found</h2>
        <p className="text-muted small mb-4">
          The financial page you are looking for does not exist or has been moved.
        </p>
        <Link to="/dashboard" className="btn btn-emerald btn-sm px-4">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

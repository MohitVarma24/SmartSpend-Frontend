import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg = '#ECFDF5',
  iconColor = '#10B981',
  badgeText,
  badgeClass = 'badge-normal'
}) {
  return (
    <div className="stat-card h-100">
      <div className="stat-card-top">
        <span className="stat-card-label">{title}</span>
        {Icon && (
          <div 
            className="stat-card-icon" 
            style={{ backgroundColor: iconBg, color: iconColor }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>
      
      <div className="stat-card-value">{value}</div>
      
      <div className="stat-card-footer justify-content-between">
        {subtitle && <span>{subtitle}</span>}
        {badgeText && (
          <span className={`badge-status ${badgeClass}`}>
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}

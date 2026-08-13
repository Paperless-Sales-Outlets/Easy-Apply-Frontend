import React from 'react';
import { FiEye, FiCheck, FiX, FiFlag } from 'react-icons/fi';

const STATUS_ACTIONS = [
  { status: 'approved', label: 'Approve', icon: <FiCheck size={14} />, className: 'success' },
  { status: 'rejected', label: 'Reject', icon: <FiX size={14} />, className: 'danger' },
  { status: 'flagged', label: 'Flag', icon: <FiFlag size={14} />, className: 'warning' },
];

export default function ApplicationActions({ application, busy, onStatusChange, onView }) {
  return (
    <div className="admin-action-group">
      <button
        type="button"
        className="admin-btn ghost"
        onClick={() => onView?.(application)}
        title="View full form data & documents"
      >
        <FiEye size={14} /> View
      </button>
      {STATUS_ACTIONS.map((action) => (
        <button
          key={action.status}
          type="button"
          className={`admin-btn ${action.className}`}
          disabled={busy || application.status === action.status}
          onClick={() => onStatusChange?.(application.id, action.status)}
          title={application.status === action.status ? `Already ${action.label}d` : `${action.label} application`}
        >
          {action.icon} {action.label}
        </button>
      ))}
    </div>
  );
}

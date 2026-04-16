import React from 'react';
import { Icons } from './Icons';
import type { IconName } from './Icons';
import './StateComponents.css';

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = 'scroll', title, description, action }: EmptyStateProps) {
  const IconComp = Icons[icon];
  return (
    <div className="state-wrapper">
      <div className="state-icon"><IconComp size={48} /></div>
      <div className="state-title">{title}</div>
      {description && <div className="state-description">{description}</div>}
      {action && <div className="state-action">{action}</div>}
    </div>
  );
}

export function LoadingState({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="state-wrapper">
      <div className="loading-spinner" />
      <div className="state-description">{text}</div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state-wrapper">
      <div className="state-icon error"><Icons.x size={48} /></div>
      <div className="state-title">Something went wrong</div>
      <div className="state-description">{message}</div>
      {onRetry && (
        <div className="state-action">
          <button className="btn btn-outline" onClick={onRetry}>Try again</button>
        </div>
      )}
    </div>
  );
}

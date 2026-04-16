import React, { useState } from 'react';
import { Icons, LoadingState, EmptyState } from '@/components';
import {
  fetchPendingProposals, fetchRecentReviewed,
  approveProposal, rejectProposal,
  type ProposalRecord,
} from '@/data/api';
import { useAsync } from '@/lib/useAsync';
import './AdminPage.css';

type ActionState = { [id: string]: 'approving' | 'rejecting' | null };

export function AdminPage() {
  const [refreshTick, setRefreshTick] = useState(0);
  const [actionState, setActionState] = useState<ActionState>({});
  const [tab, setTab] = useState<'pending' | 'history'>('pending');

  const { data: pending, loading: pendingLoading } = useAsync(
    fetchPendingProposals, [], [refreshTick]
  );
  const { data: recent } = useAsync(
    () => fetchRecentReviewed(20), [], [refreshTick]
  );

  const handleApprove = async (id: string) => {
    setActionState(s => ({ ...s, [id]: 'approving' }));
    const ok = await approveProposal(id);
    if (ok) {
      setRefreshTick(t => t + 1);
    } else {
      alert('Could not approve. Check database permissions (RLS policies on edit_proposals and people tables).');
    }
    setActionState(s => ({ ...s, [id]: null }));
  };

  const handleReject = async (id: string) => {
    const note = window.prompt('Reason for rejection (optional):') || undefined;
    setActionState(s => ({ ...s, [id]: 'rejecting' }));
    const ok = await rejectProposal(id, note);
    if (ok) {
      setRefreshTick(t => t + 1);
    } else {
      alert('Could not reject. Please try again.');
    }
    setActionState(s => ({ ...s, [id]: null }));
  };

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title"><Icons.shield size={22} /> Admin Panel</h2>
        <span className="section-subtitle">Review and approve family contributions</span>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${tab === 'pending' ? 'active' : ''}`}
          onClick={() => setTab('pending')}
        >
          Pending Review
          {pending.length > 0 && <span className="admin-badge">{pending.length}</span>}
        </button>
        <button
          className={`admin-tab ${tab === 'history' ? 'active' : ''}`}
          onClick={() => setTab('history')}
        >
          Recent Activity
        </button>
      </div>

      {tab === 'pending' && (
        <>
          {pendingLoading ? (
            <LoadingState text="Loading pending submissions..." />
          ) : pending.length === 0 ? (
            <EmptyState
              icon="shield"
              title="Nothing pending"
              description="All submissions have been reviewed. New contributions from family members will appear here for approval."
            />
          ) : (
            <div className="admin-list">
              {pending.map(p => (
                <ProposalCard
                  key={p.id}
                  proposal={p}
                  state={actionState[p.id] || null}
                  onApprove={() => handleApprove(p.id)}
                  onReject={() => handleReject(p.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'history' && (
        <>
          {recent.length === 0 ? (
            <EmptyState
              icon="timeline"
              title="No review history"
              description="Approved and rejected submissions will appear here."
            />
          ) : (
            <div className="admin-list">
              {recent.map(p => <HistoryCard key={p.id} proposal={p} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ProposalCard({
  proposal, state, onApprove, onReject,
}: {
  proposal: ProposalRecord;
  state: 'approving' | 'rejecting' | null;
  onApprove: () => void;
  onReject: () => void;
}) {
  const data = proposal.proposedData;
  const busy = state !== null;

  return (
    <div className="proposal-card">
      <div className="proposal-top">
        <div className="proposal-labels">
          <span className={`action-badge ${proposal.action}`}>{proposal.action}</span>
          <span className="proposal-table">{proposal.targetTable}</span>
        </div>
        <div className="proposal-date">
          {new Date(proposal.createdAt).toLocaleString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </div>
      </div>
      <div className="proposal-body">
        {proposal.targetTable === 'people' ? (
          <div className="proposal-person">
            <div className="proposal-person-name">
              {data.first_name as string} {(data.last_name as string) || ''}
            </div>
            <div className="proposal-person-details">
              {data.gender && <span>{data.gender as string}</span>}
              {data.birth_year && (
                <span>Born {data.birth_year as number}{data.death_year ? ` \u2013 ${data.death_year}` : ''}</span>
              )}
              {data.birth_place && <span>{data.birth_place as string}</span>}
              {data.occupation && <span>{data.occupation as string}</span>}
            </div>
            {data.bio && <div className="proposal-bio">{data.bio as string}</div>}
            {data.name_meaning && (
              <div className="proposal-meaning">Name meaning: {data.name_meaning as string}</div>
            )}
          </div>
        ) : (
          <div className="proposal-raw">
            {Object.entries(data).map(([k, v]) => (
              <div key={k} className="proposal-raw-field">
                <span className="proposal-raw-key">{k}</span>
                <span className="proposal-raw-value">{String(v)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="proposal-actions">
        <button className="btn btn-outline" onClick={onReject} disabled={busy}>
          {state === 'rejecting' ? 'Rejecting...' : 'Reject'}
        </button>
        <button className="btn btn-primary" onClick={onApprove} disabled={busy}>
          {state === 'approving' ? 'Approving...' : 'Approve'}
        </button>
      </div>
    </div>
  );
}

function HistoryCard({ proposal }: { proposal: ProposalRecord }) {
  const data = proposal.proposedData;
  return (
    <div className={`proposal-card history ${proposal.status}`}>
      <div className="proposal-top">
        <div className="proposal-labels">
          <span className={`action-badge ${proposal.status}`}>{proposal.status}</span>
          <span className="proposal-table">{proposal.action} in {proposal.targetTable}</span>
        </div>
        <div className="proposal-date">
          {proposal.reviewedAt && new Date(proposal.reviewedAt).toLocaleString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </div>
      </div>
      <div className="proposal-body">
        {proposal.targetTable === 'people' && (
          <div className="proposal-person">
            <div className="proposal-person-name">
              {data.first_name as string} {(data.last_name as string) || ''}
            </div>
          </div>
        )}
      </div>
      {proposal.reviewNote && (
        <div className="proposal-note">Note: {proposal.reviewNote}</div>
      )}
    </div>
  );
}

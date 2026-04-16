import React, { useState, useMemo } from 'react';
import { Icons, LoadingState, EmptyState } from '@/components';
import { fetchEvents, fetchPeople } from '@/data/api';
import { useAsync } from '@/lib/useAsync';
import type { EventType } from '@/types';
import './TimelinePage.css';

interface TimelinePageProps {
  onSelectPerson: (id: string) => void;
}

export function TimelinePage({ onSelectPerson }: TimelinePageProps) {
  const [filter, setFilter] = useState<'all' | EventType>('all');
  const { data: events, loading } = useAsync(fetchEvents, []);
  const { data: people } = useAsync(fetchPeople, []);

  const types: ('all' | EventType)[] = ['all', 'birth', 'death', 'marriage', 'milestone'];

  const filtered = useMemo(() => {
    let evts = [...events].sort((a, b) => a.year - b.year);
    if (filter !== 'all') evts = evts.filter(e => e.type === filter);
    return evts;
  }, [events, filter]);

  const generationCount = new Set(people.map(p => p.generation)).size;

  if (loading) {
    return <div className="section"><LoadingState text="Loading timeline..." /></div>;
  }

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title"><Icons.timeline size={22} /> Family Timeline</h2>
        <span className="section-subtitle">
          {filtered.length} events across {generationCount} {generationCount === 1 ? 'generation' : 'generations'}
        </span>
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon="timeline"
          title="No events recorded yet"
          description="Life events appear here as you add births, marriages, and milestones to family profiles."
        />
      ) : (
        <>
          <div className="timeline-filters">
            {types.map(t => (
              <button
                key={t}
                className={`timeline-filter ${filter === t ? 'active' : ''}`}
                onClick={() => setFilter(t)}
              >
                {t === 'all' ? 'All Events' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div className="timeline-container">
            {filtered.map(e => {
              const person = people.find(p => p.id === e.personId);
              return (
                <div key={e.id} className="timeline-item">
                  <div className={`timeline-dot ${e.type}`} />
                  <div className="timeline-year">{e.year}</div>
                  <div className="timeline-title">{e.title}</div>
                  {person && (
                    <div className="timeline-person" onClick={() => onSelectPerson(person.id)}>
                      {person.firstName} {person.lastName}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { Icons } from '@/components/Icons';
import { EVENTS, PEOPLE } from '@/data/mockData';
import type { EventType } from '@/types';
import './TimelinePage.css';

interface TimelinePageProps {
  onSelectPerson: (id: string) => void;
}

export function TimelinePage({ onSelectPerson }: TimelinePageProps) {
  const [filter, setFilter] = useState<'all' | EventType>('all');
  const types: ('all' | EventType)[] = ['all', 'birth', 'death', 'marriage', 'milestone'];

  const filtered = useMemo(() => {
    let evts = [...EVENTS].sort((a, b) => a.year - b.year);
    if (filter !== 'all') evts = evts.filter(e => e.type === filter);
    return evts;
  }, [filter]);

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title"><Icons.timeline size={22} /> Family Timeline</h2>
        <span className="section-subtitle">{filtered.length} events across 4 generations</span>
      </div>
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
          const person = PEOPLE.find(p => p.id === e.personId);
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
    </div>
  );
}

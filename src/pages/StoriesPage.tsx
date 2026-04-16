import React from 'react';
import { Icons } from '@/components/Icons';
import { STORIES, PEOPLE } from '@/data/mockData';
import './StoriesPage.css';

interface StoriesPageProps {
  onSelectPerson: (id: string) => void;
}

export function StoriesPage({ onSelectPerson }: StoriesPageProps) {
  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title"><Icons.scroll size={22} /> Stories & Memories</h2>
        <span className="section-subtitle">{STORIES.length} stories preserved</span>
      </div>
      {STORIES.map(s => {
        const person = PEOPLE.find(p => p.id === s.personId);
        return (
          <div key={s.id} className="story-card" onClick={() => onSelectPerson(s.personId)}>
            <div className="story-card-header">
              <div className="story-card-title">{s.title}</div>
              <span className={`story-card-type ${s.type}`}>{s.type}</span>
            </div>
            <div className="story-card-content">{s.content}</div>
            <div className="story-card-footer">
              <span>About {person?.firstName} {person?.lastName} &middot; By {s.author}</span>
              <span>{new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

import React from 'react';
import { Icons } from '@/components/Icons';
import { PEOPLE, CLANS, STORIES, PROVERBS } from '@/data/mockData';
import type { PageId } from '@/types';
import './HomePage.css';

interface HomePageProps {
  onNavigate: (page: PageId, personId?: string) => void;
  onAddPerson: () => void;
}

export function HomePage({ onNavigate, onAddPerson }: HomePageProps) {
  const proverb = PROVERBS[Math.floor(Date.now() / 86400000) % PROVERBS.length];

  return (
    <>
      <div className="hero">
        <div className="hero-content">
          <div className="hero-icon"><Icons.tree size={48} /></div>
          <h1>Preserve Your <strong>Heritage</strong></h1>
          <p>
            A living archive for your family's history, stories, and legacy.
            Built to endure across generations.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => onNavigate('tree')}>
              <Icons.tree size={16} /> Explore the Tree
            </button>
            <button className="btn btn-secondary" onClick={onAddPerson}>
              <Icons.plus size={16} /> Add a Person
            </button>
          </div>
          <div className="hero-stats">
            <div>
              <span className="hero-stat-value">{PEOPLE.length}</span>
              <span className="hero-stat-label">People</span>
            </div>
            <div>
              <span className="hero-stat-value">4</span>
              <span className="hero-stat-label">Generations</span>
            </div>
            <div>
              <span className="hero-stat-value">{CLANS.length}</span>
              <span className="hero-stat-label">Clans</span>
            </div>
            <div>
              <span className="hero-stat-value">{STORIES.length}</span>
              <span className="hero-stat-label">Stories</span>
            </div>
          </div>
          <div className="hero-proverb">
            <div className="hero-proverb-text">"{proverb.text}"</div>
            <div className="hero-proverb-translation">{proverb.translation}</div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title"><Icons.shield size={20} /> Clans</h2>
        </div>
        <div className="clan-grid">
          {CLANS.map(c => {
            const count = PEOPLE.filter(p => p.clanId === c.id).length;
            return (
              <div key={c.id} className="clan-card" onClick={() => onNavigate('people')}>
                <div className="clan-card-name">{c.name}</div>
                <div className="clan-card-detail"><Icons.globe size={14} /> {c.origin}</div>
                <div className="clan-card-detail"><Icons.shield size={14} /> Totem: {c.totem}</div>
                <div className="clan-card-count">{count} members documented</div>
                <div className="clan-card-motto">"{c.motto}"</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title"><Icons.scroll size={20} /> Recent Stories</h2>
          <button className="btn btn-sm btn-outline" onClick={() => onNavigate('stories')}>
            View All <Icons.chevronRight size={14} />
          </button>
        </div>
        {STORIES.slice(0, 2).map(s => {
          const person = PEOPLE.find(p => p.id === s.personId);
          return (
            <div key={s.id} className="story-card" onClick={() => onNavigate('profile', s.personId)}>
              <div className="story-card-header">
                <div className="story-card-title">{s.title}</div>
                <span className={`story-card-type ${s.type}`}>{s.type}</span>
              </div>
              <div className="story-card-content">{s.content.slice(0, 200)}...</div>
              <div className="story-card-footer">
                <span>About {person?.firstName} {person?.lastName} &middot; By {s.author}</span>
                <span>{new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

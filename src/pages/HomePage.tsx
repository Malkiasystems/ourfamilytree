import React from 'react';
import { Icons, LoadingState, EmptyState } from '@/components';
import { fetchPeople, fetchClans, fetchStories, fetchProverbs } from '@/data/api';
import { useAsync } from '@/lib/useAsync';
import type { PageId } from '@/types';
import './HomePage.css';

interface HomePageProps {
  onNavigate: (page: PageId, personId?: string) => void;
  onAddPerson: () => void;
}

export function HomePage({ onNavigate, onAddPerson }: HomePageProps) {
  const { data: people, loading: peopleLoading } = useAsync(fetchPeople, []);
  const { data: clans } = useAsync(fetchClans, []);
  const { data: stories } = useAsync(fetchStories, []);
  const { data: proverbs } = useAsync(fetchProverbs, []);

  const proverb = proverbs.length > 0
    ? proverbs[Math.floor(Date.now() / 86400000) % proverbs.length]
    : null;

  const generationCount = new Set(people.map(p => p.generation)).size;

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
              <span className="hero-stat-value">{people.length}</span>
              <span className="hero-stat-label">People</span>
            </div>
            <div>
              <span className="hero-stat-value">{generationCount}</span>
              <span className="hero-stat-label">Generations</span>
            </div>
            <div>
              <span className="hero-stat-value">{clans.length}</span>
              <span className="hero-stat-label">Clans</span>
            </div>
            <div>
              <span className="hero-stat-value">{stories.length}</span>
              <span className="hero-stat-label">Stories</span>
            </div>
          </div>
          {proverb && (
            <div className="hero-proverb">
              <div className="hero-proverb-text">"{proverb.text}"</div>
              <div className="hero-proverb-translation">{proverb.translation}</div>
            </div>
          )}
        </div>
      </div>

      {peopleLoading ? (
        <div className="section"><LoadingState text="Loading your family..." /></div>
      ) : people.length === 0 ? (
        <div className="section">
          <EmptyState
            icon="tree"
            title="Your family tree starts here"
            description="Add your first family member to begin building your heritage archive. You can invite others to contribute later."
            action={
              <button className="btn btn-primary" onClick={onAddPerson}>
                <Icons.plus size={16} /> Add the first person
              </button>
            }
          />
        </div>
      ) : (
        <>
          {clans.length > 0 && (
            <div className="section">
              <div className="section-header">
                <h2 className="section-title"><Icons.shield size={20} /> Clans</h2>
              </div>
              <div className="clan-grid">
                {clans.map(c => {
                  const count = people.filter(p => p.clanId === c.id).length;
                  return (
                    <div key={c.id} className="clan-card" onClick={() => onNavigate('people')}>
                      <div className="clan-card-name">{c.name}</div>
                      {c.origin && <div className="clan-card-detail"><Icons.globe size={14} /> {c.origin}</div>}
                      {c.totem && <div className="clan-card-detail"><Icons.shield size={14} /> Totem: {c.totem}</div>}
                      <div className="clan-card-count">{count} {count === 1 ? 'member' : 'members'} documented</div>
                      {c.motto && <div className="clan-card-motto">"{c.motto}"</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {stories.length > 0 && (
            <div className="section">
              <div className="section-header">
                <h2 className="section-title"><Icons.scroll size={20} /> Recent Stories</h2>
                <button className="btn btn-sm btn-outline" onClick={() => onNavigate('stories')}>
                  View All <Icons.chevronRight size={14} />
                </button>
              </div>
              {stories.slice(0, 2).map(s => {
                const person = people.find(p => p.id === s.personId);
                return (
                  <div key={s.id} className="story-card" onClick={() => onNavigate('profile', s.personId)}>
                    <div className="story-card-header">
                      <div className="story-card-title">{s.title}</div>
                      <span className={`story-card-type ${s.type}`}>{s.type}</span>
                    </div>
                    <div className="story-card-content">{s.content.slice(0, 200)}...</div>
                    <div className="story-card-footer">
                      <span>
                        {person && <>About {person.firstName} {person.lastName} &middot; </>}
                        By {s.author}
                      </span>
                      <span>{new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </>
  );
}

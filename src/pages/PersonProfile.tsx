import React, { useState } from 'react';
import { Icons, Avatar, LoadingState, EmptyState } from '@/components';
import {
  fetchPersonById, fetchPeople, fetchClans,
  fetchStoriesByPerson, fetchEventsByPerson,
} from '@/data/api';
import { useAsync } from '@/lib/useAsync';
import './PersonProfile.css';

interface PersonProfileProps {
  personId: string;
  onNavigate: (id: string) => void;
  onBack: () => void;
}

export function PersonProfile({ personId, onNavigate, onBack }: PersonProfileProps) {
  const [tab, setTab] = useState<'bio' | 'relations' | 'stories' | 'timeline'>('bio');
  const { data: person, loading } = useAsync(() => fetchPersonById(personId), null, [personId]);
  const { data: allPeople } = useAsync(fetchPeople, []);
  const { data: clans } = useAsync(fetchClans, []);
  const { data: stories } = useAsync(() => fetchStoriesByPerson(personId), [], [personId]);
  const { data: events } = useAsync(() => fetchEventsByPerson(personId), [], [personId]);

  if (loading) {
    return <div className="profile"><LoadingState text="Loading profile..." /></div>;
  }

  if (!person) {
    return (
      <div className="profile">
        <button className="profile-back" onClick={onBack}>
          <Icons.chevronLeft size={16} /> Back
        </button>
        <EmptyState
          icon="user"
          title="Person not found"
          description="This profile could not be loaded. It may have been removed or you may not have permission to view it."
        />
      </div>
    );
  }

  const clan = clans.find(c => c.id === person.clanId);
  const parents = allPeople.filter(p => person.parentIds.includes(p.id));
  const spouses = allPeople.filter(p => person.spouseIds.includes(p.id));
  const children = allPeople.filter(p => person.childIds.includes(p.id));
  const siblings = allPeople.filter(p =>
    p.id !== person.id &&
    p.parentIds.some(pid => person.parentIds.includes(pid))
  );

  const allRelations = [
    ...parents.map(p => ({ ...p, relType: 'Parent' })),
    ...spouses.map(p => ({ ...p, relType: 'Spouse' })),
    ...children.map(p => ({ ...p, relType: 'Child' })),
    ...siblings.map(p => ({ ...p, relType: 'Sibling' })),
  ];

  const relationGroups = [
    { label: 'Parents', items: parents },
    { label: 'Spouses', items: spouses },
    { label: 'Children', items: children },
    { label: 'Siblings', items: siblings },
  ];

  const sortedEvents = [...events].sort((a, b) => a.year - b.year);
  const hasRelations = allRelations.length > 0;

  return (
    <div className="profile">
      <button className="profile-back" onClick={onBack}>
        <Icons.chevronLeft size={16} /> Back
      </button>

      <div className="profile-header">
        <Avatar person={person} size={96} className="profile-avatar" />
        <div className="profile-info">
          <h1 className="profile-name">{person.firstName} {person.lastName}</h1>
          {clan && <div className="profile-clan">{clan.name} Clan</div>}
          <div className="profile-meta">
            <span className="profile-meta-item">
              {person.gender === 'male' ? <Icons.male size={14} /> : <Icons.female size={14} />}
              {person.gender === 'male' ? 'Male' : 'Female'}
            </span>
            {person.birthYear && (
              <span className="profile-meta-item">
                <Icons.calendar size={14} />
                {person.birthYear}{person.deathYear ? ` \u2013 ${person.deathYear}` : ' \u2013 Present'}
              </span>
            )}
            {person.birthPlace && (
              <span className="profile-meta-item">
                <Icons.mapPin size={14} /> {person.birthPlace}
              </span>
            )}
          </div>
          {person.nameMeaning && (
            <div className="profile-name-meaning">
              <strong>Name meaning:</strong> {person.nameMeaning}
            </div>
          )}
        </div>
      </div>

      <div className="tabs">
        {(['bio', 'relations', 'stories', 'timeline'] as const).map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'bio' ? 'Biography' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'bio' && (
        <>
          <div className="profile-section">
            <h2 className="profile-section-title"><Icons.book size={18} /> Biography</h2>
            {person.bio ? (
              <p className="profile-bio">{person.bio}</p>
            ) : (
              <p className="profile-bio-empty">No biography has been added yet.</p>
            )}
          </div>
          {person.achievements && person.achievements.length > 0 && (
            <div className="profile-section">
              <h2 className="profile-section-title"><Icons.star size={18} /> Achievements</h2>
              <ul className="profile-achievements">
                {person.achievements.map((a, i) => (
                  <li key={i} className="profile-achievement">
                    <span className="profile-achievement-dot" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {hasRelations && (
            <div className="profile-section">
              <h2 className="profile-section-title"><Icons.users size={18} /> Family</h2>
              <div className="profile-relations">
                {allRelations.map(r => (
                  <div key={r.id} className="profile-relation-card" onClick={() => onNavigate(r.id)}>
                    <Avatar person={r} size={32} className="profile-relation-avatar" />
                    <div>
                      <div className="profile-relation-name">{r.firstName}</div>
                      <div className="profile-relation-type">{r.relType}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'relations' && (
        <div className="profile-section">
          <h2 className="profile-section-title"><Icons.link size={18} /> All Relationships</h2>
          {!hasRelations ? (
            <EmptyState
              icon="link"
              title="No relationships recorded"
              description="Connect this person to parents, spouses, children, or siblings to build their family network."
            />
          ) : (
            relationGroups.map(group => group.items.length > 0 && (
              <div key={group.label} className="profile-relation-group">
                <div className="profile-relation-group-label">{group.label}</div>
                <div className="profile-relations">
                  {group.items.map(r => (
                    <div key={r.id} className="profile-relation-card" onClick={() => onNavigate(r.id)}>
                      <Avatar person={r} size={32} className="profile-relation-avatar" />
                      <div>
                        <div className="profile-relation-name">{r.firstName} {r.lastName}</div>
                        <div className="profile-relation-type">
                          {r.birthYear}{r.deathYear ? `\u2013${r.deathYear}` : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'stories' && (
        <div className="profile-section">
          <h2 className="profile-section-title"><Icons.scroll size={18} /> Stories & Memories</h2>
          {stories.length === 0 ? (
            <EmptyState
              icon="scroll"
              title="No stories yet"
              description={`Be the first to share a memory about ${person.firstName}`}
            />
          ) : stories.map(s => (
            <div key={s.id} className="story-card">
              <div className="story-card-header">
                <div className="story-card-title">{s.title}</div>
                <span className={`story-card-type ${s.type}`}>{s.type}</span>
              </div>
              <div className="story-card-content">{s.content}</div>
              <div className="story-card-footer">
                <span>By {s.author}</span>
                <span>{new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'timeline' && (
        <div className="profile-section">
          <h2 className="profile-section-title"><Icons.timeline size={18} /> Life Events</h2>
          {sortedEvents.length === 0 ? (
            <EmptyState
              icon="timeline"
              title="No events recorded"
              description="Birth, marriage, and other life milestones will appear here."
            />
          ) : (
            <div className="timeline-container">
              {sortedEvents.map(e => (
                <div key={e.id} className="timeline-item">
                  <div className={`timeline-dot ${e.type}`} />
                  <div className="timeline-year">{e.year}</div>
                  <div className="timeline-title">{e.title}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

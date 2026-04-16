import React, { useState, useRef } from 'react';
import { Icons, Avatar, LoadingState, EmptyState } from '@/components';
import {
  fetchPersonById, fetchPeople, fetchClans,
  fetchStoriesByPerson, fetchEventsByPerson,
  fetchMediaByPerson, uploadPhoto,
} from '@/data/api';
import { useAsync } from '@/lib/useAsync';
import './PersonProfile.css';

interface PersonProfileProps {
  personId: string;
  onNavigate: (id: string) => void;
  onBack: () => void;
}

type ProfileTab = 'bio' | 'relations' | 'photos' | 'stories' | 'timeline';

export function PersonProfile({ personId, onNavigate, onBack }: PersonProfileProps) {
  const [tab, setTab] = useState<ProfileTab>('bio');
  const [photoRefresh, setPhotoRefresh] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: person, loading } = useAsync(() => fetchPersonById(personId), null, [personId]);
  const { data: allPeople } = useAsync(fetchPeople, []);
  const { data: clans } = useAsync(fetchClans, []);
  const { data: stories } = useAsync(() => fetchStoriesByPerson(personId), [], [personId]);
  const { data: events } = useAsync(() => fetchEventsByPerson(personId), [], [personId]);
  const { data: photos } = useAsync(() => fetchMediaByPerson(personId), [], [personId, photoRefresh]);

  if (loading) {
    return <div className="profile"><LoadingState text="Loading profile..." /></div>;
  }

  if (!person) {
    return (
      <div className="profile">
        <button className="profile-back" onClick={onBack}>
          <Icons.chevronLeft size={16} /> Back
        </button>
        <EmptyState icon="user" title="Person not found" description="This profile could not be loaded." />
      </div>
    );
  }

  const clan = clans.find(c => c.id === person.clanId);
  const parents = allPeople.filter(p => person.parentIds.includes(p.id));
  const spouses = allPeople.filter(p => person.spouseIds.includes(p.id));
  const children = allPeople.filter(p => person.childIds.includes(p.id));
  const siblings = allPeople.filter(p =>
    p.id !== person.id && p.parentIds.some(pid => person.parentIds.includes(pid))
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
  const photoCount = photos.filter(m => m.mediaType === 'photo').length;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const caption = window.prompt('Add a short caption for this photo (optional):') || undefined;
    const yearStr = window.prompt('What year was this photo taken? (optional):') || undefined;
    const year = yearStr ? parseInt(yearStr, 10) : undefined;
    setUploading(true);
    const ok = await uploadPhoto(file, personId, caption, year && !isNaN(year) ? year : undefined);
    setUploading(false);
    if (ok) {
      setPhotoRefresh(t => t + 1);
    } else {
      alert('Upload failed. Make sure a "media" storage bucket exists in Supabase and is set to public.');
    }
    if (fileRef.current) fileRef.current.value = '';
  };

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
        {([
          { key: 'bio' as const, label: 'Biography' },
          { key: 'relations' as const, label: 'Relations' },
          { key: 'photos' as const, label: `Photos${photoCount > 0 ? ` (${photoCount})` : ''}` },
          { key: 'stories' as const, label: 'Stories' },
          { key: 'timeline' as const, label: 'Timeline' },
        ]).map(t => (
          <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── BIO TAB ── */}
      {tab === 'bio' && (
        <>
          <div className="profile-section">
            <h2 className="profile-section-title"><Icons.book size={18} /> Biography</h2>
            {person.bio
              ? <p className="profile-bio">{person.bio}</p>
              : <p className="profile-bio-empty">No biography has been added yet.</p>
            }
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

      {/* ── RELATIONS TAB ── */}
      {tab === 'relations' && (
        <div className="profile-section">
          <h2 className="profile-section-title"><Icons.link size={18} /> All Relationships</h2>
          {!hasRelations ? (
            <EmptyState icon="link" title="No relationships recorded" description="Connect this person to parents, spouses, children, or siblings." />
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

      {/* ── PHOTOS TAB ── */}
      {tab === 'photos' && (
        <div className="profile-section">
          <div className="photos-header">
            <h2 className="profile-section-title"><Icons.camera size={18} /> Photo Album</h2>
            <label className="btn btn-sm btn-outline photos-upload-btn">
              <Icons.plus size={14} /> {uploading ? 'Uploading...' : 'Add Photo'}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
                disabled={uploading}
              />
            </label>
          </div>
          {photoCount === 0 ? (
            <EmptyState
              icon="camera"
              title="No photos yet"
              description={`Upload photos of ${person.firstName} to preserve their visual memory for future generations.`}
              action={
                <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                  <Icons.camera size={16} /> Upload first photo
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                  />
                </label>
              }
            />
          ) : (
            <div className="photos-grid">
              {photos.filter(m => m.mediaType === 'photo').map(photo => (
                <div key={photo.id} className="photo-card" onClick={() => setLightbox(photo.url)}>
                  <div className="photo-img-wrap">
                    <img src={photo.url} alt={photo.caption || person.firstName} loading="lazy" />
                  </div>
                  {(photo.caption || photo.yearTaken) && (
                    <div className="photo-caption">
                      {photo.caption && <span className="photo-caption-text">{photo.caption}</span>}
                      {photo.yearTaken && <span className="photo-caption-year">{photo.yearTaken}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── STORIES TAB ── */}
      {tab === 'stories' && (
        <div className="profile-section">
          <h2 className="profile-section-title"><Icons.scroll size={18} /> Stories & Memories</h2>
          {stories.length === 0 ? (
            <EmptyState icon="scroll" title="No stories yet" description={`Be the first to share a memory about ${person.firstName}`} />
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

      {/* ── TIMELINE TAB ── */}
      {tab === 'timeline' && (
        <div className="profile-section">
          <h2 className="profile-section-title"><Icons.timeline size={18} /> Life Events</h2>
          {sortedEvents.length === 0 ? (
            <EmptyState icon="timeline" title="No events recorded" description="Birth, marriage, and other life milestones will appear here." />
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

      {/* ── LIGHTBOX ── */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}>
            <Icons.x size={24} />
          </button>
          <img src={lightbox} alt="Photo" className="lightbox-img" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

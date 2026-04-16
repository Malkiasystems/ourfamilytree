import React, { useState, useRef } from 'react';
import { Icons, Avatar, LoadingState, EmptyState } from '@/components';
import {
  fetchPersonById, fetchPeople, fetchClans,
  fetchStoriesByPerson, fetchEventsByPerson,
  fetchMediaByPerson, uploadPhoto, setProfilePhoto,
  deletePhoto, fetchComments, postComment, deleteComment,
} from '@/data/api';
import { useAsync } from '@/lib/useAsync';
import './PersonProfile.css';

interface PersonProfileProps {
  personId: string;
  onNavigate: (id: string) => void;
  onBack: () => void;
}

type ProfileTab = 'bio' | 'relations' | 'photos' | 'stories' | 'timeline' | 'comments';

const EMOJIS = ['\u2764\uFE0F', '\u{1F64F}', '\u{1F60A}', '\u{1F622}', '\u{1F4AA}', '\u{1F331}', '\u2B50', '\u{1F54A}\uFE0F'];

export function PersonProfile({ personId, onNavigate, onBack }: PersonProfileProps) {
  const [tab, setTab] = useState<ProfileTab>('bio');
  const [photoRefresh, setPhotoRefresh] = useState(0);
  const [personRefresh, setPersonRefresh] = useState(0);
  const [commentRefresh, setCommentRefresh] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [settingProfile, setSettingProfile] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentEmoji, setCommentEmoji] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: person, loading } = useAsync(() => fetchPersonById(personId), null, [personId, personRefresh]);
  const { data: allPeople } = useAsync(fetchPeople, []);
  const { data: clans } = useAsync(fetchClans, []);
  const { data: stories } = useAsync(() => fetchStoriesByPerson(personId), [], [personId]);
  const { data: events } = useAsync(() => fetchEventsByPerson(personId), [], [personId]);
  const { data: photos } = useAsync(() => fetchMediaByPerson(personId), [], [personId, photoRefresh]);
  const { data: comments } = useAsync(() => fetchComments(personId), [], [personId, commentRefresh]);

  if (loading) return <div className="profile"><LoadingState text="Loading profile..." /></div>;
  if (!person) return (
    <div className="profile">
      <button className="profile-back" onClick={onBack}><Icons.chevronLeft size={16} /> Back</button>
      <EmptyState icon="user" title="Person not found" description="This profile could not be loaded." />
    </div>
  );

  const clan = clans.find(c => c.id === person.clanId);
  const parents = allPeople.filter(p => person.parentIds.includes(p.id));
  const spouses = allPeople.filter(p => person.spouseIds.includes(p.id));
  const children = allPeople.filter(p => person.childIds.includes(p.id));
  const siblings = allPeople.filter(p => p.id !== person.id && p.parentIds.some(pid => person.parentIds.includes(pid)));
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
  const personPhotos = photos.filter(m => m.mediaType === 'photo');

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const caption = window.prompt('Short caption (optional):') || undefined;
    const yearStr = window.prompt('Year taken (optional):') || undefined;
    const year = yearStr ? parseInt(yearStr, 10) : undefined;
    setUploading(true);
    const ok = await uploadPhoto(file, personId, caption, year && !isNaN(year) ? year : undefined);
    setUploading(false);
    if (ok) setPhotoRefresh(t => t + 1);
    else alert('Upload failed. Check storage bucket.');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSetProfile = async (url: string) => {
    setSettingProfile(url);
    const ok = await setProfilePhoto(personId, url);
    if (ok) setPersonRefresh(t => t + 1);
    setSettingProfile(null);
  };

  const handleDeletePhoto = async (id: string, url: string) => {
    if (!window.confirm('Delete this photo permanently?')) return;
    const ok = await deletePhoto(id, url);
    if (ok) {
      setPhotoRefresh(t => t + 1);
      if (person.photo === url) setPersonRefresh(t => t + 1);
    }
  };

  const handlePostComment = async () => {
    if (!commentName.trim() || !commentText.trim()) return;
    setPostingComment(true);
    const ok = await postComment(personId, commentName.trim(), commentText.trim(), commentEmoji || undefined);
    setPostingComment(false);
    if (ok) {
      setCommentText('');
      setCommentEmoji('');
      setCommentRefresh(t => t + 1);
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!window.confirm('Delete this comment?')) return;
    await deleteComment(id);
    setCommentRefresh(t => t + 1);
  };

  return (
    <div className="profile">
      <button className="profile-back" onClick={onBack}><Icons.chevronLeft size={16} /> Back</button>

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
              <span className="profile-meta-item"><Icons.calendar size={14} />{person.birthYear}{person.deathYear ? ` \u2013 ${person.deathYear}` : ' \u2013 Present'}</span>
            )}
            {person.birthPlace && <span className="profile-meta-item"><Icons.mapPin size={14} /> {person.birthPlace}</span>}
          </div>
          {person.nameMeaning && <div className="profile-name-meaning"><strong>Name meaning:</strong> {person.nameMeaning}</div>}
        </div>
      </div>

      <div className="tabs">
        {([
          { key: 'bio' as const, label: 'Biography' },
          { key: 'relations' as const, label: 'Relations' },
          { key: 'photos' as const, label: `Photos${personPhotos.length > 0 ? ` (${personPhotos.length})` : ''}` },
          { key: 'comments' as const, label: `Wall${comments.length > 0 ? ` (${comments.length})` : ''}` },
          { key: 'stories' as const, label: 'Stories' },
          { key: 'timeline' as const, label: 'Timeline' },
        ]).map(t => (
          <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {/* BIO */}
      {tab === 'bio' && (
        <>
          <div className="profile-section">
            <h2 className="profile-section-title"><Icons.book size={18} /> Biography</h2>
            {person.bio ? <p className="profile-bio">{person.bio}</p> : <p className="profile-bio-empty">No biography has been added yet.</p>}
          </div>
          {person.achievements && person.achievements.length > 0 && (
            <div className="profile-section">
              <h2 className="profile-section-title"><Icons.star size={18} /> Achievements</h2>
              <ul className="profile-achievements">
                {person.achievements.map((a, i) => (<li key={i} className="profile-achievement"><span className="profile-achievement-dot" />{a}</li>))}
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
                    <div><div className="profile-relation-name">{r.firstName}</div><div className="profile-relation-type">{r.relType}</div></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* RELATIONS */}
      {tab === 'relations' && (
        <div className="profile-section">
          <h2 className="profile-section-title"><Icons.link size={18} /> All Relationships</h2>
          {!hasRelations ? <EmptyState icon="link" title="No relationships recorded" /> : relationGroups.map(group => group.items.length > 0 && (
            <div key={group.label} className="profile-relation-group">
              <div className="profile-relation-group-label">{group.label}</div>
              <div className="profile-relations">
                {group.items.map(r => (
                  <div key={r.id} className="profile-relation-card" onClick={() => onNavigate(r.id)}>
                    <Avatar person={r} size={32} className="profile-relation-avatar" />
                    <div><div className="profile-relation-name">{r.firstName} {r.lastName}</div><div className="profile-relation-type">{r.birthYear}{r.deathYear ? `\u2013${r.deathYear}` : ''}</div></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PHOTOS YEARBOOK */}
      {tab === 'photos' && (
        <div className="profile-section">
          <div className="yearbook-header">
            <div>
              <h2 className="profile-section-title"><Icons.camera size={18} /> Photo Album</h2>
              <p className="yearbook-subtitle">Memories of {person.firstName} across the years</p>
            </div>
            <label className="btn btn-sm btn-outline yearbook-upload-btn">
              <Icons.plus size={14} /> {uploading ? 'Uploading...' : 'Add Photo'}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} disabled={uploading} />
            </label>
          </div>
          {personPhotos.length === 0 ? (
            <div className="yearbook-empty">
              <div className="yearbook-empty-frame">
                <Icons.camera size={56} /><div className="yearbook-empty-name">{person.firstName} {person.lastName}</div>
                <p>No photos yet. Be the first to upload.</p>
                <label className="btn btn-primary" style={{ cursor: 'pointer', marginTop: 16 }}>
                  <Icons.camera size={16} /> Upload Photo
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} disabled={uploading} />
                </label>
              </div>
            </div>
          ) : (
            <div className="yearbook-grid">
              {personPhotos.map(photo => {
                const isProfile = person.photo === photo.url;
                return (
                  <div key={photo.id} className={`yearbook-card ${isProfile ? 'is-profile' : ''}`}>
                    <div className="yearbook-img" onClick={() => setLightbox(photo.url)}>
                      <img src={photo.url} alt={photo.caption || person.firstName} loading="lazy" />
                      {isProfile && <div className="yearbook-profile-badge">Profile Photo</div>}
                    </div>
                    <div className="yearbook-info">
                      <div className="yearbook-caption-row">
                        <span className={`yearbook-caption ${!photo.caption ? 'muted' : ''}`}>{photo.caption || person.firstName}</span>
                        {photo.yearTaken && <span className="yearbook-year">{photo.yearTaken}</span>}
                      </div>
                      <div className="yearbook-actions">
                        {!isProfile && (
                          <button className="yearbook-btn" onClick={() => handleSetProfile(photo.url)} disabled={settingProfile === photo.url}>
                            {settingProfile === photo.url ? 'Setting...' : 'Set as profile'}
                          </button>
                        )}
                        <button className="yearbook-btn delete" onClick={() => handleDeletePhoto(photo.id, photo.url)}>Delete</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* COMMENTS WALL */}
      {tab === 'comments' && (
        <div className="profile-section">
          <h2 className="profile-section-title"><Icons.heart size={18} /> Family Wall</h2>
          <p className="wall-subtitle">Leave a message, memory, or tribute for {person.firstName}</p>

          <div className="comment-form">
            <input className="comment-input" placeholder="Your name" value={commentName} onChange={e => setCommentName(e.target.value)} />
            <textarea className="comment-textarea" placeholder={`Say something about ${person.firstName}...`} value={commentText} onChange={e => setCommentText(e.target.value)} rows={3} />
            <div className="comment-form-bottom">
              <div className="emoji-picker">
                {EMOJIS.map(e => (
                  <button key={e} className={`emoji-btn ${commentEmoji === e ? 'active' : ''}`} onClick={() => setCommentEmoji(commentEmoji === e ? '' : e)}>{e}</button>
                ))}
              </div>
              <button className="btn btn-primary btn-sm" onClick={handlePostComment} disabled={postingComment || !commentName.trim() || !commentText.trim()}>
                {postingComment ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>

          {comments.length === 0 ? (
            <div className="wall-empty">No messages yet. Be the first to write on {person.firstName}'s wall.</div>
          ) : (
            <div className="comments-list">
              {comments.map(c => (
                <div key={c.id} className="comment-card">
                  <div className="comment-header">
                    <div className="comment-author">{c.emoji && <span className="comment-emoji">{c.emoji}</span>}{c.authorName}</div>
                    <div className="comment-actions-row">
                      <span className="comment-date">{new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <button className="comment-delete" onClick={() => handleDeleteComment(c.id)} title="Delete"><Icons.x size={12} /></button>
                    </div>
                  </div>
                  <div className="comment-content">{c.content}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STORIES */}
      {tab === 'stories' && (
        <div className="profile-section">
          <h2 className="profile-section-title"><Icons.scroll size={18} /> Stories & Memories</h2>
          {stories.length === 0 ? <EmptyState icon="scroll" title="No stories yet" description={`Share a memory about ${person.firstName}`} /> : stories.map(s => (
            <div key={s.id} className="story-card">
              <div className="story-card-header"><div className="story-card-title">{s.title}</div><span className={`story-card-type ${s.type}`}>{s.type}</span></div>
              <div className="story-card-content">{s.content}</div>
              <div className="story-card-footer"><span>By {s.author}</span><span>{new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
            </div>
          ))}
        </div>
      )}

      {/* TIMELINE */}
      {tab === 'timeline' && (
        <div className="profile-section">
          <h2 className="profile-section-title"><Icons.timeline size={18} /> Life Events</h2>
          {sortedEvents.length === 0 ? <EmptyState icon="timeline" title="No events recorded" /> : (
            <div className="timeline-container">
              {sortedEvents.map(e => (<div key={e.id} className="timeline-item"><div className={`timeline-dot ${e.type}`} /><div className="timeline-year">{e.year}</div><div className="timeline-title">{e.title}</div></div>))}
            </div>
          )}
        </div>
      )}

      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}><Icons.x size={24} /></button>
          <img src={lightbox} alt="Photo" className="lightbox-img" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

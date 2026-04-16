import React, { useState } from 'react';
import { Icons, LoadingState, EmptyState } from '@/components';
import {
  fetchPeople, fetchClans, fetchStories, fetchProverbs,
  fetchAnnouncements, postAnnouncement,
  computeFamilyStats, getDidYouKnow,
} from '@/data/api';
import type { AnnouncementRecord } from '@/data/api';
import { useAsync } from '@/lib/useAsync';
import type { PageId } from '@/types';
import './HomePage.css';

interface HomePageProps {
  onNavigate: (page: PageId, personId?: string) => void;
  onAddPerson: () => void;
}

export function HomePage({ onNavigate, onAddPerson }: HomePageProps) {
  const { data: people, loading } = useAsync(fetchPeople, []);
  const { data: clans } = useAsync(fetchClans, []);
  const { data: stories } = useAsync(fetchStories, []);
  const { data: proverbs } = useAsync(fetchProverbs, []);
  const { data: announcements, loading: annLoading } = useAsync(fetchAnnouncements, []);
  const [annRefresh, setAnnRefresh] = useState(0);
  const [showAnnForm, setShowAnnForm] = useState(false);
  const [annForm, setAnnForm] = useState({ title: '', content: '', type: 'general', author: '' });
  const [postingAnn, setPostingAnn] = useState(false);

  const proverb = proverbs.length > 0 ? proverbs[Math.floor(Date.now() / 86400000) % proverbs.length] : null;
  const stats = computeFamilyStats(people);
  const didYouKnow = getDidYouKnow(people);

  const handlePostAnnouncement = async () => {
    if (!annForm.title.trim() || !annForm.content.trim() || !annForm.author.trim()) return;
    setPostingAnn(true);
    await postAnnouncement(annForm.title, annForm.content, annForm.type, annForm.author);
    setPostingAnn(false);
    setAnnForm({ title: '', content: '', type: 'general', author: '' });
    setShowAnnForm(false);
    setAnnRefresh(t => t + 1);
  };

  const annTypeLabel: Record<string, string> = { birth: 'Birth', wedding: 'Wedding', funeral: 'Funeral', reunion: 'Reunion', achievement: 'Achievement', general: 'General' };

  return (
    <>
      <div className="hero">
        <div className="hero-content">
          <div className="hero-icon"><Icons.tree size={48} /></div>
          <h1>Preserve Your <strong>Heritage</strong></h1>
          <p>A living archive for your family's history, stories, and legacy. Built to endure across generations.</p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => onNavigate('tree')}><Icons.tree size={16} /> Explore the Tree</button>
            <button className="btn btn-secondary" onClick={onAddPerson}><Icons.plus size={16} /> Add a Person</button>
          </div>
          <div className="hero-stats">
            <div><span className="hero-stat-value">{stats.total}</span><span className="hero-stat-label">People</span></div>
            <div><span className="hero-stat-value">{stats.generations}</span><span className="hero-stat-label">Generations</span></div>
            <div><span className="hero-stat-value">{stats.living}</span><span className="hero-stat-label">Living</span></div>
            <div><span className="hero-stat-value">{stories.length}</span><span className="hero-stat-label">Stories</span></div>
          </div>
          {proverb && (
            <div className="hero-proverb">
              <div className="hero-proverb-text">"{proverb.text}"</div>
              <div className="hero-proverb-translation">{proverb.translation}</div>
            </div>
          )}
        </div>
      </div>

      {loading ? <div className="section"><LoadingState text="Loading..." /></div> : people.length === 0 ? (
        <div className="section"><EmptyState icon="tree" title="Your family tree starts here" description="Add your first family member." action={<button className="btn btn-primary" onClick={onAddPerson}><Icons.plus size={16} /> Add the first person</button>} /></div>
      ) : (
        <>
          {/* DID YOU KNOW + FAMILY HIGHLIGHTS */}
          <div className="section">
            <div className="highlights-row">
              {didYouKnow && (
                <div className="highlight-card dyk">
                  <div className="highlight-label">Did You Know?</div>
                  <div className="highlight-text">{didYouKnow}</div>
                </div>
              )}
              {stats.oldestLiving && (
                <div className="highlight-card" onClick={() => onNavigate('profile', stats.oldestLiving!.id)}>
                  <div className="highlight-label">Oldest Living</div>
                  <div className="highlight-text">{stats.oldestLiving.firstName} {stats.oldestLiving.lastName}</div>
                  {stats.oldestLiving.birthYear && <div className="highlight-sub">Born {stats.oldestLiving.birthYear}</div>}
                </div>
              )}
              {stats.mostChildren.person && (
                <div className="highlight-card" onClick={() => onNavigate('profile', stats.mostChildren.person!.id)}>
                  <div className="highlight-label">Most Children</div>
                  <div className="highlight-text">{stats.mostChildren.person.firstName} {stats.mostChildren.person.lastName}</div>
                  <div className="highlight-sub">{stats.mostChildren.count} children</div>
                </div>
              )}
              {stats.youngest && (
                <div className="highlight-card" onClick={() => onNavigate('profile', stats.youngest!.id)}>
                  <div className="highlight-label">Youngest Member</div>
                  <div className="highlight-text">{stats.youngest.firstName} {stats.youngest.lastName}</div>
                  {stats.youngest.birthYear && <div className="highlight-sub">Born {stats.youngest.birthYear}</div>}
                </div>
              )}
            </div>
          </div>

          {/* ANNOUNCEMENTS */}
          <div className="section">
            <div className="section-header">
              <h2 className="section-title"><Icons.mic size={20} /> Family Board</h2>
              <button className="btn btn-sm btn-outline" onClick={() => setShowAnnForm(!showAnnForm)}>
                <Icons.plus size={14} /> Post
              </button>
            </div>

            {showAnnForm && (
              <div className="ann-form">
                <input className="ann-input" placeholder="Title (e.g. Baby born!)" value={annForm.title} onChange={e => setAnnForm(f => ({ ...f, title: e.target.value }))} />
                <textarea className="ann-textarea" placeholder="What's the news?" value={annForm.content} onChange={e => setAnnForm(f => ({ ...f, content: e.target.value }))} rows={3} />
                <div className="ann-form-row">
                  <input className="ann-input ann-author" placeholder="Your name" value={annForm.author} onChange={e => setAnnForm(f => ({ ...f, author: e.target.value }))} />
                  <select className="ann-select" value={annForm.type} onChange={e => setAnnForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="general">General</option><option value="birth">Birth</option><option value="wedding">Wedding</option>
                    <option value="funeral">Funeral</option><option value="reunion">Reunion</option><option value="achievement">Achievement</option>
                  </select>
                  <button className="btn btn-primary btn-sm" onClick={handlePostAnnouncement} disabled={postingAnn}>{postingAnn ? 'Posting...' : 'Post'}</button>
                </div>
              </div>
            )}

            {announcements.length === 0 ? (
              <div className="ann-empty">No announcements yet. Share family news here.</div>
            ) : (
              <div className="ann-list">
                {announcements.slice(0, 5).map(a => (
                  <div key={a.id} className={`ann-card ${a.isPinned ? 'pinned' : ''}`}>
                    <div className="ann-card-top">
                      <span className={`ann-type-badge ${a.announcementType}`}>{annTypeLabel[a.announcementType] || a.announcementType}</span>
                      <span className="ann-date">{new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="ann-title">{a.title}</div>
                    <div className="ann-content">{a.content}</div>
                    <div className="ann-author">By {a.authorName}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CLANS */}
          {clans.length > 0 && (
            <div className="section">
              <div className="section-header"><h2 className="section-title"><Icons.shield size={20} /> Clans</h2></div>
              <div className="clan-grid">
                {clans.map(c => {
                  const count = people.filter(p => p.clanId === c.id).length;
                  return (
                    <div key={c.id} className="clan-card" onClick={() => onNavigate('people')}>
                      <div className="clan-card-name">{c.name}</div>
                      {c.origin && <div className="clan-card-detail"><Icons.globe size={14} /> {c.origin}</div>}
                      {c.totem && <div className="clan-card-detail"><Icons.shield size={14} /> Totem: {c.totem}</div>}
                      <div className="clan-card-count">{count} {count === 1 ? 'member' : 'members'}</div>
                      {c.motto && <div className="clan-card-motto">"{c.motto}"</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* RECENT STORIES */}
          {stories.length > 0 && (
            <div className="section">
              <div className="section-header">
                <h2 className="section-title"><Icons.scroll size={20} /> Recent Stories</h2>
                <button className="btn btn-sm btn-outline" onClick={() => onNavigate('stories')}>View All <Icons.chevronRight size={14} /></button>
              </div>
              {stories.slice(0, 2).map(s => {
                const person = people.find(p => p.id === s.personId);
                return (
                  <div key={s.id} className="story-card" onClick={() => onNavigate('profile', s.personId)}>
                    <div className="story-card-header"><div className="story-card-title">{s.title}</div><span className={`story-card-type ${s.type}`}>{s.type}</span></div>
                    <div className="story-card-content">{s.content.slice(0, 200)}...</div>
                    <div className="story-card-footer"><span>{person && <>About {person.firstName} {person.lastName} &middot; </>}By {s.author}</span><span>{new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
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

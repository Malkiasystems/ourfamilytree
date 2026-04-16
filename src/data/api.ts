import { supabase } from '@/lib/supabase';
import type { Clan, Person, Story, LifeEvent, Proverb } from '@/types';

// ─── EMPTY FALLBACKS ────────────────────────────────────────────────────────
export const EMPTY_CLANS: Clan[] = [];
export const EMPTY_PEOPLE: Person[] = [];
export const EMPTY_STORIES: Story[] = [];
export const EMPTY_EVENTS: LifeEvent[] = [];
export const EMPTY_PROVERBS: Proverb[] = [
  { text: 'Mti hukua kwa mizizi yake.', translation: 'A tree grows by its roots.' },
];

// ─── TYPE MAPPERS ───────────────────────────────────────────────────────────
function mapPerson(row: any): Person {
  return {
    id: row.id, firstName: row.first_name, lastName: row.last_name || '',
    otherNames: row.other_names || [], gender: row.gender, clanId: row.clan_id,
    birthYear: row.birth_year, birthMonth: row.birth_month, birthDay: row.birth_day,
    birthPlace: row.birth_place, deathYear: row.death_year, deathMonth: row.death_month,
    deathDay: row.death_day, deathPlace: row.death_place, occupation: row.occupation,
    bio: row.bio, nameMeaning: row.name_meaning, generation: row.generation || 1,
    photo: row.photo_url, verified: row.verified,
    achievements: row.achievements || [], parentIds: [], spouseIds: [], childIds: [],
  };
}
function mapClan(row: any): Clan {
  return { id: row.id, name: row.name, totem: row.totem || '', origin: row.origin || '', motto: row.motto || '', originStory: row.origin_story, migrationPath: row.migration_path };
}
function mapStory(row: any): Story {
  return { id: row.id, personId: row.person_id, clanId: row.clan_id, author: row.author_name, authorUserId: row.author_user_id, title: row.title, content: row.content, date: row.created_at, type: row.story_type, isPublished: row.is_published, targetGeneration: row.target_generation };
}
function mapEvent(row: any): LifeEvent {
  return { id: row.id, personId: row.person_id, title: row.title, description: row.description, type: row.event_type, year: row.event_year, month: row.event_month, day: row.event_day, location: row.location };
}

// ─── FETCH FUNCTIONS ────────────────────────────────────────────────────────
export async function fetchClans(): Promise<Clan[]> {
  if (!supabase) return EMPTY_CLANS;
  const { data, error } = await supabase.from('clans').select('*').order('name');
  if (error) { console.error('fetchClans:', error); return EMPTY_CLANS; }
  return (data || []).map(mapClan);
}

export async function fetchPeople(): Promise<Person[]> {
  if (!supabase) return EMPTY_PEOPLE;
  const { data, error } = await supabase.from('people').select('*').eq('verified', true).order('generation');
  if (error) { console.error('fetchPeople:', error); return EMPTY_PEOPLE; }
  const { data: rels } = await supabase.from('relationships').select('*');
  const people = (data || []).map(mapPerson);
  if (rels) {
    for (const p of people) {
      p.parentIds = rels.filter(r => r.relationship_type === 'parent_child' && r.person_b_id === p.id).map(r => r.person_a_id);
      p.childIds = rels.filter(r => r.relationship_type === 'parent_child' && r.person_a_id === p.id).map(r => r.person_b_id);
      p.spouseIds = rels.filter(r => r.relationship_type === 'spouse' && (r.person_a_id === p.id || r.person_b_id === p.id)).map(r => r.person_a_id === p.id ? r.person_b_id : r.person_a_id);
    }
  }
  return people;
}

export async function fetchPersonById(id: string): Promise<Person | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('people').select('*').eq('id', id).single();
  if (error || !data) return null;
  const person = mapPerson(data);
  const { data: rels } = await supabase.from('relationships').select('*').or(`person_a_id.eq.${id},person_b_id.eq.${id}`);
  if (rels) {
    person.parentIds = rels.filter(r => r.relationship_type === 'parent_child' && r.person_b_id === id).map(r => r.person_a_id);
    person.childIds = rels.filter(r => r.relationship_type === 'parent_child' && r.person_a_id === id).map(r => r.person_b_id);
    person.spouseIds = rels.filter(r => r.relationship_type === 'spouse').map(r => r.person_a_id === id ? r.person_b_id : r.person_a_id);
  }
  return person;
}

export async function fetchStories(): Promise<Story[]> {
  if (!supabase) return EMPTY_STORIES;
  const { data, error } = await supabase.from('stories').select('*').eq('is_published', true).order('created_at', { ascending: false });
  if (error) return EMPTY_STORIES;
  return (data || []).map(mapStory);
}

export async function fetchStoriesByPerson(personId: string): Promise<Story[]> {
  if (!supabase) return EMPTY_STORIES;
  const { data, error } = await supabase.from('stories').select('*').eq('person_id', personId).eq('is_published', true).order('created_at', { ascending: false });
  if (error) return EMPTY_STORIES;
  return (data || []).map(mapStory);
}

export async function fetchEvents(): Promise<LifeEvent[]> {
  if (!supabase) return EMPTY_EVENTS;
  const { data, error } = await supabase.from('life_events').select('*').order('event_year');
  if (error) return EMPTY_EVENTS;
  return (data || []).map(mapEvent);
}

export async function fetchEventsByPerson(personId: string): Promise<LifeEvent[]> {
  if (!supabase) return EMPTY_EVENTS;
  const { data, error } = await supabase.from('life_events').select('*').eq('person_id', personId).order('event_year');
  if (error) return EMPTY_EVENTS;
  return (data || []).map(mapEvent);
}

export async function fetchProverbs(): Promise<Proverb[]> {
  if (!supabase) return EMPTY_PROVERBS;
  const { data, error } = await supabase.from('proverbs').select('*');
  if (error || !data || data.length === 0) return EMPTY_PROVERBS;
  return data.map(row => ({ text: row.text_sw, translation: row.text_en || '', attribution: row.attribution }));
}

export async function searchPeople(query: string): Promise<Person[]> {
  if (!supabase || !query.trim()) return [];
  const { data, error } = await supabase.from('people').select('*').or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,occupation.ilike.%${query}%`).limit(10);
  if (error) return [];
  return (data || []).map(mapPerson);
}

// ─── WRITE FUNCTIONS ────────────────────────────────────────────────────────
export async function submitPersonProposal(proposal: Record<string, unknown>): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('edit_proposals').insert({ target_table: 'people', action: 'create', proposed_data: proposal, status: 'pending' });
  if (error) { console.error('submitPersonProposal:', error); return false; }
  return true;
}

export async function setProfilePhoto(personId: string, photoUrl: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('people').update({ photo_url: photoUrl }).eq('id', personId);
  if (error) { console.error('setProfilePhoto:', error); return false; }
  return true;
}

// ─── ADMIN FUNCTIONS ────────────────────────────────────────────────────────
export interface ProposalRecord {
  id: string; proposedBy: string | null; targetTable: string; targetId: string | null;
  action: 'create' | 'update' | 'delete'; proposedData: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  reviewNote: string | null; createdAt: string; reviewedAt: string | null;
}

function mapProposal(row: any): ProposalRecord {
  return { id: row.id, proposedBy: row.proposed_by, targetTable: row.target_table, targetId: row.target_id, action: row.action, proposedData: row.proposed_data || {}, status: row.status, reviewNote: row.review_note, createdAt: row.created_at, reviewedAt: row.reviewed_at };
}

export async function fetchPendingProposals(): Promise<ProposalRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('edit_proposals').select('*').eq('status', 'pending').order('created_at', { ascending: false });
  if (error) return [];
  return (data || []).map(mapProposal);
}

export async function fetchRecentReviewed(limit = 10): Promise<ProposalRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('edit_proposals').select('*').neq('status', 'pending').order('reviewed_at', { ascending: false }).limit(limit);
  if (error) return [];
  return (data || []).map(mapProposal);
}

export async function approveProposal(proposalId: string, note?: string): Promise<boolean> {
  if (!supabase) return false;
  const { data: proposal, error: fetchErr } = await supabase.from('edit_proposals').select('*').eq('id', proposalId).single();
  if (fetchErr || !proposal) return false;
  if (proposal.action === 'create') {
    const { error } = await supabase.from(proposal.target_table).insert({ ...proposal.proposed_data, verified: true });
    if (error) return false;
  } else if (proposal.action === 'update' && proposal.target_id) {
    const { error } = await supabase.from(proposal.target_table).update(proposal.proposed_data).eq('id', proposal.target_id);
    if (error) return false;
  }
  const { error } = await supabase.from('edit_proposals').update({ status: 'approved', review_note: note || null, reviewed_at: new Date().toISOString() }).eq('id', proposalId);
  return !error;
}

export async function rejectProposal(proposalId: string, note?: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('edit_proposals').update({ status: 'rejected', review_note: note || null, reviewed_at: new Date().toISOString() }).eq('id', proposalId);
  return !error;
}

// ─── MEDIA / PHOTOS ─────────────────────────────────────────────────────────
export interface MediaRecord {
  id: string; personId: string | null; mediaType: 'photo' | 'video' | 'audio' | 'document';
  url: string; thumbnailUrl: string | null; caption: string | null; description: string | null;
  yearTaken: number | null; uploadedBy: string | null; createdAt: string;
}

function mapMedia(row: any): MediaRecord {
  return { id: row.id, personId: row.person_id, mediaType: row.media_type, url: row.url, thumbnailUrl: row.thumbnail_url, caption: row.caption, description: row.description, yearTaken: row.year_taken, uploadedBy: row.uploaded_by, createdAt: row.created_at };
}

export async function fetchMediaByPerson(personId: string): Promise<MediaRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('media').select('*').eq('person_id', personId).order('year_taken', { ascending: false });
  if (error) return [];
  return (data || []).map(mapMedia);
}

export async function uploadPhoto(file: File, personId: string, caption?: string, yearTaken?: number): Promise<boolean> {
  if (!supabase) return false;
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${personId}/${Date.now()}.${ext}`;
  const { error: uploadErr } = await supabase.storage.from('media').upload(fileName, file, { cacheControl: '3600', upsert: false });
  if (uploadErr) { console.error('uploadPhoto:', uploadErr); return false; }
  const { data: urlData } = supabase.storage.from('media').getPublicUrl(fileName);
  const { error: insertErr } = await supabase.from('media').insert({ person_id: personId, media_type: 'photo', url: urlData.publicUrl, caption: caption || null, year_taken: yearTaken || null, file_size_bytes: file.size, mime_type: file.type });
  if (insertErr) { console.error('uploadPhoto insert:', insertErr); return false; }
  return true;
}

export async function deletePhoto(photoId: string, photoUrl: string): Promise<boolean> {
  if (!supabase) return false;
  // Delete from storage
  try {
    const path = photoUrl.split('/media/')[1];
    if (path) await supabase.storage.from('media').remove([path]);
  } catch (e) { console.warn('Could not delete from storage:', e); }
  // Delete record
  const { error } = await supabase.from('media').delete().eq('id', photoId);
  return !error;
}

// ─── COMMENTS ───────────────────────────────────────────────────────────────
export interface CommentRecord {
  id: string; personId: string; authorName: string; authorPhone: string | null;
  content: string; emoji: string | null; createdAt: string;
}

function mapComment(row: any): CommentRecord {
  return { id: row.id, personId: row.person_id, authorName: row.author_name, authorPhone: row.author_phone, content: row.content, emoji: row.emoji, createdAt: row.created_at };
}

export async function fetchComments(personId: string): Promise<CommentRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('comments').select('*').eq('person_id', personId).order('created_at', { ascending: false });
  if (error) return [];
  return (data || []).map(mapComment);
}

export async function postComment(personId: string, authorName: string, content: string, emoji?: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('comments').insert({ person_id: personId, author_name: authorName, content, emoji: emoji || null });
  return !error;
}

export async function deleteComment(commentId: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('comments').delete().eq('id', commentId);
  return !error;
}

// ─── ANNOUNCEMENTS ──────────────────────────────────────────────────────────
export interface AnnouncementRecord {
  id: string; title: string; content: string; announcementType: string;
  authorName: string; personId: string | null; isPinned: boolean; createdAt: string;
}

function mapAnnouncement(row: any): AnnouncementRecord {
  return { id: row.id, title: row.title, content: row.content, announcementType: row.announcement_type, authorName: row.author_name, personId: row.person_id, isPinned: row.is_pinned, createdAt: row.created_at };
}

export async function fetchAnnouncements(): Promise<AnnouncementRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('announcements').select('*').order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
  if (error) return [];
  return (data || []).map(mapAnnouncement);
}

export async function postAnnouncement(title: string, content: string, type: string, authorName: string, personId?: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('announcements').insert({ title, content, announcement_type: type, author_name: authorName, person_id: personId || null });
  return !error;
}

// ─── USER MEMBERS ───────────────────────────────────────────────────────────
export interface MemberRecord {
  id: string; fullName: string; phone: string; personId: string | null;
  isVerified: boolean; role: string; createdAt: string;
}

function mapMember(row: any): MemberRecord {
  return { id: row.id, fullName: row.full_name, phone: row.phone, personId: row.person_id, isVerified: row.is_verified, role: row.role, createdAt: row.created_at };
}

export async function registerMember(fullName: string, phone: string): Promise<MemberRecord | null> {
  if (!supabase) return null;
  // Check if phone already exists
  const { data: existing } = await supabase.from('user_members').select('*').eq('phone', phone).single();
  if (existing) return mapMember(existing);
  const { data, error } = await supabase.from('user_members').insert({ full_name: fullName, phone }).select().single();
  if (error) { console.error('registerMember:', error); return null; }
  return data ? mapMember(data) : null;
}

export async function loginMember(phone: string): Promise<MemberRecord | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('user_members').select('*').eq('phone', phone).single();
  if (error || !data) return null;
  return mapMember(data);
}

export async function assignPersonToMember(memberId: string, personId: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('user_members').update({ person_id: personId }).eq('id', memberId);
  return !error;
}

export async function fetchMembers(): Promise<MemberRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('user_members').select('*').order('created_at', { ascending: false });
  if (error) return [];
  return (data || []).map(mapMember);
}

// ─── FAMILY STATS ───────────────────────────────────────────────────────────
export function computeFamilyStats(people: Person[]) {
  const living = people.filter(p => !p.deathYear);
  const deceased = people.filter(p => p.deathYear);
  const generations = new Set(people.map(p => p.generation)).size;
  const withPhotos = people.filter(p => p.photo).length;

  // Oldest living
  const oldestLiving = living.filter(p => p.birthYear).sort((a, b) => a.birthYear - b.birthYear)[0] || null;

  // Most children
  let mostChildren = { person: null as Person | null, count: 0 };
  people.forEach(p => {
    if (p.childIds.length > mostChildren.count) {
      mostChildren = { person: p, count: p.childIds.length };
    }
  });

  // Youngest member
  const youngest = living.filter(p => p.birthYear).sort((a, b) => b.birthYear - a.birthYear)[0] || null;

  return {
    total: people.length,
    living: living.length,
    deceased: deceased.length,
    generations,
    withPhotos,
    oldestLiving,
    mostChildren,
    youngest,
  };
}

// ─── ON THIS DAY ────────────────────────────────────────────────────────────
export function getOnThisDay(people: Person[], events: LifeEvent[]) {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  const birthdays = people.filter(p => p.birthMonth === month && p.birthDay === day);
  const deathDays = people.filter(p => p.deathMonth === month && p.deathDay === day);
  const todayEvents = events.filter(e => e.month === month && e.day === day);

  return { birthdays, deathDays, events: todayEvents, hasContent: birthdays.length + deathDays.length + todayEvents.length > 0 };
}

// ─── DID YOU KNOW ───────────────────────────────────────────────────────────
export function getDidYouKnow(people: Person[]): string | null {
  const facts: string[] = [];
  people.forEach(p => {
    if (p.nameMeaning) facts.push(`The name "${p.firstName}" means: ${p.nameMeaning}`);
    if (p.achievements && p.achievements.length > 0) facts.push(`${p.firstName} ${p.lastName}: ${p.achievements[0]}`);
    if (p.birthPlace) facts.push(`${p.firstName} ${p.lastName} was born in ${p.birthPlace}`);
    if (p.occupation) facts.push(`${p.firstName} ${p.lastName} worked as ${p.occupation}`);
  });
  if (facts.length === 0) return null;
  return facts[Math.floor(Math.random() * facts.length)];
}

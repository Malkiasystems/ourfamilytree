import { supabase } from '@/lib/supabase';
import type { Clan, Person, Story, LifeEvent, Proverb } from '@/types';

// ─── EMPTY FALLBACKS ────────────────────────────────────────────────────────
// Used when Supabase is not yet configured. Keeps the app buildable.
export const EMPTY_CLANS: Clan[] = [];
export const EMPTY_PEOPLE: Person[] = [];
export const EMPTY_STORIES: Story[] = [];
export const EMPTY_EVENTS: LifeEvent[] = [];
export const EMPTY_PROVERBS: Proverb[] = [
  { text: 'Mti hukua kwa mizizi yake.', translation: 'A tree grows by its roots.' },
];

// ─── TYPE MAPPERS ───────────────────────────────────────────────────────────
// Supabase returns snake_case, app uses camelCase. Map between them.

function mapPerson(row: any): Person {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name || '',
    otherNames: row.other_names || [],
    gender: row.gender,
    clanId: row.clan_id,
    birthYear: row.birth_year,
    birthMonth: row.birth_month,
    birthDay: row.birth_day,
    birthPlace: row.birth_place,
    deathYear: row.death_year,
    deathMonth: row.death_month,
    deathDay: row.death_day,
    deathPlace: row.death_place,
    occupation: row.occupation,
    bio: row.bio,
    nameMeaning: row.name_meaning,
    generation: row.generation || 1,
    photo: row.photo_url,
    verified: row.verified,
    achievements: row.achievements || [],
    parentIds: row.parent_ids || [],
    spouseIds: row.spouse_ids || [],
    childIds: row.child_ids || [],
  };
}

function mapClan(row: any): Clan {
  return {
    id: row.id,
    name: row.name,
    totem: row.totem || '',
    origin: row.origin || '',
    motto: row.motto || '',
    originStory: row.origin_story,
    migrationPath: row.migration_path,
  };
}

function mapStory(row: any): Story {
  return {
    id: row.id,
    personId: row.person_id,
    clanId: row.clan_id,
    author: row.author_name,
    authorUserId: row.author_user_id,
    title: row.title,
    content: row.content,
    date: row.created_at,
    type: row.story_type,
    isPublished: row.is_published,
    targetGeneration: row.target_generation,
  };
}

function mapEvent(row: any): LifeEvent {
  return {
    id: row.id,
    personId: row.person_id,
    title: row.title,
    description: row.description,
    type: row.event_type,
    year: row.event_year,
    month: row.event_month,
    day: row.event_day,
    location: row.location,
  };
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
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .eq('verified', true)
    .order('generation');
  if (error) { console.error('fetchPeople:', error); return EMPTY_PEOPLE; }

  // Fetch relationships separately to populate parent/spouse/child IDs
  const { data: rels } = await supabase.from('relationships').select('*');

  const people = (data || []).map(mapPerson);

  // Attach relationship IDs
  if (rels) {
    for (const p of people) {
      p.parentIds = rels
        .filter(r => r.relationship_type === 'parent_child' && r.person_b_id === p.id)
        .map(r => r.person_a_id);
      p.childIds = rels
        .filter(r => r.relationship_type === 'parent_child' && r.person_a_id === p.id)
        .map(r => r.person_b_id);
      p.spouseIds = rels
        .filter(r => r.relationship_type === 'spouse' &&
          (r.person_a_id === p.id || r.person_b_id === p.id))
        .map(r => r.person_a_id === p.id ? r.person_b_id : r.person_a_id);
    }
  }

  return people;
}

export async function fetchPersonById(id: string): Promise<Person | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('people').select('*').eq('id', id).single();
  if (error || !data) return null;
  const person = mapPerson(data);

  const { data: rels } = await supabase
    .from('relationships')
    .select('*')
    .or(`person_a_id.eq.${id},person_b_id.eq.${id}`);

  if (rels) {
    person.parentIds = rels
      .filter(r => r.relationship_type === 'parent_child' && r.person_b_id === id)
      .map(r => r.person_a_id);
    person.childIds = rels
      .filter(r => r.relationship_type === 'parent_child' && r.person_a_id === id)
      .map(r => r.person_b_id);
    person.spouseIds = rels
      .filter(r => r.relationship_type === 'spouse')
      .map(r => r.person_a_id === id ? r.person_b_id : r.person_a_id);
  }

  return person;
}

export async function fetchStories(): Promise<Story[]> {
  if (!supabase) return EMPTY_STORIES;
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  if (error) { console.error('fetchStories:', error); return EMPTY_STORIES; }
  return (data || []).map(mapStory);
}

export async function fetchStoriesByPerson(personId: string): Promise<Story[]> {
  if (!supabase) return EMPTY_STORIES;
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('person_id', personId)
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  if (error) { console.error('fetchStoriesByPerson:', error); return EMPTY_STORIES; }
  return (data || []).map(mapStory);
}

export async function fetchEvents(): Promise<LifeEvent[]> {
  if (!supabase) return EMPTY_EVENTS;
  const { data, error } = await supabase
    .from('life_events')
    .select('*')
    .order('event_year');
  if (error) { console.error('fetchEvents:', error); return EMPTY_EVENTS; }
  return (data || []).map(mapEvent);
}

export async function fetchEventsByPerson(personId: string): Promise<LifeEvent[]> {
  if (!supabase) return EMPTY_EVENTS;
  const { data, error } = await supabase
    .from('life_events')
    .select('*')
    .eq('person_id', personId)
    .order('event_year');
  if (error) { console.error('fetchEventsByPerson:', error); return EMPTY_EVENTS; }
  return (data || []).map(mapEvent);
}

export async function fetchProverbs(): Promise<Proverb[]> {
  if (!supabase) return EMPTY_PROVERBS;
  const { data, error } = await supabase.from('proverbs').select('*');
  if (error) { console.error('fetchProverbs:', error); return EMPTY_PROVERBS; }
  if (!data || data.length === 0) return EMPTY_PROVERBS;
  return data.map(row => ({
    text: row.text_sw,
    translation: row.text_en || '',
    attribution: row.attribution,
  }));
}

export async function searchPeople(query: string): Promise<Person[]> {
  if (!supabase || !query.trim()) return [];
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,occupation.ilike.%${query}%`)
    .limit(10);
  if (error) { console.error('searchPeople:', error); return []; }
  return (data || []).map(mapPerson);
}

// ─── WRITE FUNCTIONS ────────────────────────────────────────────────────────

export async function submitPersonProposal(proposal: Record<string, unknown>): Promise<boolean> {
  if (!supabase) {
    console.warn('Supabase not configured. Proposal not submitted:', proposal);
    return false;
  }
  const { error } = await supabase.from('edit_proposals').insert({
    target_table: 'people',
    action: 'create',
    proposed_data: proposal,
    status: 'pending',
  });
  if (error) { console.error('submitPersonProposal:', error); return false; }
  return true;
}

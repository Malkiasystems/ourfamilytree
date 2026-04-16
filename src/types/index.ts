// ─── CORE TYPES ─────────────────────────────────────────────────────────────

export interface Clan {
  id: string;
  name: string;
  totem: string;
  origin: string;
  motto: string;
  originStory?: string;
  migrationPath?: string[];
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  otherNames?: string[];
  gender: 'male' | 'female';
  clanId: string;
  birthYear: number;
  birthMonth?: number;
  birthDay?: number;
  birthPlace?: string;
  deathYear: number | null;
  deathMonth?: number;
  deathDay?: number;
  deathPlace?: string;
  occupation?: string;
  bio?: string;
  nameMeaning?: string;
  generation: number;
  achievements?: string[];
  parentIds: string[];
  spouseIds: string[];
  childIds: string[];
  photo?: string | null;
  verified?: boolean;
}

export type RelationshipType =
  | 'parent_child'
  | 'spouse'
  | 'sibling'
  | 'guardian'
  | 'godparent';

export interface Relationship {
  id: string;
  personAId: string;
  personBId: string;
  relationshipType: RelationshipType;
  startYear?: number;
  endYear?: number;
  isActive: boolean;
  notes?: string;
}

export type StoryType =
  | 'memory'
  | 'history'
  | 'tribute'
  | 'proverb'
  | 'recipe'
  | 'tradition'
  | 'legacy_message';

export interface Story {
  id: string;
  personId: string;
  clanId?: string;
  author: string;
  authorUserId?: string;
  title: string;
  content: string;
  date: string;
  type: StoryType;
  isPublished?: boolean;
  targetGeneration?: number;
}

export type EventType =
  | 'birth'
  | 'death'
  | 'marriage'
  | 'divorce'
  | 'milestone'
  | 'education'
  | 'career'
  | 'migration'
  | 'religious'
  | 'other';

export interface LifeEvent {
  id: string;
  personId: string;
  year: number;
  month?: number;
  day?: number;
  title: string;
  description?: string;
  type: EventType;
  location?: string;
}

export type MediaType = 'photo' | 'video' | 'audio' | 'document';

export interface Media {
  id: string;
  personId: string;
  mediaType: MediaType;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  description?: string;
  yearTaken?: number;
  uploadedBy?: string;
}

export interface Proverb {
  text: string;
  translation: string;
  clan?: string;
  attribution?: string;
}

// ─── USER & AUTH ────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'editor' | 'contributor' | 'viewer';

export interface UserProfile {
  id: string;
  displayName: string;
  personId?: string;
  role: UserRole;
  clanId?: string;
  avatarUrl?: string;
}

export type ProposalAction = 'create' | 'update' | 'delete';
export type ProposalStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';

export interface EditProposal {
  id: string;
  proposedBy: string;
  targetTable: string;
  targetId?: string;
  action: ProposalAction;
  proposedData: Record<string, unknown>;
  status: ProposalStatus;
  reviewedBy?: string;
  reviewNote?: string;
  createdAt: string;
  reviewedAt?: string;
}

// ─── UI TYPES ───────────────────────────────────────────────────────────────

export type PageId =
  | 'home'
  | 'tree'
  | 'people'
  | 'timeline'
  | 'stories'
  | 'profile';

export interface NavItem {
  id: PageId;
  label: string;
  icon: string;
}

export interface RelationDisplay extends Person {
  relType: string;
}

export interface AddPersonForm {
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  clanId: string;
  birthYear: string;
  deathYear: string;
  birthPlace: string;
  occupation: string;
  bio: string;
  nameMeaning: string;
}

import React from 'react';
import { Icons, Avatar, LoadingState, EmptyState } from '@/components';
import { fetchPeople } from '@/data/api';
import { useAsync } from '@/lib/useAsync';
import './PeoplePage.css';

interface PeoplePageProps {
  onSelectPerson: (id: string) => void;
  onAddPerson: () => void;
}

export function PeoplePage({ onSelectPerson, onAddPerson }: PeoplePageProps) {
  const { data: people, loading } = useAsync(fetchPeople, []);

  if (loading) {
    return <div className="section"><LoadingState text="Loading people..." /></div>;
  }

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title"><Icons.users size={22} /> All People</h2>
        <button className="btn btn-sm btn-primary" onClick={onAddPerson}>
          <Icons.plus size={14} /> Add Person
        </button>
      </div>
      {people.length === 0 ? (
        <EmptyState
          icon="users"
          title="No people yet"
          description="Add family members to start building your heritage archive."
          action={
            <button className="btn btn-primary" onClick={onAddPerson}>
              <Icons.plus size={16} /> Add first person
            </button>
          }
        />
      ) : (
        <div className="people-grid">
          {people.map(p => (
            <div key={p.id} className="person-card" onClick={() => onSelectPerson(p.id)}>
              <Avatar person={p} size={64} className="person-card-avatar" />
              <div className="person-card-name">{p.firstName} {p.lastName}</div>
              <div className="person-card-years">
                {p.birthYear}{p.deathYear ? ` \u2013 ${p.deathYear}` : p.birthYear ? ' \u2013 Present' : ''}
              </div>
              {p.occupation && <div className="person-card-role">{p.occupation}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

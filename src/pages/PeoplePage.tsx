import React from 'react';
import { Icons } from '@/components/Icons';
import { Avatar } from '@/components/Avatar';
import { PEOPLE, CLANS } from '@/data/mockData';
import './PeoplePage.css';

interface PeoplePageProps {
  onSelectPerson: (id: string) => void;
  onAddPerson: () => void;
}

export function PeoplePage({ onSelectPerson, onAddPerson }: PeoplePageProps) {
  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title"><Icons.users size={22} /> All People</h2>
        <button className="btn btn-sm btn-primary" onClick={onAddPerson}>
          <Icons.plus size={14} /> Add Person
        </button>
      </div>
      <div className="people-grid">
        {PEOPLE.map(p => (
          <div key={p.id} className="person-card" onClick={() => onSelectPerson(p.id)}>
            <Avatar person={p} size={64} className="person-card-avatar" />
            <div className="person-card-name">{p.firstName} {p.lastName}</div>
            <div className="person-card-years">
              {p.birthYear}{p.deathYear ? ` \u2013 ${p.deathYear}` : ' \u2013 Present'}
            </div>
            <div className="person-card-role">{p.occupation}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

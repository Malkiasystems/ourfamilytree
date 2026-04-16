import React, { useState, useMemo } from 'react';
import { Icons, LoadingState, EmptyState } from '@/components';
import { fetchPeople } from '@/data/api';
import { useAsync } from '@/lib/useAsync';
import type { Person } from '@/types';
import './FamilyTreePage.css';

interface FamilyTreePageProps {
  onSelectPerson: (id: string) => void;
  onAddPerson: () => void;
}

function TreeNode({ person, onSelect }: { person: Person; onSelect: (id: string) => void }) {
  const nameParts = person.firstName.split(' ');
  const initials = nameParts[nameParts.length - 1][0] + (person.lastName?.[0] || '');

  return (
    <div className="tree-node" onClick={() => onSelect(person.id)}>
      <div className={`tree-node-avatar ${person.gender} ${person.deathYear ? 'deceased' : ''}`}>
        {initials}
      </div>
      <div className="tree-node-name">{person.firstName}</div>
      <div className="tree-node-years">
        {person.birthYear}{person.deathYear ? `\u2013${person.deathYear}` : ''}
      </div>
      <div className="tree-node-role">{person.occupation?.split('/')[0]?.trim()}</div>
    </div>
  );
}

export function FamilyTreePage({ onSelectPerson, onAddPerson }: FamilyTreePageProps) {
  const [zoom, setZoom] = useState(1);
  const { data: people, loading } = useAsync(fetchPeople, []);

  const generations = useMemo(() => {
    const gens: Record<number, Person[]> = {};
    people.forEach(p => {
      const gen = p.generation || 1;
      if (!gens[gen]) gens[gen] = [];
      gens[gen].push(p);
    });
    return gens;
  }, [people]);

  const genLabels: Record<number, string> = {
    1: 'First Generation',
    2: 'Second Generation',
    3: 'Third Generation',
    4: 'Fourth Generation',
    5: 'Fifth Generation',
    6: 'Sixth Generation',
  };

  if (loading) {
    return <div className="section"><LoadingState text="Loading family tree..." /></div>;
  }

  if (people.length === 0) {
    return (
      <div className="section">
        <EmptyState
          icon="tree"
          title="No family members yet"
          description="Start building your family tree by adding the oldest generation first. The tree will grow as you add more people and their relationships."
          action={
            <button className="btn btn-primary" onClick={onAddPerson}>
              <Icons.plus size={16} /> Add first person
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title"><Icons.tree size={22} /> Family Tree</h2>
        <span className="section-subtitle">Click any person to view their profile</span>
      </div>
      <div className="tree-container">
        <div className="tree-toolbar">
          <span className="tree-toolbar-label">{people.length} members, {Object.keys(generations).length} generations</span>
          <div className="tree-toolbar-group">
            <button className="tree-toolbar-btn" onClick={() => setZoom(z => Math.min(z + 0.15, 1.5))}>
              <Icons.zoomIn size={16} />
            </button>
            <button className="tree-toolbar-btn" onClick={() => setZoom(z => Math.max(z - 0.15, 0.5))}>
              <Icons.zoomOut size={16} />
            </button>
            <button className="tree-toolbar-btn" onClick={() => setZoom(1)}>
              <Icons.home size={16} />
            </button>
          </div>
        </div>
        <div className="tree-canvas">
          <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.2s ease' }}>
            {Object.entries(generations).sort(([a], [b]) => Number(a) - Number(b)).map(([gen, gpeople], idx, arr) => (
              <div key={gen}>
                <div className="tree-gen-header">
                  <span className="tree-gen-badge">
                    {genLabels[Number(gen)] || `Generation ${gen}`}
                  </span>
                </div>
                <div className="tree-generation">
                  {gpeople.map(p => (
                    <TreeNode key={p.id} person={p} onSelect={onSelectPerson} />
                  ))}
                </div>
                {idx < arr.length - 1 && <div className="tree-connector" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

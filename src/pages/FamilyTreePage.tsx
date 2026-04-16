import React, { useState, useMemo } from 'react';
import { Icons } from '@/components/Icons';
import { PEOPLE } from '@/data/mockData';
import type { Person } from '@/types';
import './FamilyTreePage.css';

interface FamilyTreePageProps {
  onSelectPerson: (id: string) => void;
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

export function FamilyTreePage({ onSelectPerson }: FamilyTreePageProps) {
  const [zoom, setZoom] = useState(1);

  const generations = useMemo(() => {
    const gens: Record<number, Person[]> = {};
    PEOPLE.forEach(p => {
      if (!gens[p.generation]) gens[p.generation] = [];
      gens[p.generation].push(p);
    });
    return gens;
  }, []);

  const genLabels: Record<number, string> = {
    1: 'Founders',
    2: 'Second Generation',
    3: 'Third Generation',
    4: 'Fourth Generation',
  };

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title"><Icons.tree size={22} /> The Mwinyi Family Tree</h2>
        <span className="section-subtitle">Click any person to view their profile</span>
      </div>
      <div className="tree-container">
        <div className="tree-toolbar">
          <span className="tree-toolbar-label">Family Tree</span>
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
            {Object.entries(generations).sort(([a], [b]) => Number(a) - Number(b)).map(([gen, people]) => (
              <div key={gen}>
                <div className="tree-gen-header">
                  <span className="tree-gen-badge">
                    {genLabels[Number(gen)] || `Generation ${gen}`}
                  </span>
                </div>
                <div className="tree-generation">
                  {people.map(p => (
                    <TreeNode key={p.id} person={p} onSelect={onSelectPerson} />
                  ))}
                </div>
                {Number(gen) < Object.keys(generations).length && (
                  <div className="tree-connector" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

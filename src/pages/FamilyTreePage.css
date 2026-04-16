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

interface TreeNodeData extends Person {
  children: TreeNodeData[];
}

// Build a tree structure from flat people array using parent_child relationships
function buildTree(people: Person[]): TreeNodeData[] {
  const byId = new Map<string, TreeNodeData>();
  people.forEach(p => byId.set(p.id, { ...p, children: [] }));

  const roots: TreeNodeData[] = [];
  byId.forEach(person => {
    if (person.parentIds.length === 0) {
      roots.push(person);
    } else {
      // Attach to the first parent found (avoid duplicates in tree rendering)
      const parent = byId.get(person.parentIds[0]);
      if (parent) {
        parent.children.push(person);
      } else {
        roots.push(person);
      }
    }
  });

  return roots;
}

function TreeNodeCard({ person, onSelect }: { person: Person; onSelect: (id: string) => void }) {
  const nameParts = person.firstName.split(' ');
  const initials = nameParts[nameParts.length - 1][0] + (person.lastName?.[0] || '');

  return (
    <div className="tree-card" onClick={() => onSelect(person.id)}>
      <div className={`tree-card-avatar ${person.gender} ${person.deathYear ? 'deceased' : ''}`}>
        {initials}
      </div>
      <div className="tree-card-name">
        {person.firstName}{person.lastName ? ` ${person.lastName}` : ''}
      </div>
      {(person.birthYear || person.deathYear) && (
        <div className="tree-card-years">
          {person.birthYear || '?'}{person.deathYear ? `\u2013${person.deathYear}` : ''}
        </div>
      )}
    </div>
  );
}

function TreeBranch({ node, onSelect }: { node: TreeNodeData; onSelect: (id: string) => void }) {
  return (
    <li className="tree-li">
      <TreeNodeCard person={node} onSelect={onSelect} />
      {node.children.length > 0 && (
        <ul className="tree-ul">
          {node.children.map(child => (
            <TreeBranch key={child.id} node={child} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function FamilyTreePage({ onSelectPerson, onAddPerson }: FamilyTreePageProps) {
  const [zoom, setZoom] = useState(1);
  const { data: people, loading } = useAsync(fetchPeople, []);

  const trees = useMemo(() => buildTree(people), [people]);

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

  const generationCount = new Set(people.map(p => p.generation)).size;

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title"><Icons.tree size={22} /> Family Tree</h2>
        <span className="section-subtitle">Click any person to view their profile</span>
      </div>
      <div className="tree-container">
        <div className="tree-toolbar">
          <span className="tree-toolbar-label">
            {people.length} members, {generationCount} {generationCount === 1 ? 'generation' : 'generations'}
          </span>
          <div className="tree-toolbar-group">
            <button className="tree-toolbar-btn" onClick={() => setZoom(z => Math.min(z + 0.15, 1.8))} title="Zoom in">
              <Icons.zoomIn size={16} />
            </button>
            <button className="tree-toolbar-btn" onClick={() => setZoom(z => Math.max(z - 0.15, 0.4))} title="Zoom out">
              <Icons.zoomOut size={16} />
            </button>
            <button className="tree-toolbar-btn" onClick={() => setZoom(1)} title="Reset zoom">
              <Icons.home size={16} />
            </button>
          </div>
        </div>
        <div className="tree-canvas">
          <div className="tree-stage" style={{ transform: `scale(${zoom})` }}>
            {trees.map(root => (
              <div key={root.id} className="tree-root-wrapper">
                <ul className="tree-ul tree-ul-root">
                  <TreeBranch node={root} onSelect={onSelectPerson} />
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

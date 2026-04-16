import React, { useState, useMemo, useCallback } from 'react';
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
  descendantCount: number;
}

// Build a tree structure from flat people array using parent_child relationships
function buildTree(people: Person[]): TreeNodeData[] {
  const byId = new Map<string, TreeNodeData>();
  people.forEach(p => byId.set(p.id, { ...p, children: [], descendantCount: 0 }));

  const roots: TreeNodeData[] = [];
  byId.forEach(person => {
    if (person.parentIds.length === 0) {
      roots.push(person);
    } else {
      const parent = byId.get(person.parentIds[0]);
      if (parent) {
        parent.children.push(person);
      } else {
        roots.push(person);
      }
    }
  });

  // Count descendants for each node (recursive)
  function countDescendants(node: TreeNodeData): number {
    if (node.children.length === 0) { node.descendantCount = 0; return 0; }
    let count = node.children.length;
    for (const child of node.children) {
      count += countDescendants(child);
    }
    node.descendantCount = count;
    return count;
  }
  roots.forEach(countDescendants);

  return roots;
}

function TreeBranch({
  node, onSelect, expanded, onToggle, depth,
}: {
  node: TreeNodeData;
  onSelect: (id: string) => void;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  depth: number;
}) {
  const nameParts = node.firstName.split(' ');
  const initials = nameParts[nameParts.length - 1][0] + (node.lastName?.[0] || '');
  const hasChildren = node.children.length > 0;
  const isExpanded = expanded.has(node.id);

  return (
    <li className="tree-li">
      <div className="tree-card-wrapper">
        <div className="tree-card">
          <div
            className={`tree-card-avatar ${node.gender} ${node.deathYear ? 'deceased' : ''}`}
            onClick={() => onSelect(node.id)}
          >
            {initials}
          </div>
          <div className="tree-card-name" onClick={() => onSelect(node.id)}>
            {node.firstName}{node.lastName ? ` ${node.lastName}` : ''}
          </div>
          {(node.birthYear || node.deathYear) && (
            <div className="tree-card-years">
              {node.birthYear || '?'}{node.deathYear ? `\u2013${node.deathYear}` : ''}
            </div>
          )}
          {hasChildren && (
            <button
              className={`tree-toggle ${isExpanded ? 'expanded' : ''}`}
              onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}
              title={isExpanded ? 'Hide descendants' : 'Show descendants'}
            >
              {isExpanded ? (
                <Icons.chevronDown size={12} />
              ) : (
                <>
                  <Icons.plus size={10} />
                  <span className="tree-toggle-count">{node.descendantCount}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
      {hasChildren && isExpanded && (
        <ul className="tree-ul">
          {node.children.map(child => (
            <TreeBranch
              key={child.id}
              node={child}
              onSelect={onSelect}
              expanded={expanded}
              onToggle={onToggle}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function FamilyTreePage({ onSelectPerson, onAddPerson }: FamilyTreePageProps) {
  const [zoom, setZoom] = useState(1);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const { data: people, loading } = useAsync(fetchPeople, []);

  const trees = useMemo(() => buildTree(people), [people]);

  // By default, expand only the root nodes (show founder + direct children)
  const defaultExpanded = useMemo(() => {
    const ids = new Set<string>();
    trees.forEach(root => ids.add(root.id));
    return ids;
  }, [trees]);

  // Use default if user hasn't toggled anything
  const activeExpanded = expanded.size > 0 ? expanded : defaultExpanded;

  const handleToggle = useCallback((id: string) => {
    setExpanded(prev => {
      const next = new Set(prev.size > 0 ? prev : defaultExpanded);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, [defaultExpanded]);

  const expandAll = () => {
    const all = new Set<string>();
    people.forEach(p => all.add(p.id));
    setExpanded(all);
  };

  const collapseAll = () => {
    const rootsOnly = new Set<string>();
    trees.forEach(root => rootsOnly.add(root.id));
    setExpanded(rootsOnly);
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
          description="Start building your family tree by adding the oldest generation first."
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
        <span className="section-subtitle">Click names to view profiles. Click <Icons.plus size={10} /> to expand branches.</span>
      </div>
      <div className="tree-container">
        <div className="tree-toolbar">
          <div className="tree-toolbar-left">
            <span className="tree-toolbar-label">
              {people.length} members &middot; {generationCount} {generationCount === 1 ? 'generation' : 'generations'}
            </span>
          </div>
          <div className="tree-toolbar-right">
            <div className="tree-toolbar-group">
              <button className="tree-toolbar-btn-text" onClick={expandAll} title="Expand all branches">
                Expand all
              </button>
              <button className="tree-toolbar-btn-text" onClick={collapseAll} title="Collapse all branches">
                Collapse all
              </button>
            </div>
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
        </div>
        <div className="tree-canvas">
          <div className="tree-stage" style={{ transform: `scale(${zoom})` }}>
            {trees.map(root => (
              <div key={root.id} className="tree-root-wrapper">
                <ul className="tree-ul tree-ul-root">
                  <TreeBranch
                    node={root}
                    onSelect={onSelectPerson}
                    expanded={activeExpanded}
                    onToggle={handleToggle}
                    depth={0}
                  />
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

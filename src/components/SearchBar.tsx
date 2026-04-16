import React, { useState, useMemo } from 'react';
import { Icons } from './Icons';
import { PEOPLE } from '@/data/mockData';
import './SearchBar.css';

interface SearchBarProps {
  onClose: () => void;
  onSelectPerson: (id: string) => void;
}

export function SearchBar({ onClose, onSelectPerson }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return PEOPLE.filter(p =>
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.occupation?.toLowerCase().includes(q) ||
      p.bio?.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  return (
    <div className="search-overlay">
      <div className="search-box">
        <Icons.search size={18} />
        <input
          autoFocus
          placeholder="Search by name, place, or role..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button className="search-close" onClick={onClose}>
          <Icons.x size={16} />
        </button>
      </div>
      {results.length > 0 && (
        <div className="search-results">
          {results.map(p => (
            <div key={p.id} className="search-result" onClick={() => onSelectPerson(p.id)}>
              <div className={`search-result-avatar ${p.gender}`}>
                {p.firstName[0]}{p.lastName?.[0]}
              </div>
              <div className="search-result-info">
                <div className="search-result-name">{p.firstName} {p.lastName}</div>
                <div className="search-result-meta">{p.occupation} &middot; {p.birthYear}</div>
              </div>
              <Icons.chevronRight size={14} style={{ color: 'var(--c-text-muted)' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

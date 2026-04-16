import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { searchPeople } from '@/data/api';
import type { Person } from '@/types';
import './SearchBar.css';

interface SearchBarProps {
  onClose: () => void;
  onSelectPerson: (id: string) => void;
}

export function SearchBar({ onClose, onSelectPerson }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      const found = await searchPeople(query);
      setResults(found);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
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

      {query.trim() && (
        <div className="search-results">
          {loading ? (
            <div className="search-empty">Searching...</div>
          ) : results.length === 0 ? (
            <div className="search-empty">No results found for "{query}"</div>
          ) : (
            results.map(p => (
              <div key={p.id} className="search-result" onClick={() => onSelectPerson(p.id)}>
                <div className={`search-result-avatar ${p.gender}`}>
                  {p.firstName[0]}{p.lastName?.[0]}
                </div>
                <div className="search-result-info">
                  <div className="search-result-name">{p.firstName} {p.lastName}</div>
                  <div className="search-result-meta">
                    {p.occupation}{p.occupation && p.birthYear && ' \u00B7 '}{p.birthYear}
                  </div>
                </div>
                <Icons.chevronRight size={14} style={{ color: 'var(--c-text-muted)' }} />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

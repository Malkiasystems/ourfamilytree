import React, { useState, useCallback } from 'react';
import { TopBar, SearchBar, AddPersonModal } from '@/components';
import {
  HomePage,
  FamilyTreePage,
  PeoplePage,
  TimelinePage,
  StoriesPage,
  PersonProfile,
} from '@/pages';
import type { PageId } from '@/types';
import './App.css';

export default function App() {
  const [page, setPage] = useState<PageId>('home');
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showAddPerson, setShowAddPerson] = useState(false);

  const navigate = useCallback((pg: PageId, personId?: string) => {
    setPage(pg);
    setSelectedPerson(personId || null);
    setShowSearch(false);
    window.scrollTo(0, 0);
  }, []);

  const handleSelectPerson = useCallback((id: string) => {
    navigate('profile', id);
  }, [navigate]);

  return (
    <>
      <TopBar
        currentPage={page}
        onNavigate={(pg) => navigate(pg)}
        onSearchToggle={() => { setShowSearch(s => !s); }}
        onAddPerson={() => setShowAddPerson(true)}
      />

      {showSearch && (
        <SearchBar
          onClose={() => setShowSearch(false)}
          onSelectPerson={handleSelectPerson}
        />
      )}

      <main className="main">
        {page === 'home' && (
          <HomePage
            onNavigate={navigate}
            onAddPerson={() => setShowAddPerson(true)}
          />
        )}

        {page === 'tree' && (
          <FamilyTreePage
            onSelectPerson={handleSelectPerson}
            onAddPerson={() => setShowAddPerson(true)}
          />
        )}

        {page === 'people' && (
          <PeoplePage
            onSelectPerson={handleSelectPerson}
            onAddPerson={() => setShowAddPerson(true)}
          />
        )}

        {page === 'timeline' && (
          <TimelinePage onSelectPerson={handleSelectPerson} />
        )}

        {page === 'stories' && (
          <StoriesPage onSelectPerson={handleSelectPerson} />
        )}

        {page === 'profile' && selectedPerson && (
          <PersonProfile
            personId={selectedPerson}
            onNavigate={handleSelectPerson}
            onBack={() => navigate('people')}
          />
        )}

        <footer className="footer">
          <div className="footer-motto">Mti hukua kwa mizizi yake</div>
          <div className="footer-text">
            Koo Heritage Platform &middot; Preserving family history across generations
          </div>
        </footer>
      </main>

      {showAddPerson && (
        <AddPersonModal onClose={() => setShowAddPerson(false)} />
      )}
    </>
  );
}

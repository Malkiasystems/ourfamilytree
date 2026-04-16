import React from 'react';
import { Icons, LoadingState, EmptyState } from '@/components';
import { fetchStories, fetchPeople } from '@/data/api';
import { useAsync } from '@/lib/useAsync';
import './StoriesPage.css';

interface StoriesPageProps {
  onSelectPerson: (id: string) => void;
}

export function StoriesPage({ onSelectPerson }: StoriesPageProps) {
  const { data: stories, loading } = useAsync(fetchStories, []);
  const { data: people } = useAsync(fetchPeople, []);

  if (loading) {
    return <div className="section"><LoadingState text="Loading stories..." /></div>;
  }

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title"><Icons.scroll size={22} /> Stories & Memories</h2>
        <span className="section-subtitle">
          {stories.length} {stories.length === 1 ? 'story' : 'stories'} preserved
        </span>
      </div>

      {stories.length === 0 ? (
        <EmptyState
          icon="scroll"
          title="No stories shared yet"
          description="Stories, memories, and oral histories about family members will appear here. The most precious parts of your heritage are often in the stories only your elders remember."
        />
      ) : (
        stories.map(s => {
          const person = people.find(p => p.id === s.personId);
          return (
            <div key={s.id} className="story-card" onClick={() => onSelectPerson(s.personId)}>
              <div className="story-card-header">
                <div className="story-card-title">{s.title}</div>
                <span className={`story-card-type ${s.type}`}>{s.type}</span>
              </div>
              <div className="story-card-content">{s.content}</div>
              <div className="story-card-footer">
                <span>
                  {person && <>About {person.firstName} {person.lastName} &middot; </>}
                  By {s.author}
                </span>
                <span>{new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

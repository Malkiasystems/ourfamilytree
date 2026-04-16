import React from 'react';
import type { Person } from '@/types';

interface AvatarProps {
  person: Person;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export function Avatar({ person, size = 56, className = '', onClick }: AvatarProps) {
  const nameParts = person.firstName.split(' ');
  const initials = nameParts[nameParts.length - 1][0] + (person.lastName?.[0] || '');
  const hasPhoto = !!person.photo;

  return (
    <div
      className={`${className} ${person.gender} ${hasPhoto ? 'has-photo' : ''}`}
      onClick={onClick}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        flexShrink: 0,
        opacity: person.deathYear ? 0.65 : 1,
        overflow: 'hidden',
        position: 'relative',
        background: hasPhoto
          ? 'var(--c-cream)'
          : person.gender === 'male'
            ? 'rgba(74,107,138,0.12)'
            : 'rgba(138,90,107,0.12)',
        color: person.gender === 'male'
          ? 'var(--c-male)'
          : 'var(--c-female)',
      }}
    >
      {hasPhoto ? (
        <img
          src={person.photo!}
          alt={person.firstName}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute',
            inset: 0,
          }}
        />
      ) : (
        initials
      )}
    </div>
  );
}

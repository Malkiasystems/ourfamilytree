import React from 'react';
import type { Person } from '@/types';

interface AvatarProps {
  person: Person;
  size?: number;
  className?: string;
}

export function Avatar({ person, size = 56, className = '' }: AvatarProps) {
  const nameParts = person.firstName.split(' ');
  const initials = nameParts[nameParts.length - 1][0] + (person.lastName?.[0] || '');

  return (
    <div
      className={`${className} ${person.gender}`}
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
        background: person.gender === 'male'
          ? 'rgba(74,107,138,0.12)'
          : 'rgba(138,90,107,0.12)',
        color: person.gender === 'male'
          ? 'var(--c-male)'
          : 'var(--c-female)',
      }}
    >
      {initials}
    </div>
  );
}

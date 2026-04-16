import React, { useState } from 'react';
import { Icons } from './Icons';
import type { PageId } from '@/types';
import './TopBar.css';

interface TopBarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onSearchToggle: () => void;
  onAddPerson: () => void;
}

const navItems: { id: PageId; label: string; icon: keyof typeof Icons }[] = [
  { id: 'home', icon: 'home', label: 'Home' },
  { id: 'tree', icon: 'tree', label: 'Family Tree' },
  { id: 'people', icon: 'users', label: 'People' },
  { id: 'timeline', icon: 'timeline', label: 'Timeline' },
  { id: 'stories', icon: 'scroll', label: 'Stories' },
  { id: 'admin', icon: 'shield', label: 'Admin' },
];

export function TopBar({ currentPage, onNavigate, onSearchToggle, onAddPerson }: TopBarProps) {
  const [mobileMenu, setMobileMenu] = useState(false);

  const handleNav = (page: PageId) => {
    onNavigate(page);
    setMobileMenu(false);
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-brand" onClick={() => handleNav('home')}>
          <Icons.tree size={28} className="topbar-brand-icon" />
          <div>
            <span className="topbar-brand-name">Koo</span>
            <span className="topbar-brand-sub">Heritage Platform</span>
          </div>
        </div>

        <nav className="topbar-nav desktop">
          {navItems.map(item => {
            const Icon = Icons[item.icon];
            return (
              <button
                key={item.id}
                className={`topbar-btn ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => handleNav(item.id)}
              >
                <Icon size={16} />
                <span className="topbar-btn-label">{item.label}</span>
              </button>
            );
          })}
          <button className="topbar-btn" onClick={onSearchToggle}>
            <Icons.search size={16} />
          </button>
          <button className="topbar-btn topbar-btn-add" onClick={onAddPerson}>
            <Icons.plus size={16} />
            <span className="topbar-btn-label">Add Person</span>
          </button>
        </nav>

        <button className="mobile-menu-btn" onClick={() => setMobileMenu(m => !m)}>
          {mobileMenu ? <Icons.x size={20} /> : <Icons.menu size={20} />}
        </button>
      </header>

      {mobileMenu && (
        <div className="mobile-nav">
          {navItems.map(item => {
            const Icon = Icons[item.icon];
            return (
              <button
                key={item.id}
                className={`topbar-btn ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => handleNav(item.id)}
              >
                <Icon size={18} />
                <span className="topbar-btn-label">{item.label}</span>
              </button>
            );
          })}
          <button className="topbar-btn" onClick={() => { onSearchToggle(); setMobileMenu(false); }}>
            <Icons.search size={18} />
            <span className="topbar-btn-label">Search</span>
          </button>
          <button className="topbar-btn" onClick={() => { onAddPerson(); setMobileMenu(false); }}>
            <Icons.plus size={18} />
            <span className="topbar-btn-label">Add Person</span>
          </button>
        </div>
      )}
    </>
  );
}

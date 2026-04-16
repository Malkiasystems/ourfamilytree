import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { fetchClans, submitPersonProposal } from '@/data/api';
import { isSupabaseConfigured } from '@/lib/supabase';
import type { AddPersonForm, Clan } from '@/types';
import './AddPersonModal.css';

interface AddPersonModalProps {
  onClose: () => void;
}

const initialForm: AddPersonForm = {
  firstName: '', lastName: '', gender: 'male', clanId: '',
  birthYear: '', deathYear: '', birthPlace: '', occupation: '',
  bio: '', nameMeaning: '',
};

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export function AddPersonModal({ onClose }: AddPersonModalProps) {
  const [form, setForm] = useState<AddPersonForm>(initialForm);
  const [clans, setClans] = useState<Clan[]>([]);
  const [state, setState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchClans().then(setClans);
  }, []);

  const set = <K extends keyof AddPersonForm>(k: K, v: AddPersonForm[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.firstName.trim()) {
      setErrorMsg('First name is required');
      setState('error');
      return;
    }

    if (!isSupabaseConfigured()) {
      setErrorMsg('Database not configured. Please set up Supabase first.');
      setState('error');
      return;
    }

    setState('submitting');
    setErrorMsg('');

    const proposal = {
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim() || null,
      gender: form.gender,
      clan_id: form.clanId || null,
      birth_year: form.birthYear ? parseInt(form.birthYear, 10) : null,
      death_year: form.deathYear ? parseInt(form.deathYear, 10) : null,
      birth_place: form.birthPlace.trim() || null,
      occupation: form.occupation.trim() || null,
      bio: form.bio.trim() || null,
      name_meaning: form.nameMeaning.trim() || null,
    };

    const success = await submitPersonProposal(proposal);

    if (success) {
      setState('success');
      setTimeout(onClose, 1500);
    } else {
      setErrorMsg('Could not submit. Please try again.');
      setState('error');
    }
  };

  if (state === 'success') {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-body" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ color: 'var(--c-sage)', marginBottom: 16 }}>
              <Icons.star size={48} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--c-earth)', marginBottom: 8 }}>
              Submitted for review
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--c-text-secondary)' }}>
              Your contribution will appear after an editor approves it.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add New Person</h3>
          <button className="modal-close" onClick={onClose}><Icons.x size={18} /></button>
        </div>
        <div className="modal-body">
          {state === 'error' && errorMsg && (
            <div className="form-error">{errorMsg}</div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input className="form-input" value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Given name" />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-input" value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Family name" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-select" value={form.gender} onChange={e => set('gender', e.target.value as 'male' | 'female')}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Clan</label>
              <select className="form-select" value={form.clanId} onChange={e => set('clanId', e.target.value)}>
                <option value="">Select a clan</option>
                {clans.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Birth Year</label>
              <input className="form-input" type="number" value={form.birthYear} onChange={e => set('birthYear', e.target.value)} placeholder="Year of birth" />
            </div>
            <div className="form-group">
              <label className="form-label">Death Year</label>
              <input className="form-input" type="number" value={form.deathYear} onChange={e => set('deathYear', e.target.value)} placeholder="Leave empty if living" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Birth Place</label>
            <input className="form-input" value={form.birthPlace} onChange={e => set('birthPlace', e.target.value)} placeholder="City, town, or village" />
          </div>
          <div className="form-group">
            <label className="form-label">Occupation / Role</label>
            <input className="form-input" value={form.occupation} onChange={e => set('occupation', e.target.value)} placeholder="What did they do?" />
          </div>
          <div className="form-group">
            <label className="form-label">Name Meaning</label>
            <input className="form-input" value={form.nameMeaning} onChange={e => set('nameMeaning', e.target.value)} placeholder="Why was this name given?" />
          </div>
          <div className="form-group">
            <label className="form-label">Biography</label>
            <textarea className="form-textarea" value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Tell their story..." rows={4} />
          </div>
          <div className="form-actions">
            <button className="btn btn-outline" onClick={onClose} disabled={state === 'submitting'}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={state === 'submitting'}>
              {state === 'submitting' ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

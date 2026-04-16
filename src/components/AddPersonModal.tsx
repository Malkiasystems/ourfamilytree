import React, { useState } from 'react';
import { Icons } from './Icons';
import { CLANS } from '@/data/mockData';
import type { AddPersonForm } from '@/types';
import './AddPersonModal.css';

interface AddPersonModalProps {
  onClose: () => void;
}

const initialForm: AddPersonForm = {
  firstName: '', lastName: '', gender: 'male', clanId: 'c1',
  birthYear: '', deathYear: '', birthPlace: '', occupation: '',
  bio: '', nameMeaning: '',
};

export function AddPersonModal({ onClose }: AddPersonModalProps) {
  const [form, setForm] = useState<AddPersonForm>(initialForm);
  const set = (k: keyof AddPersonForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    // In production, this would POST to Supabase edit_proposals table
    console.log('Submitted for review:', form);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add New Person</h3>
          <button className="modal-close" onClick={onClose}><Icons.x size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input className="form-input" value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="e.g. Juma" />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-input" value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="e.g. Mwinyi" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-select" value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Clan</label>
              <select className="form-select" value={form.clanId} onChange={e => set('clanId', e.target.value)}>
                {CLANS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Birth Year</label>
              <input className="form-input" type="number" value={form.birthYear} onChange={e => set('birthYear', e.target.value)} placeholder="e.g. 1965" />
            </div>
            <div className="form-group">
              <label className="form-label">Death Year (if applicable)</label>
              <input className="form-input" type="number" value={form.deathYear} onChange={e => set('deathYear', e.target.value)} placeholder="Leave empty if living" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Birth Place</label>
            <input className="form-input" value={form.birthPlace} onChange={e => set('birthPlace', e.target.value)} placeholder="e.g. Bagamoyo" />
          </div>
          <div className="form-group">
            <label className="form-label">Occupation / Role</label>
            <input className="form-input" value={form.occupation} onChange={e => set('occupation', e.target.value)} placeholder="e.g. Mwalimu / Teacher" />
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
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>Submit for Review</button>
          </div>
        </div>
      </div>
    </div>
  );
}

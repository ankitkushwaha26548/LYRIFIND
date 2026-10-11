import { useState } from 'react';

const EMPTY = { title: '', artist: '', album: '', language: '', genre: '', year: '', lyrics: '' };

/** Used for both "add" and "edit". `initial` pre-fills the fields when editing. */
export default function SongForm({ initial, onSubmit, onCancel, busy }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const field = (k, label, props = {}) => (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      <input className="input" value={form[k] ?? ''} onChange={set(k)} {...props} />
    </label>
  );
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="grid gap-3 sm:grid-cols-2">
      {field('title', 'Title *', { required: true, maxLength: 150 })}
      {field('artist', 'Artist *', { required: true, maxLength: 100 })}
      {field('album', 'Album', { maxLength: 100 })}
      {field('year', 'Year', { type: 'number', min: 1800 })}
      {field('language', 'Language', { maxLength: 40 })}
      {field('genre', 'Genre', { maxLength: 40 })}
      <label className="block text-sm sm:col-span-2">
        <span className="mb-1 block font-medium">Lyrics * <span className="font-normal text-slate-500">(original or licensed text only)</span></span>
        <textarea className="input" rows={7} required value={form.lyrics} onChange={set('lyrics')} maxLength={20000} />
      </label>
      <div className="flex gap-2 sm:col-span-2">
        <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save song'}</button>
        {onCancel && <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}

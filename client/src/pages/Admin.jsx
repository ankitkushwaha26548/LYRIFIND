import { useCallback, useEffect, useState } from 'react';
import { api, errorText } from '../api/client';
import SongForm from '../components/SongForm';
import Pagination from '../components/Pagination';
import Alert from '../components/Alert';

/** Admin dashboard: stats + full CRUD for songs. */
export default function Admin() {
  const [data, setData] = useState({ results: [], total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);   // null = closed, {} = new, song = edit
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ kind: 'info', text: '' });

  const load = useCallback(() => api.songs({ page, limit: 8 }).then(setData).catch((e) => setMsg({ kind: 'error', text: errorText(e) })), [page]);
  useEffect(() => { load(); }, [load]);

  const save = async (form) => {
    setBusy(true);
    try {
      if (editing._id) {
        const { _id, createdAt, updatedAt, ...body } = { ...editing, ...form };
        await api.updateSong(editing._id, body);
      } else {
        await api.createSong(form);
      }
      setMsg({ kind: 'success', text: 'Song saved ✔' });
      setEditing(null); load();
    } catch (e) { setMsg({ kind: 'error', text: errorText(e) }); } finally { setBusy(false); }
  };

  const edit = async (song) => {
    try { setEditing((await api.song(song._id)).song); } catch (e) { setMsg({ kind: 'error', text: errorText(e) }); } // fetch full lyrics
  };

  const remove = async (song) => {
    if (!window.confirm(`Delete "${song.title}"? This cannot be undone.`)) return;
    try { await api.deleteSong(song._id); setMsg({ kind: 'success', text: 'Song deleted' }); load(); }
    catch (e) { setMsg({ kind: 'error', text: errorText(e) }); }
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Admin dashboard</h1>
          <p className="text-sm text-slate-500">{data.total} song(s) in the catalogue</p>
        </div>
        <button className="btn-primary" onClick={() => setEditing({})}>+ Add song</button>
      </div>
      <Alert kind={msg.kind}>{msg.text}</Alert>

      {editing && (
        <section className="card mb-6">
          <h2 className="mb-3 text-lg font-semibold">{editing._id ? 'Edit song' : 'Add a song'}</h2>
          <SongForm key={editing._id || 'new'} initial={editing} onSubmit={save} onCancel={() => setEditing(null)} busy={busy} />
        </section>
      )}

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-500 dark:bg-slate-700">
            <tr><th className="px-4 py-2">Title</th><th className="px-4 py-2">Artist</th><th className="hidden px-4 py-2 sm:table-cell">Language</th><th className="px-4 py-2 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {data.results.map((s) => (
              <tr key={s._id} className="border-t border-slate-200 dark:border-slate-700">
                <td className="px-4 py-2 font-medium">{s.title}</td>
                <td className="px-4 py-2">{s.artist}</td>
                <td className="hidden px-4 py-2 sm:table-cell">{s.language}</td>
                <td className="space-x-2 px-4 py-2 text-right">
                  <button className="btn-ghost !py-1" onClick={() => edit(s)}>Edit</button>
                  <button className="btn-danger !py-1" onClick={() => remove(s)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
    </>
  );
}

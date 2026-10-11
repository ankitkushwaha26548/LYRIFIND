import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, errorText } from '../api/client';
import { useDebounce } from '../hooks/useDebounce';
import SongCard from '../components/SongCard';
import Pagination from '../components/Pagination';
import Alert from '../components/Alert';

/**
 * Search page. The search state lives in the URL (?q=...&language=...&page=2) so results can be
 * bookmarked/shared and the browser Back button works.
 */
export default function Home() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const language = params.get('language') || '';
  const genre = params.get('genre') || '';
  const page = Number(params.get('page')) || 1;

  const [text, setText] = useState(q);          // what the user is typing
  const debounced = useDebounce(text, 400);     // wait until they pause
  const [filters, setFilters] = useState({ languages: [], genres: [] });
  const [data, setData] = useState({ results: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries({ page: 1, ...changes }).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (next.get('page') === '1') next.delete('page');
    setParams(next);
  };

  useEffect(() => { api.filters().then(setFilters).catch(() => {}); }, []);
  useEffect(() => { if (debounced !== q) update({ q: debounced }); }, [debounced]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let cancelled = false; // ignore out-of-order responses
    setLoading(true);
    api.songs({ q, language, genre, page, limit: 6 })
      .then((d) => { if (!cancelled) { setData(d); setError(''); } })
      .catch((e) => !cancelled && setError(errorText(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [q, language, genre, page]);

  return (
    <>
      <section className="mb-4 flex flex-wrap gap-2">
        <input className="input min-w-[14rem] flex-1" type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder="Search by title, artist or album…" aria-label="Search songs" />
        <select className="input w-auto" value={language} onChange={(e) => update({ language: e.target.value })} aria-label="Filter by language">
          <option value="">All languages</option>
          {filters.languages.map((l) => <option key={l}>{l}</option>)}
        </select>
        <select className="input w-auto" value={genre} onChange={(e) => update({ genre: e.target.value })} aria-label="Filter by genre">
          <option value="">All genres</option>
          {filters.genres.map((g) => <option key={g}>{g}</option>)}
        </select>
      </section>

      <Alert kind="error">{error}</Alert>
      <p className="mb-3 text-sm text-slate-500" aria-live="polite">{loading ? 'Searching…' : `${data.total} song(s) found`}</p>

      {!loading && data.results.length === 0 && !error ? (
        <div className="card text-center text-slate-500">No songs match your search. Try different words or clear the filters.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.results.map((s) => <SongCard key={s._id} song={s} onError={setError} />)}
        </div>
      )}
      <Pagination page={page} totalPages={data.totalPages} onChange={(p) => update({ q, language, genre, page: p })} />
    </>
  );
}

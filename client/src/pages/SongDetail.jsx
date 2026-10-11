import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, errorText } from '../api/client';
import FavoriteButton from '../components/FavoriteButton';
import Alert from '../components/Alert';

export default function SongDetail() {
  const { id } = useParams();
  const [song, setSong] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setSong(null);
    api.song(id).then((d) => setSong(d.song)).catch((e) => setError(errorText(e)));
  }, [id]);

  if (error) return <><Alert kind="error">{error}</Alert><Link to="/" className="btn-ghost">← Back to search</Link></>;
  if (!song) return <p className="text-slate-500">Loading…</p>;

  return (
    <article className="card">
      <Link to="/" className="text-sm text-brand-600 hover:underline dark:text-brand-100">← Back to search</Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{song.title}</h1>
          <p className="text-slate-500 dark:text-slate-400">{song.artist}{song.album ? ` · ${song.album}` : ''}{song.year ? ` · ${song.year}` : ''}</p>
          <div className="mt-2 flex gap-1">
            {song.language && <span className="tag">{song.language}</span>}
            {song.genre && <span className="tag">{song.genre}</span>}
          </div>
        </div>
        <FavoriteButton songId={song._id} onError={setError} />
      </div>
      {/* React escapes text automatically, so lyrics cannot inject HTML/scripts (XSS-safe). */}
      <pre className="mt-5 whitespace-pre-wrap font-sans text-base leading-7">{song.lyrics}</pre>
    </article>
  );
}

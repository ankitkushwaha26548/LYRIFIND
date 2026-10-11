import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorText } from '../api/client';
import { useFavorites } from '../context/FavoritesContext';
import SongCard from '../components/SongCard';
import Alert from '../components/Alert';

/** Lists the user's saved songs. It reloads whenever a heart is toggled so removed songs disappear. */
export default function Favorites() {
  const { ids } = useFavorites();
  const [songs, setSongs] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.favorites().then((d) => setSongs(d.favorites)).catch((e) => setError(errorText(e)));
  }, [ids]);

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">❤ My favorite lyrics</h1>
      <Alert kind="error">{error}</Alert>
      {songs === null ? <p className="text-slate-500">Loading…</p> : songs.length === 0 ? (
        <div className="card text-center text-slate-500">You have not saved any songs yet. <Link className="text-brand-600 underline" to="/">Find some lyrics</Link>.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{songs.map((s) => <SongCard key={s._id} song={s} onError={setError} />)}</div>
      )}
    </>
  );
}

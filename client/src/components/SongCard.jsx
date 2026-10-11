import { Link } from 'react-router-dom';
import FavoriteButton from './FavoriteButton';

export default function SongCard({ song, onError }) {
  return (
    <article className="card flex flex-col gap-2">
      <h3 className="text-lg font-semibold leading-tight">{song.title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {song.artist}{song.album ? ` · ${song.album}` : ''}{song.year ? ` · ${song.year}` : ''}
      </p>
      <div className="flex flex-wrap gap-1">
        {song.language && <span className="tag">{song.language}</span>}
        {song.genre && <span className="tag">{song.genre}</span>}
      </div>
      <div className="mt-auto flex gap-2 pt-2">
        <Link to={`/songs/${song._id}`} className="btn-primary">View lyrics</Link>
        <FavoriteButton songId={song._id} onError={onError} />
      </div>
    </article>
  );
}

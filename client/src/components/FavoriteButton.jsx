import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

/** Heart toggle. Anonymous visitors are sent to the login page. */
export default function FavoriteButton({ songId, onError }) {
  const { user } = useAuth();
  const { ids, toggle } = useFavorites();
  const navigate = useNavigate();
  const active = ids.has(songId);
  const click = async () => {
    if (!user) return navigate('/login');
    try { await toggle(songId); } catch (e) { onError?.(e.message); }
  };
  return (
    <button onClick={click} className="btn-ghost" aria-pressed={active} aria-label={active ? 'Remove from favorites' : 'Save to favorites'}>
      {active ? '❤ Saved' : '🤍 Save'}
    </button>
  );
}

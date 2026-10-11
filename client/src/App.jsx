import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import SongDetail from './pages/SongDetail.jsx';
import Login from './pages/Login.jsx';
import Favorites from './pages/Favorites.jsx';
import Admin from './pages/Admin.jsx';
import NotFound from './pages/NotFound.jsx';

/** Route table of the single-page app. */
export default function App() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/songs/:id" element={<SongDetail />} />
          <Route path="/login" element={<Login mode="login" />} />
          <Route path="/register" element={<Login mode="register" />} />
          <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

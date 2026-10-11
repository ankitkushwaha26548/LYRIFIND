import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div className="card text-center">
      <h1 className="mb-2 text-2xl font-bold">404 – Page not found</h1>
      <Link to="/" className="btn-primary">Go home</Link>
    </div>
  );
}

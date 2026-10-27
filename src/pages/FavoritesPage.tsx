import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bookmark, Route, Trash2, ArrowRight, MapPin, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserFavoriteRoutes, deleteFavoriteRoute } from '../lib/firestore';
import { FavoriteRoute } from '../types';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';

export const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await getUserFavoriteRoutes(currentUser.uid);
      setFavorites(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load favorite routes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [currentUser]);

  const handleDelete = async (routeId: string) => {
    if (!currentUser) return;
    if (!window.confirm('Are you sure you want to remove this saved route?')) return;

    try {
      await deleteFavoriteRoute(currentUser.uid, routeId);
      setFavorites(favorites.filter((f) => f.id !== routeId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete favorite route.');
    }
  };

  const handleLaunchRoute = (route: FavoriteRoute) => {
    navigate('/routes');
  };

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Sign In Required</h2>
        <p className="text-xs text-slate-500">
          You must be logged in to view and manage your saved commuter routes.
        </p>
        <Link
          to="/login"
          className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Saved Commuter Routes
            </h1>
            <Badge variant="blue">{favorites.length} Saved</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            One-click access to your frequent travel corridors and automated congestion checks.
          </p>
        </div>

        <Link
          to="/routes"
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          Plan & Save New Route
        </Link>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {favorites.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No favorite routes saved yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Calculate a route in the Route Planner and click "Save Route" to bookmark it here for daily commutes.
          </p>
          <div className="pt-2">
            <Link
              to="/routes"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              Go to Route Planner →
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map((fav) => (
            <div
              key={fav.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-slate-900 text-base">{fav.name}</h3>
                  <button
                    onClick={() => handleDelete(fav.id)}
                    title="Delete Route"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-xs text-slate-600 my-3 bg-slate-50 p-3 rounded-xl">
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 mt-1 shrink-0"></span>
                    <span className="line-clamp-1 font-medium">{fav.origin.name}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-600 mt-1 shrink-0"></span>
                    <span className="line-clamp-1 font-medium">{fav.destination.name}</span>
                  </div>
                </div>

                {fav.distanceKm ? (
                  <div className="text-[11px] text-slate-400">
                    Nominal Distance: <b>{fav.distanceKm.toFixed(1)} km</b>
                  </div>
                ) : null}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  Saved on {new Date(fav.createdAt).toLocaleDateString()}
                </span>
                <Link
                  to={`/routes?dest=${encodeURIComponent(fav.destination.name)}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  Open in Route Planner <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import { useEffect, useState } from 'react';
import { Plus, Play, Eye, Trash2, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import NewMatchModal from '../components/NewMatchModal';
import MatchScorer from '../components/MatchScorer';

interface Match {
  id: string;
  team1: { id: string; name: string };
  team2: { id: string; name: string };
  match_type: string;
  status: string;
  match_date: string;
  venue?: string;
  result_text?: string;
}

export default function Home() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewMatch, setShowNewMatch] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadMatches();
    }
  }, [user]);

  const loadMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          match_type,
          status,
          match_date,
          venue,
          result_text,
          team1:team1_id (id, name),
          team2:team2_id (id, name)
        `)
        .eq('user_id', user!.id)
        .order('match_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMatches(data as any || []);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMatch = async (matchId: string) => {
    if (!confirm('Are you sure you want to delete this match?')) return;

    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId);

      if (error) throw error;
      loadMatches();
    } catch (error) {
      console.error('Error deleting match:', error);
    }
  };

  if (selectedMatch) {
    return <MatchScorer matchId={selectedMatch} onBack={() => {
      setSelectedMatch(null);
      loadMatches();
    }} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Matches</h1>
          <p className="text-gray-600 mt-1">Manage and score your cricket matches</p>
        </div>
        <button
          onClick={() => setShowNewMatch(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 shadow-lg transition-all hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          <span>New Match</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent"></div>
          <p className="text-gray-600 mt-4">Loading matches...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No matches yet</h3>
          <p className="text-gray-600 mb-6">Start by creating your first match</p>
          <button
            onClick={() => setShowNewMatch(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Match</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <div
              key={match.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    match.status === 'Completed'
                      ? 'bg-blue-100 text-blue-700'
                      : match.status === 'In Progress'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {match.status}
                  </span>
                  <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {match.match_type}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{match.team1.name}</span>
                  </div>
                  <div className="flex items-center justify-center text-xs font-medium text-gray-500 my-2">
                    VS
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">{match.team2.name}</span>
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{new Date(match.match_date).toLocaleDateString()}</span>
                  {match.venue && <span className="ml-2">• {match.venue}</span>}
                </div>

                {match.result_text && (
                  <div className="text-sm text-green-700 bg-green-50 p-2 rounded-lg mb-4">
                    {match.result_text}
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedMatch(match.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                  >
                    {match.status === 'Completed' ? (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Score</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => deleteMatch(match.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showNewMatch && (
        <NewMatchModal
          onClose={() => setShowNewMatch(false)}
          onMatchCreated={(matchId) => {
            setShowNewMatch(false);
            loadMatches();
            setSelectedMatch(matchId);
          }}
        />
      )}
    </div>
  );
}

function Trophy({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  );
}

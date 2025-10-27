import { useEffect, useState } from 'react';
import { X, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PlayerSelectorProps {
  teamId: string;
  inningsId: string;
  onSelect: (player: any) => void;
  onClose: () => void;
}

export default function PlayerSelector({ teamId, inningsId, onSelect, onClose }: PlayerSelectorProps) {
  const { user } = useAuth();
  const [players, setPlayers] = useState<any[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlayers();
  }, [teamId]);

  const loadPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', teamId)
        .order('name');

      if (error) throw error;

      const { data: battingScores } = await supabase
        .from('batting_scores')
        .select('*')
        .eq('innings_id', inningsId);

      const { data: bowlingFigures } = await supabase
        .from('bowling_figures')
        .select('*')
        .eq('innings_id', inningsId);

      const playersWithStats = (data || []).map(player => {
        const batting = battingScores?.find(b => b.player_id === player.id);
        const bowling = bowlingFigures?.find(b => b.player_id === player.id);
        
        // Extract stats without the id field to prevent overwriting player.id
        const battingStats = batting ? Object.fromEntries(
          Object.entries(batting).filter(([key]) => key !== 'id')
        ) : {};
        
        const bowlingStats = bowling ? Object.fromEntries(
          Object.entries(bowling).filter(([key]) => key !== 'id')
        ) : {};
        
        return {
          ...player,
          ...battingStats,
          ...bowlingStats,
        };
      });

      setPlayers(playersWithStats);
    } catch (error) {
      console.error('Error loading players:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPlayer = async () => {
    if (!newPlayerName.trim()) return;

    try {
      const { error } = await supabase
        .from('players')
        .insert({
          user_id: user!.id,
          team_id: teamId,
          name: newPlayerName.trim(),
        })
        .select()
        .single();

      if (error) throw error;
      setNewPlayerName('');
      loadPlayers();
    } catch (error) {
      console.error('Error creating player:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Select Player</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 border-b border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="New player name"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && createPlayer()}
            />
            <button
              onClick={createPlayer}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <p className="text-center text-gray-600">Loading players...</p>
          ) : players.length === 0 ? (
            <p className="text-center text-gray-600">No players yet. Add one above.</p>
          ) : (
            <div className="space-y-2">
              {players.map((player) => (
                <button
                  key={player.id}
                  onClick={() => onSelect(player)}
                  className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition-colors"
                >
                  <p className="font-semibold text-gray-900">{player.name}</p>
                  {(player.runs !== undefined || player.wickets !== undefined) && (
                    <p className="text-sm text-gray-600 mt-1">
                      {player.runs !== undefined && `${player.runs}(${player.balls_faced || 0})`}
                      {player.wickets !== undefined && ` • ${player.wickets}/${player.runs_conceded || 0}`}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

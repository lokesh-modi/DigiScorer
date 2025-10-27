import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface ScoreboardProps {
  matchId: string;
}

interface InningsData {
  id: string;
  innings_number: number;
  total_runs: number;
  total_wickets: number;
  total_overs: number;
  batting_team: { name: string };
  batting_scores: Array<{
    player: { name: string };
    runs: number;
    balls_faced: number;
    fours: number;
    sixes: number;
    strike_rate: number;
    is_out: boolean;
    dismissal_type?: string;
  }>;
  bowling_figures: Array<{
    player: { name: string };
    overs: number;
    runs_conceded: number;
    wickets: number;
    economy_rate: number;
  }>;
}

export default function Scoreboard({ matchId }: ScoreboardProps) {
  const [innings, setInnings] = useState<InningsData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInnings();
    const subscription = supabase
      .channel(`match:${matchId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'innings', filter: `match_id=eq.${matchId}` }, loadInnings)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'batting_scores' }, loadInnings)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bowling_figures' }, loadInnings)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [matchId]);

  const loadInnings = async () => {
    try {
      const { data, error } = await supabase
        .from('innings')
        .select(`
          id,
          innings_number,
          total_runs,
          total_wickets,
          total_overs,
          batting_team:batting_team_id (name),
          batting_scores (
            player:player_id (name),
            runs,
            balls_faced,
            fours,
            sixes,
            strike_rate,
            is_out,
            dismissal_type,
            batting_position
          ),
          bowling_figures (
            player:player_id (name),
            overs,
            runs_conceded,
            wickets,
            economy_rate
          )
        `)
        .eq('match_id', matchId)
        .order('innings_number');

      if (error) throw error;

      const sortedData = (data || []).map(innings => ({
        ...innings,
        batting_scores: (innings.batting_scores || []).sort((a: any, b: any) =>
          a.batting_position - b.batting_position
        ),
      }));

      setInnings(sortedData as any);
    } catch (error) {
      console.error('Error loading innings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-center text-gray-600">Loading scoreboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {innings.map((inning) => (
        <div key={inning.id} className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-4">
            <div className="flex justify-between items-center text-white">
              <div>
                <h3 className="text-xl font-bold">{inning.batting_team.name}</h3>
                <p className="text-sm text-green-100">Innings {inning.innings_number}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">
                  {inning.total_runs}/{inning.total_wickets}
                </p>
                <p className="text-sm text-green-100">
                  {inning.total_overs.toFixed(1)} overs
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h4 className="font-semibold text-gray-900 mb-3">Batting</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-700">Batsman</th>
                    <th className="text-center py-2 font-medium text-gray-700">R</th>
                    <th className="text-center py-2 font-medium text-gray-700">B</th>
                    <th className="text-center py-2 font-medium text-gray-700">4s</th>
                    <th className="text-center py-2 font-medium text-gray-700">6s</th>
                    <th className="text-center py-2 font-medium text-gray-700">SR</th>
                  </tr>
                </thead>
                <tbody>
                  {inning.batting_scores.length > 0 ? (
                    inning.batting_scores.map((score, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-2">
                          <div>
                            <span className="font-medium text-gray-900">{score.player.name}</span>
                            {score.is_out && score.dismissal_type && (
                              <div className="text-xs text-gray-500">{score.dismissal_type}</div>
                            )}
                          </div>
                        </td>
                        <td className="text-center py-2 font-medium">{score.runs}</td>
                        <td className="text-center py-2">{score.balls_faced}</td>
                        <td className="text-center py-2">{score.fours}</td>
                        <td className="text-center py-2">{score.sixes}</td>
                        <td className="text-center py-2">{score.strike_rate.toFixed(1)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-gray-500">
                        No batting data yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <h4 className="font-semibold text-gray-900 mt-6 mb-3">Bowling</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-700">Bowler</th>
                    <th className="text-center py-2 font-medium text-gray-700">O</th>
                    <th className="text-center py-2 font-medium text-gray-700">R</th>
                    <th className="text-center py-2 font-medium text-gray-700">W</th>
                    <th className="text-center py-2 font-medium text-gray-700">Econ</th>
                  </tr>
                </thead>
                <tbody>
                  {inning.bowling_figures.length > 0 ? (
                    inning.bowling_figures.map((figure, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-2 font-medium text-gray-900">{figure.player.name}</td>
                        <td className="text-center py-2">{figure.overs.toFixed(1)}</td>
                        <td className="text-center py-2">{figure.runs_conceded}</td>
                        <td className="text-center py-2 font-medium">{figure.wickets}</td>
                        <td className="text-center py-2">{figure.economy_rate.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-gray-500">
                        No bowling data yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { TrendingUp, Target } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PlayerStats {
  player_name: string;
  total_runs: number;
  total_balls: number;
  total_fours: number;
  total_sixes: number;
  matches: number;
  highest_score: number;
  average: number;
  strike_rate: number;
}

interface BowlerStats {
  player_name: string;
  total_wickets: number;
  total_runs: number;
  total_overs: number;
  matches: number;
  best_figures: string;
  average: number;
  economy: number;
}

export default function Statistics() {
  const { user } = useAuth();
  const [topBatsmen, setTopBatsmen] = useState<PlayerStats[]>([]);
  const [topBowlers, setTopBowlers] = useState<BowlerStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStatistics();
    }
  }, [user]);

  const loadStatistics = async () => {
    try {
      const { data: battingData } = await supabase
        .from('batting_scores')
        .select(`
          runs,
          balls_faced,
          fours,
          sixes,
          player:player_id (name),
          innings:innings_id (match:match_id (user_id))
        `);

      const { data: bowlingData } = await supabase
        .from('bowling_figures')
        .select(`
          wickets,
          runs_conceded,
          overs,
          player:player_id (name),
          innings:innings_id (match:match_id (user_id))
        `);

      const userBattingData = (battingData || []).filter(
        (b: any) => b.innings?.match?.user_id === user!.id
      );

      const userBowlingData = (bowlingData || []).filter(
        (b: any) => b.innings?.match?.user_id === user!.id
      );

      const battingStats = new Map<string, any>();
      userBattingData.forEach((score: any) => {
        const name = score.player.name;
        if (!battingStats.has(name)) {
          battingStats.set(name, {
            player_name: name,
            total_runs: 0,
            total_balls: 0,
            total_fours: 0,
            total_sixes: 0,
            matches: 0,
            highest_score: 0,
            scores: [],
          });
        }
        const stats = battingStats.get(name);
        stats.total_runs += score.runs || 0;
        stats.total_balls += score.balls_faced || 0;
        stats.total_fours += score.fours || 0;
        stats.total_sixes += score.sixes || 0;
        stats.matches += 1;
        stats.highest_score = Math.max(stats.highest_score, score.runs || 0);
        stats.scores.push(score.runs || 0);
      });

      const topBatsmenData = Array.from(battingStats.values())
        .map((stats) => ({
          ...stats,
          average: stats.total_runs / stats.matches,
          strike_rate: (stats.total_runs / stats.total_balls) * 100 || 0,
        }))
        .sort((a, b) => b.total_runs - a.total_runs)
        .slice(0, 10);

      const bowlingStats = new Map<string, any>();
      userBowlingData.forEach((figure: any) => {
        const name = figure.player.name;
        if (!bowlingStats.has(name)) {
          bowlingStats.set(name, {
            player_name: name,
            total_wickets: 0,
            total_runs: 0,
            total_overs: 0,
            matches: 0,
            best_wickets: 0,
          });
        }
        const stats = bowlingStats.get(name);
        stats.total_wickets += figure.wickets || 0;
        stats.total_runs += figure.runs_conceded || 0;
        stats.total_overs += figure.overs || 0;
        stats.matches += 1;
        stats.best_wickets = Math.max(stats.best_wickets, figure.wickets || 0);
      });

      const topBowlersData = Array.from(bowlingStats.values())
        .map((stats) => ({
          ...stats,
          best_figures: `${stats.best_wickets}`,
          average: stats.total_wickets > 0 ? stats.total_runs / stats.total_wickets : 0,
          economy: stats.total_overs > 0 ? stats.total_runs / stats.total_overs : 0,
        }))
        .sort((a, b) => b.total_wickets - a.total_wickets)
        .slice(0, 10);

      setTopBatsmen(topBatsmenData);
      setTopBowlers(topBowlersData);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>
        <p className="text-gray-600 mt-1">Player performance and analytics</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent"></div>
          <p className="text-gray-600 mt-4">Loading statistics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6">
              <div className="flex items-center space-x-3 text-white">
                <TrendingUp className="w-6 h-6" />
                <h2 className="text-xl font-bold">Top Batsmen</h2>
              </div>
            </div>
            <div className="p-6">
              {topBatsmen.length === 0 ? (
                <p className="text-center text-gray-600 py-8">No batting statistics yet</p>
              ) : (
                <div className="space-y-4">
                  {topBatsmen.map((player, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{player.player_name}</p>
                          <p className="text-sm text-gray-600">
                            {player.matches} matches • HS: {player.highest_score}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">{player.total_runs}</p>
                        <p className="text-xs text-gray-600">
                          Avg: {player.average.toFixed(1)} • SR: {player.strike_rate.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
              <div className="flex items-center space-x-3 text-white">
                <Target className="w-6 h-6" />
                <h2 className="text-xl font-bold">Top Bowlers</h2>
              </div>
            </div>
            <div className="p-6">
              {topBowlers.length === 0 ? (
                <p className="text-center text-gray-600 py-8">No bowling statistics yet</p>
              ) : (
                <div className="space-y-4">
                  {topBowlers.map((player, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{player.player_name}</p>
                          <p className="text-sm text-gray-600">
                            {player.matches} matches • Best: {player.best_figures}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">{player.total_wickets}</p>
                        <p className="text-xs text-gray-600">
                          Avg: {player.average.toFixed(1)} • Econ: {player.economy.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

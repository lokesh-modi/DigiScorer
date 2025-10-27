import { useEffect, useState } from 'react';
import { Undo, RotateCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PlayerSelector from './PlayerSelector';

interface ScoringPanelProps {
  matchId: string;
  match: any;
  onUpdate: () => void;
}

export default function ScoringPanel({ matchId, match, onUpdate }: ScoringPanelProps) {
  const [currentInnings, setCurrentInnings] = useState<any>(null);
  const [striker, setStriker] = useState<any>(null);
  const [nonStriker, setNonStriker] = useState<any>(null);
  const [bowler, setBowler] = useState<any>(null);
  const [showPlayerSelector, setShowPlayerSelector] = useState(false);
  const [selectorType, setSelectorType] = useState<'striker' | 'nonStriker' | 'bowler'>('striker');
  const [lastBalls, setLastBalls] = useState<any[]>([]);

  useEffect(() => {
    loadCurrentInnings();
  }, [matchId, match.current_innings]);

  const loadCurrentInnings = async () => {
    try {
      const { data, error } = await supabase
        .from('innings')
        .select('*')
        .eq('match_id', matchId)
        .eq('innings_number', match.current_innings)
        .single();

      if (error) throw error;
      setCurrentInnings(data);

      const { data: balls } = await supabase
        .from('ball_by_ball')
        .select(`
          *,
          batsman:batsman_id (name),
          bowler:bowler_id (name)
        `)
        .eq('innings_id', data.id)
        .order('sequence_number', { ascending: false })
        .limit(6);

      setLastBalls(balls || []);
    } catch (error) {
      console.error('Error loading innings:', error);
    }
  };

  const recordBall = async (runs: number, extras?: string, isWicket?: boolean) => {
    if (!striker || !nonStriker || !bowler || !currentInnings) {
      alert('Please select striker, non-striker, and bowler first');
      return;
    }

    try {
      const ballsInOver = lastBalls.filter(b => b.over_number === Math.floor(currentInnings.total_overs)).length;
      const ballNumber = extras && (extras === 'Wide' || extras === 'No Ball') ? ballsInOver + 1 : ballsInOver + 1;
      const overNumber = Math.floor(currentInnings.total_overs) + (ballNumber > 6 ? 1 : 0);

      const actualBallNumber = ballNumber > 6 ? 1 : ballNumber;
      const isLegalDelivery = !extras || (extras !== 'Wide' && extras !== 'No Ball');

      const { data: ballData, error: ballError } = await supabase
        .from('ball_by_ball')
        .insert({
          innings_id: currentInnings.id,
          over_number: overNumber,
          ball_number: actualBallNumber,
          bowler_id: bowler.id,
          batsman_id: striker.id,
          non_striker_id: nonStriker.id,
          runs: runs,
          extras_type: extras || null,
          extras_runs: extras ? (extras === 'No Ball' || extras === 'Wide' ? runs + 1 : runs) : 0,
          is_wicket: isWicket || false,
          sequence_number: lastBalls.length > 0 ? lastBalls[0].sequence_number + 1 : 1,
        })
        .select()
        .single();

      if (ballError) throw ballError;

      const totalRunsToAdd = extras ? (extras === 'No Ball' || extras === 'Wide' ? runs + 1 : runs) : runs;
      const newTotalOvers = isLegalDelivery ?
        (actualBallNumber === 6 ? overNumber + 1 : currentInnings.total_overs + 0.1) :
        currentInnings.total_overs;

      const { error: inningsError } = await supabase
        .from('innings')
        .update({
          total_runs: currentInnings.total_runs + totalRunsToAdd,
          total_wickets: isWicket ? currentInnings.total_wickets + 1 : currentInnings.total_wickets,
          total_overs: newTotalOvers,
        })
        .eq('id', currentInnings.id);

      if (inningsError) throw inningsError;

      const { error: batError } = await supabase
        .from('batting_scores')
        .upsert({
          innings_id: currentInnings.id,
          player_id: striker.id,
          runs: (striker.runs || 0) + runs,
          balls_faced: (striker.balls_faced || 0) + (isLegalDelivery ? 1 : 0),
          fours: (striker.fours || 0) + (runs === 4 && !extras ? 1 : 0),
          sixes: (striker.sixes || 0) + (runs === 6 && !extras ? 1 : 0),
          strike_rate: ((striker.runs || 0) + runs) / ((striker.balls_faced || 0) + (isLegalDelivery ? 1 : 0)) * 100,
          is_out: isWicket || false,
          dismissal_type: isWicket ? 'Out' : null,
          batting_position: striker.batting_position || 1,
        }, {
          onConflict: 'innings_id,player_id',
        });

      if (batError) throw batError;

      const bowlerOvers = isLegalDelivery ? (bowler.overs || 0) + 0.1 : (bowler.overs || 0);
      const { error: bowlError } = await supabase
        .from('bowling_figures')
        .upsert({
          innings_id: currentInnings.id,
          player_id: bowler.id,
          overs: bowlerOvers,
          runs_conceded: (bowler.runs_conceded || 0) + totalRunsToAdd,
          wickets: (bowler.wickets || 0) + (isWicket ? 1 : 0),
          wides: (bowler.wides || 0) + (extras === 'Wide' ? 1 : 0),
          no_balls: (bowler.no_balls || 0) + (extras === 'No Ball' ? 1 : 0),
          economy_rate: ((bowler.runs_conceded || 0) + totalRunsToAdd) / Math.floor(bowlerOvers),
        }, {
          onConflict: 'innings_id,player_id',
        });

      if (bowlError) throw bowlError;

      if (runs % 2 === 1 || actualBallNumber === 6) {
        const temp = striker;
        setStriker(nonStriker);
        setNonStriker(temp);
      }

      loadCurrentInnings();
      onUpdate();
    } catch (error) {
      console.error('Error recording ball:', error);
      alert('Failed to record ball. Please try again.');
    }
  };

  const undoLastBall = async () => {
    if (lastBalls.length === 0) return;
    if (!confirm('Undo the last ball?')) return;

    try {
      const lastBall = lastBalls[0];

      await supabase
        .from('ball_by_ball')
        .delete()
        .eq('id', lastBall.id);

      loadCurrentInnings();
      onUpdate();
    } catch (error) {
      console.error('Error undoing ball:', error);
    }
  };

  const swapBatsmen = () => {
    const temp = striker;
    setStriker(nonStriker);
    setNonStriker(temp);
  };

  const openPlayerSelector = (type: 'striker' | 'nonStriker' | 'bowler') => {
    setSelectorType(type);
    setShowPlayerSelector(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Scoring Panel</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => openPlayerSelector('striker')}
          className="p-4 border-2 border-gray-300 rounded-lg hover:border-green-600 transition-colors text-left"
        >
          <p className="text-xs text-gray-500 mb-1">Striker</p>
          <p className="font-semibold text-gray-900">
            {striker ? `${striker.name} (${striker.runs || 0}*)` : 'Select Striker'}
          </p>
        </button>

        <button
          onClick={() => openPlayerSelector('nonStriker')}
          className="p-4 border-2 border-gray-300 rounded-lg hover:border-green-600 transition-colors text-left"
        >
          <p className="text-xs text-gray-500 mb-1">Non-Striker</p>
          <p className="font-semibold text-gray-900">
            {nonStriker ? `${nonStriker.name} (${nonStriker.runs || 0})` : 'Select Non-Striker'}
          </p>
        </button>

        <button
          onClick={() => openPlayerSelector('bowler')}
          className="p-4 border-2 border-gray-300 rounded-lg hover:border-green-600 transition-colors text-left"
        >
          <p className="text-xs text-gray-500 mb-1">Bowler</p>
          <p className="font-semibold text-gray-900">
            {bowler ? `${bowler.name} (${bowler.wickets || 0}/${bowler.runs_conceded || 0})` : 'Select Bowler'}
          </p>
        </button>
      </div>

      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">Runs</p>
        <div className="grid grid-cols-4 gap-3">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((run) => (
            <button
              key={run}
              onClick={() => recordBall(run)}
              className="bg-gray-100 hover:bg-green-600 hover:text-white font-bold py-4 rounded-lg transition-colors"
            >
              {run}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">Extras</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => recordBall(0, 'Wide')}
            className="bg-yellow-100 hover:bg-yellow-200 font-medium py-3 rounded-lg transition-colors"
          >
            Wide
          </button>
          <button
            onClick={() => recordBall(0, 'No Ball')}
            className="bg-yellow-100 hover:bg-yellow-200 font-medium py-3 rounded-lg transition-colors"
          >
            No Ball
          </button>
          <button
            onClick={() => recordBall(0, 'Bye')}
            className="bg-yellow-100 hover:bg-yellow-200 font-medium py-3 rounded-lg transition-colors"
          >
            Bye
          </button>
          <button
            onClick={() => recordBall(0, 'Leg Bye')}
            className="bg-yellow-100 hover:bg-yellow-200 font-medium py-3 rounded-lg transition-colors"
          >
            Leg Bye
          </button>
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={() => recordBall(0, undefined, true)}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg transition-colors"
        >
          WICKET
        </button>
      </div>

      <div className="flex space-x-3 mb-6">
        <button
          onClick={swapBatsmen}
          className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <RotateCw className="w-4 h-4" />
          <span>Swap</span>
        </button>
        <button
          onClick={undoLastBall}
          disabled={lastBalls.length === 0}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
        >
          <Undo className="w-4 h-4" />
          <span>Undo</span>
        </button>
      </div>

      {lastBalls.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">This Over</p>
          <div className="flex space-x-2">
            {lastBalls.slice(0, 6).reverse().map((ball, idx) => (
              <div
                key={idx}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  ball.is_wicket
                    ? 'bg-red-600 text-white'
                    : ball.extras_type
                    ? 'bg-yellow-400 text-gray-900'
                    : ball.runs === 4 || ball.runs === 6
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                {ball.is_wicket ? 'W' : ball.extras_type ? ball.extras_type[0] : ball.runs}
              </div>
            ))}
          </div>
        </div>
      )}

      {showPlayerSelector && (
        <PlayerSelector
          teamId={selectorType === 'bowler' ? match.bowling_team_id : match.batting_team_id}
          inningsId={currentInnings?.id}
          onSelect={(player) => {
            if (selectorType === 'striker') setStriker(player);
            else if (selectorType === 'nonStriker') setNonStriker(player);
            else setBowler(player);
            setShowPlayerSelector(false);
          }}
          onClose={() => setShowPlayerSelector(false)}
        />
      )}
    </div>
  );
}

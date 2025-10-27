import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import TossModal from './TossModal';
import ScoringPanel from './ScoringPanel';
import Scoreboard from './Scoreboard';

interface MatchScorerProps {
  matchId: string;
  onBack: () => void;
}

interface Match {
  id: string;
  team1_id: string;
  team2_id: string;
  team1: { id: string; name: string };
  team2: { id: string; name: string };
  status: string;
  overs: number;
  match_type: string;
  current_innings: number;
  toss_winner_id?: string;
  toss_decision?: string;
  batting_team_id?: string;
  bowling_team_id?: string;
}

export default function MatchScorer({ matchId, onBack }: MatchScorerProps) {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [showToss, setShowToss] = useState(false);

  useEffect(() => {
    loadMatch();
  }, [matchId]);

  const loadMatch = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          team1:team1_id (id, name),
          team2:team2_id (id, name)
        `)
        .eq('id', matchId)
        .single();

      if (error) throw error;
      setMatch(data as any);

      if (data.status === 'Not Started') {
        setShowToss(true);
      }
    } catch (error) {
      console.error('Error loading match:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTossComplete = async (tossWinnerId: string, decision: string) => {
    try {
      const battingTeamId = decision === 'bat' ? tossWinnerId :
        (tossWinnerId === match!.team1_id ? match!.team2_id : match!.team1_id);
      const bowlingTeamId = decision === 'bat' ?
        (tossWinnerId === match!.team1_id ? match!.team2_id : match!.team1_id) : tossWinnerId;

      const { error } = await supabase
        .from('matches')
        .update({
          toss_winner_id: tossWinnerId,
          toss_decision: decision,
          status: 'In Progress',
          batting_team_id: battingTeamId,
          bowling_team_id: bowlingTeamId,
        })
        .eq('id', matchId);

      if (error) throw error;

      const { error: inningsError } = await supabase
        .from('innings')
        .insert({
          match_id: matchId,
          batting_team_id: battingTeamId,
          bowling_team_id: bowlingTeamId,
          innings_number: 1,
        });

      if (inningsError) throw inningsError;

      setShowToss(false);
      loadMatch();
    } catch (error) {
      console.error('Error updating toss:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent"></div>
        <p className="text-gray-600 mt-4">Loading match...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Match not found</p>
        <button
          onClick={onBack}
          className="mt-4 text-green-600 hover:text-green-700 font-medium"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-medium mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Matches</span>
        </button>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {match.team1.name} vs {match.team2.name}
              </h1>
              <p className="text-gray-600 mt-1">{match.match_type} Match</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              match.status === 'Completed'
                ? 'bg-blue-100 text-blue-700'
                : match.status === 'In Progress'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {match.status}
            </span>
          </div>
        </div>
      </div>

      {match.status === 'Not Started' && showToss && (
        <TossModal
          team1={match.team1}
          team2={match.team2}
          onComplete={handleTossComplete}
        />
      )}

      {match.status === 'In Progress' && (
        <div className="space-y-6">
          <Scoreboard matchId={matchId} />
          <ScoringPanel matchId={matchId} match={match} onUpdate={loadMatch} />
        </div>
      )}

      {match.status === 'Completed' && (
        <Scoreboard matchId={matchId} />
      )}
    </div>
  );
}

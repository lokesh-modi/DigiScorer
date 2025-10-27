import { useState } from 'react';

interface Team {
  id: string;
  name: string;
}

interface TossModalProps {
  team1: Team;
  team2: Team;
  onComplete: (winnerId: string, decision: string) => void;
}

export default function TossModal({ team1, team2, onComplete }: TossModalProps) {
  const [tossWinner, setTossWinner] = useState('');
  const [decision, setDecision] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(tossWinner, decision);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Toss</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Who won the toss?
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setTossWinner(team1.id)}
                className={`w-full p-4 rounded-lg border-2 font-medium transition-all ${
                  tossWinner === team1.id
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {team1.name}
              </button>
              <button
                type="button"
                onClick={() => setTossWinner(team2.id)}
                className={`w-full p-4 rounded-lg border-2 font-medium transition-all ${
                  tossWinner === team2.id
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {team2.name}
              </button>
            </div>
          </div>

          {tossWinner && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What did they choose?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDecision('bat')}
                  className={`p-4 rounded-lg border-2 font-medium transition-all ${
                    decision === 'bat'
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Bat
                </button>
                <button
                  type="button"
                  onClick={() => setDecision('bowl')}
                  className={`p-4 rounded-lg border-2 font-medium transition-all ${
                    decision === 'bowl'
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Bowl
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!tossWinner || !decision}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Match
          </button>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/use-auth';

interface Player {
  id: number;
  username: string;
}

interface Props {
  challengeId: number;
  player1: Player;
  player2: Player;
  onMatchSubmitted?: () => void;
}

const TennisMatchForm: React.FC<Props> = ({ challengeId, player1, player2, onMatchSubmitted }) => {
  const token = localStorage.getItem("token");
  const [player1Score, setPlayer1Score] = useState<number[]>([0, 0, 0]);
  const [player2Score, setPlayer2Score] = useState<number[]>([0, 0, 0]);
  const [winnerId, setWinnerId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!winnerId) {
      setError("Please select the winner.");
      return;
    }

    try {
      await axios.post(`/api/challenges/${challengeId}/tennis-match/`, {
        player1_score: { sets: player1Score },
        player2_score: { sets: player2Score },
        winner_id: winnerId,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(true);
      if (onMatchSubmitted) onMatchSubmitted();
    } catch (err) {
      setError("Failed to submit match.");
    }
  };

  const updateScore = (setter: React.Dispatch<React.SetStateAction<number[]>>, index: number, value: number) => {
    setter(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  return (
    <div>
      <h2>Submit Tennis Match</h2>
      <div>
        {[0, 1, 2].map(set => (
          <div key={set} style={{ display: 'flex', marginBottom: 8 }}>
            <input
              type="number"
              value={player1Score[set]}
              onChange={(e) => updateScore(setPlayer1Score, set, parseInt(e.target.value) || 0)}
              placeholder={`${player1.username} Set ${set + 1}`}
            />
            <span style={{ margin: '0 10px' }}>vs</span>
            <input
              type="number"
              value={player2Score[set]}
              onChange={(e) => updateScore(setPlayer2Score, set, parseInt(e.target.value) || 0)}
              placeholder={`${player2.username} Set ${set + 1}`}
            />
          </div>
        ))}
      </div>

      <div>
        <label>Select Winner:</label><br />
        <select onChange={(e) => setWinnerId(parseInt(e.target.value))} value={winnerId || ''}>
          <option value="">-- Select Winner --</option>
          <option value={player1.id}>{player1.username}</option>
          <option value={player2.id}>{player2.username}</option>
        </select>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>Match submitted!</p>}

      <button onClick={handleSubmit}>Submit Match</button>
    </div>
  );
};

export default TennisMatchForm;

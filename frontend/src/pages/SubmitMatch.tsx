import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import TennisMatchForm from '../components/TennisMatchForm';
import { useAuth } from '../hooks/use-auth';

const SubmitMatch = () => {
  const token = localStorage.getItem("token");
  const { challengeId } = useParams();
  const [challenge, setChallenge] = useState<any>(null);

  useEffect(() => {
    axios.get(`/api/challenges/${challengeId}/`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setChallenge(res.data));
  }, [challengeId]);

  if (!challenge) return <div>Loading...</div>;

  return (
    <div>
      <h1>Submit Match for {challenge.game_name}</h1>
      <TennisMatchForm
        challengeId={challenge.id}
        player1={challenge.sender}
        player2={challenge.receiver}
      />
    </div>
  );
};

export default SubmitMatch;

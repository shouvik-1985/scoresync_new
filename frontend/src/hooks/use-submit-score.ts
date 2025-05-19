
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

interface Player {
  id: string;
  name: string;
  score: number;
}

interface ScoreSubmission {
  game: string;
  players: Player[];
  date: string;
}

export const useSubmitScore = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const submitScore = async (data: ScoreSubmission) => {
    setIsSubmitting(true);
    try {
      // For now, we'll just simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Score submitted!",
        description: "Your game score has been recorded successfully.",
      });
      
      navigate('/scores');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit score. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitScore,
    isSubmitting,
  };
};

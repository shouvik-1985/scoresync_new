import axiosInstance from "@/services/axiosInstance";

export const fetchMyChallenges = async () => {
  try {
    const res = await axiosInstance.get("/challenges/");
    console.log("✅ /challenges/ response:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ fetchMyChallenges failed:", error);
    return [];
  }
};

export const createChallenge = async (data: {
  receiver_id: number;
  game_id: number;
  scheduled_time: string;
}) => {
  try {
    const res = await axiosInstance.post("/challenges/create/", data);
    console.log("Challenge created:", res.data);
    return res.data;
  } catch (error) {
    console.error("createChallenge failed:", error);
    throw error;
  }
};

export const respondToChallenge = async (
  challengeId: number,
  action: "accept" | "decline"
) => {
  try {
    const res = await axiosInstance.post(`/challenges/${challengeId}/respond/`, { action });
    console.log("Challenge response:", res.data);
    return res.data;
  } catch (error) {
    console.error("respondToChallenge failed:", error);
    throw error;
  }
};

export const submitTennisMatch = async (
  challengeId: number,
  player1Score: number,
  player2Score: number,
  winnerId: number
) => {
  try {
    const response = await axiosInstance.post(`/challenges/${challengeId}/tennis-match/`, {
      player1_score: player1Score,
      player2_score: player2Score,
      winner_id: winnerId,
    });
    console.log("Match submitted:", response.data);
    return response.data;
  } catch (error) {
    console.error("submitTennisMatch failed:", error);
    throw error;
  }
};

export const getCompletedChallenges = async () => {
  try {
    const res = await axiosInstance.get('/challenges/completed/');
    console.log("Completed challenges:", res.data);
    return res.data;
  } catch (error) {
    console.error("getCompletedChallenges failed:", error);
    return [];
  }
};

// export const listChallenges = async () => {
//   const res = await axiosInstance.get("/challenges/");
//   return res.data;
// };
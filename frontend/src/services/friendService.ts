// frontend/src/services/friendService.ts

import axios from "@/services/axiosInstance";


export const acceptFriendRequest = (request_id: number) => {
  return axios.post('/friends/accept/', { request_id });
};

export const rejectFriendRequest = (request_id: number) => {
  return axios.post('/friends/reject/', { request_id });
};

export const removeFriend = (user_id: number) => {
  return axios.post('/friends/remove/', { user_id });
};

export const getFriendList = () => {
  return axios.get('/friends/list/');
};

export const getPendingRequests = () => {
  return axios.get('/friends/pending/');
};

export const searchUsers = async (query: string) => {
  const res = await axios.get(`/friends/search/?q=${encodeURIComponent(query)}`);
  return res.data;
};

export const sendFriendRequest = async (receiverId: string | number) => {
  const res = await axios.post("/friends/send-request/", { receiver_id: receiverId });
  return res.data;
};

export const blockUser = (blockedId: number) => {
  return axios.post(`/friends/block/${blockedId}/`);
};

export const unblockUser = (blockedId: number) => {
  return axios.post(`/friends/unblock/${blockedId}/`);
};



export const fetchGameFriends = async (gameId: number) => {
  const response = await axios.get(`/friends/friends-by-game/${gameId}/`);
  return response.data;
};
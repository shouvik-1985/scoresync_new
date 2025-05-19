// src/services/api.ts
import axios from 'axios';
import { publicAxios } from './axiosInstance'; 

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // or your backend base URL
  withCredentials: true, // if using authentication
});

export default api;


export const createGuestMatch = async (data: {
  game_type: string;
  match_type: string;
  players: string[];
}) => {
  const res = await publicAxios.post("/matches/guest-match/create/", data);
  return res.data;
};

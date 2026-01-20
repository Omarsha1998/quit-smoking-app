// src/services/api.js
import axios from "axios";

const API_BASE_URL = process.env.VUE_APP_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const userAPI = {
  // Register user
  async register(userId, userName) {
    const response = await api.post("/users/register", { userId, userName });
    return response.data;
  },

  // Start tracking
  async startTracking(
    userId,
    userName,
    quitDate,
    cigarettesPerDay,
    pricePerPack
  ) {
    const response = await api.post("/users/start", {
      userId,
      userName,
      quitDate,
      cigarettesPerDay,
      pricePerPack,
    });
    return response.data;
  },

  // Get user data
  async getUser(userId) {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Update progress
  async updateProgress(userId, daysSmokeeFree, cigarettesAvoided, moneySaved) {
    const response = await api.post(`/users/${userId}/progress`, {
      daysSmokeeFree,
      cigarettesAvoided,
      moneySaved,
    });
    return response.data;
  },

  // Get all users (admin)
  async getAllUsers() {
    const response = await api.get("/users");
    return response.data;
  },

  // Delete user
  async deleteUser(userId) {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },
};

export default api;

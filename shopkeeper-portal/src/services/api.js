import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function getSession(sessionId) {
  try {
    const response = await axios.get(`${API_BASE}/session/${sessionId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Session not found');
  }
}

export async function viewFile(sessionId, fileId) {
  return `${API_BASE}/session/${sessionId}/file/${fileId}/view`;
}

export async function completeSession(sessionId) {
  try {
    const response = await axios.post(`${API_BASE}/session/${sessionId}/complete`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to complete session');
  }
}

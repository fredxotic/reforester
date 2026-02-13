import api from './api';

export const teamAPI = {
  getMyTeams: async () => {
    const response = await api.get('/api/teams/my-teams');
    return response.data;
  },

  createTeam: async (teamData) => {
    const response = await api.post('/api/teams', teamData);
    return response.data;
  },

  getTeam: async (id) => {
    const response = await api.get(`/api/teams/${id}`);
    return response.data;
  },

  updateTeam: async (id, teamData) => {
    const response = await api.put(`/api/teams/${id}`, teamData);
    return response.data;
  },

  addTeamMember: async (teamId, userId, role = 'member') => {
    const response = await api.post(`/api/teams/${teamId}/members`, {
      userId,
      role
    });
    return response.data;
  },

  removeTeamMember: async (teamId, userId) => {
    const response = await api.delete(`/api/teams/${teamId}/members/${userId}`);
    return response.data;
  },

  inviteToTeam: async (teamId, email, role = 'member') => {
    const response = await api.post(`/api/teams/${teamId}/invite`, {
      email,
      role
    });
    return response.data;
  }
};
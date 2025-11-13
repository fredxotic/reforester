import api from './api';

export const teamAPI = {
  // Get user's teams
  getMyTeams: async () => {
    const response = await api.get('/teams/my-teams');
    return response.data;
  },

  // Create team
  createTeam: async (teamData) => {
    const response = await api.post('/teams', teamData);
    return response.data;
  },

  // Get team details
  getTeam: async (id) => {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  },

  // Update team
  updateTeam: async (id, teamData) => {
    const response = await api.put(`/teams/${id}`, teamData);
    return response.data;
  },

  // Add team member
  addTeamMember: async (teamId, userId, role = 'member') => {
    const response = await api.post(`/teams/${teamId}/members`, {
      userId,
      role
    });
    return response.data;
  },

  // Remove team member
  removeTeamMember: async (teamId, userId) => {
    const response = await api.delete(`/teams/${teamId}/members/${userId}`);
    return response.data;
  },

  // Invite to team
  inviteToTeam: async (teamId, email, role = 'member') => {
    const response = await api.post(`/teams/${teamId}/invite`, {
      email,
      role
    });
    return response.data;
  }
};
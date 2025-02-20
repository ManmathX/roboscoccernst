const API_URL = 'http://localhost:3000/api';

class API {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    // Helper method for making API calls
    async fetchAPI(endpoint, options = {}) {
        try {
            if (this.token) {
                options.headers = {
                    ...options.headers,
                    'Authorization': `Bearer ${this.token}`
                };
            }

            const response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API Error');
            }

            return data;
        } catch (error) {
            throw error;
        }
    }

    // Auth Methods
    async login(username, password) {
        const data = await this.fetchAPI('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        this.token = data.token;
        localStorage.setItem('token', data.token);
        return data;
    }

    logout() {
        this.token = null;
        localStorage.removeItem('token');
    }

    // Team Methods
    async getTeams() {
        return await this.fetchAPI('/teams');
    }

    async addTeam(teamData) {
        return await this.fetchAPI('/teams', {
            method: 'POST',
            body: JSON.stringify(teamData)
        });
    }

    async updateTeam(teamId, teamData) {
        return await this.fetchAPI(`/teams/${teamId}`, {
            method: 'PUT',
            body: JSON.stringify(teamData)
        });
    }

    async deleteTeam(teamId) {
        return await this.fetchAPI(`/teams/${teamId}`, {
            method: 'DELETE'
        });
    }

    // Match Methods
    async getMatches() {
        return await this.fetchAPI('/matches');
    }

    async addMatch(matchData) {
        return await this.fetchAPI('/matches', {
            method: 'POST',
            body: JSON.stringify(matchData)
        });
    }

    async updateMatchScore(matchId, scoreData) {
        return await this.fetchAPI(`/matches/${matchId}/score`, {
            method: 'PUT',
            body: JSON.stringify(scoreData)
        });
    }

    // Standings Methods
    async getStandings() {
        return await this.fetchAPI('/matches/standings');
    }

    // Groups Methods
    async getGroups() {
        return await this.fetchAPI('/matches/groups');
    }
}

export const api = new API();
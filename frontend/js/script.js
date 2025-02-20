
import { api } from './api.js';

class RoboSoccerApp {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.initializeApp();
    }

    initializeElements() {
        // Tabs
        this.tabs = document.querySelectorAll('.tab');
        this.tabContents = document.querySelectorAll('.tab-content');

        // Admin elements
        this.adminLogin = document.getElementById('admin-login');
        this.adminPanel = document.getElementById('admin-panel');
        this.adminLoginBtn = document.getElementById('admin-login-btn');
        this.adminUsername = document.getElementById('admin-username');
        this.adminPassword = document.getElementById('admin-password');

        // Team management elements
        this.teamName = document.getElementById('team-name');
        this.teamLogo = document.getElementById('team-logo');
        this.addTeamBtn = document.getElementById('add-team-btn');
        this.teamsList = document.getElementById('teams-list');

        // Match management elements
        this.matchTeam1 = document.getElementById('match-team1');
        this.matchTeam2 = document.getElementById('match-team2');
        this.matchTime = document.getElementById('match-time');
        this.matchGroup = document.getElementById('match-group');
        this.addMatchBtn = document.getElementById('add-match-btn');
        this.matchSelect = document.getElementById('match-select');
        this.score1 = document.getElementById('score1');
        this.score2 = document.getElementById('score2');
        this.matchStatus = document.getElementById('match-status');
        this.updateMatchBtn = document.getElementById('update-match-btn');

        // Display elements
        this.matchesContainer = document.getElementById('matches-container');
        this.standingsBody = document.getElementById('standings-body');
        this.groupsContainer = document.getElementById('groups-container');
        this.teamsGrid = document.getElementById('teams-grid');

        // Utils
        this.toast = document.getElementById('toast');
        this.loadingOverlay = document.getElementById('loading-overlay');
    }

    attachEventListeners() {
        // Tab switching
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        // Admin login
        this.adminLoginBtn.addEventListener('click', () => this.handleAdminLogin());

        // Team management
        this.addTeamBtn.addEventListener('click', () => this.handleAddTeam());

        // Match management
        this.addMatchBtn.addEventListener('click', () => this.handleAddMatch());
        this.updateMatchBtn.addEventListener('click', () => this.handleUpdateMatch());
        this.matchSelect.addEventListener('change', () => this.handleMatchSelection());
    }

    async initializeApp() {
        this.showLoading();
        try {
            await this.refreshData();
            this.updateCurrentDate();
            this.startLiveUpdates();
        } catch (error) {
            this.showToast(error.message, 'error');
        }
        this.hideLoading();
    }

    async refreshData() {
        const [matches, teams, standings] = await Promise.all([
            api.getMatches(),
            api.getTeams(),
            api.getStandings()
        ]);

        this.renderMatches(matches);
        this.renderStandings(standings);
        this.renderGroups(matches);
        this.renderTeams(teams);
        this.updateAdminSelects(teams, matches);
    }

    // UI Updates
    updateCurrentDate() {
        const date = new Date();
        document.getElementById('current-date').textContent = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    startLiveUpdates() {
        setInterval(async () => {
            try {
                await this.refreshData();
            } catch (error) {
                console.error('Live update error:', error);
            }
        }, 30000); // Update every 30 seconds
    }

    // Tab Management
    switchTab(tabId) {
        this.tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
        });
        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === tabId);
        });
    }

    // Rendering Methods
    renderMatches(matches) {
        this.matchesContainer.innerHTML = matches.map(match => this.createMatchCard(match)).join('');
    }

    renderStandings(standings) {
        this.standingsBody.innerHTML = standings.map((team, index) => this.createStandingsRow(team, index)).join('');
    }

    renderGroups(matches) {
        const groups = this.groupMatches(matches);
        this.groupsContainer.innerHTML = Object.entries(groups)
            .map(([group, matches]) => this.createGroupCard(group, matches))
            .join('');
    }

    renderTeams(teams) {
        this.teamsGrid.innerHTML = teams.map(team => this.createTeamCard(team)).join('');
    }

    // HTML Templates
    createMatchCard(match) {
        return `
            <div class="match-card">
                <div class="match-header">
                    <span>${match.group || 'Tournament Match'}</span>
                    <span class="match-status status-${match.status}">${match.status.toUpperCase()}</span>
                </div>
                <div class="match-content">
                    <div class="team">
                        <div class="team-logo">${match.team1_logo}</div>
                        <div class="team-name">${match.team1_name}</div>
                    </div>
                    <div class="score-container">
                        <span class="score">${match.score1}</span>
                        <span class="score-divider">-</span>
                        <span class="score">${match.score2}</span>
                    </div>
                    <div class="team">
                        <div class="team-logo">${match.team2_logo}</div>
                        <div class="team-name">${match.team2_name}</div>
                    </div>
                </div>
                <div class="match-footer">${this.formatMatchTime(match.match_time)}</div>
            </div>
        `;
    }

    // ... [Additional methods for creating other UI elements]

    // Utility Methods
    showToast(message, type = 'success') {
        this.toast.textContent = message;
        this.toast.className = `toast toast-${type}`;
        this.toast.style.display = 'block';
        setTimeout(() => {
            this.toast.style.display = 'none';
        }, 3000);
    }

    showLoading() {
        this.loadingOverlay.style.display = 'flex';
    }

    hideLoading() {
        this.loadingOverlay.style.display = 'none';
    }

    formatMatchTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Event Handlers
    async handleAdminLogin() {
        try {
            const username = this.adminUsername.value;
            const password = this.adminPassword.value;
            await api.login(username, password);
            this.adminLogin.style.display = 'none';
            this.adminPanel.style.display = 'block';
            this.showToast('Login successful');
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    // ... [Additional event handlers for team and match management]
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new RoboSoccerApp();
});
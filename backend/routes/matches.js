const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all matches with team details
router.get('/', async (req, res) => {
    try {
        const [matches] = await pool.query(`
            SELECT m.*, 
                   t1.name as team1_name, t1.logo as team1_logo,
                   t2.name as team2_name, t2.logo as team2_logo
            FROM matches m
            JOIN teams t1 ON m.team1_id = t1.id
            JOIN teams t2 ON m.team2_id = t2.id
            ORDER BY m.match_time
        `);
        res.json(matches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add new match (protected)
router.post('/', auth, async (req, res) => {
    try {
        const { team1_id, team2_id, match_time, group_name } = req.body;

        if (!team1_id || !team2_id || !match_time) {
            return res.status(400).json({
                error: 'Team IDs and match time are required'
            });
        }

        const [result] = await pool.query(
            'INSERT INTO matches (team1_id, team2_id, match_time, group_name) VALUES (?, ?, ?, ?)',
            [team1_id, team2_id, match_time, group_name]
        );

        res.status(201).json({
            id: result.insertId,
            team1_id,
            team2_id,
            match_time,
            group_name
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update match score (protected)
router.put('/:id/score', auth, async (req, res) => {
    try {
        const { score1, score2, status } = req.body;
        const matchId = req.params.id;

        await pool.query(
            'UPDATE matches SET score1 = ?, score2 = ?, status = ? WHERE id = ?',
            [score1, score2, status, matchId]
        );

        res.json({ message: 'Match updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get standings
router.get('/standings', async (req, res) => {
    try {
        const [standings] = await pool.query(`
            SELECT 
                t.id,
                t.name,
                t.logo,
                COUNT(m.id) as played,
                SUM(CASE 
                    WHEN (m.team1_id = t.id AND m.score1 > m.score2) OR 
                         (m.team2_id = t.id AND m.score2 > m.score1) THEN 1 
                    ELSE 0 
                END) as won,
                SUM(CASE WHEN m.score1 = m.score2 THEN 1 ELSE 0 END) as drawn,
                SUM(CASE 
                    WHEN (m.team1_id = t.id AND m.score1 < m.score2) OR 
                         (m.team2_id = t.id AND m.score2 < m.score1) THEN 1 
                    ELSE 0 
                END) as lost,
                SUM(CASE 
                    WHEN m.team1_id = t.id THEN m.score1 
                    WHEN m.team2_id = t.id THEN m.score2 
                    ELSE 0 
                END) as goals_for,
                SUM(CASE 
                    WHEN m.team1_id = t.id THEN m.score2 
                    WHEN m.team2_id = t.id THEN m.score1 
                    ELSE 0 
                END) as goals_against
            FROM teams t
            LEFT JOIN matches m ON (t.id = m.team1_id OR t.id = m.team2_id)
                AND m.status = 'completed'
            GROUP BY t.id
            ORDER BY (won * 3 + drawn) DESC, (goals_for - goals_against) DESC
        `);
        res.json(standings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
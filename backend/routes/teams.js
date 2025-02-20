const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all teams
router.get('/', async (req, res) => {
    try {
        const [teams] = await pool.query('SELECT * FROM teams ORDER BY name');
        res.json(teams);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add new team (protected)
router.post('/', auth, async (req, res) => {
    try {
        const { name, logo } = req.body;
        
        if (!name || !logo) {
            return res.status(400).json({ error: 'Name and logo are required' });
        }

        const [result] = await pool.query(
            'INSERT INTO teams (name, logo) VALUES (?, ?)',
            [name, logo]
        );

        res.status(201).json({
            id: result.insertId,
            name,
            logo
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update team (protected)
router.put('/:id', auth, async (req, res) => {
    try {
        const { name, logo } = req.body;
        const teamId = req.params.id;

        await pool.query(
            'UPDATE teams SET name = ?, logo = ? WHERE id = ?',
            [name, logo, teamId]
        );

        res.json({ id: teamId, name, logo });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete team (protected)
router.delete('/:id', auth, async (req, res) => {
    try {
        const teamId = req.params.id;

        // Check if team has matches
        const [matches] = await pool.query(
            'SELECT id FROM matches WHERE team1_id = ? OR team2_id = ?',
            [teamId, teamId]
        );

        if (matches.length > 0) {
            return res.status(400).json({
                error: 'Cannot delete team with existing matches'
            });
        }

        await pool.query('DELETE FROM teams WHERE id = ?', [teamId]);
        res.json({ message: 'Team deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
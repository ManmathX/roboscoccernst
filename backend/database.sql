-- Create the database
CREATE DATABASE IF NOT EXISTS robosoccer;
USE robosoccer;

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    logo VARCHAR(3) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    team1_id INT NOT NULL,
    team2_id INT NOT NULL,
    score1 INT DEFAULT 0,
    score2 INT DEFAULT 0,
    status ENUM('upcoming', 'live', 'completed') DEFAULT 'upcoming',
    match_time DATETIME NOT NULL,
    group_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (team1_id) REFERENCES teams(id) ON DELETE RESTRICT,
    FOREIGN KEY (team2_id) REFERENCES teams(id) ON DELETE RESTRICT
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data
-- Insert admin (password: Manmath@2006)
INSERT INTO admins (username, password) VALUES 
('Nst@2006', 'Manmath@2006');

-- Insert sample teams
INSERT INTO teams (name, logo) VALUES
('RoboWarriors', 'RW'),
('TechTitans', 'TT'),
('MechMasters', 'MM'),
('ByteBots', 'BB'),
('CircuitCrusaders', 'CC'),
('AlgoAthletes', 'AA'),
('DigitalDynamos', 'DD'),
('CodeCommandos', 'CD');

-- Insert sample matches
INSERT INTO matches (team1_id, team2_id, match_time, group_name, status, score1, score2) VALUES
(1, 2, NOW(), 'Group A', 'completed', 2, 1),
(3, 4, NOW() + INTERVAL 1 HOUR, 'Group A', 'live', 1, 1),
(5, 6, NOW() + INTERVAL 2 HOUR, 'Group B', 'upcoming', 0, 0),
(7, 8, NOW() + INTERVAL 3 HOUR, 'Group B', 'upcoming', 0, 0),
(1, 3, NOW() + INTERVAL 1 DAY, 'Group A', 'upcoming', 0, 0),
(2, 4, NOW() + INTERVAL 1 DAY + INTERVAL 2 HOUR, 'Group A', 'upcoming', 0, 0),
(5, 7, NOW() + INTERVAL 2 DAY, 'Group B', 'upcoming', 0, 0),
(6, 8, NOW() + INTERVAL 2 DAY + INTERVAL 2 HOUR, 'Group B', 'upcoming', 0, 0);

-- Create indexes for better performance
CREATE INDEX idx_matches_teams ON matches(team1_id, team2_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_time ON matches(match_time);
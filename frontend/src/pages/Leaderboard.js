import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axiosConfig';
import '../styles/LeaderBoard.css';

function Leaderboard() {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({
        key: 'score',
        direction: 'descending'
    });

    useEffect(() => {
        fetchLeaderboardData();
    }, []);

    const fetchLeaderboardData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/conversation/leaderboard');
            setLeaderboardData(Array.isArray(response.data) ? response.data : []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            setError('Failed to load leaderboard data. Please try again later.');
            setLoading(false);
        }
    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortedData = () => {
        if (!Array.isArray(leaderboardData)) return [];
        const sortableData = [...leaderboardData];
        if (sortConfig.key) {
            sortableData.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableData;
    };

    const getSortIcon = (name) => {
        if (sortConfig.key === name) {
            return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
        }
        return '';
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading leaderboard data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="leaderboard-container">
                <header className="menu">
                    <nav>
                        <Link to="/" className="menu-btn">Back to Stories</Link>
                    </nav>
                    <h1 className="title">LEADERBOARD</h1>
                </header>
                <div className="error-message">
                    <p>{error}</p>
                    <button className="menu-btn" onClick={fetchLeaderboardData}>Try Again</button>
                </div>
            </div>
        );
    }

    return (
        <div className="leaderboard-container">
            <header className="menu">
                <nav>
                    <Link to="/" className="menu-btn">Back to Stories</Link>
                </nav>
                <h1 className="title">LEADERBOARD</h1>
            </header>

            <div className="leaderboard-content">
                <table className="leaderboard-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th onClick={() => requestSort('username')}>
                                Player {getSortIcon('username')}
                            </th>
                            <th onClick={() => requestSort('score')}>
                                Score {getSortIcon('score')}
                            </th>
                            <th onClick={() => requestSort('completed_stories')}>
                                Stories Completed {getSortIcon('completed_stories')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {getSortedData().map((player, index) => (
                            <tr key={player.username || index}>
                                <td>{index + 1}</td>
                                <td>{player.username}</td>
                                <td>{player.score}</td>
                                <td>{player.completed_stories || 0}</td>
                            </tr>
                        ))}
                        {leaderboardData.length === 0 && (
                            <tr>
                                <td colSpan="4" className="no-data">No leaderboard data available yet</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Leaderboard;
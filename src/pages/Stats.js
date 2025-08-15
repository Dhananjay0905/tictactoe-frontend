import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Stats.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to view stats.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/game/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStats(response.data);
      } catch (err) {
        setError("Could not fetch stats.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="stats-container">Loading stats...</div>;
  }

  if (error) {
    return <div className="stats-container error-message">{error}</div>;
  }

  return (
    <div className="stats-container">
      <h2>{stats.name}'s Stats</h2>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">Username</span>
          <span className="stat-value username-value">{stats.username}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Games Played</span>
          <span className="stat-value">{stats.gamesPlayed}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Wins</span>
          <span className="stat-value green">{stats.wins}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Losses</span>
          <span className="stat-value red">{stats.losses}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Draws</span>
          <span className="stat-value">{stats.draws}</span>
        </div>
      </div>
    </div>
  );
}

export default Stats;

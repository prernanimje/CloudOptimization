/**
 * Info Cards Component - Region, Cost, Status
 */

import React from 'react';
import '../styles/InfoCardsStyle.css';

export const InfoCards = ({
  region = 'us-east-1',
  monthlyCost = 0,
  status = 'healthy',
  cpuUsage = 0,
  ramUsage = 0,
  storageUsage = 0,
}) => {
  // Determine status color
  const getStatusColorClass = (st) => {
    switch (st) {
      case 'critical':
        return 'status-text-critical';
      case 'warning':
        return 'status-text-warning';
      case 'healthy':
      default:
        return 'status-text-healthy';
    }
  };

  const getStatusIcon = (st) => {
    switch (st) {
      case 'critical':
        return '🚨';
      case 'warning':
        return '⚠️';
      default:
        return '✓';
    }
  };

  // Determine region emoji
  const getRegionEmoji = (reg) => {
    if (reg.startsWith('us')) return '🇺🇸';
    if (reg.startsWith('eu')) return '🇪🇺';
    if (reg.startsWith('ap')) return '🌏';
    if (reg.startsWith('ca')) return '🇨🇦';
    if (reg.startsWith('sa')) return '🇧🇷';
    return '🌍';
  };

  return (
    <div className="stats-grid">
      {/* Region Card */}
      <div className="stat-card stat-card-blue">
        <div className="stat-card-header">
          <span className="stat-card-label">REGION</span>
          <span className="stat-card-icon">{getRegionEmoji(region)}</span>
        </div>
        <div className="stat-card-value">{region}</div>
        <div className="stat-card-subtext">AWS Cloud Location</div>
      </div>

      {/* Monthly Cost Card */}
      <div className="stat-card stat-card-green">
        <div className="stat-card-header">
          <span className="stat-card-label">MONTHLY COST</span>
          <span className="stat-card-icon">💰</span>
        </div>
        <div className="stat-card-value">${monthlyCost.toFixed(2)}</div>
        <div className="stat-card-subtext">${(monthlyCost / 30).toFixed(2)}/day average</div>
      </div>

      {/* Quick Metrics Card */}
      <div className="stat-card stat-card-yellow">
        <div className="stat-card-header">
          <span className="stat-card-label">AVG CPU USAGE</span>
          <span className="stat-card-icon">📊</span>
        </div>
        <div className="stat-card-value">{cpuUsage.toFixed(0)}%</div>
        <div className="stat-card-subtext">Active resource load</div>
      </div>

      {/* Status Card */}
      <div className="stat-card stat-card-purple">
        <div className="stat-card-header">
          <span className="stat-card-label">SERVER HEALTH</span>
          <span className="stat-card-icon">{getStatusIcon(status)}</span>
        </div>
        <div className={`stat-card-value capitalize ${getStatusColorClass(status)}`}>
          {status}
        </div>
        <div className="stat-card-subtext">Current status indicator</div>
      </div>
    </div>
  );
};

export default InfoCards;

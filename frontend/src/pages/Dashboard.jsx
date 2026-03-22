import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

import InfoCards from '../components/InfoCards';
import CPUChart from '../components/CPUChart';
import RAMChart from '../components/RAMChart';
import StorageChart from '../components/StorageChart';
import UptimeVisualization from '../components/UptimeChart';
import RecommendationsCard from '../components/RecommendationsCard';
import CostBreakdownPieChart from '../components/CostBreakdownPieChart';
import ActiveAlerts from '../components/ActiveAlerts';

import { analysisAPI, metricsAPI, healthAPI } from '../api';
import '../styles/DashboardStyle.css';

// Animation variants for premium feel
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Consistent stagger timing
      delayChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.2, // Slower, more graceful entry as requested
      ease: [0.25, 1, 0.5, 1] // Very smooth curve
    }
  }
};

export const Dashboard = ({ instances, selectedInstance, setSelectedInstance, refreshInstances }) => {
  const [analysis, setAnalysis] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data when instance is selected
  useEffect(() => {
    if (selectedInstance) {
      loadInstanceData();
    }
  }, [selectedInstance]);

  // Real-time Dashboard Polling
  useEffect(() => {
    if (!selectedInstance) return;
    const interval = setInterval(() => {
      loadInstanceData(true);
      // We also update instances array so cost updates show in ServerSelector in App header
      if (refreshInstances) {
        refreshInstances(true);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [selectedInstance, refreshInstances]);

  const loadInstanceData = async (silent = false) => {
    if (!selectedInstance) return;

    try {
      if (!silent) setLoading(true);

      // Stage data loading so charts and key cards can render as soon as possible
      const metricsPromise = metricsAPI.getMetrics(selectedInstance.id, 100);
      const alertsPromise = healthAPI.getInstanceAlerts(selectedInstance.id);
      const analysisPromise = analysisAPI.analyzeInstance(selectedInstance.id);

      // Wait only for metrics + alerts before marking the dashboard as "loaded"
      const [metricsResponse, alertsResponse] = await Promise.all([
        metricsPromise,
        alertsPromise,
      ]);

      setMetrics(metricsResponse);
      setAlerts(alertsResponse);

      // Let analysis resolve in the background so cost/AI sections fill in when ready
      analysisPromise
        .then((analysisResponse) => {
          setAnalysis(analysisResponse);
        })
        .catch((err) => {
          console.error('Failed to load analysis data:', err);
        });

      // Fire-and-forget health check; no need to block the UI
      healthAPI.checkInstanceHealth(selectedInstance.id).catch(() => { });
    } catch (err) {
      console.error('Failed to load instance data:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  if (loading && !selectedInstance) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#a1a1aa' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="dashboard-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Error Message */}
      {error && (
        <motion.div
          variants={cardVariants}
          style={{ padding: '16px', background: 'rgba(220, 38, 38, 0.1)', border: '1px solid #dc2626', color: '#fca5a5', borderRadius: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <AlertCircle />
          <span>{error}</span>
        </motion.div>
      )}

      {selectedInstance && (
        <>
          {/* Main Content Layout Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px', marginBottom: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 13fr) minmax(0, 3fr)', gap: '32px' }}>

              {/* Left Column: CPU, RAM, Cost */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
                <motion.div className="dark-card" variants={cardVariants} style={{ padding: '24px' }}>
                  <h3 className="section-title" style={{ marginTop: 0, marginBottom: '24px' }}>System Performance</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="monitor-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f3ff', boxShadow: '0 0 5px #00f3ff' }}></div>
                        <h4 style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>CPU MONITOR</h4>
                      </div>
                      <CPUChart data={metrics} loading={loading} />
                    </div>

                    <div className="monitor-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff00f3', boxShadow: '0 0 5px #ff00f3' }}></div>
                        <h4 style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>RAM MONITOR</h4>
                      </div>
                      <RAMChart data={metrics} loading={loading} />
                    </div>
                  </div>
                </motion.div>

                {/* Cost Analysis */}
                {analysis && (
                  <motion.div className="dark-card" variants={cardVariants}>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px' }}>Cost Analysis & Insights</h4>
                    <div className="cost-grid">
                      <div className="cost-card cost-card-blue">
                        <div className="cost-card-info">
                          <span className="cost-label" style={{ marginBottom: 0 }}>Monthly Cost</span>
                          <span className="cost-subtext" style={{ marginTop: '2px' }}>Current run rate</span>
                        </div>
                        <span className="cost-value-blue">${selectedInstance.monthly_cost.toFixed(2)}</span>
                      </div>
                      <div className="cost-card cost-card-orange">
                        <div className="cost-card-info">
                          <span className="cost-label" style={{ marginBottom: 0 }}>Wasted Resources</span>
                          <span className="cost-subtext" style={{ marginTop: '2px' }}>${analysis.monthly_waste.toFixed(2)} / month</span>
                        </div>
                        <span className="cost-value-orange">{analysis.waste_percentage.toFixed(1)}%</span>
                      </div>
                      <div className="cost-card cost-card-green">
                        <div className="cost-card-info">
                          <span className="cost-label" style={{ marginBottom: 0 }}>Potential Savings</span>
                          <span className="cost-subtext" style={{ marginTop: '2px' }}>Estimated per month</span>
                        </div>
                        <span className="cost-value-green">${analysis.recommendations.reduce((sum, r) => sum + r.savings, 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* System Health Alerts */}
                <motion.div variants={cardVariants} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <ActiveAlerts alerts={alerts} />
                </motion.div>
              </div>

              {/* Right Column: Quick Stats */}
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '24px' }}>
                <motion.div variants={cardVariants} style={{ flex: 'none' }}>
                  <InfoCards
                    region={selectedInstance.region}
                    monthlyCost={selectedInstance.monthly_cost}
                    status={selectedInstance.status}
                    cpuUsage={selectedInstance.cpu_usage}
                    ramUsage={selectedInstance.ram_usage}
                    storageUsage={selectedInstance.storage_usage}
                  />
                </motion.div>
                <motion.div className="dark-card" variants={cardVariants} style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column' }}>
                  <h3 className="section-title" style={{ marginTop: 0, marginBottom: '8px', fontSize: '1.1rem' }}>Cost Breakdown Distribution</h3>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CostBreakdownPieChart
                      monthlyCost={selectedInstance.monthly_cost}
                      cpuUsage={selectedInstance.cpu_usage}
                      ramUsage={selectedInstance.ram_usage}
                      storageUsage={selectedInstance.storage_usage}
                    />
                  </div>
                </motion.div>
              </div>

            </div>
          </div>

          {/* Storage and Uptime Full Width Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
            <motion.div className="dark-card" variants={cardVariants}>
              <StorageChart
                storageUsage={selectedInstance.storage_usage}
                storageCapacity={selectedInstance.storage_capacity}
              />
            </motion.div>
            <motion.div className="dark-card" variants={cardVariants}>
              <UptimeVisualization
                uptimeHours={selectedInstance.uptime_hours}
                downtimeHours={selectedInstance.downtime_hours}
                status={selectedInstance.status}
              />
            </motion.div>
          </div>

          <motion.div className="dark-card" variants={cardVariants}>
            <RecommendationsCard instance={selectedInstance} analysis={analysis} loading={loading} />
          </motion.div>

        </>
      )}
    </motion.div>
  );
};

export default Dashboard;

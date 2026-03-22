import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, CloudRain, BarChart3, Zap, ShieldCheck, Moon, Sun, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Auth from './Auth';
import '../App.css';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [hasTriggeredAuth, setHasTriggeredAuth] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Apply theme globally, dark by default
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Framer Motion animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } },
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  const floatingAnimation = {
    initial: { y: 0 },
    animate: { y: [-10, 10, -10], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } },
  };

  // Auto-scroll through sections once on first visit, then reveal auth after 4 sec on last page
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll('.lp-section'));
    if (!sections.length) return;

    let index = 0;
    let timeoutId = null;
    const interval = setInterval(() => {
      index += 1;
      if (index < sections.length) {
        sections[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        clearInterval(interval);
        // Wait 3 seconds on last page before showing auth overlay
        timeoutId = setTimeout(() => {
          setShowAuthOverlay(true);
          setHasTriggeredAuth(true);
        }, 3000);
      }
    }, 2200);

    return () => {
      clearInterval(interval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Also trigger auth overlay when user manually scrolls to the bottom
  useEffect(() => {
    let timeoutId = null;

    const onScroll = () => {
      if (hasTriggeredAuth || showAuthOverlay) return;
      const scrollPos = window.innerHeight + window.scrollY;
      const docHeight = document.body.offsetHeight;
      if (scrollPos >= docHeight - 50) {
        // Wait 3 seconds on last page before showing auth overlay
        timeoutId = setTimeout(() => {
          setShowAuthOverlay(true);
          setHasTriggeredAuth(true);
        }, 3000);
        window.removeEventListener('scroll', onScroll);
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [hasTriggeredAuth, showAuthOverlay]);

  return (
    <div className={`landing-root ${showAuthOverlay ? 'landing-root--blurred' : ''}`}>
      {/* 3D animated background grid */}
      <div className="landing-3d-background">
        <div className="grid-plane" />
      </div>

      {/* Foreground orbiting objects that move above content */}
      <div className="landing-orbit-layer">
        <div className="orbit-orb orbit-orb--cpu" />
        <div className="orbit-orb orbit-orb--cost" />
        <div className="orbit-orb orbit-orb--uptime" />
      </div>

      {/* Top nav with theme toggle */}
      <header className="landing-header">
        <div className="landing-logo">
          <div className="landing-logo-icon">☁️</div>
          <div className="landing-logo-text">
            <span className="landing-logo-title">Picasso</span>
            <span className="landing-logo-subtitle">Cloud Cost Optimization Studio</span>
          </div>
        </div>

        <div className="landing-header-actions">
          <button
            type="button"
            className="landing-ghost-button"
            onClick={() => {
              setAuthMode('login');
              setShowAuthOverlay(true);
            }}
          >
            Log in
          </button>
          <button
            type="button"
            className="lp-secondary-button hidden-mobile"
            onClick={() => {
              setAuthMode('signup');
              setShowAuthOverlay(true);
            }}
          >
            Sign up
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title="Toggle Light/Dark Mode"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      {/* Scrollable sections */}
      <main className="landing-scroll-container">
        {/* Page 1 – Hero */}
        <section className="lp-section lp-section--hero">
          <div className="lp-content">
            <div className="lp-hero-copy">
              <motion.h1
                className="lp-hero-title"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, margin: '-100px' }}
              >
                Real‑time <span className="accent">Cloud Cost</span> intelligence for every instance.
              </motion.h1>
              <motion.p
                className="lp-hero-subtitle"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                transition={{ delay: 0.2 }}
                viewport={{ once: false, margin: '-100px' }}
              >
                Picasso watches CPU, RAM, storage and uptime in real time, then turns raw telemetry
                into AI‑ready savings recommendations you can actually act on.
              </motion.p>
              <motion.div
                className="lp-hero-cta-row"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                transition={{ delay: 0.4 }}
                viewport={{ once: false, margin: '-100px' }}
              >
                <button
                  type="button"
                  className="lp-primary-button"
                  onClick={() => {
                    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
                  }}
                >
                  Explore live insights
                </button>
                <button
                  type="button"
                  className="lp-secondary-button"
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthOverlay(true);
                  }}
                >
                  Log in now
                </button>
              </motion.div>
              <motion.div
                className="lp-hero-metrics"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                transition={{ delay: 0.6 }}
                viewport={{ once: false, margin: '-100px' }}
              >
                <div className="lp-metric-chip">
                  <BarChart3 size={16} />
                  <span>Up to 35% infra savings</span>
                </div>
                <div className="lp-metric-chip">
                  <Zap size={16} />
                  <span>Neuro‑driven AI recommendations</span>
                </div>
                <div className="lp-metric-chip">
                  <CloudRain size={16} />
                  <span>AWS regions, instances and alerts</span>
                </div>
              </motion.div>
            </div>

            {/* Movable, project-based tiles */}
            <motion.div
              className="lp-hero-tiles"
              variants={fadeInRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: '-100px' }}
            >
              <motion.div
                className="lp-tile lp-tile--cpu"
                variants={scaleIn}
                whileHover={{ scale: 1.08, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <span className="lp-tile-label">CPU MONITOR</span>
                <span className="lp-tile-value">63%</span>
                <span className="lp-tile-subtext">Average across active instances</span>
              </motion.div>
              <motion.div
                className="lp-tile lp-tile--cost"
                variants={scaleIn}
                style={{ transitionDelay: '0.1s' }}
                whileHover={{ scale: 1.08, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <span className="lp-tile-label">Monthly spend</span>
                <span className="lp-tile-value">$4,320</span>
                <span className="lp-tile-subtext accent">≈ $1,520 potential savings</span>
              </motion.div>
              <motion.div
                className="lp-tile lp-tile--uptime"
                variants={scaleIn}
                style={{ transitionDelay: '0.2s' }}
                whileHover={{ scale: 1.08, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <span className="lp-tile-label">SLA uptime</span>
                <span className="lp-tile-value">99.95%</span>

                <span className="lp-tile-subtext">Backed by live incident alerts</span>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Page 2 – How it works */}
        <section className="lp-section lp-section--how">
          <div className="lp-content lp-two-column">
            <div className="lp-column">
              <motion.h2
                className="lp-section-title"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, margin: '-100px' }}
              >
                From CSV upload to live FinOps in minutes.
              </motion.h2>
              <motion.p
                className="lp-section-description"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, margin: '-100px' }}
                transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
              >
                Upload your server CSV once, then let Picasso continuously ingest metrics, analyse
                cost patterns and surface optimization levers at every layer of your stack.
              </motion.p>
              <motion.ul
                className="lp-feature-list"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, margin: '-100px' }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.15,
                      delayChildren: 0.3,
                    },
                  },
                }}
              >
                <motion.li
                  variants={fadeInUp}
                >
                  <span className="lp-feature-bullet" />
                  <div>
                    <div className="lp-feature-title">Smart ingest pipeline</div>
                    <div className="lp-feature-text">
                      Cleaned and validated instance data becomes the backbone for your dashboards,
                      recommendations and alerts.
                    </div>
                  </div>
                </motion.li>
                <motion.li
                  variants={fadeInUp}
                >
                  <span className="lp-feature-bullet" />
                  <div>
                    <div className="lp-feature-title">Neuro‑driven recommendations</div>
                    <div className="lp-feature-text">
                      Google Gemini turns your real metrics into three precise, prioritized actions
                      per instance.
                    </div>
                  </div>
                </motion.li>
                <motion.li
                  variants={fadeInUp}
                >
                  <span className="lp-feature-bullet" />
                  <div>
                    <div className="lp-feature-title">Always‑on health monitoring</div>
                    <div className="lp-feature-text">
                      Uptime, downtime and alerting pipelines map straight into the live dashboard.
                    </div>
                  </div>
                </motion.li>
              </motion.ul>
            </div>

            {/* 3D card stack showing project components */}
            <motion.div
              className="lp-column lp-stack-visual"
              variants={fadeInRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: '-100px' }}
            >
              <motion.div
                className="lp-stack-card lp-stack-card--front"
                whileHover={{ y: -15, rotateZ: 2 }}
                transition={{ duration: 0.3 }}
              >
                <div className="lp-stack-header">
                  <span>Instance insight</span>
                  <ShieldCheck size={16} />
                </div>
                <div className="lp-stack-body">
                  <div className="lp-stack-row">
                    <span>Instance</span>
                    <span className="accent">web‑server‑01</span>
                  </div>
                  <div className="lp-stack-row">
                    <span>Cost</span>
                    <span>$172.40 / mo</span>
                  </div>
                  <div className="lp-stack-row">
                    <span>Waste</span>
                    <span className="accent">28.6% under‑utilized</span>
                  </div>
                  <div className="lp-stack-row">
                    <span>AI action</span>
                    <span>Right‑size to t3.medium &amp; auto‑suspend at 1am–5am.</span>
                  </div>
                </div>
              </motion.div>
              <div className="lp-stack-card lp-stack-card--mid" />
              <div className="lp-stack-card lp-stack-card--back" />
            </motion.div>
          </div>
        </section>

        {/* Page 2.5 – Impact & Results */}
        <section className="lp-section lp-section--impact">
          <div className="lp-content">
            <motion.div
              style={{ textAlign: 'center', marginBottom: '60px' }}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: '-100px' }}
            >
              <h2 className="lp-section-title">Real Results, Real Savings</h2>
              <p className="lp-section-description" style={{ maxWidth: '600px', margin: '0 auto' }}>
                See how Picasso transforms raw infrastructure data into actionable cost optimization strategies.
              </p>
            </motion.div>

            <motion.div
              className="lp-impact-grid"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: '-100px' }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.15,
                    delayChildren: 0.2,
                  },
                },
              }}
            >
              <motion.div
                className="lp-impact-card"
                variants={scaleIn}
                whileHover={{ y: -10 }}
              >
                <div className="lp-impact-icon">📊</div>
                <h3 className="lp-impact-title">Real-time Analytics</h3>
                <p className="lp-impact-text">
                  Monitor CPU, memory, storage and uptime across all instances with live, interactive dashboards built for operations teams.
                </p>
              </motion.div>

              <motion.div
                className="lp-impact-card"
                variants={scaleIn}
                whileHover={{ y: -10 }}
              >
                <div className="lp-impact-icon">🤖</div>
                <h3 className="lp-impact-title">AI-Powered Insights</h3>
                <p className="lp-impact-text">
                  Google Gemini-powered engine analyzes patterns and generates precise, prioritized recommendations for every instance.
                </p>
              </motion.div>

              <motion.div
                className="lp-impact-card"
                variants={scaleIn}
                whileHover={{ y: -10 }}
              >
                <div className="lp-impact-icon">💰</div>
                <h3 className="lp-impact-title">Cost Optimization</h3>
                <p className="lp-impact-text">
                  Identify waste and underutilization. Right-size instances and receive predictive savings estimates—up to 35% monthly reduction.
                </p>
              </motion.div>

              <motion.div
                className="lp-impact-card"
                variants={scaleIn}
                whileHover={{ y: -10 }}
              >
                <div className="lp-impact-icon">🚀</div>
                <h3 className="lp-impact-title">Instant Deployment</h3>
                <p className="lp-impact-text">
                  Upload your server CSV, authenticate instantly, and start receiving optimization insights within minutes. No setup needed.
                </p>
              </motion.div>

              <motion.div
                className="lp-impact-card"
                variants={scaleIn}
                whileHover={{ y: -10 }}
              >
                <div className="lp-impact-icon">⚡</div>
                <h3 className="lp-impact-title">Automated Alerts</h3>
                <p className="lp-impact-text">
                  Stay ahead of issues with real-time uptime monitoring, SLA tracking, and incident alerts integrated into one unified platform.
                </p>
              </motion.div>

              <motion.div
                className="lp-impact-card"
                variants={scaleIn}
                whileHover={{ y: -10 }}
              >
                <div className="lp-impact-icon">🔒</div>
                <h3 className="lp-impact-title">Enterprise Grade</h3>
                <p className="lp-impact-text">
                  Secure authentication, detailed audit trails, and trustworthy data handling for your critical infrastructure insights.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Page 3 – Call to action */}
        <section className="lp-section lp-section--cta">
          <div className="lp-content lp-two-column">
            <div className="lp-column">
              <motion.h2
                className="lp-section-title"
                variants={fadeInLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, margin: '-100px' }}
              >
                Ready to turn metrics into money saved?
              </motion.h2>
              <motion.p
                className="lp-section-description"
                variants={fadeInLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, margin: '-100px' }}
                transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
              >
                Create an account, connect your instances and let Picasso keep watch over cost,
                performance and reliability — 24/7.
              </motion.p>
              <motion.div
                className="lp-cta-badges"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, margin: '-100px' }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.12,
                      delayChildren: 0.3,
                    },
                  },
                }}
              >
                <motion.div
                  className="lp-cta-badge"
                  variants={scaleIn}
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="lp-cta-badge-label">Full telemetry</span>
                  <span className="lp-cta-badge-value">CPU · RAM · Storage · Uptime</span>
                </motion.div>
                <motion.div
                  className="lp-cta-badge"
                  variants={scaleIn}
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="lp-cta-badge-label">AI layer</span>
                  <span className="lp-cta-badge-value">Gemini‑powered recommendations</span>
                </motion.div>
                <motion.div
                  className="lp-cta-badge"
                  variants={scaleIn}
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="lp-cta-badge-label">Ops‑ready</span>
                  <span className="lp-cta-badge-value">Health alerts &amp; SLA tracking</span>
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              className="lp-column lp-column--cta"
              variants={fadeInRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: '-100px' }}
            >
              <motion.div
                className="lp-cta-panel"
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="lp-cta-panel-title">Scroll to the end to authenticate</h3>
                <p className="lp-cta-panel-text">
                  As soon as this section reaches the bottom of the viewport, your sign‑in panel
                  will appear on top of the blurred landing page.
                </p>
                <button
                  type="button"
                  className="lp-primary-button lp-primary-button--wide"
                  onClick={() => setShowAuthOverlay(true)}
                >
                  Fast‑forward to authentication
                </button>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Authentication overlay over blurred landing page */}
      {showAuthOverlay && (
        <div
          className="landing-auth-overlay"
          onClick={() => setShowAuthOverlay(false)}
        >
          <div
            className="landing-auth-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '450px', width: '100%' }}
          >
            <Auth initialMode={authMode} />
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;


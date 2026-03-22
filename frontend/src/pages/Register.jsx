import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle } from 'lucide-react';
import '../styles/AppLayout.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await register(email, username, password);
            navigate('/app/upload');
        } catch (err) {
            const errorMsg = err.response?.data?.detail || err.message || 'Failed to create account';
            setError(`Error: ${errorMsg}`);
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-app)' }}>
            <div className="dark-card" style={{ maxWidth: '400px', width: '100%', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
                    <div className="sidebar-logo-icon" style={{ width: '48px', height: '48px', fontSize: '24px', marginBottom: '16px' }}>
                        <span>☁️</span>
                    </div>
                    <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.8rem', fontWeight: 600 }}>Create Account</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Sign up to access Picasso</p>
                </div>

                {error && (
                    <div style={{ padding: '12px', background: 'rgba(220, 38, 38, 0.1)', border: '1px solid #dc2626', color: '#fca5a5', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none' }}
                            placeholder="Enter your email"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Username</label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none' }}
                            placeholder="Choose a username"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none' }}
                            placeholder="Create a password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '10px', width: '100%', padding: '14px', borderRadius: '8px', border: 'none',
                            background: 'linear-gradient(90deg, #10b981 0%, #3b82f6 100%)', color: 'white',
                            fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                    >
                        <UserPlus size={20} />
                        {loading ? 'Creating...' : 'Sign Up'}
                    </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Already have an account? <Link to="/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>Log in</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;

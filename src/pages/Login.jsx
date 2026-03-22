import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import './Login.css';

export default function Login() {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await api.login({ email: credentials.email, password: credentials.password });
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate(redirectTo);
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setError('');
        alert('Google sign-in is disabled in this build.');
    };

    return (
        <div className="login-page animate-fade-in">
            <div className="login-container glass-panel">
                <h2 className="login-title">Welcome Back</h2>
                <p className="login-subtitle">Sign in to book your favorite movies</p>

                {error && (
                    <div className="error-banner">
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <Mail className="input-icon" size={20} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            required
                            value={credentials.email}
                            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                        />
                    </div>

                    <div className="input-group">
                        <Lock className="input-icon" size={20} />
                        <input
                            type="password"
                            placeholder="Password"
                            required
                            value={credentials.password}
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        />
                    </div>

                    <div className="form-options">
                        <label className="remember-me">
                            <input type="checkbox" /> Remember me
                        </label>
                        <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>
                    </div>

                    <button type="submit" className="btn-primary w-100" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="divider">
                    <span>or continue with</span>
                </div>

                <div className="social-login">
                    <button
                        className="social-btn google-btn"
                        onClick={handleGoogle}
                    >
                        <img
                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                            alt="Google"
                            width={20}
                            height={20}
                        />
                        Google
                    </button>
                </div>

                <p className="signup-prompt">
                    Don't have an account? <Link to="/signup">Sign up now</Link>
                </p>
            </div>
        </div>
    );
}

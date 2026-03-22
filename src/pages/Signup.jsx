import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import './Signup.css';

export default function Signup() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const data = await api.signup({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/');
            } else {
                setError(data.message || 'Signup failed');
            }
        } catch (err) {
            setError(err.message || 'Something went wrong during signup');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = () => {
        alert('Google signup is disabled in this build.');
    };

    return (
        <div className="signup-page animate-fade-in">
            <div className="login-container glass-panel">
                <h2 className="login-title">Join ShowTime</h2>
                <p className="login-subtitle">Create an account to start booking movies</p>

                {error && (
                    <div className="error-banner">
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                {/* Social Signup First (Prominent) */}
                <div className="social-login">
                    <button className="social-btn google-btn" onClick={handleGoogleSignup}>
                        <img
                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                            alt="Google"
                            width={20}
                            height={20}
                        />
                        Continue with Google
                    </button>
                </div>

                <div className="divider">
                    <span>or sign up with email</span>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <User className="input-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Full Name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="input-group">
                        <Mail className="input-icon" size={20} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="input-group">
                        <Lock className="input-icon" size={20} />
                        <input
                            type="password"
                            placeholder="Password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <div className="input-group">
                        <Lock className="input-icon" size={20} />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            required
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="btn-primary w-100" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p className="signup-prompt">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>


        </div>
    );
}

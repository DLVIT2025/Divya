import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import './AdminLogin.css';

export default function AdminLogin() {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Secure Admin Passcode
        if (pin === 'Admin@2026') {
            sessionStorage.setItem('isAdmin', 'true');
            navigate('/admin/dashboard');
        } else {
            setError('Invalid access credentials');
        }
    };

    return (
        <div className="admin-login-page animate-fade-in">
            <div className="login-container glass-panel admin-panel">
                <div className="admin-icon-wrapper">
                    <Lock size={40} className="admin-icon" />
                </div>
                <h2 className="login-title">Control Center</h2>
                <p className="login-subtitle">Secure access for system administrators</p>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-group">
                        <Lock className="input-icon" size={20} />
                        <input
                            type="password"
                            placeholder="Enter Administrator Passcode"
                            value={pin}
                            onChange={(e) => { setPin(e.target.value); setError(''); }}
                            required
                        />
                    </div>

                    {error && <p className="error-text">{error}</p>}

                    <button type="submit" className="btn-primary w-100" style={{ background: 'linear-gradient(45deg, #8a2be2, #4b0082)' }}>
                        Unlock Access
                    </button>
                </form>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const [step, setStep] = useState('email'); // 'email' | 'reset' | 'success'
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await api.forgotPassword(email);
      if (result.resetToken) {
        setResetToken(result.resetToken);
        setStep('reset');
        setSuccessMsg('Password reset link generated. Check your email or use the token below.');
      } else {
        setSuccessMsg(result.message || 'If that email is registered, you will receive a reset link.');
        setTimeout(() => setStep('reset'), 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const result = await api.resetPassword(resetToken, newPassword);
      if (result.message) {
        setStep('success');
        setSuccessMsg('Password reset successfully!');
      } else {
        setError(result.message || 'Failed to reset password');
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page animate-fade-in">
      <div className="forgot-password-container glass-panel">
        <button className="back-btn" onClick={() => navigate('/login')}>
          <ArrowLeft size={20} /> Back to Login
        </button>

        {/* Step: Email */}
        {step === 'email' && (
          <>
            <h2 className="page-title">Forgot Password?</h2>
            <p className="page-subtitle">Enter your email and we'll send you a link to reset your password</p>

            {error && (
              <div className="error-banner">
                <AlertCircle size={18} /> {error}
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="form">
              <div className="input-group">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary w-100" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <p className="help-text">
              Remember your password? <Link to="/login">Sign in here</Link>
            </p>
          </>
        )}

        {/* Step: Reset Password */}
        {step === 'reset' && (
          <>
            <h2 className="page-title">Reset Your Password</h2>
            <p className="page-subtitle">Enter your new password</p>

            {successMsg && (
              <div className="success-banner">
                <CheckCircle size={18} /> {successMsg}
              </div>
            )}

            {error && (
              <div className="error-banner">
                <AlertCircle size={18} /> {error}
              </div>
            )}

            <form onSubmit={handleResetSubmit} className="form">
              {resetToken && (
                <div className="token-display">
                  <label>Reset Token (for reference):</label>
                  <code>{resetToken}</code>
                </div>
              )}

              <div className="input-group">
                <input
                  type="password"
                  placeholder="New Password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="input-group">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary w-100" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="success-container">
            <div className="success-icon">
              <CheckCircle size={64} />
            </div>
            <h2>Password Reset Successful!</h2>
            <p>Your password has been updated successfully.</p>
            <button className="btn-primary" onClick={() => navigate('/login')}>
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

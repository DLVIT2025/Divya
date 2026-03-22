import { useState } from 'react';
import { X } from 'lucide-react';
import './SocialLoginPopup.css';

// Mock user profiles that appear in the Google/Facebook chooser
const MOCK_GOOGLE_ACCOUNTS = [
  { name: 'Demo User', email: 'demo@gmail.com', avatar: 'D' },
  { name: 'Test Account', email: 'test@gmail.com', avatar: 'T' },
];

const MOCK_FACEBOOK_ACCOUNTS = [
  { name: 'Facebook User', email: 'fbuser@facebook.com', avatar: 'F' },
  { name: 'Movie Lover', email: 'movielover@fb.com', avatar: 'M' },
];

export default function SocialLoginPopup({ provider, onSuccess, onClose }) {
  const [step, setStep] = useState('choose'); // 'choose' | 'loading' | 'done'
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const isGoogle = provider === 'Google';
  const accounts = isGoogle ? MOCK_GOOGLE_ACCOUNTS : MOCK_FACEBOOK_ACCOUNTS;
  const brandColor = isGoogle ? '#4285F4' : '#1877F2';
  const brandBg = isGoogle ? '#fff' : brandColor;
  const brandTextColor = isGoogle ? '#202124' : '#fff';
  const logo = isGoogle
    ? 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg'
    : 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg';

  const handleAccountSelect = async (name, email) => {
    setStep('loading');
    try {
      const data = await api.socialLogin({ name, email, provider });
      if (data.user) {
        setStep('done');
        setTimeout(() => {
          localStorage.setItem('user', JSON.stringify(data.user));
          onSuccess(data.user);
        }, 800);
      }
    } catch (err) {
      alert('Social login failed. Please try again.');
      setStep('choose');
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customName && customEmail) {
      handleAccountSelect(customName, customEmail);
    }
  };

  return (
    <div className="social-popup-overlay animate-fade-in" onClick={onClose}>
      <div
        className={`social-popup-window ${isGoogle ? 'google-theme' : 'facebook-theme'} animate-slide-up`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="popup-header" style={{ borderBottom: `3px solid ${brandColor}` }}>
          <img src={logo} alt={provider} className="popup-logo" />
          <div>
            <h2 className="popup-title" style={{ color: brandColor }}>Sign in with {provider}</h2>
            <p className="popup-subtitle">Choose an account to continue to ShowTime</p>
          </div>
          <button className="popup-close" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Body */}
        <div className="popup-body">
          {step === 'loading' && (
            <div className="popup-loading">
              <div className="loading-spinner" style={{ borderTopColor: brandColor }}></div>
              <p>Signing you in with {provider}...</p>
            </div>
          )}

          {step === 'done' && (
            <div className="popup-loading">
              <div className="popup-success">✓</div>
              <p>Signed in! Redirecting...</p>
            </div>
          )}

          {step === 'choose' && !showCustom && (
            <>
              <p className="account-chooser-label">Choose an account</p>
              {accounts.map((acc, i) => (
                <button
                  key={i}
                  className="account-item"
                  onClick={() => handleAccountSelect(acc.name, acc.email)}
                >
                  <div className="account-avatar" style={{ background: brandColor }}>
                    {acc.avatar}
                  </div>
                  <div className="account-info">
                    <strong>{acc.name}</strong>
                    <span>{acc.email}</span>
                  </div>
                </button>
              ))}
              <button className="account-item use-another" onClick={() => setShowCustom(true)}>
                <div className="account-avatar" style={{ background: '#555' }}>+</div>
                <div className="account-info">
                  <strong>Use another account</strong>
                  <span>Sign in with a different email</span>
                </div>
              </button>
            </>
          )}

          {step === 'choose' && showCustom && (
            <form className="custom-account-form" onSubmit={handleCustomSubmit}>
              <p className="account-chooser-label">Enter your {provider} account</p>
              <input
                type="text"
                placeholder="Your Name"
                required
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                autoFocus
              />
              <input
                type="email"
                placeholder="Email Address"
                required
                value={customEmail}
                onChange={e => setCustomEmail(e.target.value)}
              />
              <button
                type="submit"
                className="popup-signin-btn"
                style={{ background: brandColor, color: isGoogle ? '#fff' : '#fff' }}
              >
                Continue
              </button>
              <button type="button" className="popup-back-btn" onClick={() => setShowCustom(false)}>
                ← Back
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="popup-footer">
          {isGoogle ? (
            <p>By continuing, you agree to Google's <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></p>
          ) : (
            <p>By continuing, you agree to Facebook's <a href="#">Terms</a>, <a href="#">Privacy Policy</a> and <a href="#">Cookies Policy</a></p>
          )}
        </div>
      </div>
    </div>
  );
}

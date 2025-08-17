import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface TwoFactorAuthProps {
  onSuccess: () => void;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ onSuccess }) => {
  const [step, setStep] = useState<'enable' | 'verify'>('enable');
  const [secret, setSecret] = useState('');
  const [otpAuthUrl, setOtpAuthUrl] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { enable2FA, verify2FA } = useAuth();

  const handleEnable2FA = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await enable2FA();
      setSecret(response.secret);
      setOtpAuthUrl(response.otpAuthUrl);
      setStep('verify');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to enable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await verify2FA(verificationToken);
      onSuccess();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'enable') {
    return (
      <div className="two-factor-auth">
        <h3>Enable Two-Factor Authentication</h3>
        <p>
          Two-factor authentication adds an extra layer of security to your account.
          You'll need an authenticator app like Google Authenticator or Authy.
        </p>
        
        {error && <div className="error-message">{error}</div>}
        
        <button 
          onClick={handleEnable2FA} 
          disabled={loading}
          className="submit-btn"
        >
          {loading ? 'Setting up...' : 'Enable 2FA'}
        </button>
      </div>
    );
  }

  return (
    <div className="two-factor-auth">
      <h3>Verify Two-Factor Authentication</h3>
      
      <div className="qr-section">
        <p>1. Scan this QR code with your authenticator app:</p>
        {otpAuthUrl && (
          <div className="qr-code">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpAuthUrl)}`}
              alt="QR Code for 2FA"
            />
          </div>
        )}
        
        <p>2. Or manually enter this secret key:</p>
        <div className="secret-key">
          <code>{secret}</code>
        </div>
      </div>

      <div className="verification-section">
        <p>3. Enter the 6-digit code from your authenticator app:</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleVerify2FA}>
          <div className="form-group">
            <input
              type="text"
              value={verificationToken}
              onChange={(e) => setVerificationToken(e.target.value)}
              placeholder="123456"
              maxLength={6}
              required
              disabled={loading}
              className="verification-input"
            />
          </div>
          
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Verifying...' : 'Verify and Enable 2FA'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TwoFactorAuth;
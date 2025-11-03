import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import DropdownMenu from '../components/DropdownMenu';
import { Button, Box } from '@mui/material';

const ProfileView: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSetup2FA = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await authAPI.setup2FA(user.id);
      setQrCode(response.qrCode);
      setBackupCodes(response.backupCodes);
      setShow2FASetup(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard-container">
      {/* <div className="dashboard-header">
        <h1>Welcome, {user?.username}!</h1>
        <DropdownMenu />
      </div> */}

      <div className="dashboard-content">
        <div className="user-info">
          <h2>Account Information</h2>
          <div className="info-item">
            <strong>Username:</strong> {user?.username}
          </div>
          <div className="info-item">
            <strong>Email:</strong> {user?.email}
          </div>
          <div className="info-item">
            <strong>2FA Status:</strong> 
            <span className={`status ${user?.twoFactorEnabled ? 'enabled' : 'disabled'}`}>
              {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        <div className="security-section">
          <h2>Security Settings</h2>
          
          {!user?.twoFactorEnabled ? (
            <div className="setup-2fa">
              <p>Two-Factor Authentication is not enabled for your account.</p>
              <button 
                onClick={handleSetup2FA} 
                disabled={loading}
                className="setup-button"
              >
                {loading ? 'Setting up...' : 'Enable 2FA'}
              </button>
            </div>
          ) : (
            <div className="2fa-enabled">
              <p>✅ Two-Factor Authentication is enabled</p>
              <p>Your account is protected with an additional layer of security.</p>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="navigation-section">
          <h2>Navigation</h2>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              onClick={() => navigate('/propiedades')}
              sx={{ mb: 1 }}
            >
              Ver Propiedades
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/dashboard')}
              sx={{ mb: 1 }}
            >
              Dashboard
            </Button>
          </Box>
        </div>

        {show2FASetup && (
          <div className="2fa-setup-modal">
            <div className="modal-content">
              <h3>Setup Two-Factor Authentication</h3>
              <p>Scan this QR code with your authenticator app:</p>
              
              <div className="qr-code-container">
                <img src={qrCode} alt="QR Code for 2FA setup" />
              </div>
              
              <p>Or manually enter this secret key:</p>
              <div className="secret-key">
                <code>Your secret key will be shown here</code>
              </div>

              <h4>Backup Codes</h4>
              <p>Save these backup codes in a safe place. Each code can only be used once:</p>
              <div className="backup-codes">
                {backupCodes.map((code, index) => (
                  <div key={index} className="backup-code">{code}</div>
                ))}
              </div>

              <button 
                onClick={() => setShow2FASetup(false)}
                className="close-button"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;

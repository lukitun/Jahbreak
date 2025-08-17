import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import TwoFactorAuth from '../auth/TwoFactorAuth';

const Header: React.FC = () => {
  const { state, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowMobileMenu(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handle2FASuccess = () => {
    setShow2FAModal(false);
    alert('Two-factor authentication has been enabled successfully!');
  };

  if (!state.isAuthenticated) {
    return null;
  }

  return (
    <>
      <header className="app-header">
        <div className="header-container">
          <div className="header-left">
            <Link to="/dashboard" className="logo">
              <h1>FinanceTracker</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <ul className="nav-links">
              <li>
                <Link 
                  to="/dashboard" 
                  className={isActive('/dashboard') ? 'active' : ''}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/expenses" 
                  className={isActive('/expenses') ? 'active' : ''}
                >
                  Expenses
                </Link>
              </li>
              <li>
                <Link 
                  to="/budgets" 
                  className={isActive('/budgets') ? 'active' : ''}
                >
                  Budgets
                </Link>
              </li>
              <li>
                <Link 
                  to="/reports" 
                  className={isActive('/reports') ? 'active' : ''}
                >
                  Reports
                </Link>
              </li>
            </ul>
          </nav>

          <div className="header-right">
            {/* User Menu */}
            <div className="user-menu">
              <div className="user-info">
                <span className="user-name">
                  {state.user?.firstName} {state.user?.lastName}
                </span>
                <span className="user-email">{state.user?.email}</span>
              </div>
              
              <div className="user-actions">
                {!state.user?.isTwoFactorEnabled && (
                  <button 
                    onClick={() => setShow2FAModal(true)}
                    className="enable-2fa-btn"
                  >
                    Enable 2FA
                  </button>
                )}
                
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="mobile-menu-toggle"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <nav className="mobile-nav">
            <ul className="mobile-nav-links">
              <li>
                <Link 
                  to="/dashboard" 
                  className={isActive('/dashboard') ? 'active' : ''}
                  onClick={() => setShowMobileMenu(false)}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/expenses" 
                  className={isActive('/expenses') ? 'active' : ''}
                  onClick={() => setShowMobileMenu(false)}
                >
                  Expenses
                </Link>
              </li>
              <li>
                <Link 
                  to="/budgets" 
                  className={isActive('/budgets') ? 'active' : ''}
                  onClick={() => setShowMobileMenu(false)}
                >
                  Budgets
                </Link>
              </li>
              <li>
                <Link 
                  to="/reports" 
                  className={isActive('/reports') ? 'active' : ''}
                  onClick={() => setShowMobileMenu(false)}
                >
                  Reports
                </Link>
              </li>
              <li>
                {!state.user?.isTwoFactorEnabled && (
                  <button 
                    onClick={() => {
                      setShow2FAModal(true);
                      setShowMobileMenu(false);
                    }}
                    className="mobile-enable-2fa-btn"
                  >
                    Enable 2FA
                  </button>
                )}
              </li>
              <li>
                <button onClick={handleLogout} className="mobile-logout-btn">
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        )}
      </header>

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Two-Factor Authentication</h3>
              <button 
                onClick={() => setShow2FAModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <TwoFactorAuth onSuccess={handle2FASuccess} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
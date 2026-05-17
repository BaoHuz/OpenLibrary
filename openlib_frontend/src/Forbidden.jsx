import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ErrorPages.css';

function Forbidden({ user, onLogout }) {
  const navigate = useNavigate();

  const handleSwitchAccount = () => {
    if (onLogout) {
      onLogout(); // Clears user session
    }
    navigate('/login'); // Redirect to login
  };

  return (
    <div className="error-page-container">
      <div className="error-card">
        {/* Decorative subtle background shapes */}
        <div className="card-bg-shape shape-1"></div>
        <div className="card-bg-shape shape-2"></div>

        {/* 403 Code */}
        <h1 className="error-code forbidden">403</h1>

        {/* Glowing warning lock and security shield SVG */}
        <div className="error-visual forbidden">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Soft background warning glow */}
            <circle cx="100" cy="110" r="55" fill="var(--c-danger)" opacity="0.1" />
            
            {/* Warning light ring around shield */}
            <circle cx="100" cy="100" r="82" stroke="var(--c-warning)" strokeWidth="2.5" strokeDasharray="10 10" opacity="0.25" />
            
            {/* Security Shield Base */}
            <path d="M100 30C130 30 160 40 160 70C160 115 125 155 100 170C75 155 40 115 40 70C40 40 70 30 100 30Z" 
                  stroke="var(--c-danger)" strokeWidth="3.5" fill="var(--input-bg)" strokeLinejoin="round" className="svg-glow-danger" />
            
            {/* Inner warning triangle symbol in background */}
            <polygon points="100,50 135,115 65,115" fill="var(--c-danger)" opacity="0.05" />

            {/* Glowing Padlock body & Shackle */}
            <g transform="translate(68, 70)">
              {/* Shackle */}
              <path d="M14 25V18C14 9.5 21 3 30 3C39 3 46 9.5 46 18V25" stroke="var(--c-danger)" strokeWidth="5.5" strokeLinecap="round" fill="none" className="svg-glow-danger" />
              {/* Padlock Body */}
              <rect x="2" y="24" width="56" height="40" rx="10" fill="var(--c-warning)" stroke="var(--c-danger)" strokeWidth="3.5" className="svg-glow-warning" />
              {/* Keyhole */}
              <circle cx="30" cy="40" r="5" fill="var(--c-danger)" />
              <path d="M30 45V53" stroke="var(--c-danger)" strokeWidth="4" strokeLinecap="round" />
            </g>
            
            {/* Star sparkles indicating locked boundary */}
            <polygon points="155,50 157,55 162,55 158,58 159,63 155,60 151,63 152,58 148,55 153,55" fill="var(--c-warning)" opacity="0.8" className="svg-glow-warning" />
            <polygon points="45,130 47,135 52,135 48,138 49,143 45,140 41,143 42,138 38,135 43,135" fill="var(--c-danger)" opacity="0.8" className="svg-glow-danger" />
          </svg>
        </div>

        {/* Text information */}
        <h2 className="error-title">QUYỀN TRUY CẬP BỊ TỪ CHỐI</h2>
        <p className="error-message">
          Rất tiếc! Tài khoản của bạn không được cấp quyền truy cập để xem nội dung hoặc chức năng này. Vui lòng kiểm tra lại quyền hạn của mình.
        </p>

        {/* Currently logged in user badge details */}
        {user ? (
          <div className="error-user-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>
              Đang đăng nhập: <strong>{user.username || user.email}</strong> 
              {user.role ? ` (${user.role.toUpperCase()})` : ''}
            </span>
          </div>
        ) : (
          <div className="error-user-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Bạn chưa đăng nhập hệ thống</span>
          </div>
        )}

        {/* Interactive action buttons */}
        <div className="error-actions">
          <button className="btn btn-danger" onClick={() => navigate('/')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Về Trang Chủ
          </button>
          
          {user ? (
            <button className="btn" onClick={handleSwitchAccount}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Tài Khoản Khác
            </button>
          ) : (
            <button className="btn" onClick={() => navigate('/login')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Đăng Nhập
            </button>
          )}

          <button className="btn" onClick={() => navigate(-1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Quay Lại
          </button>
        </div>
      </div>
    </div>
  );
}

export default Forbidden;

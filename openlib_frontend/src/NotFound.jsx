import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ErrorPages.css';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="error-page-container">
      <div className="error-card">
        {/* Decorative subtle background shapes */}
        <div className="card-bg-shape shape-1"></div>
        <div className="card-bg-shape shape-2"></div>

        {/* 404 Code */}
        <h1 className="error-code not-found">404</h1>

        {/* Glowing floating book and question mark SVG */}
        <div className="error-visual not-found">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Soft book light glow */}
            <ellipse cx="100" cy="115" rx="55" ry="12" fill="var(--c-primary)" opacity="0.15" />
            
            {/* Book spine */}
            <path d="M100 150V80" stroke="var(--c-primary)" strokeWidth="5" strokeLinecap="round" className="svg-glow-primary" />
            
            {/* Left page outline and sheets */}
            <path d="M100 150C75 138 35 138 15 143V73C35 68 75 68 100 80" stroke="var(--c-primary)" strokeWidth="3" fill="var(--input-bg)" strokeLinejoin="round" />
            <path d="M100 144C78 133 40 133 20 138V68C40 63 78 63 100 74" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinejoin="round" opacity="0.4" />
            <path d="M100 138C81 128 45 128 25 133V63C45 58 81 58 100 68" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinejoin="round" opacity="0.2" />

            {/* Right page outline and sheets */}
            <path d="M100 150C125 138 165 138 185 143V73C165 68 125 68 100 80" stroke="var(--c-primary)" strokeWidth="3" fill="var(--input-bg)" strokeLinejoin="round" />
            <path d="M100 144C122 133 160 133 180 138V68C160 63 122 63 100 74" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinejoin="round" opacity="0.4" />
            <path d="M100 138C119 128 155 128 175 133V63C155 58 119 58 100 68" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinejoin="round" opacity="0.2" />

            {/* Magical sparkles / floating library characters rising from book */}
            <g opacity="0.85">
              <circle cx="55" cy="95" r="3.5" fill="var(--c-secondary)" className="svg-glow-secondary" />
              <circle cx="145" cy="85" r="4.5" fill="var(--c-secondary)" className="svg-glow-secondary" />
              <circle cx="80" cy="115" r="2.5" fill="var(--c-success)" />
              <circle cx="120" cy="100" r="3" fill="var(--c-warning)" />
              <polygon points="135,55 138,62 145,62 139,66 141,73 135,69 129,73 131,66 125,62 132,62" fill="var(--c-warning)" opacity="0.7" />
              <polygon points="65,55 67,60 72,60 68,63 69,68 65,65 61,68 62,63 58,60 63,60" fill="var(--c-secondary)" opacity="0.8" className="svg-glow-secondary" />
            </g>
            
            {/* Glowing neon Floating Question Mark */}
            <g transform="translate(0, -10)">
              <path d="M92 45C92 39.5 96.5 35 102 35C107.5 35 112 39.5 112 45C112 49 109 51.5 107 53.5C105 55.5 104.5 58 104.5 61H99.5C99.5 56.5 101.5 54 103.5 52C105.5 50 107 48.5 107 45C107 42 104.5 40 102 40C99.5 40 97 42 97 45H92ZM99.5 70V65H104.5V70H99.5Z" fill="var(--c-secondary)" className="svg-glow-secondary" />
            </g>
          </svg>
        </div>

        {/* Text information */}
        <h2 className="error-title">KHÔNG TÌM THẤY TRANG</h2>
        <p className="error-message">
          Ối! Có vẻ như trang bạn đang tìm kiếm đã bay đi đâu mất rồi, hoặc đường dẫn không chính xác. Hãy kiểm tra lại hoặc trở về trang chủ nhé.
        </p>

        {/* Interactive action buttons */}
        <div className="error-actions">
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Về Trang Chủ
          </button>
          
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

export default NotFound;

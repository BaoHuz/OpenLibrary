import React, { useState } from 'react';
import axios from 'axios';
import { 
  Users, Shield, Mail, LogIn, ChevronRight, Eye, 
  Globe, BookOpen 
} from 'lucide-react';
import './App.css';

const Login = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    email: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const response = await axios.post('http://127.0.0.1:8000/api/login/', {
          username: formData.username,
          password: formData.password
        });
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.access);
        onLoginSuccess(response.data.user);
      } else {
        await axios.post('http://127.0.0.1:8000/api/register/', formData);
        setIsLogin(true);
        alert('Đăng ký thành công! Hãy đăng nhập.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const accent = '#6366f1';
  const glassBg = 'rgba(255, 255, 255, 0.85)';
  const glassBorder = 'rgba(255, 255, 255, 0.2)';

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      position: 'relative',
      overflow: 'hidden',
      background: '#0f172a',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      {/* Background with Generated Image & Overlays */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url("/library_login_bg_1776521824964.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(4px) brightness(0.7)',
        transform: 'scale(1.02)'
      }} />
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at center, transparent 0%, rgba(15, 23, 42, 0.8) 100%)'
      }} />

      {/* Decorative Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '300px',
        height: '300px',
        background: 'rgba(99, 102, 241, 0.15)',
        filter: 'blur(100px)',
        borderRadius: '50%'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '5%',
        width: '400px',
        height: '400px',
        background: 'rgba(139, 92, 246, 0.15)',
        filter: 'blur(100px)',
        borderRadius: '50%'
      }} />

      <div style={{ 
        position: 'relative',
        zIndex: 10,
        background: glassBg, 
        backdropFilter: 'blur(20px)',
        padding: '3rem 2.5rem', 
        borderRadius: '2rem', 
        width: '440px', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: `1px solid ${glassBorder}`,
        animation: 'slideUp 0.6s ease-out',
        position: 'relative'
      }}>
        {/* Back to Home Link */}
        <button 
          onClick={() => window.location.href = '/'} 
          style={{ 
            position: 'absolute', 
            top: '1.25rem', 
            left: '1.25rem', 
            background: 'none', 
            border: 'none', 
            color: '#64748b', 
            fontSize: '0.85rem', 
            fontWeight: 600, 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.3rem',
            transition: 'color 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = accent}
          onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
        >
          <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /> Trang chủ
        </button>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            background: `linear-gradient(135deg, ${accent}, #8b5cf6)`,
            borderRadius: '16px',
            margin: '0 auto 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 10px 20px rgba(99, 102, 241, 0.3)`
          }}>
            <BookOpen size={30} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
            {isLogin ? 'Chào mừng trở lại' : 'Bắt đầu ngay'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            {isLogin ? 'Đăng nhập vào kho tri thức OpenLib' : 'Tạo tài khoản để khám phá hàng ngàn đầu sách'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
              <Users size={18} />
            </div>
            <input 
              type="text" 
              name="username" 
              placeholder="Tên đăng nhập" 
              required 
              value={formData.username}
              onChange={handleChange}
              style={{ 
                width: '100%', 
                padding: '1rem 1rem 1rem 3rem', 
                borderRadius: '12px', 
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'all 0.2s'
              }}
              className="login-input"
            />
          </div>

          {!isLogin && (
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <Shield size={18} />
              </div>
              <input 
                type="text" 
                name="full_name" 
                placeholder="Họ và tên" 
                required 
                value={formData.full_name}
                onChange={handleChange}
                style={{ 
                  width: '100%', 
                  padding: '1rem 1rem 1rem 3rem', 
                  borderRadius: '12px', 
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s'
                }}
                className="login-input"
              />
            </div>
          )}

          {!isLogin && (
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <Mail size={18} />
              </div>
              <input 
                type="email" 
                name="email" 
                placeholder="Địa chỉ Email" 
                required 
                value={formData.email}
                onChange={handleChange}
                style={{ 
                  width: '100%', 
                  padding: '1rem 1rem 1rem 3rem', 
                  borderRadius: '12px', 
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s'
                }}
                className="login-input"
              />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
              <Shield size={18} />
            </div>
            <input 
              type={showPassword ? "text" : "password"} 
              name="password" 
              placeholder="Mật khẩu" 
              required 
              value={formData.password}
              onChange={handleChange}
              style={{ 
                width: '100%', 
                padding: '1rem 3rem 1rem 3rem', 
                borderRadius: '12px', 
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'all 0.2s'
              }}
              className="login-input"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ 
                position: 'absolute', 
                right: '1rem', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                background: 'none', 
                border: 'none', 
                color: '#94a3b8', 
                cursor: 'pointer',
                display: 'flex'
              }}
            >
              {showPassword ? <Eye size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <div style={{ 
              background: '#fef2f2', 
              color: '#ef4444', 
              padding: '0.75rem 1rem', 
              borderRadius: '10px', 
              fontSize: '0.85rem', 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              border: '1px solid #fee2e2'
            }}>
              ⚠️ {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
              width: '100%', 
              padding: '1rem', 
              background: loading ? '#94a3b8' : `linear-gradient(135deg, ${accent}, #8b5cf6)`, 
              color: '#fff', 
              border: 'none', 
              borderRadius: '12px', 
              fontWeight: 800, 
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              boxShadow: '0 10px 20px rgba(99, 102, 241, 0.25)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={e => { if(!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(99, 102, 241, 0.35)'; } }}
            onMouseLeave={e => { if(!loading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(99, 102, 241, 0.25)'; } }}
          >
            {loading ? <div className="spinner-small" /> : (isLogin ? <><LogIn size={20} /> Đăng Nhập</> : <><Users size={20} /> Đăng Ký</>)}
          </button>
        </form>



        <button 
          onClick={() => setIsLogin(!isLogin)} 
          style={{ 
            width: '100%', 
            marginTop: '2rem', 
            background: 'none', 
            border: 'none', 
            color: accent, 
            fontWeight: 700, 
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem'
          }}
        >
          {isLogin ? (
            <>Chưa có tài khoản? <span style={{ textDecoration: 'underline' }}>Đăng ký ngay</span></>
          ) : (
            <><ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} /> Quay lại Đăng nhập</>
          )}
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .login-input:focus {
          border-color: ${accent} !important;
          background: #fff !important;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }
        .spinner-small {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;


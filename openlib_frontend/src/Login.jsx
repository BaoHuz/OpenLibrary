import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // Reuse some layout styles

const Login = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
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

  return (
    <div className="login-page" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div style={{ background: '#fff', padding: '3rem', borderRadius: '1.5rem', width: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ margin: '0 0 0.5rem', fontWeight: 800 }}>{isLogin ? 'Chào mừng bạn' : 'Tạo tài khoản'}</h1>
          <p style={{ color: '#64748b' }}>Đăng nhập để vào OpenLib Admin</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            name="username" 
            placeholder="Tên đăng nhập" 
            required 
            value={formData.username}
            onChange={handleChange}
            style={{ width: '100%', padding: '1rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />

          {!isLogin && (
            <input 
              type="text" 
              name="full_name" 
              placeholder="Họ và tên" 
              required 
              value={formData.full_name}
              onChange={handleChange}
              style={{ width: '100%', padding: '1rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
            />
          )}

          {!isLogin && (
            <input 
              type="email" 
              name="email" 
              placeholder="Địa chỉ Email" 
              required 
              value={formData.email}
              onChange={handleChange}
              style={{ width: '100%', padding: '1rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
            />
          )}

          <input 
            type="password" 
            name="password" 
            placeholder="Mật khẩu" 
            required 
            value={formData.password}
            onChange={handleChange}
            style={{ width: '100%', padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />

          {error && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 700 }}>{error}</div>}

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '1rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>
            {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng Nhập' : 'Đăng Ký')}
          </button>
        </form>

        <button onClick={() => setIsLogin(!isLogin)} style={{ width: '100%', marginTop: '1.5rem', background: 'none', border: 'none', color: '#6366f1', fontWeight: 700, cursor: 'pointer' }}>
          {isLogin ? 'Chưa có tài khoản? Đăng ký' : 'Quay lại Đăng nhập'}
        </button>
      </div>
    </div>
  );
};

export default Login;

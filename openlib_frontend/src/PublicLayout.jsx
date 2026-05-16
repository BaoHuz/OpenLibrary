import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Bell, LayoutDashboard, Search } from 'lucide-react';

const PublicLayout = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentView, setCurrentView] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showNotif, setShowNotif] = useState(false);
  
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Yêu cầu mượn đã duyệt', content: 'Sách "Clean Code" đã sẵn sàng để lấy.', time: '2 giờ trước', read: false, type: 'success' },
    { id: 2, title: 'Nhắc nhở trả sách', content: 'Bạn có cuốn "Refactoring" sắp đến hạn trả.', time: '1 ngày trước', read: false, type: 'warning' },
    { id: 3, title: 'Phát sinh khoản phạt', content: 'Đã phát sinh 20.000đ phí quá hạn.', time: '3 ngày trước', read: true, type: 'error' },
  ]);

  const handleNavClick = (view) => {
    setCurrentView(view);
    setSearchTerm('');
    setSelectedCategory(null);
    if (location.pathname !== '/') {
      navigate('/');
    } else {
      window.scrollTo(0, 0);
    }
  };

  const handleHomeClick = () => {
    setCurrentView('home');
    setSearchTerm('');
    setSelectedCategory(null);
    if (location.pathname !== '/') {
      navigate('/');
    } else {
      window.scrollTo(0, 0);
    }
  };

  const bg = '#f8fafc';
  const surface = '#ffffff';
  const border = '#e2e8f0';
  const textPrim = '#0f172a';
  const textSec = '#475569';
  const textMut = '#94a3b8';
  const accent = '#6366f1';

  return (
    <div style={{ minHeight: '100vh', background: bg, color: textPrim, fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 300, background: 'rgba(248,250,252,0.95)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${border}`, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }} onClick={handleHomeClick}>
            <img src="/logo.svg" alt="OpenLib Logo" style={{ height: '40px', width: 'auto', maxWidth: '160px' }} />
          </div>

          {/* Search Bar */}
          <div style={{ flex: 1, maxWidth: '400px', margin: '0 2rem', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: textMut }} />
            <input 
              type="text" 
              placeholder="Tìm tên sách, tác giả..." 
              value={searchTerm}
              onChange={(e) => { 
                setSearchTerm(e.target.value); 
                if (e.target.value) setCurrentView('library');
                else if (currentView === 'library' && location.pathname === '/') setCurrentView('home');
                
                if (location.pathname !== '/') navigate('/');
              }}
              style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.8rem', borderRadius: '50px', border: `1px solid ${border}`, background: bg, fontSize: '0.9rem', outline: 'none', transition: 'all .2s' }}
              onFocus={e => { e.target.style.borderColor = accent; e.target.style.boxShadow = `0 0 0 3px rgba(99,102,241,0.1)`; }}
              onBlur={e => { e.target.style.borderColor = border; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.25rem', fontSize: '0.92rem' }}>
            {[
              { id: 'home', label: 'Trang chủ' },
              { id: 'library', label: 'Thư viện' },
              { id: 'about', label: 'Giới thiệu' },
              { id: 'contact', label: 'Liên hệ' },
              ...(user ? [{ id: 'mybookshelf', label: 'Tủ sách' }] : []),
            ].map(item => {
              const isActive = item.id === 'library' 
                ? (currentView === 'library' || location.pathname.startsWith('/books/'))
                : (currentView === item.id || (item.id === 'home' && currentView === 'profile')) && location.pathname === '/';
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    background: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
                    border: 'none',
                    color: isActive ? accent : textSec,
                    fontWeight: isActive ? 800 : 600,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    transition: 'all .2s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(99,102,241,0.06)'; e.currentTarget.style.color = accent; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = textSec; } }}
                >
                  {item.label}
                  {isActive && (
                    <div style={{ position: 'absolute', bottom: '-1px', left: '50%', transform: 'translateX(-50%)', width: '20px', height: '2px', background: accent, borderRadius: '2px' }} />
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {user ? (
               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <button 
                    onClick={() => setShowNotif(!showNotif)}
                    style={{ background: 'none', border: 'none', color: textSec, cursor: 'pointer', display: 'flex', position: 'relative', padding: '5px' }}>
                    <Bell size={22} />
                    {notifications.some(n => !n.read) && (
                      <div style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }} />
                    )}
                  </button>
                  {showNotif && (
                    <div style={{ position: 'absolute', top: '100%', right: 0, width: '320px', background: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', borderRadius: '1rem', marginTop: '1rem', zIndex: 1000, padding: '1rem', border: `1px solid ${border}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>Thông báo</h4>
                        <span style={{ fontSize: '0.75rem', color: accent, cursor: 'pointer', fontWeight: 700 }}>Đánh dấu đã đọc</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                        {notifications.map(n => (
                          <div key={n.id} style={{ padding: '0.8rem', borderRadius: '0.8rem', background: n.read ? 'transparent' : '#f8fafc', border: `1px solid ${n.read ? 'transparent' : border}`, cursor: 'pointer' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.2rem', color: n.type === 'error' ? '#ef4444' : (n.type === 'warning' ? '#f59e0b' : textPrim) }}>{n.title}</div>
                            <div style={{ fontSize: '0.8rem', color: textSec, lineHeight: 1.4 }}>{n.content}</div>
                            <div style={{ fontSize: '0.7rem', color: textMut, marginTop: '0.4rem' }}>{n.time}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div 
                  onClick={() => handleNavClick('profile')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: `linear-gradient(135deg,${accent},#8b5cf6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', color: '#fff' }}>
                    {(user?.full_name || user?.username || 'U')[0].toUpperCase()}
                  </div>
                  <span style={{ fontWeight: 700, color: textPrim, display: 'none' }}>{user?.full_name || user?.username || 'Thành viên'}</span>
                </div>
                {(user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'librarian') && (
                  <button onClick={() => navigate('/admin')} style={{ background: `linear-gradient(135deg,${accent},#8b5cf6)`, color: '#fff', border: 'none', padding: '0.5rem 1.1rem', borderRadius: '50px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
                    <LayoutDashboard size={14} /> Quản Trị
                  </button>
                )}
                <button onClick={onLogout} style={{ background: surface, border: `1px solid ${border}`, color: textSec, padding: '0.5rem 1.1rem', borderRadius: '50px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>Đăng xuất</button>
              </div>
            ) : (
              <>
                <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: 'none', color: textSec, cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>Đăng nhập</button>
                <button onClick={() => navigate('/login')} style={{ background: `linear-gradient(135deg,${accent},#8b5cf6)`, color: '#fff', border: 'none', padding: '0.55rem 1.3rem', borderRadius: '50px', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
                  <LogIn size={15} /> Đăng ký
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet context={{ currentView, setCurrentView, searchTerm, setSearchTerm, selectedCategory, setSelectedCategory }} />
      </main>

      <footer style={{ background: '#1e293b', color: '#94a3b8', padding: '3rem 2rem 2rem', marginTop: 'auto' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <img src="/logo.svg" alt="OpenLib Logo" style={{ height: '36px', width: 'auto' }} />
              </div>
              <p style={{ color: '#64748b', lineHeight: 1.6, fontSize: '0.88rem', maxWidth: '260px' }}>Hệ thống quản lý thư viện mã nguồn mở — xây dựng trên React & Django REST Framework.</p>
            </div>
            <div>
              <h4 style={{ fontWeight: 800, marginBottom: '1rem', fontSize: '0.95rem', color: '#fff' }}>Khám Phá</h4>
              {['Sách mới nhất', 'Sách nổi bật', 'Tác giả', 'Thể loại'].map(t => (
                <div key={t} style={{ color: '#64748b', marginBottom: '0.6rem', fontSize: '0.88rem', cursor: 'pointer', transition: 'color .2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#64748b'}>{t}</div>
              ))}
            </div>
            <div>
              <h4 style={{ fontWeight: 800, marginBottom: '1rem', fontSize: '0.95rem', color: '#fff' }}>Hỗ Trợ</h4>
              {['Hướng dẫn sử dụng', 'Nội quy mượn trả', 'Liên hệ thủ thư', 'Báo lỗi hệ thống'].map(t => (
                <div key={t} style={{ color: '#64748b', marginBottom: '0.6rem', fontSize: '0.88rem', cursor: 'pointer', transition: 'color .2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#64748b'}>{t}</div>
              ))}
            </div>
            <div>
              <h4 style={{ fontWeight: 800, marginBottom: '1rem', fontSize: '0.95rem', color: '#fff' }}>Thông Tin</h4>
              <div style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 2 }}>
                <div>📍 Thư viện OpenLib</div>
                <div>📧 admin@openlib.edu.vn</div>
                <div>📞 (028) 1234 5678</div>
                <div>⏰ T2–T7: 7:30 – 17:00</div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', textAlign: 'center', color: '#475569', fontSize: '0.82rem' }}>
            © 2026 Đồ án môn học · Hệ thống Quản lý Thư viện bằng phần mềm Mã nguồn mở · React + Django
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;

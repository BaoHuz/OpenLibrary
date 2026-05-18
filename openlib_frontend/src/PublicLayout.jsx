import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Bell, LayoutDashboard, Search, ShoppingBag, Trash2 } from 'lucide-react';
import { getCart, removeFromCart, clearCart } from './cartService';

const PublicLayout = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentView, setCurrentView] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showNotif, setShowNotif] = useState(false);
  const [cart, setCart] = useState(getCart());
  const [showCart, setShowCart] = useState(false);

  React.useEffect(() => {
    const handleUpdate = () => {
      setCart(getCart());
    };
    window.addEventListener('cart-updated', handleUpdate);
    return () => window.removeEventListener('cart-updated', handleUpdate);
  }, []);
  
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem(`notifs_${user?.username || 'guest'}`);
      return stored ? JSON.parse(stored) : [
        { id: 1, title: 'Yêu cầu mượn đã duyệt', content: 'Sách "Clean Code" đã sẵn sàng để lấy.', time: '2 giờ trước', read: false, type: 'success' },
        { id: 2, title: 'Nhắc nhở trả sách', content: 'Bạn có cuốn "Refactoring" sắp đến hạn trả.', time: '1 ngày trước', read: false, type: 'warning' },
        { id: 3, title: 'Phát sinh khoản phạt', content: 'Đã phát sinh 20.000đ phí quá hạn.', time: '3 ngày trước', read: true, type: 'error' },
      ];
    } catch {
      return [
        { id: 1, title: 'Yêu cầu mượn đã duyệt', content: 'Sách "Clean Code" đã sẵn sàng để lấy.', time: '2 giờ trước', read: false, type: 'success' },
        { id: 2, title: 'Nhắc nhở trả sách', content: 'Bạn có cuốn "Refactoring" sắp đến hạn trả.', time: '1 ngày trước', read: false, type: 'warning' },
        { id: 3, title: 'Phát sinh khoản phạt', content: 'Đã phát sinh 20.000đ phí quá hạn.', time: '3 ngày trước', read: true, type: 'error' },
      ];
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(`notifs_${user?.username || 'guest'}`, JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }, [notifications, user]);

  React.useEffect(() => {
    const handleNewNotif = (e) => {
      const { title, content, type } = e.detail || {};
      if (title && content) {
        const notif = {
          id: Date.now(),
          title,
          content,
          time: 'Vừa xong',
          read: false,
          type: type || 'success'
        };
        setNotifications(prev => [notif, ...prev]);
      }
    };
    window.addEventListener('new-notification', handleNewNotif);
    return () => window.removeEventListener('new-notification', handleNewNotif);
  }, []);

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

  const handleCheckout = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để thực hiện mượn sách!');
      navigate('/login');
      return;
    }
    if (cart.length === 0) return;

    try {
      const response = await fetch('http://127.0.0.1:8000/api/borrow_request/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user.username,
          book_ids: cart.map(item => item.book_id)
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.error || 'Có lỗi xảy ra khi gửi yêu cầu mượn!');
        return;
      }

      alert(data.message || 'Gửi yêu cầu mượn sách thành công!');
      clearCart();
      setShowCart(false);
      
      window.dispatchEvent(new Event('borrow-history-updated'));
      
      const newNotif = {
        id: Date.now(),
        title: 'Gửi yêu cầu mượn thành công',
        content: `Yêu cầu mượn ${cart.length} cuốn sách đã được gửi và đang chờ phê duyệt.`,
        time: 'Vừa xong',
        read: false,
        type: 'success'
      };
      setNotifications(prev => [newNotif, ...prev]);
    } catch (error) {
      alert('Lỗi kết nối đến máy chủ!');
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
                {/* Cart Icon & Popover */}
                <div style={{ position: 'relative' }}>
                  <button 
                    onClick={() => { handleNavClick('cart'); setShowNotif(false); }}
                    style={{ background: 'none', border: 'none', color: textSec, cursor: 'pointer', display: 'flex', position: 'relative', padding: '5px', alignItems: 'center' }}>
                    <ShoppingBag size={22} style={{ color: cart.length > 0 ? accent : textSec }} />
                    {cart.length > 0 && (
                      <div style={{ position: 'absolute', top: -2, right: -4, background: '#ff5a5f', color: '#fff', fontSize: '0.65rem', fontWeight: 800, minWidth: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 2px', border: '2px solid #fff' }}>
                        {cart.length}
                      </div>
                    )}
                  </button>
                  {false && (
                    <div style={{ position: 'absolute', top: '100%', right: 0, width: '340px', background: '#fff', boxShadow: '0 15px 35px rgba(0,0,0,0.15)', borderRadius: '1rem', marginTop: '1rem', zIndex: 1000, padding: '1.2rem', border: `1px solid ${border}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>Tủ sách mượn tạm ({cart.length}/5)</h4>
                        {cart.length > 0 && (
                          <span 
                            onClick={() => clearCart()}
                            style={{ fontSize: '0.75rem', color: '#ef4444', cursor: 'pointer', fontWeight: 700 }}>Xóa tất cả</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '280px', overflowY: 'auto', marginBottom: cart.length > 0 ? '1.2rem' : 0 }}>
                        {cart.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: textMut, fontSize: '0.88rem' }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📚</div>
                            Tủ sách đang trống.<br/>Hãy thêm sách bạn thích vào đây để mượn cùng lúc!
                          </div>
                        ) : (
                          cart.map(item => (
                            <div key={item.book_id} style={{ display: 'flex', gap: '0.7rem', alignItems: 'center', paddingBottom: '0.8rem', borderBottom: `1px solid ${border}` }}>
                              {item.cover_image ? (
                                <img src={item.cover_image} alt={item.title} style={{ width: '38px', height: '54px', borderRadius: '4px', objectFit: 'cover', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }} />
                              ) : (
                                <div style={{ width: '38px', height: '54px', borderRadius: '4px', background: `linear-gradient(135deg, ${accent}, #8b5cf6)`, color: '#fff', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', textAlign: 'center' }}>
                                  Book
                                </div>
                              )}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: textPrim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                                <div style={{ fontSize: '0.78rem', color: textSec, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.1rem' }}>{item.author || 'Chưa rõ tác giả'}</div>
                              </div>
                              <button 
                                onClick={() => removeFromCart(item.book_id)}
                                style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '5px', transition: 'all .2s' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                      {cart.length > 0 && (
                        <button 
                          onClick={handleCheckout}
                          style={{ width: '100%', background: `linear-gradient(135deg, ${accent}, #8b5cf6)`, color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: '0 4px 15px rgba(99,102,241,0.3)', transition: 'all .2s' }}>
                          Mượn sách đã chọn ({cart.length})
                        </button>
                      )}
                    </div>
                  )}
                </div>

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

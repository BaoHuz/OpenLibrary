import React, { useState, useEffect } from 'react';
import { 
  Library, LayoutDashboard, BookOpen, Users, Tag, ClipboardList, Settings, LogOut, Bell, User, ChevronDown, Mail, Globe, MapPin, Palette, Building, Star, AlertTriangle, Inbox
} from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';

const Layout = ({ children, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  const themes = ['theme-light', 'theme-dark', 'theme-blue'];
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'theme-light';
  });

  useEffect(() => {
    document.body.className = currentTheme;
    localStorage.setItem('app-theme', currentTheme);
  }, [currentTheme]);

  /* Fetch pending borrow requests count */
  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/borrow_request/');
        setPendingCount(Array.isArray(res.data) ? res.data.length : 0);
      } catch { /* silent */ }
    };
    fetchPending();
    const timer = setInterval(fetchPending, 30000); // refresh every 30s
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setCurrentTheme(themes[nextIndex]);
  };

  const tabs = [
    { key: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard, path: '/admin' },
    { key: 'books', label: 'Quản lý Sách', icon: BookOpen, path: '/admin/books' },
    { key: 'authors', label: 'Tác giả', icon: Users, path: '/admin/authors' },
    { key: 'categories', label: 'Thể loại', icon: Tag, path: '/admin/categories' },
    { key: 'members', label: 'Thành viên', icon: Users, path: '/admin/members' },
    { key: 'borrow', label: 'Mượn / Trả', icon: ClipboardList, path: '/admin/borrow' },
    { key: 'borrow_requests', label: 'Yêu cầu mượn', icon: Inbox, path: '/admin/borrow_requests' },
    { key: 'publishers', label: 'Nhà xuất bản', icon: Building, path: '/admin/publishers' },
    { key: 'reviews', label: 'Đánh giá', icon: Star, path: '/admin/reviews' },
    { key: 'fines', label: 'Phạt vi phạm', icon: AlertTriangle, path: '/admin/fines' }
  ];

  const activeTabObj = tabs.find(t => location.pathname === t.path || (t.path !== '/admin' && location.pathname.startsWith(t.path)));
  const activeLabel = activeTabObj ? activeTabObj.label : 'Quản lý';

  return (
    <div className="lms-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-logo" onClick={() => navigate('/admin')} style={{ cursor: 'pointer' }}>
          <div style={{ padding: '0.4rem', background: 'var(--accent)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Library size={22} color="#fff" />
          </div>
          <span>OpenLib Admin</span>
        </div>

        <nav className="nav-menu">
           {tabs.map((tab) => {
             const Icon = tab.icon;
             const isActive = location.pathname === tab.path || (tab.path !== '/admin' && location.pathname.startsWith(tab.path));
             return (
               <Link 
                 to={tab.path}
                 key={tab.key} 
                 className={`nav-item ${isActive ? 'active' : ''}`}
                 style={{ textDecoration: 'none', position: 'relative' }}
               >
                 <Icon size={18} />
                 <span>{tab.label}</span>
                 {tab.key === 'borrow_requests' && pendingCount > 0 && (
                   <span style={{
                     marginLeft: 'auto',
                     background: '#ef4444',
                     color: '#fff',
                     fontSize: '0.65rem',
                     fontWeight: 900,
                     padding: '0.1rem 0.45rem',
                     borderRadius: '50px',
                     minWidth: '18px',
                     textAlign: 'center',
                     lineHeight: '16px',
                     animation: 'pulse 2s infinite',
                   }}>
                     {pendingCount}
                   </span>
                 )}
               </Link>
             );
           })}
        </nav>

        <div className="sidebar-footer">
           <div className="nav-item">
              <Settings size={18} />
              <span>Thiết lập</span>
           </div>
           <div className="nav-item sign-out" style={{ color: '#ef4444' }} onClick={onLogout}>
              <LogOut size={18} />
              <span>Đăng xuất</span>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-container">
        <header className="top-header">
           <div className="page-title">
              <div className="breadcrumb">
                 Admin / <span style={{ color: 'var(--accent)' }}>{activeLabel.toUpperCase()}</span>
              </div>
              <h1 style={{ margin: '0.5rem 0 0', fontWeight: 800 }}>{activeLabel}</h1>
           </div>

           <div className="top-right-nav">
              <div className="nav-icon-btn" onClick={toggleTheme} title="Đổi giao diện">
                 <Palette size={18} />
              </div>
              <div className="nav-icon-btn">
                 <Bell size={18} />
                 <div className="notify-dot"></div>
              </div>
              <div className="user-profile">
                 <div className="user-avatar" style={{ background: user?.role === 'admin' ? 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' : 'var(--accent)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                   {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                   <span className="user-name" style={{ fontWeight: 700, fontSize: '0.85rem' }}>{user?.full_name || 'Admin'}</span>
                   <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>{user?.role || 'Member'}</span>
                 </div>
                 <ChevronDown size={14} color="#64748b" />
              </div>
           </div>
        </header>

        <section className="page-body">
           {children}
        </section>

        {/* MODERN PREMIUM FOOTER */}
        <footer className="modern-footer">
           <div className="footer-grid">
              <div className="footer-col">
                 <div className="footer-brand">
                    <div className="brand-dot"></div>
                    <span>OpenLib <strong>Admin</strong></span>
                  </div>
                  <p className="brand-desc">Hệ thống quản trị thư viện hiện đại, mang lại trải nghiệm tối ưu cho cả quản lý và độc giả.</p>
              </div>

              <div className="footer-col">
                 <h4>Chương trình</h4>
                 <ul className="footer-links">
                    <li><Link to="/books">Quản lý Kho</Link></li>
                    <li><Link to="/members">Hội viên</Link></li>
                    <li><Link to="/borrow">Mượn & Trả</Link></li>
                 </ul>
              </div>

              <div className="footer-col">
                 <h4>Kết nối</h4>
                 <div className="contact-info">
                    <div className="contact-item"><Mail size={14} /> <span>hi@openlib.io</span></div>
                 </div>
                 <div className="social-glow-links">
                    <a href="#" className="s-icon"><Globe size={18} /></a>
                    <a href="#" className="s-icon"><Mail size={18} /></a>
                    <a href="#" className="s-icon"><MapPin size={18} /></a>
                 </div>
              </div>
           </div>

           <div className="footer-bottom">
              <p>© 2026 <strong>OpenLib</strong>. Professional Library Management.</p>
              <div className="footer-badges">
                 <span className="v-badge primary">v2.1.2 Stable</span>
              </div>
           </div>
        </footer>
      </main>
    </div>
  );
};

export default Layout;

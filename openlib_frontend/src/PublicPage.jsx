import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BookOpen, Search, LogIn, BookMarked, Star, TrendingUp,
  LibraryBig, PenTool, LayoutDashboard, Quote, ChevronRight, Play,
  X, BookCopy, Users, Award, Clock, Heart, Eye, Filter,
  MapPin, Phone, Mail, CheckCircle, Zap, Shield, Globe, Menu
} from 'lucide-react';
import './App.css';

const API = 'http://127.0.0.1:8000/api';

/* ── Animated counter hook ── */
const useCounter = (target, duration = 1500) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev + step >= target) { clearInterval(timer); return target; }
        return prev + step;
      });
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return count;
};

/* ── Star Row ── */
const Stars = ({ rating }) => (
  <div style={{ display: 'flex', gap: '2px' }}>
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={14} fill={i <= rating ? '#f59e0b' : 'transparent'} color="#f59e0b" />
    ))}
  </div>
);

/* ── Book Card (light) ── */
const BookCard = ({ book, avgRating, onClick, onBorrow }) => (
  <div
    onClick={() => onClick(book)}
    style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', cursor: 'pointer' }}
    className="book-card-hover"
  >
    <div style={{ height: '320px', borderRadius: '1rem', overflow: 'hidden', background: 'linear-gradient(135deg,#e0e7ff,#f3e8ff)', position: 'relative', boxShadow: '0 4px 20px rgba(99,102,241,0.12)' }} className="poster-wrapper">
      {book.image
        ? <img src={book.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={book.title} />
        : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BookOpen size={48} color="rgba(99,102,241,0.3)" /></div>
      }
      {/* Stock badge */}
      <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: book.stock > 0 ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)', color: '#fff', padding: '0.25rem 0.6rem', borderRadius: '50px', fontSize: '0.72rem', fontWeight: 800, backdropFilter: 'blur(6px)' }}>
        {book.stock > 0 ? `${book.stock} cuốn` : 'Hết sách'}
      </div>
      {/* Hover overlay */}
      <div className="hover-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(99,102,241,0.88)', opacity: 0, transition: 'opacity 0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', backdropFilter: 'blur(4px)' }}>
        <button onClick={e => { e.stopPropagation(); onClick(book); }} className="primary-btn hover-btn" style={{ borderRadius: '50px', padding: '0.6rem 1.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', transform: 'translateY(16px)', transition: 'transform 0.3s' }}>
          <Eye size={14} /> Xem chi tiết
        </button>
        <button onClick={e => { e.stopPropagation(); onBorrow(book); }} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.5)', color: '#fff', borderRadius: '50px', padding: '0.6rem 1.4rem', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', transform: 'translateY(16px)', transition: 'transform 0.3s 0.05s' }} className="hover-btn">
          <BookMarked size={14} /> Mượn ngay
        </button>
      </div>
    </div>
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
        <Stars rating={Math.round(avgRating)} />
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{avgRating}/5</span>
      </div>
      <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#1e293b' }}>{book.title}</h3>
      <div style={{ color: '#64748b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        <PenTool size={12} /> {book.author_name}
      </div>
    </div>
  </div>
);

/* ════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════ */
const PublicPage = ({ user, onLogout }) => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeBook, setActiveBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState({});
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'library' | 'about' | 'contact'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const bookCount = useCounter(books.length);
  const authorCount = useCounter(authors.length);
  const catCount = useCounter(categories.length);

  useEffect(() => {
    const load = async () => {
      try {
        const [bRes, cRes, aRes, rRes] = await Promise.all([
          axios.get(`${API}/books/`),
          axios.get(`${API}/categories/`),
          axios.get(`${API}/authors/`),
          axios.get(`${API}/reviews/`),
        ]);
        setBooks(bRes.data);
        setCategories(cRes.data);
        setAuthors(aRes.data);
        setReviews(rRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const avgRatingFor = book => {
    const rs = reviews.filter(r => r.book === book.book_id);
    return rs.length ? Math.round(rs.reduce((s, r) => s + r.rating, 0) / rs.length * 10) / 10 : 4.5;
  };

  const filteredBooks = books.filter(b => {
    const q = searchTerm.toLowerCase();
    const matchQ = b.title.toLowerCase().includes(q) || (b.author_name || '').toLowerCase().includes(q);
    const matchC = selectedCategory ? b.category_name === selectedCategory : true;
    return matchQ && matchC;
  });


  const handleBorrow = book => {
    if (!user) { navigate('/login'); return; }
    if (book.stock <= 0) { alert('Rất tiếc! Sách đã hết. Hãy quay lại sau.'); return; }
    alert(`✅ Đã ghi nhận yêu cầu mượn "${book.title}".\nVui lòng đến quầy thư viện xuất trình mã độc giả để nhận sách!`);
  };

  const handleViewDetail = book => {
    navigate(`/books/${book.book_id}`);
  };

  const toggleLike = (id, e) => {
    e.stopPropagation();
    setLiked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const catColors = [
    'linear-gradient(135deg,#f093fb,#f5576c)',
    'linear-gradient(135deg,#4facfe,#00f2fe)',
    'linear-gradient(135deg,#43e97b,#38f9d7)',
    'linear-gradient(135deg,#fa709a,#fee140)',
    'linear-gradient(135deg,#a18cd1,#fbc2eb)',
    'linear-gradient(135deg,#ff9a44,#fc6076)',
  ];

  const featured = books[0];

  /* ── Light color tokens ── */
  const bg = '#f8fafc';
  const surface = '#ffffff';
  const border = '#e2e8f0';
  const textPrim = '#0f172a';
  const textSec = '#475569';
  const textMut = '#94a3b8';
  const accent = '#6366f1';

  return (
    <div style={{ minHeight: '100vh', background: bg, color: textPrim, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ══════ NAVBAR ══════ */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 200, background: 'rgba(248,250,252,0.95)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${border}`, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 2rem' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '1.4rem', fontWeight: 900, color: accent }} onClick={() => { setCurrentView('home'); setSearchTerm(''); setSelectedCategory(null); }}>
            <div style={{ width: '10px', height: '10px', background: accent, borderRadius: '50%', boxShadow: `0 0 10px ${accent}` }} />
            OpenLib
          </div>

          {/* Nav links */}
          <div style={{ display: 'flex', gap: '0.25rem', fontSize: '0.92rem' }}>
            {[
              { id: 'home', label: 'Trang chủ' },
              { id: 'library', label: 'Thư viện' },
              { id: 'about', label: 'Giới thiệu' },
              { id: 'contact', label: 'Liên hệ' },
              ...(user ? [{ id: 'mybookshelf', label: 'Tủ sách' }] : []),
            ].map(item => (
              <button
                key={item.id}
                onClick={() => { setCurrentView(item.id); setSearchTerm(''); setSelectedCategory(null); }}
                style={{
                  background: currentView === item.id ? 'rgba(99,102,241,0.1)' : 'transparent',
                  border: 'none',
                  color: currentView === item.id ? accent : textSec,
                  fontWeight: currentView === item.id ? 800 : 600,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  transition: 'all .2s',
                  position: 'relative',
                }}
                onMouseEnter={e => { if (currentView !== item.id) { e.currentTarget.style.background = 'rgba(99,102,241,0.06)'; e.currentTarget.style.color = accent; } }}
                onMouseLeave={e => { if (currentView !== item.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = textSec; } }}
              >
                {item.label}
                {currentView === item.id && (
                  <div style={{ position: 'absolute', bottom: '-1px', left: '50%', transform: 'translateX(-50%)', width: '20px', height: '2px', background: accent, borderRadius: '2px' }} />
                )}
              </button>
            ))}
          </div>

          {/* Right side actions */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {user ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: `linear-gradient(135deg,${accent},#8b5cf6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', color: '#fff' }}>
                    {(user.full_name || user.username)[0].toUpperCase()}
                  </div>
                  <span style={{ fontWeight: 700, color: textPrim }}>{user.full_name || user.username}</span>
                </div>
                {(user.role === 'admin' || user.role === 'Admin' || user.role === 'Librarian' || user.role === 'librarian') && (
                  <button onClick={() => navigate('/admin')} style={{ background: `linear-gradient(135deg,${accent},#8b5cf6)`, color: '#fff', border: 'none', padding: '0.5rem 1.1rem', borderRadius: '50px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
                    <LayoutDashboard size={14} /> Quản Trị
                  </button>
                )}
                <button onClick={onLogout} style={{ background: surface, border: `1px solid ${border}`, color: textSec, padding: '0.5rem 1.1rem', borderRadius: '50px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>Đăng xuất</button>
              </>
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

      {/* ══════ ABOUT VIEW ══════ */}
      {currentView === 'about' && (
        <div>
          {/* Hero */}
          <section style={{ background: 'linear-gradient(135deg,#ede9fe 0%,#e0e7ff 50%,#faf5ff 100%)', padding: '6rem 2rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,0.15) 0%,transparent 70%)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', padding: '0.4rem 1.2rem', borderRadius: '50px', color: accent, fontSize: '0.78rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                📖 Về chúng tôi
              </div>
              <h1 style={{ fontSize: 'clamp(2rem,4vw,3.5rem)', fontWeight: 900, color: textPrim, marginBottom: '1.25rem', lineHeight: 1.15 }}>
                Thư viện số dành cho<br />
                <span style={{ color: accent }}>thế hệ tri thức mới</span>
              </h1>
              <p style={{ fontSize: '1.15rem', color: textSec, maxWidth: '580px', margin: '0 auto', lineHeight: 1.7 }}>
                OpenLib là hệ thống thư viện kỹ thuật số mã nguồn mở, được xây dựng nhằm mục tiêu số hóa, kết nối và phát triển văn hóa đọc trong cộng đồng.
              </p>
            </div>
          </section>

          {/* Stats */}
          <section style={{ background: surface, padding: '3rem 2rem', borderBottom: `1px solid ${border}` }}>
            <div className="container" style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { value: books.length + '+', label: 'Đầu sách số hóa', color: '#6366f1' },
                { value: authors.length + '+', label: 'Tác giả trong hệ thống', color: '#8b5cf6' },
                { value: categories.length, label: 'Thể loại phong phú', color: '#10b981' },
                { value: '24/7', label: 'Phục vụ liên tục', color: '#f59e0b' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '1.5rem 2.5rem' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: s.color, marginBottom: '0.3rem' }}>{s.value}</div>
                  <div style={{ color: textSec, fontSize: '0.9rem', fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Mission & Vision */}
          <section className="container" style={{ padding: '5rem 2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '2rem' }}>
              {[
                { icon: '🎯', title: 'Sứ mệnh', color: '#ede9fe', desc: 'Tạo nền tảng học liệu mở, giúp mọi người tiếp cận tri thức một cách dễ dàng và miễn phí. Chúng tôi tin rằng tri thức phải là quyền lợi của tất cả mọi người, không phân biệt hoàn cảnh.' },
                { icon: '🔭', title: 'Tầm nhìn', color: '#e0e7ff', desc: 'Trở thành nền tảng thư viện số hàng đầu Việt Nam vào năm 2026, phục vụ hàng triệu độc giả với kho tàng sách phong phú và hệ thống quản lý thông minh.' },
                { icon: '💡', title: 'Giá trị cốt lõi', color: '#fef3c7', desc: 'Minh bạch — Đổi mới — Kết nối. Chúng tôi cam kết xây dựng một cộng đồng đọc sách lành mạnh, nơi tri thức được chia sẻ và trân trọng.' },
              ].map((card, i) => (
                <div key={i} style={{ background: card.color, borderRadius: '1.5rem', padding: '2.5rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{card.icon}</div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: textPrim, marginBottom: '1rem' }}>{card.title}</h3>
                  <p style={{ color: textSec, lineHeight: 1.7 }}>{card.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Features */}
          <section style={{ background: 'linear-gradient(135deg,#f0f4ff,#faf5ff)', padding: '5rem 2rem' }}>
            <div className="container">
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: textPrim, marginBottom: '0.75rem' }}>Tính năng nổi bật</h2>
                <p style={{ color: textSec, fontSize: '1rem' }}>Công nghệ hiện đại phục vụ trải nghiệm đọc sách đẳng cấp</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: '1.5rem' }}>
                {[
                  { icon: <Search size={26} color="#6366f1" />, title: 'Tìm kiếm thông minh', desc: 'Tìm sách theo tên, tác giả hay thể loại chỉ trong vài giây.', bg: '#ede9fe' },
                  { icon: <BookMarked size={26} color="#10b981" />, title: 'Mượn trả dễ dàng', desc: 'Đặt mượn trực tuyến và nhận sách tại quầy không cần chờ đợi lâu.', bg: '#d1fae5' },
                  { icon: <Shield size={26} color="#f59e0b" />, title: 'Quản lý tài khoản', desc: 'Theo dõi lịch sử mượn, danh sách yêu thích và thông báo hạn trả.', bg: '#fef3c7' },
                  { icon: <Globe size={26} color="#8b5cf6" />, title: 'Truy cập mọi nơi', desc: 'Giao diện responsive, tương thích mọi thiết bị từ desktop đến điện thoại.', bg: '#f3e8ff' },
                  { icon: <Zap size={26} color="#ef4444" />, title: 'Cập nhật liên tục', desc: 'Kho sách mới được cập nhật mỗi tuần với hàng trăm đầu sách mới.', bg: '#fee2e2' },
                  { icon: <Users size={26} color="#06b6d4" />, title: 'Cộng đồng đọc sách', desc: 'Đánh giá, chia sẻ cảm nhận và kết nối với độc giả cùng sở thích.', bg: '#cffafe' },
                ].map((feat, i) => (
                  <div key={i} style={{ background: feat.bg, borderRadius: '1.25rem', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ width: '52px', height: '52px', background: surface, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>{feat.icon}</div>
                    <h4 style={{ fontWeight: 800, fontSize: '1rem', color: textPrim }}>{feat.title}</h4>
                    <p style={{ color: textSec, fontSize: '0.875rem', lineHeight: 1.6 }}>{feat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Team */}
          <section className="container" style={{ padding: '5rem 2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: textPrim, marginBottom: '0.75rem' }}>Đội ngũ phát triển</h2>
              <p style={{ color: textSec }}>Những người xây dựng OpenLib với niềm đam mê công nghệ và tri thức</p>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { name: 'Nguyễn Văn An', role: 'Backend Developer', avatar: 'A', color: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
                { name: 'Trần Thị Bích', role: 'Frontend Developer', avatar: 'B', color: 'linear-gradient(135deg,#ec4899,#f43f5e)' },
                { name: 'Lê Minh Cường', role: 'UI/UX Designer', avatar: 'C', color: 'linear-gradient(135deg,#10b981,#06b6d4)' },
                { name: 'Phạm Thảo Dương', role: 'Database Admin', avatar: 'D', color: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
              ].map((member, i) => (
                <div key={i} style={{ background: surface, border: `1px solid ${border}`, borderRadius: '1.5rem', padding: '2rem 1.5rem', textAlign: 'center', width: '200px', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', transition: 'transform .25s, box-shadow .25s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(99,102,241,0.12)'; }} onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.05)'; }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: member.color, margin: '0 auto 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 900, color: '#fff', boxShadow: '0 8px 20px rgba(0,0,0,0.14)' }}>
                    {member.avatar}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: textPrim, marginBottom: '0.35rem' }}>{member.name}</div>
                  <div style={{ fontSize: '0.8rem', color: accent, fontWeight: 700 }}>{member.role}</div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="container" style={{ padding: '1rem 2rem 5rem' }}>
            <div style={{ background: `linear-gradient(135deg,${accent} 0%,#8b5cf6 100%)`, borderRadius: '2rem', padding: '3.5rem 2rem', textAlign: 'center', boxShadow: '0 20px 50px rgba(99,102,241,0.3)' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '1rem' }}>Sẵn sàng khám phá kho sách?</h2>
              <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '2rem', fontSize: '1.05rem' }}>Hơn {books.length} đầu sách đang chờ bạn.</p>
              <button onClick={() => setCurrentView('library')} style={{ background: '#fff', color: accent, border: 'none', padding: '0.9rem 2.5rem', borderRadius: '50px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                Khám phá ngay →
              </button>
            </div>
          </section>
        </div>
      )}

      {/* ══════ CONTACT VIEW ══════ */}
      {currentView === 'contact' && (
        <div>
          <section style={{ background: 'linear-gradient(135deg,#ede9fe 0%,#e0e7ff 60%,#f0fdf4 100%)', padding: '5rem 2rem 3rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', padding: '0.4rem 1.2rem', borderRadius: '50px', color: accent, fontSize: '0.78rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
              📬 Liên hệ
            </div>
            <h1 style={{ fontSize: 'clamp(1.8rem,3.5vw,3rem)', fontWeight: 900, color: textPrim, marginBottom: '1rem' }}>Chúng tôi luôn lắng nghe bạn</h1>
            <p style={{ color: textSec, fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>Có câu hỏi về dịch vụ hoặc muốn hợp tác? Hãy gửi cho chúng tôi!</p>
          </section>

          <section className="container" style={{ padding: '4rem 2rem 5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '3rem', alignItems: 'start' }}>
              {/* Contact Info */}
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: textPrim, marginBottom: '2rem' }}>Thông tin liên lạc</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {[
                    { icon: <MapPin size={22} color={accent} />, title: 'Địa chỉ', info: '123 Đường Tri Thức, Quận 1, TP. Hồ Chí Minh', bg: '#ede9fe' },
                    { icon: <Phone size={22} color="#10b981" />, title: 'Điện thoại', info: '(028) 1234 5678', bg: '#d1fae5' },
                    { icon: <Mail size={22} color="#f59e0b" />, title: 'Email', info: 'admin@openlib.edu.vn', bg: '#fef3c7' },
                    { icon: <Clock size={22} color="#8b5cf6" />, title: 'Giờ làm việc', info: 'Thứ 2 – Thứ 7: 7:30 – 17:00', bg: '#f3e8ff' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ width: '48px', height: '48px', background: item.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: textMut, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>{item.title}</div>
                        <div style={{ fontWeight: 600, color: textPrim }}>{item.info}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Form */}
              <div style={{ background: surface, borderRadius: '1.5rem', padding: '2.5rem', border: `1px solid ${border}`, boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: textPrim, marginBottom: '1.5rem' }}>Gửi tin nhắn</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: textSec, marginBottom: '0.5rem' }}>Họ và tên</label>
                    <input type="text" placeholder="Nguyễn Văn A" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: `1px solid ${border}`, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', color: textPrim, background: bg }} onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = border} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: textSec, marginBottom: '0.5rem' }}>Email</label>
                    <input type="email" placeholder="email@example.com" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: `1px solid ${border}`, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', color: textPrim, background: bg }} onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = border} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: textSec, marginBottom: '0.5rem' }}>Nội dung</label>
                    <textarea rows={5} placeholder="Nhập nội dung tin nhắn..." style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: `1px solid ${border}`, fontSize: '0.95rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', color: textPrim, background: bg, fontFamily: 'inherit' }} onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = border} />
                  </div>
                  <button onClick={() => alert('✅ Tin nhắn đã được gửi! Chúng tôi sẽ phản hồi trong 24 giờ.')} style={{ background: `linear-gradient(135deg,${accent},#8b5cf6)`, color: '#fff', border: 'none', padding: '0.9rem', borderRadius: '10px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 8px 20px rgba(99,102,241,0.3)', transition: 'transform .2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={e => e.currentTarget.style.transform = ''}>
                    Gửi tin nhắn ✉️
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ══════ MY BOOKSHELF VIEW ══════ */}
      {currentView === 'mybookshelf' && user && (
        <div style={{ minHeight: '60vh' }}>
          <section style={{ background: 'linear-gradient(135deg,#ede9fe,#e0e7ff)', padding: '4rem 2rem 2rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: textPrim, marginBottom: '0.75rem' }}>📚 Tủ sách của tôi</h1>
            <p style={{ color: textSec, fontSize: '1.05rem' }}>Xin chào, <strong>{user.full_name || user.username}</strong>! Đây là các sách bạn yêu thích.</p>
          </section>
          <div className="container" style={{ padding: '3rem 2rem' }}>
            {Object.keys(liked).filter(id => liked[id]).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: surface, borderRadius: '1.5rem', border: `1px dashed ${border}` }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💔</div>
                <h3 style={{ color: textPrim, marginBottom: '0.5rem' }}>Chưa có sách yêu thích</h3>
                <p style={{ color: textMut }}>Hãy khám phá thư viện và nhấn ❤️ để lưu sách yêu thích!</p>
                <button onClick={() => setCurrentView('library')} style={{ marginTop: '1.5rem', background: `linear-gradient(135deg,${accent},#8b5cf6)`, color: '#fff', border: 'none', padding: '0.75rem 1.8rem', borderRadius: '50px', fontWeight: 700, cursor: 'pointer' }}>Khám phá thư viện</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '2rem' }}>
                {books.filter(b => liked[b.book_id]).map(book => (
                  <BookCard key={book.book_id} book={book} avgRating={reviews.filter(r => r.book === book.book_id).length ? Math.round(reviews.filter(r => r.book === book.book_id).reduce((s, r) => s + r.rating, 0) / reviews.filter(r => r.book === book.book_id).length * 10) / 10 : 4.5} onClick={setActiveBook} onBorrow={handleBorrow} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════ HOME & LIBRARY VIEWS ══════ */}
      {(currentView === 'home' || currentView === 'library') && (
        <div>

      {/* ══════ HERO ══════ */}
      {currentView === 'home' && !searchTerm && !loading && featured && (
        <section style={{ position: 'relative', minHeight: '82vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: 'linear-gradient(135deg, #ede9fe 0%, #e0e7ff 40%, #f0fdf4 100%)' }}>
          {/* Decorative blobs */}
          <div style={{ position: 'absolute', top: '-10%', right: '5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: '-5%', left: '0%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />

          <div className="container" style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '5rem', alignItems: 'center', padding: '5rem 2rem' }}>
            {/* Text */}
            <div style={{ flex: 1, maxWidth: '600px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', padding: '0.4rem 1rem', borderRadius: '50px', marginBottom: '1.5rem', color: accent, fontSize: '0.78rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase' }}>
                <Star size={12} fill={accent} /> Nổi bật nhất tuần
              </div>
              <h1 style={{ fontSize: 'clamp(2.2rem,4.5vw,3.8rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1rem', color: textPrim }}>
                {featured.title}
              </h1>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <Stars rating={Math.round(avgRatingFor(featured))} />
                <span style={{ color: textSec }}>•</span>
                <span style={{ fontWeight: 700, color: textPrim }}>{featured.author_name}</span>
                <span style={{ background: 'rgba(99,102,241,0.1)', padding: '0.2rem 0.8rem', borderRadius: '50px', fontSize: '0.8rem', color: accent, fontWeight: 700 }}>{featured.category_name}</span>
                <span style={{ color: featured.stock > 0 ? '#10b981' : '#ef4444', fontWeight: 700, fontSize: '0.9rem' }}>
                  {featured.stock > 0 ? `✓ Còn ${featured.stock} cuốn` : '✕ Đã hết'}
                </span>
              </div>
              <p style={{ color: textSec, fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '520px' }}>
                Một tác phẩm kinh điển mang đến kho tàng tri thức vô giá. Được hàng nghìn độc giả yêu thích và đánh giá cao. Khám phá ngay hôm nay tại OpenLib!
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button onClick={() => handleBorrow(featured)} style={{ background: `linear-gradient(135deg,${accent},#8b5cf6)`, color: '#fff', border: 'none', padding: '0.9rem 2.2rem', borderRadius: '50px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 24px rgba(99,102,241,0.35)', transition: 'transform .2s, box-shadow .2s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; }} onMouseLeave={e => { e.currentTarget.style.transform = ''; }}>
                  <Play size={18} fill="#fff" /> Mượn ngay
                </button>
                <button onClick={() => handleViewDetail(featured)} style={{ background: surface, color: textPrim, border: `1px solid ${border}`, padding: '0.9rem 2.2rem', borderRadius: '50px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'box-shadow .2s' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'} onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}>
                  Xem chi tiết
                </button>
              </div>
            </div>

            {/* Book cover 3D */}
            <div style={{ flex: '0 0 auto', width: '280px' }}>
              <div onClick={() => handleViewDetail(featured)} style={{ width: '280px', height: '390px', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 30px 60px rgba(99,102,241,0.25), 0 0 0 1px rgba(99,102,241,0.1)', cursor: 'pointer', transform: 'perspective(900px) rotateY(-12deg) rotateX(3deg)', transition: 'transform 0.5s' }} onMouseEnter={e => e.currentTarget.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) scale(1.04)'} onMouseLeave={e => e.currentTarget.style.transform = 'perspective(900px) rotateY(-12deg) rotateX(3deg)'}>
                {featured.image ? <img src={featured.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={featured.title} /> : <div style={{ height: '100%', background: 'linear-gradient(135deg,#e0e7ff,#f3e8ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BookOpen size={64} color={accent} opacity={0.4} /></div>}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════ SEARCH BAR ══════ */}
      <section style={{ position: 'relative', zIndex: 10, marginTop: searchTerm || currentView === 'library' ? '3rem' : '-2rem', padding: '0 1rem' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', background: surface, borderRadius: '60px', padding: '0.4rem 0.4rem 0.4rem 1.5rem', display: 'flex', gap: '0.5rem', boxShadow: '0 8px 40px rgba(99,102,241,0.14)', border: `1px solid ${border}`, alignItems: 'center' }}>
          <Search size={22} color={textMut} style={{ flexShrink: 0 }} />
          <input
            ref={searchRef}
            type="text"
            placeholder="Tìm tên sách, tác giả..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setSelectedCategory(null); }}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '1rem', color: textPrim, padding: '0.8rem 0.5rem' }}
          />
          {searchTerm && (
            <button onClick={() => { setSearchTerm(''); setSelectedCategory(null); }} style={{ background: 'transparent', border: 'none', color: textMut, cursor: 'pointer', padding: '0.5rem' }}>
              <X size={18} />
            </button>
          )}
          <button style={{ background: `linear-gradient(135deg,${accent},#8b5cf6)`, color: '#fff', border: 'none', borderRadius: '50px', padding: '0.7rem 1.6rem', fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
            Tìm kiếm
          </button>
        </div>
      </section>

      {/* ══════ STATS BAR ══════ */}
      {!searchTerm && currentView === 'home' && (
        <section className="container" style={{ padding: '4rem 2rem 1rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: <BookCopy size={28} color={accent} />, val: bookCount, label: 'Đầu sách', suffix: '+', bg: '#ede9fe' },
              { icon: <PenTool size={28} color="#ec4899" />, val: authorCount, label: 'Tác giả', suffix: '+', bg: '#fce7f3' },
              { icon: <LibraryBig size={28} color="#10b981" />, val: catCount, label: 'Thể loại', suffix: '', bg: '#d1fae5' },
              { icon: <Clock size={28} color="#f59e0b" />, val: '24/7', label: 'Phục vụ', suffix: '', bg: '#fef3c7' },
            ].map((s, i) => (
              <div key={i} style={{ flex: '0 0 auto', textAlign: 'center', background: s.bg, borderRadius: '1.25rem', padding: '1.5rem 2.5rem', minWidth: '150px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>{s.icon}</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: textPrim }}>{s.val}{s.suffix}</div>
                <div style={{ fontSize: '0.85rem', color: textSec }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════ CATEGORIES ══════ */}
      {!searchTerm && !loading && categories.length > 0 && currentView === 'home' && (
        <section className="container" style={{ padding: '3rem 2rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: textPrim }}>Chuyên Mục</h2>
            {selectedCategory && (
              <button onClick={() => setSelectedCategory(null)} style={{ background: 'rgba(99,102,241,0.08)', border: `1px solid rgba(99,102,241,0.25)`, color: accent, padding: '0.4rem 1rem', borderRadius: '50px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <X size={14} /> Bỏ lọc: {selectedCategory}
              </button>
            )}
          </div>
          <div className="hide-scrollbar" style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            <div onClick={() => setSelectedCategory(null)} style={{ minWidth: '130px', height: '100px', borderRadius: '1rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: !selectedCategory ? `linear-gradient(135deg,${accent},#8b5cf6)` : surface, border: !selectedCategory ? 'none' : `1px solid ${border}`, color: !selectedCategory ? '#fff' : textPrim, cursor: 'pointer', transition: 'transform .25s', boxShadow: !selectedCategory ? '0 4px 16px rgba(99,102,241,0.3)' : '0 2px 8px rgba(0,0,0,0.06)' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>Tất cả</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.75 }}>{books.length} sách</div>
            </div>
            {categories.map((cat, i) => {
              const booksInCat = books.filter(b => b.category_name === cat.name).length;
              const isSelected = selectedCategory === cat.name;
              return (
                <div key={cat.category_id} onClick={() => setSelectedCategory(cat.name)} style={{ minWidth: '160px', height: '100px', borderRadius: '1rem', padding: '1.25rem', position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: 'transform .25s', background: catColors[i % catColors.length], outline: isSelected ? `3px solid ${accent}` : 'none', outlineOffset: '2px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                  <LibraryBig size={60} color="rgba(0,0,0,0.1)" style={{ position: 'absolute', bottom: '-8px', right: '-8px' }} />
                  <div style={{ color: '#000', fontWeight: 800, fontSize: '0.95rem', position: 'relative', zIndex: 2 }}>{cat.name}</div>
                  <div style={{ color: 'rgba(0,0,0,0.55)', fontSize: '0.75rem', position: 'relative', zIndex: 2 }}>{booksInCat} đầu sách</div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ══════ BOOK GRID ══════ */}
      <main className="container" style={{ padding: '2rem 2rem 4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem', color: textPrim }}>
            {searchTerm ? <><Search size={22} /> Kết quả tìm kiếm</> : selectedCategory ? <><Filter size={22} /> {selectedCategory}</> : <><TrendingUp size={22} color={accent} /> Không Thể Bỏ Lỡ</>}
          </h2>
          <span style={{ background: 'rgba(99,102,241,0.08)', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.85rem', color: accent, fontWeight: 700 }}>
            {filteredBooks.length} tác phẩm
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: textMut }}>
            <div style={{ width: '44px', height: '44px', border: `3px solid ${accent}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
            Đang tải kho sách...
          </div>
        ) : filteredBooks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', background: surface, borderRadius: '1.5rem', border: `1px dashed ${border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <BookOpen size={56} style={{ margin: '0 auto 1rem', opacity: 0.2, display: 'block' }} />
            <h3 style={{ marginBottom: '0.5rem', color: textPrim }}>Không tìm thấy sách nào</h3>
            <p style={{ color: textMut }}>Thử từ khóa khác hoặc bỏ bộ lọc thể loại.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '2.5rem 1.5rem' }}>
            {filteredBooks.slice((!searchTerm && !selectedCategory) ? 1 : 0).map(book => (
              <BookCard key={book.book_id} book={book} avgRating={avgRatingFor(book)} onClick={handleViewDetail} onBorrow={handleBorrow} />
            ))}
          </div>
        )}
      </main>

      {/* ══════ AUTHORS SECTION ══════ */}
      {!searchTerm && !loading && authors.length > 0 && currentView === 'home' && (
        <section style={{ background: surface, borderTop: `1px solid ${border}`, padding: '4rem 0' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', padding: '0 2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: textPrim }}>Tác Giả Nổi Bật</h2>
              <span style={{ color: accent, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.9rem' }}>
                Tất cả <ChevronRight size={16} />
              </span>
            </div>
            <div className="hide-scrollbar" style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', padding: '0 2rem 1rem' }}>
              {authors.map((a, i) => {
                const byCnt = books.filter(b => b.author_name === a.name).length;
                return (
                  <div key={a.author_id} style={{ minWidth: '170px', background: bg, border: `1px solid ${border}`, borderRadius: '1.25rem', padding: '1.5rem 1rem', textAlign: 'center', cursor: 'pointer', transition: 'transform .25s, border-color .25s, box-shadow .25s', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = accent; e.currentTarget.style.boxShadow = `0 12px 30px rgba(99,102,241,0.15)`; }} onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = border; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: catColors[i % catColors.length], margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 900, color: '#000', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      {a.name[0]}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem', color: textPrim }}>{a.name}</div>
                    <div style={{ fontSize: '0.78rem', color: textMut }}>{byCnt} tác phẩm</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══════ REVIEWS ══════ */}
      {!searchTerm && !loading && reviews.length > 0 && currentView === 'home' && (
        <section style={{ padding: '4rem 0', background: 'linear-gradient(135deg,#f0f4ff,#faf5ff)' }}>
          <div className="container" style={{ padding: '0 2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem', color: textPrim }}>Cộng Đồng Độc Giả Nói Gì?</h2>
              <p style={{ color: textSec }}>Hàng nghìn lời khen từ những người yêu sách thực thụ.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {reviews.slice(0, 4).map((rev, i) => (
                <div key={i} style={{ background: surface, border: `1px solid ${border}`, borderRadius: '1.25rem', padding: '1.75rem', position: 'relative', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                  <Quote size={36} color={accent} style={{ opacity: 0.12, position: 'absolute', top: '1.25rem', right: '1.25rem' }} />
                  <div style={{ marginBottom: '0.75rem' }}><Stars rating={rev.rating} /></div>
                  <p style={{ fontStyle: 'italic', lineHeight: 1.6, marginBottom: '1.5rem', color: textSec, fontSize: '0.95rem' }}>"{rev.comment}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderTop: `1px solid ${border}`, paddingTop: '1rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: catColors[i % catColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', color: '#000' }}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: textPrim }}>Độc giả #{rev.user}</div>
                      <div style={{ fontSize: '0.75rem', color: textMut }}>Đánh giá sách #{rev.book}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════ CTA BANNER ══════ */}
      {!searchTerm && !user && currentView === 'home' && (
        <section className="container" style={{ padding: '2rem 2rem 5rem' }}>
          <div style={{ background: `linear-gradient(135deg, ${accent} 0%, #8b5cf6 50%, #a78bfa 100%)`, borderRadius: '2rem', padding: '4rem 3rem', textAlign: 'center', boxShadow: '0 20px 60px rgba(99,102,241,0.35)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ position: 'absolute', bottom: '-80px', left: '-30px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📚</div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', marginBottom: '1rem' }}>Tham Gia Cộng Đồng OpenLib</h2>
              <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.88)', maxWidth: '520px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>Đăng ký miễn phí để mượn sách, lưu danh sách yêu thích và nhận thông báo khi có sách mới.</p>
              <button onClick={() => navigate('/login')} style={{ background: '#fff', color: accent, border: 'none', padding: '1rem 3rem', fontSize: '1.05rem', borderRadius: '50px', fontWeight: 800, cursor: 'pointer', transition: 'transform .2s, box-shadow .2s', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }} onMouseLeave={e => { e.currentTarget.style.transform = ''; }}>
                Đăng Ký Ngay — Miễn Phí
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ══════ FOOTER ══════ */}
      <footer style={{ background: '#1e293b', color: '#94a3b8', padding: '3rem 2rem 2rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', fontSize: '1.3rem', fontWeight: 900, color: '#fff' }}>
                <div style={{ width: '10px', height: '10px', background: accent, borderRadius: '50%', boxShadow: `0 0 8px ${accent}` }} />
                OpenLib
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
      )}

    </div>
  );
};

export default PublicPage;

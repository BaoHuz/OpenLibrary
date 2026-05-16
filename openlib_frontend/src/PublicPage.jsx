import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import {
  BookOpen, Search, LogIn, BookMarked, Star, TrendingUp,
  LibraryBig, PenTool, LayoutDashboard, Quote, ChevronRight, Play,
  X, BookCopy, Users, Award, Clock, Heart, Eye, Filter,
  MapPin, Phone, Mail, CheckCircle, Zap, Shield, Globe, Menu,
  Bell, CreditCard, History, UserCog, Unlock, Tag
} from 'lucide-react';
import { getImageUrl } from './utils/imageUrl';
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
/* ── Stat Card for About page ── */
const StatCard = ({ icon, target, suffix, label, color, bg, surface }) => {
  const animVal = useCounter(target, 1200);
  return (
    <div style={{ textAlign: 'center', padding: '2rem 1rem', background: bg, borderRadius: '1.25rem', transition: 'transform .25s, box-shadow .25s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 28px ${color}20`; }} onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'none'; }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: surface, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: color, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>{icon}</div>
      <div style={{ fontSize: '2.25rem', fontWeight: 900, color: color, marginBottom: '0.3rem' }}>{target > 0 ? animVal : ''}{suffix}</div>
      <div style={{ color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>{label}</div>
    </div>
  );
};

/* ── Book Card (light) ── */
const BookCard = ({ book, avgRating, onClick, onBorrow, liked, onToggleLike }) => (
  <div
    onClick={() => onClick(book)}
    style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', cursor: 'pointer' }}
    className="book-card-hover"
  >
    <div style={{ height: '320px', borderRadius: '1rem', overflow: 'hidden', background: 'linear-gradient(135deg,#e0e7ff,#f3e8ff)', position: 'relative', boxShadow: '0 4px 20px rgba(99,102,241,0.12)' }} className="poster-wrapper">
      {book.image
        ? <img src={getImageUrl(book.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={book.title} />
        : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BookOpen size={48} color="rgba(99,102,241,0.3)" /></div>
      }
      {/* Stock badge */}
      <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: book.stock > 0 ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)', color: '#fff', padding: '0.25rem 0.6rem', borderRadius: '50px', fontSize: '0.72rem', fontWeight: 800, backdropFilter: 'blur(6px)' }}>
        {book.stock > 0 ? `${book.stock} cuốn` : 'Hết sách'}
      </div>
      {/* Like button */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleLike(book.book_id); }}
        style={{
          position: 'absolute', top: '0.75rem', right: '0.75rem',
          width: '36px', height: '36px', borderRadius: '50%',
          background: liked ? '#ef4444' : 'rgba(255,255,255,0.9)',
          border: 'none', color: liked ? '#fff' : '#94a3b8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', backdropFilter: 'blur(6px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'all .2s'
        }}
      >
        <Heart size={16} fill={liked ? '#fff' : 'none'} />
      </button>
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
  const { currentView, setCurrentView, searchTerm, setSearchTerm, selectedCategory, setSelectedCategory } = useOutletContext();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  // New States for Profile, Notifications & advanced filters
  const [activeProfileTab, setActiveProfileTab] = useState('info');
  const [filters, setFilters] = useState({
    stock: 'all',
    sortBy: 'latest',
    minRating: 0
  });
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [fines, setFines] = useState([]);
  const [catPage, setCatPage] = useState(1);
  const [authorPage, setAuthorPage] = useState(1);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [authorSearchTerm, setAuthorSearchTerm] = useState('');
  const [followedAuthors, setFollowedAuthors] = useState(() => {
    try {
      const stored = localStorage.getItem(`followed_${user?.username || 'guest'}`);
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [reviews, setReviews] = useState([]);

  const navigate = useNavigate();
  const [heroIndex, setHeroIndex] = useState(0);
  const searchRef = useRef(null);

  const getStorageKey = () => user ? `liked_${user.username}` : 'liked_guest';
  const [liked, setLiked] = useState(() => {
    try {
      const stored = localStorage.getItem(getStorageKey());
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [booksRes, catsRes, authsRes, reviewsRes] = await Promise.all([
          axios.get(`${API}/books/`),
          axios.get(`${API}/categories/`),
          axios.get(`${API}/authors/`),
          axios.get(`${API}/reviews/`)
        ]);
        setBooks(booksRes.data || []);
        setCategories(catsRes.data || []);
        setAuthors(authsRes.data || []);
        setReviews(reviewsRes.data || []);

        if (user) {
          setBorrowHistory([
            { id: 'B1', title: 'Clean Code', borrow_date: '2026-03-15', due_date: '2026-03-30', status: 'borrowing' },
            { id: 'B2', title: 'Refactoring', borrow_date: '2026-02-10', due_date: '2026-02-25', status: 'returned' },
            { id: 'B3', title: 'Deep Work', borrow_date: '2026-01-05', due_date: '2026-01-20', status: 'overdue' },
          ]);
          setFines([
            { id: 'F1', book: 'Deep Work', amount: 35000, reason: 'Quá hạn 7 ngày', status: 'unpaid', date: '2026-01-27' },
          ]);
        }
      } catch (e) {
        console.error('Fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const bookCount = useCounter(books.length);
  const authorCount = useCounter(authors.length);
  const catCount = useCounter(categories.length);

  const avgRatingFor = book => {
    const rs = reviews.filter(r => r.book === book.book_id);
    return rs.length ? Math.round(rs.reduce((s, r) => s + r.rating, 0) / rs.length * 10) / 10 : 4.5;
  };

  const BOOKS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever filters/search/category change
  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedCategory, filters]);

  const filteredBooks = books.filter(b => {
    const matchesSearch = (b.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (b.author_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? b.category_name === selectedCategory : true;
    const matchesStock = filters.stock === 'all' ? true : (filters.stock === 'available' ? b.stock > 0 : b.stock === 0);
    const matchesRating = avgRatingFor(b) >= filters.minRating;
    return matchesSearch && matchesCategory && matchesStock && matchesRating;
  }).sort((a, b) => {
    if (filters.sortBy === 'latest') return b.book_id - a.book_id;
    if (filters.sortBy === 'title') return a.title.localeCompare(b.title);
    if (filters.sortBy === 'rating') return avgRatingFor(b) - avgRatingFor(a);
    return 0;
  });

  const totalPages = Math.ceil(
    (currentView === 'home' && !searchTerm && !selectedCategory
      ? filteredBooks.slice(1)
      : filteredBooks
    ).length / BOOKS_PER_PAGE
  );

  const handleBorrow = async book => {
    if (!user) { navigate('/login'); return; }
    if (book.stock <= 0) { alert('Rất tiếc! Sách đã hết. Hãy quay lại sau.'); return; }
    
    try {
      const res = await axios.post(`${API}/borrow_request/`, {
        username: user.username,
        book_id: book.book_id,
      });
      alert(`✅ ${res.data.message}\nMã phiếu: #${res.data.ticket_id}`);
    } catch (err) {
      alert(`❌ Lỗi: ${err.response?.data?.error || 'Không thể tạo yêu cầu mượn. Vui lòng thử lại.'}`);
    }
  };

  const handleViewDetail = book => {
    navigate(`/books/${book.book_id}`);
  };

  const handleAuthorClick = (author) => {
    setSelectedAuthor(author);
    setCurrentView('authordetail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleLike = (id, e) => {
    e.stopPropagation();
    setLiked(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(getStorageKey(), JSON.stringify(next));
      return next;
    });
  };

  const toggleFollowAuthor = (id) => {
    setFollowedAuthors(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(`followed_${user?.username || 'guest'}`, JSON.stringify(next));
      return next;
    });
  };

  const catColors = [
    'linear-gradient(135deg,#f093fb,#f5576c)',
    'linear-gradient(135deg,#4facfe,#00f2fe)',
    'linear-gradient(135deg,#43e97b,#38f9d7)',
    'linear-gradient(135deg,#fa709a,#fee140)',
    'linear-gradient(135deg,#a18cd1,#fbc2eb)',
    'linear-gradient(135deg,#ff9a44,#fc6076)',
  ];

  const topBooks = books.slice(0, 5);
  const featured = topBooks[heroIndex] || books[0];

  useEffect(() => {
    if (currentView === 'home' && !searchTerm && topBooks.length > 0) {
      const timer = setInterval(() => {
        setHeroIndex(prev => (prev + 1) % topBooks.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [currentView, searchTerm, topBooks.length]);

  /* ── Light color tokens ── */
  const bg = '#f8fafc';
  const surface = '#ffffff';
  const border = '#e2e8f0';
  const textPrim = '#0f172a';
  const textSec = '#475569';
  const textMut = '#94a3b8';
  const accent = '#6366f1';



  return (
    <div style={{ background: bg, color: textPrim, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ══════ BREADCRUMB ══════ */}
      {currentView !== 'home' && (() => {
        const crumbMap = {
          library:       [{ label: 'Thư viện', view: 'library' }],
          about:         [{ label: 'Giới thiệu', view: 'about' }],
          contact:       [{ label: 'Liên hệ', view: 'contact' }],
          wishlist:      [{ label: 'Tủ sách', view: 'wishlist' }],
          allcategories: [{ label: 'Chuyên Mục', view: 'allcategories' }],
          allauthors:    [{ label: 'Tác Giả', view: 'allauthors' }],
          authordetail:  [{ label: 'Tác Giả', view: 'allauthors' }, { label: selectedAuthor?.name || 'Chi tiết', view: 'authordetail' }],
          profile:       [{ label: 'Hồ sơ', view: 'profile' }],
        };
        const crumbs = crumbMap[currentView] || [];
        return (
          <div style={{
            background: surface,
            borderBottom: `1px solid ${border}`,
            padding: '0.75rem 2rem',
          }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
              <span
                onClick={() => setCurrentView('home')}
                style={{ color: accent, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
              >
                🏠 Trang chủ
              </span>
              {crumbs.map((crumb, i) => (
                <React.Fragment key={i}>
                  <ChevronRight size={14} color={textMut} />
                  {i === crumbs.length - 1 ? (
                    <span style={{ color: textPrim, fontWeight: 800 }}>{crumb.label}</span>
                  ) : (
                    <span
                      onClick={() => setCurrentView(crumb.view)}
                      style={{ color: accent, cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              ))}
              {selectedCategory && currentView === 'library' && (
                <>
                  <ChevronRight size={14} color={textMut} />
                  <span style={{ color: textPrim, fontWeight: 800 }}>{selectedCategory}</span>
                </>
              )}
              {searchTerm && currentView === 'library' && (
                <>
                  <ChevronRight size={14} color={textMut} />
                  <span style={{ color: textPrim, fontWeight: 800 }}>"{searchTerm}"</span>
                </>
              )}
            </div>
          </div>
        );
      })()}

      {/* ══════ ABOUT VIEW ══════ */}
      {currentView === 'about' && (
        <div>
          {/* Hero */}
          <section style={{ background: 'linear-gradient(135deg,#ede9fe 0%,#e0e7ff 50%,#faf5ff 100%)', padding: '5rem 2rem 4rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,0.15) 0%,transparent 70%)' }} />
            <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)' }} />
            <div className="container" style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', padding: '0.4rem 1.2rem', borderRadius: '50px', color: accent, fontSize: '0.78rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                  📖 Về chúng tôi
                </div>
                <h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, color: textPrim, marginBottom: '1.25rem', lineHeight: 1.2 }}>
                  Thư viện số dành cho<br />
                  <span style={{ background: `linear-gradient(135deg,${accent},#8b5cf6)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>thế hệ tri thức mới</span>
                </h1>
                <p style={{ fontSize: '1.1rem', color: textSec, maxWidth: '500px', lineHeight: 1.75, marginBottom: '2rem' }}>
                  OpenLib là hệ thống thư viện kỹ thuật số mã nguồn mở, được xây dựng nhằm mục tiêu số hóa, kết nối và phát triển văn hóa đọc trong cộng đồng.
                </p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button onClick={() => setCurrentView('library')} style={{ background: `linear-gradient(135deg,${accent},#8b5cf6)`, color: '#fff', border: 'none', padding: '0.8rem 2rem', borderRadius: '50px', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 8px 24px rgba(99,102,241,0.35)', transition: 'transform .2s' }} onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform=''}>
                    Khám phá thư viện →
                  </button>
                  <button onClick={() => setCurrentView('contact')} style={{ background: 'rgba(255,255,255,0.8)', color: accent, border: '2px solid rgba(99,102,241,0.3)', padding: '0.8rem 2rem', borderRadius: '50px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
                    Liên hệ chúng tôi
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <img src="/about_hero.png" alt="OpenLib" style={{ maxWidth: '100%', maxHeight: '380px', objectFit: 'contain', borderRadius: '1.5rem', animation: 'floatAbout 4s ease-in-out infinite' }} />
              </div>
            </div>
            <style>{`@keyframes floatAbout{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}`}</style>
          </section>

          {/* Stats */}
          <section style={{ background: surface, padding: '3.5rem 2rem', borderBottom: `1px solid ${border}` }}>
            <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
              <StatCard icon={<BookOpen size={24} />} target={books.length} suffix="+" label="Đầu sách số hóa" color="#6366f1" bg="#ede9fe" surface={surface} />
              <StatCard icon={<PenTool size={24} />} target={authors.length} suffix="+" label="Tác giả trong hệ thống" color="#8b5cf6" bg="#f3e8ff" surface={surface} />
              <StatCard icon={<Tag size={24} />} target={categories.length} suffix="" label="Thể loại phong phú" color="#10b981" bg="#d1fae5" surface={surface} />
              <StatCard icon={<Clock size={24} />} target={0} suffix="24/7" label="Phục vụ liên tục" color="#f59e0b" bg="#fef3c7" surface={surface} />
            </div>
          </section>

          {/* Mission & Vision */}
          <section className="container" style={{ padding: '5rem 2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '2rem' }}>
              {[
                { icon: '🎯', title: 'Sứ mệnh', color: '#ede9fe', accent: '#6366f1', desc: 'Tạo nền tảng học liệu mở, giúp mọi người tiếp cận tri thức một cách dễ dàng và miễn phí. Chúng tôi tin rằng tri thức phải là quyền lợi của tất cả mọi người, không phân biệt hoàn cảnh.' },
                { icon: '🔭', title: 'Tầm nhìn', color: '#e0e7ff', accent: '#8b5cf6', desc: 'Trở thành nền tảng thư viện số hàng đầu Việt Nam vào năm 2026, phục vụ hàng triệu độc giả với kho tàng sách phong phú và hệ thống quản lý thông minh.' },
                { icon: '💡', title: 'Giá trị cốt lõi', color: '#fef3c7', accent: '#f59e0b', desc: 'Minh bạch — Đổi mới — Kết nối. Chúng tôi cam kết xây dựng một cộng đồng đọc sách lành mạnh, nơi tri thức được chia sẻ và trân trọng.' },
              ].map((card, i) => (
                <div key={i} style={{ background: card.color, borderRadius: '1.5rem', padding: '2.5rem', borderLeft: `5px solid ${card.accent}`, transition: 'transform .25s, box-shadow .25s', cursor: 'default' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 16px 40px ${card.accent}18`; }} onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ width: '56px', height: '56px', background: surface, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', marginBottom: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>{card.icon}</div>
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
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,102,241,0.08)', padding: '0.35rem 1rem', borderRadius: '50px', color: accent, fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '1rem' }}>👥 Đội ngũ</div>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: textPrim, marginBottom: '0.75rem' }}>Đội ngũ phát triển</h2>
              <p style={{ color: textSec, maxWidth: '500px', margin: '0 auto' }}>Những người xây dựng OpenLib với niềm đam mê công nghệ và tri thức</p>
            </div>
            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { name: 'Trần Đình Hiển', avatar: 'H', role: 'Backend Developer', color: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
                { name: 'Nguyễn Khánh Duy', avatar: 'D', role: 'Frontend Developer', color: 'linear-gradient(135deg,#ec4899,#f43f5e)' },
                { name: 'Nguyễn Hữu Bảo', avatar: 'B', role: 'Full-stack Developer', color: 'linear-gradient(135deg,#10b981,#06b6d4)' },
              ].map((member, i) => (
                <div key={i} style={{ background: surface, border: `1px solid ${border}`, borderRadius: '1.5rem', padding: '2.5rem 2rem', textAlign: 'center', width: '240px', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', transition: 'transform .25s, box-shadow .25s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(99,102,241,0.15)'; }} onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.05)'; }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: member.color, margin: '0 auto 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900, color: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                    {member.avatar}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: textPrim }}>
                    {member.name}
                  </div>
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
            <p style={{ color: textSec, fontSize: '1.05rem' }}>Xin chào, <strong>{user?.full_name || user?.username || 'Thành viên'}</strong>! Đây là các sách bạn yêu thích.</p>
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
                  <BookCard key={book.book_id} book={book} avgRating={reviews.filter(r => r.book === book.book_id).length ? Math.round(reviews.filter(r => r.book === book.book_id).reduce((s, r) => s + r.rating, 0) / reviews.filter(r => r.book === book.book_id).length * 10) / 10 : 4.5} onClick={handleViewDetail} onBorrow={handleBorrow} liked={liked[book.book_id]} onToggleLike={toggleLike} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════ ALL CATEGORIES VIEW ══════ */}
      {currentView === 'allcategories' && (() => {
        const CATS_PER_PAGE = 12;
        const totalCatPages = Math.ceil(categories.length / CATS_PER_PAGE);
        const pagedCats = categories.slice((catPage - 1) * CATS_PER_PAGE, catPage * CATS_PER_PAGE);
        return (
          <div style={{ minHeight: '60vh' }}>
            <section style={{ background: 'linear-gradient(135deg,#f0fdf4,#d1fae5)', padding: '5rem 2rem 3rem', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '0.4rem 1.2rem', borderRadius: '50px', color: '#10b981', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                📂 Thể loại sách
              </div>
              <h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, color: textPrim, marginBottom: '1.25rem' }}>Khám phá theo chuyên mục</h1>
              <p style={{ fontSize: '1.1rem', color: textSec, maxWidth: '580px', margin: '0 auto' }}>Đa dạng các lĩnh vực từ giáo dục, nghiên cứu đến giải trí.</p>
            </section>
            <div className="container" style={{ padding: '4rem 2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {pagedCats.map((cat, i) => {
                  const actualIdx = (catPage - 1) * CATS_PER_PAGE + i;
                  return (
                    <div
                      key={cat.category_id}
                      onClick={() => { setSelectedCategory(cat.name); setCurrentView('library'); window.scrollTo({ top:0, behavior: 'auto' }); }}
                      style={{ background: catColors[actualIdx % catColors.length], borderRadius: '1.5rem', padding: '2.5rem 2rem', position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', minHeight: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.05)'; }}
                    >
                      <LibraryBig size={120} color="rgba(0,0,0,0.08)" style={{ position: 'absolute', top: '-10px', right: '-20px' }} />
                      <div style={{ position: 'relative', zIndex: 2 }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#000', marginBottom: '0.5rem' }}>{cat.name}</h3>
                        <div style={{ background: 'rgba(0,0,0,0.1)', display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700, color: '#000' }}>
                          {books.filter(b => b.category_name === cat.name).length} đầu sách
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {(
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button onClick={() => { setCatPage(p => Math.max(p-1,1)); window.scrollTo({top:0,behavior:'smooth'}); }} disabled={catPage===1} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', border: `1px solid ${border}`, background: catPage===1?'#f1f5f9':surface, color: catPage===1?textMut:textPrim, cursor: catPage===1?'not-allowed':'pointer', fontWeight: 700, display:'flex', alignItems:'center', gap:'0.3rem' }}>
                    <ChevronRight size={16} style={{transform:'rotate(180deg)'}}/> Trước
                  </button>
                  {Array.from({length:totalCatPages},(_,i)=>i+1).map(p=>(
                    <button key={p} onClick={()=>{setCatPage(p);window.scrollTo({top:0,behavior:'smooth'});}} style={{ width:'40px',height:'40px',borderRadius:'10px',border:`1px solid ${catPage===p?'transparent':border}`,background:catPage===p?`linear-gradient(135deg,${accent},#8b5cf6)`:surface,color:catPage===p?'#fff':textPrim,fontWeight:800,cursor:'pointer',boxShadow:catPage===p?'0 4px 12px rgba(99,102,241,0.3)':'none',transition:'all 0.2s' }}>{p}</button>
                  ))}
                  <button onClick={() => { setCatPage(p => Math.min(p+1,totalCatPages)); window.scrollTo({top:0,behavior:'smooth'}); }} disabled={catPage===totalCatPages} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', border: `1px solid ${border}`, background: catPage===totalCatPages?'#f1f5f9':surface, color: catPage===totalCatPages?textMut:textPrim, cursor: catPage===totalCatPages?'not-allowed':'pointer', fontWeight: 700, display:'flex', alignItems:'center', gap:'0.3rem' }}>
                    Tiếp <ChevronRight size={16}/>
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}


      {/* ══════ ALL AUTHORS VIEW ══════ */}
      {currentView === 'allauthors' && (() => {
        const AUTHORS_PER_PAGE = 16;
        const totalAuthorPages = Math.ceil(authors.length / AUTHORS_PER_PAGE);
        const pagedAuthors = authors.slice((authorPage - 1) * AUTHORS_PER_PAGE, authorPage * AUTHORS_PER_PAGE);
        return (
          <div style={{ minHeight: '60vh' }}>
            <section style={{ background: 'linear-gradient(135deg,#fff1f2,#ffe4e6)', padding: '5rem 2rem 3rem', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', padding: '0.4rem 1.2rem', borderRadius: '50px', color: '#f43f5e', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                ✍️ Tác giả nghệ sĩ
              </div>
              <h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, color: textPrim, marginBottom: '1.25rem' }}>Đội ngũ Tác giả</h1>
              <p style={{ fontSize: '1.1rem', color: textSec, maxWidth: '580px', margin: '0 auto 2rem' }}>Những người truyền cảm hứng qua từng con chữ. <strong style={{color:'#f43f5e'}}>{authors.length}</strong> tác giả.</p>
              
              {/* Author Search Bar */}
              <div style={{ maxWidth: '500px', margin: '0 auto', position: 'relative' }}>
                <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: textMut }} />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm tác giả theo tên..." 
                  value={authorSearchTerm}
                  onChange={(e) => { setAuthorSearchTerm(e.target.value); setAuthorPage(1); }}
                  style={{ width: '100%', padding: '1rem 1rem 1rem 3.5rem', borderRadius: '50px', border: `1px solid ${border}`, background: surface, fontSize: '1rem', outline: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', transition: 'all .2s' }}
                  onFocus={e => { e.target.style.borderColor = accent; e.target.style.boxShadow = `0 10px 30px rgba(99,102,241,0.1)`; }}
                  onBlur={e => { e.target.style.borderColor = border; e.target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)'; }}
                />
              </div>
            </section>
            <div className="container" style={{ padding: '4rem 2rem' }}>
              {(() => {
                const filteredAuthors = authors.filter(a => (a.name || '').toLowerCase().includes(authorSearchTerm.toLowerCase()));
                const AUTHORS_PER_PAGE = 16;
                const totalAuthorPages = Math.ceil(filteredAuthors.length / AUTHORS_PER_PAGE);
                const pagedAuthors = filteredAuthors.slice((authorPage - 1) * AUTHORS_PER_PAGE, authorPage * AUTHORS_PER_PAGE);
                
                if (filteredAuthors.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                      <h3 style={{ color: textPrim }}>Không tìm thấy tác giả nào</h3>
                      <p style={{ color: textMut }}>Hãy thử với từ khóa khác.</p>
                    </div>
                  );
                }

                return (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                      {pagedAuthors.map((a, i) => {
                        const actualIdx = (authorPage - 1) * AUTHORS_PER_PAGE + i;
                        return (
                          <div
                            key={a.author_id}
                            onClick={() => handleAuthorClick(a)}
                            style={{ background: surface, border: `1px solid ${border}`, borderRadius: '2rem', padding: '2.5rem 1.5rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.borderColor = accent; e.currentTarget.style.boxShadow = '0 20px 40px rgba(99,102,241,0.12)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = border; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.04)'; }}
                          >
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: catColors[actualIdx % catColors.length], margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900, color: '#fff', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                              {a.image ? (
                                <img src={getImageUrl(a.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={a.name} />
                              ) : (
                                a.name[0]
                              )}
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: textPrim, marginBottom: '0.4rem' }}>{a.name}</h3>
                            <div style={{ color: textMut, fontSize: '0.85rem' }}>{books.filter(b => b.author_name === a.name).length} tác phẩm</div>
                          </div>
                        );
                      })}
                    </div>
                    {totalAuthorPages > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button onClick={() => { setAuthorPage(p => Math.max(p-1,1)); window.scrollTo({top:0,behavior:'smooth'}); }} disabled={authorPage===1} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', border: `1px solid ${border}`, background: authorPage===1?'#f1f5f9':surface, color: authorPage===1?textMut:textPrim, cursor: authorPage===1?'not-allowed':'pointer', fontWeight: 700, display:'flex', alignItems:'center', gap:'0.3rem' }}>
                          <ChevronRight size={16} style={{transform:'rotate(180deg)'}}/> Trước
                        </button>
                        {Array.from({length:totalAuthorPages},(_,i)=>i+1).map(p=>(
                          <button key={p} onClick={()=>{setAuthorPage(p);window.scrollTo({top:0,behavior:'smooth'});}} style={{ width:'40px',height:'40px',borderRadius:'10px',border:`1px solid ${authorPage===p?'transparent':border}`,background:authorPage===p?`linear-gradient(135deg,#f43f5e,#ec4899)`:surface,color:authorPage===p?'#fff':textPrim,fontWeight:800,cursor:'pointer',boxShadow:authorPage===p?'0 4px 12px rgba(244,63,94,0.3)':'none',transition:'all 0.2s' }}>{p}</button>
                        ))}
                        <button onClick={() => { setAuthorPage(p => Math.min(p+1,totalAuthorPages)); window.scrollTo({top:0,behavior:'smooth'}); }} disabled={authorPage===totalAuthorPages} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', border: `1px solid ${border}`, background: authorPage===totalAuthorPages?'#f1f5f9':surface, color: authorPage===totalAuthorPages?textMut:textPrim, cursor: authorPage===totalAuthorPages?'not-allowed':'pointer', fontWeight: 700, display:'flex', alignItems:'center', gap:'0.3rem' }}>
                          Tiếp <ChevronRight size={16}/>
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        );
      })()}

      {/* ══════ AUTHOR DETAIL VIEW ══════ */}
      {currentView === 'authordetail' && selectedAuthor && (
        <div style={{ minHeight: '80vh' }}>
          {/* Header Section */}
          <section style={{ background: 'linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%)', padding: '5rem 2rem 4rem', borderBottom: `1px solid ${border}` }}>
            <div className="container" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '3.5rem', alignItems: 'center' }}>
              <div style={{ width: '220px', height: '220px', borderRadius: '40px', background: `linear-gradient(135deg,${accent},#8b5cf6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', fontWeight: 900, color: '#fff', boxShadow: '0 20px 50px rgba(99,102,241,0.25)', overflow: 'hidden' }}>
                {selectedAuthor.image ? (
                  <img src={getImageUrl(selectedAuthor.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={selectedAuthor.name} />
                ) : (
                  selectedAuthor.name[0]
                )}
              </div>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', padding: '0.4rem 1.2rem', borderRadius: '50px', color: accent, fontSize: '0.78rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                  ✍️ Hồ sơ tác giả
                </div>
                <h1 style={{ fontSize: '3.5rem', fontWeight: 900, color: textPrim, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>{selectedAuthor.name}</h1>
                <div style={{ fontSize: '1.1rem', color: textSec, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <BookOpen size={18} color={accent} /> {books.filter(b => b.author_name === selectedAuthor.name).length} Tác phẩm
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Users size={18} color="#10b981" /> {followedAuthors[selectedAuthor.author_id] ? 1201 : 1200} Độc giả quan tâm
                  </span>
                </div>
                <button 
                  onClick={() => toggleFollowAuthor(selectedAuthor.author_id)}
                  style={{ background: followedAuthors[selectedAuthor.author_id] ? 'rgba(99,102,241,0.1)' : `linear-gradient(135deg,${accent},#8b5cf6)`, color: followedAuthors[selectedAuthor.author_id] ? accent : '#fff', border: followedAuthors[selectedAuthor.author_id] ? `2px solid ${accent}` : 'none', padding: '0.8rem 2.5rem', borderRadius: '50px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: followedAuthors[selectedAuthor.author_id] ? 'none' : '0 10px 25px rgba(99,102,241,0.3)', transition: 'all .25s' }}
                >
                  {followedAuthors[selectedAuthor.author_id] ? '✓ Đang quan tâm' : '+ Quan tâm tác giả'}
                </button>
              </div>
            </div>
          </section>

          {/* Content Section */}
          <div className="container" style={{ padding: '4rem 2rem', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '4rem' }}>
            {/* Bio */}
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: textPrim, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '4px', height: '24px', background: accent, borderRadius: '4px' }}></div>
                Tiểu sử & Sự nghiệp
              </h3>
              <div 
                className="rich-text-content"
                style={{ fontSize: '1.1rem', color: textSec, lineHeight: 1.8, textAlign: 'left' }}
                dangerouslySetInnerHTML={{ 
                  __html: (selectedAuthor.bio || '<p>Thông tin về tác giả này đang được cập nhật...</p>').replace(/&nbsp;/g, ' ').replace(/\u00a0/g, ' ') 
                }} 
              />
              <style>{`
                .rich-text-content p { margin-bottom: 1.5rem; }
                .rich-text-content p:last-child { margin-bottom: 0; }
                .rich-text-content img { max-width: 100%; height: auto; border-radius: 12px; margin: 1.5rem 0; }
              `}</style>
            </div>

            {/* Books Sidebar */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: textPrim, marginBottom: '1.5rem' }}>Tác phẩm nổi bật</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {books.filter(b => b.author_name === selectedAuthor.name).slice(0, 5).map(book => (
                  <div key={book.book_id} onClick={() => handleViewDetail(book)} style={{ display: 'flex', gap: '1rem', cursor: 'pointer' }}>
                    <div style={{ width: '70px', height: '90px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      <img src={getImageUrl(book.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={book.title} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: textPrim, marginBottom: '0.25rem' }}>{book.title}</h4>
                      <div style={{ fontSize: '0.8rem', color: textMut }}>{book.category_name}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: accent, marginTop: '0.5rem' }}>Xem chi tiết →</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ══════ PROFILE VIEW ══════ */}
      {currentView === 'profile' && user && (
        <div style={{ minHeight: '80vh', padding: '5rem 2rem 4rem' }} className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2.5rem' }}>
            {/* Profile Sidebar */}
            <aside>
              <div style={{ background: surface, borderRadius: '2rem', padding: '2.5rem 1.5rem', border: `1px solid ${border}`, boxShadow: '0 10px 30px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '30px', background: `linear-gradient(135deg, ${accent}, #8b5cf6)`, margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2.5rem', fontWeight: 900, boxShadow: '0 15px 30px rgba(99,102,241,0.3)' }}>
                  {(user?.full_name || user?.username || 'U')[0].toUpperCase()}
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: textPrim, marginBottom: '0.25rem' }}>{user?.full_name || 'Thành viên'}</h2>
                <div style={{ color: textMut, fontSize: '0.85rem', marginBottom: '2rem', fontWeight: 600 }}>@{user?.username}</div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                  {[
                    { id: 'info', icon: <UserCog size={18} />, label: 'Thông tin cá nhân' },
                    { id: 'history', icon: <History size={18} />, label: 'Lịch sử mượn trả' },
                    { id: 'fines', icon: <CreditCard size={18} />, label: 'Khoản phạt & Phí' },
                    { id: 'security', icon: <Unlock size={18} />, label: 'Bảo mật' },
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveProfileTab(tab.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.25rem', borderRadius: '12px', border: 'none', background: activeProfileTab === tab.id ? 'rgba(99,102,241,0.08)' : 'transparent', color: activeProfileTab === tab.id ? accent : textSec, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Profile Content */}
            <main>
              {activeProfileTab === 'info' && (
                <div style={{ background: surface, borderRadius: '2rem', padding: '2.5rem', border: `1px solid ${border}`, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <UserCog color={accent} /> Cập nhật thông tin
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="input-group">
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: textMut, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Họ và tên</label>
                      <input type="text" defaultValue={user?.full_name} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: `1px solid ${border}`, background: '#f8fafc', outline: 'none' }} />
                    </div>
                    <div className="input-group">
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: textMut, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Địa chỉ Email</label>
                      <input type="email" defaultValue={user?.email || 'user@example.com'} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: `1px solid ${border}`, background: '#f8fafc', outline: 'none' }} />
                    </div>
                  </div>
                  <button style={{ marginTop: '2rem', padding: '0.85rem 2rem', background: `linear-gradient(135deg, ${accent}, #8b5cf6)`, color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 20px rgba(99,102,241,0.2)' }}>Lưu thay đổi</button>
                </div>
              )}

              {activeProfileTab === 'history' && (
                <div style={{ background: surface, borderRadius: '2rem', padding: '2.5rem', border: `1px solid ${border}`, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <History color={accent} /> Nhật ký mượn sách
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '1rem', borderBottom: `2px solid ${border}`, fontSize: '0.8rem', color: textMut, textTransform: 'uppercase' }}>Tên sách</th>
                          <th style={{ textAlign: 'left', padding: '1rem', borderBottom: `2px solid ${border}`, fontSize: '0.8rem', color: textMut, textTransform: 'uppercase' }}>Ngày mượn</th>
                          <th style={{ textAlign: 'left', padding: '1rem', borderBottom: `2px solid ${border}`, fontSize: '0.8rem', color: textMut, textTransform: 'uppercase' }}>Hạn trả</th>
                          <th style={{ textAlign: 'left', padding: '1rem', borderBottom: `2px solid ${border}`, fontSize: '0.8rem', color: textMut, textTransform: 'uppercase' }}>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {borrowHistory.map(h => (
                          <tr key={h.id}>
                            <td style={{ padding: '1rem', borderBottom: `1px solid ${border}`, fontWeight: 700 }}>{h.title}</td>
                            <td style={{ padding: '1rem', borderBottom: `1px solid ${border}`, color: textSec }}>{h.borrow_date}</td>
                            <td style={{ padding: '1rem', borderBottom: `1px solid ${border}`, color: textSec }}>{h.due_date}</td>
                            <td style={{ padding: '1rem', borderBottom: `1px solid ${border}` }}>
                              <span style={{ padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800, background: h.status === 'borrowing' ? '#e0e7ff' : (h.status === 'returned' ? '#d1fae5' : '#fee2e2'), color: h.status === 'borrowing' ? accent : (h.status === 'returned' ? '#059669' : '#ef4444') }}>
                                {h.status === 'borrowing' ? 'Đang mượn' : (h.status === 'returned' ? 'Đã trả' : 'Quá hạn')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeProfileTab === 'fines' && (
                <div style={{ background: surface, borderRadius: '2rem', padding: '2.5rem', border: `1px solid ${border}`, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CreditCard color={accent} /> Khoản phạt quá hạn
                  </h3>
                  {fines.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: textMut }}>Tuyệt vời! Bạn không có khoản phạt nào.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {fines.map(f => (
                        <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderRadius: '1.25rem', border: `1px solid #fee2e2`, background: '#fef2f2' }}>
                          <div>
                            <div style={{ fontWeight: 800, color: '#b91c1c' }}>{f.book}</div>
                            <div style={{ fontSize: '0.85rem', color: '#7f1d1d' }}>{f.reason} • {f.date}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ef4444' }}>{f.amount.toLocaleString()}đ</div>
                            <button style={{ marginTop: '0.5rem', background: '#ef4444', color: '#fff', border: 'none', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>Thanh toán ngay</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeProfileTab === 'security' && (
                <div style={{ background: surface, borderRadius: '2rem', padding: '2.5rem', border: `1px solid ${border}`, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Unlock color={accent} /> Đổi mật khẩu
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '400px' }}>
                    <div className="input-group">
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: textMut, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Mật khẩu hiện tại</label>
                      <input type="password" style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: `1px solid ${border}`, background: '#f8fafc', outline: 'none' }} />
                    </div>
                    <div className="input-group">
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: textMut, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Mật khẩu mới</label>
                      <input type="password" style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: `1px solid ${border}`, background: '#f8fafc', outline: 'none' }} />
                    </div>
                    <div className="input-group">
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: textMut, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Xác nhận mật khẩu mới</label>
                      <input type="password" style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: `1px solid ${border}`, background: '#f8fafc', outline: 'none' }} />
                    </div>
                  </div>
                  <button style={{ marginTop: '2rem', padding: '0.85rem 2rem', background: `linear-gradient(135deg, ${accent}, #8b5cf6)`, color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 20px rgba(99,102,241,0.2)' }}>Cập nhật mật khẩu</button>
                </div>
              )}
            </main>
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

            {/* Right Side Column */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3rem', flex: '0 0 auto' }}>
              {/* Book cover 3D */}
              <div onClick={() => handleViewDetail(featured)} style={{ width: '280px', height: '390px', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 30px 60px rgba(99,102,241,0.25), 0 0 0 1px rgba(99,102,241,0.1)', cursor: 'pointer', transform: 'perspective(900px) rotateY(-12deg) rotateX(3deg)', transition: 'transform 0.5s' }} onMouseEnter={e => e.currentTarget.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) scale(1.04)'} onMouseLeave={e => e.currentTarget.style.transform = 'perspective(900px) rotateY(-12deg) rotateX(3deg)'}>
                {featured.image ? <img src={getImageUrl(featured.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={featured.title} /> : <div style={{ height: '100%', background: 'linear-gradient(135deg,#e0e7ff,#f3e8ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BookOpen size={64} color={accent} opacity={0.4} /></div>}
              </div>

              {/* MINIMALIST PROGRESS SLIDER */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '-1.5rem' }}>
                <button 
                  onClick={() => setHeroIndex(prev => prev === 0 ? topBooks.length - 1 : prev - 1)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.4rem', display: 'flex', alignItems: 'center', borderRadius: '50%', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#6366f1'}
                  onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                >
                  <ChevronRight size={22} style={{ transform: 'rotate(180deg)' }} />
                </button>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {topBooks.map((_, idx) => {
                    const isActive = idx === heroIndex;
                    return (
                      <div 
                        key={idx}
                        onClick={() => setHeroIndex(idx)}
                        style={{
                          width: isActive ? '36px' : '10px',
                          height: '8px',
                          borderRadius: '50px',
                          background: isActive ? '#6366f1' : 'rgba(99,102,241,0.2)',
                          cursor: 'pointer',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        onMouseEnter={e => { if(!isActive) e.currentTarget.style.background = 'rgba(99,102,241,0.4)'; }}
                        onMouseLeave={e => { if(!isActive) e.currentTarget.style.background = 'rgba(99,102,241,0.2)'; }}
                      />
                    );
                  })}
                </div>

                <button 
                  onClick={() => setHeroIndex(prev => (prev + 1) % topBooks.length)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.4rem', display: 'flex', alignItems: 'center', borderRadius: '50%', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#6366f1'}
                  onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                >
                  <ChevronRight size={22} />
                </button>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: textPrim }}>Chuyên Mục</h2>
              {selectedCategory && (
                <button onClick={() => setSelectedCategory(null)} style={{ background: 'rgba(99,102,241,0.08)', border: `1px solid rgba(99,102,241,0.25)`, color: accent, padding: '0.4rem 1rem', borderRadius: '50px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <X size={14} /> Bỏ lọc: {selectedCategory}
                </button>
              )}
            </div>
            <span 
              onClick={() => { setCurrentView('allcategories'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{ color: accent, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.9rem', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.gap = '0.4rem'; e.currentTarget.style.color = '#4338ca'; }}
              onMouseLeave={e => { e.currentTarget.style.gap = '0.2rem'; e.currentTarget.style.color = accent; }}
            >
              Xem tất cả <ChevronRight size={16} />
            </span>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem', color: textPrim }}>
              {searchTerm ? <><Search size={22} /> Kết quả tìm kiếm</> : selectedCategory ? <><Filter size={22} /> {selectedCategory}</> : <><TrendingUp size={22} color={accent} /> Không Thể Bỏ Lỡ</>}
            </h2>
            <span style={{ background: 'rgba(99,102,241,0.08)', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.85rem', color: accent, fontWeight: 700 }}>
              {filteredBooks.length} tác phẩm
            </span>
          </div>
          {!searchTerm && !selectedCategory && currentView === 'home' && (
            <span
              onClick={() => { setCurrentView('library'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{ color: accent, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.9rem', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.gap = '0.4rem'; e.currentTarget.style.color = '#4338ca'; }}
              onMouseLeave={e => { e.currentTarget.style.gap = '0.2rem'; e.currentTarget.style.color = accent; }}
            >
              Xem tất cả <ChevronRight size={16} />
            </span>
          )}
        </div>

        {/* ══════ ADVANCED FILTERS ══════ */}
        {currentView === 'library' && (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap', padding: '1.5rem', background: surface, borderRadius: '1.25rem', border: `1px solid ${border}`, boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: textMut, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Sắp xếp theo</label>
              <select 
                value={filters.sortBy}
                onChange={e => setFilters({...filters, sortBy: e.target.value})}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', border: `1px solid ${border}`, background: '#f8fafc', fontSize: '0.9rem', outline: 'none' }}>
                <option value="latest">Mới nhất</option>
                <option value="title">Tiêu đề (A-Z)</option>
                <option value="rating">Đánh giá cao nhất</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: textMut, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Tình trạng</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['all', 'available'].map(s => (
                  <button 
                    key={s}
                    onClick={() => setFilters({...filters, stock: s})}
                    style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', background: filters.stock === s ? `linear-gradient(135deg,${accent},#8b5cf6)` : '#f8fafc', color: filters.stock === s ? '#fff' : textSec, border: `1px solid ${filters.stock === s ? 'transparent' : border}`, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>
                    {s === 'all' ? 'Tất cả' : 'Còn sách'}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: textMut, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Đánh giá tối thiểu</label>
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button 
                    key={star}
                    onClick={() => setFilters({...filters, minRating: star === filters.minRating ? 0 : star})}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <Star size={20} fill={star <= filters.minRating ? '#f59e0b' : 'transparent'} color={star <= filters.minRating ? '#f59e0b' : textMut} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

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
            {(currentView === 'home' && !searchTerm && !selectedCategory
              ? filteredBooks.slice(1)
              : filteredBooks
            ).slice((currentPage - 1) * BOOKS_PER_PAGE, currentPage * BOOKS_PER_PAGE).map(book => (
              <BookCard key={book.book_id} book={book} avgRating={avgRatingFor(book)} onClick={handleViewDetail} onBorrow={handleBorrow} liked={liked[book.book_id]} onToggleLike={toggleLike} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '3rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setCurrentPage(p => Math.max(p - 1, 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={currentPage === 1}
              style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', border: `1px solid ${border}`, background: currentPage === 1 ? '#f1f5f9' : surface, color: currentPage === 1 ? textMut : textPrim, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /> Trước
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                style={{
                  width: '40px', height: '40px', borderRadius: '10px', border: `1px solid ${currentPage === page ? 'transparent' : border}`,
                  background: currentPage === page ? `linear-gradient(135deg, ${accent}, #8b5cf6)` : surface,
                  color: currentPage === page ? '#fff' : textPrim,
                  fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
                  boxShadow: currentPage === page ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => { setCurrentPage(p => Math.min(p + 1, totalPages)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={currentPage === totalPages}
              style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', border: `1px solid ${border}`, background: currentPage === totalPages ? '#f1f5f9' : surface, color: currentPage === totalPages ? textMut : textPrim, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Tiếp <ChevronRight size={16} />
            </button>
          </div>
        )}
      </main>
      </div>
    )}

      {/* ══════ AUTHORS SECTION ══════ */}
      {!searchTerm && !loading && authors.length > 0 && currentView === 'home' && (
        <section style={{ background: surface, borderTop: `1px solid ${border}`, padding: '4rem 0' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', padding: '0 2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: textPrim }}>Tác Giả Nổi Bật</h2>
              <span 
                onClick={() => { setCurrentView('allauthors'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                style={{ color: accent, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.9rem', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.gap = '0.4rem'; e.currentTarget.style.color = '#4338ca'; }}
                onMouseLeave={e => { e.currentTarget.style.gap = '0.2rem'; e.currentTarget.style.color = accent; }}
              >
                Tất cả <ChevronRight size={16} />
              </span>
            </div>
            <div className="hide-scrollbar" style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', padding: '0 2rem 1rem' }}>
              {authors.map((a, i) => {
                const byCnt = books.filter(b => b.author_name === a.name).length;
                return (
                  <div key={a.author_id} onClick={() => handleAuthorClick(a)} style={{ minWidth: '170px', background: bg, border: `1px solid ${border}`, borderRadius: '1.25rem', padding: '1.5rem 1rem', textAlign: 'center', cursor: 'pointer', transition: 'transform .25s, border-color .25s, box-shadow .25s', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = accent; e.currentTarget.style.boxShadow = `0 12px 30px rgba(99,102,241,0.15)`; }} onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = border; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: catColors[i % catColors.length], margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 900, color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                      {a.image ? (
                        <img src={getImageUrl(a.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={a.name || 'Author'} />
                      ) : (
                        (a.name || '?').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem', color: textPrim }}>{a.name || 'Chưa cập nhật'}</div>
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

      </div>
    );
};

export default PublicPage;

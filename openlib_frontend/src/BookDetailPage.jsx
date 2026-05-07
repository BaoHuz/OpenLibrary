import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, BookOpen, Star, BookMarked, Heart, Share2, PenTool,
  Building2, Hash, Tag, Package, ChevronRight, Quote, Send,
  ThumbsUp, Clock, Award, TrendingUp, Eye
} from 'lucide-react';
import './App.css';

const API = 'http://127.0.0.1:8000/api';

/* ── Color tokens ── */
const C = {
  bg: '#f8fafc',
  surface: '#ffffff',
  border: '#e2e8f0',
  textPrim: '#0f172a',
  textSec: '#475569',
  textMut: '#94a3b8',
  accent: '#6366f1',
};

/* ── Stars component ── */
const Stars = ({ rating, size = 16, interactive = false, onRate }) => (
  <div style={{ display: 'flex', gap: '3px' }}>
    {[1, 2, 3, 4, 5].map(i => (
      <Star
        key={i}
        size={size}
        fill={i <= Math.round(rating) ? '#f59e0b' : 'transparent'}
        color="#f59e0b"
        style={{ cursor: interactive ? 'pointer' : 'default', transition: 'transform .15s' }}
        onMouseEnter={e => { if (interactive) e.currentTarget.style.transform = 'scale(1.2)'; }}
        onMouseLeave={e => { if (interactive) e.currentTarget.style.transform = ''; }}
        onClick={() => interactive && onRate && onRate(i)}
      />
    ))}
  </div>
);

/* ── Related Book Card ── */
const RelatedCard = ({ book, avgRating, onClick }) => (
  <div
    onClick={() => onClick(book.book_id)}
    style={{
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: '1rem',
      overflow: 'hidden', cursor: 'pointer', transition: 'transform .25s, box-shadow .25s',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(99,102,241,0.14)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
  >
    <div style={{ height: '200px', background: 'linear-gradient(135deg,#e0e7ff,#f3e8ff)', position: 'relative', overflow: 'hidden' }}>
      {book.image
        ? <img src={book.image} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BookOpen size={40} color="rgba(99,102,241,0.3)" /></div>
      }
      <div style={{
        position: 'absolute', top: '0.6rem', left: '0.6rem',
        background: book.stock > 0 ? 'rgba(16,185,129,0.92)' : 'rgba(239,68,68,0.92)',
        color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '50px', fontSize: '0.68rem', fontWeight: 800,
      }}>
        {book.stock > 0 ? `${book.stock} cuốn` : 'Hết sách'}
      </div>
    </div>
    <div style={{ padding: '1rem' }}>
      <Stars rating={avgRating} size={12} />
      <h4 style={{ fontWeight: 800, fontSize: '0.9rem', color: C.textPrim, margin: '0.4rem 0 0.2rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {book.title}
      </h4>
      <p style={{ fontSize: '0.78rem', color: C.textSec }}>{book.author_name}</p>
    </div>
  </div>
);

/* ════════════════ MAIN PAGE ════════════════ */
const BookDetailPage = ({ user }) => {
  const { bookId } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [allBooks, setAllBooks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');

  const getStorageKey = () => user ? `liked_${user.username}` : 'liked_guest';
  const [liked, setLiked] = useState(() => {
    try {
      const stored = localStorage.getItem(getStorageKey());
      const likedBooks = stored ? JSON.parse(stored) : {};
      return likedBooks[bookId] || false;
    } catch {
      return false;
    }
  });

  const handleToggleLike = () => {
    try {
      const key = getStorageKey();
      const stored = localStorage.getItem(key);
      const likedBooks = stored ? JSON.parse(stored) : {};
      const newLikedValue = !liked;
      
      if (newLikedValue) {
        likedBooks[bookId] = true;
      } else {
        delete likedBooks[bookId];
      }
      
      localStorage.setItem(key, JSON.stringify(likedBooks));
      setLiked(newLikedValue);
    } catch (e) {
      console.error('Failed to update like state:', e);
    }
  };

  /* Scroll to top on load */
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [bookId]);

  useEffect(() => {
    try {
      const key = getStorageKey();
      const stored = localStorage.getItem(key);
      const likedBooks = stored ? JSON.parse(stored) : {};
      setLiked(likedBooks[bookId] || false);
    } catch {
      setLiked(false);
    }
  }, [bookId, user]);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [bRes, allRes, rRes] = await Promise.all([
          axios.get(`${API}/books/${bookId}/`),
          axios.get(`${API}/books/`),
          axios.get(`${API}/reviews/`),
        ]);
        setBook(bRes.data);
        setAllBooks(Array.isArray(allRes.data) ? allRes.data : []);
        setReviews(Array.isArray(rRes.data) ? rRes.data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [bookId]);

  const bookReviews = reviews.filter(r => r.book === parseInt(bookId));
  const avgRating = bookReviews.length
    ? Math.round(bookReviews.reduce((s, r) => s + r.rating, 0) / bookReviews.length * 10) / 10
    : 0;

  const getAvgFor = (bkId) => {
    const rs = reviews.filter(r => r.book === bkId);
    return rs.length ? Math.round(rs.reduce((s, r) => s + r.rating, 0) / rs.length * 10) / 10 : 4.2;
  };

  /* Related: same category, or same author, excluding current */
  const related = allBooks.filter(b =>
    b.book_id !== parseInt(bookId) &&
    (b.category_name === book?.category_name || b.author_name === book?.author_name)
  ).slice(0, 6);

  /* Recommendations: top-rated books not in related */
  const relatedIds = new Set(related.map(b => b.book_id));
  const recommended = allBooks
    .filter(b => b.book_id !== parseInt(bookId) && !relatedIds.has(b.book_id))
    .sort((a, b) => getAvgFor(b.book_id) - getAvgFor(a.book_id))
    .slice(0, 6);

  const [borrowStatus, setBorrowStatus] = useState(null); // null | 'loading' | 'success' | 'error' | 'already'
  const [borrowMsg, setBorrowMsg] = useState('');

  const handleBorrow = async () => {
    if (!user) { navigate('/login'); return; }
    if (book.stock <= 0) {
      setBorrowStatus('error');
      setBorrowMsg('❌ Rất tiếc! Sách đã hết không thể mượn.');
      return;
    }
    setBorrowStatus('loading');
    try {
      const res = await axios.post(`${API}/borrow_request/`, {
        username: user.username,
        book_id: parseInt(bookId),
      });
      setBorrowStatus('success');
      setBorrowMsg(`✅ ${res.data.message} (Mã phiếu: #${res.data.ticket_id})`);
    } catch (err) {
      const msg = err.response?.data?.error || 'Không thể gửi yêu cầu. Thử lại sau.';
      setBorrowStatus(msg.includes('đang chờ') ? 'already' : 'error');
      setBorrowMsg(`⚠️ ${msg}`);
    }
    setTimeout(() => setBorrowStatus(null), 6000);
  };

  const handleSubmitReview = async () => {
    if (!user) { navigate('/login'); return; }
    if (!userRating) { setSubmitMsg('⚠️ Vui lòng chọn số sao đánh giá.'); return; }
    if (!comment.trim()) { setSubmitMsg('⚠️ Vui lòng nhập nhận xét.'); return; }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API}/reviews/`, {
        book: parseInt(bookId),
        rating: userRating,
        comment: comment.trim(),
      }, {
        headers: { Authorization: `Token ${token}` },
      });
      setReviews(prev => [res.data, ...prev]);
      setComment('');
      setUserRating(0);
      setSubmitMsg('✅ Đánh giá của bạn đã được ghi nhận!');
    } catch (e) {
      setSubmitMsg('❌ Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSubmitMsg(''), 4000);
    }
  };

  const ratingDist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: bookReviews.filter(r => r.rating === star).length,
    pct: bookReviews.length ? Math.round(bookReviews.filter(r => r.rating === star).length / bookReviews.length * 100) : 0,
  }));

  /* ── Skeleton loading ── */
  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: '48px', height: '48px', border: `3px solid ${C.accent}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: C.textMut, fontWeight: 600 }}>Đang tải thông tin sách...</p>
    </div>
  );

  if (!book) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <BookOpen size={56} color={C.textMut} />
      <h2 style={{ color: C.textPrim }}>Không tìm thấy sách</h2>
      <button onClick={() => navigate('/')} style={{ background: C.accent, color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '50px', cursor: 'pointer', fontWeight: 700 }}>← Về trang chủ</button>
    </div>
  );

  const infoItems = [
    { icon: <PenTool size={16} color={C.accent} />, label: 'Tác giả', val: book.author_name || '—' },
    { icon: <Tag size={16} color="#10b981" />, label: 'Thể loại', val: book.category_name || '—' },
    { icon: <Building2 size={16} color="#f59e0b" />, label: 'Nhà xuất bản', val: book.publisher_name || '—' },
    { icon: <Hash size={16} color="#8b5cf6" />, label: 'ISBN', val: book.isbn || '—' },
    { icon: <Package size={16} color="#ef4444" />, label: 'Tồn kho', val: `${book.stock} cuốn` },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.textPrim, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Sticky Navbar ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 200, background: 'rgba(248,250,252,0.95)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.border}`, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.9rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: C.bg, border: `1px solid ${C.border}`, color: C.textSec, padding: '0.5rem 1rem', borderRadius: '50px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', transition: 'all .2s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent; }} onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSec; }}>
            <ArrowLeft size={16} /> Quay lại
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: C.textMut }}>
            <span style={{ cursor: 'pointer', color: C.accent, fontWeight: 700 }} onClick={() => navigate('/')}>Trang chủ</span>
            <ChevronRight size={14} />
            <span style={{ cursor: 'pointer', color: C.accent, fontWeight: 700 }} onClick={() => navigate('/')}>Thư viện</span>
            <ChevronRight size={14} />
            <span style={{ fontWeight: 600, color: C.textPrim, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <img src="/logo.svg" alt="OpenLib Logo" style={{ height: '36px', width: 'auto', maxWidth: '144px' }} />
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════
          HERO — Book Overview
      ══════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(135deg,#ede9fe 0%,#e0e7ff 40%,#f0fdf4 100%)', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '4rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* Cover */}
          <div style={{ flex: '0 0 auto' }}>
            <div style={{ width: '260px', height: '370px', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 24px 48px rgba(99,102,241,0.2), 0 0 0 1px rgba(99,102,241,0.08)', position: 'relative' }}>
              {book.image
                ? <img src={book.image} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ height: '100%', background: 'linear-gradient(135deg,#c7d2fe,#ddd6fe)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={72} color="rgba(99,102,241,0.35)" />
                  </div>
              }
              {/* Stock ribbon */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: book.stock > 0 ? 'linear-gradient(90deg,#059669,#10b981)' : 'linear-gradient(90deg,#dc2626,#ef4444)', color: '#fff', textAlign: 'center', padding: '0.6rem', fontWeight: 800, fontSize: '0.85rem' }}>
                {book.stock > 0 ? `✓ Còn ${book.stock} cuốn sẵn sàng` : '✕ Tạm hết sách'}
              </div>
            </div>

            {/* Action buttons under cover */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                onClick={handleBorrow}
                disabled={borrowStatus === 'loading' || borrowStatus === 'success' || borrowStatus === 'already'}
                style={{
                  flex: 1, padding: '0.9rem',
                  background: borrowStatus === 'success' ? 'linear-gradient(135deg,#059669,#10b981)'
                    : borrowStatus === 'already' ? '#94a3b8'
                    : `linear-gradient(135deg,${C.accent},#8b5cf6)`,
                  color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '0.95rem',
                  cursor: (borrowStatus === 'loading' || borrowStatus === 'success' || borrowStatus === 'already') ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  boxShadow: '0 8px 20px rgba(99,102,241,0.35)', transition: 'all .3s'
                }}
              >
                {borrowStatus === 'loading' ? (
                  <><div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Đang gửi...</>
                ) : borrowStatus === 'success' ? (
                  <>✓ Đã gửi yêu cầu!</>
                ) : (
                  <><BookMarked size={18} /> Mượn ngay</>
                )}
              </button>
              <button
                onClick={handleToggleLike}
                style={{ width: '46px', height: '46px', borderRadius: '12px', background: liked ? '#ef4444' : C.surface, border: `1px solid ${liked ? '#ef4444' : C.border}`, color: liked ? '#fff' : C.textMut, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .2s' }}
              >
                <Heart size={18} fill={liked ? '#fff' : 'none'} />
              </button>
            </div>

            {/* Borrow feedback message */}
            {borrowStatus && borrowMsg && (
              <div style={{
                marginTop: '0.75rem', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700,
                background: borrowStatus === 'success' ? '#d1fae5'
                  : borrowStatus === 'already' ? '#fef3c7'
                  : '#fef2f2',
                border: `1px solid ${borrowStatus === 'success' ? '#a7f3d0' : borrowStatus === 'already' ? '#fde68a' : '#fecaca'}`,
                color: borrowStatus === 'success' ? '#065f46' : borrowStatus === 'already' ? '#92400e' : '#991b1b',
                textAlign: 'center', lineHeight: 1.5,
              }}>
                {borrowMsg}
              </div>
            )}

          </div>

          {/* Book Info */}
          <div style={{ flex: 1, minWidth: '280px' }}>
            {/* Tag + Badge */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <span style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: C.accent, padding: '0.3rem 0.9rem', borderRadius: '50px', fontSize: '0.78rem', fontWeight: 700 }}>
                {book.category_name}
              </span>
              {book.stock > 0 && (
                <span style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#059669', padding: '0.3rem 0.9rem', borderRadius: '50px', fontSize: '0.78rem', fontWeight: 700 }}>
                  ✓ Có thể mượn
                </span>
              )}
            </div>

            <h1 style={{ fontSize: 'clamp(1.6rem,3.5vw,2.8rem)', fontWeight: 900, lineHeight: 1.15, color: C.textPrim, marginBottom: '0.5rem' }}>
              {book.title}
            </h1>
            <p style={{ color: C.textSec, fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <PenTool size={14} /> {book.author_name}
            </p>

            {/* Rating summary */}
            {bookReviews.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', padding: '1rem 1.25rem', background: C.surface, borderRadius: '12px', border: `1px solid ${C.border}`, width: 'fit-content' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>{avgRating}</div>
                  <Stars rating={avgRating} size={14} />
                  <div style={{ fontSize: '0.72rem', color: C.textMut, marginTop: '0.2rem' }}>{bookReviews.length} đánh giá</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: '160px' }}>
                  {ratingDist.map(rd => (
                    <div key={rd.star} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.72rem', color: C.textMut, width: '14px' }}>{rd.star}</span>
                      <Star size={11} fill="#f59e0b" color="#f59e0b" />
                      <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${rd.pct}%`, height: '100%', background: 'linear-gradient(90deg,#f59e0b,#fbbf24)', borderRadius: '3px', transition: 'width 1s' }} />
                      </div>
                      <span style={{ fontSize: '0.7rem', color: C.textMut, width: '24px' }}>{rd.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1.25rem', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px', fontSize: '0.85rem', color: '#92400e', fontWeight: 600 }}>
                ⭐ Chưa có đánh giá — Hãy là người đầu tiên!
              </div>
            )}

            {/* Info grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {infoItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <span style={{ fontSize: '0.82rem', color: C.textMut, fontWeight: 700, minWidth: '100px' }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: C.textPrim, fontSize: '0.9rem' }}>{item.val}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: C.surface, borderRadius: '16px', border: `1px solid ${C.border}` }}>
              <h3 style={{ fontWeight: 800, marginBottom: '0.75rem', fontSize: '0.95rem', color: C.textPrim }}>📖 Giới thiệu về sách</h3>
              <p style={{ color: C.textSec, lineHeight: 1.75, fontSize: '0.92rem' }}>
                {book.description || 'Một tác phẩm xuất sắc hội tụ đầy đủ những giá trị tri thức, nghệ thuật và cảm xúc. Cuốn sách mang đến cho độc giả những trải nghiệm đọc sách thú vị, khơi gợi cảm hứng và mở rộng tầm nhìn về thế giới xung quanh. Hãy khám phá những trang viết đầy ý nghĩa trong ấn phẩm đặc sắc này.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          REVIEWS SECTION
      ══════════════════════════════════════ */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: C.textPrim, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Quote size={22} color={C.accent} style={{ opacity: 0.7 }} />
            Đánh giá từ độc giả
            <span style={{ background: 'rgba(99,102,241,0.1)', color: C.accent, padding: '0.2rem 0.8rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700 }}>
              {bookReviews.length}
            </span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
          {/* Review list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {bookReviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', background: C.surface, borderRadius: '1.25rem', border: `1px dashed ${C.border}` }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💬</div>
                <h3 style={{ color: C.textPrim, marginBottom: '0.5rem', fontSize: '1rem' }}>Chưa có đánh giá nào</h3>
                <p style={{ color: C.textMut, fontSize: '0.875rem' }}>Hãy là người đầu tiên chia sẻ cảm nhận về cuốn sách này!</p>
              </div>
            ) : (
              bookReviews.map((rev, i) => (
                <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '1.25rem', padding: '1.5rem', position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <Quote size={32} color={C.accent} style={{ position: 'absolute', top: '1rem', right: '1rem', opacity: 0.08 }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `linear-gradient(135deg,${C.accent},#8b5cf6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                      {String.fromCharCode(65 + (i % 26))}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: C.textPrim }}>Độc giả #{rev.user}</div>
                      <Stars rating={rev.rating} size={13} />
                    </div>
                    <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: C.textMut, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={12} />
                      {rev.created_at ? new Date(rev.created_at).toLocaleDateString('vi-VN') : 'Gần đây'}
                    </div>
                  </div>
                  <p style={{ color: C.textSec, lineHeight: 1.65, fontSize: '0.9rem', fontStyle: 'italic' }}>"{rev.comment}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '50px', padding: '0.25rem 0.75rem', fontSize: '0.75rem', color: C.textMut, cursor: 'pointer' }}>
                      <ThumbsUp size={12} /> Hữu ích
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Write a review */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', position: 'sticky', top: '80px' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: C.textPrim, marginBottom: '1.5rem' }}>
              ✍️ Viết đánh giá của bạn
            </h3>

            {!user ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <p style={{ color: C.textSec, marginBottom: '1rem' }}>Đăng nhập để gửi đánh giá</p>
                <button onClick={() => navigate('/login')} style={{ background: `linear-gradient(135deg,${C.accent},#8b5cf6)`, color: '#fff', border: 'none', padding: '0.75rem 2rem', borderRadius: '50px', fontWeight: 700, cursor: 'pointer' }}>
                  Đăng nhập ngay
                </button>
              </div>
            ) : (
              <>
                {/* Interactive star rating */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: C.textSec, marginBottom: '0.5rem' }}>Đánh giá của bạn</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star
                        key={i}
                        size={32}
                        fill={(hoverRating || userRating) >= i ? '#f59e0b' : 'transparent'}
                        color={(hoverRating || userRating) >= i ? '#f59e0b' : '#e2e8f0'}
                        style={{ cursor: 'pointer', transition: 'transform .15s, color .15s' }}
                        onMouseEnter={() => setHoverRating(i)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setUserRating(i)}
                      />
                    ))}
                    {(hoverRating || userRating) > 0 && (
                      <span style={{ marginLeft: '0.5rem', color: '#f59e0b', fontWeight: 800, fontSize: '0.9rem', alignSelf: 'center' }}>
                        {['', 'Tệ', 'Không hay', 'Tạm được', 'Hay', 'Xuất sắc!'][hoverRating || userRating]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Comment textarea */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: C.textSec, marginBottom: '0.5rem' }}>Nhận xét của bạn</label>
                  <textarea
                    rows={5}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Chia sẻ cảm nhận của bạn về cuốn sách này..."
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: `1px solid ${C.border}`, fontSize: '0.9rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', color: C.textPrim, background: C.bg, fontFamily: 'inherit', lineHeight: 1.6, transition: 'border-color .2s' }}
                    onFocus={e => e.target.style.borderColor = C.accent}
                    onBlur={e => e.target.style.borderColor = C.border}
                  />
                </div>

                {submitMsg && (
                  <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: submitMsg.startsWith('✅') ? '#d1fae5' : '#fef2f2', border: `1px solid ${submitMsg.startsWith('✅') ? '#a7f3d0' : '#fecaca'}`, color: submitMsg.startsWith('✅') ? '#065f46' : '#991b1b', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>
                    {submitMsg}
                  </div>
                )}

                <button
                  onClick={handleSubmitReview}
                  disabled={submitting}
                  style={{ width: '100%', padding: '0.9rem', background: submitting ? '#94a3b8' : `linear-gradient(135deg,${C.accent},#8b5cf6)`, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '0.95rem', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 8px 20px rgba(99,102,241,0.3)', transition: 'transform .2s' }}
                  onMouseEnter={e => { if (!submitting) e.currentTarget.style.transform = 'scale(1.02)'; }}
                  onMouseLeave={e => e.currentTarget.style.transform = ''}
                >
                  <Send size={18} />
                  {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          RELATED BOOKS
      ══════════════════════════════════════ */}
      {related.length > 0 && (
        <section style={{ background: C.surface, borderTop: `1px solid ${C.border}`, padding: '4rem 2rem' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: C.textPrim, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <TrendingUp size={22} color={C.accent} />
                Sách liên quan
              </h2>
              <span style={{ color: C.textMut, fontSize: '0.85rem' }}>Cùng thể loại hoặc tác giả</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px,1fr))', gap: '1.25rem' }}>
              {related.map(b => (
                <RelatedCard key={b.book_id} book={b} avgRating={getAvgFor(b.book_id)} onClick={(id) => navigate(`/books/${id}`)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          RECOMMENDATIONS
      ══════════════════════════════════════ */}
      {recommended.length > 0 && (
        <section style={{ background: 'linear-gradient(135deg,#f0f4ff,#faf5ff)', padding: '4rem 2rem' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: C.textPrim, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Award size={22} color="#f59e0b" />
                Có thể bạn cũng thích
              </h2>
              <span style={{ color: C.textMut, fontSize: '0.85rem' }}>Được đề xuất dựa trên đánh giá</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px,1fr))', gap: '1.25rem' }}>
              {recommended.map(b => (
                <RelatedCard key={b.book_id} book={b} avgRating={getAvgFor(b.book_id)} onClick={(id) => navigate(`/books/${id}`)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Footer strip ── */}
      <footer style={{ background: '#1e293b', padding: '1.5rem 2rem', textAlign: 'center', color: '#475569', fontSize: '0.82rem' }}>
        © 2026 OpenLib — Hệ thống quản lý thư viện hiện đại
      </footer>
    </div>
  );
};

export default BookDetailPage;

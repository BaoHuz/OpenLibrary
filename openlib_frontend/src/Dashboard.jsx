import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Library, LayoutDashboard, BookOpen, Users, Tag, Plus, Search, MoreVertical, Edit3, Trash2, Eye, ChevronRight, Book, Loader2, AlertCircle, TrendingUp, Filter, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from './utils/imageUrl';
import Select from 'react-select';
import ExportPanel from './ExportPanel';
import ImportPanel from './ImportPanel';
const stripHtml = (html) => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

const activityData7d = [
  { name: 'T2', borrows: 40, returns: 24 },
  { name: 'T3', borrows: 30, returns: 13 },
  { name: 'T4', borrows: 20, returns: 38 },
  { name: 'T5', borrows: 45, returns: 39 },
  { name: 'T6', borrows: 59, returns: 48 },
  { name: 'T7', borrows: 32, returns: 52 },
  { name: 'CN', borrows: 68, returns: 41 },
];

const activityData30d = [
  { name: 'Tuần 1', borrows: 140, returns: 114 },
  { name: 'Tuần 2', borrows: 210, returns: 183 },
  { name: 'Tuần 3', borrows: 160, returns: 208 },
  { name: 'Tuần 4', borrows: 245, returns: 199 },
];

const categoryDistribution = [
  { name: 'Văn học', value: 400, color: '#6366f1' },
  { name: 'Kỹ thuật', value: 300, color: '#10b981' },
  { name: 'Kinh tế', value: 200, color: '#f59e0b' },
  { name: 'Ngoại ngữ', value: 278, color: '#ef4444' },
];

const chartData = [{ val: 400 }, { val: 300 }, { val: 200 }, { val: 450 }, { val: 590 }, { val: 320 }, { val: 680 }];

/* ═══════════════════════════════════════════════════════
   BORROW REQUESTS PANEL — Trang quản trị yêu cầu mượn
═══════════════════════════════════════════════════════ */

const STATUS_TABS = [
  { key: 'pending',  label: 'Chờ duyệt',  icon: '⏳', color: '#b45309', accent: '#f59e0b', bg: 'rgba(245,158,11,0.13)', border: 'rgba(245,158,11,0.4)' },
  { key: 'active',   label: 'Đang mượn', icon: '📚', color: '#4338ca', accent: '#6366f1', bg: 'rgba(99,102,241,0.13)',  border: 'rgba(99,102,241,0.4)'  },
  { key: 'rejected', label: 'Từ chối',   icon: '❌', color: '#dc2626', accent: '#ef4444', bg: 'rgba(239,68,68,0.13)',   border: 'rgba(239,68,68,0.4)'   },
  { key: 'returned', label: 'Đã trả',    icon: '✅', color: '#059669', accent: '#10b981', bg: 'rgba(16,185,129,0.13)',  border: 'rgba(16,185,129,0.4)'  },
  { key: 'overdue',  label: 'Quá hạn',   icon: '⚠️', color: '#9f1239', accent: '#e11d48', bg: 'rgba(225,29,72,0.1)',   border: 'rgba(225,29,72,0.35)'  },
  { key: 'all',      label: 'Tất cả',    icon: '📂', color: '#475569', accent: '#64748b', bg: 'rgba(100,116,139,0.1)',  border: 'rgba(100,116,139,0.3)' },
];

const STATUS_INFO = {
  // Exact PostgreSQL ENUM values (viết hoa)
  Pending:   { text: 'Chờ duyệt',   color: '#b45309', bg: 'rgba(245,158,11,0.13)', border: 'rgba(245,158,11,0.35)', icon: '⏳' },
  Active:    { text: 'Đang mượn',  color: '#4338ca', bg: 'rgba(99,102,241,0.13)',  border: 'rgba(99,102,241,0.35)', icon: '📚' },
  Rejected:  { text: 'Từ chối',    color: '#dc2626', bg: 'rgba(239,68,68,0.13)',   border: 'rgba(239,68,68,0.35)',  icon: '❌' },
  Returned:  { text: 'Đã trả sách',color: '#059669', bg: 'rgba(16,185,129,0.13)',  border: 'rgba(16,185,129,0.35)', icon: '✅' },
  Completed: { text: 'Hoàn thành', color: '#059669', bg: 'rgba(16,185,129,0.13)',  border: 'rgba(16,185,129,0.35)', icon: '✅' },
  Overdue:   { text: 'Quá hạn',    color: '#9f1239', bg: 'rgba(225,29,72,0.1)',   border: 'rgba(225,29,72,0.35)',  icon: '⚠️' },
  // lowercase aliases (fallback)
  pending:   { text: 'Chờ duyệt',   color: '#b45309', bg: 'rgba(245,158,11,0.13)', border: 'rgba(245,158,11,0.35)', icon: '⏳' },
  active:    { text: 'Đang mượn',  color: '#4338ca', bg: 'rgba(99,102,241,0.13)',  border: 'rgba(99,102,241,0.35)', icon: '📚' },
  rejected:  { text: 'Từ chối',    color: '#dc2626', bg: 'rgba(239,68,68,0.13)',   border: 'rgba(239,68,68,0.35)',  icon: '❌' },
  returned:  { text: 'Đã trả sách',color: '#059669', bg: 'rgba(16,185,129,0.13)',  border: 'rgba(16,185,129,0.35)', icon: '✅' },
  overdue:   { text: 'Quá hạn',    color: '#9f1239', bg: 'rgba(225,29,72,0.1)',   border: 'rgba(225,29,72,0.35)',  icon: '⚠️' },
};


const BorrowRequestsPanel = () => {
  const [activeStatus, setActiveStatus] = useState('pending');
  const [allData,      setAllData]      = useState({});
  const [loadingTab,   setLoadingTab]   = useState({});
  const [processing,   setProcessing]   = useState({});
  const [msgs,         setMsgs]         = useState({});
  const [search,       setSearch]       = useState('');
  const [editingTicketId, setEditingTicketId] = useState(null);
  const [editingBooks, setEditingBooks] = useState([]);
  const [savingTicket, setSavingTicket] = useState(false);

  const handleSaveEdit = async (ticketId) => {
    if (editingBooks.length === 0) {
      alert('Phiếu mượn phải chứa ít nhất 1 cuốn sách!');
      return;
    }
    setSavingTicket(true);
    try {
      const res = await axios.put(`http://127.0.0.1:8000/api/borrow_request/${ticketId}/`, {
        items: editingBooks.map(b => ({ book_id: b.book_id, quantity: b.quantity || 1 }))
      });
      alert(res.data.message || 'Cập nhật thành công!');
      setEditingTicketId(null);
      setEditingBooks([]);
      // Refresh
      fetchTab('pending');
      fetchTab('all');
    } catch (err) {
      alert(err.response?.data?.error || 'Có lỗi xảy ra khi cập nhật!');
    } finally {
      setSavingTicket(false);
    }
  };

  /* ── Fetch một status tab ── */
  const fetchTab = async (statusKey) => {
    setLoadingTab(p => ({ ...p, [statusKey]: true }));
    try {
      const url = `http://127.0.0.1:8000/api/borrow_request/?status=${statusKey}`;
      const res = await axios.get(url);
      setAllData(prev => ({ ...prev, [statusKey]: Array.isArray(res.data) ? res.data : [] }));
    } catch { /* silent */ }
    finally { setLoadingTab(p => ({ ...p, [statusKey]: false })); }
  };

  useEffect(() => {
    STATUS_TABS.forEach(t => fetchTab(t.key));
  }, []);

  /* ── Filtered list ── */
  const currentList  = allData[activeStatus] || [];
  const isTabLoading = !!loadingTab[activeStatus];

  const filteredList = useMemo(() => {
    const s = search.toLowerCase().trim();
    if (!s) return currentList;
    return currentList.filter(ticket =>
      ticket.member_name?.toLowerCase().includes(s) ||
      ticket.member_username?.toLowerCase().includes(s) ||
      ticket.books?.some(b => b.title?.toLowerCase().includes(s)) ||
      String(ticket.ticket_id).includes(s)
    );
  }, [currentList, search]);

  /* ── Approve / Reject ── */
  const handleAction = async (ticketId, action) => {
    setProcessing(p => ({ ...p, [ticketId]: action }));
    try {
      const adminUser = JSON.parse(localStorage.getItem('user') || '{}');
      const res = await axios.patch(
        `http://127.0.0.1:8000/api/borrow_request/${ticketId}/approve/`,
        { action, librarian_username: adminUser.username || '' }
      );
      setMsgs(m => ({ ...m, [ticketId]: { type: action, text: res.data.message } }));
      setTimeout(() => {
        setMsgs(m => { const n = { ...m }; delete n[ticketId]; return n; });
        fetchTab('pending');
        fetchTab(action === 'approve' ? 'active' : 'rejected');
        fetchTab('all');
      }, 2200);
    } catch (err) {
      setMsgs(m => ({ ...m, [ticketId]: { type: 'error', text: err.response?.data?.error || 'Lỗi xử lý' } }));
    } finally {
      setProcessing(p => { const n = { ...p }; delete n[ticketId]; return n; });
    }
  };

  const activeTabDef = STATUS_TABS.find(t => t.key === activeStatus);

  return (
    <div style={{ paddingBottom: '2rem' }}>

      {/* ── STAT CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        {STATUS_TABS.filter(t => !['all', 'overdue'].includes(t.key)).map(t => {
          const count = allData[t.key]?.length ?? 0;
          const isActive = activeStatus === t.key;
          return (
            <div
              key={t.key}
              onClick={() => setActiveStatus(t.key)}
              style={{
                background: isActive ? t.bg : 'var(--card-bg)',
                border: `2px solid ${isActive ? t.border : 'var(--table-border)'}`,
                borderRadius: '1rem', padding: '1.1rem 1.4rem',
                cursor: 'pointer', transition: 'all .22s',
                boxShadow: isActive ? `0 6px 20px ${t.accent}25` : 'var(--shadow-sm)',
                transform: isActive ? 'translateY(-2px)' : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{t.icon}</span>
                <span style={{ fontSize: '1.75rem', fontWeight: 900, color: isActive ? t.accent : 'var(--text-primary)', lineHeight: 1 }}>
                  {loadingTab[t.key] ? '…' : count}
                </span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.8rem', color: isActive ? t.color : 'var(--text-secondary)' }}>
                {t.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── STATUS TAB FILTER BAR ── */}
      <div style={{
        display: 'flex', gap: '0.4rem', marginBottom: '1.4rem',
        background: 'var(--card-bg)', padding: '0.35rem',
        borderRadius: '1rem', border: '1px solid var(--table-border)',
        width: 'fit-content', flexWrap: 'wrap',
      }}>
        {STATUS_TABS.map(t => {
          const isActive = activeStatus === t.key;
          const count = allData[t.key]?.length ?? 0;
          return (
            <button
              key={t.key}
              onClick={() => setActiveStatus(t.key)}
              style={{
                padding: '0.45rem 1rem', borderRadius: '0.75rem', border: 'none',
                fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all .2s',
                background: isActive ? t.bg : 'transparent',
                color: isActive ? t.color : 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', gap: '0.35rem',
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              <span style={{
                background: isActive ? t.accent : 'var(--table-border)',
                color: '#fff', fontSize: '0.68rem', fontWeight: 800,
                padding: '0.05rem 0.4rem', borderRadius: '50px', minWidth: '18px', textAlign: 'center',
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── TOOLBAR ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          background: 'var(--card-bg)', border: '1px solid var(--table-border)',
          padding: '0.55rem 1.1rem', borderRadius: '0.75rem', width: '320px',
        }}>
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            placeholder="Tìm tên, username, tên sách, mã phiếu..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontSize: '0.84rem', color: 'var(--text-primary)', fontWeight: 500, width: '100%',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1rem', lineHeight: 1 }}>✕</button>
          )}
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          {activeStatus === 'pending' && currentList.length > 0 && (
            <span style={{
              background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)',
              color: '#b45309', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700,
            }}>
              ⏳ {currentList.length} yêu cầu chờ xử lý
            </span>
          )}
          {search && filteredList.length !== currentList.length && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Hiển thị {filteredList.length} / {currentList.length} kết quả
            </span>
          )}
          <button
            onClick={() => STATUS_TABS.forEach(t => fetchTab(t.key))}
            style={{
              background: 'var(--accent)', color: '#fff', border: 'none',
              padding: '0.5rem 1.1rem', borderRadius: '0.75rem',
              cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              transition: 'all .2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            ↻ Làm mới
          </button>
        </div>
      </div>

      {/* ── TICKET LIST ── */}
      {isTabLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <Loader2 size={36} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '1rem', fontWeight: 600 }}>Đang tải dữ liệu...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: 'var(--card-bg)', borderRadius: '1.25rem',
          border: '1.5px dashed var(--table-border)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            {activeStatus === 'pending' ? '✅' : activeStatus === 'rejected' ? '🚫' : activeStatus === 'returned' ? '📗' : '📭'}
          </div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 800 }}>Không có yêu cầu nào</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {search ? `Không tìm thấy kết quả phù hợp với "${search}"` : 'Không có yêu cầu mượn nào ở trạng thái này.'}
          </p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {filteredList.map((ticket, idx) => {
              const si = STATUS_INFO[ticket.status] || { text: ticket.status, color: '#64748b', bg: '#f1f5f9', border: '#e2e8f0', icon: '📋' };
              const isPending = ticket.status.toLowerCase() === 'pending';
              return (
                <motion.div
                  key={ticket.ticket_id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: idx * 0.04 }}
                  style={{
                    background: 'var(--card-bg)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid var(--table-border)',
                    borderLeft: `4px solid ${si.color}`,
                    borderRadius: '1rem',
                    padding: '1.2rem 1.5rem',
                    display: 'flex', alignItems: 'flex-start', gap: '1.25rem',
                    boxShadow: 'var(--shadow-sm)', flexWrap: 'wrap',
                    transition: 'box-shadow .2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
                >
                  {/* Icon */}
                  <div style={{
                    width: '46px', height: '46px', borderRadius: '12px',
                    background: si.bg, border: `1px solid ${si.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, fontSize: '1.3rem',
                  }}>
                    {si.icon}
                  </div>

                  {/* Info block */}
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    {/* Book title(s) + status badge + ID */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '0.15rem 0.65rem', borderRadius: '50px',
                        fontSize: '0.7rem', fontWeight: 800,
                        background: si.bg, color: si.color, border: `1px solid ${si.border}`,
                      }}>
                        {si.text}
                      </span>
                      <span style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        #{ticket.ticket_id}
                      </span>
                    </div>

                    {editingTicketId === ticket.ticket_id ? (
                      /* Editing Mode Form */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem', marginBottom: '1rem', background: 'var(--table-border)', padding: '1rem', borderRadius: '12px', maxWidth: '500px' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>✏️ ĐANG CHỈNH SỬA PHIẾU MƯỢN</div>
                        {editingBooks.map(b => (
                          <div key={b.book_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: 'var(--card-bg)', padding: '0.4rem 0.8rem', borderRadius: '8px' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '240px' }}>📖 {b.title}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                              <button
                                onClick={() => {
                                  const updated = editingBooks.map(x => x.book_id === b.book_id ? { ...x, quantity: Math.max(1, (x.quantity || 1) - 1) } : x);
                                  setEditingBooks(updated);
                                }}
                                style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1px solid var(--table-border)', background: 'transparent', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                -
                              </button>
                              <span style={{ fontWeight: 800, fontSize: '0.82rem', minWidth: '18px', textAlign: 'center' }}>{b.quantity || 1}</span>
                              <button
                                onClick={() => {
                                  const updated = editingBooks.map(x => x.book_id === b.book_id ? { ...x, quantity: (x.quantity || 1) + 1 } : x);
                                  setEditingBooks(updated);
                                }}
                                style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1px solid var(--table-border)', background: 'transparent', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                +
                              </button>
                              <button
                                onClick={() => {
                                  const updated = editingBooks.filter(x => x.book_id !== b.book_id);
                                  setEditingBooks(updated);
                                }}
                                style={{ marginLeft: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center' }}>
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        ))}
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                          <button
                            onClick={() => handleSaveEdit(ticket.ticket_id)}
                            disabled={savingTicket}
                            style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.4rem 0.9rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}>
                            {savingTicket ? 'Đang lưu...' : 'Lưu'}
                          </button>
                          <button
                            onClick={() => { setEditingTicketId(null); setEditingBooks([]); }}
                            style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--table-border)', padding: '0.4rem 0.9rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Normal Detailed Books List */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem', marginBottom: '0.6rem' }}>
                        {ticket.books?.length > 0 ? (
                          ticket.books.map(b => (
                            <div key={b.book_id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--table-border)', padding: '0.25rem 0.75rem', borderRadius: '8px', width: 'fit-content', fontSize: '0.82rem' }}>
                              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>📖 {b.title}</span>
                              <span style={{ background: 'var(--accent)', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '0.05rem 0.4rem', borderRadius: '50px' }}>
                                SL: {b.quantity || 1}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>(Không rõ sách)</span>
                        )}
                      </div>
                    )}

                    {/* Meta row */}
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                      <span>
                        👤 <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{ticket.member_name}</strong>
                        {' '}({ticket.member_username})
                      </span>
                      <span>📅 Ngày mượn: {ticket.borrow_date}</span>
                      {ticket.books?.[0]?.due_date   && <span>⏰ Hạn trả: {ticket.books[0].due_date}</span>}
                      {ticket.books?.[0]?.return_date && <span>🔄 Ngày trả: {ticket.books[0].return_date}</span>}
                    </div>

                    {/* Librarian tag */}
                    {ticket.librarian_name && (
                      <div style={{ marginTop: '0.25rem' }}>
                        <span style={{
                          background: 'rgba(99,102,241,0.1)', color: '#6366f1',
                          padding: '0.15rem 0.65rem', borderRadius: '50px',
                          fontSize: '0.72rem', fontWeight: 700,
                        }}>
                          🧑‍💼 Xử lý bởi: {ticket.librarian_name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Feedback message */}
                  {msgs[ticket.ticket_id] && (
                    <div style={{
                      padding: '0.45rem 1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, alignSelf: 'center',
                      background: msgs[ticket.ticket_id].type === 'approve' ? '#d1fae5'
                                : msgs[ticket.ticket_id].type === 'reject'  ? '#fef2f2' : '#fef9c3',
                      color:      msgs[ticket.ticket_id].type === 'approve' ? '#065f46'
                                : msgs[ticket.ticket_id].type === 'reject'  ? '#991b1b' : '#92400e',
                      border: `1px solid ${msgs[ticket.ticket_id].type === 'approve' ? '#a7f3d0'
                              : msgs[ticket.ticket_id].type === 'reject'  ? '#fecaca' : '#fde68a'}`,
                    }}>
                      {msgs[ticket.ticket_id].text}
                    </div>
                  )}

                  {/* Action buttons — chỉ hiện khi pending */}
                  {isPending && !msgs[ticket.ticket_id] && editingTicketId !== ticket.ticket_id && (
                    <div style={{ display: 'flex', gap: '0.6rem', flexShrink: 0, alignSelf: 'center' }}>
                      <button
                        onClick={() => {
                          setEditingTicketId(ticket.ticket_id);
                          setEditingBooks(ticket.books.map(b => ({ ...b })));
                        }}
                        disabled={!!processing[ticket.ticket_id]}
                        style={{
                          background: 'var(--card-bg)', color: '#4f46e5',
                          border: '1.5px solid #c7d2fe',
                          padding: '0.55rem 1.15rem', borderRadius: '9px',
                          fontWeight: 800, fontSize: '0.82rem',
                          cursor: processing[ticket.ticket_id] ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: '0.3rem',
                          opacity: processing[ticket.ticket_id] ? 0.65 : 1,
                          transition: 'all .2s',
                        }}
                        onMouseEnter={e => { if (!processing[ticket.ticket_id]) { e.currentTarget.style.background = '#e0e7ff'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--card-bg)'; e.currentTarget.style.transform = ''; }}
                      >
                        <Edit3 size={14} /> Sửa
                      </button>
                      <button
                        onClick={() => handleAction(ticket.ticket_id, 'approve')}
                        disabled={!!processing[ticket.ticket_id]}
                        style={{
                          background: 'linear-gradient(135deg,#059669,#10b981)',
                          color: '#fff', border: 'none',
                          padding: '0.55rem 1.15rem', borderRadius: '9px',
                          fontWeight: 800, fontSize: '0.82rem',
                          cursor: processing[ticket.ticket_id] ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: '0.3rem',
                          boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                          opacity: processing[ticket.ticket_id] ? 0.65 : 1,
                          transition: 'all .2s',
                        }}
                        onMouseEnter={e => { if (!processing[ticket.ticket_id]) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => e.currentTarget.style.transform = ''}
                      >
                        {processing[ticket.ticket_id] === 'approve' ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : '✓ Duyệt'}
                      </button>
                      <button
                        onClick={() => handleAction(ticket.ticket_id, 'reject')}
                        disabled={!!processing[ticket.ticket_id]}
                        style={{
                          background: 'var(--card-bg)', color: '#ef4444',
                          border: '1.5px solid #fecaca',
                          padding: '0.55rem 1.15rem', borderRadius: '9px',
                          fontWeight: 800, fontSize: '0.82rem',
                          cursor: processing[ticket.ticket_id] ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: '0.3rem',
                          opacity: processing[ticket.ticket_id] ? 0.65 : 1,
                          transition: 'all .2s',
                        }}
                        onMouseEnter={e => { if (!processing[ticket.ticket_id]) { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--card-bg)'; e.currentTarget.style.transform = ''; }}
                      >
                        {processing[ticket.ticket_id] === 'reject' ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : '✕ Từ chối'}
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   INVENTORY PANEL — Trang quản trị nhập kho sách
═══════════════════════════════════════════════════════ */
const InventoryPanel = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [addQty, setAddQty] = useState(1);
  const [updating, setUpdating] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(null);
  const [importHistory, setImportHistory] = useState([]);
  const [historySearch, setHistorySearch] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const [csvEncoding, setCsvEncoding] = useState('UTF-8');
  const itemsPerPage = 10;

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/books/');
      setBooks(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
    // Load history from localStorage
    const saved = localStorage.getItem('openlib_import_history');
    if (saved) {
      try {
        setImportHistory(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const logImportTransaction = (type, details) => {
    const adminUser = JSON.parse(localStorage.getItem('user') || '{}');
    const newRecord = {
      id: `NK-${new Date().getTime().toString().slice(-6)}`,
      timestamp: new Date().toLocaleString('vi-VN'),
      operator: adminUser.username || 'Thủ thư',
      type: type, // 'quick' or 'bulk'
      details: details,
      status: 'success'
    };

    setImportHistory(prev => {
      const updated = [newRecord, ...prev];
      localStorage.setItem('openlib_import_history', JSON.stringify(updated));
      return updated;
    });
  };

  const exportHistoryCSV = () => {
    if (importHistory.length === 0) return;
    const headers = 'Mã phiếu,Thời gian,Thủ thư giao dịch,Hình thức,Chi tiết,Trạng thái\n';
    const rows = importHistory.map(item => {
      const typeStr = item.type === 'quick' ? 'Nhập lẻ' : 'Nhập file';
      return `${item.id},"${item.timestamp}","${item.operator}","${typeStr}","${item.details}",Thành công`;
    }).join('\n');
    const csvContent = "\uFEFF" + headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lich_su_nhap_kho_${new Date().getTime()}.csv`;
    link.target = '_blank';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
  };

  const downloadSampleCSV = () => {
    const headers = 'isbn,title,stock,publication_year,category_id,author_id,publisher_id\n';
    const row1 = '978-6043444455,Tôi Thấy Hoa Vàng Trên Cỏ Xanh,15,2015,1,1,1\n';
    const row2 = '978-6047761008,Mắt Biếc (Bản Đặc Biệt),20,2019,2,2,1\n';
    const row3 = '978-0135974445,Nhà Giả Kim (Tái Bản 2020),30,2020,3,1,2\n';
    const csvContent = "\uFEFF" + headers + row1 + row2 + row3;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_import_books.csv';
    link.target = '_blank';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
  };

  const handleFileChange = (fileOrEvent) => {
    let file = null;
    if (fileOrEvent && fileOrEvent.target && fileOrEvent.target.files) {
      file = fileOrEvent.target.files[0];
    } else if (fileOrEvent instanceof File) {
      file = fileOrEvent;
    } else if (csvFile) {
      file = csvFile;
    }

    if (!file) return;
    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      let text = evt.target.result;
      if (text.charCodeAt(0) === 0xFEFF) {
        text = text.substr(1);
      }
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      if (lines.length <= 1) {
        setCsvPreview([]);
        return;
      }
      
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const rows = lines.slice(1);
      
      const parsedRows = rows.map(row => {
        const columns = row.split(',').map(c => c.trim());
        const data = {};
        headers.forEach((header, index) => {
          data[header] = columns[index] || '';
        });
        return data;
      });
      setCsvPreview(parsedRows);
    };
    reader.readAsText(file, csvEncoding);
  };

  useEffect(() => {
    if (csvFile) handleFileChange(csvFile);
  }, [csvEncoding]);

  const handlePreviewCellChange = (rowIndex, field, value) => {
    setCsvPreview(prev => {
      const copy = [...prev];
      copy[rowIndex] = { ...copy[rowIndex], [field]: value };
      return copy;
    });
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!selectedBookId) {
      alert('Vui lòng chọn sách cần nhập thêm!');
      return;
    }
    const book = books.find(b => b.book_id === parseInt(selectedBookId));
    if (!book) return;

    setUpdating(true);
    const newStock = (parseInt(book.stock) || 0) + parseInt(addQty);

    try {
      await axios.patch(`http://127.0.0.1:8000/api/books/${book.book_id}/`, {
        stock: newStock
      });
      setMessage({ type: 'success', text: `Đã nhập thêm thành công ${addQty} cuốn cho sách "${book.title}".` });
      logImportTransaction('quick', `Nhập thêm ${addQty} cuốn cho sách "${book.title}"`);
      setSelectedBookId('');
      setAddQty(1);
      fetchBooks();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi cập nhật kho!' });
    } finally {
      setUpdating(false);
    }
  };

  const handleCSVImport = async (e) => {
    e.preventDefault();
    if (csvPreview.length === 0) {
      alert('Vui lòng chọn file CSV hợp lệ!');
      return;
    }

    setImporting(true);
    setProgress(0);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < csvPreview.length; i++) {
      const row = csvPreview[i];

      // Construct book object
      const bookObj = {
        title: row.title || '',
        isbn: row.isbn || '',
        stock: parseInt(row.stock) || 0,
        publication_year: parseInt(row.publication_year) || new Date().getFullYear(),
        category: row.category_id ? parseInt(row.category_id) : null,
        author: row.author_id ? parseInt(row.author_id) : null,
        publisher: row.publisher_id ? parseInt(row.publisher_id) : null,
      };

      try {
        await axios.post('http://127.0.0.1:8000/api/books/', bookObj);
        successCount++;
      } catch (err) {
        console.error('Import failed for row:', row, err);
        failCount++;
      }

      setProgress(Math.round(((i + 1) / csvPreview.length) * 100));
    }

    setImporting(false);
    setCsvFile(null);
    setCsvPreview([]);
    setMessage({
      type: 'success',
      text: `Nhập hàng loạt hoàn tất! Nhập thành công: ${successCount} đầu sách. Thất bại: ${failCount} đầu sách.`
    });
    logImportTransaction('bulk', `Nhập hàng loạt ${successCount} đầu sách bằng file CSV`);
    fetchBooks();
    setTimeout(() => setMessage(null), 6000);
  };

  const totalBooks = books.length;
  const totalStock = books.reduce((sum, b) => sum + (parseInt(b.stock) || 0), 0);
  const lowStockCount = books.filter(b => (parseInt(b.stock) || 0) < 5).length;

  return (
    <div style={{ paddingBottom: '2rem' }}>
      {/* STATS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--table-border)', borderRadius: '1rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '1.5rem' }}>📦</span>
          <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--accent)' }}>{loading ? '…' : totalStock}</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Tổng số sách hiện có trong kho</span>
        </div>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--table-border)', borderRadius: '1rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ef4444' }}>{loading ? '…' : lowStockCount}</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Đầu sách sắp hết hàng (&lt; 5 cuốn)</span>
        </div>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--table-border)', borderRadius: '1rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '1.5rem' }}>📚</span>
          <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10b981' }}>{loading ? '…' : totalBooks}</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Tổng số danh mục đầu sách</span>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem',
          background: message.type === 'success' ? 'rgba(16,185,129,0.13)' : 'rgba(239,68,68,0.13)',
          color: message.type === 'success' ? '#059669' : '#dc2626',
          border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
          fontWeight: 700, fontSize: '0.85rem'
        }}>
          {message.text}
        </div>
      )}

      {/* TWO COLUMNS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* COL 1: QUICK STOCK ADJUSTMENT */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--table-border)', borderRadius: '1.25rem', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ margin: '0 0 0.5rem', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>⚡ Nhập Thêm Sách Có Sẵn</h3>
          <p style={{ margin: '0 0 1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Tăng số lượng tồn kho nhanh chóng cho sách đã tồn tại trong hệ thống.
          </p>

          <form onSubmit={handleQuickAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 750, color: 'var(--text-secondary)' }}>CHỌN ĐẦU SÁCH</label>
              <Select
                options={books.map(b => ({ value: b.book_id, label: `${b.title} (ISBN: ${b.isbn} - Tồn: ${b.stock})` }))}
                value={selectedBookId ? { value: selectedBookId, label: books.find(b => b.book_id === parseInt(selectedBookId))?.title || 'Đã chọn' } : null}
                onChange={selected => setSelectedBookId(selected ? selected.value : '')}
                placeholder="-- Gõ để tìm hoặc chọn sách --"
                isSearchable
                styles={{
                  control: (base) => ({
                    ...base, padding: '0.2rem', borderRadius: '0.75rem',
                    border: '1px solid var(--table-border)', background: 'var(--input-bg)',
                    boxShadow: 'none', '&:hover': { borderColor: 'var(--accent)' }
                  }),
                  singleValue: (base) => ({ ...base, color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem' }),
                  menu: (base) => ({ ...base, zIndex: 9999, background: 'var(--card-bg)', border: '1px solid var(--table-border)', borderRadius: '0.75rem' }),
                  option: (base, state) => ({ ...base, background: state.isFocused ? 'rgba(99,102,241,0.1)' : 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem' }),
                  input: (base) => ({ ...base, color: 'var(--text-primary)' })
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 750, color: 'var(--text-secondary)' }}>SỐ LƯỢNG NHẬP THÊM</label>
              <input
                type="number"
                min="1"
                value={addQty}
                onChange={e => setAddQty(e.target.value)}
                style={{
                  padding: '0.65rem 1rem', borderRadius: '0.75rem',
                  border: '1px solid var(--table-border)', background: 'var(--input-bg)',
                  color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem', outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              style={{
                marginTop: '0.5rem', padding: '0.7rem', borderRadius: '0.75rem',
                border: 'none', background: 'var(--accent)', color: '#fff',
                fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: '0 4px 12px var(--accent-glow)'
              }}
            >
              {updating ? 'Đang cập nhật...' : 'Cập nhật số lượng'}
            </button>
          </form>
        </div>

        {/* COL 2: EXCEL/CSV BULK IMPORT */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--table-border)', borderRadius: '1.25rem', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ margin: '0 0 0.5rem', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>📁 Nhập Sách Hàng Loạt (File CSV)</h3>
          <p style={{ margin: '0 0 1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Tải lên file CSV chứa danh mục để thêm nhiều sách cùng lúc vào hệ thống.
          </p>

          <form onSubmit={handleCSVImport} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div style={{
              border: '2px dashed var(--table-border)', borderRadius: '1rem',
              padding: '1.5rem', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
              background: 'var(--input-bg)', cursor: 'pointer', position: 'relative'
            }}>
              <span style={{ fontSize: '2rem' }}>📤</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                {csvFile ? csvFile.name : 'Nhấp để chọn file CSV'}
              </span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  opacity: 0, cursor: 'pointer'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Bảng mã (Encoding):</span>
              <select
                value={csvEncoding}
                onChange={e => setCsvEncoding(e.target.value)}
                style={{
                  padding: '0.2rem 0.5rem', borderRadius: '0.4rem', border: '1px solid var(--table-border)',
                  background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.75rem', outline: 'none', fontWeight: 600
                }}
              >
                <option value="UTF-8">UTF-8 (Chuẩn quốc tế)</option>
                <option value="windows-1258">Windows-1258 (Excel tiếng Việt)</option>
              </select>
            </div>

            <div style={{ background: 'rgba(99,102,241,0.06)', borderRadius: '0.75rem', padding: '0.75rem 1rem', border: '1px solid rgba(99,102,241,0.15)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.73rem', fontWeight: 800, color: 'var(--accent)' }}>* CẤU TRÚC FILE CSV MẪU:</div>
                <button
                  type="button"
                  onClick={downloadSampleCSV}
                  style={{
                    background: 'var(--accent)', color: '#fff', border: 'none',
                    padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.68rem',
                    fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem'
                  }}
                >
                  📥 Tải file mẫu
                </button>
              </div>
              <code style={{ fontSize: '0.65rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                isbn,title,stock,publication_year,category_id,author_id,publisher_id
              </code>
            </div>

            {importing && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  <span>Tiến trình nhập sách...</span>
                  <span>{progress}%</span>
                </div>
                <div style={{ background: 'var(--table-border)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, background: 'var(--accent)', height: '100%', transition: 'width 0.1s' }}></div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={importing || csvPreview.length === 0}
              style={{
                marginTop: '0.5rem', padding: '0.7rem', borderRadius: '0.75rem',
                border: 'none', background: importing || csvPreview.length === 0 ? 'var(--table-border)' : 'var(--accent)',
                color: '#fff', fontWeight: 800, fontSize: '0.85rem',
                cursor: importing || csvPreview.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: importing || csvPreview.length === 0 ? 'none' : '0 4px 12px var(--accent-glow)'
              }}
            >
              {importing ? 'Đang xử lý file...' : 'Bắt đầu nhập sách'}
            </button>
          </form>
        </div>
      </div>

      {/* CSV PREVIEW TABLE ROW */}
      {csvPreview.length > 0 && (
        <div style={{
          marginTop: '1.75rem', background: 'var(--card-bg)', border: '1px solid var(--table-border)',
          borderRadius: '1.25rem', padding: '1.5rem', boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>👀 Xem Trước Dữ Liệu Nhập Kho ({csvPreview.length} bản ghi)</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Kiểm tra kỹ các trường thông tin bên dưới trước khi tiến hành thêm vào hệ thống.
              </p>
            </div>
            <button
              onClick={() => { setCsvFile(null); setCsvPreview([]); }}
              style={{
                background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)',
                padding: '0.35rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
              }}
            >
              Hủy bỏ file
            </button>
          </div>

          <div style={{ maxHeight: '250px', overflowY: 'auto', borderRadius: '0.75rem', border: '1px solid var(--table-border)' }}>
            <table className="lms-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: 'var(--input-bg)', borderBottom: '1px solid var(--table-border)' }}>
                  <th style={{ padding: '0.6rem 1rem', textAlign: 'left', fontWeight: 800, color: 'var(--text-secondary)' }}>ISBN</th>
                  <th style={{ padding: '0.6rem 1rem', textAlign: 'left', fontWeight: 800, color: 'var(--text-secondary)' }}>Tên sách</th>
                  <th style={{ padding: '0.6rem 1rem', textAlign: 'center', fontWeight: 800, color: 'var(--text-secondary)' }}>Số lượng</th>
                  <th style={{ padding: '0.6rem 1rem', textAlign: 'center', fontWeight: 800, color: 'var(--text-secondary)' }}>Năm XB</th>
                  <th style={{ padding: '0.6rem 1rem', textAlign: 'center', fontWeight: 800, color: 'var(--text-secondary)' }}>ID Thể loại</th>
                  <th style={{ padding: '0.6rem 1rem', textAlign: 'center', fontWeight: 800, color: 'var(--text-secondary)' }}>ID Tác giả</th>
                  <th style={{ padding: '0.6rem 1rem', textAlign: 'center', fontWeight: 800, color: 'var(--text-secondary)' }}>ID NXB</th>
                </tr>
              </thead>
              <tbody>
                {csvPreview.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--table-border)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '0.2rem 0.5rem' }}>
                      <input
                        type="text"
                        value={row.isbn || ''}
                        onChange={e => handlePreviewCellChange(idx, 'isbn', e.target.value)}
                        style={{
                          background: 'transparent', border: 'none', color: 'var(--text-primary)',
                          width: '100%', padding: '0.4rem 0.5rem', fontSize: '0.8rem', fontWeight: 700, outline: 'none', borderRadius: '4px'
                        }}
                        onFocus={e => e.currentTarget.style.background = 'var(--input-bg)'}
                        onBlur={e => e.currentTarget.style.background = 'transparent'}
                      />
                    </td>
                    <td style={{ padding: '0.2rem 0.5rem' }}>
                      <input
                        type="text"
                        value={row.title || ''}
                        onChange={e => handlePreviewCellChange(idx, 'title', e.target.value)}
                        style={{
                          background: 'transparent', border: 'none', color: 'var(--text-primary)',
                          width: '100%', padding: '0.4rem 0.5rem', fontSize: '0.8rem', fontWeight: 650, outline: 'none', borderRadius: '4px'
                        }}
                        onFocus={e => e.currentTarget.style.background = 'var(--input-bg)'}
                        onBlur={e => e.currentTarget.style.background = 'transparent'}
                      />
                    </td>
                    <td style={{ padding: '0.2rem 0.5rem', textAlign: 'center' }}>
                      <input
                        type="number"
                        value={row.stock || ''}
                        onChange={e => handlePreviewCellChange(idx, 'stock', e.target.value)}
                        style={{
                          background: 'transparent', border: 'none', color: 'var(--accent)',
                          width: '100%', padding: '0.4rem 0.5rem', fontSize: '0.8rem', fontWeight: 800, outline: 'none', borderRadius: '4px', textAlign: 'center'
                        }}
                        onFocus={e => e.currentTarget.style.background = 'var(--input-bg)'}
                        onBlur={e => e.currentTarget.style.background = 'transparent'}
                      />
                    </td>
                    <td style={{ padding: '0.2rem 0.5rem', textAlign: 'center' }}>
                      <input
                        type="number"
                        value={row.publication_year || ''}
                        onChange={e => handlePreviewCellChange(idx, 'publication_year', e.target.value)}
                        style={{
                          background: 'transparent', border: 'none', color: 'var(--text-secondary)',
                          width: '100%', padding: '0.4rem 0.5rem', fontSize: '0.8rem', fontWeight: 600, outline: 'none', borderRadius: '4px', textAlign: 'center'
                        }}
                        onFocus={e => e.currentTarget.style.background = 'var(--input-bg)'}
                        onBlur={e => e.currentTarget.style.background = 'transparent'}
                      />
                    </td>
                    <td style={{ padding: '0.2rem 0.5rem', textAlign: 'center' }}>
                      <input
                        type="number"
                        value={row.category_id || ''}
                        onChange={e => handlePreviewCellChange(idx, 'category_id', e.target.value)}
                        style={{
                          background: 'transparent', border: 'none', color: 'var(--text-secondary)',
                          width: '100%', padding: '0.4rem 0.5rem', fontSize: '0.8rem', fontWeight: 600, outline: 'none', borderRadius: '4px', textAlign: 'center'
                        }}
                        onFocus={e => e.currentTarget.style.background = 'var(--input-bg)'}
                        onBlur={e => e.currentTarget.style.background = 'transparent'}
                      />
                    </td>
                    <td style={{ padding: '0.2rem 0.5rem', textAlign: 'center' }}>
                      <input
                        type="number"
                        value={row.author_id || ''}
                        onChange={e => handlePreviewCellChange(idx, 'author_id', e.target.value)}
                        style={{
                          background: 'transparent', border: 'none', color: 'var(--text-secondary)',
                          width: '100%', padding: '0.4rem 0.5rem', fontSize: '0.8rem', fontWeight: 600, outline: 'none', borderRadius: '4px', textAlign: 'center'
                        }}
                        onFocus={e => e.currentTarget.style.background = 'var(--input-bg)'}
                        onBlur={e => e.currentTarget.style.background = 'transparent'}
                      />
                    </td>
                    <td style={{ padding: '0.2rem 0.5rem', textAlign: 'center' }}>
                      <input
                        type="number"
                        value={row.publisher_id || ''}
                        onChange={e => handlePreviewCellChange(idx, 'publisher_id', e.target.value)}
                        style={{
                          background: 'transparent', border: 'none', color: 'var(--text-secondary)',
                          width: '100%', padding: '0.4rem 0.5rem', fontSize: '0.8rem', fontWeight: 600, outline: 'none', borderRadius: '4px', textAlign: 'center'
                        }}
                        onFocus={e => e.currentTarget.style.background = 'var(--input-bg)'}
                        onBlur={e => e.currentTarget.style.background = 'transparent'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* HISTORICAL RECEIPTS SECTION */}
      {(() => {
        const filteredHistory = importHistory.filter(item => 
          item.id.toLowerCase().includes(historySearch.toLowerCase()) ||
          item.details.toLowerCase().includes(historySearch.toLowerCase()) ||
          item.operator.toLowerCase().includes(historySearch.toLowerCase())
        );
        const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
        const currentHistory = filteredHistory.slice((historyPage - 1) * itemsPerPage, historyPage * itemsPerPage);

        return (
          <div style={{
            marginTop: '1.75rem', background: 'var(--card-bg)', border: '1px solid var(--table-border)',
            borderRadius: '1.25rem', padding: '1.75rem', boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>📜 Lịch Sử Giao Dịch Nhập Kho</h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Nhật ký ghi nhận lịch sử các lần bổ sung và nhập sách hàng loạt vào hệ thống.
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {importHistory.length > 0 && (
                  <>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}><Search size={14} /></span>
                      <input
                        type="text"
                        placeholder="Tìm kiếm phiếu nhập..."
                        value={historySearch}
                        onChange={e => { setHistorySearch(e.target.value); setHistoryPage(1); }}
                        style={{
                          padding: '0.45rem 1rem 0.45rem 2.2rem', borderRadius: '0.5rem',
                          border: '1px solid var(--table-border)', background: 'var(--input-bg)',
                          color: 'var(--text-primary)', fontSize: '0.75rem', outline: 'none'
                        }}
                      />
                    </div>
                    <button
                      onClick={exportHistoryCSV}
                      style={{
                        background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)',
                        padding: '0.45rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.3rem'
                      }}
                    >
                      <Download size={14} /> Xuất File CSV
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử hiển thị trên trình duyệt này không?')) {
                          setImportHistory([]);
                          localStorage.removeItem('openlib_import_history');
                        }
                      }}
                      style={{
                        background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)',
                        padding: '0.45rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      Xóa tất cả
                    </button>
                  </>
                )}
              </div>
            </div>

            {importHistory.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600 }}>
                📭 Chưa có giao dịch nhập kho nào được ghi nhận trên trình duyệt này.
              </div>
            ) : filteredHistory.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600 }}>
                ❌ Không tìm thấy giao dịch nào phù hợp với từ khóa tìm kiếm.
              </div>
            ) : (
              <>
                <div style={{ overflowY: 'auto', borderRadius: '0.75rem', border: '1px solid var(--table-border)' }}>
                  <table className="lms-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--input-bg)', borderBottom: '1px solid var(--table-border)' }}>
                        <th style={{ padding: '0.6rem 1rem', textAlign: 'left', fontWeight: 800, color: 'var(--text-secondary)' }}>MÃ PHIẾU</th>
                        <th style={{ padding: '0.6rem 1rem', textAlign: 'left', fontWeight: 800, color: 'var(--text-secondary)' }}>THỜI GIAN</th>
                        <th style={{ padding: '0.6rem 1rem', textAlign: 'left', fontWeight: 800, color: 'var(--text-secondary)' }}>THỦ THƯ</th>
                        <th style={{ padding: '0.6rem 1rem', textAlign: 'center', fontWeight: 800, color: 'var(--text-secondary)' }}>HÌNH THỨC</th>
                        <th style={{ padding: '0.6rem 1rem', textAlign: 'left', fontWeight: 800, color: 'var(--text-secondary)' }}>CHI TIẾT PHIẾU NHẬP</th>
                        <th style={{ padding: '0.6rem 1rem', textAlign: 'center', fontWeight: 800, color: 'var(--text-secondary)' }}>TRẠNG THÁI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentHistory.map((item, idx) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid var(--table-border)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)', fontWeight: 800 }}>{item.id}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{item.timestamp}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)', fontWeight: 700 }}>👤 {item.operator}</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                            <span style={{
                              padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800,
                              background: item.type === 'quick' ? 'rgba(99,102,241,0.1)' : 'rgba(16,185,129,0.1)',
                              color: item.type === 'quick' ? 'var(--accent)' : '#10b981',
                              border: `1px solid ${item.type === 'quick' ? 'rgba(99,102,241,0.2)' : 'rgba(16,185,129,0.2)'}`
                            }}>
                              {item.type === 'quick' ? '⚡ Nhập lẻ' : '📁 Nhập file'}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)', fontWeight: 650 }}>{item.details}</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                            <span style={{
                              padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800,
                              background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)'
                            }}>
                              Thành công ✅
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setHistoryPage(page)}
                        style={{
                          padding: '0.35rem 0.8rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.8rem',
                          background: historyPage === page ? 'var(--accent)' : 'var(--input-bg)',
                          color: historyPage === page ? '#fff' : 'var(--text-primary)',
                          border: `1px solid ${historyPage === page ? 'var(--accent)' : 'var(--table-border)'}`,
                          cursor: 'pointer'
                        }}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })()}
    </div>
  );
};

/* ════════════════════════════
   MAIN DASHBOARD COMPONENT
════════════════════════════ */
const Dashboard = ({ activeTab, tabs }) => {
  const [data, setData] = useState([]);
  const [booksRaw, setBooksRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [timeRange, setTimeRange] = useState('7d');
  const itemsPerPage = 5;
  const navigate = useNavigate();
  const adminUser = JSON.parse(localStorage.getItem('user') || '{}');


  const fetchData = async (tabKey) => {
    setLoading(true);
    setSearchTerm('');
    setActiveFilter('all');
    setSortConfig({ key: null, direction: 'asc' });
    setCurrentPage(1);
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/${tabs[tabKey].url}`);
      const fetchedData = Array.isArray(response.data) ? response.data : [];
      setData(fetchedData);
      if (tabKey === 'books' || tabKey === 'dashboard') {
        setBooksRaw(fetchedData);
      }
      setLoading(false);
    } catch (err) {
      console.error('LMS Error:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'borrow_requests') {
      fetchData(activeTab);
    } else {
      setLoading(false);
    }
  }, [activeTab]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const s = searchTerm.toLowerCase();
      
      // 1. Lọc theo SearchTerm
      const stringToSearch = (item.title || item.name || item.full_name || item.username || item.member_name || item.comment || item.reason || '').toLowerCase();
      const matchBasic = stringToSearch.includes(s);
      const matchBooksInTicket = item.details?.some(d => d.book_title?.toLowerCase().includes(s));
      const matchSearch = !s || matchBasic || matchBooksInTicket;

      // 2. Lọc theo ActiveFilter
      let matchStatus = true;
      if (activeFilter !== 'all') {
         if (activeFilter === 'available') matchStatus = item.stock > 0;
         if (activeFilter === 'out_of_stock') matchStatus = (item.stock || 0) <= 0;
         if (activeFilter === 'borrowing' || activeFilter === 'Active' || activeFilter === 'Đang mượn') matchStatus = item.status === 'borrowing' || item.status === 'Active' || item.status === 'Đang mượn';
         if (activeFilter === 'returned' || activeFilter === 'Returned' || activeFilter === 'Đã trả sách') matchStatus = item.status === 'returned' || item.status === 'Returned' || item.status === 'Đã trả sách';
         if (activeFilter === 'overdue' || activeFilter === 'Overdue') matchStatus = item.status === 'overdue' || item.status === 'Overdue';
         if (activeFilter === 'pending' || activeFilter === 'Pending') matchStatus = item.status === 'pending' || item.status === 'Pending';
         if (activeFilter === 'active') matchStatus = item.is_active === true || item.is_active === 'true';
         if (activeFilter === 'locked') matchStatus = item.is_active === false || item.is_active === 'false';
         if (activeFilter === 'unpaid') matchStatus = item.is_paid === false;
         if (activeFilter === 'paid') matchStatus = item.is_paid === true;
      }
      
      return matchSearch && matchStatus;
    });
  }, [data, searchTerm, activeFilter]);

  const sortedData = useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (aValue === undefined || aValue === null) aValue = '';
        if (bValue === undefined || bValue === null) bValue = '';
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <span style={{ opacity: 0.3, marginLeft: '4px', fontSize: '0.8rem' }}>↕</span>;
    return sortConfig.direction === 'asc' ? <span style={{ marginLeft: '4px', color: 'var(--accent)', fontSize: '0.8rem' }}>↑</span> : <span style={{ marginLeft: '4px', color: 'var(--accent)', fontSize: '0.8rem' }}>↓</span>;
  };

  // PAGINATION LOGIC
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage]);

  const stats = useMemo(() => {
    const total = booksRaw.length;
    const inventory = Array.isArray(booksRaw) ? booksRaw.reduce((acc, curr) => acc + (parseInt(curr.stock) || 0), 0) : 0;
    const critical = Array.isArray(booksRaw) ? booksRaw.filter(b => (parseInt(b.stock) || 0) < 5).length : 0;
    const categoriesCount = new Set(booksRaw.map(b => b.category)).size;
    return [
       { title: 'Tổng đầu sách', value: total, detail: '+12% so với tháng trước', icon: BookOpen, color: '#6366f1' },
       { title: 'Sách trong kho', value: inventory, detail: 'Đã cập nhật vừa xong', icon: Book, color: '#10b981' },
       { title: 'Sách tồn thấp', value: critical, detail: 'Cần nhập thêm sách', icon: AlertCircle, color: '#ef4444' },
       { title: 'Số lượng thể loại', value: categoriesCount, detail: 'Danh mục đa dạng', icon: Tag, color: '#f59e0b' }
    ];
  }, [booksRaw]);

  const handleAction = async (action, item) => {
    const idField = activeTab === 'books' || activeTab === 'dashboard' ? 'book_id' : 
                    activeTab === 'authors' ? 'author_id' : 
                    activeTab === 'categories' ? 'category_id' :
                    activeTab === 'users' || activeTab === 'members' ? 'user_id' :
                    activeTab === 'publishers' ? 'publisher_id' :
                    activeTab === 'reviews' ? 'review_id' :
                    activeTab === 'fines' ? 'fine_id' : 'ticket_id';
    
    const id = item[idField];
    const resource = tabs[activeTab].url.replace('/', '');

    if (action === 'view') navigate(`/admin/${activeTab}/detail/${id}`);
    if (action === 'edit') navigate(`/admin/${activeTab}/edit/${id}`);
    if (action === 'delete') {
      if ((activeTab === 'users' || activeTab === 'members') && item.user_id === adminUser.user_id) {
         alert('Bạn không thể tự xóa tài khoản của chính mình!');
         return;
      }
      if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi này? Hành động không thể hoàn tác!')) {
         try {
           await axios.delete(`http://127.0.0.1:8000/api/${resource}/${id}/`);
           alert('Đã xóa thành công!');
           fetchData(activeTab); // refresh list
         } catch(err) {
           alert('Lỗi: Không thể xóa dữ liệu vì có dữ liệu liên kết hoặc lỗi server!');
         }
      }
    }
  };

  const FilterDropdown = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="filter-dropdown">
       <div className="filter-header">Phân loại dữ liệu</div>
       <div className="filter-option" onClick={() => { setActiveFilter('all'); setShowFilter(false); }}>● Tất cả kết quả</div>
       {activeTab === 'books' && (
         <>
           <div className="filter-option" onClick={() => { setActiveFilter('available'); setShowFilter(false); }}>● Sách còn hàng</div>
           <div className="filter-option" onClick={() => { setActiveFilter('out_of_stock'); setShowFilter(false); }}>● Sách hết hàng</div>
         </>
       )}
       {activeTab === 'borrow' && (
         <>
           <div className="filter-option" onClick={() => { setActiveFilter('borrowing'); setShowFilter(false); }}>● Đang cho mượn</div>
           <div className="filter-option" onClick={() => { setActiveFilter('returned'); setShowFilter(false); }}>● Đã trả sách</div>
         </>
       )}
       {activeTab === 'members' && (
         <>
           <div className="filter-option" onClick={() => { setActiveFilter('active'); setShowFilter(false); }}>● Member hoạt động</div>
           <div className="filter-option" onClick={() => { setActiveFilter('locked'); setShowFilter(false); }}>● Member bị khóa</div>
         </>
       )}
    </motion.div>
  );

  const QuickActions = () => (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="quick-actions-row">
      <div className="quick-action-card" onClick={() => navigate('/admin/books/add')}><div className="qa-icon" style={{ background: '#6366f1' }}><Plus size={20}/></div><span>Thêm Sách mới</span></div>
      <div className="quick-action-card" onClick={() => navigate('/admin/borrow/add')}><div className="qa-icon" style={{ background: '#10b981' }}><Plus size={20}/></div><span>Tạo Phiếu mượn</span></div>
      <div className="quick-action-card" onClick={() => navigate('/admin/members/add')}><div className="qa-icon" style={{ background: '#f59e0b' }}><Plus size={20}/></div><span>Đăng ký Member</span></div>
    </motion.div>
  );

  if (loading) {
    return <div style={{ padding: '6rem', textAlign: 'center' }}><Loader2 className="spinner" size={40} color="var(--accent)" /></div>;
  }

  /* ══ Nếu đang ở tab Yêu cầu mượn → render panel riêng, không render stats/table ══ */
  if (activeTab === 'borrow_requests') {
    return (
      <div className="dashboard-wrapper">
        <BorrowRequestsPanel />
      </div>
    );
  }

  /* ══ Nếu đang ở tab Nhập kho → render panel riêng ══ */
  if (activeTab === 'inventory') {
    return (
      <div className="dashboard-wrapper">
        <ImportPanel />
      </div>
    );
  }

  /* ══ Nếu đang ở tab Xuất kho → render panel riêng ══ */
  if (activeTab === 'export') {
    return (
      <div className="dashboard-wrapper">
        <ExportPanel />
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      {activeTab === 'dashboard' && <QuickActions />}

      <section className="stats-grid">
         {stats.map((s, idx) => (
           <div key={idx} className="stat-card" style={{ '--glow-color': s.color }}>
              <div className="stat-icon-bg"><s.icon size={80} /></div>
              <div className="stat-header">
                 <h3>{s.title}</h3>
                 <div style={{ color: s.color, background: `${s.color}15`, padding: '0.4rem', borderRadius: '0.5rem' }}><TrendingUp size={16} /></div>
              </div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-footer">{s.detail}</div>
              <div className="sparkline-container">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}><Line type="monotone" dataKey="val" stroke={s.color} strokeWidth={2} dot={false} /></LineChart>
                 </ResponsiveContainer>
              </div>
           </div>
         ))}
      </section>

      {activeTab === 'dashboard' ? (
        <div className="overview-split">
          <div className="main-col">
            <div className="content-card">
              <div className="table-header" style={{ border: 'none', paddingBottom: '0.5rem' }}>
                <div>
                  <h3 style={{ fontWeight: 800 }}>Hoạt động Thư viện</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Thống kê mượn & trả sách 30 ngày gần nhất</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                   <button 
                     className="btn" 
                     onClick={() => setTimeRange('7d')}
                     style={{ 
                       padding: '0.35rem 0.75rem', fontSize: '0.75rem', 
                       background: timeRange === '7d' ? 'var(--accent)' : 'var(--input-bg)', 
                       color: timeRange === '7d' ? '#fff' : 'var(--text-secondary)' 
                     }}
                   >
                     7 Ngày
                   </button>
                   <button 
                     className="btn" 
                     onClick={() => setTimeRange('30d')}
                     style={{ 
                       padding: '0.35rem 0.75rem', fontSize: '0.75rem', 
                       background: timeRange === '30d' ? 'var(--accent)' : 'var(--input-bg)', 
                       color: timeRange === '30d' ? '#fff' : 'var(--text-secondary)' 
                     }}
                   >
                     30 Ngày
                   </button>
                </div>
              </div>
              <div style={{ height: '320px', padding: '1rem 1.5rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={timeRange === '7d' ? activityData7d : activityData30d}>
                      <defs>
                        <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--table-border)" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'var(--card-bg)', 
                          border: '1px solid var(--card-border)', 
                          borderRadius: '12px',
                          boxShadow: 'var(--shadow-lg)',
                          backdropFilter: 'blur(10px)'
                        }}
                      />
                      <Area type="monotone" dataKey="borrows" name="Lượt mượn" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorBorrows)" />
                      <Area type="monotone" dataKey="returns" name="Lượt trả" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorReturns)" />
                   </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="content-card" style={{ marginTop: '1.5rem' }}>
              <div className="table-header">
                <h3 style={{ fontWeight: 800 }}>Sách mới cập nhật</h3>
                <button className="btn" style={{ fontSize: '0.8rem', background: '#f1f5f9' }} onClick={() => navigate('/admin/books')}>Xem tất cả</button>
              </div>
               <table className="lms-table mini-table">
                  <tbody>
                     {booksRaw.slice(0, 5).map((b, idx) => (
                        <tr key={idx}>
                           <td style={{ padding: '0.75rem 2rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                 <div className="book-thumb" style={{ width: '32px', height: '44px', overflow: 'hidden', flexShrink: 0 }}>
                                    {b.image ? <img src={getImageUrl(b.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="cover" /> : <BookOpen size={16} />}
                                 </div>
                                 <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{b.title}</div>
                              </div>
                           </td>
                           <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>ISBN: {b.isbn}</td>
                           <td><span className="badge badge-success">● Mới</span></td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>

          <div className="activity-col">
            <div className="content-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 800, marginBottom: '1rem', fontSize: '1rem' }}>Cơ cấu Thể loại</h3>
              <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                 {categoryDistribution.map((c, i) => (
                   <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                     <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color }}></div>
                     {c.name}
                   </div>
                 ))}
              </div>
            </div>

            <div className="content-card" style={{ background: 'var(--card-bg)', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 800, marginBottom: '1.5rem', fontSize: '1rem' }}>Sách tồn kho thấp (!)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 {booksRaw.filter(b => (parseInt(b.stock) || 0) < 5).slice(0, 6).map((b, idx) => (
                   <div key={idx} className="activity-item" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '12px' }}>
                      <div className="activity-status" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div>
                      <div style={{ flex: 1 }}>
                         <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{b.title}</div>
                         <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>Chỉ còn {b.stock} cuốn</div>
                      </div>
                      <button className="icon-btn edit" style={{ width: '30px', height: '30px' }} onClick={() => navigate(`/admin/books/edit/${b.book_id}`)}><Edit3 size={14}/></button>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="content-card">
          <div className="table-header" style={{ flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
             <div className="search-box" style={{ minWidth: '280px' }}>
                <Search size={20} color="#94a3b8" /><input type="text" placeholder={`Tìm kiếm...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
             </div>
             
             {/* Quick Filter Presets */}
             <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', flex: 1, alignItems: 'center' }}>
                <button className={`btn ${activeFilter === 'all' ? 'btn-primary' : ''}`} style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', borderRadius: '50px', background: activeFilter === 'all' ? 'var(--accent)' : 'var(--table-header-bg)', color: activeFilter === 'all' ? '#fff' : 'var(--text-secondary)' }} onClick={() => setActiveFilter('all')}>Tất cả</button>
                {activeTab === 'books' && (
                  <>
                    <button className="btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', borderRadius: '50px', background: activeFilter === 'available' ? '#10b981' : 'var(--table-header-bg)', color: activeFilter === 'available' ? '#fff' : 'var(--text-secondary)' }} onClick={() => setActiveFilter('available')}>Sẵn sàng</button>
                    <button className="btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', borderRadius: '50px', background: activeFilter === 'out_of_stock' ? '#ef4444' : 'var(--table-header-bg)', color: activeFilter === 'out_of_stock' ? '#fff' : 'var(--text-secondary)' }} onClick={() => setActiveFilter('out_of_stock')}>Hết sách</button>
                  </>
                )}
                {activeTab === 'borrow' && (
                  <>
                    <button className="btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', borderRadius: '50px', background: activeFilter === 'borrowing' ? '#6366f1' : 'var(--table-header-bg)', color: activeFilter === 'borrowing' ? '#fff' : 'var(--text-secondary)' }} onClick={() => setActiveFilter('borrowing')}>Đang mượn</button>
                    <button className="btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', borderRadius: '50px', background: activeFilter === 'overdue' ? '#e11d48' : 'var(--table-header-bg)', color: activeFilter === 'overdue' ? '#fff' : 'var(--text-secondary)' }} onClick={() => setActiveFilter('overdue')}>Quá hạn</button>
                    <button className="btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', borderRadius: '50px', background: activeFilter === 'returned' ? '#10b981' : 'var(--table-header-bg)', color: activeFilter === 'returned' ? '#fff' : 'var(--text-secondary)' }} onClick={() => setActiveFilter('returned')}>Đã trả</button>
                  </>
                )}
                {activeTab === 'members' && (
                  <>
                    <button className="btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', borderRadius: '50px', background: activeFilter === 'active' ? '#10b981' : 'var(--table-header-bg)', color: activeFilter === 'active' ? '#fff' : 'var(--text-secondary)' }} onClick={() => setActiveFilter('active')}>Hoạt động</button>
                    <button className="btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', borderRadius: '50px', background: activeFilter === 'locked' ? '#ef4444' : 'var(--table-header-bg)', color: activeFilter === 'locked' ? '#fff' : 'var(--text-secondary)' }} onClick={() => setActiveFilter('locked')}>Bị khóa</button>
                  </>
                )}
                {activeTab === 'fines' && (
                  <>
                    <button className="btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', borderRadius: '50px', background: activeFilter === 'unpaid' ? '#ef4444' : 'var(--table-header-bg)', color: activeFilter === 'unpaid' ? '#fff' : 'var(--text-secondary)' }} onClick={() => setActiveFilter('unpaid')}>Chưa thu</button>
                    <button className="btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', borderRadius: '50px', background: activeFilter === 'paid' ? '#10b981' : 'var(--table-header-bg)', color: activeFilter === 'paid' ? '#fff' : 'var(--text-secondary)' }} onClick={() => setActiveFilter('paid')}>Đã thu</button>
                  </>
                )}
             </div>

             <div style={{ display: 'flex', gap: '0.75rem', position: 'relative' }}>
                <button className="btn btn-primary" onClick={() => {
                   navigate(`/admin/${activeTab}/add`);
                }}>
                   <Plus size={18} /> Thêm mới
                </button>
             </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
             <table className="lms-table">
                <thead>
                   <tr>
                     <th style={{ width: '50px' }}><input type="checkbox" className="custom-checkbox" /></th>
                     {activeTab === 'books' || activeTab === 'dashboard' ? (
                         <><th onClick={() => handleSort('title')} style={{cursor:'pointer', whiteSpace: 'nowrap'}}>Thông tin sách <SortIcon columnKey="title"/></th><th onClick={() => handleSort('isbn')} style={{cursor:'pointer', whiteSpace: 'nowrap'}}>Mã Định Danh <SortIcon columnKey="isbn"/></th><th onClick={() => handleSort('stock')} style={{cursor:'pointer', whiteSpace: 'nowrap'}}>Tồn kho <SortIcon columnKey="stock"/></th><th>Trạng thái</th><th>Hành động</th></>
                     ) : activeTab === 'authors' ? (
                          <><th onClick={() => handleSort('name')} style={{cursor:'pointer', whiteSpace: 'nowrap'}}>Tên tác giả <SortIcon columnKey="name"/></th><th>Tiểu sử / Bio</th><th>Hành động</th></>
                     ) : activeTab === 'members' ? (
                        <><th onClick={() => handleSort('full_name')} style={{cursor:'pointer', whiteSpace: 'nowrap'}}>Thành viên <SortIcon columnKey="full_name"/></th><th onClick={() => handleSort('email')} style={{cursor:'pointer', whiteSpace: 'nowrap'}}>Liên hệ <SortIcon columnKey="email"/></th><th onClick={() => handleSort('role')} style={{cursor:'pointer', whiteSpace: 'nowrap'}}>Phân quyền <SortIcon columnKey="role"/></th><th>Tình trạng</th><th>Hành động</th></>
                     ) : activeTab === 'publishers' ? (
                        <><th onClick={() => handleSort('name')} style={{cursor:'pointer', whiteSpace: 'nowrap'}}>Nhà xuất bản <SortIcon columnKey="name"/></th><th onClick={() => handleSort('email')} style={{cursor:'pointer', whiteSpace: 'nowrap'}}>Liên hệ <SortIcon columnKey="email"/></th><th>Địa chỉ</th><th>Hành động</th></>
                     ) : activeTab === 'borrow' ? (
                        <><th onClick={() => handleSort('ticket_id')} style={{cursor:'pointer', whiteSpace: 'nowrap'}}>ID Phiếu <SortIcon columnKey="ticket_id"/></th><th onClick={() => handleSort('member')} style={{cursor:'pointer', whiteSpace: 'nowrap'}}>Thành viên <SortIcon columnKey="member"/></th><th>Tên sách</th><th onClick={() => handleSort('borrow_date')} style={{cursor:'pointer', whiteSpace: 'nowrap'}}>Ngày mượn <SortIcon columnKey="borrow_date"/></th><th onClick={() => handleSort('due_date')} style={{cursor:'pointer', whiteSpace: 'nowrap'}}>Hạn trả <SortIcon columnKey="due_date"/></th><th>Trạng thái</th><th>Hành động</th></>
                     ) : activeTab === 'reviews' ? (
                        <><th onClick={() => handleSort('rating')} style={{cursor:'pointer', whiteSpace: 'nowrap'}}>Đánh giá (Sao) <SortIcon columnKey="rating"/></th><th onClick={() => handleSort('book')} style={{cursor:'pointer', whiteSpace: 'nowrap'}}>Mã Sách <SortIcon columnKey="book"/></th><th onClick={() => handleSort('user')} style={{cursor:'pointer', whiteSpace: 'nowrap'}}>Mã Người dùng <SortIcon columnKey="user"/></th><th>Nội dung</th><th>Hành động</th></>
                     ) : activeTab === 'fines' ? (
                         <><th onClick={() => handleSort('amount')} style={{cursor:'pointer', whiteSpace: 'nowrap'}}>Khoản phạt <SortIcon columnKey="amount"/></th><th>Lý do vi phạm</th><th>Trạng thái thu</th><th>Hành động</th></>
                     ) : (
                         <><th>ID</th><th onClick={() => handleSort('name')} style={{cursor:'pointer', whiteSpace: 'nowrap'}}>Tên danh mục <SortIcon columnKey="name"/></th><th>Phân loại</th><th>Hành động</th></>
                     )}
                   </tr>
                </thead>
                <tbody>
                   <AnimatePresence mode="popLayout">
                      {paginatedData.map((item, idx) => (
                         <motion.tr key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}>
                            <td><input type="checkbox" className="custom-checkbox" /></td>
                            {activeTab === 'books' || activeTab === 'dashboard' ? (
                               <>
                                  <td>
                                     <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div className="book-thumb" style={{ overflow: 'hidden' }}>
                                           {item.image ? <img src={getImageUrl(item.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="cover"/> : <BookOpen size={24} />}
                                        </div>
                                        <div><div style={{ fontWeight: 700 }}>{item.title}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TG: {item.author_name}</div></div>
                                     </div>
                                  </td>
                                  <td><div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>ISBN: {item.isbn}</div></td>
                                  <td style={{ fontWeight: 700 }}>{item.stock} cuốn</td>
                                  <td><span className={`badge ${item.stock > 0 ? 'badge-success' : 'badge-danger'}`}>{item.stock > 0 ? '● Sẵn sàng' : '● Hết sách'}</span></td>
                               </>
                            ) : activeTab === 'authors' ? (
                               <><td><div style={{ fontWeight: 700 }}>{item.name}</div></td><td><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stripHtml(item.bio) || 'Chưa cập nhật'}</div></td></>
                            ) : activeTab === 'members' ? (
                               <>
                                 <td>
                                   <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                     {item.full_name}
                                     {item.user_id === adminUser.user_id && <span style={{ background: 'var(--accent)', color: '#fff', fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 800 }}>(Bạn)</span>}
                                   </div>
                                 </td>
                                 <td>{item.email}</td><td><span className="badge badge-neutral">{item.role}</span></td>
                                 <td><span className={`badge ${item.is_active ? 'badge-success' : 'badge-danger'}`}>{item.is_active ? '● Hoạt động' : '● Bị khóa'}</span></td>
                               </>
                            ) : activeTab === 'publishers' ? (
                                <>
                                 <td><div style={{ fontWeight: 700 }}>{item.name}</div></td>
                                 <td><div style={{ fontSize: '0.85rem' }}>{item.contact_email || 'Chưa có email'}</div></td>
                                 <td><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.address || 'Không có địa chỉ'}</div></td>
                                </>
                            ) : activeTab === 'borrow' ? (
                               <>
                                <td>#{item.ticket_id}</td>
                                <td><div style={{ fontWeight: 600 }}>{item.member_name}</div></td>
                                <td>{(item.details && item.details.length > 0) ? item.details.map(d => d.book_title).join(', ') : 'Trống'}</td>
                                <td>{item.borrow_date}</td>
                                <td>{item.details && item.details.length > 0 ? item.details[0].due_date : '-'}</td>
                                <td><span className={`badge ${item.status === 'Đang mượn' ? 'badge-warning' : 'badge-success'}`}>{item.status}</span></td>
                               </>
                            ) : activeTab === 'reviews' ? (
                                <>
                                 <td><div style={{ color: 'var(--c-warning)', fontWeight: 800 }}>{'⭐'.repeat(item.rating || 5)}</div></td>
                                 <td>ID: {item.book}</td>
                                 <td>ID: {item.user}</td>
                                 <td><div style={{ fontSize: '0.85rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stripHtml(item.comment)}</div></td>
                                </>
                            ) : activeTab === 'fines' ? (
                                <>
                                 <td><div style={{ fontWeight: 800, color: 'var(--c-danger)' }}>{Number(item.amount).toLocaleString('vi-VN')} đ</div></td>
                                 <td><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.reason}</div></td>
                                 <td><span className={`badge ${item.is_paid ? 'badge-success' : 'badge-danger'}`}>{item.is_paid ? '● Đã thu' : '● Chưa thu'}</span></td>
                                </>
                            ) : (
                               <><td>#{item.category_id}</td><td><div style={{ fontWeight: 700 }}>{item.name}</div></td><td><div style={{ fontSize: '0.85rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stripHtml(item.description)}</div></td></>
                            )}
                             <td>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                   <button className="icon-btn view" title="Xem chi tiết" onClick={() => handleAction('view', item)}><Eye size={18}/></button>
                                   <button className="icon-btn edit" title="Chỉnh sửa" onClick={() => handleAction('edit', item)}><Edit3 size={18}/></button>
                                   {((activeTab !== 'members' && activeTab !== 'users') || item.user_id !== adminUser.user_id) && (
                                     <button className="icon-btn delete" title="Xóa dữ liệu" onClick={() => handleAction('delete', item)}><Trash2 size={18}/></button>
                                   )}
                                </div>
                             </td>
                          </motion.tr>
                       ))}
                   </AnimatePresence>
                </tbody>
             </table>
              {/* Pagination always visible and centered */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.5rem', padding: '0 1rem' }}>
                <button onClick={() => setCurrentPage(p => Math.max(p-1,1))} disabled={currentPage===1 || totalPages <= 1} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', border: '1px solid var(--table-border)', background: (currentPage===1 || totalPages <= 1)?'#f1f5f9':'var(--card-bg)', color: (currentPage===1 || totalPages <= 1)?'var(--text-muted)':'var(--text-primary)', cursor: (currentPage===1 || totalPages <= 1)?'not-allowed':'pointer', fontWeight: 700, display:'flex', alignItems:'center', gap:'0.3rem', transition: 'all 0.2s' }}>
                  <ChevronRight size={16} style={{transform:'rotate(180deg)'}}/> Trước
                </button>
                
                {totalPages > 0 ? Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                  <button key={p} onClick={() => setCurrentPage(p)} style={{ width:'40px',height:'40px',borderRadius:'10px',border:`1px solid ${currentPage===p?'transparent':'var(--table-border)'}`,background:currentPage===p?`linear-gradient(135deg,var(--accent),#8b5cf6)`:'var(--card-bg)',color:currentPage===p?'#fff':'var(--text-primary)',fontWeight:800,cursor:'pointer',boxShadow:currentPage===p?'0 4px 12px rgba(99,102,241,0.3)':'none',transition:'all 0.2s' }}>{p}</button>
                )) : (
                  <button disabled style={{ width:'40px',height:'40px',borderRadius:'10px',border:'transparent',background:`linear-gradient(135deg,var(--accent),#8b5cf6)`,color:'#fff',fontWeight:800,cursor:'not-allowed',boxShadow:'0 4px 12px rgba(99,102,241,0.3)' }}>1</button>
                )}

                <button onClick={() => setCurrentPage(p => Math.min(p+1,totalPages))} disabled={currentPage===totalPages || totalPages <= 1} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', border: '1px solid var(--table-border)', background: (currentPage===totalPages || totalPages <= 1)?'#f1f5f9':'var(--card-bg)', color: (currentPage===totalPages || totalPages <= 1)?'var(--text-muted)':'var(--text-primary)', cursor: (currentPage===totalPages || totalPages <= 1)?'not-allowed':'pointer', fontWeight: 700, display:'flex', alignItems:'center', gap:'0.3rem', transition: 'all 0.2s' }}>
                  Tiếp <ChevronRight size={16}/>
                </button>
              </div>
          </div>
       </div>
      )}
    </div>
  );
};

export default Dashboard;

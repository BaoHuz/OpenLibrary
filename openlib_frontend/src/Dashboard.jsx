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
                      <span style={{ fontWeight: 800, fontSize: '0.975rem', color: 'var(--text-primary)' }}>
                        {ticket.books?.length > 0
                          ? ticket.books.map(b => b.title).join(' · ')
                          : '(Không rõ sách)'}
                      </span>
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
                  {isPending && !msgs[ticket.ticket_id] && (
                    <div style={{ display: 'flex', gap: '0.6rem', flexShrink: 0, alignSelf: 'center' }}>
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

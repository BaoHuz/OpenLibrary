import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Library, LayoutDashboard, BookOpen, Users, Tag, Plus, Search, MoreVertical, Edit3, Trash2, Eye, ChevronRight, Book, Loader2, AlertCircle, TrendingUp, Filter, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const chartData = [{ val: 400 }, { val: 300 }, { val: 200 }, { val: 450 }, { val: 590 }, { val: 320 }, { val: 680 }];

/* ═══════════════════════════════════════════
   BORROW REQUESTS PANEL — Admin view
═══════════════════════════════════════════ */
const BorrowRequestsPanel = ({ rawData, onRefresh }) => {
  const [processing, setProcessing] = useState({});
  const [msgs, setMsgs] = useState({});

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
        onRefresh();
      }, 2500);
    } catch (err) {
      setMsgs(m => ({ ...m, [ticketId]: { type: 'error', text: err.response?.data?.error || 'Lỗi xử lý' } }));
    } finally {
      setProcessing(p => { const n = { ...p }; delete n[ticketId]; return n; });
    }
  };

  const C = { bg: 'var(--bg)', surface: 'var(--surface)', border: 'var(--border)', accent: 'var(--accent)', textPrim: 'var(--text-primary)', textSec: 'var(--text-secondary)' };

  return (
    <div style={{ padding: '0 0 2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: C.textPrim, marginBottom: '0.25rem' }}>
            📬 Yêu cầu mượn sách
          </h2>
          <p style={{ color: C.textSec, fontSize: '0.875rem' }}>
            Xem xét và duyệt / từ chối các yêu cầu mượn từ người dùng
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#b45309', padding: '0.35rem 1rem', borderRadius: '50px', fontSize: '0.82rem', fontWeight: 800 }}>
            ⏳ {rawData.length} đang chờ
          </span>
          <button onClick={onRefresh} style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>
            ↻ Làm mới
          </button>
        </div>
      </div>

      {rawData.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: C.surface, borderRadius: '1.25rem', border: `1px dashed ${C.border}` }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h3 style={{ color: C.textPrim, marginBottom: '0.5rem' }}>Không có yêu cầu nào đang chờ</h3>
          <p style={{ color: C.textSec, fontSize: '0.875rem' }}>Tất cả yêu cầu mượn đã được xử lý.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {rawData.map(ticket => (
            <div key={ticket.ticket_id} style={{
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: '1.25rem',
              padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)', flexWrap: 'wrap',
              borderLeft: '4px solid #f59e0b',
            }}>
              {/* Badge */}
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '1.4rem' }}>📖</span>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: C.textPrim, marginBottom: '0.25rem' }}>
                  {ticket.books?.length > 0 ? ticket.books[0].title : '(Không rõ sách)'}
                </div>
                <div style={{ fontSize: '0.82rem', color: C.textSec, display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <span>👤 <strong>{ticket.member_name}</strong> ({ticket.member_username})</span>
                  <span>📅 {ticket.borrow_date}</span>
                  {ticket.books?.[0]?.due_date && <span>⏰ Hạn trả: {ticket.books[0].due_date}</span>}
                </div>
                <div style={{ marginTop: '0.35rem' }}>
                  <span style={{ background: 'rgba(245,158,11,0.12)', color: '#b45309', padding: '0.15rem 0.6rem', borderRadius: '50px', fontSize: '0.72rem', fontWeight: 700 }}>
                    ⏳ Chờ duyệt — Mã #{ticket.ticket_id}
                  </span>
                </div>
              </div>

              {/* Feedback message */}
              {msgs[ticket.ticket_id] && (
                <div style={{
                  padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700,
                  background: msgs[ticket.ticket_id].type === 'approve' ? '#d1fae5' : '#fef2f2',
                  color: msgs[ticket.ticket_id].type === 'approve' ? '#065f46' : '#991b1b',
                  border: `1px solid ${msgs[ticket.ticket_id].type === 'approve' ? '#a7f3d0' : '#fecaca'}`,
                }}>
                  {msgs[ticket.ticket_id].text}
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                <button
                  onClick={() => handleAction(ticket.ticket_id, 'approve')}
                  disabled={!!processing[ticket.ticket_id]}
                  style={{
                    background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff',
                    border: 'none', padding: '0.6rem 1.25rem', borderRadius: '10px',
                    fontWeight: 800, fontSize: '0.875rem', cursor: processing[ticket.ticket_id] ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    boxShadow: '0 4px 12px rgba(16,185,129,0.3)', transition: 'transform .2s',
                    opacity: processing[ticket.ticket_id] ? 0.7 : 1,
                  }}
                  onMouseEnter={e => { if (!processing[ticket.ticket_id]) e.currentTarget.style.transform = 'scale(1.05)'; }}
                  onMouseLeave={e => e.currentTarget.style.transform = ''}
                >
                  {processing[ticket.ticket_id] === 'approve' ? '...' : '✓ Duyệt'}
                </button>
                <button
                  onClick={() => handleAction(ticket.ticket_id, 'reject')}
                  disabled={!!processing[ticket.ticket_id]}
                  style={{
                    background: '#fff', color: '#ef4444',
                    border: '1px solid #fecaca', padding: '0.6rem 1.25rem', borderRadius: '10px',
                    fontWeight: 800, fontSize: '0.875rem', cursor: processing[ticket.ticket_id] ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all .2s',
                    opacity: processing[ticket.ticket_id] ? 0.7 : 1,
                  }}
                  onMouseEnter={e => { if (!processing[ticket.ticket_id]) { e.currentTarget.style.background = '#fef2f2'; } }}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  {processing[ticket.ticket_id] === 'reject' ? '...' : '✕ Từ chối'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Dashboard = ({ activeTab, tabs }) => {
  const [data, setData] = useState([]);
  const [booksRaw, setBooksRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  const fetchData = async (tabKey) => {
    setLoading(true);
    setSearchTerm('');
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
    fetchData(activeTab);
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
         if (activeFilter === 'borrowing') matchStatus = item.status === 'borrowing';
         if (activeFilter === 'returned') matchStatus = item.status === 'returned';
         if (activeFilter === 'active') matchStatus = item.is_active === true;
         if (activeFilter === 'locked') matchStatus = item.is_active === false;
      }
      
      return matchSearch && matchStatus;
    });
  }, [data, searchTerm, activeFilter]);
  // PAGINATION LOGIC
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

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
                    activeTab === 'users' || activeTab === 'members' ? 'user_id' :
                    activeTab === 'publishers' ? 'publisher_id' :
                    activeTab === 'reviews' ? 'review_id' :
                    activeTab === 'fines' ? 'fine_id' : 'ticket_id';
    
    const id = item[idField];
    const resource = tabs[activeTab].url.replace('/', '');

    if (action === 'view') navigate(`/admin/${resource}/detail/${id}`);
    if (action === 'edit') navigate(`/admin/${resource}/edit/${id}`);
    if (action === 'delete') {
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
      <div className="quick-action-card" onClick={() => navigate('/books/add')}><div className="qa-icon" style={{ background: '#6366f1' }}><Plus size={20}/></div><span>Thêm Sách mới</span></div>
      <div className="quick-action-card" onClick={() => navigate('/borrow_tickets/add')}><div className="qa-icon" style={{ background: '#10b981' }}><Plus size={20}/></div><span>Tạo Phiêu mượn</span></div>
      <div className="quick-action-card" onClick={() => navigate('/users/add')}><div className="qa-icon" style={{ background: '#f59e0b' }}><Plus size={20}/></div><span>Đăng ký Member</span></div>
    </motion.div>
  );

  if (loading) {
    return <div style={{ padding: '6rem', textAlign: 'center' }}><Loader2 className="spinner" size={40} color="var(--accent)" /></div>;
  }

  return (
    <div className="dashboard-wrapper">
      {activeTab === 'dashboard' && <QuickActions />}

      {/* ══ BORROW REQUESTS ADMIN VIEW ══ */}
      {activeTab === 'borrow_requests' && (
        <BorrowRequestsPanel currentUser={null} onRefresh={() => fetchData('borrow_requests')} rawData={data} />
      )}

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
              <div className="table-header" style={{ border: 'none' }}>
                <h3 style={{ fontWeight: 800 }}>Biểu đồ Hoạt động mượn sách</h3>
              </div>
              <div style={{ height: '240px', padding: '1rem 2rem 2rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={chartData}>
                      <Line type="monotone" dataKey="val" stroke="var(--accent)" strokeWidth={4} dot={{ r: 4, fill: 'var(--accent)' }} />
                   </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="content-card" style={{ marginTop: '1.5rem' }}>
              <div className="table-header">
                <h3 style={{ fontWeight: 800 }}>Sách mới cập nhật</h3>
                <button className="btn" style={{ fontSize: '0.8rem', background: '#f1f5f9' }} onClick={() => navigate('/books')}>Xem tất cả</button>
              </div>
               <table className="lms-table mini-table">
                  <tbody>
                     {booksRaw.slice(0, 5).map((b, idx) => (
                        <tr key={idx}>
                           <td style={{ padding: '0.75rem 2rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                 <div className="book-thumb" style={{ width: '32px', height: '44px' }}><BookOpen size={16} /></div>
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
            <div className="content-card" style={{ height: '100%', background: '#fff', padding: '1.5rem' }}>
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
          <div className="table-header">
             <div className="search-box">
                <Search size={20} color="#94a3b8" /><input type="text" placeholder={`Tìm kiếm...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
             </div>
             <div style={{ display: 'flex', gap: '0.75rem', position: 'relative' }}>
                <button 
                  className="btn" 
                  style={{ background: '#fff', border: '1px solid #e2e8f0', color: (activeFilter !== 'all' ? 'var(--accent)' : 'var(--text-secondary)'), fontWeight: (activeFilter !== 'all' ? 800 : 600) }}
                  onClick={() => setShowFilter(!showFilter)}
                >
                  <Filter size={18}/> {activeFilter === 'all' ? 'Lọc' : `Lọc: ${activeFilter}`}
                </button>
                {showFilter && <FilterDropdown />}
                
                <button className="btn btn-primary" onClick={() => {
                   const resource = tabs[activeTab].url.replace('/', '');
                   navigate(`/admin/${resource}/add`);
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
                         <><th>Thông tin sách</th><th>Mã Định Danh</th><th>Tồn kho</th><th>Trạng thái</th><th>Hành động</th></>
                     ) : activeTab === 'authors' ? (
                          <><th>Tên tác giả</th><th>Tiểu sử / Bio</th><th>Hành động</th></>
                     ) : activeTab === 'members' ? (
                        <><th>Thành viên</th><th>Liên hệ</th><th>Phân quyền</th><th>Tình trạng</th><th>Hành động</th></>
                     ) : activeTab === 'publishers' ? (
                        <><th>Nhà xuất bản</th><th>Liên hệ</th><th>Địa chỉ</th><th>Hành động</th></>
                     ) : activeTab === 'borrow' ? (
                        <><th>ID Phiếu</th><th>Thành viên</th><th>Tên sách</th><th>Ngày mượn</th><th>Hạn trả</th><th>Trạng thái</th><th>Hành động</th></>
                     ) : activeTab === 'reviews' ? (
                        <><th>Đánh giá (Sao)</th><th>Mã Sách</th><th>Mã Người dùng</th><th>Nội dung</th><th>Hành động</th></>
                     ) : activeTab === 'fines' ? (
                         <><th>Khoản phạt</th><th>Lý do vi phạm</th><th>Trạng thái thu</th><th>Hành động</th></>
                     ) : (
                         <><th>ID</th><th>Tên danh mục</th><th>Phân loại</th><th>Hành động</th></>
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
                                           {item.image ? <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="cover"/> : <BookOpen size={24} />}
                                        </div>
                                        <div><div style={{ fontWeight: 700 }}>{item.title}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TG: {item.author_name}</div></div>
                                     </div>
                                  </td>
                                  <td><div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>ISBN: {item.isbn}</div></td>
                                  <td style={{ fontWeight: 700 }}>{item.stock} cuốn</td>
                                  <td><span className={`badge ${item.stock > 0 ? 'badge-success' : 'badge-danger'}`}>{item.stock > 0 ? '● Sẵn sàng' : '● Hết sách'}</span></td>
                               </>
                            ) : activeTab === 'authors' ? (
                               <><td><div style={{ fontWeight: 700 }}>{item.name}</div></td><td><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.bio || 'Chưa cập nhật'}</div></td></>
                            ) : activeTab === 'members' ? (
                               <>
                                 <td><div style={{ fontWeight: 700 }}>{item.full_name}</div></td><td>{item.email}</td><td><span className="badge badge-neutral">{item.role}</span></td>
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
                                 <td><div style={{ fontSize: '0.85rem' }}>{item.comment}</div></td>
                                </>
                            ) : activeTab === 'fines' ? (
                                <>
                                 <td><div style={{ fontWeight: 800, color: 'var(--c-danger)' }}>{Number(item.amount).toLocaleString('vi-VN')} đ</div></td>
                                 <td><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.reason}</div></td>
                                 <td><span className={`badge ${item.is_paid ? 'badge-success' : 'badge-danger'}`}>{item.is_paid ? '● Đã thu' : '● Chưa thu'}</span></td>
                                </>
                            ) : (
                               <><td>#{item.category_id}</td><td><div style={{ fontWeight: 700 }}>{item.name}</div></td><td>{item.description}</td></>
                            )}
                             <td>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                   <button className="icon-btn view" title="Xem chi tiết" onClick={() => handleAction('view', item)}><Eye size={18}/></button>
                                   <button className="icon-btn edit" title="Chỉnh sửa" onClick={() => handleAction('edit', item)}><Edit3 size={18}/></button>
                                   <button className="icon-btn delete" title="Xóa dữ liệu" onClick={() => handleAction('delete', item)}><Trash2 size={18}/></button>
                                </div>
                             </td>
                          </motion.tr>
                       ))}
                    </AnimatePresence>
                 </tbody>
              </table>
              {totalPages > 1 && (
                 <div className="pagination">
                   <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Hiển thị trang {currentPage} / {totalPages}</div>
                   <div className="page-numbers">
                      {Array.from({ length: totalPages }, (_, i) => (
                         <button key={i} className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                      ))}
                   </div>
                 </div>
              )}
           </div>
       </div>
      )}
    </div>
  );
};

export default Dashboard;

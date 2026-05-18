import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Download, Edit3, Trash2, Eye, Calendar, User, ListOrdered, AlignLeft, Send, CheckCircle2, PackageMinus, ChevronRight, ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import Select from 'react-select';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'framer-motion';

const ExportPanel = () => {
  const [data, setData] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // View state instead of Modal
  const [viewState, setViewState] = useState('list'); // 'list', 'create', 'edit', 'view'
  const [currentTicket, setCurrentTicket] = useState(null);

  // Form State
  const [reason, setReason] = useState('Thanh lý sách cũ/hỏng');
  const [notes, setNotes] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [exportQty, setExportQty] = useState(1);
  const [exportItems, setExportItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const adminUser = JSON.parse(localStorage.getItem('user') || '{}');

  const reasons = [
    'Thanh lý sách cũ/hỏng',
    'Sách bị mất/thất lạc',
    'Chuyển chi nhánh',
    'Trả lại nhà cung cấp',
    'Lý do khác'
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [booksRes, historyRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/books/'),
        axios.get('http://127.0.0.1:8000/api/export/')
      ]);
      setBooks(Array.isArray(booksRes.data) ? booksRes.data : []);
      setData(Array.isArray(historyRes.data) ? historyRes.data : []);
    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItem = () => {
    if (!selectedBook) return;
    if (exportQty <= 0) {
      alert('Số lượng xuất phải lớn hơn 0');
      return;
    }
    
    let effectiveStock = selectedBook.stock;
    if (viewState === 'edit' && currentTicket) {
      const originalItem = currentTicket.details?.find(d => d.book === selectedBook.book_id);
      if (originalItem) effectiveStock += originalItem.quantity;
    }

    if (exportQty > effectiveStock) {
      alert(`Không thể xuất vượt quá số lượng tồn kho khả dụng (${effectiveStock})`);
      return;
    }
    
    const existing = exportItems.find(item => item.book_id === selectedBook.book_id);
    if (existing) {
      if (existing.quantity + exportQty > effectiveStock) {
        alert('Tổng số lượng xuất vượt quá tồn kho khả dụng!');
        return;
      }
      setExportItems(exportItems.map(item => 
        item.book_id === selectedBook.book_id 
          ? { ...item, quantity: item.quantity + exportQty } 
          : item
      ));
    } else {
      setExportItems([...exportItems, {
        book_id: selectedBook.book_id,
        title: selectedBook.title,
        isbn: selectedBook.isbn,
        stock: effectiveStock,
        quantity: exportQty
      }]);
    }
    
    setSelectedBook(null);
    setExportQty(1);
  };

  const handleRemoveItem = (id) => {
    setExportItems(exportItems.filter(item => item.book_id !== id));
  };

  const openPage = (mode, ticket = null) => {
    setViewState(mode);
    setCurrentTicket(ticket);
    if (mode === 'create') {
      setReason(reasons[0]);
      setNotes('');
      setExportItems([]);
    } else if (ticket) {
      setReason(ticket.reason || reasons[0]);
      setNotes(ticket.notes || '');
      if (mode === 'edit') {
        const items = (ticket.details || []).map(d => {
          const bookInfo = books.find(b => b.book_id === d.book);
          return {
            book_id: d.book,
            title: d.book_title,
            isbn: bookInfo?.isbn || '',
            stock: (bookInfo?.stock || 0) + d.quantity,
            quantity: d.quantity
          };
        });
        setExportItems(items);
      }
    }
  };

  const closePage = () => {
    setViewState('list');
    setCurrentTicket(null);
  };

  const handleSubmit = async () => {
    if (exportItems.length === 0) {
      alert('Vui lòng chọn ít nhất một sách để xuất kho!');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        user_id: adminUser.user_id,
        reason: reason,
        notes: notes,
        items: exportItems.map(item => ({ book_id: item.book_id, quantity: item.quantity }))
      };
      
      if (viewState === 'create') {
        await axios.post('http://127.0.0.1:8000/api/export/', payload);
        alert('Tạo phiếu xuất kho thành công!');
      } else if (viewState === 'edit') {
        await axios.put(`http://127.0.0.1:8000/api/export/${currentTicket.ticket_id}/`, payload);
        alert('Cập nhật phiếu xuất kho thành công!');
      }
      
      closePage();
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Lỗi khi xuất kho: ' + (e.response?.data?.error || e.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (ticket) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa phiếu xuất #${ticket.ticket_id}? Sách sẽ được hoàn lại kho!`)) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/export/${ticket.ticket_id}/`);
        alert('Xóa phiếu xuất kho thành công!');
        fetchData();
      } catch (e) {
        alert('Lỗi khi xóa: ' + (e.response?.data?.error || e.message));
      }
    }
  };

  const handleExportCSV = () => {
    const csvData = data.map(item => ({
      'Mã Phiếu': item.ticket_id,
      'Ngày Xuất': `${new Date(item.export_date).toLocaleTimeString('vi-VN')} ${new Date(item.export_date).toLocaleDateString('vi-VN')}`,
      'Người Lập': item.user_name || 'Admin',
      'Lý do': item.reason,
      'Ghi chú': item.notes || '',
      'Tổng SL Sách': item.details?.reduce((acc, curr) => acc + curr.quantity, 0) || 0,
      'Chi tiết (Sách - SL)': item.details?.map(d => `${d.book_title} (${d.quantity})`).join('; ') || ''
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Lich_Su_Xuat_Kho_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const s = searchTerm.toLowerCase();
      const stringToSearch = (item.ticket_id + ' ' + item.reason + ' ' + (item.user_name||'')).toLowerCase();
      const matchSearch = stringToSearch.includes(s) || item.details?.some(d => d.book_title?.toLowerCase().includes(s));
      return matchSearch;
    });
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const bookOptions = books.map(b => ({
    value: b.book_id,
    label: `${b.title} (ISBN: ${b.isbn || 'N/A'}) - Tồn hiện tại: ${b.stock}`,
    book: b
  }));

  if (loading) return <div style={{ padding: '6rem', textAlign: 'center' }}>Đang tải dữ liệu...</div>;

  // ------------------------------------------
  // RENDER: VIEW DETAIL PAGE
  // ------------------------------------------
  if (viewState === 'view') {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="content-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid var(--table-border)', paddingBottom: '1.5rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
            <Eye size={28} color="var(--accent)" /> Chi Tiết Phiếu Xuất #{currentTicket?.ticket_id}
          </h2>
          <button onClick={closePage} className="btn" style={{ background: 'var(--input-bg)', border: '1px solid var(--table-border)' }}>
            <ArrowLeft size={18} /> Quay Lại
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', background: 'var(--input-bg)', padding: '2rem', borderRadius: '1rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Người Lập</div>
            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{currentTicket?.user_name || 'Admin'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Ngày Lập</div>
            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{new Date(currentTicket?.export_date).toLocaleTimeString('vi-VN')} | {new Date(currentTicket?.export_date).toLocaleDateString('vi-VN')}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Lý do</div>
            <div><span className="badge badge-warning" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>{currentTicket?.reason}</span></div>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Ghi chú</div>
            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{currentTicket?.notes || 'Không có ghi chú'}</div>
          </div>
        </div>

        <div>
          <h3 style={{ fontWeight: 800, marginBottom: '1rem', fontSize: '1.25rem', color: 'var(--text-primary)' }}>📚 Danh sách ấn phẩm xuất kho</h3>
          <div style={{ border: '1px solid var(--table-border)', borderRadius: '1rem', overflow: 'hidden' }}>
            <table className="lms-table" style={{ width: '100%', borderCollapse: 'collapse', margin: 0 }}>
              <thead>
                <tr style={{ background: 'var(--input-bg)' }}>
                  <th style={{ padding: '1rem', fontSize: '0.9rem' }}>Tên Sách</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>Số lượng</th>
                </tr>
              </thead>
              <tbody>
                {currentTicket?.details?.map((d, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--table-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{d.book_title}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 800, color: '#e11d48', fontSize: '1.1rem' }}>- {d.quantity}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                  <td style={{ padding: '1.25rem 1rem', fontWeight: 800, textAlign: 'right', fontSize: '1.1rem' }}>Tổng số lượng:</td>
                  <td style={{ padding: '1.25rem 1rem', textAlign: 'center', fontWeight: 800, color: '#e11d48', fontSize: '1.5rem' }}>
                    - {currentTicket?.details?.reduce((acc, curr) => acc + curr.quantity, 0) || 0}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </motion.div>
    );
  }

  // ------------------------------------------
  // RENDER: CREATE / EDIT PAGE
  // ------------------------------------------
  if (viewState === 'create' || viewState === 'edit') {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="content-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid var(--table-border)', paddingBottom: '1.5rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: 800, margin: 0, color: viewState === 'create' ? '#e11d48' : '#10b981' }}>
            {viewState === 'create' ? <><PackageMinus size={28} /> Tạo Phiếu Xuất Kho Mới</> : <><Edit3 size={28} /> Chỉnh Sửa Phiếu Xuất #{currentTicket?.ticket_id}</>}
          </h2>
          <button onClick={closePage} className="btn" style={{ background: 'var(--input-bg)', border: '1px solid var(--table-border)' }}>
            <ArrowLeft size={18} /> Quay Lại
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', background: 'var(--input-bg)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--table-border)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Lý do xuất kho <span style={{ color: '#ef4444' }}>*</span></label>
              <select 
                value={reason} 
                onChange={e => setReason(e.target.value)}
                style={{ width: '100%', padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid var(--table-border)', background: 'var(--card-bg)', color: 'var(--text-primary)', outline: 'none', fontSize: '1rem' }}
              >
                {reasons.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Ghi chú thêm</label>
              <textarea 
                placeholder="Nhập ghi chú chi tiết (nếu có)..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid var(--table-border)', background: 'var(--card-bg)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical', fontSize: '1rem' }}
              ></textarea>
            </div>
          </div>

          <div style={{ borderTop: '2px dashed var(--table-border)', paddingTop: '2rem' }}>
            <label style={{ display: 'block', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>Chọn sách xuất kho <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <Select
                  options={bookOptions}
                  value={selectedBook ? bookOptions.find(o => o.value === selectedBook.book_id) : null}
                  onChange={(selected) => { setSelectedBook(selected.book); setExportQty(1); }}
                  placeholder="Tìm kiếm theo tên sách hoặc mã ISBN..."
                  styles={{
                    control: (base) => ({ ...base, background: 'var(--input-bg)', borderColor: 'var(--table-border)', padding: '6px', borderRadius: '0.75rem', fontSize: '1rem' }),
                    menu: (base) => ({ ...base, background: 'var(--card-bg)', zIndex: 100 }),
                    option: (base, state) => ({ ...base, background: state.isFocused ? 'var(--accent)' : 'transparent', color: state.isFocused ? '#fff' : 'var(--text-primary)' }),
                    singleValue: (base) => ({ ...base, color: 'var(--text-primary)' })
                  }}
                />
              </div>
              <input 
                type="number" 
                min="1" 
                value={exportQty} 
                onChange={e => setExportQty(parseInt(e.target.value) || 1)}
                style={{ width: '100px', padding: '0.5rem', borderRadius: '0.75rem', border: '1px solid var(--table-border)', background: 'var(--input-bg)', color: 'var(--text-primary)', textAlign: 'center', outline: 'none', fontSize: '1.1rem', fontWeight: 700 }}
                title="Số lượng"
              />
              <button 
                onClick={handleAddItem}
                style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '0.75rem', padding: '0 1.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}
              >
                Thêm
              </button>
            </div>
            
            {selectedBook && (
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.75rem', fontWeight: 600 }}>
                * Tồn kho khả dụng: <span style={{ color: selectedBook.stock > 0 ? '#10b981' : '#ef4444', fontWeight: 800 }}>{
                  viewState === 'edit' && currentTicket ? 
                    (selectedBook.stock + (currentTicket.details?.find(d => d.book === selectedBook.book_id)?.quantity || 0)) : 
                    selectedBook.stock
                }</span> cuốn
              </div>
            )}
          </div>

          {exportItems.length > 0 && (
            <div style={{ border: '1px solid var(--table-border)', borderRadius: '1rem', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                <thead style={{ background: 'var(--input-bg)' }}>
                  <tr>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Tên Sách</th>
                    <th style={{ padding: '1rem', textAlign: 'center', width: '150px' }}>Số lượng</th>
                    <th style={{ padding: '1rem', textAlign: 'center', width: '80px' }}>Hủy</th>
                  </tr>
                </thead>
                <tbody>
                  {exportItems.map(item => (
                    <tr key={item.book_id} style={{ borderBottom: '1px solid var(--table-border)' }}>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>{item.title}</td>
                      <td style={{ padding: '1rem', textAlign: 'center', color: '#e11d48', fontWeight: 800 }}>- {item.quantity}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button onClick={() => handleRemoveItem(item.book_id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '0.5rem', width: '36px', height: '36px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--table-border)' }}>
            <button 
              onClick={handleSubmit}
              disabled={submitting || exportItems.length === 0}
              style={{ 
                flex: 1, padding: '1rem', background: exportItems.length === 0 ? 'var(--input-bg)' : (viewState === 'edit' ? '#10b981' : '#e11d48'), 
                color: exportItems.length === 0 ? 'var(--text-muted)' : '#fff', border: 'none', borderRadius: '0.75rem', 
                fontWeight: 800, cursor: exportItems.length === 0 ? 'not-allowed' : 'pointer', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', gap: '0.75rem', transition: 'all 0.2s', fontSize: '1.1rem'
              }}
            >
              {submitting ? 'Đang xử lý...' : <><CheckCircle2 size={20} /> {viewState === 'create' ? 'Xác Nhận Tạo Phiếu Xuất' : 'Lưu Lại Thay Đổi'}</>}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ------------------------------------------
  // RENDER: LIST PAGE
  // ------------------------------------------
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Action Bar */}
      <div className="content-card" style={{ padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div className="search-box" style={{ minWidth: '350px', margin: 0 }}>
            <Search size={20} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Tìm theo mã phiếu, lý do, người lập hoặc tên sách..." 
              value={searchTerm} 
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
            />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginLeft: 'auto' }}>
            <button 
              className="btn" 
              onClick={handleExportCSV}
              style={{ background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--table-border)' }}
            >
              <Download size={18} /> Xuất File CSV
            </button>
            <button className="btn btn-primary" onClick={() => openPage('create')}>
              <Plus size={18} /> Tạo Phiếu Xuất Mới
            </button>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="lms-table">
          <thead>
            <tr>
              <th>Mã Phiếu</th>
              <th>Ngày xuất</th>
              <th>Người Lập</th>
              <th>Lý do xuất</th>
              <th style={{ textAlign: 'center' }}>Tổng SL</th>
              <th style={{ textAlign: 'center' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {paginatedData.map((item, idx) => {
                const totalQty = item.details?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
                return (
                  <motion.tr key={item.ticket_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}>
                    <td><div style={{ fontWeight: 800 }}>#{item.ticket_id}</div></td>
                    <td>
                      <div>{new Date(item.export_date).toLocaleTimeString('vi-VN')}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(item.export_date).toLocaleDateString('vi-VN')}</div>
                    </td>
                    <td><div style={{ fontWeight: 600 }}>{item.user_name || 'Admin'}</div></td>
                    <td><span className="badge badge-warning">{item.reason}</span></td>
                    <td style={{ textAlign: 'center' }}><div style={{ fontWeight: 800, color: '#e11d48' }}>- {totalQty}</div></td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button className="icon-btn view" title="Xem chi tiết" onClick={() => openPage('view', item)}><Eye size={18}/></button>
                        <button className="icon-btn edit" title="Chỉnh sửa" onClick={() => openPage('edit', item)}><Edit3 size={18}/></button>
                        <button className="icon-btn delete" title="Xóa dữ liệu" onClick={() => handleDelete(item)}><Trash2 size={18}/></button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    Không tìm thấy phiếu xuất nào.
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1.5rem' }}>
            <button onClick={() => setCurrentPage(p => Math.max(p-1,1))} disabled={currentPage===1} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', border: '1px solid var(--table-border)', background: currentPage===1?'#f1f5f9':'var(--card-bg)', color: currentPage===1?'var(--text-muted)':'var(--text-primary)', cursor: currentPage===1?'not-allowed':'pointer', fontWeight: 700, display:'flex', alignItems:'center', gap:'0.3rem' }}>
              <ChevronRight size={16} style={{transform:'rotate(180deg)'}}/> Trước
            </button>
            {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
              <button key={p} onClick={() => setCurrentPage(p)} style={{ width:'40px',height:'40px',borderRadius:'10px',border:`1px solid ${currentPage===p?'transparent':'var(--table-border)'}`,background:currentPage===p?`linear-gradient(135deg,var(--accent),#8b5cf6)`:'var(--card-bg)',color:currentPage===p?'#fff':'var(--text-primary)',fontWeight:800,cursor:'pointer',boxShadow:currentPage===p?'0 4px 12px rgba(99,102,241,0.3)':'none' }}>{p}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(p+1,totalPages))} disabled={currentPage===totalPages} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', border: '1px solid var(--table-border)', background: currentPage===totalPages?'#f1f5f9':'var(--card-bg)', color: currentPage===totalPages?'var(--text-muted)':'var(--text-primary)', cursor: currentPage===totalPages?'not-allowed':'pointer', fontWeight: 700, display:'flex', alignItems:'center', gap:'0.3rem' }}>
              Tiếp <ChevronRight size={16}/>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ExportPanel;

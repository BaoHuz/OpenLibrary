import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Download, Edit3, Trash2, Eye, Calendar, User, ListOrdered, AlignLeft, Send, CheckCircle2, ChevronRight, ArrowLeft, Upload, FileText
} from 'lucide-react';
import axios from 'axios';
import Select from 'react-select';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'framer-motion';

const ImportPanel = () => {
  const [data, setData] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // View state: 'list', 'create', 'edit', 'view'
  const [viewState, setViewState] = useState('list');
  const [currentTicket, setCurrentTicket] = useState(null);

  // Form State
  const [supplier, setSupplier] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [notes, setNotes] = useState('');
  
  // Manual Item Add
  const [selectedBook, setSelectedBook] = useState(null);
  const [importQty, setImportQty] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  
  // Import Items (Unified list of items for the ticket)
  const [importItems, setImportItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Bulk CSV States
  const [importMode, setImportMode] = useState('manual'); // 'manual' or 'csv'
  const [csvFile, setCsvFile] = useState(null);
  const [csvEncoding, setCsvEncoding] = useState('UTF-8');
  const [csvPreview, setCsvPreview] = useState([]);
  const [progress, setProgress] = useState(0);
  const [importing, setImporting] = useState(false);

  const adminUser = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [booksRes, historyRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/books/'),
        axios.get('http://127.0.0.1:8000/api/import/')
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

  // Update total amount automatically when items change
  useEffect(() => {
    const sum = importItems.reduce((acc, curr) => acc + (curr.quantity * curr.unit_price), 0);
    setTotalAmount(sum);
  }, [importItems]);

  const handleAddItem = () => {
    if (!selectedBook) return;
    if (importQty <= 0) {
      alert('Số lượng nhập phải lớn hơn 0');
      return;
    }
    if (unitPrice < 0) {
      alert('Đơn giá không được âm');
      return;
    }
    
    const existing = importItems.find(item => item.book_id === selectedBook.book_id);
    if (existing) {
      setImportItems(importItems.map(item => 
        item.book_id === selectedBook.book_id 
          ? { ...item, quantity: item.quantity + importQty, unit_price: unitPrice } 
          : item
      ));
    } else {
      setImportItems([...importItems, {
        book_id: selectedBook.book_id,
        title: selectedBook.title,
        isbn: selectedBook.isbn,
        quantity: importQty,
        unit_price: unitPrice
      }]);
    }
    
    setSelectedBook(null);
    setImportQty(1);
    setUnitPrice(0);
  };

  const handleRemoveItem = (id) => {
    setImportItems(importItems.filter(item => item.book_id !== id));
  };

  const openPage = (mode, ticket = null) => {
    setViewState(mode);
    setCurrentTicket(ticket);
    setImportMode('manual');
    setCsvFile(null);
    setCsvPreview([]);
    if (mode === 'create') {
      setSupplier('');
      setTotalAmount(0);
      setNotes('');
      setImportItems([]);
    } else if (ticket) {
      setSupplier(ticket.supplier || '');
      setTotalAmount(parseFloat(ticket.total_amount) || 0);
      setNotes(ticket.notes || '');
      if (mode === 'edit') {
        const items = (ticket.details || []).map(d => {
          const bookInfo = books.find(b => b.book_id === d.book);
          return {
            book_id: d.book,
            title: d.book_title,
            isbn: bookInfo?.isbn || '',
            quantity: d.quantity,
            unit_price: parseFloat(d.unit_price) || 0
          };
        });
        setImportItems(items);
      }
    }
  };

  const closePage = () => {
    setViewState('list');
    setCurrentTicket(null);
  };

  // CSV Parsing
  const handleFileChange = (e) => {
    const file = e.target.files[0];
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
        const rowData = {};
        headers.forEach((header, index) => {
          rowData[header] = columns[index] || '';
        });
        return rowData;
      });
      setCsvPreview(parsedRows);
    };
    reader.readAsText(file, csvEncoding);
  };

  useEffect(() => {
    if (csvFile) {
      const dummyEvent = { target: { files: [csvFile] } };
      handleFileChange(dummyEvent);
    }
  }, [csvEncoding]);

  const handlePreviewCellChange = (rowIndex, field, value) => {
    setCsvPreview(prev => {
      const copy = [...prev];
      copy[rowIndex] = { ...copy[rowIndex], [field]: value };
      return copy;
    });
  };

  // Import CSV parser into the Ticket items
  const applyCSVToItems = async () => {
    if (csvPreview.length === 0) {
      alert('Không có dữ liệu xem trước để áp dụng!');
      return;
    }
    setImporting(true);
    setProgress(0);

    const newItems = [];
    let successCount = 0;

    for (let i = 0; i < csvPreview.length; i++) {
      const row = csvPreview[i];
      const isbn = row.isbn || '';
      const title = row.title || '';
      const qty = parseInt(row.stock) || parseInt(row.quantity) || 0;
      const price = parseFloat(row.unit_price) || 0;

      if (!isbn || !title) continue;

      let bookId = null;
      // 1. Check if the book already exists in our loaded list
      const matched = books.find(b => b.isbn === isbn);
      if (matched) {
        bookId = matched.book_id;
      } else {
        // 2. If it does not exist, create the book with stock = 0
        const bookObj = {
          title: title,
          isbn: isbn,
          stock: 0,
          publication_year: parseInt(row.publication_year) || new Date().getFullYear(),
          category: row.category_id ? parseInt(row.category_id) : null,
          author: row.author_id ? parseInt(row.author_id) : null,
          publisher: row.publisher_id ? parseInt(row.publisher_id) : null,
        };
        try {
          const res = await axios.post('http://127.0.0.1:8000/api/books/', bookObj);
          bookId = res.data.book_id;
          // Dynamically append new book to books list so next matches find it
          books.push(res.data);
        } catch (err) {
          console.error('Không thể tạo sách mới tự động từ file CSV', err);
          continue;
        }
      }

      if (bookId) {
        newItems.push({
          book_id: bookId,
          title: title,
          isbn: isbn,
          quantity: qty,
          unit_price: price
        });
        successCount++;
      }
      setProgress(Math.round(((i + 1) / csvPreview.length) * 100));
    }

    setImportItems([...importItems, ...newItems]);
    setCsvPreview([]);
    setCsvFile(null);
    setImporting(false);
    alert(`Đã nạp thành công ${successCount} dòng sách từ file CSV vào danh sách nhập!`);
    setImportMode('manual');
  };

  const downloadSampleCSV = () => {
    const headers = 'isbn,title,quantity,unit_price\n';
    const row1 = '978-6043444455,Tôi Thấy Hoa Vàng Trên Cỏ Xanh,15,85000\n';
    const row2 = '978-6047761008,Mắt Biếc (Bản Đặc Biệt),20,110000\n';
    const csvContent = "\uFEFF" + headers + row1 + row2;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_import_books.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async () => {
    if (importItems.length === 0) {
      alert('Vui lòng chọn ít nhất một sách để nhập kho!');
      return;
    }
    if (!supplier.trim()) {
      alert('Vui lòng điền tên Nhà Cung Cấp!');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        user_id: adminUser.user_id,
        supplier: supplier,
        notes: notes,
        total_amount: totalAmount,
        items: importItems.map(item => ({ 
          book_id: item.book_id, 
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      };
      
      if (viewState === 'create') {
        await axios.post('http://127.0.0.1:8000/api/import/', payload);
        alert('Tạo phiếu nhập kho thành công!');
      } else if (viewState === 'edit') {
        await axios.put(`http://127.0.0.1:8000/api/import/${currentTicket.ticket_id}/`, payload);
        alert('Cập nhật phiếu nhập kho thành công!');
      }
      
      closePage();
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Lỗi khi nhập kho: ' + (e.response?.data?.error || e.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (ticket) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa phiếu nhập #${ticket.ticket_id}? Số lượng tồn kho tương ứng sẽ bị khấu trừ!`)) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/import/${ticket.ticket_id}/`);
        alert('Xóa phiếu nhập kho thành công!');
        fetchData();
      } catch (e) {
        alert('Lỗi khi xóa: ' + (e.response?.data?.error || e.message));
      }
    }
  };

  const handleExportCSV = () => {
    const csvData = data.map(item => ({
      'Mã Phiếu': item.ticket_id,
      'Ngày Nhập': `${new Date(item.import_date).toLocaleTimeString('vi-VN')} ${new Date(item.import_date).toLocaleDateString('vi-VN')}`,
      'Người Lập': item.user_name || 'Admin',
      'Nhà Cung Cấp': item.supplier || '',
      'Tổng Tiền': parseFloat(item.total_amount).toLocaleString('vi-VN') + ' đ',
      'Ghi chú': item.notes || '',
      'Chi tiết (Sách - SL - Đơn giá)': item.details?.map(d => `${d.book_title} (${d.quantity} x ${parseFloat(d.unit_price).toLocaleString('vi-VN')}đ)`).join('; ') || ''
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Lich_Su_Nhap_Kho_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const s = searchTerm.toLowerCase();
      const stringToSearch = (item.ticket_id + ' ' + (item.supplier || '') + ' ' + (item.user_name||'')).toLowerCase();
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

  // Statistics calculation for the header row
  const totalStock = books.reduce((sum, b) => sum + (parseInt(b.stock) || 0), 0);
  const lowStockCount = books.filter(b => (parseInt(b.stock) || 0) < 5).length;
  const totalUniqueBooks = books.length;

  if (loading) return <div style={{ padding: '6rem', textAlign: 'center' }}>Đang tải dữ liệu...</div>;

  // ------------------------------------------
  // RENDER: VIEW DETAIL PAGE
  // ------------------------------------------
  if (viewState === 'view') {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="content-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid var(--table-border)', paddingBottom: '1.5rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
            <Eye size={28} color="var(--accent)" /> Chi Tiết Phiếu Nhập #{currentTicket?.ticket_id}
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
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Ngày Nhập</div>
            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{new Date(currentTicket?.import_date).toLocaleTimeString('vi-VN')} | {new Date(currentTicket?.import_date).toLocaleDateString('vi-VN')}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Nhà Cung Cấp</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent)' }}>{currentTicket?.supplier || 'N/A'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Tổng Tiền</div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#10b981' }}>{parseFloat(currentTicket?.total_amount).toLocaleString('vi-VN')} đ</div>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 750, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Ghi chú</div>
          <div style={{ padding: '1rem', background: 'var(--card-bg)', borderRadius: '0.5rem', border: '1px solid var(--table-border)', minHeight: '60px' }}>
            {currentTicket?.notes || 'Không có ghi chú nào.'}
          </div>
        </div>

        <div>
          <h3 style={{ fontWeight: 800, marginBottom: '1rem', fontSize: '1.25rem', color: 'var(--text-primary)' }}>📚 Danh sách ấn phẩm nhập kho</h3>
          <div style={{ border: '1px solid var(--table-border)', borderRadius: '1rem', overflow: 'hidden' }}>
            <table className="lms-table" style={{ width: '100%', borderCollapse: 'collapse', margin: 0 }}>
              <thead>
                <tr style={{ background: 'var(--input-bg)' }}>
                  <th style={{ padding: '1rem', fontSize: '0.9rem' }}>Tên Sách</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.9rem', width: '120px' }}>Số lượng</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.9rem', width: '180px' }}>Đơn giá (đ)</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.9rem', width: '180px' }}>Thành tiền (đ)</th>
                </tr>
              </thead>
              <tbody>
                {currentTicket?.details?.map((d, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--table-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{d.book_title}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 800, color: 'var(--accent)', fontSize: '1.1rem' }}>+ {d.quantity}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>{parseFloat(d.unit_price).toLocaleString('vi-VN')}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: '#10b981' }}>{(d.quantity * d.unit_price).toLocaleString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                  <td colSpan="3" style={{ padding: '1.25rem 1rem', fontWeight: 800, textAlign: 'right', fontSize: '1.1rem' }}>Tổng thanh toán:</td>
                  <td style={{ padding: '1.25rem 1rem', textAlign: 'right', fontWeight: 900, color: '#10b981', fontSize: '1.5rem' }}>
                    {parseFloat(currentTicket?.total_amount).toLocaleString('vi-VN')} đ
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
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: 800, margin: 0, color: viewState === 'create' ? '#10b981' : 'var(--accent)' }}>
            {viewState === 'create' ? <><Plus size={28} /> Lập Phiếu Nhập Kho Mới</> : <><Edit3 size={28} /> Chỉnh Sửa Phiếu Nhập #{currentTicket?.ticket_id}</>}
          </h2>
          <button onClick={closePage} className="btn" style={{ background: 'var(--input-bg)', border: '1px solid var(--table-border)' }}>
            <ArrowLeft size={18} /> Quay Lại
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '950px', margin: '0 auto' }}>
          {/* Section 1: Ticket Info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', background: 'var(--input-bg)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--table-border)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Nhà Cung Cấp <span style={{ color: '#ef4444' }}>*</span></label>
              <input 
                type="text" 
                placeholder="Nhập tên nhà cung cấp..."
                value={supplier} 
                onChange={e => setSupplier(e.target.value)}
                style={{ width: '100%', padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid var(--table-border)', background: 'var(--card-bg)', color: 'var(--text-primary)', outline: 'none', fontSize: '1rem', fontWeight: 600 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Tổng tiền trị giá phiếu nhập</label>
              <div style={{ padding: '0.85rem', background: 'var(--card-bg)', borderRadius: '0.5rem', border: '1px solid var(--table-border)', fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>
                {totalAmount.toLocaleString('vi-VN')} đ
              </div>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Ghi chú thêm</label>
              <textarea 
                placeholder="Nhập ghi chú chi tiết (nếu có)..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                style={{ width: '100%', padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid var(--table-border)', background: 'var(--card-bg)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical', fontSize: '1rem' }}
              ></textarea>
            </div>
          </div>

          {/* Section 2: Toggle Manual / CSV Import Option (Available only on CREATE view) */}
          {viewState === 'create' && (
            <div style={{ display: 'flex', borderBottom: '2px solid var(--table-border)', gap: '1.5rem' }}>
              <button 
                onClick={() => setImportMode('manual')}
                style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: 800, background: 'transparent', border: 'none', borderBottom: importMode === 'manual' ? '3px solid var(--accent)' : '3px solid transparent', color: importMode === 'manual' ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Plus size={18} /> Nhập lẻ (Thủ công)
              </button>
              <button 
                onClick={() => setImportMode('csv')}
                style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: 800, background: 'transparent', border: 'none', borderBottom: importMode === 'csv' ? '3px solid var(--accent)' : '3px solid transparent', color: importMode === 'csv' ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Upload size={18} /> Nhập hàng loạt (File CSV)
              </button>
            </div>
          )}

          {/* Section 3a: Manual Item Selection Form */}
          {importMode === 'manual' && (
            <div style={{ border: '1px solid var(--table-border)', padding: '2rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Chọn sách bổ sung vào phiếu <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ flex: 2 }}>
                  <Select
                    options={bookOptions}
                    value={selectedBook ? bookOptions.find(o => o.value === selectedBook.book_id) : null}
                    onChange={(selected) => setSelectedBook(selected.book)}
                    placeholder="Tìm kiếm theo tên sách hoặc mã ISBN..."
                    styles={{
                      control: (base) => ({ ...base, background: 'var(--input-bg)', borderColor: 'var(--table-border)', padding: '6px', borderRadius: '0.75rem', fontSize: '1rem' }),
                      menu: (base) => ({ ...base, background: 'var(--card-bg)', zIndex: 100 }),
                      option: (base, state) => ({ ...base, background: state.isFocused ? 'var(--accent)' : 'transparent', color: state.isFocused ? '#fff' : 'var(--text-primary)' }),
                      singleValue: (base) => ({ ...base, color: 'var(--text-primary)' })
                    }}
                  />
                </div>
                
                <div style={{ width: '130px' }}>
                  <input 
                    type="number" 
                    min="1" 
                    value={importQty} 
                    onChange={e => setImportQty(parseInt(e.target.value) || 1)}
                    placeholder="S.Lượng"
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '0.75rem', border: '1px solid var(--table-border)', background: 'var(--input-bg)', color: 'var(--text-primary)', textAlign: 'center', outline: 'none', fontSize: '1rem', fontWeight: 700 }}
                    title="Số lượng nhập"
                  />
                </div>

                <div style={{ width: '180px', position: 'relative' }}>
                  <input 
                    type="number" 
                    min="0" 
                    value={unitPrice} 
                    onChange={e => setUnitPrice(parseFloat(e.target.value) || 0)}
                    placeholder="Đơn giá (đ)"
                    style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--table-border)', background: 'var(--input-bg)', color: 'var(--text-primary)', outline: 'none', fontSize: '1rem', fontWeight: 700 }}
                    title="Đơn giá nhập"
                  />
                </div>

                <button 
                  onClick={handleAddItem}
                  style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '0.75rem', padding: '0.8rem 1.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}
                >
                  Thêm vào list
                </button>
              </div>
            </div>
          )}

          {/* Section 3b: Bulk CSV Upload Form */}
          {importMode === 'csv' && (
            <div style={{ border: '1px dashed var(--table-border)', padding: '2rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(99, 102, 241, 0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>📁 Chọn file danh sách sách cần nhập kho</h3>
                <button
                  type="button"
                  onClick={downloadSampleCSV}
                  className="btn"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--table-border)', fontSize: '0.85rem' }}
                >
                  📥 Tải file CSV mẫu
                </button>
              </div>

              <div style={{
                border: '2px dashed var(--table-border)', borderRadius: '1rem',
                padding: '2.5rem', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                background: 'var(--input-bg)', cursor: 'pointer', position: 'relative'
              }}>
                <Upload size={36} color="var(--accent)" />
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {csvFile ? csvFile.name : 'Nhấp chuột vào đây hoặc kéo thả file CSV vào đây để chọn'}
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

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Mã hóa (Encoding):</span>
                <select
                  value={csvEncoding}
                  onChange={e => setCsvEncoding(e.target.value)}
                  style={{
                    padding: '0.4rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--table-border)',
                    background: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', fontWeight: 600
                  }}
                >
                  <option value="UTF-8">UTF-8 (Chuẩn hóa Quốc Tế)</option>
                  <option value="windows-1258">Windows-1258 (Excel tiếng Việt)</option>
                </select>
              </div>

              {csvPreview.length > 0 && (
                <div style={{ borderTop: '1px dashed var(--table-border)', paddingTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ margin: 0, fontWeight: 800, color: 'var(--text-primary)' }}>Xem trước danh mục sách chuẩn bị nạp ({csvPreview.length} bản ghi)</h4>
                    <button 
                      onClick={() => { setCsvFile(null); setCsvPreview([]); }}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Hủy bỏ file
                    </button>
                  </div>

                  <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid var(--table-border)', borderRadius: '0.5rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead style={{ background: 'var(--input-bg)', position: 'sticky', top: 0 }}>
                        <tr>
                          <th style={{ padding: '0.75rem', textAlign: 'left' }}>ISBN</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left' }}>Tên Sách</th>
                          <th style={{ padding: '0.75rem', textAlign: 'center', width: '100px' }}>Số lượng</th>
                          <th style={{ padding: '0.75rem', textAlign: 'right', width: '150px' }}>Đơn giá (đ)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.map((row, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--table-border)' }}>
                            <td style={{ padding: '0.5rem 0.75rem' }}>
                              <input 
                                type="text" 
                                value={row.isbn || ''} 
                                onChange={e => handlePreviewCellChange(idx, 'isbn', e.target.value)}
                                style={{ width: '100%', border: 'none', background: 'transparent', color: 'var(--text-primary)', fontWeight: 700, outline: 'none' }}
                              />
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem' }}>
                              <input 
                                type="text" 
                                value={row.title || ''} 
                                onChange={e => handlePreviewCellChange(idx, 'title', e.target.value)}
                                style={{ width: '100%', border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none' }}
                              />
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                              <input 
                                type="number" 
                                value={row.stock || row.quantity || ''} 
                                onChange={e => handlePreviewCellChange(idx, 'stock', e.target.value)}
                                style={{ width: '100%', border: 'none', background: 'transparent', color: 'var(--accent)', fontWeight: 800, textAlign: 'center', outline: 'none' }}
                              />
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>
                              <input 
                                type="number" 
                                value={row.unit_price || 0} 
                                onChange={e => handlePreviewCellChange(idx, 'unit_price', e.target.value)}
                                style={{ width: '100%', border: 'none', background: 'transparent', color: '#10b981', fontWeight: 700, textAlign: 'right', outline: 'none' }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {importing && (
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        <span>Đang xử lý tạo/kiểm tra sách từ CSV...</span>
                        <span>{progress}%</span>
                      </div>
                      <div style={{ background: 'var(--table-border)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, background: 'var(--accent)', height: '100%', transition: 'width 0.1s' }}></div>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={applyCSVToItems}
                    disabled={importing}
                    style={{ marginTop: '1.25rem', width: '100%', padding: '0.85rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <CheckCircle2 size={18} /> Nạp Danh Sách Lên Phiếu Nhập
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Section 4: Ticket Items Table */}
          {importItems.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>📑 Danh sách ấn phẩm đã ghi nhận cho phiếu nhập</h3>
              <div style={{ border: '1px solid var(--table-border)', borderRadius: '1rem', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                  <thead style={{ background: 'var(--input-bg)' }}>
                    <tr>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Tên Sách</th>
                      <th style={{ padding: '1rem', textAlign: 'center', width: '120px' }}>Số lượng</th>
                      <th style={{ padding: '1rem', textAlign: 'right', width: '180px' }}>Đơn giá (đ)</th>
                      <th style={{ padding: '1rem', textAlign: 'right', width: '180px' }}>Thành tiền (đ)</th>
                      <th style={{ padding: '1rem', textAlign: 'center', width: '80px' }}>Gỡ bỏ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importItems.map(item => (
                      <tr key={item.book_id} style={{ borderBottom: '1px solid var(--table-border)' }}>
                        <td style={{ padding: '1rem', fontWeight: 600 }}>{item.title}</td>
                        <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--accent)', fontWeight: 800 }}>+ {item.quantity}</td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>{item.unit_price.toLocaleString('vi-VN')}</td>
                        <td style={{ padding: '1rem', textAlign: 'right', color: '#10b981', fontWeight: 800 }}>{(item.quantity * item.unit_price).toLocaleString('vi-VN')}</td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <button onClick={() => handleRemoveItem(item.book_id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '0.5rem', width: '36px', height: '36px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: 'rgba(0,0,0,0.01)' }}>
                      <td colSpan="3" style={{ padding: '1.25rem 1rem', fontWeight: 800, textAlign: 'right' }}>Tổng thanh toán phiếu:</td>
                      <td colSpan="2" style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: 900, color: '#10b981', fontSize: '1.35rem' }}>
                        {totalAmount.toLocaleString('vi-VN')} đ
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--table-border)' }}>
            <button 
              onClick={handleSubmit}
              disabled={submitting || importItems.length === 0 || !supplier.trim()}
              style={{ 
                flex: 1, padding: '1rem', background: (importItems.length === 0 || !supplier.trim()) ? 'var(--input-bg)' : (viewState === 'edit' ? 'var(--accent)' : '#10b981'), 
                color: (importItems.length === 0 || !supplier.trim()) ? 'var(--text-muted)' : '#fff', border: 'none', borderRadius: '0.75rem', 
                fontWeight: 800, cursor: (importItems.length === 0 || !supplier.trim()) ? 'not-allowed' : 'pointer', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', gap: '0.75rem', transition: 'all 0.2s', fontSize: '1.1rem'
              }}
            >
              {submitting ? 'Đang gửi giao dịch...' : <><CheckCircle2 size={20} /> {viewState === 'create' ? 'Xác Nhận Tạo Phiếu Nhập' : 'Lưu Lại Thay Đổi'}</>}
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
      {/* STATS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--table-border)', borderRadius: '1rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '1.5rem' }}>📦</span>
          <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--accent)' }}>{totalStock}</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Tổng số sách hiện có trong kho</span>
        </div>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--table-border)', borderRadius: '1rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ef4444' }}>{lowStockCount}</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Đầu sách sắp hết hàng (&lt; 5 cuốn)</span>
        </div>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--table-border)', borderRadius: '1rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '1.5rem' }}>📚</span>
          <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10b981' }}>{totalUniqueBooks}</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Tổng số danh mục đầu sách</span>
        </div>
      </div>

      {/* Top Action Bar */}
      <div className="content-card" style={{ padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div className="search-box" style={{ minWidth: '350px', margin: 0 }}>
            <Search size={20} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Tìm theo mã phiếu, nhà cung cấp, người lập hoặc tên sách..." 
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
              <Download size={18} /> Xuất Lịch Sử CSV
            </button>
            <button className="btn btn-primary" onClick={() => openPage('create')} style={{ background: '#10b981' }}>
              <Plus size={18} /> Tạo Phiếu Nhập Mới
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
              <th>Ngày nhập</th>
              <th>Người Lập</th>
              <th>Nhà cung cấp</th>
              <th style={{ textAlign: 'right' }}>Tổng thanh toán</th>
              <th style={{ textAlign: 'center' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {paginatedData.map((item, idx) => {
                return (
                  <motion.tr key={item.ticket_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}>
                    <td><div style={{ fontWeight: 800 }}>#{item.ticket_id}</div></td>
                    <td>
                      <div>{new Date(item.import_date).toLocaleTimeString('vi-VN')}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(item.import_date).toLocaleDateString('vi-VN')}</div>
                    </td>
                    <td><div style={{ fontWeight: 600 }}>{item.user_name || 'Admin'}</div></td>
                    <td><div style={{ fontWeight: 800, color: 'var(--accent)' }}>{item.supplier || 'N/A'}</div></td>
                    <td style={{ textAlign: 'right' }}><div style={{ fontWeight: 800, color: '#10b981' }}>{parseFloat(item.total_amount).toLocaleString('vi-VN')} đ</div></td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button className="icon-btn view" title="Xem chi tiết" onClick={() => openPage('view', item)}><Eye size={18}/></button>
                        <button className="icon-btn edit" title="Chỉnh sửa" onClick={() => openPage('edit', item)}><Edit3 size={18}/></button>
                        <button className="icon-btn delete" title="Xóa phiếu nhập" onClick={() => handleDelete(item)}><Trash2 size={18}/></button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    Không tìm thấy phiếu nhập kho nào.
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

export default ImportPanel;

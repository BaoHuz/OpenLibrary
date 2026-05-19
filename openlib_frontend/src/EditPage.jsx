import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Loader2, Edit3, Trash2, Upload, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import { getImageUrl } from './utils/imageUrl';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import ImagePicker from './components/ImagePicker';


const EditPage = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [extraData, setExtraData] = useState({ authors: [], categories: [], publishers: [] });
  const [errors, setErrors] = useState({});

  const errorTranslations = {
    'title': 'Tên sách',
    'isbn': 'Mã ISBN',
    'author': 'Tác giả',
    'category': 'Thể loại',
    'publisher': 'Nhà xuất bản',
    'publication_year': 'Năm xuất bản',
    'stock': 'Số lượng tồn kho',
    'username': 'Tên đăng nhập',
    'email': 'Địa chỉ Email',
    'password': 'Mật khẩu',
    'full_name': 'Họ và tên'
  };

  const translateError = (key, msg) => {
    const fieldName = errorTranslations[key] || key;
    const lowerMsg = msg.toLowerCase();
    
    if (lowerMsg.includes('already exists')) return `${fieldName} này đã tồn tại trong hệ thống.`;
    if (lowerMsg.includes('this field is required')) return `${fieldName} không được để trống.`;
    if (lowerMsg.includes('valid number') || lowerMsg.includes('valid integer')) return `${fieldName} phải là một số hợp lệ.`;
    if (lowerMsg.includes('greater than or equal to 0')) return `${fieldName} không được nhỏ hơn 0.`;
    if (lowerMsg.includes('this field may not be null')) return `${fieldName} không được để trống.`;
    if (lowerMsg.includes('is required')) return `${fieldName} không được để trống.`;
    
    return msg;
  };

  // Custom styles for react-select to match project aesthetics
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: 'var(--input-bg)',
      backdropFilter: 'blur(10px)',
      border: state.isFocused ? '1px solid var(--accent)' : '1px solid var(--card-border)',
      borderRadius: 'var(--radius-sm)',
      padding: '0.15rem 0.4rem',
      boxShadow: state.isFocused ? '0 0 0 4px rgba(99, 102, 241, 0.15)' : 'inset 0 2px 4px rgba(0,0,0,0.05)',
      '&:hover': {
        borderColor: 'var(--accent)',
        backgroundColor: 'var(--hover-bg)'
      },
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer'
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: 'var(--card-bg)',
      backdropFilter: 'blur(20px)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--card-border)',
      boxShadow: 'var(--shadow-lg)',
      overflow: 'hidden',
      zIndex: 100
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? 'var(--accent)' : state.isFocused ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
      color: state.isSelected ? '#fff' : 'var(--text-primary)',
      fontWeight: 600,
      cursor: 'pointer',
      '&:active': {
        backgroundColor: 'var(--accent)'
      }
    }),
    singleValue: (base) => ({
      ...base,
      color: 'var(--text-primary)',
      fontWeight: 500
    }),
    input: (base) => ({
      ...base,
      color: 'var(--text-primary)'
    }),
    placeholder: (base) => ({
      ...base,
      color: 'var(--text-secondary)',
      opacity: 0.6
    })
  };

  // Map type (from URL) to API endpoint
  const endpointMap = {
    books: 'books',
    authors: 'authors',
    categories: 'categories',
    users: 'users',
    members: 'users',
    borrow: 'borrow_tickets',
    borrow_tickets: 'borrow_tickets',
    publishers: 'publishers',
    reviews: 'reviews',
    fines: 'fines',
  };
  const endpoint = endpointMap[type] || type;

  useEffect(() => {
    // Check role-based permission for members/users management
    const savedUser = localStorage.getItem('user');
    const userObj = savedUser ? JSON.parse(savedUser) : null;
    if ((type === 'members' || type === 'users' || endpoint === 'users') && userObj?.role?.toLowerCase() !== 'admin') {
      navigate('/403', { replace: true });
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/${endpoint}/${id}/`);
        setFormData(response.data);
        setOriginalData(response.data);
        
        if (type === 'books') {
          const [aRes, cRes, pRes] = await Promise.all([
            axios.get('http://127.0.0.1:8000/api/authors/'),
            axios.get('http://127.0.0.1:8000/api/categories/'),
            axios.get('http://127.0.0.1:8000/api/publishers/')
          ]);
          setExtraData({ authors: aRes.data, categories: cRes.data, publishers: pRes.data });
        }
      } catch (err) {
        console.error('Fetch error:', err);
        alert('Không thể tải dữ liệu!');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [endpoint, id, type]);

  // Field config per type
  const fieldConfig = {
    books: [
      { key: 'title', label: 'Tên sách', type: 'text' },
      { key: 'isbn', label: 'Mã ISBN', type: 'readonly' },
      { key: 'author', label: 'Tác giả', type: 'select', options: extraData.authors.map(a => ({ value: a.author_id, label: a.name })) },
      { key: 'category', label: 'Thể loại', type: 'select', options: extraData.categories.map(c => ({ value: c.category_id, label: c.name })) },
      { key: 'publisher', label: 'Nhà xuất bản', type: 'select', options: extraData.publishers.map(p => ({ value: p.publisher_id, label: p.name })) },
      { key: 'publication_year', label: 'Năm xuất bản', type: 'number' },
      { key: 'stock', label: 'Số lượng tồn kho', type: 'number' },
      { key: 'image', label: 'Ảnh bìa', type: 'image' },
    ],
    authors: [
      { key: 'name', label: 'Tên tác giả', type: 'text' },
      { key: 'bio', label: 'Tiểu sử', type: 'rich-text' },
      { key: 'image', label: 'Ảnh tác giả', type: 'image' },
    ],
    categories: [
      { key: 'name', label: 'Tên thể loại', type: 'text' },
      { key: 'description', label: 'Mô tả', type: 'textarea' },
    ],
    users: [
      { key: 'full_name', label: 'Họ và tên', type: 'text' },
      { key: 'email', label: 'Địa chỉ Email', type: 'email' },
      { key: 'password', label: 'Mật khẩu (Để trống nếu không đổi)', type: 'password' },
      { key: 'role', label: 'Vai trò', type: 'select', options: [
        { value: 'Admin', label: 'Quản trị viên (Admin)' },
        { value: 'Librarian', label: 'Thủ thư (Librarian)' },
        { value: 'Member', label: 'Thành viên (Member)' }
      ] },
      { key: 'is_active', label: 'Hoạt động', type: 'select', options: [
        { value: true, label: 'Đang hoạt động (True)' },
        { value: false, label: 'Bị khóa (False)' }
      ] },
    ],
    members: [
      { key: 'full_name', label: 'Họ và tên', type: 'text' },
      { key: 'email', label: 'Địa chỉ Email', type: 'email' },
      { key: 'password', label: 'Mật khẩu (Để trống nếu không đổi)', type: 'password' },
      { key: 'role', label: 'Vai trò', type: 'select', options: [
        { value: 'Admin', label: 'Quản trị viên (Admin)' },
        { value: 'Librarian', label: 'Thủ thư (Librarian)' },
        { value: 'Member', label: 'Thành viên (Member)' }
      ] },
      { key: 'is_active', label: 'Hoạt động', type: 'select', options: [
        { value: true, label: 'Đang hoạt động (True)' },
        { value: false, label: 'Bị khóa (False)' }
      ] },
    ],
    publishers: [
      { key: 'name', label: 'Tên nhà xuất bản', type: 'text' },
      { key: 'address', label: 'Địa chỉ', type: 'textarea' },
      { key: 'contact_email', label: 'Email liên hệ', type: 'email' },
    ],
    reviews: [
      { key: 'rating', label: 'Điểm đánh giá (1-5)', type: 'number' },
      { key: 'comment', label: 'Nội dung nhận xét', type: 'textarea' },
    ],
    fines: [
      { key: 'user', label: 'Mã thành viên (Người bị phạt)', type: 'readonly' },
      { key: 'amount', label: 'Số tiền phạt (VNĐ)', type: 'number' },
      { key: 'reason', label: 'Lý do phạt', type: 'text' },
      { key: 'is_paid', label: 'Trạng thái nộp phạt', type: 'select', options: [
        { value: false, label: 'Chưa thu' },
        { value: true, label: 'Đã thu' }
      ] },
      { key: 'ticket', label: 'Mã Phiếu mượn', type: 'readonly' }
    ],
    borrow_tickets: [
      { key: 'member', label: 'Mã thành viên (Người mượn)', type: 'readonly' },
      { key: 'librarian', label: 'Mã thủ thư (Người duyệt)', type: 'readonly' },
      { key: 'borrow_date', label: 'Ngày mượn', type: 'readonly' },
      { key: 'status', label: 'Trạng thái', type: 'select', options: [
        { value: 'Pending', label: 'Chờ duyệt' },
        { value: 'Active', label: 'Đang mượn' },
        { value: 'Returned', label: 'Đã trả sách' },
        { value: 'Overdue', label: 'Quá hạn' },
        { value: 'Rejected', label: 'Từ chối' }
      ] },
    ],

  };

  const fields = fieldConfig[type] || fieldConfig[endpoint] || 
    Object.keys(formData)
      .filter(k => !['book_id','author_id','category_id','user_id','ticket_id','publisher_id','review_id','fine_id','created_at'].includes(k))
      .map(k => ({ key: k, label: k.replace(/_/g,' ').toUpperCase(), type: 'text' }));

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (type === 'books') {
      if (!formData.title) newErrors.title = 'Vui lòng nhập tên sách.';
      if (formData.stock < 0) newErrors.stock = 'Số lượng không được nhỏ hơn 0.';
      if (formData.publication_year < 0) newErrors.publication_year = 'Năm xuất bản không hợp lệ.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setErrors({});
    try {
      // Build only changed fields (PATCH = partial update)
      const fd = new FormData();
      fields.forEach(f => {
        if (f.key === 'password' && (!formData[f.key] || formData[f.key].trim() === '')) {
           return; 
        }
        
        let val = formData[f.key];
        if (f.key === 'is_active' && typeof val === 'string') {
          val = val === 'true';
        }

        // Chỉ gửi những trường có sự thay đổi
        if (val !== originalData[f.key]) {
           if (val !== null && val !== undefined) {
              fd.append(f.key, val);
           } else if (originalData[f.key] !== null) {
              // Trường hợp muốn xóa dữ liệu (set về null)
              fd.append(f.key, ''); 
           }
        }
      });

      // Nếu không có gì thay đổi, không cần gửi request
      if (Array.from(fd.keys()).length === 0) {
        alert('ℹ️ Không có thay đổi nào để lưu.');
        setSaving(false);
        return;
      }

      await axios.patch(`http://127.0.0.1:8000/api/${endpoint}/${id}/`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('✅ Cập nhật thành công!');
      navigate(-1);
    } catch (err) {
      console.error('Update error:', err.response?.data || err);
      if (err.response?.status === 400 && typeof err.response.data === 'object') {
        const backendErrors = {};
        Object.keys(err.response.data).forEach(key => {
          const rawMsg = Array.isArray(err.response.data[key]) ? err.response.data[key][0] : err.response.data[key];
          backendErrors[key] = translateError(key, rawMsg);
        });
        setErrors(backendErrors);
      } else {
        const errMsg = err.response?.data 
          ? JSON.stringify(err.response.data, null, 2)
          : 'Lỗi kết nối server';
        alert(`❌ Lỗi khi lưu:\n${errMsg}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('⚠️ Bạn có chắc chắn muốn xóa mục này?\nHành động này KHÔNG THỂ hoàn tác!')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/${endpoint}/${id}/`);
        alert('✅ Xóa thành công!');
        navigate(-2);
      } catch (err) {
        alert('❌ Lỗi khi xóa! Có thể dữ liệu này đang được sử dụng bởi bảng khác.');
      }
    }
  };

  if (loading) return (
    <div className="loader-container" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'300px' }}>
      <Loader2 className="spinner" size={40} />
    </div>
  );

  const renderField = (field) => {
    if (!field) return null;
    return (
      <div key={field.key} className="input-group" style={(field.key === 'image' || field.type === 'textarea' || field.type === 'rich-text' || field.key === 'title') ? { gridColumn: '1 / -1' } : {}}>
        {field.key !== 'image' && <label>{field.label}</label>}
        {field.key === 'image' ? (
          <ImagePicker
            value={formData[field.key] ?? ''}
            onChange={url => handleChange(field.key, url)}
          />
        ) : field.type === 'textarea' ? (
          <textarea
            className="custom-input"
            rows={3}
            style={{ resize: 'vertical', width: '100%' }}
            value={formData[field.key] ?? ''}
            onChange={e => handleChange(field.key, e.target.value)}
          />
        ) : field.type === 'rich-text' ? (
          <div className="rich-text-wrapper">
            <ReactQuill 
              theme="snow" 
              value={formData[field.key] ?? ''} 
              onChange={val => handleChange(field.key, val)}
              style={{ background: 'var(--input-bg)', borderRadius: '12px' }}
            />
          </div>
        ) : field.type === 'select' ? (
          <Select
            styles={customSelectStyles}
            placeholder={`-- Chọn --`}
            options={field.options}
            value={field.options && field.options.find(opt => opt.value === formData[field.key]) || null}
            onChange={(selected) => handleChange(field.key, selected ? selected.value : '')}
          />
        ) : field.type === 'readonly' ? (
          <input
            className="custom-input"
            type="text"
            value={formData[field.key] ?? ''}
            readOnly
            style={{ background: 'var(--card-bg)', color: 'var(--text-secondary)', cursor: 'not-allowed' }}
          />
        ) : (
          <input
            className="custom-input"
            type={field.type}
            value={formData[field.key] ?? ''}
            onChange={e => handleChange(field.key, field.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
          />
        )}
        {errors[field.key] && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="error-msg"
            style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.4rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <AlertCircle size={12} /> {errors[field.key]}
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="form-card">
      <div className="form-header">
        <button className="icon-btn" onClick={() => navigate(-1)}><ArrowLeft size={20}/></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="icon-badge"><Edit3 size={24} /></div>
          <div>
            <h2 style={{ margin: 0 }}>Chỉnh sửa thông tin</h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {(() => {
                const translations = {
                  'books': 'Sách',
                  'authors': 'Tác giả',
                  'categories': 'Thể loại',
                  'members': 'Thành viên',
                  'users': 'Thành viên',
                  'borrow': 'Phiếu mượn',
                  'borrow_tickets': 'Phiếu mượn',
                  'publishers': 'Nhà xuất bản',
                  'fines': 'Phiếu phạt',
                  'reviews': 'Đánh giá'
                };
                const vnName = translations[type] || translations[endpoint] || endpoint;
                return `ID: ${id} · ${vnName}`;
              })()}
            </div>
          </div>
        </div>
        <button className="btn btn-danger" onClick={handleDelete}><Trash2 size={18}/> Xóa</button>
      </div>

      <div className="form-body" style={{ marginTop: '2rem' }}>
        {type === 'books' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
            {/* Cột trái: Ảnh bìa */}
            <div style={{ background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '1.5rem', height: 'fit-content' }}>
               <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--accent)', borderBottom: '2px solid var(--table-border)', paddingBottom: '0.5rem' }}>🖼️ ẢNH BÌA</h3>
               {renderField(fields.find(f => f.key === 'image'))}
            </div>
            {/* Cột phải: Các trường còn lại */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               <div style={{ background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '1.5rem' }}>
                 <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--accent)', borderBottom: '2px solid var(--table-border)', paddingBottom: '0.5rem' }}>📇 THÔNG TIN CƠ BẢN</h3>
                 <div className="form-grid">
                    {['title', 'author', 'category', 'publisher'].map(k => renderField(fields.find(f => f.key === k)))}
                 </div>
               </div>
               <div style={{ background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '1.5rem' }}>
                 <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--accent)', borderBottom: '2px solid var(--table-border)', paddingBottom: '0.5rem' }}>🔢 ĐỊNH DANH & KIỂM KÊ</h3>
                 <div className="form-grid">
                    {['isbn', 'publication_year', 'stock'].map(k => renderField(fields.find(f => f.key === k)))}
                 </div>
               </div>
            </div>
          </div>
        ) : (type === 'borrow' || type === 'borrow_tickets') ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
            {/* Cột trái: Thông tin tổng quan (Readonly) */}
            <div style={{ background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '1.5rem', height: 'fit-content', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--accent)', borderBottom: '2px solid var(--table-border)', paddingBottom: '0.5rem' }}>📋 TỔNG QUAN</h3>
               {['member', 'librarian', 'borrow_date'].map(k => renderField(fields.find(f => f.key === k)))}
            </div>
            {/* Cột phải: Cập nhật trạng thái */}
            <div style={{ background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '1.5rem' }}>
               <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--accent)', borderBottom: '2px solid var(--table-border)', paddingBottom: '0.5rem' }}>🔄 TRẠNG THÁI PHIẾU</h3>
               <div className="form-grid">
                  {renderField(fields.find(f => f.key === 'status'))}
               </div>
               <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                 * Lưu ý: Chỉ có thể thay đổi trạng thái của phiếu mượn. Các thông tin khác là dữ liệu lịch sử không thể chỉnh sửa.
               </p>
            </div>
          </div>
        ) : (
          <div className="form-grid">
            {fields.map(field => renderField(field))}
          </div>
        )}
      </div>

      {originalData.details && Array.isArray(originalData.details) && originalData.details.length > 0 && (
        <div style={{ marginTop: '2.5rem' }}>
           <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.2rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             📚 DANH SÁCH SÁCH MƯỢN <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>(Chế độ chỉ xem)</span>
           </h3>
           <div style={{ background: 'var(--input-bg)', borderRadius: '1.5rem', padding: '1.5rem', border: '1px solid var(--table-border)', overflow: 'hidden' }}>
             <table className="lms-table" style={{ margin: 0 }}>
               <thead>
                 <tr>
                   <th>Tên sách</th>
                   <th>Hạn trả</th>
                   <th>Ngày trả</th>
                   <th>Trạng thái</th>
                 </tr>
               </thead>
               <tbody>
                 {originalData.details.map((item, idx) => (
                   <tr key={idx}>
                     <td style={{ fontWeight: 700 }}>{item.book_title}</td>
                     <td>{item.due_date ? new Date(item.due_date).toLocaleDateString('vi-VN') : '—'}</td>
                     <td>{item.return_date ? new Date(item.return_date).toLocaleDateString('vi-VN') : '—'}</td>
                     <td>
                       <span className={`badge ${item.is_returned ? 'badge-success' : (originalData.status === 'Overdue' || item.status === 'Overdue' ? 'badge-danger' : 'badge-warning')}`} style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}>
                         {item.is_returned ? '● Đã trả' : (originalData.status === 'Overdue' || item.status === 'Overdue' ? '● Quá hạn' : '● Đang mượn')}
                       </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}

      <div className="form-footer">
        <button className="btn" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }} onClick={() => navigate(-1)}>Hủy bỏ</button>
        <button className="btn btn-success" onClick={handleSave} disabled={saving} style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          {saving ? <><Loader2 className="spinner" size={18}/> Đang lưu...</> : <><Save size={18}/> Lưu thay đổi</>}
        </button>
      </div>
    </motion.div>
  );
};

export default EditPage;

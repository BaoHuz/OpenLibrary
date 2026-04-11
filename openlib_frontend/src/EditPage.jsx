import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Loader2, Edit3, Trash2, Upload, Image as ImageIcon, X } from 'lucide-react';

/* ── Image Picker Component ── */
const ImagePicker = ({ value, onChange }) => {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');

  useEffect(() => { setPreview(value || ''); }, [value]);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // local preview
    const localURL = URL.createObjectURL(file);
    setPreview(localURL);
    // upload
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await axios.post('http://127.0.0.1:8000/api/upload-image/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onChange(res.data.url);
      setPreview(res.data.url);
    } catch (err) {
      alert('Lỗi upload ảnh: ' + (err.response?.data?.error || 'Thử lại!'));
      setPreview(value || '');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Preview box */}
      <div
        onClick={() => fileRef.current.click()}
        style={{
          width: '100%', height: '200px', borderRadius: '1rem',
          border: '2px dashed var(--card-border)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', background: 'var(--input-bg)', position: 'relative',
          transition: 'border-color .2s',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--card-border)'}
      >
        {preview ? (
          <>
            <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', opacity: 0, transition: 'opacity .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', gap: '0.5rem', fontSize: '0.95rem', fontWeight: 700 }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0}
            >
              <Upload size={18} /> Thay ảnh khác
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            {uploading
              ? <><Loader2 className="spinner" size={28} style={{ display: 'block', margin: '0 auto 0.5rem' }} /> Đang tải lên...</>
              : <><ImageIcon size={32} style={{ display: 'block', margin: '0 auto 0.5rem', opacity: 0.4 }} /> Click để chọn ảnh bìa</>
            }
          </div>
        )}
        {uploading && preview && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#fff', gap: '0.5rem' }}>
            <Loader2 className="spinner" size={28} />
            <span style={{ fontSize: '0.9rem' }}>Đang tải ảnh lên...</span>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      {preview && (
        <button type="button" onClick={() => { setPreview(''); onChange(''); }} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.82rem', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <X size={13} /> Xóa ảnh
        </button>
      )}
    </div>
  );
};

const EditPage = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Map type (from URL) to API endpoint
  const endpointMap = {
    books: 'books',
    authors: 'authors',
    categories: 'categories',
    users: 'users',
    members: 'users',
    borrow_tickets: 'borrow_tickets',
    publishers: 'publishers',
    reviews: 'reviews',
    fines: 'fines',
  };
  const endpoint = endpointMap[type] || type;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/${endpoint}/${id}/`);
        setFormData(response.data);
        setOriginalData(response.data);
      } catch (err) {
        console.error('Fetch error:', err);
        alert('Không thể tải dữ liệu!');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [endpoint, id]);

  // Field config per type
  const fieldConfig = {
    books: [
      { key: 'title', label: 'Tên sách', type: 'text' },
      { key: 'isbn', label: 'Mã ISBN', type: 'text' },
      { key: 'author', label: 'ID Tác giả', type: 'number' },
      { key: 'category', label: 'ID Thể loại', type: 'number' },
      { key: 'publisher', label: 'ID Nhà xuất bản', type: 'number' },
      { key: 'publication_year', label: 'Năm xuất bản', type: 'number' },
      { key: 'stock', label: 'Số lượng tồn kho', type: 'number' },
      { key: 'image', label: 'URL Ảnh bìa', type: 'text' },
    ],
    authors: [
      { key: 'name', label: 'Tên tác giả', type: 'text' },
      { key: 'bio', label: 'Tiểu sử', type: 'textarea' },
    ],
    categories: [
      { key: 'name', label: 'Tên thể loại', type: 'text' },
      { key: 'description', label: 'Mô tả', type: 'textarea' },
    ],
    users: [
      { key: 'full_name', label: 'Họ và tên', type: 'text' },
      { key: 'email', label: 'Địa chỉ Email', type: 'email' },
      { key: 'role', label: 'Vai trò (Admin/Librarian/Member)', type: 'text' },
      { key: 'is_active', label: 'Hoạt động (true/false)', type: 'text' },
    ],
    members: [
      { key: 'full_name', label: 'Họ và tên', type: 'text' },
      { key: 'email', label: 'Địa chỉ Email', type: 'email' },
      { key: 'role', label: 'Vai trò', type: 'text' },
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
      { key: 'amount', label: 'Số tiền phạt (VNĐ)', type: 'number' },
      { key: 'reason', label: 'Lý do phạt', type: 'text' },
      { key: 'is_paid', label: 'Đã nộp phạt (true/false)', type: 'text' },
    ],
  };

  const fields = fieldConfig[type] || fieldConfig[endpoint] || 
    Object.keys(formData)
      .filter(k => !['book_id','author_id','category_id','user_id','ticket_id','publisher_id','review_id','fine_id','created_at'].includes(k))
      .map(k => ({ key: k, label: k.replace(/_/g,' ').toUpperCase(), type: 'text' }));

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Build only changed fields (PATCH = partial update)
      const changedFields = {};
      fields.forEach(f => {
        changedFields[f.key] = formData[f.key];
      });

      await axios.patch(`http://127.0.0.1:8000/api/${endpoint}/${id}/`, changedFields);
      alert('✅ Cập nhật thành công!');
      navigate(-1);
    } catch (err) {
      console.error('Update error:', err.response?.data || err);
      const errMsg = err.response?.data 
        ? JSON.stringify(err.response.data, null, 2)
        : 'Lỗi kết nối server';
      alert(`❌ Lỗi khi lưu:\n${errMsg}`);
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

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="form-card">
      <div className="form-header">
        <button className="icon-btn" onClick={() => navigate(-1)}><ArrowLeft size={20}/></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="icon-badge"><Edit3 size={24} /></div>
          <div>
            <h2 style={{ margin: 0 }}>Chỉnh sửa thông tin</h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>ID: {id} · {endpoint}</div>
          </div>
        </div>
        <button className="btn btn-danger" onClick={handleDelete}><Trash2 size={18}/> Xóa</button>
      </div>

      <div className="form-grid">
        {fields.map(field => (
          <div key={field.key} className="input-group" style={field.key === 'image' ? { gridColumn: '1 / -1' } : field.type === 'textarea' ? { gridColumn: '1 / -1' } : {}}>
            <label>{field.label}</label>
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
            ) : (
              <input
                className="custom-input"
                type={field.type}
                value={formData[field.key] ?? ''}
                onChange={e => handleChange(field.key, field.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

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

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Loader2, PlusCircle } from 'lucide-react';

const AddPage = () => {
  const { type } = useParams(); // type: books, authors, users, etc.
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  
  // Mapping display types to API endpoints (if needed)
  const apiMap = {
    'books': 'books',
    'authors': 'authors',
    'categories': 'categories',
    'members': 'users',
    'borrow': 'borrow_tickets'
  };

  const endpoint = apiMap[type] || type;

  // Initialize empty data based on type
  const [formData, setFormData] = useState({});

  const handleSave = async () => {
    setSaving(true);
    try {
      let submitData = formData;
      let config = {};

      if (formData.image instanceof File) {
        submitData = new FormData();
        Object.keys(formData).forEach(key => {
          submitData.append(key, formData[key]);
        });
        config = { headers: { 'Content-Type': 'multipart/form-data' } };
      }

      await axios.post(`http://127.0.0.1:8000/api/${endpoint}/`, submitData, config);
      alert('Thêm mới thành công!');
      navigate(-1);
    } catch (err) {
      console.error('Create error:', err);
      alert('Lỗi: ' + (err.response?.data?.error || 'Không thể tạo mới. Hãy kiểm tra các trường bắt buộc!'));
    } finally {
      setSaving(false);
    }
  };

  const fieldLabels = {
    'title': 'Tên sách',
    'isbn': 'Mã ISBN',
    'publication_year': 'Năm xuất bản',
    'stock': 'Số lượng tồn',
    'name': 'Họ tên / Tên danh mục',
    'bio': 'Tiểu sử',
    'full_name': 'Họ và tên',
    'email': 'Địa chỉ Email',
    'username': 'Tên đăng nhập',
    'password': 'Mật khẩu',
    'role': 'Vai trò (admin/member)',
    'description': 'Mô tả chi tiết',
    'image': 'Ảnh minh họa'
  };

  // Fields to show for each type
  const typeFields = {
    'books': ['title', 'isbn', 'publication_year', 'stock', 'image'],
    'authors': ['name', 'bio'],
    'categories': ['name', 'description'],
    'users': ['username', 'password', 'full_name', 'email', 'role'],
    'borrow_tickets': ['member_id', 'book_id']
  };

  const currentFields = typeFields[type] || [];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="form-card">
      <div className="form-header">
        <button className="icon-btn" onClick={() => navigate(-1)}><ArrowLeft size={20}/></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="icon-badge" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><PlusCircle size={24} /></div>
          <h2>Thêm {type === 'books' ? 'Sách mới' : 'Mục mới'}</h2>
        </div>
      </div>

      <div className="form-grid">
         {currentFields.map(key => (
           <div key={key} className="input-group">
             <label>{fieldLabels[key] || key.toUpperCase()}</label>
             <input 
               className="custom-input"
               type={key === 'password' ? 'password' : (key === 'stock' ? 'number' : (key === 'image' ? 'file' : 'text'))}
               placeholder={`Nhập ${fieldLabels[key] || key}...`}
               onChange={(e) => {
                 if (key === 'image') {
                   setFormData({...formData, [key]: e.target.files[0]});
                 } else {
                   setFormData({...formData, [key]: e.target.value});
                 }
               }}
               {...(key !== 'image' && { value: formData[key] || '' })}
             />
           </div>
         ))}
      </div>

      <div className="form-footer">
         <button className="btn" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }} onClick={() => navigate(-1)}>Hủy bỏ</button>
         <button className="btn btn-success" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="spinner" size={18}/> : <><Save size={18}/> Tạo mới ngay</>}
         </button>
      </div>
    </motion.div>
  );
};

export default AddPage;

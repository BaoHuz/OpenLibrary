import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Loader2, PlusCircle, User, BookOpen, Tag, Building2, Star, AlertCircle, RefreshCw } from 'lucide-react';
import Select from 'react-select';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import ImagePicker from './components/ImagePicker';

const AddPage = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [extraData, setExtraData] = useState({ authors: [], categories: [], publishers: [] });
  
  // Custom styles for react-select
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: 'var(--input-bg)',
      backdropFilter: 'blur(10px)',
      border: state.isFocused ? '1px solid var(--accent)' : '1px solid var(--card-border)',
      borderRadius: 'var(--radius-sm)',
      padding: '0.15rem 0.4rem',
      boxShadow: state.isFocused ? '0 0 0 4px rgba(99, 102, 241, 0.15)' : 'inset 0 2px 4px rgba(0,0,0,0.05)',
      '&:hover': { borderColor: 'var(--accent)', backgroundColor: 'var(--hover-bg)' },
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
      zIndex: 100
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? 'var(--accent)' : state.isFocused ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
      color: state.isSelected ? '#fff' : 'var(--text-primary)',
      fontWeight: 600,
      cursor: 'pointer'
    }),
    singleValue: (base) => ({ ...base, color: 'var(--text-primary)', fontWeight: 500 }),
    placeholder: (base) => ({ ...base, color: 'var(--text-secondary)', opacity: 0.6 })
  };

  const apiMap = {
    'books': 'books',
    'authors': 'authors',
    'categories': 'categories',
    'members': 'users',
    'borrow': 'borrow_tickets',
    'publishers': 'publishers',
    'reviews': 'reviews',
    'fines': 'fines'
  };

  const endpoint = apiMap[type] || type;

  useEffect(() => {
    if (type === 'books') {
      const fetchExtraData = async () => {
        try {
          const [aRes, cRes, pRes] = await Promise.all([
            axios.get('http://127.0.0.1:8000/api/authors/'),
            axios.get('http://127.0.0.1:8000/api/categories/'),
            axios.get('http://127.0.0.1:8000/api/publishers/')
          ]);
          setExtraData({
            authors: Array.isArray(aRes.data) ? aRes.data : [],
            categories: Array.isArray(cRes.data) ? cRes.data : [],
            publishers: Array.isArray(pRes.data) ? pRes.data : []
          });
        } catch (err) {
          console.error('Error fetching dropdown data:', err);
        }
      };
      fetchExtraData();
    }
  }, [type]);

  const generateISBN = () => {
    const random = '978-' + Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
    setFormData({ ...formData, isbn: random });
  };

  const fieldConfig = {
    'books': [
      { key: 'title', label: 'Tên sách', type: 'text', placeholder: 'Nhập tên sách...', full: true },
      { key: 'isbn', label: 'Mã ISBN', type: 'isbn', placeholder: 'Ví dụ: 978-3-16-148410-0' },
      { key: 'author', label: 'Tác giả', type: 'select', options: extraData.authors.map(a => ({ value: a.author_id, label: a.name })) },
      { key: 'category', label: 'Thể loại', type: 'select', options: extraData.categories.map(c => ({ value: c.category_id, label: c.name })) },
      { key: 'publisher', label: 'Nhà xuất bản', type: 'select', options: extraData.publishers.map(p => ({ value: p.publisher_id, label: p.name })) },
      { key: 'publication_year', label: 'Năm xuất bản', type: 'number', placeholder: 'Ví dụ: 2024' },
      { key: 'stock', label: 'Số lượng tồn kho', type: 'number', placeholder: 'Ví dụ: 10' },
      { key: 'image', label: 'Ảnh bìa sách', type: 'image' }
    ],
    'authors': [
      { key: 'name', label: 'Họ tên tác giả', type: 'text', placeholder: 'Nhập tên tác giả...', full: true },
      { key: 'bio', label: 'Tiểu sử', type: 'rich-text' },
      { key: 'image', label: 'Ảnh tác giả', type: 'image' }
    ],
    'categories': [
      { key: 'name', label: 'Tên thể loại', type: 'text', placeholder: 'Ví dụ: Khoa học viễn tưởng...', full: true },
      { key: 'description', label: 'Mô tả', type: 'textarea', placeholder: 'Mô tả thể loại...', full: true }
    ],
    'members': [
      { key: 'username', label: 'Tên đăng nhập', type: 'text', placeholder: 'Ví dụ: nguyenvana' },
      { key: 'password', label: 'Mật khẩu', type: 'password', placeholder: 'Nhập mật khẩu...' },
      { key: 'full_name', label: 'Họ và tên', type: 'text', placeholder: 'Ví dụ: Nguyễn Văn A', full: true },
      { key: 'email', label: 'Địa chỉ Email', type: 'email', placeholder: 'example@gmail.com' },
      { key: 'role', label: 'Vai trò', type: 'select', options: [
        { value: 'Member', label: 'Thành viên' },
        { value: 'Librarian', label: 'Thủ thư' },
        { value: 'Admin', label: 'Quản trị viên' }
      ]}
    ],
    'borrow': [
      { key: 'member', label: 'Mã Thành viên (ID)', type: 'number', placeholder: 'Nhập ID thành viên' },
      { key: 'borrow_date', label: 'Ngày mượn', type: 'date' },
      { key: 'due_date', label: 'Hạn trả dự kiến', type: 'date' },
      { key: 'status', label: 'Trạng thái ban đầu', type: 'select', options: [
        { value: 'Pending', label: 'Chờ duyệt' },
        { value: 'Active', label: 'Đang mượn' }
      ]}
    ],
    'publishers': [
      { key: 'name', label: 'Tên nhà xuất bản', type: 'text', placeholder: 'Ví dụ: NXB Trẻ', full: true },
      { key: 'contact_email', label: 'Email liên hệ', type: 'email', placeholder: 'contact@nxb.com' },
      { key: 'address', label: 'Địa chỉ', type: 'text', placeholder: 'Địa chỉ trụ sở...', full: true }
    ]
  };

  const fields = fieldConfig[type] || [];

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

  const validate = () => {
    const newErrors = {};
    if (type === 'books') {
      if (!formData.title) newErrors.title = 'Vui lòng nhập tên sách.';
      if (!formData.stock && formData.stock !== 0) {
        newErrors.stock = 'Vui lòng nhập số lượng.';
      } else if (formData.stock < 0) {
        newErrors.stock = 'Số lượng không được nhỏ hơn 0.';
      }
      if (formData.publication_year < 0) {
        newErrors.publication_year = 'Năm xuất bản không hợp lệ.';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (saving) return;
    if (!validate()) return;

    setSaving(true);
    setErrors({});
    try {
      let finalData;
      let config = {};

      if (type === 'books' || type === 'authors' || formData.image instanceof File) {
        // Gửi cả file và dữ liệu trong 1 request duy nhất (Multipart)
        finalData = new FormData();
        Object.keys(formData).forEach(key => {
          if (formData[key] !== null && formData[key] !== undefined) {
            finalData.append(key, formData[key]);
          }
        });
        config = { headers: { 'Content-Type': 'multipart/form-data' } };
      } else {
        finalData = { ...formData };
      }

      await axios.post(`http://127.0.0.1:8000/api/${endpoint}/`, finalData, config);
      
      alert('✅ Tạo mới thành công!');
      navigate(-1);
    } catch (err) {
      console.error('Create error:', err.response?.data || err);
      if (err.response?.status === 400 && typeof err.response.data === 'object') {
        const backendErrors = {};
        Object.keys(err.response.data).forEach(key => {
          const rawMsg = Array.isArray(err.response.data[key]) ? err.response.data[key][0] : err.response.data[key];
          backendErrors[key] = translateError(key, rawMsg);
        });
        setErrors(backendErrors);
      } else {
        alert('❌ Lỗi hệ thống: Không thể kết nối server hoặc dữ liệu không hợp lệ.');
      }
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field) => {
    const handleChange = (val) => {
      setFormData(prev => ({ ...prev, [field.key]: val }));
    };

    return (
      <div key={field.key} className="input-group" style={(field.type === 'textarea' || field.type === 'rich-text' || field.full) ? { gridColumn: '1 / -1' } : {}}>
        <label>{field.label}</label>
        {field.type === 'textarea' ? (
          <textarea 
            className="custom-input" 
            rows={4} 
            placeholder={field.placeholder}
            value={formData[field.key] || ''} 
            onChange={(e) => handleChange(e.target.value)}
          />
        ) : field.type === 'rich-text' ? (
          <div className="rich-text-wrapper">
            <ReactQuill 
              theme="snow" 
              value={formData[field.key] || ''} 
              onChange={val => handleChange(val)}
              style={{ background: 'var(--input-bg)', borderRadius: '12px' }}
            />
          </div>
        ) : field.type === 'image' ? (
          <ImagePicker 
            value={formData[field.key] || ''} 
            onChange={val => handleChange(val)} 
          />
        ) : field.type === 'select' ? (
          <Select 
            styles={customSelectStyles}
            placeholder={`-- Chọn ${field.label} --`}
            options={field.options}
            value={field.options && field.options.find(opt => opt.value === formData[field.key]) || null}
            onChange={(selected) => handleChange(selected ? selected.value : null)}
          />
        ) : field.type === 'isbn' ? (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              className="custom-input"
              type="text"
              placeholder={field.placeholder}
              value={formData[field.key] || ''}
              onChange={(e) => handleChange(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="button" className="icon-btn" onClick={generateISBN} title="Tạo mã ngẫu nhiên">
               <RefreshCw size={18} />
            </button>
          </div>
        ) : (
          <input 
            className="custom-input"
            type={field.type} 
            placeholder={field.placeholder}
            {...(field.type === 'file' 
              ? { onChange: (e) => handleChange(e.target.files[0]) } 
              : { 
                  value: formData[field.key] || '', 
                  onChange: (e) => handleChange(field.type === 'number' ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value) 
                }
            )}
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

  const getIcon = () => {
    switch(type) {
      case 'books': return <BookOpen size={24} />;
      case 'members': return <User size={24} />;
      case 'categories': return <Tag size={24} />;
      case 'publishers': return <Building2 size={24} />;
      default: return <PlusCircle size={24} />;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="form-card">
      <div className="form-header">
        <button className="icon-btn" onClick={() => navigate(-1)}><ArrowLeft size={20}/></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="icon-badge">{getIcon()}</div>
          <h2>{type === 'books' ? 'Thêm Sách mới' : `Thêm ${type} mới`}</h2>
        </div>
      </div>

      <div className="form-body" style={{ paddingBottom: '1rem' }}>
        <div className="form-grid">
           {fields.map(field => renderField(field))}
        </div>
        {fields.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
             <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
             <p>Cấu hình cho mục này chưa khả dụng.</p>
          </div>
        )}
      </div>

      <div className="form-footer">
         <button className="btn" onClick={() => navigate(-1)}>Hủy bỏ</button>
         <button className="btn btn-success" onClick={handleSave} disabled={saving || fields.length === 0}>
            {saving ? <><Loader2 className="spinner" size={18}/> Đang lưu...</> : <><Save size={18}/> Tạo mới ngay</>}
         </button>
      </div>
    </motion.div>
  );
};

export default AddPage;

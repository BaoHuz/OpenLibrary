import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit3, Trash2, BookOpen, Loader2 } from 'lucide-react';
import { getImageUrl } from './utils/imageUrl';

const DetailPage = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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
        setData(response.data);
      } catch (err) {
        console.error('Fetch error:', err);
        alert('Không thể tải dữ liệu!');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [type, id]);

  if (loading) return <div className="loader-container"><Loader2 className="spinner" size={40} /></div>;
  if (!data) return <div>Không tìm thấy dữ liệu</div>;

  const fieldLabels = {
    'title': 'Tên sách',
    'isbn': 'Mã ISBN',
    'publication_year': 'Năm xuất bản',
    'stock': 'Số lượng tồn',
    'name': 'Họ tên / Tên',
    'bio': 'Tiểu sử',
    'full_name': 'Họ và tên',
    'email': 'Địa chỉ Email',
    'username': 'Tên đăng nhập',
    'password': 'Mật khẩu',
    'role': 'Vai trò',
    'description': 'Mô tả chi tiết',
    'image': 'Ảnh minh họa',
    'book_id': 'Mã sách',
    'author': 'Tác giả',
    'author_name': 'Tên tác giả',
    'category': 'Thể loại',
    'category_name': 'Tên thể loại',
    'publisher': 'Nhà xuất bản',
    'publisher_name': 'Tên nhà xuất bản',
    'is_active': 'Trạng thái hoạt động',
    'date_joined': 'Ngày tham gia',
    'user_id': 'Mã người dùng',
    'author_id': 'Mã tác giả',
    'category_id': 'Mã thể loại',
    'ticket_id': 'Mã phiếu mượn',
    'member': 'Mã thành viên (Người mượn)',
    'member_name': 'Tên thành viên',
    'librarian': 'Mã thủ thư (Người xử lý)',
    'librarian_name': 'Tên thủ thư',
    'borrow_date': 'Ngày mượn',
    'due_date': 'Hạn trả',
    'return_date': 'Ngày trả',
    'status': 'Trạng thái',
    'contact_email': 'Email liên hệ',
    'address': 'Địa chỉ',
    'review_id': 'Mã đánh giá',
    'rating': 'Đánh giá (sao)',
    'comment': 'Bình luận',
    'fine_id': 'Mã khoản phạt',
    'amount': 'Số tiền (VNĐ)',
    'reason': 'Lý do vi phạm',
    'is_paid': 'Trạng thái thanh toán',
    'book': 'Mã sách',
    'user': 'Mã người dùng',
    'created_at': 'Ngày tạo',
    'updated_at': 'Ngày cập nhật'
  };

  const handleDelete = async () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bản ghi này không? Thao tác này không thể hoàn tác.`)) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/${endpoint}/${id}/`);
        alert('✅ Đã xóa thành công!');
        navigate(-1);
      } catch (err) {
        console.error('Delete error:', err);
        alert('❌ Lỗi: Không thể xóa bản ghi này. Có thể nó đang được liên kết với dữ liệu khác.');
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="detail-page-card">
      <div className="detail-header">
        <button className="icon-btn" onClick={() => navigate(-1)}><ArrowLeft size={20}/></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="icon-badge"><BookOpen size={24} /></div>
          <h2>Thông tin chi tiết</h2>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn" style={{ background: 'var(--card-bg)', color: 'var(--text-primary)' }} onClick={() => navigate(`/admin/${type}/edit/${id}`)}><Edit3 size={18}/> Chỉnh sửa</button>
          <button className="btn btn-danger" onClick={handleDelete}><Trash2 size={18}/> Xóa</button>
        </div>
      </div>

      <div className="detail-body">
         {type === 'books' ? (
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '2rem' }}>
             {/* 1/3 Cột trái: Ảnh bìa & Trạng thái */}
             <div style={{ background: 'var(--input-bg)', padding: '2rem', borderRadius: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', height: 'fit-content' }}>
               <div style={{ width: '100%', aspectRatio: '2/3', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', background: '#fff' }}>
                 {data.image ? <img src={getImageUrl(data.image)} alt="Bìa sách" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}><BookOpen size={64} color="var(--text-muted)"/></div>}
               </div>
               <span className={`badge ${data.stock > 0 ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem', width: '100%', textAlign: 'center' }}>
                 {data.stock > 0 ? `● Còn ${data.stock} cuốn` : '● Hết sách'}
               </span>
             </div>

             {/* 2/3 Cột phải: Thông tin & Các khối */}
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               {/* Khối Thông tin chính */}
               <div style={{ background: 'var(--input-bg)', padding: '2rem', borderRadius: '1.5rem' }}>
                 <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--accent)', borderBottom: '2px solid var(--table-border)', paddingBottom: '0.5rem' }}>📇 THÔNG TIN CƠ BẢN</h3>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', gridColumn: '1 / -1' }}>
                     <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Tên sách</label>
                     <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{data.title || '—'}</p>
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                     <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Tác giả</label>
                     <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>{data.author_name || '—'}</p>
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                     <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Thể loại</label>
                     <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>{data.category_name || '—'}</p>
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                     <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Nhà xuất bản</label>
                     <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>{data.publisher_name || '—'}</p>
                   </div>
                 </div>
               </div>

               {/* Khối Định danh */}
               <div style={{ background: 'var(--input-bg)', padding: '2rem', borderRadius: '1.5rem' }}>
                 <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--accent)', borderBottom: '2px solid var(--table-border)', paddingBottom: '0.5rem' }}>🔢 ĐỊNH DANH & KIỂM KÊ</h3>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                     <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Mã ISBN</label>
                     <p style={{ fontSize: '1.1rem', fontWeight: 600, fontFamily: 'monospace', margin: 0 }}>{data.isbn || '—'}</p>
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                     <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Năm xuất bản</label>
                     <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>{data.publication_year || '—'}</p>
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                     <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Số lượng tồn kho</label>
                     <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>{data.stock ?? '—'}</p>
                   </div>
                 </div>
               </div>

               {/* Thông tin hệ thống */}
               <div style={{ background: 'var(--input-bg)', padding: '2rem', borderRadius: '1.5rem' }}>
                 <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--accent)', borderBottom: '2px solid var(--table-border)', paddingBottom: '0.5rem' }}>⚙️ THÔNG TIN HỆ THỐNG</h3>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                     <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Ngày tạo bản ghi</label>
                     <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>{data.created_at ? new Date(data.created_at).toLocaleString('vi-VN') : '—'}</p>
                   </div>
                 </div>
               </div>
             </div>
           </div>
          ) : (type === 'members' || type === 'users') ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '2rem' }}>
              {/* Cột trái: Profile Card */}
              <div style={{ background: 'var(--input-bg)', padding: '2rem', borderRadius: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', height: 'fit-content' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #6366f1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', fontWeight: 800, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                  {data.full_name ? data.full_name.charAt(0).toUpperCase() : data.username.charAt(0).toUpperCase()}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{data.full_name || data.username}</h3>
                  <p style={{ margin: '0.4rem 0 0', color: 'var(--text-secondary)', fontWeight: 600 }}>@{data.username}</p>
                </div>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                   <span className={`badge ${data.role === 'Admin' ? 'badge-danger' : data.role === 'Librarian' ? 'badge-warning' : 'badge-primary'}`} style={{ fontSize: '0.9rem', padding: '0.5rem', textAlign: 'center', display: 'block' }}>
                      {data.role === 'Admin' ? 'Quản trị viên' : data.role === 'Librarian' ? 'Thủ thư' : 'Thành viên'}
                   </span>
                   <span className={`badge ${data.is_active ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.9rem', padding: '0.5rem', textAlign: 'center', display: 'block' }}>
                      {data.is_active ? '● Đang hoạt động' : '● Đã bị khóa'}
                   </span>
                </div>
              </div>

              {/* Cột phải: Thông tin chi tiết */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Khối Thông tin cá nhân */}
                <div style={{ background: 'var(--input-bg)', padding: '2rem', borderRadius: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--accent)', borderBottom: '2px solid var(--table-border)', paddingBottom: '0.5rem' }}>👤 THÔNG TIN CÁ NHÂN</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Họ và tên</label>
                      <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{data.full_name || '—'}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Địa chỉ Email</label>
                      <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{data.email || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Khối Tài khoản */}
                <div style={{ background: 'var(--input-bg)', padding: '2rem', borderRadius: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--accent)', borderBottom: '2px solid var(--table-border)', paddingBottom: '0.5rem' }}>🔐 BẢO MẬT & TÀI KHOẢN</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Tên đăng nhập</label>
                      <p style={{ fontSize: '1.1rem', fontWeight: 600, fontFamily: 'monospace' }}>{data.username}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Mã định danh (ID)</label>
                      <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>#USR-{data.user_id}</p>
                    </div>
                  </div>
                </div>

                {/* Thông tin hệ thống */}
                <div style={{ background: 'var(--input-bg)', padding: '2rem', borderRadius: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--accent)', borderBottom: '2px solid var(--table-border)', paddingBottom: '0.5rem' }}>⚙️ LỊCH SỬ HỆ THỐNG</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Ngày gia nhập</label>
                      <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{data.created_at ? new Date(data.created_at).toLocaleString('vi-VN') : '—'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (type === 'borrow' || type === 'borrow_tickets') ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '2rem' }}>
              {/* Cột trái: Biểu tượng phiếu mượn */}
              <div style={{ background: 'var(--input-bg)', padding: '2rem', borderRadius: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', height: 'fit-content' }}>
                <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #6366f1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                  <BookOpen size={64} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Phiếu Mượn</h3>
                  <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>ID: {id}</p>
                </div>
                <span className={`badge ${
                  data.status === 'Active' ? 'badge-primary' : 
                  data.status === 'Returned' ? 'badge-success' : 
                  data.status === 'Overdue' ? 'badge-danger' : 'badge-warning'
                }`} style={{ fontSize: '1rem', padding: '0.6rem 1.2rem', width: '100%', textAlign: 'center' }}>
                  ● {
                    data.status === 'Pending' ? 'Chờ duyệt' :
                    data.status === 'Active' ? 'Đang mượn' :
                    data.status === 'Returned' ? 'Đã trả sách' :
                    data.status === 'Overdue' ? 'Quá hạn' : 'Từ chối'
                  }
                </span>
              </div>

              {/* Cột phải: Chi tiết */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ background: 'var(--input-bg)', padding: '2rem', borderRadius: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--accent)', borderBottom: '2px solid var(--table-border)', paddingBottom: '0.5rem' }}>📝 THÔNG TIN PHIẾU MƯỢN</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Người mượn</label>
                      <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{data.member_name || `Mã: ${data.member}`}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Thủ thư xử lý</label>
                      <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{data.librarian_name || (data.librarian ? `Mã: ${data.librarian}` : 'Chưa xử lý')}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Ngày mượn</label>
                      <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{data.borrow_date ? new Date(data.borrow_date).toLocaleDateString('vi-VN') : '—'}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Ngày trả / Hạn trả</label>
                      <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{data.return_date ? new Date(data.return_date).toLocaleDateString('vi-VN') : (data.due_date ? new Date(data.due_date).toLocaleDateString('vi-VN') : '—')}</p>
                    </div>
                  </div>
                </div>

                {data.details && Array.isArray(data.details) && (
                  <div style={{ background: 'var(--input-bg)', padding: '2rem', borderRadius: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--accent)', borderBottom: '2px solid var(--table-border)', paddingBottom: '0.5rem' }}>📚 DANH SÁCH SÁCH MƯỢN</h3>
                    <div style={{ background: 'var(--card-bg)', borderRadius: '1rem', padding: '1rem', border: '1px solid var(--table-border)', overflow: 'hidden' }}>
                      <table className="lms-table" style={{ margin: 0 }}>
                        <thead>
                          <tr>
                            <th>Tên sách</th>
                            <th>Mã sách</th>
                            <th>Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.details.map((item, idx) => (
                            <tr key={idx}>
                              <td style={{ fontWeight: 700 }}>{item.book_title || item.book}</td>
                              <td style={{ fontFamily: 'monospace' }}>{item.book}</td>
                              <td>
                                <span className={`badge ${item.is_returned ? 'badge-success' : (data.status === 'Overdue' || item.status === 'Overdue' ? 'badge-danger' : 'badge-warning')}`} style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}>
                                  {item.is_returned ? '● Đã trả' : (data.status === 'Overdue' || item.status === 'Overdue' ? '● Quá hạn' : '● Đang mượn')}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : type === 'fines' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem' }}>
              {/* Cột trái: Biểu tượng khoản phạt */}
              <div style={{ background: 'var(--input-bg)', padding: '2rem', borderRadius: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', height: 'fit-content' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #ef4444, #f97316)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(239,68,68,0.2)' }}>
                  <span style={{ fontSize: '3.5rem', fontWeight: 800 }}>₫</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Phiếu Phạt</h3>
                  <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>ID: {id}</p>
                </div>
                <span className={`badge ${data.is_paid ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '1rem', padding: '0.6rem 1.2rem', width: '100%', textAlign: 'center' }}>
                  {data.is_paid ? '● Đã thu tiền' : '● Chưa thu tiền'}
                </span>
              </div>

              {/* Cột phải: Chi tiết */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ background: 'var(--input-bg)', padding: '2rem', borderRadius: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--accent)', borderBottom: '2px solid var(--table-border)', paddingBottom: '0.5rem' }}>📝 CHI TIẾT KHOẢN PHẠT</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Thành viên bị phạt</label>
                      <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{data.user_name || `Mã TV: ${data.user}`}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Số tiền phạt (VNĐ)</label>
                      <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'red', margin: 0 }}>{Number(data.amount).toLocaleString('vi-VN')} đ</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Lý do vi phạm</label>
                      <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>{data.reason || '—'}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Thời điểm tạo</label>
                      <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{data.created_at ? new Date(data.created_at).toLocaleString('vi-VN') : '—'}</p>
                    </div>
                  </div>
                </div>

                {data.ticket_books && data.ticket_books.length > 0 ? (
                  <div style={{ background: 'var(--input-bg)', padding: '2rem', borderRadius: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--accent)', borderBottom: '2px solid var(--table-border)', paddingBottom: '0.5rem' }}>📚 CHI TIẾT SÁCH QUÁ HẠN TRONG PHIẾU</h3>
                    <div style={{ background: 'var(--card-bg)', borderRadius: '1rem', padding: '1rem', border: '1px solid var(--table-border)', overflowX: 'auto' }}>
                      <table className="lms-table" style={{ margin: 0 }}>
                        <thead>
                          <tr>
                            <th style={{ padding: '10px 16px' }}>Tên sách</th>
                            <th style={{ padding: '10px 16px' }}>Mã sách</th>
                            <th style={{ padding: '10px 16px' }}>Hạn trả dự kiến</th>
                            <th style={{ padding: '10px 16px' }}>Tình trạng</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.ticket_books.map((book, idx) => (
                            <tr key={idx}>
                              <td style={{ fontWeight: 700, padding: '10px 16px' }}>{book.title}</td>
                              <td style={{ fontFamily: 'monospace', padding: '10px 16px' }}>ID: {book.book_id}</td>
                              <td style={{ padding: '10px 16px' }}>{book.due_date ? new Date(book.due_date).toLocaleDateString('vi-VN') : '—'}</td>
                              <td style={{ padding: '10px 16px' }}>
                                <span className={`badge ${book.is_returned ? 'badge-success' : 'badge-danger'}`} style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}>
                                  {book.is_returned ? '● Đã trả' : '● Chưa trả (Quá hạn)'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: 'var(--input-bg)', padding: '2rem', borderRadius: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    <span style={{ fontSize: '2rem' }}>ℹ️</span>
                    <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Thông tin sách liên kết không có sẵn</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Khoản phạt này được thủ thư tạo thủ công hoặc không liên kết trực tiếp với một Phiếu mượn cụ thể trong cơ sở dữ liệu.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               {/* Profile Header */}
               <div style={{ background: 'var(--input-bg)', padding: '2rem', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #6366f1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
                    {(type === 'authors' && data.image) 
                      ? <img src={getImageUrl(data.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="author" />
                      : (data.name ? data.name.charAt(0).toUpperCase() : data.full_name ? data.full_name.charAt(0).toUpperCase() : type.charAt(0).toUpperCase())
                    }
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>{data.name || data.full_name || data.title || `Thông tin bản ghi`}</h2>
                    <p style={{ color: 'var(--text-secondary)', margin: '0.4rem 0 0 0', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>PHÂN LOẠI: {type} • ID: {id}</p>
                  </div>
               </div>

               {/* Data Grid */}
               <div style={{ background: 'var(--input-bg)', padding: '2rem', borderRadius: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
               {Object.entries(data).map(([key, val]) => {
                  if (key === 'details' && Array.isArray(val)) {
                     return (
                       <div key={key} style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Sách đã mượn</label>
                          <div style={{ marginTop: '0.5rem', background: 'var(--card-bg)', borderRadius: '1rem', padding: '1rem', border: '1px solid var(--table-border)' }}>
                            {val.length === 0 ? <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Không có sách nào</p> : (
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
                                  {val.map((item, idx) => (
                                    <tr key={idx}>
                                      <td style={{ fontWeight: 600 }}>{item.book_title}</td>
                                      <td>{item.due_date || '—'}</td>
                                      <td>{item.return_date || '—'}</td>
                                      <td>
                                        <span className={`badge ${item.is_returned ? 'badge-success' : (data.status === 'Overdue' || item.status === 'Overdue' ? 'badge-danger' : 'badge-warning')}`} style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}>
                                          {item.is_returned ? '● Đã trả' : (data.status === 'Overdue' || item.status === 'Overdue' ? '● Quá hạn' : '● Đang mượn')}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                       </div>
                     );
                  }

                  if (typeof val === 'object' && val !== null) return null;
                  
                  if (key === 'image' && val) {
                     const imageLabel = type === 'books' ? 'ẢNH BÌA SÁCH' : (type === 'authors' ? 'ẢNH TÁC GIẢ' : 'HÌNH ẢNH');
                     return (
                       <div key={key} style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{imageLabel}</label>
                          <div style={{ marginTop: '0.5rem' }}>
                            <img src={getImageUrl(val)} alt="Preview" style={{ height: '320px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid var(--card-border)' }} />
                          </div>
                       </div>
                     );
                  }

                  const displayLabel = fieldLabels[key] || key.replace(/_/g, ' ');
                  let renderedValue = val === null || val === undefined || val === '' ? '—' : (typeof val === 'boolean' ? (val ? 'Có' : 'Không') : val.toString());
                  let isBadge = false;
                  let badgeClass = '';
                  
                  if (key === 'is_active') {
                    isBadge = true;
                    badgeClass = val ? 'badge-success' : 'badge-danger';
                    renderedValue = val ? '● Đang hoạt động' : '● Bị khóa';
                  } else if (key === 'role') {
                    isBadge = true;
                    const lowerRole = val?.toLowerCase();
                    badgeClass = lowerRole === 'admin' ? 'badge-danger' : lowerRole === 'librarian' ? 'badge-warning' : 'badge-primary';
                    renderedValue = lowerRole === 'admin' ? 'Quản trị viên' : lowerRole === 'librarian' ? 'Thủ thư' : 'Thành viên';
                  } else if (key === 'status') {
                    isBadge = true;
                    badgeClass = val === 'approved' ? 'badge-success' : val === 'pending' ? 'badge-warning' : 'badge-danger';
                  }

                  return (
                    <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: ['bio', 'description', 'address', 'comment', 'status', 'reason'].includes(key) ? '1 / -1' : 'auto', alignItems: 'flex-start' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{displayLabel}</label>
                      {isBadge ? (
                        <span className={`badge ${badgeClass}`} style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>{renderedValue}</span>
                      ) : (key === 'bio' || key === 'description') ? (
                        <>
                        <div 
                          className="rich-text-content"
                          style={{ 
                            fontSize: '1rem', 
                            color: 'var(--text-primary)', 
                            lineHeight: '1.65',
                            width: '100%',
                            overflowWrap: 'break-word',
                            wordBreak: 'normal',
                            textAlign: 'left',
                            padding: '0.2rem 0'
                          }}
                          dangerouslySetInnerHTML={{ 
                            __html: (val || '—').replace(/&nbsp;/g, ' ').replace(/\u00a0/g, ' ') 
                          }} 
                        />
                        <style>{`
                          .rich-text-content p { 
                            margin: 0 0 1.2rem 0; 
                            line-height: 1.65; 
                            word-break: normal; 
                            overflow-wrap: break-word; 
                          }
                          .rich-text-content p:last-child { margin-bottom: 0; }
                          .rich-text-content img { max-width: 100%; height: auto; border-radius: 8px; margin: 0.5rem 0; }
                        `}</style>
                      </>
                      ) : (
                        <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>{renderedValue}</p>
                      )}
                    </div>
                  );
               })}
               </div>
            </div>
          )}
      </div>
    </motion.div>
  );
};

export default DetailPage;

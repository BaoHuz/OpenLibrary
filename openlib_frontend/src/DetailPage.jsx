import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit3, Trash2, BookOpen, Loader2 } from 'lucide-react';

const DetailPage = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/${type}/${id}/`);
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
          <button className="btn btn-danger" onClick={() => {/* handle delete logic */}}><Trash2 size={18}/> Xóa</button>
        </div>
      </div>

      <div className="detail-body">
         <div style={{ background: 'var(--input-bg)', padding: '2rem', borderRadius: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
            {Object.entries(data).map(([key, val]) => {
               if (typeof val === 'object' && val !== null) return null;
               
               if (key === 'image' && val) {
                  return (
                    <div key={key} style={{ gridColumn: '1 / -1' }}>
                       <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>ẢNH BÌA</label>
                       <div style={{ marginTop: '0.5rem' }}>
                         <img src={val} alt="Bìa sách" style={{ height: '300px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                       </div>
                    </div>
                  );
               }

               return (
                 <div key={key}>
                   <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{key.replace('_', ' ')}</label>
                   <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{val === null || val === undefined ? '—' : val.toString()}</p>
                 </div>
               );
            })}
         </div>
      </div>
    </motion.div>
  );
};

export default DetailPage;

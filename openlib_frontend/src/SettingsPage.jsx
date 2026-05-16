import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, Building, Shield, Palette, Save, 
  RefreshCw, Globe, Mail, MapPin, DollarSign, Clock, Book
} from 'lucide-react';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'general', label: 'Cấu hình chung', icon: Building },
    { id: 'borrowing', label: 'Chính sách mượn trả', icon: Book },
    { id: 'security', label: 'Bảo mật', icon: Shield },
    { id: 'appearance', label: 'Giao diện', icon: Palette },
  ];

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('✅ Đã lưu cấu hình thành công!');
    }, 1500);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="settings-form">
            <div className="settings-section">
              <h3>📇 Thông tin thư viện</h3>
              <div className="settings-grid">
                <div className="input-group">
                  <label><Building size={14}/> Tên thư viện</label>
                  <input type="text" className="custom-input" defaultValue="OpenLib Professional" />
                </div>
                <div className="input-group">
                  <label><Mail size={14}/> Email hệ thống</label>
                  <input type="email" className="custom-input" defaultValue="admin@openlib.io" />
                </div>
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label><MapPin size={14}/> Địa chỉ trụ sở</label>
                  <input type="text" className="custom-input" defaultValue="123 Đường Sách, Quận 1, TP. Hồ Chí Minh" />
                </div>
              </div>
            </div>
          </div>
        );
      case 'borrowing':
        return (
          <div className="settings-form">
            <div className="settings-section">
              <h3>📖 Quy định mượn & phạt</h3>
              <div className="settings-grid">
                <div className="input-group">
                  <label><Clock size={14}/> Thời gian mượn tối đa (ngày)</label>
                  <input type="number" className="custom-input" defaultValue={14} />
                </div>
                <div className="input-group">
                  <label><Book size={14}/> Số sách tối đa/người</label>
                  <input type="number" className="custom-input" defaultValue={3} />
                </div>
                <div className="input-group">
                  <label><DollarSign size={14}/> Tiền phạt trả muộn (VNĐ/ngày)</label>
                  <input type="number" className="custom-input" defaultValue={5000} />
                </div>
                <div className="input-group">
                  <label><RefreshCw size={14}/> Số lần gia hạn tối đa</label>
                  <input type="number" className="custom-input" defaultValue={1} />
                </div>
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="settings-form">
            <div className="settings-section">
              <h3>🔐 Bảo mật tài khoản</h3>
              <div className="settings-grid">
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Mật khẩu hiện tại</label>
                  <input type="password" className="custom-input" placeholder="••••••••" />
                </div>
                <div className="input-group">
                  <label>Mật khẩu mới</label>
                  <input type="password" className="custom-input" placeholder="Nhập mật khẩu mới" />
                </div>
                <div className="input-group">
                  <label>Xác nhận mật khẩu</label>
                  <input type="password" className="custom-input" placeholder="Nhập lại mật khẩu mới" />
                </div>
              </div>
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="settings-form">
            <div className="settings-section">
              <h3>🎨 Tùy chỉnh hiển thị</h3>
              <div className="settings-grid">
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Màu sắc chủ đạo (Accent Color)</label>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    {['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'].map(color => (
                      <div 
                        key={color} 
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '10px', 
                          background: color, 
                          cursor: 'pointer',
                          border: '2px solid transparent',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="input-group">
                  <label>Chế độ hiệu ứng Glassmorphism</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                     <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px' }} />
                     <span>Bật hiệu ứng mờ hậu cảnh</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="settings-page">
      <div className="settings-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="icon-badge"><SettingsIcon size={24} /></div>
          <div>
            <h2 style={{ margin: 0 }}>Thiết lập hệ thống</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Cấu hình các tham số và chính sách của thư viện</p>
          </div>
        </div>
        <button className="btn btn-success" onClick={handleSave} disabled={saving}>
          {saving ? <RefreshCw className="spinner" size={18} /> : <Save size={18} />}
          {saving ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}
        </button>
      </div>

      <div className="settings-body">
        <div className="settings-sidebar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <div 
                key={tab.id} 
                className={`settings-tab-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </div>
            );
          })}
        </div>
        <div className="settings-content">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;

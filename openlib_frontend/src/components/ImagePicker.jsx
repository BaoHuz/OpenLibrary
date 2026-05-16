import React, { useRef, useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { getImageUrl } from '../utils/imageUrl';

const ImagePicker = ({ value, onChange }) => {
  const fileRef = useRef();
  const [preview, setPreview] = useState(value || '');

  useEffect(() => { 
    if (typeof value === 'string') {
      setPreview(value || ''); 
    }
  }, [value]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const localURL = URL.createObjectURL(file);
    setPreview(localURL);
    onChange(file);
  };

  const clearImage = (e) => {
    e.stopPropagation();
    setPreview('');
    onChange(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
      <div
        onClick={() => fileRef.current.click()}
        style={{
          width: '160px', height: '240px', borderRadius: '12px',
          border: '2px dashed var(--card-border)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', background: 'var(--input-bg)', position: 'relative',
          transition: 'border-color .2s', boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          flexShrink: 0
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--card-border)'}
      >
        {preview ? (
          <>
            <img src={getImageUrl(preview)} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', opacity: 0, transition: 'opacity .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', gap: '0.5rem', fontSize: '0.95rem', fontWeight: 700 }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0}
            >
              <Upload size={18} /> Thay ảnh
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <ImageIcon size={32} style={{ display: 'block', margin: '0 auto 0.5rem', opacity: 0.4 }} /> Trống
          </div>
        )}
        
        {preview && (
          <button 
            onClick={clearImage}
            style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  );
};

export default ImagePicker;

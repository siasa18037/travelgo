'use client';

import { useState } from 'react';
import UploadButton from '@/components/UploadButton'; 

export default function UploadPage() {
  const [imageUrl, setImageUrl] = useState('');

  const handleUploadComplete = (url) => {
    setImageUrl(url);
    console.log('รูปที่อัปโหลดแล้ว:', url);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '2rem' }}>
      <UploadButton onUploaded={handleUploadComplete} />

      {imageUrl && (
        <div style={{ marginTop: '2rem' }}>
          <p>รูปที่อัปโหลดแล้ว:</p>
          <img src={imageUrl} alt="Uploaded" style={{ maxWidth: '100%', borderRadius: '8px' }} />
        </div>
      )}
    </div>
  );
}

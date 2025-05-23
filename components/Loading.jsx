import React from 'react';

const Loading = () => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="spinner-border spinner-border-sm me-2" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">กำลังโหลด...</span>
      </div>
      <p className="mt-3">กำลังโหลด...</p>
    </div>
  );
};

export default Loading;

import React from 'react';
import './WelcomeModal.css';

const WelcomeModal = ({ onClose }) => {
  return (
    <div className="welcome-modal-overlay" onClick={onClose}>
      <div className="welcome-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="welcome-modal-icon">
          <span role="img" aria-label="trophy">🏆</span>
        </div>
        <h1 className="welcome-modal-title">أهلاً وسهلاً</h1>
        <div className="welcome-modal-body">
          <p className="main-text">في الموقع الرسمي لجائزة عائلة الباكرمان</p>
          <p className="secondary-text">في دورتها الثانية عشر</p>
          <p className="third-text">الخاص بطلاب وطالبات الباكرمان</p>
        </div>
        <div className="welcome-modal-footer">
          <p>اضغط في أي مكان للمتابعة</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;

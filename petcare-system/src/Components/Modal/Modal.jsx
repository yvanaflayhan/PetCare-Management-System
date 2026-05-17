import React from 'react';
import styles from './Modal.module.css';

function Modal({ title, onClose, children }) {
  return (
    <div className={styles.backdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.title}>{title}</div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;
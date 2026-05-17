import React from 'react';
import styles from './Btn.module.css';

function Btn({ children, onClick, variant, type, disabled }) {
  return (
    <button
      type={type || 'button'}
      className={`${styles.btn} ${variant === 'secondary' ? styles.secondary : ''} ${variant === 'danger' ? styles.danger : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Btn;
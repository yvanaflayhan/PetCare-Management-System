import React from 'react';
import styles from './Formfield.module.css';

function FormField({ label, children, full }) {
  return (
    <div className={`${styles.group} ${full ? styles.full : ''}`}>
      <label className={styles.label}>{label}</label>
      {children}
    </div>
  );
}

export default FormField;
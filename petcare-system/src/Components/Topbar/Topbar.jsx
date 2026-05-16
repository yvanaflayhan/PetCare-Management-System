import React from 'react';
import styles from './Topbar.module.css';

function Topbar({ onMenuClick }) {
  return (
    <div className={styles.topbar}>

      <button className={styles.hamburger} onClick={onMenuClick}>
        <span className={styles.line} />
        <span className={styles.line} />
        <span className={styles.line} />
      </button>

      <div className={styles.brand}>
        <span className={styles.brandThe}>The</span>
        <span className={styles.brandMain}>Vet Method 🐾</span>
      </div>

    </div>
  );
}

export default Topbar;
import React, { useEffect, useState } from 'react';
import styles from './SplashScreen.module.css';
import petsBg from '../../Assets/pets-bg.jpeg';

function Splashscreen({ onDone }) {
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    const hideTimer = setTimeout(() => setHiding(true), 3200);
    const doneTimer = setTimeout(() => onDone(), 4200);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div className={`${styles.wrapper} ${hiding ? styles.wrapperHiding : ''}`}>

      <div
        className={styles.background}
        style={{ backgroundImage: `url(${petsBg})` }}
      />

      <div className={styles.overlay} />

      <div className={styles.content}>
        <span className={styles.emojis}>🐾 🐶 🐱 🐰 🐾</span>
        <span className={styles.the}>The</span>
        <span className={styles.title}>Vet Method</span>
        <p className={styles.tagline}>Veterinary Management System</p>

        <div className={styles.dots}>
          <div className={styles.dot} />
          <div className={styles.dot} />
          <div className={styles.dot} />
        </div>
      </div>

    </div>
  );
}

export default Splashscreen;
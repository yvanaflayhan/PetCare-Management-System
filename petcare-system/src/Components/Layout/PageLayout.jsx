import React from 'react';
import styles from './PageLayout.module.css';

function PageLayout({ title, subtitle, action, children }) {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        
        <div className={styles.header}>
          
          <div className={styles.headerText}>
            <div className={styles.title}>{title}</div>
            {subtitle && (
              <div className={styles.sub}>{subtitle}</div>
            )}
          </div>

          {action && (
            <div className={styles.action}>
              {action}
            </div>
          )}

        </div>

        <div className={styles.body}>
          {children}
        </div>

      </div>
    </div>
  );
}

export default PageLayout;
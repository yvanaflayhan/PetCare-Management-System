import React from 'react';
import styles from './SideNav.module.css';

const NAV_LINKS = [
  { id: 'dashboard',     icon: '', label: 'Dashboard'        },
  { id: 'patients',      icon: '', label: 'Patients'         },
  { id: 'veterinarians', icon: '', label: 'Veterinarians'   },
  { id: 'appointments',  icon: '', label: 'Appointments'     },
  { id: 'records',       icon: '', label: 'Medical Records'  },
  { id: 'archive',       icon: '', label: 'Archive'          },
];

function SideNav({ activePage, onNavigate, onClose }) {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.drawerTop}>
          <span className={styles.drawerTitle}>The</span>
          <span className={styles.drawerSubtitle}>Vet Method 🐾</span>
        </div>
        {NAV_LINKS.map((link) => (
          <button
            key={link.id}
            className={`${styles.navItem} ${activePage === link.id ? styles.navItemActive : ''}`}
            onClick={() => onNavigate(link.id)}
          >
            <span className={styles.navIcon}>{link.icon}</span>
            <span className={styles.navLabel}>{link.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default SideNav;
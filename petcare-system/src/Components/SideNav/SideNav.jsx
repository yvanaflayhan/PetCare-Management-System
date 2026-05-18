import React from 'react';
import styles from './SideNav.module.css';

import {
  LayoutDashboard,
  PawPrint,
  Stethoscope,
  Calendar,
  FileText,
  Archive
} from 'lucide-react';

const NAV_LINKS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'patients', label: 'Patients', icon: PawPrint },
  { id: 'veterinarians', label: 'Veterinarians', icon: Stethoscope },
  { id: 'appointments', label: 'Appointments', icon: Calendar },
  { id: 'records', label: 'Medical Records', icon: FileText },
  { id: 'archive', label: 'Archive', icon: Archive },
];

function SideNav({ activePage, onNavigate, onClose }) {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.drawer}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.drawerTop}>
          <span className={styles.drawerTitle}>The</span>
          <span className={styles.drawerSubtitle}>Vet Method</span>
        </div>

        {NAV_LINKS.map((link) => {
          const Icon = link.icon;

          return (
            <button
              key={link.id}
              className={`${styles.navItem} ${
                activePage === link.id ? styles.navItemActive : ''
              }`}
              onClick={() => onNavigate(link.id)}
            >
              <span className={styles.navIcon}>
                <Icon size={18} />
              </span>

              <span className={styles.navLabel}>
                {link.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SideNav;
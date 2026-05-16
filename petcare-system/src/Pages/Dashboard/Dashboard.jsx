import React, { useState } from 'react';
import styles from './Dashboard.module.css';

const TODAY = new Date().toISOString().split('T')[0];

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// ─── small helpers ────────────────────────────────────────────────────────────

function getInitials(v) { return `${v.firstName[0]}${v.lastName[0]}`.toUpperCase(); }

function getTodayLabel() {
  const d = new Date();
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

const STATUS_STYLE = {
  'Waiting':        { background: '#fff0cc', color: '#7a5000' },
  'In Examination': { background: '#d6f5e3', color: '#0e6e3a' },
  'Done':           { background: '#e8f4fb', color: '#0d6eaa' },
  'Archived':       { background: '#ececec', color: '#555'    },
  'Pending':        { background: '#fff4e0', color: '#7a5000' },
  'Confirmed':      { background: '#d6f5e3', color: '#0e6e3a' },
  'Completed':      { background: '#ececec', color: '#555'    },
};

// ─── attendance modal ─────────────────────────────────────────────────────────

function AttendanceModal({ vets, attendance, onSave, onClose }) {
  const [local, setLocal] = useState(() => {
    const init = {};
    vets.forEach((v) => { init[v.id] = attendance[v.id] ?? false; });
    return init;
  });

  function toggle(id) { setLocal({ ...local, [id]: !local[id] }); }

  function handleSave() { onSave(local); onClose(); }

  return (
    <div className={styles.modalBackdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>Staff Attendance — {getTodayLabel()}</div>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        <p className={styles.modalSub}>Mark who is present at the clinic today. This is saved automatically with today's date.</p>
        <div className={styles.vetAttList}>
          {vets.map((v) => (
            <div key={v.id} className={`${styles.vetAttRow} ${local[v.id] ? styles.vetAttPresent : ''}`}>
              <div className={styles.vetAttAvatar} style={{ background: local[v.id] ? '#0d2b36' : '#e2edf1', color: local[v.id] ? '#fff' : '#7a9baa' }}>
                {getInitials(v)}
              </div>
              <div className={styles.vetAttInfo}>
                <div className={styles.vetAttName}>Dr. {v.firstName} {v.lastName}</div>
                <div className={styles.vetAttRole}>{v.role} · {v.specialty}</div>
              </div>
              <button
                className={`${styles.toggleBtn} ${local[v.id] ? styles.toggleBtnOn : styles.toggleBtnOff}`}
                onClick={() => toggle(v.id)}
              >
                {local[v.id] ? '✓ Present' : 'Absent'}
              </button>
            </div>
          ))}
          {vets.length === 0 && <div className={styles.emptyMsg}>No staff members added yet.</div>}
        </div>
        <div className={styles.modalActions}>
          <button className={styles.btnSecondary} onClick={onClose}>Cancel</button>
          <button className={styles.btnPrimary} onClick={handleSave}>Save Attendance</button>
        </div>
      </div>
    </div>
  );
}

// ─── main dashboard ───────────────────────────────────────────────────────────

function Dashboard({ pets, vets, appointments, records }) {
  const [showAttendance, setShowAttendance] = useState(false);
  const [attendanceLog, setAttendanceLog]   = useState({});  // { date: { vetId: bool } }

  const todayAttendance = attendanceLog[TODAY] || {};
  const presentToday    = vets.filter((v) => todayAttendance[v.id]).length;
  const attendanceSaved = !!attendanceLog[TODAY];

  function handleSaveAttendance(data) {
    setAttendanceLog({ ...attendanceLog, [TODAY]: data });
  }

  // stats
  const totalPets    = pets.filter((p) => p.status !== 'Archived').length;
  const waiting      = pets.filter((p) => p.status === 'Waiting').length;
  const inExam       = pets.filter((p) => p.status === 'In Examination').length;
  const inHouse      = pets.filter((p) => p.status === 'Waiting' || p.status === 'In Examination').length;
  const stayingPets  = pets.filter((p) => p.staying === true);
  const todayAppts   = appointments.filter((a) => a.date === TODAY);
  const recentRecs   = [...records].reverse().slice(0, 4);
  const monthName    = MONTH_NAMES[new Date().getMonth()];

  return (
    <div className={styles.page}>

      {/* ── BANNER ── */}
      <div className={styles.banner}>
        <div className={styles.bannerInner}>
          <div className={styles.bannerDatePill}>{getTodayLabel()}</div>
          <div className={styles.bannerDivider} />
          <div className={styles.bannerStats}>
            <div className={styles.bannerStat}>
              <span className={styles.bannerStatNum}>{inHouse}</span>
              <span className={styles.bannerStatLabel}>In Clinic</span>
            </div>
            <div className={styles.bannerDot} />
            <div className={styles.bannerStat}>
              <span className={styles.bannerStatNum}>{todayAppts.length}</span>
              <span className={styles.bannerStatLabel}>Appointments</span>
            </div>
            <div className={styles.bannerDot} />
            <div className={styles.bannerStat}>
              <span className={styles.bannerStatNum}>{presentToday}/{vets.length}</span>
              <span className={styles.bannerStatLabel}>Staff Present</span>
            </div>
          </div>
          <div className={styles.bannerDivider} />
          <button className={styles.attendanceBtn} onClick={() => setShowAttendance(true)}>
            <span className={styles.attendanceBtnDot} style={{ background: attendanceSaved ? '#34d399' : '#f59e42' }} />
            {attendanceSaved ? 'Attendance Saved ✓' : 'Mark Attendance'}
          </button>
        </div>
      </div>

      <div className={styles.content}>

        {/* ── STAT CARDS ── */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard} style={{ '--accent': '#3ec8e0' }}>
            <div className={styles.statTop}>
              <div className={styles.statIconCircle} style={{ background: 'rgba(62,200,224,0.12)', color: '#3ec8e0' }}>🐾</div>
              <div className={styles.statDelta}>Active</div>
            </div>
            <div className={styles.statNum}>{totalPets}</div>
            <div className={styles.statLabel}>Total Patients</div>
            <div className={styles.statBar}><div className={styles.statBarFill} style={{ width: '100%', background: '#3ec8e0' }} /></div>
          </div>

          <div className={styles.statCard} style={{ '--accent': '#f59e42' }}>
            <div className={styles.statTop}>
              <div className={styles.statIconCircle} style={{ background: 'rgba(245,158,66,0.12)', color: '#f59e42' }}>⏳</div>
              <div className={styles.statDelta}>Waiting</div>
            </div>
            <div className={styles.statNum}>{waiting}</div>
            <div className={styles.statLabel}>In Waiting Room</div>
            <div className={styles.statBar}><div className={styles.statBarFill} style={{ width: totalPets ? `${(waiting/totalPets)*100}%` : '0%', background: '#f59e42' }} /></div>
          </div>

          <div className={styles.statCard} style={{ '--accent': '#34d399' }}>
            <div className={styles.statTop}>
              <div className={styles.statIconCircle} style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399' }}>🩺</div>
              <div className={styles.statDelta}>Now</div>
            </div>
            <div className={styles.statNum}>{inExam}</div>
            <div className={styles.statLabel}>In Examination</div>
            <div className={styles.statBar}><div className={styles.statBarFill} style={{ width: totalPets ? `${(inExam/totalPets)*100}%` : '0%', background: '#34d399' }} /></div>
          </div>

          <div className={styles.statCard} style={{ '--accent': '#a78bfa' }}>
            <div className={styles.statTop}>
              <div className={styles.statIconCircle} style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa' }}>👨‍⚕️</div>
              <div className={styles.statDelta}>{presentToday} present</div>
            </div>
            <div className={styles.statNum}>{vets.length}</div>
            <div className={styles.statLabel}>Veterinarians</div>
            <div className={styles.statBar}><div className={styles.statBarFill} style={{ width: vets.length ? `${(presentToday/vets.length)*100}%` : '0%', background: '#a78bfa' }} /></div>
          </div>

          <div className={styles.statCard} style={{ '--accent': '#f472b6' }}>
            <div className={styles.statTop}>
              <div className={styles.statIconCircle} style={{ background: 'rgba(244,114,182,0.12)', color: '#f472b6' }}>📅</div>
              <div className={styles.statDelta}>Today</div>
            </div>
            <div className={styles.statNum}>{todayAppts.length}</div>
            <div className={styles.statLabel}>Appointments</div>
            <div className={styles.statBar}><div className={styles.statBarFill} style={{ width: todayAppts.length ? '70%' : '0%', background: '#f472b6' }} /></div>
          </div>

          <div className={styles.statCard} style={{ '--accent': '#60a5fa' }}>
            <div className={styles.statTop}>
              <div className={styles.statIconCircle} style={{ background: 'rgba(96,165,250,0.12)', color: '#60a5fa' }}>📋</div>
              <div className={styles.statDelta}>Total</div>
            </div>
            <div className={styles.statNum}>{records.length}</div>
            <div className={styles.statLabel}>Medical Records</div>
            <div className={styles.statBar}><div className={styles.statBarFill} style={{ width: records.length ? '80%' : '0%', background: '#60a5fa' }} /></div>
          </div>
        </div>

        {/* ── MIDDLE ROW ── */}
        <div className={styles.midRow}>

          {/* staff today */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitle}>Staff Today</div>
              <span className={styles.panelPill}>{monthName}</span>
            </div>
            {vets.length === 0 && <div className={styles.emptyMsg}>No staff added yet.</div>}
            {vets.map((v) => {
              const present = !!todayAttendance[v.id];
              return (
                <div key={v.id} className={styles.staffRow}>
                  <div className={styles.staffAvatar} style={{ background: present ? '#0d2b36' : '#e8f0f4', color: present ? '#fff' : '#7a9baa' }}>
                    {getInitials(v)}
                  </div>
                  <div className={styles.staffInfo}>
                    <div className={styles.staffName}>Dr. {v.firstName} {v.lastName}</div>
                    <div className={styles.staffRole}>{v.specialty}</div>
                  </div>
                  <div className={`${styles.presentDot} ${present ? styles.presentDotOn : styles.presentDotOff}`}>
                    {present ? 'Present' : 'Absent'}
                  </div>
                </div>
              );
            })}
            {!attendanceSaved && vets.length > 0 && (
              <button className={styles.markBtn} onClick={() => setShowAttendance(true)}>
                Mark today's attendance →
              </button>
            )}
          </div>

          {/* patients in clinic */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitle}>Patients in Clinic</div>
              <span className={styles.panelPill}>{inHouse} active</span>
            </div>
            {inHouse === 0 && <div className={styles.emptyMsg}>No active patients right now.</div>}
            {pets.filter((p) => p.status === 'Waiting' || p.status === 'In Examination').map((pet) => {
              const vet = vets.find((v) => v.id === pet.assignedVetId);
              const sc  = STATUS_STYLE[pet.status];
              return (
                <div key={pet.id} className={styles.patientRow}>
                  <span className={styles.patientEmoji}>{pet.species}</span>
                  <div className={styles.patientInfo}>
                    <div className={styles.patientName}>{pet.name}</div>
                    <div className={styles.patientMeta}>{pet.owner}{vet ? ` · Dr. ${vet.lastName}` : ''}</div>
                  </div>
                  <span className={styles.badge} style={sc}>{pet.status}</span>
                </div>
              );
            })}
          </div>

        </div>

        {/* ── BOTTOM ROW ── */}
        <div className={styles.bottomRow}>

          {/* today's appointments */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitle}>Today's Appointments</div>
              <span className={styles.panelPill}>{getTodayLabel()}</span>
            </div>
            {todayAppts.length === 0 && <div className={styles.emptyMsg}>No appointments scheduled today.</div>}
            {todayAppts.map((appt) => {
              const pet = pets.find((p) => p.id === appt.petId);
              const vet = vets.find((v) => v.id === appt.vetId);
              const sc  = STATUS_STYLE[appt.status] || STATUS_STYLE['Pending'];
              return (
                <div key={appt.id} className={styles.apptRow}>
                  <div className={styles.apptTime}>{appt.time}</div>
                  <span className={styles.apptEmoji}>{pet?.species}</span>
                  <div className={styles.apptInfo}>
                    <div className={styles.apptName}>{pet?.name}</div>
                    <div className={styles.apptMeta}>Dr. {vet?.lastName}</div>
                  </div>
                  <span className={styles.badge} style={sc}>{appt.status}</span>
                </div>
              );
            })}
          </div>

          {/* recent records */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitle}>Recent Examinations</div>
              <span className={styles.panelPill}>{records.length} total</span>
            </div>
            {recentRecs.length === 0 && <div className={styles.emptyMsg}>No records yet.</div>}
            {recentRecs.map((rec) => {
              const pet = pets.find((p) => p.id === rec.petId);
              const vet = vets.find((v) => v.id === rec.vetId);
              return (
                <div key={rec.id} className={styles.recRow}>
                  <span className={styles.recEmoji}>{pet?.species}</span>
                  <div className={styles.recInfo}>
                    <div className={styles.recName}>{pet?.name} <span className={styles.recDiag}>— {rec.diagnosis}</span></div>
                    <div className={styles.recMeta}>Dr. {vet?.lastName} · {rec.date}</div>
                  </div>
                  <span className={styles.badge} style={{ background: '#e8f4fb', color: '#0d6eaa' }}>Done</span>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {showAttendance && (
        <AttendanceModal
          vets={vets}
          attendance={todayAttendance}
          onSave={handleSaveAttendance}
          onClose={() => setShowAttendance(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;
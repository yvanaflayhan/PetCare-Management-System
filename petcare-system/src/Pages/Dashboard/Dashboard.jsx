import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import Card from '../../Components/Card/Card';
import { PawPrint, Stethoscope, CalendarDays } from 'lucide-react';
import { getTodayAttendance, saveAttendance } from '../../Services/api';

const TODAY = new Date().toISOString().split('T')[0];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'
];

function getInitials(name) {
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function getTodayLabel() {
  const d = new Date();
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function getPetEmoji(type) {
  if (!type) return '🐾';

  const t = type.toLowerCase();

  // Common pets
  if (t.includes('dog')) return '🐶';
  if (t.includes('cat')) return '🐱';
  if (t.includes('rabbit') || t.includes('bunny')) return '🐰';
  if (t.includes('hamster')) return '🐹';
  if (t.includes('bird') || t.includes('parrot')) return '🐦';

  // Farm animals
  if (t.includes('cow')) return '🐄';
  if (t.includes('goat')) return '🐐';
  if (t.includes('sheep')) return '🐑';
  if (t.includes('chicken') || t.includes('hen')) return '🐔';
  if (t.includes('duck')) return '🦆';
  if (t.includes('horse')) return '🐴';
  if (t.includes('pig')) return '🐷';

  // Exotic
  if (t.includes('turtle')) return '🐢';
  if (t.includes('snake')) return '🐍';
  if (t.includes('lizard')) return '🦎';
  if (t.includes('fish')) return '🐠';

  return '🐾';
}

const STATUS_STYLE = {
  Waiting: { background: '#fff0cc', color: '#7a5000' },
  'In Examination': { background: '#d6f5e3', color: '#0e6e3a' },
  Done: { background: '#e8f4fb', color: '#0d6eaa' },
  Archived: { background: '#ececec', color: '#555' },
  Pending: { background: '#fff4e0', color: '#7a5000' },
  Scheduled: { background: '#fff4e0', color: '#7a5000' },
  Confirmed: { background: '#d6f5e3', color: '#0e6e3a' },
  Completed: { background: '#ececec', color: '#555' },
  Cancelled: { background: '#ececec', color: '#555' },
};

/* ── ATTENDANCE MODAL (your exact style) ──────────────────────────────────── */

function AttendanceModal({ vets, attendance, onSave, onClose }) {
  const [local, setLocal] = useState(() => {
    const init = {};
    vets.forEach((v) => { init[v.id] = attendance[v.id] ?? false; });
    return init;
  });

  function toggle(id) { setLocal({ ...local, [id]: !local[id] }); }

  async function handleSave() {
    const entries = Object.keys(local).map((id) => ({
      vetId: parseInt(id),
      isPresent: local[id],
    }));
    await onSave(entries);
    onClose();
  }

  return (
    <div
      className={styles.modalBackdrop}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.modal}>

        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            Staff Attendance — {getTodayLabel()}
          </div>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        <p className={styles.modalSub}>
          Mark who is present at the clinic today.
        </p>

        <div className={styles.vetAttList}>
          {vets.length === 0 && (
            <div className={styles.emptyMsg}>No staff members added yet.</div>
          )}

          {vets.map((v) => (
            <Card
              key={v.id}
              className={local[v.id] ? styles.vetAttPresent : ''}
            >
              <div className={styles.vetAttRow}>

                <div
                  className={styles.vetAttAvatar}
                  style={{
                    background: local[v.id] ? '#0d2b36' : '#e2edf1',
                    color: local[v.id] ? '#fff' : '#7a9baa',
                  }}
                >
                  {getInitials(v.name)}
                </div>

                <div className={styles.vetAttInfo}>
                  <div className={styles.vetAttName}>{v.name}</div>
                  <div className={styles.vetAttRole}>
                    {v.role} · {v.specialization || 'General'}
                  </div>
                </div>

                <button
                  className={`${styles.toggleBtn} ${local[v.id] ? styles.toggleBtnOn : styles.toggleBtnOff
                    }`}
                  onClick={() => toggle(v.id)}
                >
                  {local[v.id] ? '✓ Present' : 'Absent'}
                </button>

              </div>
            </Card>
          ))}
        </div>

        <div className={styles.modalActions}>
          <button className={styles.btnSecondary} onClick={onClose}>Cancel</button>
          <button className={styles.btnPrimary} onClick={handleSave}>Save Attendance</button>
        </div>

      </div>
    </div>
  );
}

/* ── MAIN DASHBOARD (your exact style + real data) ────────────────────────── */

function Dashboard({ pets, vets, appointments, records, petStatuses }) {
  const [showAttendance, setShowAttendance] = useState(false);
  const [attendanceLog, setAttendanceLog] = useState({});
  const [attendanceSaved, setAttendanceSaved] = useState(false);

  // load today's attendance from backend on mount
  useEffect(() => {
    getTodayAttendance()
      .then((data) => {
        const log = {};
        data.forEach((a) => { log[a.vetId] = a.isPresent; });
        setAttendanceLog({ [TODAY]: log });
        if (data.length > 0) setAttendanceSaved(true);
      })
      .catch(() => { });
  }, []);

  async function handleSaveAttendance(entries) {
    await saveAttendance(entries);
    const log = {};
    entries.forEach((e) => { log[e.vetId] = e.isPresent; });
    setAttendanceLog({ [TODAY]: log });
    setAttendanceSaved(true);
    window.dispatchEvent(new Event("attendance-updated"));
  }

  const todayAttendance = attendanceLog[TODAY] || {};
  const presentToday = vets.filter((v) => todayAttendance[v.id]).length;

  // merge pets with their real statuses from backend
  const petsWithStatus = pets.map((pet) => {
    console.log(pet);
    const ps = petStatuses.find((s) => s.petId === pet.id);
    return { ...pet, currentStatus: ps?.status || 'Waiting', assignedVetId: ps?.assignedVetId };
  });

  /* ── STATS ── */
  const totalPets = petsWithStatus.filter((p) => p.currentStatus !== 'Archived').length;
  const waiting = petsWithStatus.filter((p) => p.currentStatus === 'Waiting').length;
  const inExam = petsWithStatus.filter((p) => p.currentStatus === 'In Examination').length;
  const inHouse = waiting + inExam;

  const todayAppts = appointments.filter((a) => {
    if (!a.date) return false;
    return new Date(a.date).toISOString().split('T')[0] === TODAY;
  });

  const recentRecs = [...records].reverse().slice(0, 4);
  const monthName = MONTH_NAMES[new Date().getMonth()];

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

          <button
            className={styles.attendanceBtn}
            onClick={() => setShowAttendance(true)}
          >
            <span
              className={styles.attendanceBtnDot}
              style={{ background: attendanceSaved ? '#34d399' : '#f59e42' }}
            />
            {attendanceSaved ? 'Attendance Saved ✓' : 'Mark Attendance'}
          </button>

        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className={styles.content}>

        {/* ── 3 STAT CARDS (your exact layout) ── */}
        <div className={styles.statsGrid}>

          <Card className={styles.statCard} style={{ '--accent': '#3bb8d4' }}>
            <div className={styles.statTop}>
              <div
                className={styles.statIconCircle}
                style={{ background: 'rgba(59,184,212,0.12)', color: '#3bb8d4' }}
              >
                <PawPrint size={30} strokeWidth={2.2} />
              </div>
              <div className={styles.statDelta}>Active Patients</div>
            </div>
            <div className={styles.statNum}>{totalPets}</div>
            <div className={styles.statLabel}>Total pets currently registered in clinic</div>
            <div className={styles.statBar}>
              <div className={styles.statBarFill} style={{ width: '100%', background: '#3bb8d4' }} />
            </div>
          </Card>

          <Card className={styles.statCard} style={{ '--accent': '#38b98a' }}>
            <div className={styles.statTop}>
              <div
                className={styles.statIconCircle}
                style={{ background: 'rgba(56,185,138,0.12)', color: '#38b98a' }}
              >
                <Stethoscope size={28} strokeWidth={2.2} />
              </div>
              <div className={styles.statDelta}>In Examination</div>
            </div>
            <div className={styles.statNum}>{inExam}</div>
            <div className={styles.statLabel}>Patients currently inside examination rooms</div>
            <div className={styles.statBar}>
              <div
                className={styles.statBarFill}
                style={{
                  width: totalPets ? `${(inExam / totalPets) * 100}%` : '0%',
                  background: '#38b98a',
                }}
              />
            </div>
          </Card>

          <Card className={styles.statCard} style={{ '--accent': '#8b7cf6' }}>
            <div className={styles.statTop}>
              <div
                className={styles.statIconCircle}
                style={{ background: 'rgba(139,124,246,0.12)', color: '#8b7cf6' }}
              >
                <CalendarDays size={28} strokeWidth={2.2} />
              </div>
              <div className={styles.statDelta}>Appointments Today</div>
            </div>
            <div className={styles.statNum}>{todayAppts.length}</div>
            <div className={styles.statLabel}>Scheduled visits for today</div>
            <div className={styles.statBar}>
              <div
                className={styles.statBarFill}
                style={{
                  width: todayAppts.length ? '75%' : '0%',
                  background: '#8b7cf6',
                }}
              />
            </div>
          </Card>

        </div>

        {/* ── STAFF ── */}
        <div className={styles.midRow}>
          <Card className={styles.panel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitle}>Staff Today</div>
              <span className={styles.panelPill}>{monthName}</span>
            </div>

            {vets.map((v) => {
              const present = !!todayAttendance[v.id];
              return (
                <div key={v.id} className={styles.staffRow}>
                  <div
                    className={styles.staffAvatar}
                    style={{
                      background: present ? '#0d2b36' : '#e8f0f4',
                      color: present ? '#fff' : '#7a9baa',
                    }}
                  >
                    {getInitials(v.name)}
                  </div>
                  <div className={styles.staffInfo}>
                    <div className={styles.staffName}>{v.name}</div>
                    <div className={styles.staffRole}>{v.specialization || 'General'}</div>
                  </div>
                  <div className={`${styles.presentDot} ${present ? styles.presentDotOn : styles.presentDotOff}`}>
                    {present ? 'Present' : 'Absent'}
                  </div>
                </div>
              );
            })}

          </Card>
        </div>

        {/* ── BOTTOM ROW ── */}
        <div className={styles.bottomRow}>

          {/* PATIENTS IN CLINIC */}
          <Card className={styles.panel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitle}>Patients in Clinic</div>
              <span className={styles.panelPill}>{inHouse} active</span>
            </div>

            {inHouse === 0 && <div className={styles.emptyMsg}>No active patients right now.</div>}

            {petsWithStatus
              .filter((p) => p.currentStatus === 'Waiting' || p.currentStatus === 'In Examination')
              .map((pet) => {
                const vet = vets.find((v) => v.id === pet.assignedVetId);
                const sc = STATUS_STYLE[pet.currentStatus];
                return (
                  <div key={pet.id} className={styles.patientRow}>
                    <div className={styles.patientEmoji}>
                      {getPetEmoji(pet?.petType?.typeName)}
                    </div>
                    <div className={styles.patientInfo}>
                      <div className={styles.patientName}>{pet.name}</div>
                      <div className={styles.patientMeta}>
                        {pet.owner?.name || '—'}
                        {vet ? ` · ${vet.name}` : ''}
                      </div>
                    </div>
                    <span className={styles.badge} style={sc}>{pet.currentStatus}</span>
                  </div>
                );
              })}
          </Card>

          {/* TODAY'S APPOINTMENTS */}
          <Card className={styles.panel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitle}>Today's Appointments</div>
              <span className={styles.panelPill}>{getTodayLabel()}</span>
            </div>

            {todayAppts.length === 0 && <div className={styles.emptyMsg}>No appointments today.</div>}

            {todayAppts.map((appt) => {
              const pet = pets.find((p) => p.id === appt.petId);
              const vet = vets.find((v) => v.id === appt.vetId);
              const time = appt.date
                ? new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '—';
              const sc = STATUS_STYLE[appt.status] || STATUS_STYLE.Scheduled;
              return (
                <div key={appt.id} className={styles.apptRow}>
                  <div className={styles.apptTime}>{time}</div>
                  <div className={styles.apptEmoji}>
                    {getPetEmoji(pet?.petType?.typeName)}
                  </div>
                  <div className={styles.apptInfo}>
                    <div className={styles.apptName}>{pet?.name || 'Unknown Pet'}</div>
                    <div className={styles.apptMeta}>{vet ? vet.name : 'No veterinarian'}</div>
                  </div>
                  <span className={styles.badge} style={sc}>{appt.status}</span>
                </div>
              );
            })}
          </Card>

          {/* RECENT EXAMINATIONS */}
          <Card className={styles.panel}>
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
                  <div className={styles.recEmoji}>
                    {getPetEmoji(pet?.petType?.typeName)}
                  </div>
                  <div className={styles.recInfo}>
                    <div className={styles.recName}>
                      {pet?.name || '—'}
                      <span className={styles.recDiag}> — {rec.diagnosis}</span>
                    </div>
                    <div className={styles.recMeta}>
                      {vet?.name || '—'} · {rec.examinationDate}
                    </div>
                  </div>
                  <span className={styles.badge} style={{ background: '#e8f4fb', color: '#0d6eaa' }}>
                    Done
                  </span>
                </div>
              );
            })}
          </Card>

        </div>
      </div>

      {/* MODAL */}
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
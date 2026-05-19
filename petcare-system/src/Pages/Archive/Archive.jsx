// Archive.jsx
import React, { useState, useEffect, useMemo } from 'react';
import styles from './Archive.module.css';
import Card from '../../Components/Card/Card';
import PageLayout from '../../Components/Layout/PageLayout';
import { getArchivedVets } from '../../Services/api';

/* ─────────────── Helpers ─────────────── */

function getPetEmoji(type) {
  if (!type) return '🐾';
  const t = type.toLowerCase();
  if (t.includes('dog')) return '🐶';
  if (t.includes('cat')) return '🐱';
  if (t.includes('rabbit') || t.includes('bunny')) return '🐰';
  if (t.includes('hamster')) return '🐹';
  if (t.includes('bird') || t.includes('parrot')) return '🐦';
  if (t.includes('cow')) return '🐄';
  if (t.includes('goat')) return '🐐';
  if (t.includes('sheep')) return '🐑';
  if (t.includes('chicken') || t.includes('hen')) return '🐔';
  if (t.includes('duck')) return '🦆';
  if (t.includes('horse')) return '🐴';
  if (t.includes('pig')) return '🐷';
  if (t.includes('turtle')) return '🐢';
  if (t.includes('snake')) return '🐍';
  if (t.includes('lizard') || t.includes('reptile')) return '🦎';
  if (t.includes('fish')) return '🐠';
  return '🐾';
}

// case-insensitive contains
const includes = (val, q) =>
  String(val ?? '').toLowerCase().includes(q.toLowerCase());

/* ─────────────── Component ─────────────── */

function Archive({
  pets = [],
  records = [],
  vets = [],            // active vets (IsArchived = false)
  petStatuses = [],
  appointments = [],
  attendances = [],
}) {
  // section: null = landing page, 'patients' | 'vets' | 'presence' = detail section
  const [section, setSection] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedVet, setSelectedVet] = useState(null);

  // archived vets (loaded from backend)
  const [archivedVets, setArchivedVets] = useState([]);

  useEffect(() => {
    if (section === 'vets') {
      loadArchivedVets();
    }
  }, [section]);

  async function loadArchivedVets() {
    try {
      const res = await getArchivedVets();
      setArchivedVets(res.data || res || []);
    } catch (err) {
      console.error('Failed to load archived vets:', err);
      setArchivedVets([]);
    }
  }

  // Lookup pool: archived vets + active vets, so old records still resolve
  const allVets = useMemo(
    () => [...vets, ...archivedVets],
    [vets, archivedVets]
  );

  /* ─────────────── Archived pets ─────────────── */
  const archivedPets = useMemo(() => {
    return (pets || []).filter(pet => {
      const ps = petStatuses.find(s => s.petId === pet.id);
      const status = ps?.status || '';
      return status === 'Archived' || status === 'Done' || status === 'Inactive';
    });
  }, [pets, petStatuses]);

  /* ─────────────── Filtered lists (search applies inside each section) ─────────────── */

  // Patient search: name, owner name, owner phone, breed, type, status, diagnosis
  const filteredPets = useMemo(() => {
    if (!search.trim()) return archivedPets;
    const q = search.trim();
    return archivedPets.filter(p => {
      const ps = petStatuses.find(s => s.petId === p.id);
      const petRecs = records.filter(r => r.petId === p.id);
      const diagnoses = petRecs.map(r => r.diagnosis).join(' ');

      return (
        includes(p.name, q) ||
        includes(p.owner?.name, q) ||
        includes(p.owner?.phone, q) ||
        includes(p.breed, q) ||
        includes(p.petType?.typeName, q) ||
        includes(ps?.status, q) ||
        includes(diagnoses, q)
      );
    });
  }, [archivedPets, petStatuses, records, search]);

  // Vet search (FIXED): name, role, specialization, university, status
  const filteredVets = useMemo(() => {
    if (!search.trim()) return archivedVets;
    const q = search.trim();
    return archivedVets.filter(v => (
      includes(v.name, q) ||
      includes(v.role, q) ||
      includes(v.specialization, q) ||
      includes(v.university, q) ||
      includes(v.archiveReason, q) ||
      includes('archived left job former', q) // status keywords
    ));
  }, [archivedVets, search]);

  // Presence search: vet name or note
  const filteredAttendance = useMemo(() => {
    if (!search.trim()) return attendances;
    const q = search.trim();
    return attendances.filter(a => {
      const vet = allVets.find(v => v.id === a.vetId);
      return (
        includes(vet?.name, q) ||
        includes(a.notes, q) ||
        includes(a.attendanceDate, q)
      );
    });
  }, [attendances, allVets, search]);

  /* ─────────────── Group pets by type ─────────────── */
  const groupedPets = useMemo(() => {
    const acc = {};
    filteredPets.forEach(pet => {
      const type = pet.petType?.typeName || 'Other';
      if (!acc[type]) acc[type] = [];
      acc[type].push(pet);
    });
    Object.keys(acc).forEach(type => {
      acc[type].sort((a, b) => a.name.localeCompare(b.name));
    });
    return acc;
  }, [filteredPets]);

  /* ═══════════════════════════════════════════════
     PET DETAIL VIEW
     ═══════════════════════════════════════════════ */
  if (selectedPet) {
    const petRecords = records.filter(r => r.petId === selectedPet.id);
    const petAppointments = appointments.filter(a => a.petId === selectedPet.id);
    const ps = petStatuses.find(s => s.petId === selectedPet.id);
    const assignedVet = allVets.find(v => v.id === ps?.assignedVetId);
    const emoji = getPetEmoji(selectedPet.petType?.typeName);

    // unique vets that handled this pet
    const handlingVets = [
      ...new Set(petRecords.map(r => r.vetId).filter(Boolean))
    ].map(id => allVets.find(v => v.id === id)).filter(Boolean);

    return (
      <PageLayout
        title="Patient Archive Record"
        subtitle={`${selectedPet.name} · Full Medical History`}
      >
        <button className={styles.backBtn} onClick={() => setSelectedPet(null)}>
          ← Back to Patients
        </button>

        <Card>
          <div className={styles.profileHeader}>
            <span className={styles.profileEmoji}>{emoji}</span>
            <div>
              <div className={styles.profileName}>{selectedPet.name}</div>
              <div className={styles.profileMeta}>
                {selectedPet.petType?.typeName} · {selectedPet.breed || '—'} · Age {selectedPet.age ? `${selectedPet.age}y` : '—'}
              </div>
              <div className={styles.profileMeta}>
                Owner: {selectedPet.owner?.name || '—'} · {selectedPet.owner?.phone || '—'}
              </div>
              <div className={styles.profileMeta}>
                Status: <strong>{ps?.status || '—'}</strong>
              </div>
              {assignedVet && (
                <div className={styles.profileMeta}>
                  Last Assigned Vet: Dr. {assignedVet.name}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Vets who handled this pet */}
        {handlingVets.length > 0 && (
          <>
            <div className={styles.historyTitle}>
              Veterinarians who handled {selectedPet.name} ({handlingVets.length})
            </div>
            <div className={styles.vetChipRow}>
              {handlingVets.map(v => (
                <span key={v.id} className={styles.vetChip}>
                  👨‍⚕️ Dr. {v.name}
                  {v.specialization && <small> · {v.specialization}</small>}
                </span>
              ))}
            </div>
          </>
        )}

        {/* Appointment history */}
        <div className={styles.historyTitle}>
          Appointment History ({petAppointments.length})
        </div>
        {petAppointments.length === 0 && (
          <div className={styles.noRec}>No appointments found</div>
        )}
        {petAppointments.map(app => {
          const vet = allVets.find(v => v.id === app.vetId);
          return (
            <Card key={app.id}>
              <div className={styles.recRow}>
                <div className={styles.recDate}>{app.date?.split('T')[0]}</div>
                <div className={styles.recBody}>
                  <div className={styles.recDiag}>{app.reason || 'No reason'}</div>
                  <div className={styles.recMeta}>
                    Dr. {vet?.name || '—'} · Status: {app.status}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {/* Medical / Diagnosis / Treatment history */}
        <div className={styles.historyTitle}>
          Medical Records ({petRecords.length})
        </div>
        {petRecords.length === 0 && (
          <div className={styles.noRec}>No medical records found</div>
        )}
        {petRecords.map(rec => {
          const vet = allVets.find(v => v.id === rec.vetId);
          return (
            <Card key={rec.id}>
              <div className={styles.recRow}>
                <div className={styles.recDate}>{rec.examinationDate}</div>
                <div className={styles.recBody}>
                  <div className={styles.recDiag}>{rec.diagnosis}</div>
                  <div className={styles.recMeta}>
                    Dr. {vet?.name || '—'} · {rec.treatment || '—'}
                  </div>
                  {rec.symptoms && (
                    <div className={styles.recNotes}>🩺 Symptoms: {rec.symptoms}</div>
                  )}
                  {rec.medicine && (
                    <div className={styles.recMed}>💊 {rec.medicine}</div>
                  )}
                  {rec.notes && (
                    <div className={styles.recNotes}>📝 {rec.notes}</div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </PageLayout>
    );
  }

  /* ═══════════════════════════════════════════════
     VET DETAIL VIEW
     ═══════════════════════════════════════════════ */
  if (selectedVet) {
    const vetAppointments = appointments.filter(a => a.vetId === selectedVet.id);
    const vetAttendance = attendances.filter(a => a.vetId === selectedVet.id);
    const vetRecords = records.filter(r => r.vetId === selectedVet.id);

    // Unique patients handled
    const handledPetIds = [
      ...new Set([
        ...vetAppointments.map(a => a.petId),
        ...vetRecords.map(r => r.petId),
      ].filter(Boolean))
    ];
    const handledPets = handledPetIds
      .map(id => pets.find(p => p.id === id))
      .filter(Boolean);

    // Attendance summary
    const presentDays = vetAttendance.filter(a => a.isPresent).length;
    const absentDays = vetAttendance.filter(a => !a.isPresent).length;

    return (
      <PageLayout
        title="Veterinarian Archive"
        subtitle={`Dr. ${selectedVet.name} · Full History`}
      >
        <button className={styles.backBtn} onClick={() => setSelectedVet(null)}>
          ← Back to Veterinarians
        </button>

        <Card>
          <div className={styles.profileHeader}>
            <span className={styles.profileEmoji}>👨‍⚕️</span>
            <div>
              <div className={styles.profileName}>Dr. {selectedVet.name}</div>
              <div className={styles.profileMeta}>
                {selectedVet.role} · {selectedVet.specialization || 'General'}
              </div>
              <div className={styles.profileMeta}>
                University: {selectedVet.university || '—'}
              </div>
              <div className={styles.profileMeta}>
                Graduation: {selectedVet.graduationYear || '—'}
              </div>
              <div className={styles.profileMeta}>
                Phone: {selectedVet.vetDetails?.phone || '—'} · Email: {selectedVet.vetDetails?.email || '—'}
              </div>
              <div className={styles.profileMeta}>
                Status: <strong>Left Clinic / Archived</strong>
                {selectedVet.archiveReason && ` · ${selectedVet.archiveReason}`}
              </div>
            </div>
          </div>
        </Card>

        {/* Performance summary */}
        <div className={styles.historyTitle}>Performance Summary</div>
        <div className={styles.statsRow}>
          <Card>
            <div className={styles.statBox}>
              <div className={styles.statNum}>{handledPets.length}</div>
              <div className={styles.statLbl}>Total Patients</div>
            </div>
          </Card>
          <Card>
            <div className={styles.statBox}>
              <div className={styles.statNum}>{vetAppointments.length}</div>
              <div className={styles.statLbl}>Appointments</div>
            </div>
          </Card>
          <Card>
            <div className={styles.statBox}>
              <div className={styles.statNum}>{vetRecords.length}</div>
              <div className={styles.statLbl}>Medical Records</div>
            </div>
          </Card>
          <Card>
            <div className={styles.statBox}>
              <div className={styles.statNum}>{presentDays} / {presentDays + absentDays}</div>
              <div className={styles.statLbl}>Days Present</div>
            </div>
          </Card>
        </div>

        {/* Patients handled */}
        <div className={styles.historyTitle}>
          Patients Handled ({handledPets.length})
        </div>
        {handledPets.length === 0 && (
          <div className={styles.noRec}>No patients handled</div>
        )}
        <div className={styles.groupList}>
          {handledPets.map(pet => (
            <Card key={pet.id} onClick={() => { setSelectedVet(null); setSelectedPet(pet); }}>
              <div className={styles.archiveRow}>
                <span className={styles.archiveEmoji}>
                  {getPetEmoji(pet.petType?.typeName)}
                </span>
                <div className={styles.archiveInfo}>
                  <div className={styles.archiveName}>{pet.name}</div>
                  <div className={styles.archiveMeta}>
                    {pet.petType?.typeName} · Owner: {pet.owner?.name || '—'}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Appointment history */}
        <div className={styles.historyTitle}>
          Appointment History ({vetAppointments.length})
        </div>
        {vetAppointments.length === 0 && (
          <div className={styles.noRec}>No appointments found</div>
        )}
        {vetAppointments.map(app => {
          const pet = pets.find(p => p.id === app.petId);
          return (
            <Card key={app.id}>
              <div className={styles.recRow}>
                <div className={styles.recDate}>{app.date?.split('T')[0]}</div>
                <div className={styles.recBody}>
                  <div className={styles.recDiag}>{pet?.name || 'Unknown Pet'}</div>
                  <div className={styles.recMeta}>{app.reason || 'No reason'}</div>
                  <div className={styles.recNotes}>Status: {app.status}</div>
                </div>
              </div>
            </Card>
          );
        })}

        {/* Attendance history */}
        <div className={styles.historyTitle}>
          Attendance History ({vetAttendance.length})
        </div>
        {vetAttendance.length === 0 && (
          <div className={styles.noRec}>No attendance records</div>
        )}
        {vetAttendance.map(att => (
          <Card key={att.id}>
            <div className={styles.recRow}>
              <div className={styles.recDate}>{att.attendanceDate}</div>
              <div className={styles.recBody}>
                <div
                  className={styles.recDiag}
                  style={{ color: att.isPresent ? '#0e6e3a' : '#b91c1c' }}
                >
                  {att.isPresent ? '✓ Present' : '✗ Absent'}
                </div>
                {att.notes && <div className={styles.recNotes}>{att.notes}</div>}
              </div>
            </div>
          </Card>
        ))}
      </PageLayout>
    );
  }

  /* ═══════════════════════════════════════════════
     SECTION: PATIENTS
     ═══════════════════════════════════════════════ */
  if (section === 'patients') {
    return (
      <PageLayout
        title="Patients Archive"
        subtitle="All archived and completed patients, grouped by type"
      >
        <button className={styles.backBtn} onClick={() => { setSection(null); setSearch(''); }}>
          ← Back to Archive
        </button>

        <input
          className={styles.search}
          placeholder="Search by name, owner, phone, breed, type, status, or diagnosis..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {filteredPets.length === 0 && (
          <div className={styles.empty}>No archived patients found</div>
        )}

        {Object.keys(groupedPets).sort().map(type => (
          <div key={type} className={styles.group}>
            <div className={styles.groupTitle}>
              {getPetEmoji(type)} {type} Section ({groupedPets[type].length})
            </div>
            <div className={styles.groupList}>
              {groupedPets[type].map(pet => {
                const petRecs = records.filter(r => r.petId === pet.id);
                const latestRec = petRecs[petRecs.length - 1];
                const ps = petStatuses.find(s => s.petId === pet.id);
                const vet = allVets.find(v => v.id === ps?.assignedVetId);
                return (
                  <Card key={pet.id} onClick={() => setSelectedPet(pet)}>
                    <div className={styles.archiveRow}>
                      <span className={styles.archiveEmoji}>
                        {getPetEmoji(pet.petType?.typeName)}
                      </span>
                      <div className={styles.archiveInfo}>
                        <div className={styles.archiveName}>{pet.name}</div>
                        <div className={styles.archiveMeta}>
                          {pet.owner?.name || '—'}
                          {vet && ` · Dr. ${vet.name}`}
                          {latestRec && ` · Last visit: ${latestRec.examinationDate}`}
                        </div>
                        {latestRec && (
                          <div className={styles.archiveDiag}>{latestRec.diagnosis}</div>
                        )}
                      </div>
                      <div className={styles.archiveCount}>
                        {petRecs.length} visit{petRecs.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </PageLayout>
    );
  }

  /* ═══════════════════════════════════════════════
     SECTION: VETERINARIANS
     ═══════════════════════════════════════════════ */
  if (section === 'vets') {
    return (
      <PageLayout
        title="Veterinarians Archive"
        subtitle="All veterinarians who left the clinic or completed training"
      >
        <button className={styles.backBtn} onClick={() => { setSection(null); setSearch(''); }}>
          ← Back to Archive
        </button>

        <input
          className={styles.search}
          placeholder="Search by name, role, specialization, university, or status..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {filteredVets.length === 0 && (
          <div className={styles.empty}>No archived veterinarians found</div>
        )}

        <div className={styles.groupList}>
          {filteredVets.map(vet => {
            const vetAppointments = appointments.filter(a => a.vetId === vet.id);
            const vetRecords = records.filter(r => r.vetId === vet.id);
            const totalPatients = new Set([
              ...vetAppointments.map(a => a.petId),
              ...vetRecords.map(r => r.petId),
            ]).size;

            return (
              <Card key={vet.id} onClick={() => setSelectedVet(vet)}>
                <div className={styles.archiveRow}>
                  <span className={styles.archiveEmoji}>👨‍⚕️</span>
                  <div className={styles.archiveInfo}>
                    <div className={styles.archiveName}>Dr. {vet.name}</div>
                    <div className={styles.archiveMeta}>
                      {vet.role} · {vet.specialization || 'General'}
                      {vet.university && ` · ${vet.university}`}
                    </div>
                    <div className={styles.archiveDiag}>
                      Left clinic / Archived
                      {vet.archiveReason && ` — ${vet.archiveReason}`}
                    </div>
                  </div>
                  <div className={styles.archiveCount}>
                    {totalPatients} patient{totalPatients !== 1 ? 's' : ''}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </PageLayout>
    );
  }

  /* ═══════════════════════════════════════════════
     SECTION: PRESENCE / ATTENDANCE
     ═══════════════════════════════════════════════ */
  if (section === 'presence') {
    // group attendance by vet
    const byVet = {};
    filteredAttendance.forEach(a => {
      if (!byVet[a.vetId]) byVet[a.vetId] = [];
      byVet[a.vetId].push(a);
    });

    // sort each vet's attendance by date desc
    Object.keys(byVet).forEach(vetId => {
      byVet[vetId].sort((a, b) =>
        String(b.attendanceDate).localeCompare(String(a.attendanceDate))
      );
    });

    return (
      <PageLayout
        title="Presence / Attendance Archive"
        subtitle="Veterinarian attendance history and absence tracking"
      >
        <button className={styles.backBtn} onClick={() => { setSection(null); setSearch(''); }}>
          ← Back to Archive
        </button>

        <input
          className={styles.search}
          placeholder="Search by vet name, date, or note..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {Object.keys(byVet).length === 0 && (
          <div className={styles.empty}>No attendance records found</div>
        )}

        {Object.keys(byVet).map(vetId => {
          const vet = allVets.find(v => v.id === parseInt(vetId));
          const list = byVet[vetId];
          const present = list.filter(a => a.isPresent).length;
          const absent = list.length - present;
          const absentDates = list.filter(a => !a.isPresent).map(a => a.attendanceDate);

          return (
            <div key={vetId} className={styles.group}>
              <div className={styles.groupTitle}>
                👨‍⚕️ Dr. {vet?.name || `Vet #${vetId}`}
                <span className={styles.presenceSummary}>
                  {present} present · {absent} absent
                </span>
              </div>

              {absent > 0 && (
                <div className={styles.absentNote}>
                  Absent on: {absentDates.join(', ')}
                </div>
              )}

              <div className={styles.attendanceGrid}>
                {list.map(att => (
                  <div
                    key={att.id}
                    className={`${styles.attendanceCell} ${att.isPresent ? styles.present : styles.absent}`}
                    title={att.notes || ''}
                  >
                    <div className={styles.attendanceDate}>{att.attendanceDate}</div>
                    <div className={styles.attendanceState}>
                      {att.isPresent ? '✓ Present' : '✗ Absent'}
                    </div>
                    {att.notes && (
                      <div className={styles.attendanceNote}>{att.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </PageLayout>
    );
  }

  /* ═══════════════════════════════════════════════
     LANDING PAGE — Section cards
     ═══════════════════════════════════════════════ */

  // counts for landing cards
  const presentToday = attendances.filter(a => a.isPresent).length;
  const absentToday = attendances.filter(a => !a.isPresent).length;

  return (
    <PageLayout
      title="Archive System"
      subtitle="Complete historical records for the clinic"
    >
      <div className={styles.sectionGrid}>

        {/* Patients */}
        <Card onClick={() => setSection('patients')}>
          <div className={styles.sectionCard}>
            <span className={styles.sectionEmoji}>🐾</span>
            <div className={styles.sectionTitle}>Patients Archive</div>
            <div className={styles.sectionDesc}>
              All archived and past patients with full medical history
            </div>
            <div className={styles.sectionCount}>
              {archivedPets.length} patient{archivedPets.length !== 1 ? 's' : ''}
            </div>
          </div>
        </Card>

        {/* Veterinarians */}
        <Card onClick={() => setSection('vets')}>
          <div className={styles.sectionCard}>
            <span className={styles.sectionEmoji}>👨‍⚕️</span>
            <div className={styles.sectionTitle}>Veterinarians Archive</div>
            <div className={styles.sectionDesc}>
              Former staff, trainees, and trainers who left the clinic
            </div>
            <div className={styles.sectionCount}>
              {archivedVets.length} veterinarian{archivedVets.length !== 1 ? 's' : ''}
            </div>
          </div>
        </Card>

        {/* Presence */}
        <Card onClick={() => setSection('presence')}>
          <div className={styles.sectionCard}>
            <span className={styles.sectionEmoji}>📊</span>
            <div className={styles.sectionTitle}>Presence / Attendance</div>
            <div className={styles.sectionDesc}>
              Veterinarian attendance and absence history
            </div>
            <div className={styles.sectionCount}>
              {presentToday} present · {absentToday} absent
            </div>
          </div>
        </Card>

      </div>
    </PageLayout>
  );
}

export default Archive;
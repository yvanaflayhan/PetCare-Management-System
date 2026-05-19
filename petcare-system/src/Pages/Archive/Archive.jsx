import React, { useState } from 'react';
import styles from './Archive.module.css';
import Card from '../../Components/Card/Card';
import PageLayout from '../../Components/Layout/PageLayout';
import Btn from '../../Components/Btn/Btn';
import { createVet } from '../../Services/api';

const SPECIES_MAP = { Dog:'🐶', Cat:'🐱', Rabbit:'🐰', Bird:'🐦', Hamster:'🐹', Reptile:'🦎', Fish:'🐠' };

function getTypeEmoji(type) { return SPECIES_MAP[type] || '🐾'; }

// ── 3 TAB SECTIONS ────────────────────────────────────────────────────────────
const TABS = [
  { id: 'patients', label: '🐾 Patients' },
  { id: 'vets',     label: '👨‍⚕️ Veterinarians' },
  { id: 'presence', label: '📅 Staff Presence' },
];

function Archive({
  pets, records, vets, petStatuses, appointments,
  archivedVets, setArchivedVets, setVets,
  todayAttendance,   // { vetId: bool } from App
  reload
}) {
  const [activeTab, setActiveTab]   = useState('patients');
  const [search, setSearch]         = useState('');
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedVet, setSelectedVet] = useState(null);
  const [restoring, setRestoring]   = useState(false);

  // ── RESTORE ARCHIVED VET ─────────────────────────────────────────────────
  async function handleRestoreVet(vet) {
    setRestoring(true);
    try {
      await createVet({
        name:           vet.name,
        role:           vet.role,
        specialization: vet.specialization || null,
        university:     vet.university     || null,
        graduationYear: vet.graduationYear || null,
      });
      // remove from archived list
      setArchivedVets(prev => prev.filter(v => v.id !== vet.id));
      await reload();
      setSelectedVet(null);
    } catch (err) {
      alert('Error restoring: ' + err.message);
    } finally {
      setRestoring(false);
    }
  }

  // ── SECTION 1: PATIENTS ───────────────────────────────────────────────────
  const archivedPets = pets.filter(pet => {
    const ps = petStatuses.find(s => s.petId === pet.id);
    return ps?.status === 'Archived' || ps?.status === 'Done';
  });

  const filteredPets = archivedPets.filter(p => {
    const ownerName = p.owner?.name || '';
    return (
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      ownerName.toLowerCase().includes(search.toLowerCase())
    );
  });

  const groupedPets = filteredPets.reduce((acc, pet) => {
    const type = pet.petType?.typeName || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(pet);
    return acc;
  }, {});
  Object.keys(groupedPets).forEach(t => groupedPets[t].sort((a, b) => a.name.localeCompare(b.name)));

  // ── SECTION 2: VETS ───────────────────────────────────────────────────────
  const filteredArchivedVets = archivedVets.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  // ── SECTION 3: PRESENCE ───────────────────────────────────────────────────
  // show all active vets with today's attendance status
  const allVetsForPresence = vets.map(v => ({
    ...v,
    isPresent: !!todayAttendance[v.id],
  }));
  const presentCount = allVetsForPresence.filter(v => v.isPresent).length;

  // ── PET DETAIL VIEW ──────────────────────────────────────────────────────
  if (selectedPet) {
    const petRecs     = records.filter(r => r.petId === selectedPet.id);
    const petAppts    = appointments.filter(a => a.petId === selectedPet.id);
    const ps          = petStatuses.find(s => s.petId === selectedPet.id);
    const assignedVet = vets.find(v => v.id === ps?.assignedVetId)
                     || archivedVets.find(v => v.id === ps?.assignedVetId);
    const emoji       = SPECIES_MAP[selectedPet.petType?.typeName] || '🐾';

    return (
      <PageLayout title="Patient Archive Record" subtitle={`${selectedPet.name} · Full History`}>
        <button className={styles.backBtn} onClick={() => setSelectedPet(null)}>← Back</button>

        {/* INFO CARD */}
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
                <div className={styles.profileMeta}>Assigned Vet: {assignedVet.name}</div>
              )}
            </div>
          </div>
        </Card>

        {/* APPOINTMENTS */}
        {petAppts.length > 0 && (
          <>
            <div className={styles.historyTitle}>📅 Appointments ({petAppts.length})</div>
            {petAppts.map(appt => {
              const vet  = vets.find(v => v.id === appt.vetId);
              const date = appt.date ? new Date(appt.date).toLocaleDateString() : '—';
              const time = appt.date ? new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
              return (
                <Card key={appt.id}>
                  <div className={styles.recRow}>
                    <div className={styles.recDate}>{date}</div>
                    <div className={styles.recBody}>
                      <div className={styles.recDiag}>{appt.reason || '—'}</div>
                      <div className={styles.recMeta}>{vet?.name || '—'} · {time} · {appt.status}</div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </>
        )}

        {/* MEDICAL RECORDS */}
        <div className={styles.historyTitle}>🩺 Medical History ({petRecs.length})</div>
        {petRecs.length === 0 && <div className={styles.noRec}>No medical records found</div>}
        {petRecs.map(rec => {
          const vet = vets.find(v => v.id === rec.vetId);
          return (
            <Card key={rec.id}>
              <div className={styles.recRow}>
                <div className={styles.recDate}>{rec.examinationDate}</div>
                <div className={styles.recBody}>
                  <div className={styles.recDiag}>{rec.diagnosis}</div>
                  <div className={styles.recMeta}>{vet?.name || '—'} · {rec.treatment || '—'}</div>
                  {rec.medicine && <div className={styles.recMed}>💊 {rec.medicine}</div>}
                  {rec.notes    && <div className={styles.recNotes}>📝 {rec.notes}</div>}
                </div>
              </div>
            </Card>
          );
        })}
      </PageLayout>
    );
  }

  // ── VET DETAIL VIEW ───────────────────────────────────────────────────────
  if (selectedVet) {
    const nameParts = (selectedVet.name || '').trim().split(' ');
    const fName     = nameParts[0] || '';
    const lName     = nameParts.slice(1).join(' ') || '';
    const vetAppts  = appointments.filter(a => a.vetId === selectedVet.id);

    return (
      <PageLayout title={`Dr. ${fName} ${lName}`} subtitle="Archived Veterinarian Profile">
        <button className={styles.backBtn} onClick={() => setSelectedVet(null)}>← Back</button>

        <Card>
          <div className={styles.profileHeader}>
            <div className={styles.vetArchiveAvatar}>{`${fName[0] || ''}${lName[0] || ''}`.toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <div className={styles.profileName}>Dr. {fName} {lName}</div>
              <div className={styles.profileMeta}>{selectedVet.role} · {selectedVet.specialization || 'General'}</div>
              <div className={styles.profileMeta}>🎓 {selectedVet.university || '—'} · {selectedVet.graduationYear || '—'}</div>
              {selectedVet.archivedAt && (
                <div className={styles.profileMeta}>📦 Archived on: {selectedVet.archivedAt}</div>
              )}
              <div style={{ marginTop: 8, display:'inline-block', background:'#fee2e2', color:'#b91c1c', fontSize:12, fontWeight:600, padding:'3px 12px', borderRadius:20 }}>
                Left the clinic
              </div>
            </div>
            <Btn onClick={() => handleRestoreVet(selectedVet)} disabled={restoring}>
              {restoring ? 'Restoring...' : '↩ Restore to Active'}
            </Btn>
          </div>
        </Card>

        {vetAppts.length > 0 && (
          <>
            <div className={styles.historyTitle}>📅 Past Appointments ({vetAppts.length})</div>
            {vetAppts.map(appt => {
              const pet  = pets.find(p => p.id === appt.petId);
              const date = appt.date ? new Date(appt.date).toLocaleDateString() : '—';
              return (
                <Card key={appt.id}>
                  <div className={styles.recRow}>
                    <div className={styles.recDate}>{date}</div>
                    <div className={styles.recBody}>
                      <div className={styles.recDiag}>{pet?.name || '—'} · {appt.reason || '—'}</div>
                      <div className={styles.recMeta}>{appt.status}</div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </>
        )}
      </PageLayout>
    );
  }

  // ── MAIN ARCHIVE VIEW ─────────────────────────────────────────────────────
  return (
    <PageLayout title="Archive System" subtitle="Patients · Veterinarians · Staff Presence">

      {/* TABS */}
      <div className={styles.tabs}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => { setActiveTab(tab.id); setSearch(''); }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SEARCH (not on presence tab) */}
      {activeTab !== 'presence' && (
        <input
          className={styles.search}
          placeholder={activeTab === 'patients' ? 'Search by name or owner...' : 'Search by vet name...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      )}

      {/* ── TAB: PATIENTS ── */}
      {activeTab === 'patients' && (
        <>
          {filteredPets.length === 0 && (
            <div className={styles.empty}>No archived patients found</div>
          )}
          {Object.keys(groupedPets).sort().map(type => (
            <div key={type} className={styles.group}>
              <div className={styles.groupTitle}>{getTypeEmoji(type)} {type} Section</div>
              <div className={styles.groupList}>
                {groupedPets[type].map(pet => {
                  const petRecs   = records.filter(r => r.petId === pet.id);
                  const latestRec = petRecs[petRecs.length - 1];
                  const ps        = petStatuses.find(s => s.petId === pet.id);
                  const vet       = vets.find(v => v.id === ps?.assignedVetId);
                  const emoji     = SPECIES_MAP[pet.petType?.typeName] || '🐾';
                  return (
                    <Card key={pet.id} onClick={() => setSelectedPet(pet)}>
                      <div className={styles.archiveRow}>
                        <span className={styles.archiveEmoji}>{emoji}</span>
                        <div className={styles.archiveInfo}>
                          <div className={styles.archiveName}>{pet.name}</div>
                          <div className={styles.archiveMeta}>
                            {pet.owner?.name || '—'}
                            {vet       && ` · ${vet.name}`}
                            {latestRec && ` · Last visit: ${latestRec.examinationDate}`}
                          </div>
                          {latestRec && <div className={styles.archiveDiag}>{latestRec.diagnosis}</div>}
                        </div>
                        <div className={styles.archiveCount}>{petRecs.length} visits</div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}

      {/* ── TAB: VETS ── */}
      {activeTab === 'vets' && (
        <>
          {filteredArchivedVets.length === 0 && (
            <div className={styles.empty}>No archived veterinarians yet</div>
          )}
          {filteredArchivedVets.map(vet => {
            const nameParts = (vet.name || '').trim().split(' ');
            const fName     = nameParts[0] || '';
            const lName     = nameParts.slice(1).join(' ') || '';
            const initials  = `${fName[0] || ''}${lName[0] || ''}`.toUpperCase();
            return (
              <Card key={vet.id} onClick={() => setSelectedVet(vet)}>
                <div className={styles.archiveRow}>
                  <div className={styles.vetArchiveAvatar}>{initials}</div>
                  <div className={styles.archiveInfo}>
                    <div className={styles.archiveName}>Dr. {fName} {lName}</div>
                    <div className={styles.archiveMeta}>
                      {vet.role} · {vet.specialization || 'General'}
                      {vet.archivedAt && ` · Left: ${vet.archivedAt}`}
                    </div>
                    <div className={styles.archiveDiag}>{vet.university || '—'}</div>
                  </div>
                  <div style={{ background:'#fee2e2', color:'#b91c1c', fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:20 }}>
                    Left Clinic
                  </div>
                </div>
              </Card>
            );
          })}
        </>
      )}

      {/* ── TAB: PRESENCE ── */}
      {activeTab === 'presence' && (
        <>
          <div className={styles.presenceSummary}>
            <span className={styles.presenceCount}>{presentCount}</span> of <span className={styles.presenceCount}>{allVetsForPresence.length}</span> staff present today
          </div>

          {allVetsForPresence.length === 0 && (
            <div className={styles.empty}>No staff members found</div>
          )}

          {allVetsForPresence.map(v => {
            const nameParts = (v.name || '').trim().split(' ');
            const fName     = nameParts[0] || '';
            const lName     = nameParts.slice(1).join(' ') || '';
            const initials  = `${fName[0] || ''}${lName[0] || ''}`.toUpperCase();
            return (
              <Card key={v.id}>
                <div className={styles.presenceRow}>
                  <div
                    className={styles.presenceAvatar}
                    style={{ background: v.isPresent ? '#0d2b36' : '#e8f0f4', color: v.isPresent ? '#fff' : '#7a9baa' }}
                  >
                    {initials}
                  </div>
                  <div className={styles.presenceInfo}>
                    <div className={styles.presenceName}>{v.name}</div>
                    <div className={styles.presenceRole}>{v.specialization || 'General'} · {v.role}</div>
                  </div>
                  <div
                    className={styles.presenceBadge}
                    style={{
                      background: v.isPresent ? '#d6f5e3' : '#fee2e2',
                      color:      v.isPresent ? '#0e6e3a' : '#b91c1c',
                    }}
                  >
                    {v.isPresent ? '✓ Present' : '✗ Absent'}
                  </div>
                </div>
              </Card>
            );
          })}
        </>
      )}

    </PageLayout>
  );
}

export default Archive;

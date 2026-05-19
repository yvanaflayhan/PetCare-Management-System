import React, { useState, useEffect } from 'react';
import styles from './Archive.module.css';
import Card from '../../Components/Card/Card';
import PageLayout from '../../Components/Layout/PageLayout';
import { getArchivedVets } from '../../Services/api';

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
  if (t.includes('lizard') || t.includes('reptile')) return '🦎';
  if (t.includes('fish')) return '🐠';

  return '🐾';
}

function Archive({
  pets = [],
  records = [],
  vets = [],
  petStatuses = [],
  appointments = [],
  attendances = []
}) {

  const [search, setSearch] = useState('');
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedVet, setSelectedVet] = useState(null);

  // archived pets
  const archived = (pets || []).filter(pet => {
    const ps = petStatuses.find(s => s.petId === pet.id);
    const status = ps?.status || '';

    return (
      status === 'Archived' ||
      status === 'Done' ||
      status === 'Inactive'
    );
  });

  // archived vets
  const [archivedVets, setArchivedVets] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await getArchivedVets();
      setArchivedVets(res.data || res || []);
    } catch (err) {
      console.log(err);
      setArchivedVets([]);
    }
  }

  // pet search
  const filtered = archived.filter(p => {
    const ownerName = p.owner?.name || '';
    const petName = p.name || '';

    return (
      petName.toLowerCase().includes(search.toLowerCase()) ||
      ownerName.toLowerCase().includes(search.toLowerCase())
    );
  });

  // group pets by type
  const grouped = filtered.reduce((acc, pet) => {
    const type = pet.petType?.typeName || 'Other';

    if (!acc[type]) acc[type] = [];

    acc[type].push(pet);

    return acc;
  }, {});

  Object.keys(grouped).forEach(type => {
    grouped[type].sort((a, b) => a.name.localeCompare(b.name));
  });

  // ── PET DETAIL VIEW ─────────────────────────────────────────────
  if (selectedPet) {

    const petRecords = records.filter(
      r => r.petId === selectedPet.id
    );

    const ps = petStatuses.find(
      s => s.petId === selectedPet.id
    );

    const assignedVet = vets.find(
      v => v.id === ps?.assignedVetId
    );

    const emoji = getPetEmoji(
      selectedPet.petType?.typeName
    );

    return (
      <PageLayout
        title="Archive Record"
        subtitle={`${selectedPet.name} · Full History`}
      >

        <button
          className={styles.backBtn}
          onClick={() => setSelectedPet(null)}
        >
          ← Back
        </button>

        <Card>
          <div className={styles.profileHeader}>

            <span className={styles.profileEmoji}>
              {emoji}
            </span>

            <div>

              <div className={styles.profileName}>
                {selectedPet.name}
              </div>

              <div className={styles.profileMeta}>
                {selectedPet.petType?.typeName}
                {' · '}
                {selectedPet.breed || '—'}
                {' · '}
                Age {selectedPet.age ? `${selectedPet.age}y` : '—'}
              </div>

              <div className={styles.profileMeta}>
                Owner: {selectedPet.owner?.name || '—'}
                {' · '}
                {selectedPet.owner?.phone || '—'}
              </div>

              <div className={styles.profileMeta}>
                Status: {ps?.status || '—'}
              </div>

              {assignedVet && (
                <div className={styles.profileMeta}>
                  Assigned Vet: {assignedVet.name}
                </div>
              )}

            </div>
          </div>
        </Card>

        <div className={styles.historyTitle}>
          Medical History ({petRecords.length})
        </div>

        {petRecords.length === 0 && (
          <div className={styles.noRec}>
            No medical records found
          </div>
        )}

        {petRecords.map(rec => {

          const vet = vets.find(
            v => v.id === rec.vetId
          );

          return (
            <Card key={rec.id}>
              <div className={styles.recRow}>

                <div className={styles.recDate}>
                  {rec.examinationDate}
                </div>

                <div className={styles.recBody}>

                  <div className={styles.recDiag}>
                    {rec.diagnosis}
                  </div>

                  <div className={styles.recMeta}>
                    {vet?.name || '—'}
                    {' · '}
                    {rec.treatment || '—'}
                  </div>

                  {rec.medicine && (
                    <div className={styles.recMed}>
                      💊 {rec.medicine}
                    </div>
                  )}

                  {rec.notes && (
                    <div className={styles.recNotes}>
                      📝 {rec.notes}
                    </div>
                  )}

                </div>
              </div>
            </Card>
          );
        })}
      </PageLayout>
    );
  }

  // ── VET DETAIL VIEW ─────────────────────────────────────────────
  if (selectedVet) {

    const vetAppointments = appointments.filter(
      a => a.vetId === selectedVet.id
    );

    const vetAttendance = attendances.filter(
      a => a.vetId === selectedVet.id
    );

    return (
      <PageLayout
        title="Veterinarian Archive"
        subtitle={`${selectedVet.name} · Full History`}
      >

        <button
          className={styles.backBtn}
          onClick={() => setSelectedVet(null)}
        >
          ← Back
        </button>

        <Card>
          <div className={styles.profileHeader}>

            <span className={styles.profileEmoji}>
              👨‍⚕️
            </span>

            <div>

              <div className={styles.profileName}>
                {selectedVet.name}
              </div>

              <div className={styles.profileMeta}>
                {selectedVet.role}
                {' · '}
                {selectedVet.specialization || 'General'}
              </div>

              <div className={styles.profileMeta}>
                University: {selectedVet.university || '—'}
              </div>

              <div className={styles.profileMeta}>
                Graduation: {selectedVet.graduationYear || '—'}
              </div>

              <div className={styles.profileMeta}>
                Status: Left Clinic / Archived
              </div>

            </div>
          </div>
        </Card>

        <div className={styles.historyTitle}>
          Appointment History ({vetAppointments.length})
        </div>

        {vetAppointments.length === 0 && (
          <div className={styles.noRec}>
            No appointments found
          </div>
        )}

        {vetAppointments.map(app => {

          const pet = pets.find(
            p => p.id === app.petId
          );

          return (
            <Card key={app.id}>
              <div className={styles.recRow}>

                <div className={styles.recDate}>
                  {app.date?.split('T')[0]}
                </div>

                <div className={styles.recBody}>

                  <div className={styles.recDiag}>
                    {pet?.name || 'Unknown Pet'}
                  </div>

                  <div className={styles.recMeta}>
                    {app.reason || 'No reason'}
                  </div>

                  <div className={styles.recNotes}>
                    Status: {app.status}
                  </div>

                </div>
              </div>
            </Card>
          );
        })}

        <div className={styles.historyTitle}>
          Attendance History ({vetAttendance.length})
        </div>

        {vetAttendance.map(att => (
          <Card key={att.id}>
            <div className={styles.recRow}>

              <div className={styles.recDate}>
                {att.attendanceDate}
              </div>

              <div className={styles.recBody}>

                <div className={styles.recDiag}>
                  {att.isPresent ? 'Present' : 'Absent'}
                </div>

                {att.notes && (
                  <div className={styles.recNotes}>
                    {att.notes}
                  </div>
                )}

              </div>
            </div>
          </Card>
        ))}

      </PageLayout>
    );
  }

  // ── MAIN ARCHIVE VIEW ───────────────────────────────────────────
  return (
    <PageLayout
      title="Archive System"
      subtitle="All completed, archived, and past patients grouped by type"
    >

      <input
        className={styles.search}
        placeholder="Search by name or owner..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* ARCHIVED VETS */}

      {(archivedVets || []).length > 0 && (
        <div className={styles.group}>

          <div className={styles.groupTitle}>
            👨‍⚕️ Archived Veterinarians
          </div>

          <div className={styles.groupList}>

            {archivedVets.map(vet => {

              const vetAppointments = appointments.filter(
                a => a.vetId === vet.id
              );

              return (
                <Card
                  key={vet.id}
                  onClick={() => setSelectedVet(vet)}
                >

                  <div className={styles.archiveRow}>

                    <span className={styles.archiveEmoji}>
                      👨‍⚕️
                    </span>

                    <div className={styles.archiveInfo}>

                      <div className={styles.archiveName}>
                        {vet.name}
                      </div>

                      <div className={styles.archiveMeta}>
                        {vet.role}
                        {' · '}
                        {vet.specialization || 'General'}
                      </div>

                      <div className={styles.archiveDiag}>
                        Left clinic / Archived
                      </div>

                    </div>

                    <div className={styles.archiveCount}>
                      {vetAppointments.length} appointments
                    </div>

                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* EMPTY */}

      {filtered.length === 0 && archivedVets.length === 0 && (
        <div className={styles.empty}>
          No archived records found
        </div>
      )}

      {/* PET GROUPS */}

      {Object.keys(grouped).sort().map(type => (

        <div key={type} className={styles.group}>

          <div className={styles.groupTitle}>
            {getPetEmoji(type)} {type} Section
          </div>

          <div className={styles.groupList}>

            {grouped[type].map(pet => {

              const petRecs = records.filter(
                r => r.petId === pet.id
              );

              const latestRec =
                petRecs[petRecs.length - 1];

              const ps = petStatuses.find(
                s => s.petId === pet.id
              );

              const vet = vets.find(
                v => v.id === ps?.assignedVetId
              );

              const emoji = getPetEmoji(
                pet.petType?.typeName
              );

              return (
                <Card
                  key={pet.id}
                  onClick={() => setSelectedPet(pet)}
                >

                  <div className={styles.archiveRow}>

                    <span className={styles.archiveEmoji}>
                      {emoji}
                    </span>

                    <div className={styles.archiveInfo}>

                      <div className={styles.archiveName}>
                        {pet.name}
                      </div>

                      <div className={styles.archiveMeta}>
                        {pet.owner?.name || '—'}

                        {vet && ` · ${vet.name}`}

                        {latestRec &&
                          ` · Last visit: ${latestRec.examinationDate}`}
                      </div>

                      {latestRec && (
                        <div className={styles.archiveDiag}>
                          {latestRec.diagnosis}
                        </div>
                      )}

                    </div>

                    <div className={styles.archiveCount}>
                      {petRecs.length} visits
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

export default Archive;
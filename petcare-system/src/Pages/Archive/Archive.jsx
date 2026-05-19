import React, { useState } from 'react';
import styles from './Archive.module.css';
import Card from '../../Components/Card/Card';
import PageLayout from '../../Components/Layout/PageLayout';

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
function Archive({ pets, records, vets, petStatuses }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  // pets whose status is Archived, Done or Inactive
  const archived = pets.filter(pet => {
    const ps = petStatuses.find(s => s.petId === pet.id);
    const status = ps?.status || '';
    return status === 'Archived' || status === 'Done' || status === 'Inactive';
  });

  const archivedVets = vets.filter(v => v.isArchived);

  const filtered = archived.filter(p => {
    const ownerName = p.owner?.name || '';
    return (
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      ownerName.toLowerCase().includes(search.toLowerCase())
    );
  });

  // group by animal type
  const grouped = filtered.reduce((acc, pet) => {
    const type = pet.petType?.typeName || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(pet);
    return acc;
  }, {});

  Object.keys(grouped).forEach(type => {
    grouped[type].sort((a, b) => a.name.localeCompare(b.name));
  });

  // ── DETAIL VIEW ───────────────────────────────────────────────────────────
  if (selected) {
    const petRecords = records.filter(r => r.petId === selected.id);
    const ps = petStatuses.find(s => s.petId === selected.id);
    const assignedVet = vets.find(v => v.id === ps?.assignedVetId);
    const emoji = getPetEmoji(selected.petType?.typeName);

    return (
      <PageLayout
        title="Archive Record"
        subtitle={`${selected.name} · Full History`}
      >
        <button className={styles.backBtn} onClick={() => setSelected(null)}>← Back</button>

        <Card>
          <div className={styles.profileHeader}>
            <span className={styles.profileEmoji}>{emoji}</span>
            <div>
              <div className={styles.profileName}>{selected.name}</div>
              <div className={styles.profileMeta}>
                {selected.petType?.typeName} · {selected.breed || '—'} · Age {selected.age ? `${selected.age}y` : '—'}
              </div>
              <div className={styles.profileMeta}>
                Owner: {selected.owner?.name || '—'} · {selected.owner?.phone || '—'}
              </div>
              <div className={styles.profileMeta}>Status: {ps?.status || '—'}</div>
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
          <div className={styles.noRec}>No medical records found</div>
        )}

        {petRecords.map(rec => {
          const vet = vets.find(v => v.id === rec.vetId);
          return (
            <Card key={rec.id}>
              <div className={styles.recRow}>
                <div className={styles.recDate}>{rec.examinationDate}</div>
                <div className={styles.recBody}>
                  <div className={styles.recDiag}>{rec.diagnosis}</div>
                  <div className={styles.recMeta}>
                    {vet?.name || '—'} · {rec.treatment || '—'}
                  </div>
                  {rec.medicine && <div className={styles.recMed}>💊 {rec.medicine}</div>}
                  {rec.notes && <div className={styles.recNotes}>📝 {rec.notes}</div>}
                </div>
              </div>
            </Card>
          );
        })}
      </PageLayout>
    );
  }

  // ── MAIN ARCHIVE VIEW ─────────────────────────────────────────────────────
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

      {archivedVets.length > 0 && (
        <div className={styles.group}>
          <div className={styles.groupTitle}>
            🩺 Archived Veterinarians
          </div>

          <div className={styles.groupList}>
            {archivedVets.map(vet => (
              <Card key={vet.id}>
                <div className={styles.archiveRow}>
                  <span className={styles.archiveEmoji}>🩺</span>

                  <div className={styles.archiveInfo}>
                    <div className={styles.archiveName}>
                      {vet.name}
                    </div>

                    <div className={styles.archiveMeta}>
                      {vet.role} · {vet.specialization || 'General'}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className={styles.empty}>No archived patients found</div>
      )}

      {Object.keys(grouped).sort().map(type => (
        <div key={type} className={styles.group}>
          <div className={styles.groupTitle}>
            {getPetEmoji(type)} {type} Section
          </div>
          <div className={styles.groupList}>
            {grouped[type].map(pet => {
              const petRecs = records.filter(r => r.petId === pet.id);
              const latestRec = petRecs[petRecs.length - 1];
              const ps = petStatuses.find(s => s.petId === pet.id);
              const vet = vets.find(v => v.id === ps?.assignedVetId);
              const emoji = getPetEmoji(pet.petType?.typeName);
              return (
                <Card key={pet.id} onClick={() => setSelected(pet)}>
                  <div className={styles.archiveRow}>
                    <span className={styles.archiveEmoji}>{emoji}</span>
                    <div className={styles.archiveInfo}>
                      <div className={styles.archiveName}>{pet.name}</div>
                      <div className={styles.archiveMeta}>
                        {pet.owner?.name || '—'}
                        {vet && ` · ${vet.name}`}
                        {latestRec && ` · Last visit: ${latestRec.examinationDate}`}
                      </div>
                      {latestRec && (
                        <div className={styles.archiveDiag}>{latestRec.diagnosis}</div>
                      )}
                    </div>
                    <div className={styles.archiveCount}>{petRecs.length} visits</div>
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
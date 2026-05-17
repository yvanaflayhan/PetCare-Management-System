import React, { useState } from 'react';
import styles from './Archive.module.css';
import PageLayout from './Pagelayout';
import Card from './Card';

function Archive({ pets, records, vets }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  // ✅ FULL ARCHIVE = DONE + ARCHIVED + INACTIVE (future vet logic ready)
  const archived = pets.filter(
    (p) =>
      p.status === 'Archived' ||
      p.status === 'Done' ||
      p.status === 'Inactive'
  );

  const filtered = archived.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.owner.toLowerCase().includes(search.toLowerCase())
  );

  // GROUP BY TYPE (same logic but cleaner)
  const grouped = filtered.reduce((acc, pet) => {
    const type = pet.animalType || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(pet);
    return acc;
  }, {});

  Object.keys(grouped).forEach((type) => {
    grouped[type].sort((a, b) => a.name.localeCompare(b.name));
  });

  // =========================
  // 📦 DETAIL VIEW (PATIENT HISTORY)
  // =========================
  if (selected) {
    const petRecords = records.filter((r) => r.petId === selected.id);

    const assignedVet = vets.find(
      (v) => v.id === selected.assignedVetId
    );

    return (
      <PageLayout
        title="Archive Record"
        subtitle={`${selected.name} · Full History`}
      >
        <button
          className={styles.backBtn}
          onClick={() => setSelected(null)}
        >
          ← Back
        </button>

        <Card>
          <div className={styles.profileHeader}>
            <span className={styles.profileEmoji}>
              {selected.species}
            </span>

            <div>
              <div className={styles.profileName}>
                {selected.name}
              </div>

              <div className={styles.profileMeta}>
                {selected.animalType} · {selected.breed} · Age{' '}
                {selected.age}
              </div>

              <div className={styles.profileMeta}>
                Owner: {selected.owner} · {selected.phone}
              </div>

              <div className={styles.profileMeta}>
                Status: {selected.status}
              </div>

              {assignedVet && (
                <div className={styles.profileMeta}>
                  Assigned Vet: Dr. {assignedVet.firstName}{' '}
                  {assignedVet.lastName}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* =========================
            🩺 HISTORY SECTION
        ========================== */}
        <div className={styles.historyTitle}>
          Medical History ({petRecords.length})
        </div>

        {petRecords.length === 0 && (
          <div className={styles.noRec}>
            No medical records found
          </div>
        )}

        {petRecords.map((rec) => {
          const vet = vets.find((v) => v.id === rec.vetId);

          return (
            <Card key={rec.id}>
              <div className={styles.recRow}>
                <div className={styles.recDate}>{rec.date}</div>

                <div className={styles.recBody}>
                  <div className={styles.recDiag}>
                    {rec.diagnosis}
                  </div>

                  <div className={styles.recMeta}>
                    Dr. {vet?.lastName} · {rec.treatment || '—'}
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

  // =========================
  // 📦 MAIN ARCHIVE VIEW
  // =========================
  return (
    <PageLayout
      title="Archive System"
      subtitle="All completed, archived, and past patients grouped by type"
    >
      <input
        className={styles.search}
        placeholder="Search by name or owner..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.length === 0 && (
        <div className={styles.empty}>
          No archived patients found
        </div>
      )}

      {Object.keys(grouped)
        .sort()
        .map((type) => (
          <div key={type} className={styles.group}>
            <div className={styles.groupTitle}>
              {getTypeEmoji(type)} {type} Section
            </div>

            <div className={styles.groupList}>
              {grouped[type].map((pet) => {
                const petRecs = records.filter(
                  (r) => r.petId === pet.id
                );

                const latestRec =
                  petRecs[petRecs.length - 1];

                const vet = vets.find(
                  (v) => v.id === pet.assignedVetId
                );

                return (
                  <Card
                    key={pet.id}
                    onClick={() => setSelected(pet)}
                  >
                    <div className={styles.archiveRow}>
                      <span className={styles.archiveEmoji}>
                        {pet.species}
                      </span>

                      <div className={styles.archiveInfo}>
                        <div className={styles.archiveName}>
                          {pet.name}
                        </div>

                        <div className={styles.archiveMeta}>
                          {pet.owner}
                          {vet && ` · Dr. ${vet.lastName}`}
                          {latestRec &&
                            ` · Last visit: ${latestRec.date}`}
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

// =========================
// 🐾 TYPE ICONS
// =========================
function getTypeEmoji(type) {
  const map = {
    Dog: '🐶',
    Cat: '🐱',
    Rabbit: '🐰',
    Bird: '🐦',
    Hamster: '🐹',
    Reptile: '🦎',
    Fish: '🐠'
  };
  return map[type] || '🐾';
}

export default Archive;
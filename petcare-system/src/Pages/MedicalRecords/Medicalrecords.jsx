import React, { useState } from 'react';
import styles from './Medicalrecords.module.css';
import Card from '../../Components/Card/Card';
import PageLayout from '../../Components/Layout/PageLayout';
import Btn from '../../Components/Btn/Btn';
import Modal from '../../Components/Modal/Modal';
import FormField from '../../Components/Form/Formfield';
import {
  Pencil,
  Archive
} from 'lucide-react';

const EMPTY_FORM = {
  petId: '',
  vetId: '',
  date: '',
  symptoms: '',
  diagnosis: '',
  treatment: '',
  medicine: '',
  notes: ''
};

function MedicalRecords({
  records,
  setRecords,
  pets,
  setPets,
  vets
}) {
  const [showModal, setShowModal] = useState(false);
  const [editRec, setEditRec] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selected, setSelected] = useState(null);

  function openAdd() {
    setForm({ ...EMPTY_FORM, date: '2026-05-16' });
    setEditRec(null);
    setShowModal(true);
  }

  function openEdit(rec) {
    setForm({
      ...rec,
      petId: String(rec.petId),
      vetId: String(rec.vetId)
    });
    setEditRec(rec);
    setShowModal(true);
  }

  function handleChange(field, value) {
    setForm({ ...form, [field]: value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.petId || !form.diagnosis) return;

    const rec = {
      ...form,
      petId: parseInt(form.petId),
      vetId: parseInt(form.vetId)
    };

    if (editRec) {
      setRecords(
        records.map((r) =>
          r.id === editRec.id ? { ...rec, id: editRec.id } : r
        )
      );
    } else {
      const newRec = { ...rec, id: Date.now() };
      setRecords([...records, newRec]);

      setPets(
        pets.map((p) =>
          p.id === rec.petId ? { ...p, status: 'Done' } : p
        )
      );
    }

    setShowModal(false);
  }

  function handleArchive(id) {
    setRecords(
      records.map((r) =>
        r.id === id ? { ...r, status: 'Archived' } : r
      )
    );
  }

  const activeRecords = records.filter(
    (r) => r.status !== 'Archived'
  );

  if (selected) {
    const pet = pets.find((p) => p.id === selected.petId);
    const vet = vets.find((v) => v.id === selected.vetId);

    return (
      <PageLayout
        title="Medical Record"
        subtitle={`${pet?.name} · ${selected.date}`}
      >
        <Btn variant="secondary" onClick={() => setSelected(null)}>
          ← Back
        </Btn>

        <div style={{ marginTop: 20 }}>
          <Card>
            <div className={styles.recHeader}>
              <span className={styles.recEmoji}>{pet?.species}</span>

              <div>
                <div className={styles.recPetName}>
                  {pet?.name}{' '}
                  <span className={styles.recBreed}>
                    ({pet?.breed})
                  </span>
                </div>

                <div className={styles.recMeta}>
                  Owner: {pet?.owner} · Dr. {vet?.firstName}{' '}
                  {vet?.lastName} · {selected.date}
                </div>
              </div>
            </div>

            <div className={styles.recGrid}>
              <div className={styles.recField}>
                <div className={styles.recFieldLabel}>Symptoms</div>
                <div className={styles.recText}>{selected.symptoms || '—'}</div>
              </div>

              <div className={styles.recField}>
                <div className={styles.recFieldLabel}>Diagnosis</div>
                <div className={styles.recText}>{selected.diagnosis}</div>
              </div>

              <div className={styles.recField}>
                <div className={styles.recFieldLabel}>Treatment</div>
                <div className={styles.recText}>{selected.treatment || '—'}</div>
              </div>

              <div className={styles.recField}>
                <div className={styles.recFieldLabel}>Medicine</div>
                <div className={styles.recText}>{selected.medicine || '—'}</div>
              </div>

              <div className={`${styles.recField} ${styles.recFieldFull}`}>
                <div className={styles.recFieldLabel}>Notes</div>
                <div className={styles.recText}>{selected.notes || '—'}</div>
              </div>
            </div>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Medical Records"
      subtitle="Examination records and diagnoses"
      action={<Btn onClick={openAdd}>+ Add Record</Btn>}
    >
      <div className={styles.list}>
        {activeRecords.length === 0 && (
          <div className={styles.empty}>No records yet 🩺</div>
        )}

        {activeRecords.map((rec) => {
          const pet = pets.find((p) => p.id === rec.petId);
          const vet = vets.find((v) => v.id === rec.vetId);

          return (
            <Card key={rec.id} onClick={() => setSelected(rec)}>
              <div className={styles.cardInner}>

                {/* SMALL EMOJI (like Patients) */}
                <span className={styles.cardEmoji}>
                  {pet?.species}
                </span>

                <div className={styles.cardInfo}>
                  <div className={styles.cardName}>
                    {pet?.name}{' '}
                    <span className={styles.cardBreed}>
                      · {pet?.breed}
                    </span>
                  </div>

                  <div className={styles.cardMeta}>
                    Dr. {vet?.lastName} · {rec.date}
                  </div>

                  <div className={styles.cardDiag}>
                    {rec.diagnosis}
                  </div>
                </div>

                <div
                  className={styles.cardActions}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className={styles.editBtn}
                    onClick={() => openEdit(rec)}
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    className={styles.archiveBtn}
                    onClick={() => handleArchive(rec.id)}
                  >
                    <Archive size={18} />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {showModal && (
        <Modal
          title={editRec ? ' Edit Record' : ' Add Record'}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <FormField label="Patient *">
                <select
                  value={form.petId}
                  onChange={(e) =>
                    handleChange('petId', e.target.value)
                  }
                >
                  <option value="">— Select patient —</option>
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.species} {p.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Veterinarian">
                <select
                  value={form.vetId}
                  onChange={(e) =>
                    handleChange('vetId', e.target.value)
                  }
                >
                  <option value="">— Select vet —</option>
                  {vets.map((v) => (
                    <option key={v.id} value={v.id}>
                      Dr. {v.firstName} {v.lastName}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Date">
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    handleChange('date', e.target.value)
                  }
                />
              </FormField>

              <FormField label="Medicine">
                <input
                  value={form.medicine}
                  onChange={(e) =>
                    handleChange('medicine', e.target.value)
                  }
                />
              </FormField>

              <FormField label="Symptoms" full>
                <textarea
                  value={form.symptoms}
                  onChange={(e) =>
                    handleChange('symptoms', e.target.value)
                  }
                />
              </FormField>

              <FormField label="Diagnosis *" full>
                <textarea
                  value={form.diagnosis}
                  onChange={(e) =>
                    handleChange('diagnosis', e.target.value)
                  }
                />
              </FormField>

              <FormField label="Treatment" full>
                <textarea
                  value={form.treatment}
                  onChange={(e) =>
                    handleChange('treatment', e.target.value)
                  }
                />
              </FormField>

              <FormField label="Notes" full>
                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    handleChange('notes', e.target.value)
                  }
                />
              </FormField>
            </div>

            <div className={styles.modalActions}>
              <Btn variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Btn>
              <Btn type="submit">
                {editRec ? 'Save Changes' : 'Save Record'}
              </Btn>
            </div>
          </form>
        </Modal>
      )}
    </PageLayout>
  );
}

export default MedicalRecords;
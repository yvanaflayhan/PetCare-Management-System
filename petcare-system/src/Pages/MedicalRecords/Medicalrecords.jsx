import React, { useState } from 'react';
import styles from './Medicalrecords.module.css';
import Card from '../../Components/Card/Card';
import PageLayout from '../../Components/Layout/PageLayout';
import Btn from '../../Components/Btn/Btn';
import Modal from '../../Components/Modal/Modal';
import FormField from '../../Components/Form/Formfield';
import { Pencil, Archive } from 'lucide-react';
import {
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
} from '../../Services/api';

const TODAY = new Date().toISOString().split('T')[0];

const EMPTY_FORM = {
  petId: '', vetId: '', date: TODAY,
  symptoms: '', diagnosis: '', treatment: '', medicine: '', notes: ''
};

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

function MedicalRecords({ records, pets, vets, reload }) {
  const [showModal, setShowModal] = useState(false);
  const [editRec, setEditRec] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  function openAdd() { setForm({ ...EMPTY_FORM, date: TODAY }); setEditRec(null); setShowModal(true); }

  function openEdit(rec) {
    setForm({
      petId: String(rec.petId),
      vetId: String(rec.vetId || ''),
      date: rec.examinationDate || TODAY,
      symptoms: rec.symptoms || '',
      diagnosis: rec.diagnosis || '',
      treatment: rec.treatment || '',
      medicine: rec.medicine || '',
      notes: rec.notes || '',
    });
    setEditRec(rec);
    setShowModal(true);
  }

  function handleChange(field, value) { setForm({ ...form, [field]: value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.petId || !form.diagnosis) return;
    setSaving(true);
    try {
      const data = {
        petId: parseInt(form.petId),
        vetId: form.vetId ? parseInt(form.vetId) : null,
        examinationDate: form.date,
        symptoms: form.symptoms || null,
        diagnosis: form.diagnosis,
        treatment: form.treatment || null,
        medicine: form.medicine || null,
        notes: form.notes || null,
      };
      if (editRec) {
        await updateMedicalRecord(editRec.id, data);
      } else {
        await createMedicalRecord(data); // backend auto sets pet status → Done
      }
      await reload();
      setShowModal(false);
    } catch (err) {
      alert('Error saving: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(id) {
    try {
      await deleteMedicalRecord(id);
      await reload();
    } catch (err) {
      alert('Error deleting: ' + err.message);
    }
  }

  // ── DETAIL VIEW ───────────────────────────────────────────────────────────
  if (selected) {
    const pet = pets.find(p => p.id === selected.petId);
    const vet = vets.find(v => v.id === selected.vetId);
    const emoji = getPetEmoji(pet?.petType?.typeName);

    return (
      <PageLayout
        title="Medical Record"
        subtitle={`${pet?.name || '—'} · ${selected.examinationDate}`}
      >
        <Btn variant="secondary" onClick={() => setSelected(null)}>← Back</Btn>

        <div style={{ marginTop: 20 }}>
          <Card>
            <div className={styles.recHeader}>
              <span className={styles.recEmoji}>{emoji}</span>
              <div>
                <div className={styles.recPetName}>
                  {pet?.name} <span className={styles.recBreed}>({pet?.breed})</span>
                </div>
                <div className={styles.recMeta}>
                  Owner: {pet?.owner?.name || '—'} · {vet?.name || '—'} · {selected.examinationDate}
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

  // ── LIST VIEW ─────────────────────────────────────────────────────────────
  return (
    <PageLayout
      title="Medical Records"
      subtitle="Examination records and diagnoses"
      action={<Btn onClick={openAdd}>+ Add Record</Btn>}
    >
      <div className={styles.list}>
        {records.length === 0 && (
          <div className={styles.empty}>No records yet 🩺</div>
        )}

        {records.map(rec => {
          const pet = pets.find(p => p.id === rec.petId);
          const vet = vets.find(v => v.id === rec.vetId);
          const emoji = getPetEmoji(pet?.petType?.typeName);
          return (
            <Card key={rec.id} onClick={() => setSelected(rec)}>
              <div className={styles.cardInner}>
                <span className={styles.cardEmoji}>{emoji}</span>
                <div className={styles.cardInfo}>
                  <div className={styles.cardName}>
                    {pet?.name || '—'}{' '}
                    <span className={styles.cardBreed}>· {pet?.breed || '—'}</span>
                  </div>
                  <div className={styles.cardMeta}>
                    {vet?.name || '—'} · {rec.examinationDate}
                  </div>
                  <div className={styles.cardDiag}>{rec.diagnosis}</div>
                </div>
                <div className={styles.cardActions} onClick={e => e.stopPropagation()}>
                  <button className={styles.editBtn} onClick={() => openEdit(rec)}>
                    <Pencil size={18} />
                  </button>
                  <button className={styles.archiveBtn} onClick={() => handleArchive(rec.id)}>
                    <Archive size={18} />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* MODAL */}
      {showModal && (
        <Modal
          title={editRec ? 'Edit Record' : 'Add Record'}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <FormField label="Patient *">
                <select value={form.petId} onChange={e => handleChange('petId', e.target.value)}>
                  <option value="">— Select patient —</option>
                  {pets.map(p => (
                    <option key={p.id} value={p.id}>
                      {getPetEmoji(p.petType?.typeName)} {p.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Veterinarian">
                <select value={form.vetId} onChange={e => handleChange('vetId', e.target.value)}>
                  <option value="">— Select vet —</option>
                  {vets.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </FormField>
              <FormField label="Date">
                <input type="date" value={form.date} onChange={e => handleChange('date', e.target.value)} />
              </FormField>
              <FormField label="Medicine">
                <input value={form.medicine} onChange={e => handleChange('medicine', e.target.value)} />
              </FormField>
              <FormField label="Symptoms" full>
                <textarea value={form.symptoms} onChange={e => handleChange('symptoms', e.target.value)} />
              </FormField>
              <FormField label="Diagnosis *" full>
                <textarea value={form.diagnosis} onChange={e => handleChange('diagnosis', e.target.value)} />
              </FormField>
              <FormField label="Treatment" full>
                <textarea value={form.treatment} onChange={e => handleChange('treatment', e.target.value)} />
              </FormField>
              <FormField label="Notes" full>
                <textarea value={form.notes} onChange={e => handleChange('notes', e.target.value)} />
              </FormField>
            </div>
            <div className={styles.modalActions}>
              <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
              <Btn type="submit" disabled={saving}>{saving ? 'Saving...' : editRec ? 'Save Changes' : 'Save Record'}</Btn>
            </div>
          </form>
        </Modal>
      )}
    </PageLayout>
  );
}

export default MedicalRecords;
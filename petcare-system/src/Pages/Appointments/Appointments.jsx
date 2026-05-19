import React, { useState } from 'react';
import PageLayout from '../../Components/Layout/PageLayout';
import Btn from '../../Components/Btn/Btn';
import Modal from '../../Components/Modal/Modal';
import FormField from '../../Components/Form/Formfield';
import styles from './Appointments.module.css';
import { Pencil, Archive } from 'lucide-react';
import {
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from '../../Services/api';

const TODAY = new Date().toISOString().split('T')[0];

const EMPTY_FORM = {
  petId: '', vetId: '', date: TODAY, time: '09:00', notes: ''
};

function Appointments({ appointments, pets, vets, reload }) {
  const [showModal, setShowModal] = useState(false);
  const [editAppt, setEditAppt]   = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);

  function openAdd() { setForm(EMPTY_FORM); setEditAppt(null); setShowModal(true); }

  function openEdit(appt) {
    const d    = appt.date ? new Date(appt.date) : new Date();
    const date = d.toISOString().split('T')[0];
    const time = d.toTimeString().slice(0, 5);
    setForm({
      petId: String(appt.petId),
      vetId: String(appt.vetId),
      date,
      time,
      notes: appt.reason || appt.notes || '',
    });
    setEditAppt(appt);
    setShowModal(true);
  }

  function handleChange(field, value) { setForm({ ...form, [field]: value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.petId || !form.vetId) return;
    setSaving(true);
    try {
      const data = {
        petId:  parseInt(form.petId),
        vetId:  parseInt(form.vetId),
        date:   `${form.date}T${form.time}:00`,
        reason: form.notes || null,
        status: 'Scheduled',
      };
      if (editAppt) {
        await updateAppointment(editAppt.id, data);
      } else {
        await createAppointment(data);
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
      await deleteAppointment(id);
      await reload();
    } catch (err) {
      alert('Error deleting: ' + err.message);
    }
  }

  const todayAppts = appointments.filter(a => {
    if (!a.date) return false;
    return new Date(a.date).toISOString().split('T')[0] === TODAY;
  });

  function getTime(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function getDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toISOString().split('T')[0];
  }

  const SPECIES_MAP = { Dog:'🐶', Cat:'🐱', Rabbit:'🐰', Bird:'🐦', Hamster:'🐹', Reptile:'🦎', Fish:'🐠' };

  function renderRow(appt) {
    const pet    = pets.find(p => p.id === appt.petId);
    const vet    = vets.find(v => v.id === appt.vetId);
    const emoji  = SPECIES_MAP[pet?.petType?.typeName] || '🐾';
    const vetName = vet ? `Dr. ${vet.name}` : '—';
    return (
      <tr key={appt.id}>
        <td className={styles.emoji}>{emoji}</td>
        <td><div className={styles.petName}>{pet?.name || '—'}</div></td>
        <td className={styles.muted}>{vetName}</td>
        <td>{getDate(appt.date)}</td>
        <td>{getTime(appt.date)}</td>
        <td className={styles.muted}>{appt.reason || appt.notes || '—'}</td>
        <td>
          <div className={styles.actions}>
            <button className={styles.editBtn} onClick={() => openEdit(appt)}>
              <Pencil size={18} />
            </button>
            <button className={styles.archiveBtn} onClick={() => handleArchive(appt.id)}>
              <Archive size={18} />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  const tableHead = (
    <thead>
      <tr>
        <th></th>
        <th>Patient</th>
        <th>Veterinarian</th>
        <th>Date</th>
        <th>Time</th>
        <th>Notes</th>
        <th>Actions</th>
      </tr>
    </thead>
  );

  return (
    <PageLayout
      title="Appointments"
      subtitle="Schedule and manage all appointments"
      action={<Btn onClick={openAdd}>+ New Appointment</Btn>}
    >
      {/* TODAY */}
      {todayAppts.length > 0 && (
        <>
          <div className={styles.sectionLabel}>Today — {TODAY}</div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              {tableHead}
              <tbody>{todayAppts.map(renderRow)}</tbody>
            </table>
          </div>
        </>
      )}

      {/* ALL */}
      <div className={styles.sectionLabel}>All Appointments</div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          {tableHead}
          <tbody>
            {appointments.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <div className={styles.empty}>No appointments yet</div>
                </td>
              </tr>
            )}
            {appointments.map(renderRow)}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <Modal
          title={editAppt ? '✏️ Edit Appointment' : 'New Appointment'}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <FormField label="Patient">
                <select value={form.petId} onChange={e => handleChange('petId', e.target.value)}>
                  <option value="">Select patient</option>
                  {pets.map(p => (
                    <option key={p.id} value={p.id}>
                      {SPECIES_MAP[p.petType?.typeName] || '🐾'} {p.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Veterinarian">
                <select value={form.vetId} onChange={e => handleChange('vetId', e.target.value)}>
                  <option value="">Select vet</option>
                  {vets.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </FormField>
              <FormField label="Date">
                <input type="date" value={form.date} onChange={e => handleChange('date', e.target.value)} />
              </FormField>
              <FormField label="Time">
                <input type="time" value={form.time} onChange={e => handleChange('time', e.target.value)} />
              </FormField>
              <FormField label="Notes">
                <input value={form.notes} onChange={e => handleChange('notes', e.target.value)} placeholder="e.g. Vaccination" />
              </FormField>
            </div>
            <div className={styles.modalActions}>
              <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
              <Btn type="submit" disabled={saving}>{saving ? 'Saving...' : editAppt ? 'Save Changes' : 'Create Appointment'}</Btn>
            </div>
          </form>
        </Modal>
      )}
    </PageLayout>
  );
}

export default Appointments;
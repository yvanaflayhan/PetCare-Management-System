import React, { useState } from 'react';
import styles from './Appointments.module.css';
import PageLayout from './Pagelayout';
import StatusBadge from './Statusbadge';
import Btn from './Btn';
import Modal from './Modal';
import FormField from './Formfield';

const TODAY = '2026-05-16';
const APPT_STATUSES = ['Pending','Confirmed','Completed'];
const EMPTY_FORM = { petId:'', vetId:'', date: TODAY, time:'09:00', status:'Pending', notes:'' };

function Appointments({ appointments, setAppointments, pets, vets }) {
  const [showModal, setShowModal] = useState(false);
  const [editAppt, setEditAppt]   = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);

  function openAdd() { setForm(EMPTY_FORM); setEditAppt(null); setShowModal(true); }

  function openEdit(appt) { setForm({ ...appt, petId: String(appt.petId), vetId: String(appt.vetId) }); setEditAppt(appt); setShowModal(true); }

  function handleChange(field, value) { setForm({ ...form, [field]: value }); }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.petId || !form.vetId) return;
    const appt = { ...form, petId: parseInt(form.petId), vetId: parseInt(form.vetId) };
    if (editAppt) {
      setAppointments(appointments.map((a) => a.id === editAppt.id ? { ...appt, id: editAppt.id } : a));
    } else {
      setAppointments([...appointments, { ...appt, id: Date.now() }]);
    }
    setShowModal(false);
  }

  function handleDelete(id) {
    if (window.confirm('Delete this appointment?')) setAppointments(appointments.filter((a) => a.id !== id));
  }

  const todayAppts = appointments.filter((a) => a.date === TODAY);
  const otherAppts = appointments.filter((a) => a.date !== TODAY);

  function renderRow(appt) {
    const pet = pets.find((p) => p.id === appt.petId);
    const vet = vets.find((v) => v.id === appt.vetId);
    return (
      <tr key={appt.id}>
        <td className={styles.emoji}>{pet?.species}</td>
        <td><strong>{pet?.name || '—'}</strong></td>
        <td>{vet ? `Dr. ${vet.firstName} ${vet.lastName}` : '—'}</td>
        <td>{appt.date}</td>
        <td>{appt.time}</td>
        <td><StatusBadge status={appt.status} /></td>
        <td className={styles.muted}>{appt.notes}</td>
        <td>
          <div className={styles.actions}>
            <button className={styles.editBtn} onClick={() => openEdit(appt)}>✏️</button>
            <button className={styles.delBtn}  onClick={() => handleDelete(appt.id)}>🗑️</button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <PageLayout title="📅 Appointments" subtitle="Schedule and manage all appointments" action={<Btn onClick={openAdd}>+ New Appointment</Btn>}>

      {todayAppts.length > 0 && (
        <>
          <div className={styles.sectionLabel}>Today — {TODAY}</div>
          <div className={styles.tableWrap} style={{ marginBottom: 24 }}>
            <table className={styles.table}>
              <thead><tr><th></th><th>Patient</th><th>Veterinarian</th><th>Date</th><th>Time</th><th>Status</th><th>Notes</th><th>Actions</th></tr></thead>
              <tbody>{todayAppts.map(renderRow)}</tbody>
            </table>
          </div>
        </>
      )}

      <div className={styles.sectionLabel}>All Appointments</div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th></th><th>Patient</th><th>Veterinarian</th><th>Date</th><th>Time</th><th>Status</th><th>Notes</th><th>Actions</th></tr></thead>
          <tbody>
            {appointments.length === 0 && <tr><td colSpan={8}><div className={styles.empty}>No appointments yet 📅</div></td></tr>}
            {appointments.map(renderRow)}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editAppt ? '✏️ Edit Appointment' : '📅 New Appointment'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <FormField label="Patient *">
                <select value={form.petId} onChange={(e) => handleChange('petId', e.target.value)}>
                  <option value="">— Select patient —</option>
                  {pets.filter((p) => p.status !== 'Archived').map((p) => <option key={p.id} value={p.id}>{p.species} {p.name}</option>)}
                </select>
              </FormField>
              <FormField label="Veterinarian *">
                <select value={form.vetId} onChange={(e) => handleChange('vetId', e.target.value)}>
                  <option value="">— Select vet —</option>
                  {vets.map((v) => <option key={v.id} value={v.id}>Dr. {v.firstName} {v.lastName}</option>)}
                </select>
              </FormField>
              <FormField label="Date"><input type="date" value={form.date} onChange={(e) => handleChange('date', e.target.value)} /></FormField>
              <FormField label="Time"><input type="time" value={form.time} onChange={(e) => handleChange('time', e.target.value)} /></FormField>
              <FormField label="Status">
                <select value={form.status} onChange={(e) => handleChange('status', e.target.value)}>
                  {APPT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </FormField>
              <FormField label="Notes"><input value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="e.g. Vaccination" /></FormField>
            </div>
            <div className={styles.modalActions}>
              <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
              <Btn type="submit">{editAppt ? 'Save Changes' : 'Create Appointment'}</Btn>
            </div>
          </form>
        </Modal>
      )}
    </PageLayout>
  );
}

export default Appointments;
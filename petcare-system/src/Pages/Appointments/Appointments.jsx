import React, { useState } from 'react';
import PageLayout from '../../Components/Layout/PageLayout';
import Btn from '../../Components/Btn/Btn';
import Modal from '../../Components/Modal/Modal';
import FormField from '../../Components/Form/Formfield';
import styles from './Appointments.module.css';
import { Pencil, Archive } from 'lucide-react';

const TODAY = '2026-05-16';

const EMPTY_FORM = {
  petId: '',
  vetId: '',
  date: TODAY,
  time: '09:00',
  notes: ''
};

function Appointments({ appointments, setAppointments, pets, vets }) {
  const [showModal, setShowModal] = useState(false);
  const [editAppt, setEditAppt] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditAppt(null);
    setShowModal(true);
  }

  function openEdit(appt) {
    setForm({
      ...appt,
      petId: String(appt.petId),
      vetId: String(appt.vetId)
    });
    setEditAppt(appt);
    setShowModal(true);
  }

  function handleChange(field, value) {
    setForm({ ...form, [field]: value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.petId || !form.vetId) return;

    const appt = {
      ...form,
      petId: parseInt(form.petId),
      vetId: parseInt(form.vetId)
    };

    if (editAppt) {
      setAppointments(
        appointments.map((a) =>
          a.id === editAppt.id ? { ...appt, id: editAppt.id } : a
        )
      );
    } else {
      setAppointments([...appointments, { ...appt, id: Date.now() }]);
    }

    setShowModal(false);
  }

  function handleArchive(id) {
    setAppointments(
      appointments.map((a) =>
        a.id === id ? { ...a, notes: (a.notes || '') + ' (Completed)' } : a
      )
    );
  }

  const todayAppts = appointments.filter((a) => a.date === TODAY);

  function renderRow(appt) {
    const pet = pets.find((p) => p.id === appt.petId);
    const vet = vets.find((v) => v.id === appt.vetId);

    return (
      <tr key={appt.id}>
        <td className={styles.emoji}>{pet?.species}</td>

        <td>
          <div className={styles.petName}>{pet?.name || '—'}</div>
        </td>

        <td className={styles.muted}>
          {vet ? `Dr. ${vet.firstName} ${vet.lastName}` : '—'}
        </td>

        <td>{appt.date}</td>
        <td>{appt.time}</td>

        <td className={styles.muted}>{appt.notes}</td>

        <td>
          <div className={styles.actions}>
            <button className={styles.editBtn} onClick={() => openEdit(appt)}>
              <Pencil size={18} />
            </button>

            <button
              className={styles.archiveBtn}
              onClick={() => handleArchive(appt.id)}
            >
              <Archive size={18} />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <PageLayout
      title="Appointments"
      subtitle="Schedule and manage all appointments"
      action={<Btn onClick={openAdd}>+ New Appointment</Btn>}
    >
      {/* TODAY */}
      {todayAppts.length > 0 && (
        <>
          <div className={styles.sectionLabel}>
            Today — {TODAY}
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
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

              <tbody>{todayAppts.map(renderRow)}</tbody>
            </table>
          </div>
        </>
      )}

      {/* ALL */}
      <div className={styles.sectionLabel}>
        All Appointments
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
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

          <tbody>
            {appointments.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <div className={styles.empty}>
                    No appointments yet 
                  </div>
                </td>
              </tr>
            )}

            {appointments.map(renderRow)}
          </tbody>
        </table>
      </div>

      {/* ✅ RESTORED MODAL (THIS WAS MISSING) */}
      {showModal && (
        <Modal
          title={editAppt ? '✏️ Edit Appointment' : ' New Appointment'}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>

              <FormField label="Patient">
                <select
                  value={form.petId}
                  onChange={(e) => handleChange('petId', e.target.value)}
                >
                  <option value="">Select patient</option>
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
                  onChange={(e) => handleChange('vetId', e.target.value)}
                >
                  <option value="">Select vet</option>
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
                  onChange={(e) => handleChange('date', e.target.value)}
                />
              </FormField>

              <FormField label="Time">
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                />
              </FormField>

              <FormField label="Notes">
                <input
                  value={form.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="e.g. Vaccination"
                />
              </FormField>

            </div>

            <div className={styles.modalActions}>
              <Btn variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Btn>

              <Btn type="submit">
                {editAppt ? 'Save Changes' : 'Create Appointment'}
              </Btn>
            </div>
          </form>
        </Modal>
      )}
    </PageLayout>
  );
}

export default Appointments;
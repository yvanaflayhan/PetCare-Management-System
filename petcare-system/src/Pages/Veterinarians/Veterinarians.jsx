import React, { useState } from 'react';
import styles from './Veterinarians.module.css';
import PageLayout from '../../Components/Layout/PageLayout';
import Btn from '../../Components/Btn/Btn';
import Card from '../../Components/Card/Card';
import Modal from '../../Components/Modal/Modal';
import FormField from '../../Components/Form/Formfield';
import { Pencil, Archive } from 'lucide-react';
import { createVet, updateVet, deleteVet } from '../../Services/api';

const SPECIALTIES = [
  'General Practice', 'Surgery', 'Dermatology', 'Cardiology',
  'Dentistry', 'Nutrition', 'Behavior & Training', 'Emergency Care', 'Exotic Animals'
];
const ROLES = ['Veterinarian', 'Trainer', 'Intern', 'Technician'];

const EMPTY_FORM = {
  firstName: '', lastName: '', role: 'Veterinarian',
  specialty: 'General Practice', animalExpertise: [],
  university: '', graduationYear: '', phone: '', email: '',
  available: true, status: 'Active'
};

const SPECIES_MAP = { Dog: '🐶', Cat: '🐱', Rabbit: '🐰', Bird: '🐦', Hamster: '🐹', Reptile: '🦎', Fish: '🐠' };

function getInitials(f, l) {
  return `${f?.[0] || ''}${l?.[0] || ''}`.toUpperCase();
}

function Veterinarians({
  pets, vets, setVets, petStatuses,
  todayAttendance,           // { vetId: true/false } from App
  archivedVets, setArchivedVets,
  reload
}) {
  const [showModal, setShowModal] = useState(false);
  const [editVet, setEditVet] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function openAdd() { setForm(EMPTY_FORM); setEditVet(null); setShowModal(true); }

  function openEdit(vet) {
    const parts = (vet.name || '').trim().split(' ');
    setForm({
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
      role: vet.role || 'Veterinarian',
      specialty: vet.specialization || 'General Practice',
      university: vet.university || '',
      graduationYear: vet.graduationYear || '',
      phone: vet.vetDetails?.phone || vet.phone || '',
      email: vet.vetDetails?.email || vet.email || '',
      available: vet.vetDetails?.isAvailable ?? true,
      status: 'Active',
      animalExpertise: [],
    });
    setEditVet(vet);
    setShowModal(true);
  }

  function handleChange(field, value) { setForm({ ...form, [field]: value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.firstName || !form.lastName) return;
    setSaving(true);
    try {
      const data = {
        name: `${form.firstName} ${form.lastName}`,
        role: form.role,
        specialization: form.specialty || null,
        university: form.university || null,
        graduationYear: form.graduationYear ? parseInt(form.graduationYear) : null,

        vetDetails: {
          phone: form.phone || null,
          email: form.email || null,
          isAvailable: form.available,
        }
      };
      if (editVet) {
        await updateVet(editVet.id, data);
        if (selected?.id === editVet.id) setSelected(null);
      } else {
        await createVet(data);
      }
      await reload();
      setShowModal(false);
    } catch (err) {
      alert('Error saving: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  // Archive = remove from active list, keep in archivedVets for Archive page
  async function handleArchive(vet) {
    try {
      await deleteVet(vet.id);
      // add to archived list so Archive page can show it
      setArchivedVets(prev => [...prev, { ...vet, archivedAt: new Date().toISOString().split('T')[0] }]);
      await reload();
      if (selected?.id === vet.id) setSelected(null);
    } catch (err) {
      alert('Error archiving: ' + err.message);
    }
  }

  function getVetPatients(vet) {
    return petStatuses
      .filter(ps => ps.assignedVetId === vet.id)
      .map(ps => pets.find(p => p.id === ps.petId))
      .filter(Boolean);
  }

  // availability comes from todayAttendance (from Dashboard), not backend field
  function isPresent(vetId) {
    return !!todayAttendance[vetId];
  }

  /* ── DETAIL PAGE ─────────────────────────────────────────────────────────── */
  if (selected) {
    const vetPets = getVetPatients(selected);
    const nameParts = (selected.name || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    const present = isPresent(selected.id);

    return (
      <PageLayout
        title={`Dr. ${firstName} ${lastName}`}
        subtitle={`${selected.role} · ${selected.specialization || 'General'}`}
      >
        <div className={styles.backButtonWrap}>
          <Btn variant="secondary" onClick={() => setSelected(null)}>← Back</Btn>
        </div>

        <div className={styles.detailWrap}>
          <Card>
            <div className={styles.profileHeader}>
              <div className={styles.profileAvatar}>{getInitials(firstName, lastName)}</div>
              <div className={styles.profileMain}>
                <div className={styles.profileName}>Dr. {firstName} {lastName}</div>
                <div className={styles.profileSpecialty}>{selected.specialization || '—'}</div>
                {/* availability = today's attendance */}
                <div
                  className={styles.availBadge}
                  style={{
                    background: present ? '#d6f5e3' : '#fee2e2',
                    color: present ? '#0e6e3a' : '#b91c1c',
                  }}
                >
                  {present ? '✅ Available (Present Today)' : '❌ Unavailable (Absent Today)'}
                </div>
              </div>
            </div>

            <div className={styles.simpleInfo}>
              <div><span>Role:</span>{selected.role}</div>
              <div><span>University:</span>{selected.university || '—'}</div>
              <div><span>Graduation:</span>{selected.graduationYear || '—'}</div>
              <div><span>Phone:</span>{selected.vetDetails?.phone || '—'}</div>
              <div><span>Email:</span>{selected.vetDetails?.email || '—'}</div>
            </div>
          </Card>

          <div className={styles.sectionTitle}>
            Assigned Patients ({vetPets.length})
          </div>

          {vetPets.length === 0 && (
            <div className={styles.noPatients}>No patients assigned yet.</div>
          )}

          {vetPets.map(pet => {
            const ps = petStatuses.find(s => s.petId === pet.id);
            return (
              <Card key={pet.id}>
                <div className={styles.patientRow}>
                  <div className={styles.patientLeft}>
                    <span className={styles.patientEmoji}>
                      {SPECIES_MAP[pet.petType?.typeName] || '🐾'}
                    </span>
                    <div>
                      <div className={styles.patientName}>{pet.name}</div>
                      <div className={styles.patientMeta}>
                        {pet.breed} · Owner: {pet.owner?.name || '—'}
                      </div>
                    </div>
                  </div>
                  <span className={styles.statusPill} style={getStatusStyle(ps?.status)}>
                    {ps?.status || 'Waiting'}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </PageLayout>
    );
  }

  /* ── MAIN GRID ───────────────────────────────────────────────────────────── */
  return (
    <PageLayout
      title="Veterinarians"
      subtitle="All staff members"
      action={<Btn onClick={openAdd}>+ Add Member</Btn>}
    >
      <div className={styles.grid}>
        {vets.length === 0 && (
          <div className={styles.empty}>No staff members yet</div>
        )}

        {vets.map(vet => {
          const count = getVetPatients(vet).length;
          const nameParts = (vet.name || '').trim().split(' ');
          const fName = nameParts[0] || '';
          const lName = nameParts.slice(1).join(' ') || '';
          const present = isPresent(vet.id);

          return (
            <Card key={vet.id} onClick={() => setSelected(vet)}>
              <div className={styles.cardTop}>
                <div className={styles.cardAvatar}>{getInitials(fName, lName)}</div>
                <div className={styles.cardActions} onClick={e => e.stopPropagation()}>
                  <Btn onClick={() => openEdit(vet)}>Edit</Btn>
                  <Btn variant="secondary" onClick={() => handleArchive(vet)}>Archive</Btn>
                </div>
              </div>
              <div className={styles.cardName}>Dr. {fName} {lName}</div>
              <div className={styles.cardSpecialty}>{vet.specialization || 'General'}</div>
              {/* availability badge on card */}
              <div
                style={{
                  display: 'inline-block',
                  fontSize: 11, fontWeight: 600,
                  padding: '2px 10px', borderRadius: 20, marginBottom: 8,
                  background: present ? '#d6f5e3' : '#fee2e2',
                  color: present ? '#0e6e3a' : '#b91c1c',
                }}
              >
                {present ? 'Available' : 'Unavailable'}
              </div>
              <div className={styles.cardMetaSimple}>
                <div>{vet.role}</div>
                <div>{vet.university || '—'}</div>
                <div>{vet.graduationYear || '—'}</div>
              </div>
              <div className={styles.cardPatients}>
                {count} patient{count !== 1 ? 's' : ''}
              </div>
            </Card>
          );
        })}
      </div>

      {/* MODAL */}
      {showModal && (
        <Modal
          title={editVet ? '✏️ Edit Member' : '➕ Add Member'}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <FormField label="First Name *">
                <input value={form.firstName} onChange={e => handleChange('firstName', e.target.value)} />
              </FormField>
              <FormField label="Last Name *">
                <input value={form.lastName} onChange={e => handleChange('lastName', e.target.value)} />
              </FormField>
              <FormField label="Role">
                <select value={form.role} onChange={e => handleChange('role', e.target.value)}>
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </FormField>
              <FormField label="Specialty">
                <select value={form.specialty} onChange={e => handleChange('specialty', e.target.value)}>
                  {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
                </select>
              </FormField>
              <FormField label="University">
                <input value={form.university} onChange={e => handleChange('university', e.target.value)} placeholder="e.g. AUB" />
              </FormField>
              <FormField label="Graduation Year">
                <input value={form.graduationYear} onChange={e => handleChange('graduationYear', e.target.value)} placeholder="e.g. 2015" />
              </FormField>
              <FormField label="Phone">
                <input value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="+961 70 111 222" />
              </FormField>
              <FormField label="Email">
                <input value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="example@email.com" />
              </FormField>
            </div>
            <div className={styles.modalActions}>
              <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
              <Btn type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Btn>
            </div>
          </form>
        </Modal>
      )}
    </PageLayout>
  );
}

function getStatusStyle(status) {
  const map = {
    Waiting: { background: '#fff0cc', color: '#7a5000' },
    'In Examination': { background: '#d6f5e3', color: '#0e6e3a' },
    Done: { background: '#e8f4fb', color: '#0d6eaa' },
    Archived: { background: '#ececec', color: '#555' },
  };
  return map[status] || map.Waiting;
}

export default Veterinarians;
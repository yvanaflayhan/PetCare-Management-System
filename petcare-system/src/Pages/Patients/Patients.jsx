import React, { useState } from 'react';
import styles from './Patients.module.css';
import PageLayout from '../../Components/Layout/PageLayout';
import Btn from '../../Components/Btn/Btn';
import Modal from '../../Components/Modal/Modal';
import FormField from '../../Components/Form/Formfield';
import { Pencil, Archive } from 'lucide-react';
import {
  createPet,
  updatePet,
  updatePetStatus,
  deletePet,
  createOwner
} from '../../Services/api';

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

const STATUSES = ['Waiting', 'In Examination', 'Done', 'Archived'];

const EMPTY_FORM = {
  name: '',
  typeId: '',
  breed: '',
  age: '',
  ownerName: '',
  ownerPhone: '',
  ownerId: '',
  status: 'Waiting',
  assignedVetId: ''
};

function Patients({ pets, vets, petTypes, petStatuses, reload }) {
  const [showModal, setShowModal] = useState(false);
  const [editPet, setEditPet] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditPet(null);
    setShowModal(true);
  }

  function openEdit(pet) {
    const ps = petStatuses.find(s => s.petId === pet.id);
    setForm({
      name: pet.name,
      typeId: String(pet.typeId),
      breed: pet.breed || '',
      age: pet.age || '',
      ownerId: pet.ownerId || '',
      status: ps?.status || 'Waiting',
      assignedVetId: ps?.assignedVetId || '',
    });
    setEditPet(pet);
    setShowModal(true);
  }

  function handleChange(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.typeId || !form.ownerName) return;

    setSaving(true);

    try {
      // 1. CREATE OWNER FIRST
      let ownerId = form.ownerId;

      if (!ownerId) {
        const ownerRes = await createOwner({
          name: form.ownerName,
          phone: form.ownerPhone || null,
          email: null
        });

        ownerId = ownerRes.id;
      }

      // 2. CREATE / UPDATE PET
      const petData = {
        name: form.name,
        typeId: parseInt(form.typeId),
        breed: form.breed || null,
        age: form.age ? parseInt(form.age) : null,
        ownerId: ownerId,
        isActive: true,
      };

      let saved;
      if (editPet) {
        saved = await updatePet(editPet.id, petData);
      } else {
        saved = await createPet(petData);
      }

      // 3. STATUS
      await updatePetStatus(saved.id, {
        petId: saved.id,
        status: form.status,
        assignedVetId: form.assignedVetId ? parseInt(form.assignedVetId) : null,
      });

      await reload();
      setShowModal(false);

    } catch (err) {
      alert('Error saving: ' + err.message);
    } finally {
      setSaving(false);
    }
  }
  async function handleArchive(pet) {
    try {
      const ps = petStatuses.find(s => s.petId === pet.id);
      await updatePetStatus(pet.id, {
        petId: pet.id,
        status: 'Archived',
        assignedVetId: ps?.assignedVetId || null,
      });
      await reload();
    } catch (err) {
      alert('Error archiving: ' + err.message);
    }
  }

  async function handleStatusChange(pet, newStatus) {
    try {
      const ps = petStatuses.find(s => s.petId === pet.id);
      await updatePetStatus(pet.id, {
        petId: pet.id,
        status: newStatus,
        assignedVetId: ps?.assignedVetId || null,
      });
      await reload();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  }

  // merge pets with statuses
  const petsWithStatus = pets.map(pet => {
    const ps = petStatuses.find(s => s.petId === pet.id);
    return {
      ...pet,
      currentStatus: ps?.status || 'Waiting',
      assignedVetId: ps?.assignedVetId || null,
      species: getPetEmoji(pet.petType?.typeName),
      animalType: pet.petType?.typeName || '',
    };
  });

  const filtered = petsWithStatus.filter(p => {
    const ownerName = p.owner?.name || '';
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      ownerName.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'All' || p.animalType === filterType;
    return matchSearch && matchType && p.currentStatus !== 'Archived';
  });

  return (
    <PageLayout
      title="Patients"
      subtitle="Manage all active patients at the clinic"
      action={<Btn onClick={openAdd}>+ Add Patient</Btn>}
    >

      {/* TOOLBAR */}
      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="Search patient or owner..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className={styles.filter}
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          <option value="All">All Types</option>
          {petTypes.map(t => (
            <option key={t.id} value={t.typeName}>{t.typeName}</option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Breed</th>
              <th>Owner</th>
              <th>Phone</th>
              <th>Age</th>
              <th>Veterinarian</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9}>
                  <div className={styles.empty}>No patients found 🐾</div>
                </td>
              </tr>
            )}
            {filtered.map(pet => {
              const vet = vets.find(v => v.id === pet.assignedVetId);
              return (
                <tr key={pet.id}>
                  <td className={styles.emoji}>{pet.species}</td>
                  <td><div className={styles.petName}>{pet.name}</div></td>
                  <td className={styles.muted}>{pet.breed || '—'}</td>
                  <td>{pet.owner?.name || '—'}</td>
                  <td className={styles.muted}>{pet.owner?.phone || '—'}</td>
                  <td className={styles.muted}>{pet.age ? `${pet.age}y` : '—'}</td>
                  <td className={styles.muted}>{vet ? `Dr. ${vet.name}` : '—'}</td>
                  <td>
                    <select
                      className={styles.statusSelect}
                      style={getStatusStyle(pet.currentStatus)}
                      value={pet.currentStatus}
                      onChange={e => handleStatusChange(pet, e.target.value)}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.editBtn} onClick={() => openEdit(pet)}>
                        <Pencil size={18} />
                      </button>
                      <button className={styles.archiveBtn} onClick={() => handleArchive(pet)}>
                        <Archive size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <Modal
          title={editPet ? '✏️ Edit Patient' : '🐾 Add Patient'}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <FormField label="Pet Name *">
                <input value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="e.g. Max" />
              </FormField>
              <FormField label="Animal Type">
                <select value={form.typeId} onChange={e => handleChange('typeId', e.target.value)}>
                  <option value="">— Select —</option>
                  {petTypes.map(t => (
                    <option key={t.id} value={t.id}>{getPetEmoji(t.typeName)} {t.typeName}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Breed">
                <input value={form.breed} onChange={e => handleChange('breed', e.target.value)} placeholder="e.g. Beagle" />
              </FormField>
              <FormField label="Age">
                <input value={form.age} onChange={e => handleChange('age', e.target.value)} placeholder="e.g. 2" />
              </FormField>
              <FormField label="Owner Name *">
                <input
                  value={form.ownerName}
                  onChange={e => handleChange('ownerName', e.target.value)}
                  placeholder="e.g. John Doe"
                />
              </FormField>

              <FormField label="Owner Phone *">
                <input
                  value={form.ownerPhone}
                  onChange={e => handleChange('ownerPhone', e.target.value)}
                  placeholder="e.g. +961..."
                />
              </FormField>
              <FormField label="Assign Vet">
                <select value={form.assignedVetId} onChange={e => handleChange('assignedVetId', e.target.value)}>
                  <option value="">— None —</option>
                  {vets.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </FormField>
              <FormField label="Status">
                <select value={form.status} onChange={e => handleChange('status', e.target.value)}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </FormField>
            </div>
            <div className={styles.modalActions}>
              <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
              <Btn type="submit" disabled={saving}>{saving ? 'Saving...' : editPet ? 'Save Changes' : 'Add Patient'}</Btn>
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

export default Patients;
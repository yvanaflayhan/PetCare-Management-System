import React, { useState } from 'react';
import styles from './Patients.module.css';
import PageLayout from '../../Components/Layout/PageLayout';
import Btn from '../../Components/Btn/Btn';
import Modal from '../../Components/Modal/Modal';
import FormField from '../../Components/Form/Formfield';
import {
  Pencil,
  Archive,
} from 'lucide-react';

const ANIMAL_TYPES = [
  'Dog',
  'Cat',
  'Rabbit',
  'Bird',
  'Hamster',
  'Reptile',
  'Fish'
];

const SPECIES_MAP = {
  Dog: '🐶',
  Cat: '🐱',
  Rabbit: '🐰',
  Bird: '🐦',
  Hamster: '🐹',
  Reptile: '🦎',
  Fish: '🐠'
};

const STATUSES = [
  'Waiting',
  'In Examination',
  'Done',
  'Archived'
];

const EMPTY_FORM = {
  name: '',
  animalType: 'Dog',
  breed: '',
  owner: '',
  phone: '',
  age: '',
  status: 'Waiting',
  assignedVetId: null
};

function Patients({
  pets,
  setPets,
  vets
}) {

  const [showModal, setShowModal] =
    useState(false);

  const [editPet, setEditPet] =
    useState(null);

  const [search, setSearch] =
    useState('');

  const [filterType, setFilterType] =
    useState('All');

  const [form, setForm] =
    useState(EMPTY_FORM);

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditPet(null);
    setShowModal(true);
  }

  function openEdit(pet) {
    setForm({ ...pet });
    setEditPet(pet);
    setShowModal(true);
  }

  function handleChange(field, value) {
    setForm({
      ...form,
      [field]: value
    });
  }

  function handleSubmit(e) {

    e.preventDefault();

    if (!form.name || !form.owner)
      return;

    const species =
      SPECIES_MAP[form.animalType] || '🐾';

    if (editPet) {

      setPets(
        pets.map((p) =>
          p.id === editPet.id
            ? {
                ...form,
                species,
                id: editPet.id
              }
            : p
        )
      );

    } else {

      setPets([
        ...pets,
        {
          ...form,
          species,
          id: Date.now()
        }
      ]);

    }

    setShowModal(false);

  }

  function handleArchive(id) {

    setPets(
      pets.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'Archived'
            }
          : p
      )
    );

  }

  const filtered = pets.filter((p) => {

    const matchSearch =
      p.name.toLowerCase().includes(
        search.toLowerCase()
      ) ||
      p.owner.toLowerCase().includes(
        search.toLowerCase()
      );

    const matchType =
      filterType === 'All' ||
      p.animalType === filterType;

    return (
      matchSearch &&
      matchType &&
      p.status !== 'Archived'
    );

  });

  return (

    <PageLayout
      title="Patients"
      subtitle="Manage all active patients at the clinic"
      action={
        <Btn onClick={openAdd}>
          + Add Patient
        </Btn>
      }
    >

      {/* TOOLBAR */}

      <div className={styles.toolbar}>

        <input
          className={styles.search}
          placeholder="Search patient or owner..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          className={styles.filter}
          value={filterType}
          onChange={(e) =>
            setFilterType(e.target.value)
          }
        >

          <option value="All">
            All Types
          </option>

          {ANIMAL_TYPES.map((t) => (

            <option
              key={t}
              value={t}
            >
              {t}
            </option>

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

                  <div className={styles.empty}>
                    No patients found 🐾
                  </div>

                </td>

              </tr>

            )}

            {filtered.map((pet) => {

              const vet =
                vets.find(
                  (v) =>
                    Number(v.id) ===
                    Number(pet.assignedVetId)
                );

              return (

                <tr key={pet.id}>

                  <td className={styles.emoji}>
                    {pet.species}
                  </td>

                  <td>

                    <div className={styles.petName}>
                      {pet.name}
                    </div>

                  </td>

                  <td className={styles.muted}>
                    {pet.breed || '—'}
                  </td>

                  <td>
                    {pet.owner}
                  </td>

                  <td className={styles.muted}>
                    {pet.phone || '—'}
                  </td>

                  <td className={styles.muted}>
                    {pet.age || '—'}
                  </td>

                  <td className={styles.muted}>
                    {vet
                      ? `Dr. ${vet.lastName}`
                      : '—'}
                  </td>

                  <td>

                    <select
                      className={styles.statusSelect}
                      style={getStatusStyle(
                        pet.status
                      )}
                      value={pet.status}
                      onChange={(e) =>
                        setPets(
                          pets.map((p) =>
                            p.id === pet.id
                              ? {
                                  ...p,
                                  status:
                                    e.target.value
                                }
                              : p
                          )
                        )
                      }
                    >

                      {STATUSES.map((s) => (

                        <option
                          key={s}
                          value={s}
                        >
                          {s}
                        </option>

                      ))}

                    </select>

                  </td>

                  <td>

                    <div className={styles.actions}>

                      <button
                        className={styles.editBtn}
                        onClick={() =>
                          openEdit(pet)
                        }
                      >

                        <Pencil size={18} />

                      </button>

                      <button
                        className={styles.archiveBtn}
                        onClick={() =>
                          handleArchive(pet.id)
                        }
                      >

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
          title={
            editPet
              ? '✏️ Edit Patient'
              : '🐾 Add Patient'
          }
          onClose={() =>
            setShowModal(false)
          }
        >

          <form onSubmit={handleSubmit}>

            <div className={styles.formGrid}>

              <FormField label="Pet Name *">

                <input
                  value={form.name}
                  onChange={(e) =>
                    handleChange(
                      'name',
                      e.target.value
                    )
                  }
                  placeholder="e.g. Max"
                />

              </FormField>

              <FormField label="Animal Type">

                <select
                  value={form.animalType}
                  onChange={(e) =>
                    handleChange(
                      'animalType',
                      e.target.value
                    )
                  }
                >

                  {ANIMAL_TYPES.map((t) => (

                    <option
                      key={t}
                      value={t}
                    >
                      {SPECIES_MAP[t]} {t}
                    </option>

                  ))}

                </select>

              </FormField>

              <FormField label="Breed">

                <input
                  value={form.breed}
                  onChange={(e) =>
                    handleChange(
                      'breed',
                      e.target.value
                    )
                  }
                  placeholder="e.g. Beagle"
                />

              </FormField>

              <FormField label="Age">

                <input
                  value={form.age}
                  onChange={(e) =>
                    handleChange(
                      'age',
                      e.target.value
                    )
                  }
                  placeholder="e.g. 2y"
                />

              </FormField>

              <FormField label="Owner Name *">

                <input
                  value={form.owner}
                  onChange={(e) =>
                    handleChange(
                      'owner',
                      e.target.value
                    )
                  }
                  placeholder="e.g. John Doe"
                />

              </FormField>

              <FormField label="Phone">

                <input
                  value={form.phone}
                  onChange={(e) =>
                    handleChange(
                      'phone',
                      e.target.value
                    )
                  }
                  placeholder="+961 70 000 000"
                />

              </FormField>

              <FormField label="Assign Vet">

                <select
                  value={
                    form.assignedVetId || ''
                  }
                  onChange={(e) =>
                    handleChange(
                      'assignedVetId',
                      e.target.value
                        ? parseInt(
                            e.target.value
                          )
                        : null
                    )
                  }
                >

                  <option value="">
                    — None —
                  </option>

                  {vets.map((v) => (

                    <option
                      key={v.id}
                      value={v.id}
                    >
                      Dr. {v.firstName} {v.lastName}
                    </option>

                  ))}

                </select>

              </FormField>

              <FormField label="Status">

                <select
                  value={form.status}
                  onChange={(e) =>
                    handleChange(
                      'status',
                      e.target.value
                    )
                  }
                >

                  {STATUSES.map((s) => (

                    <option
                      key={s}
                      value={s}
                    >
                      {s}
                    </option>

                  ))}

                </select>

              </FormField>

            </div>

            <div className={styles.modalActions}>

              <Btn
                variant="secondary"
                onClick={() =>
                  setShowModal(false)
                }
              >
                Cancel
              </Btn>

              <Btn type="submit">

                {editPet
                  ? 'Save Changes'
                  : 'Add Patient'}

              </Btn>

            </div>

          </form>

        </Modal>

      )}

    </PageLayout>

  );
}

function getStatusStyle(status) {

  const map = {

    Waiting: {
      background: '#fff0cc',
      color: '#7a5000'
    },

    'In Examination': {
      background: '#d6f5e3',
      color: '#0e6e3a'
    },

    Done: {
      background: '#e8f4fb',
      color: '#0d6eaa'
    },

    Archived: {
      background: '#ececec',
      color: '#555'
    }

  };

  return map[status] || map.Waiting;

}

export default Patients;
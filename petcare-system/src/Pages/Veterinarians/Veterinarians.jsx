import React, { useState } from 'react';
import styles from './Veterinarians.module.css';
import PageLayout from '../../Components/Layout/PageLayout';
import Btn from '../../Components/Btn/Btn';
import Card from '../../Components/Card/Card';
import Modal from '../../Components/Modal/Modal';
import FormField from '../../Components/Form/Formfield';
import {
    Pencil,
    Archive
} from 'lucide-react';

const SPECIALTIES = [
    'General Practice',
    'Surgery',
    'Dermatology',
    'Cardiology',
    'Dentistry',
    'Nutrition',
    'Behavior & Training',
    'Emergency Care',
    'Exotic Animals'
];

const ROLES = [
    'Veterinarian',
    'Trainer',
    'Intern',
    'Technician'
];

const EMPTY_FORM = {
    firstName: '',
    lastName: '',
    role: 'Veterinarian',
    specialty: 'General Practice',
    animalExpertise: [],
    university: '',
    graduationYear: '',
    phone: '',
    email: '',
    available: true,
    status: 'Active'
};

function getInitials(f, l) {
    return `${f?.[0] || ''}${l?.[0] || ''}`.toUpperCase();
}

function Veterinarians({
    pets,
    vets,
    setVets
}) {

    const [showModal, setShowModal] =
        useState(false);

    const [editVet, setEditVet] =
        useState(null);

    const [selected, setSelected] =
        useState(null);

    const [form, setForm] =
        useState(EMPTY_FORM);
        

    function openAdd() {
        setForm(EMPTY_FORM);
        setEditVet(null);
        setShowModal(true);
    }

    function openEdit(vet) {

        setForm({
            ...vet
        });

        setEditVet(vet);

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

        if (!form.firstName || !form.lastName)
            return;

        if (editVet) {

            const updated =
                vets.map(v =>
                    v.id === editVet.id
                        ? {
                            ...form,
                            id: editVet.id
                        }
                        : v
                );

            setVets(updated);

            if (selected) {

                setSelected({
                    ...form,
                    id: editVet.id
                });

            }

        } else {

            setVets([
                ...vets,
                {
                    ...form,
                    id: Date.now()
                }
            ]);

        }

        setShowModal(false);

    }

    function handleArchive(id) {

        setVets(
            vets.map(v =>
                v.id === id
                    ? {
                        ...v,
                        status: 'Archived',
                        available: false
                    }
                    : v
            )
        );

    }

    /* ================= DETAIL PAGE ================= */

    if (selected) {

        const vetPets =
            pets.filter(
                p => p.assignedVetId === selected.id
            );

        return (

            <PageLayout
                title={`Dr. ${selected.firstName} ${selected.lastName}`}
                subtitle={`${selected.role} · ${selected.specialty}`}
            >

                <div className={styles.backButtonWrap}>

                    <Btn
                        variant="secondary"
                        onClick={() => setSelected(null)}
                    >
                        ← Back
                    </Btn>

                </div>

                <div className={styles.detailWrap}>

                    <Card>

                        <div className={styles.profileHeader}>

                            <div className={styles.profileAvatar}>
                                {getInitials(
                                    selected.firstName,
                                    selected.lastName
                                )}
                            </div>

                            <div className={styles.profileMain}>

                                <div className={styles.profileName}>
                                    Dr. {selected.firstName} {selected.lastName}
                                </div>

                                <div className={styles.profileSpecialty}>
                                    {selected.specialty}
                                </div>

                                <div
                                    className={styles.availBadge}
                                    style={{
                                        background:
                                            selected.available
                                                ? '#d6f5e3'
                                                : '#fee2e2',

                                        color:
                                            selected.available
                                                ? '#0e6e3a'
                                                : '#b91c1c'
                                    }}
                                >
                                    {selected.available
                                        ? 'Available'
                                        : 'Unavailable'}
                                </div>

                            </div>



                        </div>

                        <div className={styles.simpleInfo}>

                            <div>
                                <span>Role:</span>
                                {selected.role}
                            </div>

                            <div>
                                <span>University:</span>
                                {selected.university || '—'}
                            </div>

                            <div>
                                <span>Graduation:</span>
                                {selected.graduationYear || '—'}
                            </div>

                            <div>
                                <span>Phone:</span>
                                {selected.phone || '—'}
                            </div>

                            <div>
                                <span>Email:</span>
                                {selected.email || '—'}
                            </div>

                        </div>

                    </Card>

                    <div className={styles.sectionTitle}>
                        Assigned Patients ({vetPets.length})
                    </div>

                    {vetPets.length === 0 && (

                        <div className={styles.noPatients}>
                            No patients assigned yet.
                        </div>

                    )}

                    {vetPets.map(pet => (

                        <Card key={pet.id}>

                            <div className={styles.patientRow}>

                                <div className={styles.patientLeft}>

                                    <span className={styles.patientEmoji}>
                                        {pet.species}
                                    </span>

                                    <div>

                                        <div className={styles.patientName}>
                                            {pet.name}
                                        </div>

                                        <div className={styles.patientMeta}>
                                            {pet.breed} · Owner: {pet.owner}
                                        </div>

                                    </div>

                                </div>

                                <span
                                    className={styles.statusPill}
                                    style={getStatusStyle(
                                        pet.status
                                    )}
                                >
                                    {pet.status}
                                </span>

                            </div>

                        </Card>

                    ))}

                </div>

            </PageLayout>

        );

    }

    /* ================= MAIN GRID ================= */

    return (

        <PageLayout
            title="Veterinarians"
            subtitle="All staff members"
            action={
                <Btn onClick={openAdd}>
                    + Add Member
                </Btn>
            }
        >

            <div className={styles.grid}>

                {vets.length === 0 && (

                    <div className={styles.empty}>
                        No staff members yet
                    </div>

                )}

                {vets
                    .filter(v => v.status !== 'Archived')
                    .map(vet => {

                        const count =
                            pets.filter(
                                p => p.assignedVetId === vet.id
                            ).length;

                        return (

                            <Card
                                key={vet.id}
                                onClick={() => setSelected(vet)}
                            >

                                <div className={styles.cardTop}>

                                    <div className={styles.cardAvatar}>
                                        {getInitials(
                                            vet.firstName,
                                            vet.lastName
                                        )}
                                    </div>

                                    <div
                                        className={styles.cardActions}
                                        onClick={e => e.stopPropagation()}
                                    >

                                        <div className={styles.cardActions}>
                                            <Btn onClick={() => openEdit(vet)}>Edit</Btn>
                                            <Btn variant="secondary" onClick={() => handleArchive(vet.id)}>
                                                Archive
                                            </Btn>
                                        </div>

                                    </div>

                                </div>

                                <div className={styles.cardName}>
                                    Dr. {vet.firstName} {vet.lastName}
                                </div>

                                <div className={styles.cardSpecialty}>
                                    {vet.specialty}
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

            {/* ================= MODAL ================= */}

            {showModal && (

                <Modal
                    title={
                        editVet
                            ? '✏️ Edit Member'
                            : '➕ Add Member'
                    }
                    onClose={() =>
                        setShowModal(false)
                    }
                >

                    <form onSubmit={handleSubmit}>

                        <div className={styles.formGrid}>

                            <FormField label="First Name *">
                                <input
                                    value={form.firstName}
                                    onChange={(e) =>
                                        handleChange(
                                            'firstName',
                                            e.target.value
                                        )
                                    }
                                />
                            </FormField>

                            <FormField label="Last Name *">
                                <input
                                    value={form.lastName}
                                    onChange={(e) =>
                                        handleChange(
                                            'lastName',
                                            e.target.value
                                        )
                                    }
                                />
                            </FormField>

                            <FormField label="Role">
                                <select
                                    value={form.role}
                                    onChange={(e) =>
                                        handleChange(
                                            'role',
                                            e.target.value
                                        )
                                    }
                                >
                                    {ROLES.map(r => (
                                        <option key={r}>
                                            {r}
                                        </option>
                                    ))}
                                </select>
                            </FormField>

                            <FormField label="Specialty">
                                <select
                                    value={form.specialty}
                                    onChange={(e) =>
                                        handleChange(
                                            'specialty',
                                            e.target.value
                                        )
                                    }
                                >
                                    {SPECIALTIES.map(s => (
                                        <option key={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </FormField>

                            <FormField label="University">
                                <input
                                    value={form.university}
                                    onChange={(e) =>
                                        handleChange(
                                            'university',
                                            e.target.value
                                        )
                                    }
                                    placeholder="e.g. AUB"
                                />
                            </FormField>

                            <FormField label="Graduation Year">
                                <input
                                    value={form.graduationYear}
                                    onChange={(e) =>
                                        handleChange(
                                            'graduationYear',
                                            e.target.value
                                        )
                                    }
                                    placeholder="e.g. 2015"
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
                                    placeholder="+961 70 111 222"
                                />
                            </FormField>

                            <FormField label="Email">
                                <input
                                    value={form.email}
                                    onChange={(e) =>
                                        handleChange(
                                            'email',
                                            e.target.value
                                        )
                                    }
                                    placeholder="example@email.com"
                                />
                            </FormField>

                            <FormField label="Availability">
                                <select
                                    value={form.available ? 'yes' : 'no'}
                                    onChange={(e) =>
                                        handleChange(
                                            'available',
                                            e.target.value === 'yes'
                                        )
                                    }
                                >
                                    <option value="yes">
                                        Available
                                    </option>

                                    <option value="no">
                                        Unavailable
                                    </option>
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
                                Save
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

export default Veterinarians;
import React, { useState, useEffect, useCallback } from 'react';
import SplashScreen from './Components/Splashscreen';
import Topbar from './Components/Topbar';
import SideNav from './Components/SideNav';
import Dashboard from './Components/Dashboard';
import Patients from './Components/Patients';
import Veterinarians from './Components/Veterinarians';
import Appointments from './Components/Appointments';
import MedicalRecords from './Components/Medicalrecords';
import Archive from './Components/Archive';

const INITIAL_PETS = [
  { id: 1, name: 'Max',    species: '🐶', animalType: 'Dog',    breed: 'Golden Retriever', owner: 'Ali K.',   phone: '+961 70 111 000', age: '3y', status: 'In Examination', assignedVetId: 1 },
  { id: 2, name: 'Luna',   species: '🐱', animalType: 'Cat',    breed: 'Persian Cat',      owner: 'Nour H.',  phone: '+961 71 222 000', age: '2y', status: 'Waiting',         assignedVetId: 2 },
  { id: 3, name: 'Buddy',  species: '🐶', animalType: 'Dog',    breed: 'Beagle',           owner: 'Rami S.',  phone: '+961 76 333 000', age: '5y', status: 'Done',            assignedVetId: 1 },
  { id: 4, name: 'Bella',  species: '🐰', animalType: 'Rabbit', breed: 'Holland Lop',      owner: 'Sara M.',  phone: '+961 78 444 000', age: '1y', status: 'Waiting',         assignedVetId: null },
  { id: 5, name: 'Milo',   species: '🐱', animalType: 'Cat',    breed: 'Siamese',          owner: 'Lara T.',  phone: '+961 70 555 000', age: '4y', status: 'Archived',        assignedVetId: 2 },
];

const INITIAL_VETS = [
  { id: 1, firstName: 'Sarah',  lastName: 'Johnson', role: 'Veterinarian', specialty: 'General Practice', animalExpertise: ['Dogs','Cats'], university: 'AUB', graduationYear: '2015', phone: '+961 70 111 222', email: 'sarah@vetmethod.com', available: true },
  { id: 2, firstName: 'Karim',  lastName: 'Nassar',  role: 'Veterinarian', specialty: 'Surgery',          animalExpertise: ['Cats','Birds'], university: 'LU',  graduationYear: '2018', phone: '+961 71 333 444', email: 'karim@vetmethod.com', available: true },
];

const INITIAL_APPOINTMENTS = [
  { id: 1, petId: 1, vetId: 1, date: '2026-05-16', time: '09:00', status: 'Confirmed', notes: 'Regular checkup' },
  { id: 2, petId: 2, vetId: 2, date: '2026-05-16', time: '11:00', status: 'Pending',   notes: 'Vaccination' },
  { id: 3, petId: 3, vetId: 1, date: '2026-05-15', time: '14:00', status: 'Completed', notes: 'Follow-up' },
];

const INITIAL_RECORDS = [
  { id: 1, petId: 3, vetId: 1, date: '2026-05-15', symptoms: 'Coughing, fatigue', diagnosis: 'Mild bronchitis', treatment: 'Rest and antibiotics', medicine: 'Amoxicillin 250mg', notes: 'Follow up in 2 weeks' },
  { id: 2, petId: 5, vetId: 2, date: '2026-05-10', symptoms: 'Loss of appetite', diagnosis: 'Gastritis',       treatment: 'Diet change',           medicine: 'Omeprazole',         notes: 'Switched to wet food' },
];

const IDLE_TIMEOUT = 3 * 60 * 1000;

function App() {
  const [showSplash, setShowSplash]   = useState(true);
  const [navOpen, setNavOpen]         = useState(false);
  const [activePage, setActivePage]   = useState('dashboard');
  const [pets, setPets]               = useState(INITIAL_PETS);
  const [vets, setVets]               = useState(INITIAL_VETS);
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [records, setRecords]         = useState(INITIAL_RECORDS);

  const resetIdle = useCallback(() => {
    if (showSplash) return;
    clearTimeout(window._idleTimer);
    window._idleTimer = setTimeout(() => setShowSplash(true), IDLE_TIMEOUT);
  }, [showSplash]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, resetIdle));
    resetIdle();
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetIdle));
      clearTimeout(window._idleTimer);
    };
  }, [resetIdle]);

  if (showSplash) {
    return <SplashScreen onDone={() => setShowSplash(false)} />;
  }

  return (
    <div>
      <Topbar onMenuClick={() => setNavOpen(true)} />

      {navOpen && (
        <SideNav
          activePage={activePage}
          onNavigate={(page) => { setActivePage(page); setNavOpen(false); }}
          onClose={() => setNavOpen(false)}
        />
      )}

      {activePage === 'dashboard'    && <Dashboard pets={pets} vets={vets} appointments={appointments} records={records} onNavigate={setActivePage} />}
      {activePage === 'patients'     && <Patients pets={pets} setPets={setPets} vets={vets} />}
      {activePage === 'veterinarians'&& <Veterinarians pets={pets} vets={vets} setVets={setVets} />}
      {activePage === 'appointments' && <Appointments appointments={appointments} setAppointments={setAppointments} pets={pets} vets={vets} />}
      {activePage === 'records'      && <MedicalRecords records={records} setRecords={setRecords} pets={pets} setPets={setPets} vets={vets} />}
      {activePage === 'archive'      && <Archive pets={pets} records={records} vets={vets} />}
    </div>
  );
}

export default App;
import React, { useState, useEffect, useCallback } from 'react';
import SplashScreen    from './Components/SplashScreen/SplashScreen';
import Topbar          from './Components/Topbar/Topbar';
import SideNav         from './Components/SideNav/SideNav';
import Dashboard       from './Pages/Dashboard/Dashboard';
import Patients        from './Pages/Patients/Patients';
import Veterinarians   from './Pages/Veterinarians/Veterinarians';
import Appointments    from './Pages/Appointments/Appointments';
import MedicalRecords  from './Pages/MedicalRecords/Medicalrecords';
import Archive         from './Pages/Archive/Archive';

import {
  getPets, getVets, getAppointments,
  getMedicalRecords, getAllPetStatuses, getPetTypes,
  getTodayAttendance
} from './Services/api';

const IDLE_TIMEOUT = 3 * 60 * 1000;
const TODAY = new Date().toISOString().split('T')[0];

function App() {
  const [showSplash, setShowSplash]     = useState(true);
  const [navOpen, setNavOpen]           = useState(false);
  const [activePage, setActivePage]     = useState('dashboard');

  const [pets, setPets]                 = useState([]);
  const [vets, setVets]                 = useState([]);
  const [archivedVets, setArchivedVets] = useState([]); // vets removed from active list
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords]           = useState([]);
  const [petStatuses, setPetStatuses]   = useState([]);
  const [petTypes, setPetTypes]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  // ── ATTENDANCE: lifted to App so all pages share it ──────────────────────
  const [todayAttendance, setTodayAttendance] = useState({}); // { vetId: isPresent }
  const [attendanceSaved, setAttendanceSaved] = useState(false);

  async function loadAll() {
    try {
      setLoading(true);
      const [p, v, a, r, ps, pt, att] = await Promise.all([
        getPets(),
        getVets(),
        getAppointments(),
        getMedicalRecords(),
        getAllPetStatuses(),
        getPetTypes(),
        getTodayAttendance(),
      ]);
      setPets(p);
      setVets(v);
      setAppointments(a);
      setRecords(r);
      setPetStatuses(ps);
      setPetTypes(pt);

      // build attendance map from backend
      if (att && att.length > 0) {
        const log = {};
        att.forEach(a => { log[a.vetId] = a.isPresent; });
        setTodayAttendance(log);
        setAttendanceSaved(true);
      }
    } catch (err) {
      setError('Cannot connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  // called by Dashboard when user saves attendance
  function handleAttendanceSaved(log) {
    setTodayAttendance(log);
    setAttendanceSaved(true);
  }

  // idle timer
  const resetIdle = useCallback(() => {
    if (showSplash) return;
    clearTimeout(window._idleTimer);
    window._idleTimer = setTimeout(() => setShowSplash(true), IDLE_TIMEOUT);
  }, [showSplash]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetIdle));
    resetIdle();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetIdle));
      clearTimeout(window._idleTimer);
    };
  }, [resetIdle]);

  if (showSplash) return <SplashScreen onDone={() => setShowSplash(false)} />;

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'DM Sans, sans-serif', color:'#7a9baa', fontSize:16 }}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'DM Sans, sans-serif', color:'#b91c1c', fontSize:16 }}>
        {error}
      </div>
    );
  }

  return (
    <div>
      <Topbar onMenuClick={() => setNavOpen(true)} />

      {navOpen && (
        <SideNav
          activePage={activePage}
          onNavigate={page => { setActivePage(page); setNavOpen(false); }}
          onClose={() => setNavOpen(false)}
        />
      )}

      {activePage === 'dashboard' && (
        <Dashboard
          pets={pets}
          vets={vets}
          appointments={appointments}
          records={records}
          petStatuses={petStatuses}
          todayAttendance={todayAttendance}
          attendanceSaved={attendanceSaved}
          onAttendanceSaved={handleAttendanceSaved}
        />
      )}

      {activePage === 'patients' && (
        <Patients
          pets={pets}
          setPets={setPets}
          vets={vets}
          petTypes={petTypes}
          petStatuses={petStatuses}
          setPetStatuses={setPetStatuses}
          reload={loadAll}
        />
      )}

      {activePage === 'veterinarians' && (
        <Veterinarians
          pets={pets}
          vets={vets}
          setVets={setVets}
          petStatuses={petStatuses}
          todayAttendance={todayAttendance}
          archivedVets={archivedVets}
          setArchivedVets={setArchivedVets}
          reload={loadAll}
        />
      )}

      {activePage === 'appointments' && (
        <Appointments
          appointments={appointments}
          setAppointments={setAppointments}
          pets={pets}
          vets={vets}
          reload={loadAll}
        />
      )}

      {activePage === 'records' && (
        <MedicalRecords
          records={records}
          setRecords={setRecords}
          pets={pets}
          vets={vets}
          reload={loadAll}
        />
      )}

      {activePage === 'archive' && (
        <Archive
          pets={pets}
          records={records}
          vets={vets}
          petStatuses={petStatuses}
          appointments={appointments}
          archivedVets={archivedVets}
          setArchivedVets={setArchivedVets}
          setVets={setVets}
          todayAttendance={todayAttendance}
          reload={loadAll}
        />
      )}
    </div>
  );
}

export default App;
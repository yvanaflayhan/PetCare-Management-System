const BASE = process.env.REACT_APP_API_URL || "http://localhost:5246";

// ─── helper ───────────────────────────────────────────────────────────────────
async function request(method, path, body) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) throw new Error(`${method} ${path} failed: ${res.status}`);
  return res.json();
}

const get = (path) => request("GET", path);
const post = (path, body) => request("POST", path, body);
const put = (path, body) => request("PUT", path, body);
const del = (path) => request("DELETE", path);

// ─── OWNERS ──────────────────────────────────────────────────────────────────
export const getOwners = () => get("/api/owners");
export const createOwner = (data) => post("/api/owners", data);
export const updateOwner = (id, data) => put(`/api/owners/${id}`, data);
export const deleteOwner = (id) => del(`/api/owners/${id}`);

// ─── PET TYPES ────────────────────────────────────────────────────────────────
export const getPetTypes = () => get("/api/pettypes");

// ─── PETS ─────────────────────────────────────────────────────────────────────
export const getPets = () => get("/api/pets");
export const getPetById = (id) => get(`/api/pets/${id}`);
export const createPet = (data) => post("/api/pets", data);
export const updatePet = (id, data) => put(`/api/pets/${id}`, data);
export const deletePet = (id) => del(`/api/pets/${id}`);

// ─── PET STATUS ───────────────────────────────────────────────────────────────
export const getAllPetStatuses = () => get("/api/petstatus");
export const updatePetStatus = (petId, data) => put(`/api/petstatus/${petId}`, data);

// ─── VETERINARIANS ────────────────────────────────────────────────────────────
export const getVets = () => get("/api/veterinarians");
export const getVetById = (id) => get(`/api/veterinarians/${id}`);
export const createVet = (data) => post("/api/veterinarians", data);
export const updateVet = (id, data) => put(`/api/veterinarians/${id}`, data);
export const deleteVet = (id) => del(`/api/veterinarians/${id}`);
export const getArchivedVets = () => get("/api/veterinarians/archived");

// ─── APPOINTMENTS ─────────────────────────────────────────────────────────────
export const getAppointments = () => get("/api/appointments");
export const getTodayAppointments = () => get("/api/appointments/today");
export const createAppointment = (data) => post("/api/appointments", data);
export const updateAppointment = (id, data) => put(`/api/appointments/${id}`, data);
export const deleteAppointment = (id) => del(`/api/appointments/${id}`);

// ─── MEDICAL RECORDS ─────────────────────────────────────────────────────────
export const getMedicalRecords = () => get("/api/medicalrecords");
export const getRecordsByPet = (petId) => get(`/api/medicalrecords/pet/${petId}`);
export const createMedicalRecord = (data) => post("/api/medicalrecords", data);
export const updateMedicalRecord = (id, data) => put(`/api/medicalrecords/${id}`, data);
export const deleteMedicalRecord = (id) => del(`/api/medicalrecords/${id}`);

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────
export const getTodayAttendance = () => get("/api/attendance/today");
export const getMonthAttendance = (year, month) => get(`/api/attendance/month/${year}/${month}`);
export const saveAttendance = (entries) => post("/api/attendance/save", entries);
// entries = [{ vetId: 1, isPresent: true }, ...]
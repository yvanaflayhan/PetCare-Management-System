-- =========================
-- OWNERS
-- =========================
INSERT INTO Owners (Name, Phone, Email)
VALUES 
('Ali Hassan', '71234567', 'ali@email.com'),
('Maya Khalil', '70123456', 'maya@email.com'),
('Omar Nasser', '76543210', 'omar@email.com');

-- =========================
-- PET TYPES
-- =========================
INSERT INTO PetTypes (TypeName)
VALUES
('Dog'),
('Cat'),
('Parrot'),
('Rabbit');

-- =========================
-- PETS
-- =========================
INSERT INTO Pets (Name, TypeId, Breed, Age, OwnerId)
VALUES
('Max', 1, 'Labrador', 3, 1),
('Luna', 2, 'Siamese', 2, 1),
('Bella', 1, 'German Shepherd', 5, 2),
('Charlie', 3, 'African Grey', 1, 3),
('Rocky', 1, 'Bulldog', 4, 2);

-- =========================
-- VETERINARIANS
-- =========================
INSERT INTO Veterinarians (Name, Role, Specialization)
VALUES
('Dr. Sara', 'Vet', 'Surgery'),
('Dr. Karim', 'Vet', 'Dermatology'),
('Dr. Lina', 'Vet', 'General'),
('Dr. Nabil', 'Vet', 'Dental'),
('Ahmad', 'Trainee', NULL),
('Rami', 'Trainee', NULL);

-- =========================
-- APPOINTMENTS
-- =========================
INSERT INTO Appointments (PetId, VetId, Date, Reason, Status)
VALUES
(1, 1, '2026-05-10 10:00:00', 'Routine Checkup', 'Scheduled'),
(2, 2, '2026-05-11 11:30:00', 'Skin Allergy', 'Done'),
(3, 3, '2026-05-12 09:00:00', 'Vaccination', 'Scheduled'),
(4, 4, '2026-05-13 14:00:00', 'Beak Injury', 'Cancelled'),
(5, 1, '2026-05-14 16:00:00', 'Dental Cleaning', 'Scheduled'),
(1, 3, '2026-05-15 12:00:00', 'Follow-up', 'Scheduled');

-- =========================
-- MEDICAL CASES
-- =========================
INSERT INTO MedicalCases (PetId, DiseaseName, Description, Treatment, DateDiagnosed)
VALUES
(1, 'Ear Infection', 'Mild ear infection', 'Antibiotics', '2026-05-01'),
(2, 'Skin Allergy', 'Allergic reaction on skin', 'Cream treatment', '2026-05-02'),
(3, 'Flu', 'Common flu symptoms', 'Rest and fluids', '2026-05-03'),
(5, 'Tooth Decay', 'Dental issue in molars', 'Tooth extraction', '2026-05-04');

--===============================================
-- PetStatus: current clinic status for each pet
-- Pet 1 (Max) = Waiting, assigned to Dr. Sara (VetId 1)
-- Pet 2 (Luna) = In Examination, assigned to Dr. Karim (VetId 2)
-- Pet 3 (Bella) = Done
-- Pet 4 (Charlie) = Archived
-- Pet 5 (Rocky) = Waiting, assigned to Dr. Nabil (VetId 4)
--================================================
INSERT INTO PetStatus (PetId, Status, AssignedVetId)
VALUES
(1, 'Waiting',        1),
(2, 'In Examination', 2),
(3, 'Done',           3),
(4, 'Archived',       NULL),
(5, 'Waiting',        4);

--==============================================
-- PetStays: pets currently staying at the clinic
-- Max (PetId 1) checked in for observation after ear infection
-- Rocky (PetId 5) checked in for post-dental care
--==============================================
INSERT INTO PetStays (PetId, CheckInDate, CheckOutDate, Reason, Notes, IsActive)
VALUES
(1, '2026-05-14', NULL,         'Post-treatment observation', 'Ear infection follow-up, check daily', TRUE),
(5, '2026-05-14', NULL,         'Post-dental recovery',       'Soft food only for 3 days',           TRUE),
(3, '2026-05-10', '2026-05-12', 'Vaccination observation',    'Discharged after 48h, no issues',     FALSE);

--==========================================
-- MedicalRecords: full examination records
-- Linked to appointments where applicable
--==========================================
INSERT INTO MedicalRecords (PetId, VetId, AppointmentId, ExaminationDate, Symptoms, Diagnosis, Treatment, Medicine, Notes)
VALUES
(1, 1, 1, '2026-05-10', 'Scratching ears, head shaking',      'Ear Infection',  'Clean ears daily, apply drops',    'Otomax ear drops',          'Recheck in 2 weeks'),
(2, 2, 2, '2026-05-11', 'Red patches on skin, itching',       'Skin Allergy',   'Topical cream twice daily',        'Hydrocortisone cream 1%',   'Avoid outdoor plants'),
(3, 3, 3, '2026-05-12', 'Lethargy, mild fever',               'Viral Flu',      'Rest, fluids, monitor temperature','Ibuprofen 5mg/kg',          'Isolate from other pets'),
(5, 4, 5, '2026-05-14', 'Pawing at mouth, bad breath, pain',  'Tooth Decay',    'Tooth extraction performed',       'Amoxicillin 250mg x 7 days','Soft food for 3 days post-op');

--===========================================
-- Attendance: who came to work on which days
-- 2026-05-14
--===========================================
INSERT INTO Attendance (VetId, AttendanceDate, IsPresent)
VALUES
(1, '2026-05-14', TRUE),
(2, '2026-05-14', TRUE),
(3, '2026-05-14', FALSE),
(4, '2026-05-14', TRUE),
(5, '2026-05-14', TRUE),
(6, '2026-05-14', FALSE);

--=============
-- 2026-05-15
--=============
INSERT INTO Attendance (VetId, AttendanceDate, IsPresent)
VALUES
(1, '2026-05-15', TRUE),
(2, '2026-05-15', FALSE),
(3, '2026-05-15', TRUE),
(4, '2026-05-15', TRUE),
(5, '2026-05-15', FALSE),
(6, '2026-05-15', TRUE);

--==========================================================
-- VetAnimalExpertise: which animal types each vet handles
-- Dog=1, Cat=2, Parrot=3, Rabbit=4
--==========================================================
INSERT INTO VetAnimalExpertise (VetId, PetTypeId)
VALUES
(1, 1),  
(1, 2),  
(2, 2),  
(2, 4),  
(3, 1),  
(3, 2),  
(3, 3),  
(3, 4),  
(4, 1),  
(4, 2);  

--==========================================
-- VetDetails: contact info and availability
--==========================================
INSERT INTO VetDetails (VetId, Phone, Email, IsAvailable)
VALUES
(1, '71000001', 'sara@vetmethod.com',  TRUE),
(2, '71000002', 'karim@vetmethod.com', TRUE),
(3, '71000003', 'lina@vetmethod.com',  FALSE),
(4, '71000004', 'nabil@vetmethod.com', TRUE),
(5, '71000005', 'ahmad@vetmethod.com', TRUE),
(6, '71000006', 'rami@vetmethod.com',  TRUE);
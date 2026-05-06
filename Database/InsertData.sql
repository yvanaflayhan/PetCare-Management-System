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
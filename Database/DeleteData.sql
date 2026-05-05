-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM MedicalCases;
DELETE FROM Appointments;
DELETE FROM Pets;
DELETE FROM Veterinarians;
DELETE FROM PetTypes;
DELETE FROM Owners;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
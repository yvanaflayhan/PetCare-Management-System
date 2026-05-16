-- Disable foreign key checks to avoid errors
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS VetDetails;
DROP TABLE IF EXISTS VetAnimalExpertise;
DROP TABLE IF EXISTS Attendance;
DROP TABLE IF EXISTS MedicalRecords;
DROP TABLE IF EXISTS PetStays;
DROP TABLE IF EXISTS PetStatus;
DROP TABLE IF EXISTS MedicalCases;
DROP TABLE IF EXISTS Appointments;
DROP TABLE IF EXISTS Pets;
DROP TABLE IF EXISTS Veterinarians;
DROP TABLE IF EXISTS PetTypes;
DROP TABLE IF EXISTS Owners;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
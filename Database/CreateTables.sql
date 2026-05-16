CREATE TABLE Owners (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Phone VARCHAR(20),
    Email VARCHAR(100)
);

CREATE TABLE PetTypes(
    Id INT AUTO_INCREMENT PRIMARY KEY,
    TypeName VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE Pets (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    TypeId INT NOT NULL,
    Breed VARCHAR(100),
    Age INT,
    IsActive BOOLEAN DEFAULT TRUE,
    OwnerId INT,
    FOREIGN KEY (TypeId) REFERENCES PetTypes(Id),
    FOREIGN KEY (OwnerId) REFERENCES Owners(Id)
);

CREATE TABLE Veterinarians (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Role VARCHAR(50) NOT NULL,
    Specialization VARCHAR(100),
    University VARCHAR(150),
    GraduationYear INT
);

CREATE TABLE Appointments (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    PetId INT,
    VetId INT,
    Date DATETIME,
    Reason VARCHAR(255),
    Status VARCHAR(50) DEFAULT 'Scheduled',
    FOREIGN KEY (PetId) REFERENCES Pets(Id),
    FOREIGN KEY (VetId) REFERENCES Veterinarians(Id)
);

CREATE TABLE MedicalCases (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    PetId INT,
    DiseaseName VARCHAR(100),
    Description TEXT,
    Treatment TEXT,
    DateDiagnosed DATE,
    FOREIGN KEY (PetId) REFERENCES Pets(Id)
);

-- Pet current status in clinic (Waiting, In Examination, Done, Archived)
-- One active row per pet at a time
CREATE TABLE PetStatus (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    PetId INT NOT NULL UNIQUE,
    Status VARCHAR(50) NOT NULL DEFAULT 'Waiting',
    AssignedVetId INT,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (PetId) REFERENCES Pets(Id),
    FOREIGN KEY (AssignedVetId) REFERENCES Veterinarians(Id)
);

-- Pets staying overnight or for multiple days at the clinic
CREATE TABLE PetStays (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    PetId INT NOT NULL,
    CheckInDate DATE NOT NULL,
    CheckOutDate DATE,
    Reason VARCHAR(255),
    Notes TEXT,
    IsActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (PetId) REFERENCES Pets(Id)
);

-- Full examination records (richer than MedicalCases)
-- Linked to an appointment when possible
CREATE TABLE MedicalRecords (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    PetId INT NOT NULL,
    VetId INT,
    AppointmentId INT,
    ExaminationDate DATE NOT NULL,
    Symptoms TEXT,
    Diagnosis VARCHAR(255),
    Treatment TEXT,
    Medicine VARCHAR(255),
    Notes TEXT,
    FOREIGN KEY (PetId) REFERENCES Pets(Id),
    FOREIGN KEY (VetId) REFERENCES Veterinarians(Id),
    FOREIGN KEY (AppointmentId) REFERENCES Appointments(Id)
);

-- Daily attendance for each staff member
-- One row per vet per day
CREATE TABLE Attendance (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    VetId INT NOT NULL,
    AttendanceDate DATE NOT NULL,
    IsPresent BOOLEAN NOT NULL DEFAULT FALSE,
    Notes VARCHAR(255),
    UNIQUE KEY unique_vet_day (VetId, AttendanceDate),
    FOREIGN KEY (VetId) REFERENCES Veterinarians(Id)
);

-- Which animal types each vet is expert in (many-to-many)
CREATE TABLE VetAnimalExpertise (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    VetId INT NOT NULL,
    PetTypeId INT NOT NULL,
    UNIQUE KEY unique_vet_type (VetId, PetTypeId),
    FOREIGN KEY (VetId) REFERENCES Veterinarians(Id),
    FOREIGN KEY (PetTypeId) REFERENCES PetTypes(Id)
);

-- Extra contact/availability info for veterinarians
-- Extends the existing Veterinarians table without changing it
CREATE TABLE VetDetails (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    VetId INT NOT NULL UNIQUE,
    Phone VARCHAR(20),
    Email VARCHAR(100),
    IsAvailable BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (VetId) REFERENCES Veterinarians(Id)
);
CREATE TABLE Owners (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Phone VARCHAR(20),
    Email VARCHAR(100)
);

CREATE TABLE Pets (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Type VARCHAR(50),
    Age INT,
    IsActive BOOLEAN DEFAULT TRUE,
    OwnerId INT,
    FOREIGN KEY (OwnerId) REFERENCES Owners(Id)
);

CREATE TABLE Veterinarians (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Role VARCHAR(50) NOT NULL,
    Specialization VARCHAR(100),
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
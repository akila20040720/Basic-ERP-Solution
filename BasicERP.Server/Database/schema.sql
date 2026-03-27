-- ABC Company Employee Management System - Database Schema
-- MySQL 8.0+
-- Run this script first to create tables and indexes

USE abc_company_db;

-- Departments Table
CREATE TABLE IF NOT EXISTS Departments (
    DepartmentId INT AUTO_INCREMENT PRIMARY KEY,
    DepartmentName VARCHAR(100) NOT NULL UNIQUE,
    INDEX idx_DepartmentName (DepartmentName)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Positions Table
CREATE TABLE IF NOT EXISTS Positions (
    PositionId INT AUTO_INCREMENT PRIMARY KEY,
    PositionName VARCHAR(100) NOT NULL UNIQUE,
    INDEX idx_PositionName (PositionName)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Employees Table
CREATE TABLE IF NOT EXISTS Employees (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    EmployeeNo VARCHAR(50) NOT NULL UNIQUE,
    EmployeeName VARCHAR(150) NOT NULL,
    Gender VARCHAR(20),
    DepartmentId INT NOT NULL,
    PositionId INT NOT NULL,
    Mobile VARCHAR(20),
    Phone VARCHAR(20),
    Email VARCHAR(100),
    Fax VARCHAR(20),
    Picture LONGTEXT,
    INDEX idx_EmployeeNo (EmployeeNo),
    INDEX idx_DepartmentId (DepartmentId),
    INDEX idx_PositionId (PositionId),
    CONSTRAINT fk_Employees_Department 
        FOREIGN KEY (DepartmentId) REFERENCES Departments(DepartmentId) ON DELETE RESTRICT,
    CONSTRAINT fk_Employees_Position 
        FOREIGN KEY (PositionId) REFERENCES Positions(PositionId) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

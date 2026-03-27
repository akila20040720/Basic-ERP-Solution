-- ABC Company Employee Management System - Seed Data
-- MySQL 8.0+
-- Run this script after schema.sql to populate initial data

USE abc_company_db;

-- Insert Departments
INSERT INTO Departments (DepartmentName) VALUES 
('Human Resources'),
('Finance'),
('Engineering'),
('Sales'),
('Marketing'),
('Operations');

-- Insert Positions
INSERT INTO Positions (PositionName) VALUES 
('Manager'),
('Executive'),
('Developer'),
('Analyst'),
('Coordinator'),
('Director');

-- Insert Sample Employees
-- Department IDs: HR=1, Finance=2, Engineering=3, Sales=4, Marketing=5, Operations=6
-- Position IDs: Manager=1, Executive=2, Developer=3, Analyst=4, Coordinator=5, Director=6

INSERT INTO Employees (EmployeeNo, EmployeeName, Gender, DepartmentId, PositionId, Mobile, Phone, Email, Fax, Picture) VALUES
('EMP001', 'John Smith', 'Male', 1, 1, '+1-555-0101', '555-0101', 'john.smith@abccompany.com', '555-0101-ext', ''),
('EMP002', 'Sarah Johnson', 'Female', 1, 5, '+1-555-0102', '555-0102', 'sarah.johnson@abccompany.com', '555-0102-ext', ''),
('EMP003', 'Michael Chen', 'Male', 2, 1, '+1-555-0103', '555-0103', 'michael.chen@abccompany.com', '555-0103-ext', ''),
('EMP004', 'Emily Davis', 'Female', 2, 4, '+1-555-0104', '555-0104', 'emily.davis@abccompany.com', '555-0104-ext', ''),
('EMP005', 'Robert Wilson', 'Male', 3, 2, '+1-555-0105', '555-0105', 'robert.wilson@abccompany.com', '555-0105-ext', ''),
('EMP006', 'Lisa Anderson', 'Female', 3, 3, '+1-555-0106', '555-0106', 'lisa.anderson@abccompany.com', '555-0106-ext', ''),
('EMP007', 'David Martinez', 'Male', 3, 3, '+1-555-0107', '555-0107', 'david.martinez@abccompany.com', '555-0107-ext', ''),
('EMP008', 'Jennifer Taylor', 'Female', 4, 1, '+1-555-0108', '555-0108', 'jennifer.taylor@abccompany.com', '555-0108-ext', ''),
('EMP009', 'Christopher Lee', 'Male', 4, 5, '+1-555-0109', '555-0109', 'christopher.lee@abccompany.com', '555-0109-ext', ''),
('EMP010', 'Amanda White', 'Female', 5, 4, '+1-555-0110', '555-0110', 'amanda.white@abccompany.com', '555-0110-ext', ''),
('EMP011', 'James Brown', 'Male', 5, 5, '+1-555-0111', '555-0111', 'james.brown@abccompany.com', '555-0111-ext', ''),
('EMP012', 'Patricia Garcia', 'Female', 6, 6, '+1-555-0112', '555-0112', 'patricia.garcia@abccompany.com', '555-0112-ext', ''),
('EMP013', 'Mark Rodriguez', 'Male', 6, 1, '+1-555-0113', '555-0113', 'mark.rodriguez@abccompany.com', '555-0113-ext', ''),
('EMP014', 'Nancy Harris', 'Female', 3, 3, '+1-555-0114', '555-0114', 'nancy.harris@abccompany.com', '555-0114-ext', ''),
('EMP015', 'Thomas Clark', 'Male', 2, 4, '+1-555-0115', '555-0115', 'thomas.clark@abccompany.com', '555-0115-ext', '');

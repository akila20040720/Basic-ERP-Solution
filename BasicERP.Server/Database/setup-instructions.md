# ABC Company Employee Management System - Database Setup

## Overview
This directory contains SQL scripts for setting up the MySQL database for the ABC Company Employee Management System.

## Files
- **schema.sql** - Creates the database tables and indexes (run first)
- **seed-data.sql** - Populates initial data (run after schema.sql)

## Prerequisites
- MySQL Server 8.0 or later
- MySQL client tool (mysql CLI, MySQL Workbench, or similar)
- User with CREATE/INSERT permissions

## Setup Instructions

### Option 1: Using MySQL CLI

```bash
# Create the database
mysql -h localhost -u root -p -e "CREATE DATABASE abc_company_db;"

# Create schema
mysql -h localhost -u root -p abc_company_db < schema.sql

# Populate seed data
mysql -h localhost -u root -p abc_company_db < seed-data.sql

# Verify tables were created
mysql -h localhost -u root -p abc_company_db -e "SHOW TABLES;"
```

### Option 2: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Create new query tab
4. Open and execute `schema.sql`
5. Open and execute `seed-data.sql`
6. Verify tables in the database explorer

### Option 3: Using Azure Data Studio
1. Connect to MySQL server
2. New Query
3. Copy contents of `schema.sql` and execute
4. Copy contents of `seed-data.sql` and execute

## Configure Connection String

After creating the database, update your .NET application configuration:

### In `appsettings.json` or `appsettings.Production.json`:
```json
{
  "ConnectionStrings": {
    "MySql": "Server=localhost;Port=3306;Database=abc_company_db;Uid=root;Pwd=your_password;"
  }
}
```

### Or set environment variable:
```bash
# Windows
set CONNECTIONSTRINGS__MYSQL=Server=localhost;Port=3306;Database=abc_company_db;Uid=root;Pwd=your_password;

# Linux/macOS
export CONNECTIONSTRINGS__MYSQL="Server=localhost;Port=3306;Database=abc_company_db;Uid=root;Pwd=your_password;"
```

## Database Schema

### Tables

#### Departments
- **DepartmentId** (INT, PK, Auto-increment)
- **DepartmentName** (VARCHAR(100), UNIQUE)

#### Positions
- **PositionId** (INT, PK, Auto-increment)
- **PositionName** (VARCHAR(100), UNIQUE)

#### Employees
- **Id** (INT, PK, Auto-increment)
- **EmployeeNo** (VARCHAR(50), UNIQUE)
- **EmployeeName** (VARCHAR(150))
- **Gender** (VARCHAR(20))
- **DepartmentId** (INT, FK → Departments)
- **PositionId** (INT, FK → Positions)
- **Mobile** (VARCHAR(20))
- **Phone** (VARCHAR(20))
- **Email** (VARCHAR(100))
- **Fax** (VARCHAR(20))
- **Picture** (LONGTEXT) - Stores image URLs

### Relationships
- Employee **→ many-to-one ← Department** (one department has many employees)
- Employee **→ many-to-one ← Position** (one position has many employees)
- Foreign key constraints with `ON DELETE RESTRICT` ensure referential integrity

## Seed Data

The seed script populates:
- **6 Departments**: HR, Finance, Engineering, Sales, Marketing, Operations
- **6 Positions**: Manager, Executive, Developer, Analyst, Coordinator, Director
- **15 Sample Employees**: Distributed across departments with varied roles and contact information

All sample data uses realistic contact information format. The `Picture` field is empty by default and can be populated with image URLs via the application UI.

## Entity Framework Core Integration

The application uses EF Core with the Pomelo MySQL provider. When you run the application:

1. **InMemory Mode** (Development): If `ConnectionStrings:MySql` is empty, EF Core automatically uses InMemory database (no MySQL needed)
2. **MySQL Mode** (Production): If connection string is provided, EF Core uses MySQL
3. **Database Creation**: Tables are automatically created on first run if they don't exist (via `EnsureCreated()`)
4. **Seed Data**: Initial departments and positions are auto-seeded via `Program.cs` if they're missing

## Using Migrations (Optional)

If you prefer Entity Framework Core migrations for schema management:

```bash
# Add initial migration
dotnet ef migrations add InitialCreate --project PhoneBookApp.Server

# Apply migrations to database
dotnet ef database update --project PhoneBookApp.Server

# Generate SQL migration script
dotnet ef migrations script > migration.sql
```

## Troubleshooting

### Connection Failed
```
Error: Access denied for user 'root'@'localhost'
```
- Verify MySQL server is running
- Check username/password in connection string
- Ensure database user has required permissions

### Foreign Key Constraint Failed
```
Error: Cannot add or update a child row: a foreign key constraint fails
```
- Verify schema.sql was executed first
- Ensure DepartmentId and PositionId exist in their respective tables
- Check that seed-data.sql is using correct department/position IDs

### Database Not Found
```
Error: Unknown database 'abc_company_db'
```
- Create database: `CREATE DATABASE abc_company_db;`
- Or modify connection string to target different database name

## Backup and Restore

### Backup database
```bash
mysqldump -h localhost -u root -p abc_company_db > backup.sql
```

### Restore from backup
```bash
mysql -h localhost -u root -p abc_company_db < backup.sql
```

## Production Deployment Checklist

- [ ] MySQL server is accessible from application server
- [ ] Connection string uses secure credentials (not hardcoded)
- [ ] Firewall rules allow MySQL communication
- [ ] Database has been optimized with appropriate indexes
- [ ] Backup strategy is in place
- [ ] User account has minimal required permissions (not root)
- [ ] `external image API` BaseUrl is configured in appsettings
- [ ] Application health checks include database connectivity tests

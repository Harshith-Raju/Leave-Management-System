const mysql = require('mysql2');
require('dotenv').config();

// Create connection without specifying database first
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

// Create database
connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`, (err) => {
  if (err) {
    console.error('Error creating database:', err);
    process.exit(1);
  }
  
  console.log('Database created or already exists');
  
  // Switch to the database
  connection.query(`USE ${process.env.DB_NAME}`, (err) => {
    if (err) {
      console.error('Error using database:', err);
      process.exit(1);
    }
    
    // Create tables
    const queries = [
      `CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        department_id INT NOT NULL,
        joining_date DATE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('employee', 'manager', 'admin') DEFAULT 'employee',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS leave_balances (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL UNIQUE,
        balance INT NOT NULL DEFAULT 20 CHECK (balance >= 0),
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS leave_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT,
        status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        INDEX idx_employee_status (employee_id, status),
        CONSTRAINT chk_dates CHECK (start_date <= end_date)
      )`,
      
      `INSERT IGNORE INTO departments (name) VALUES 
        ('Engineering'), 
        ('HR'), 
        ('Marketing'), 
        ('Sales'), 
        ('Finance')`
    ];
    
    // Execute queries sequentially
    const executeQuery = (index) => {
      if (index >= queries.length) {
        console.log('Database initialization completed successfully!');
        connection.end();
        return;
      }
      
      connection.query(queries[index], (err) => {
        if (err) {
          console.error('Error executing query:', err);
          connection.end();
          process.exit(1);
        }
        
        executeQuery(index + 1);
      });
    };
    
    executeQuery(0);
  });
});
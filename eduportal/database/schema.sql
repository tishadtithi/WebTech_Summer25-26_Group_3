-- =====================================================
-- EDU PORTAL - DATABASE SCHEMA
-- =====================================================

CREATE DATABASE IF NOT EXISTS eduportal CHARACTER SET utf8mb4;
USE eduportal;

-- =====================================================
-- USERS
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(40) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'instructor', 'student') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- COURSES
-- =====================================================

CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(40) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    code VARCHAR(40) NOT NULL,
    instructorId VARCHAR(40) NOT NULL,
    instructorName VARCHAR(120) NOT NULL,
    category VARCHAR(80) NOT NULL,
    description TEXT,
    materials TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instructorId) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- ENROLLMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS enrollments (
    id VARCHAR(40) PRIMARY KEY,
    student_id VARCHAR(40) NOT NULL,
    course_id VARCHAR(40) NOT NULL,
    progress INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (student_id, course_id)
);

-- =====================================================
-- SEED DATA
-- (passwords are plain text to match the current login.php --
--  see the security note about hashing in the write-up)
-- =====================================================

INSERT INTO users (id, name, email, password, role) VALUES
('u-admin1',      'Ava Admin',        'admin@eduportal.com',      'admin123',      'admin'),
('u-instructor1', 'Ian Instructor',   'instructor@eduportal.com', 'instructor123', 'instructor'),
('u-student1',    'Sam Student',      'student@eduportal.com',    'student123',    'student');

INSERT INTO courses (id, title, code, instructorId, instructorName, category, description, materials) VALUES
('c-1', 'Introduction to Web Development', 'WEB101', 'u-instructor1', 'Ian Instructor', 'Web Development', 'Learn HTML, CSS and JavaScript basics.', 'Slides, exercises'),
('c-2', 'Databases and SQL',               'DB201',  'u-instructor1', 'Ian Instructor', 'Databases',       'Relational database design and SQL queries.', 'Slides, sample datasets');

INSERT INTO enrollments (id, student_id, course_id, progress) VALUES
('e-1', 'u-student1', 'c-1', 40);

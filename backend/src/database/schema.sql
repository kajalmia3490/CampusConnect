-- ==========================================================
-- CampusConnect Database Schema for MS SQL Server
-- Project: SDP-03 CampusConnect Platform (BUBT)
-- ==========================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Departments')
BEGIN
    CREATE TABLE Departments (
        department_id INT IDENTITY(1,1) PRIMARY KEY,
        department_code VARCHAR(20) NOT NULL UNIQUE,
        department_name NVARCHAR(150) NOT NULL,
        created_at DATETIME DEFAULT GETDATE()
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        user_id INT IDENTITY(1,1) PRIMARY KEY,
        university_id VARCHAR(50) NOT NULL UNIQUE,
        full_name NVARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('STUDENT', 'TEACHER', 'STAFF', 'ADMIN')),
        department_id INT NULL FOREIGN KEY REFERENCES Departments(department_id),
        semester INT NULL,
        section VARCHAR(10) NULL,
        phone VARCHAR(30) NULL,
        avatar_url NVARCHAR(500) NULL,
        is_active BIT DEFAULT 1,
        created_at DATETIME DEFAULT GETDATE()
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Courses')
BEGIN
    CREATE TABLE Courses (
        course_id INT IDENTITY(1,1) PRIMARY KEY,
        course_code VARCHAR(30) NOT NULL,
        course_title NVARCHAR(200) NOT NULL,
        credits DECIMAL(3,1) DEFAULT 3.0,
        department_id INT NOT NULL FOREIGN KEY REFERENCES Departments(department_id),
        semester INT NOT NULL,
        teacher_id INT NULL FOREIGN KEY REFERENCES Users(user_id),
        created_at DATETIME DEFAULT GETDATE()
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CourseEnrollments')
BEGIN
    CREATE TABLE CourseEnrollments (
        enrollment_id INT IDENTITY(1,1) PRIMARY KEY,
        course_id INT NOT NULL FOREIGN KEY REFERENCES Courses(course_id),
        student_id INT NOT NULL FOREIGN KEY REFERENCES Users(user_id),
        enrolled_at DATETIME DEFAULT GETDATE(),
        CONSTRAINT UQ_Enrollment UNIQUE (course_id, student_id)
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Notices')
BEGIN
    CREATE TABLE Notices (
        notice_id INT IDENTITY(1,1) PRIMARY KEY,
        title NVARCHAR(250) NOT NULL,
        content NVARCHAR(MAX) NOT NULL,
        category VARCHAR(50) DEFAULT 'General',
        priority VARCHAR(20) DEFAULT 'Normal' CHECK (priority IN ('Normal', 'High', 'Urgent')),
        department_id INT NULL FOREIGN KEY REFERENCES Departments(department_id),
        author_id INT NOT NULL FOREIGN KEY REFERENCES Users(user_id),
        attachment_url NVARCHAR(500) NULL,
        expires_at DATETIME NULL,
        created_at DATETIME DEFAULT GETDATE()
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ClassRoutines')
BEGIN
    CREATE TABLE ClassRoutines (
        routine_id INT IDENTITY(1,1) PRIMARY KEY,
        course_id INT NOT NULL FOREIGN KEY REFERENCES Courses(course_id),
        teacher_id INT NULL FOREIGN KEY REFERENCES Users(user_id),
        department_id INT NOT NULL FOREIGN KEY REFERENCES Departments(department_id),
        semester INT NOT NULL,
        section VARCHAR(10) NOT NULL,
        day_of_week VARCHAR(20) NOT NULL,
        start_time VARCHAR(20) NOT NULL,
        end_time VARCHAR(20) NOT NULL,
        room_number NVARCHAR(100) NOT NULL,
        created_at DATETIME DEFAULT GETDATE()
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LearningMaterials')
BEGIN
    CREATE TABLE LearningMaterials (
        material_id INT IDENTITY(1,1) PRIMARY KEY,
        course_id INT NOT NULL FOREIGN KEY REFERENCES Courses(course_id),
        title NVARCHAR(250) NOT NULL,
        description NVARCHAR(MAX) NULL,
        topic NVARCHAR(150) NULL,
        file_url NVARCHAR(500) NOT NULL,
        file_type VARCHAR(50) NULL,
        uploaded_by INT NOT NULL FOREIGN KEY REFERENCES Users(user_id),
        created_at DATETIME DEFAULT GETDATE()
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Assignments')
BEGIN
    CREATE TABLE Assignments (
        assignment_id INT IDENTITY(1,1) PRIMARY KEY,
        course_id INT NOT NULL FOREIGN KEY REFERENCES Courses(course_id),
        title NVARCHAR(250) NOT NULL,
        description NVARCHAR(MAX) NOT NULL,
        due_date DATETIME NOT NULL,
        total_marks INT DEFAULT 100,
        attachment_url NVARCHAR(500) NULL,
        teacher_id INT NOT NULL FOREIGN KEY REFERENCES Users(user_id),
        created_at DATETIME DEFAULT GETDATE()
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AssignmentSubmissions')
BEGIN
    CREATE TABLE AssignmentSubmissions (
        submission_id INT IDENTITY(1,1) PRIMARY KEY,
        assignment_id INT NOT NULL FOREIGN KEY REFERENCES Assignments(assignment_id),
        student_id INT NOT NULL FOREIGN KEY REFERENCES Users(user_id),
        submission_text NVARCHAR(MAX) NULL,
        file_url NVARCHAR(500) NULL,
        submitted_at DATETIME DEFAULT GETDATE(),
        status VARCHAR(30) DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Graded', 'Late')),
        marks_obtained DECIMAL(5,2) NULL,
        feedback NVARCHAR(MAX) NULL,
        graded_at DATETIME NULL,
        CONSTRAINT UQ_AssignmentSubmission UNIQUE (assignment_id, student_id)
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CampusEvents')
BEGIN
    CREATE TABLE CampusEvents (
        event_id INT IDENTITY(1,1) PRIMARY KEY,
        title NVARCHAR(250) NOT NULL,
        description NVARCHAR(MAX) NOT NULL,
        organizer NVARCHAR(150) NOT NULL,
        event_date DATETIME NOT NULL,
        venue NVARCHAR(200) NOT NULL,
        capacity INT DEFAULT 100,
        banner_url NVARCHAR(500) NULL,
        status VARCHAR(20) DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Ongoing', 'Completed', 'Cancelled')),
        created_by INT NOT NULL FOREIGN KEY REFERENCES Users(user_id),
        created_at DATETIME DEFAULT GETDATE()
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EventRegistrations')
BEGIN
    CREATE TABLE EventRegistrations (
        registration_id INT IDENTITY(1,1) PRIMARY KEY,
        event_id INT NOT NULL FOREIGN KEY REFERENCES CampusEvents(event_id),
        user_id INT NOT NULL FOREIGN KEY REFERENCES Users(user_id),
        registered_at DATETIME DEFAULT GETDATE(),
        CONSTRAINT UQ_EventRegistration UNIQUE (event_id, user_id)
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Complaints')
BEGIN
    CREATE TABLE Complaints (
        complaint_id INT IDENTITY(1,1) PRIMARY KEY,
        title NVARCHAR(250) NOT NULL,
        category VARCHAR(50) NOT NULL,
        priority VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
        description NVARCHAR(MAX) NOT NULL,
        location NVARCHAR(200) NOT NULL,
        image_url NVARCHAR(500) NULL,
        status VARCHAR(30) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Under Review', 'In Progress', 'Resolved', 'Rejected')),
        user_id INT NOT NULL FOREIGN KEY REFERENCES Users(user_id),
        assigned_staff_id INT NULL FOREIGN KEY REFERENCES Users(user_id),
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE()
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ComplaintTimelines')
BEGIN
    CREATE TABLE ComplaintTimelines (
        timeline_id INT IDENTITY(1,1) PRIMARY KEY,
        complaint_id INT NOT NULL FOREIGN KEY REFERENCES Complaints(complaint_id),
        status VARCHAR(30) NOT NULL,
        remarks NVARCHAR(MAX) NOT NULL,
        updated_by INT NOT NULL FOREIGN KEY REFERENCES Users(user_id),
        created_at DATETIME DEFAULT GETDATE()
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LostAndFound')
BEGIN
    CREATE TABLE LostAndFound (
        item_id INT IDENTITY(1,1) PRIMARY KEY,
        type VARCHAR(10) NOT NULL CHECK (type IN ('Lost', 'Found')),
        title NVARCHAR(200) NOT NULL,
        category VARCHAR(50) NOT NULL,
        description NVARCHAR(MAX) NOT NULL,
        location NVARCHAR(200) NOT NULL,
        item_date DATETIME NOT NULL,
        contact_info NVARCHAR(200) NOT NULL,
        image_url NVARCHAR(500) NULL,
        status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Claimed', 'Returned')),
        user_id INT NOT NULL FOREIGN KEY REFERENCES Users(user_id),
        created_at DATETIME DEFAULT GETDATE()
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Notifications')
BEGIN
    CREATE TABLE Notifications (
        notification_id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL FOREIGN KEY REFERENCES Users(user_id),
        title NVARCHAR(200) NOT NULL,
        message NVARCHAR(MAX) NOT NULL,
        type VARCHAR(50) DEFAULT 'General',
        reference_id INT NULL,
        is_read BIT DEFAULT 0,
        created_at DATETIME DEFAULT GETDATE()
    );
END;

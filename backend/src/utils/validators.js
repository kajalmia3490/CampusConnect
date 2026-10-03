const validator = {
  // Email validation
  email: (email) => {
    const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
  },

  // Password strength validation
  password: (password) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null; // Valid
  },

  // Name validation
  name: (name) => {
    if (!name || name.trim().length === 0) {
      return 'Name is required';
    }
    if (name.trim().length > 50) {
      return 'Name cannot exceed 50 characters';
    }
    return null;
  },

  // Role validation
  role: (role) => {
    const validRoles = ['student', 'teacher', 'staff', 'admin'];
    if (!validRoles.includes(role)) {
      return `Role must be one of: ${validRoles.join(', ')}`;
    }
    return null;
  },

  // Semester validation
  semester: (semester) => {
    if (semester < 1 || semester > 8) {
      return 'Semester must be between 1 and 8';
    }
    return null;
  },
};

module.exports = validator;

/**
 * Mock Authentication Service
 * This service simulates authentication for demo purposes
 * Replace with actual API calls when backend is ready
 */

// Mock user database
const mockUsers = [
  {
    id: '1',
    email: 'user@demo.com',
    password: 'user123',
    phone: '+919876543210',
    name: 'John User',
    role: 'user',
    otp: '123456'
  },
  {
    id: '2',
    email: 'admin@demo.com',
    password: 'admin123',
    phone: '+919876543211',
    name: 'Admin User',
    role: 'admin',
    otp: '123456'
  },
  {
    id: '3',
    email: 'worker@demo.com',
    password: 'worker123',
    phone: '+919876543212',
    name: 'Mike Worker',
    role: 'worker',
    otp: '123456'
  }
];

// Generate mock JWT token
const generateMockToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };
  // Simple base64 encoding for demo (NOT secure for production)
  return btoa(JSON.stringify(payload));
};

// Decode mock token
export const decodeToken = (token) => {
  try {
    return JSON.parse(atob(token));
  } catch {
    return null;
  }
};

// Login with email and password
export const loginWithEmail = async (email, password) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const user = mockUsers.find(u => u.email === email && u.password === password);
  
  if (user) {
    const token = generateMockToken(user);
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone
    };
    
    // Store in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    return {
      success: true,
      token,
      user: userData
    };
  }
  
  return {
    success: false,
    error: 'Invalid email or password'
  };
};

// Send OTP
export const sendOTP = async (phone) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const user = mockUsers.find(u => u.phone === phone);
  
  if (user) {
    console.log(`Mock OTP sent to ${phone}: 123456`);
    localStorage.setItem('pendingOTPPhone', phone);
    return {
      success: true,
      message: 'OTP sent successfully (Use: 123456)'
    };
  }
  
  return {
    success: false,
    error: 'Phone number not registered'
  };
};

// Verify OTP
export const verifyOTP = async (phone, otp) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const user = mockUsers.find(u => u.phone === phone && u.otp === otp);
  
  if (user) {
    const token = generateMockToken(user);
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone
    };
    
    // Store in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.removeItem('pendingOTPPhone');
    
    return {
      success: true,
      token,
      user: userData
    };
  }
  
  return {
    success: false,
    error: 'Invalid OTP'
  };
};

// Register new user
export const register = async (userData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check if user already exists
  const exists = mockUsers.find(u => u.email === userData.email || u.phone === userData.phone);
  
  if (exists) {
    return {
      success: false,
      error: 'User already exists with this email or phone'
    };
  }
  
  // Create new user
  const newUser = {
    id: String(mockUsers.length + 1),
    ...userData,
    role: 'user',
    otp: '123456'
  };
  
  mockUsers.push(newUser);
  
  const token = generateMockToken(newUser);
  const userResponse = {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
    phone: newUser.phone
  };
  
  // Store in localStorage
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(userResponse));
  
  return {
    success: true,
    token,
    user: userResponse
  };
};

// Logout
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('pendingOTPPhone');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  const decoded = decodeToken(token);
  if (!decoded) return false;
  
  // Check if token is expired
  if (decoded.exp < Date.now()) {
    logout();
    return false;
  }
  
  return true;
};

// Get current user
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Get user role
export const getUserRole = () => {
  const user = getCurrentUser();
  return user ? user.role : null;
};

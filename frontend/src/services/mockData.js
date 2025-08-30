/**
 * Mock Data Service
 * Contains all mock data for the application
 * Replace with actual API calls when backend is ready
 */

// Mock workshops data
export const mockWorkshops = [
  {
    id: '1',
    name: 'QuickFix Auto Services',
    address: 'MG Road, Bengaluru, Karnataka 560001',
    lat: 12.9716,
    lng: 77.5946,
    rating: 4.5,
    reviews: 234,
    services: ['Tire Change', 'Battery Jump', 'Towing', 'Minor Repairs'],
    phone: '+919876543210',
    openTime: '08:00',
    closeTime: '22:00',
    isOpen: true,
    distance: 2.3,
    image: 'https://via.placeholder.com/400x250/2a2a2a/3b82f6?text=QuickFix+Auto'
  },
  {
    id: '2',
    name: 'RoadSide Heroes',
    address: 'Koramangala, Bengaluru, Karnataka 560095',
    lat: 12.9352,
    lng: 77.6245,
    rating: 4.8,
    reviews: 456,
    services: ['Tire Change', 'Fuel Delivery', 'Lockout Service', 'Towing'],
    phone: '+919876543211',
    openTime: '24/7',
    closeTime: '24/7',
    isOpen: true,
    distance: 4.1,
    image: 'https://via.placeholder.com/400x250/2a2a2a/3b82f6?text=RoadSide+Heroes'
  },
  {
    id: '3',
    name: 'Express Mechanics',
    address: 'Whitefield, Bengaluru, Karnataka 560066',
    lat: 12.9698,
    lng: 77.7500,
    rating: 4.2,
    reviews: 189,
    services: ['Battery Jump', 'Minor Repairs', 'Oil Change', 'Brake Service'],
    phone: '+919876543212',
    openTime: '09:00',
    closeTime: '21:00',
    isOpen: true,
    distance: 6.5,
    image: 'https://via.placeholder.com/400x250/2a2a2a/3b82f6?text=Express+Mechanics'
  },
  {
    id: '4',
    name: 'City Auto Care',
    address: 'Indiranagar, Bengaluru, Karnataka 560038',
    lat: 12.9784,
    lng: 77.6408,
    rating: 4.6,
    reviews: 321,
    services: ['Full Service', 'Tire Change', 'Battery Service', 'AC Repair'],
    phone: '+919876543213',
    openTime: '08:30',
    closeTime: '20:00',
    isOpen: false,
    distance: 3.2,
    image: 'https://via.placeholder.com/400x250/2a2a2a/3b82f6?text=City+Auto+Care'
  }
];

// Mock service requests
export const mockServiceRequests = [
  {
    id: 'SR001',
    userId: '1',
    workshopId: '1',
    workshopName: 'QuickFix Auto Services',
    service: 'Tire Change',
    status: 'in-progress',
    createdAt: '2024-01-15T10:30:00',
    estimatedArrival: '2024-01-15T11:00:00',
    mechanicName: 'John Mechanic',
    mechanicPhone: '+919876543220',
    mechanicLocation: {
      lat: 12.9700,
      lng: 77.5900
    },
    vehicleInfo: {
      make: 'Honda',
      model: 'City',
      year: '2020',
      registrationNumber: 'KA01AB1234'
    },
    location: {
      address: 'Near Forum Mall, Koramangala',
      lat: 12.9350,
      lng: 77.6100
    },
    estimatedCost: 1500,
    notes: 'Front left tire punctured'
  },
  {
    id: 'SR002',
    userId: '1',
    workshopId: '2',
    workshopName: 'RoadSide Heroes',
    service: 'Battery Jump',
    status: 'completed',
    createdAt: '2024-01-10T08:15:00',
    completedAt: '2024-01-10T09:00:00',
    mechanicName: 'Mike Worker',
    mechanicPhone: '+919876543221',
    vehicleInfo: {
      make: 'Maruti',
      model: 'Swift',
      year: '2019',
      registrationNumber: 'KA02CD5678'
    },
    location: {
      address: 'HSR Layout, Sector 2',
      lat: 12.9150,
      lng: 77.6300
    },
    totalCost: 800,
    rating: 5,
    review: 'Quick and professional service!'
  },
  {
    id: 'SR003',
    userId: '1',
    workshopId: '3',
    workshopName: 'Express Mechanics',
    service: 'Fuel Delivery',
    status: 'pending',
    createdAt: '2024-01-15T09:45:00',
    vehicleInfo: {
      make: 'Toyota',
      model: 'Innova',
      year: '2021',
      registrationNumber: 'KA03EF9012'
    },
    location: {
      address: 'Electronic City Phase 1',
      lat: 12.8500,
      lng: 77.6600
    },
    estimatedCost: 500,
    notes: 'Need 10 liters of diesel'
  }
];

// Mock notifications
export const mockNotifications = [
  {
    id: '1',
    type: 'service_update',
    title: 'Mechanic on the way',
    message: 'John from QuickFix Auto Services is heading to your location',
    timestamp: '2024-01-15T10:45:00',
    read: false,
    actionUrl: '/requests/SR001'
  },
  {
    id: '2',
    type: 'service_complete',
    title: 'Service Completed',
    message: 'Your battery jump service has been completed successfully',
    timestamp: '2024-01-10T09:00:00',
    read: true,
    actionUrl: '/requests/SR002'
  },
  {
    id: '3',
    type: 'promotion',
    title: '20% Off on Next Service',
    message: 'Use code SAVE20 on your next service booking',
    timestamp: '2024-01-14T12:00:00',
    read: false
  },
  {
    id: '4',
    type: 'reminder',
    title: 'Vehicle Service Due',
    message: 'Your Honda City is due for regular maintenance',
    timestamp: '2024-01-13T09:00:00',
    read: true
  }
];

// Simulated mechanic location updates
export const simulateMechanicMovement = (currentLocation, destination) => {
  const latDiff = destination.lat - currentLocation.lat;
  const lngDiff = destination.lng - currentLocation.lng;
  
  // Move 10% closer to destination
  return {
    lat: currentLocation.lat + (latDiff * 0.1),
    lng: currentLocation.lng + (lngDiff * 0.1)
  };
};

// Get workshops
export const getWorkshops = async (filters = {}) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let workshops = [...mockWorkshops];
  
  // Apply filters
  if (filters.service) {
    workshops = workshops.filter(w => 
      w.services.includes(filters.service)
    );
  }
  
  if (filters.isOpen !== undefined) {
    workshops = workshops.filter(w => w.isOpen === filters.isOpen);
  }
  
  if (filters.minRating) {
    workshops = workshops.filter(w => w.rating >= filters.minRating);
  }
  
  // Sort by distance by default
  workshops.sort((a, b) => a.distance - b.distance);
  
  return { success: true, data: workshops };
};

// Get workshop by ID
export const getWorkshopById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const workshop = mockWorkshops.find(w => w.id === id);
  
  if (workshop) {
    // Add additional fields for detail view
    const enhancedWorkshop = {
      ...workshop,
      email: `contact@${workshop.name.toLowerCase().replace(/\s+/g, '')}.com`,
      description: `Professional roadside assistance and vehicle repair services. Our experienced mechanics are available to help you get back on the road quickly and safely.`,
    };
    return { success: true, data: enhancedWorkshop };
  }
  
  return { success: false, error: 'Workshop not found' };
};

// Get service requests
export const getServiceRequests = async (userId) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const requests = mockServiceRequests.filter(r => r.userId === userId);
  
  return { success: true, data: requests };
};

// Get service request by ID
export const getServiceRequestById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const request = mockServiceRequests.find(r => r.id === id);
  
  if (request) {
    return { success: true, data: request };
  }
  
  return { success: false, error: 'Request not found' };
};

// Create service request
export const createServiceRequest = async (requestData) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newRequest = {
    id: `SR${String(mockServiceRequests.length + 1).padStart(3, '0')}`,
    ...requestData,
    status: 'pending',
    createdAt: new Date().toISOString(),
    estimatedArrival: new Date(Date.now() + 30 * 60000).toISOString() // 30 minutes from now
  };
  
  mockServiceRequests.push(newRequest);
  
  return { success: true, data: newRequest };
};

// Get notifications
export const getNotifications = async (userId, filter = 'all') => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  let notifications = mockNotifications.map(n => ({
    ...n,
    isRead: n.read,
    type: n.type === 'service_update' ? 'info' : 
          n.type === 'service_complete' ? 'success' : 
          n.type === 'promotion' ? 'warning' : 'info'
  }));
  
  if (filter === 'unread') {
    notifications = notifications.filter(n => !n.isRead);
  } else if (filter === 'read') {
    notifications = notifications.filter(n => n.isRead);
  }
  
  return { success: true, data: notifications };
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const notification = mockNotifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
  }
  
  return { success: true };
};

// Get dashboard stats for admin
export const getAdminDashboardStats = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    data: {
      totalRequests: 156,
      activeRequests: 12,
      completedToday: 28,
      totalWorkshops: mockWorkshops.length,
      activeWorkers: 45,
      revenue: {
        today: 45000,
        week: 280000,
        month: 1200000
      },
      requestsByStatus: {
        pending: 8,
        'in-progress': 12,
        completed: 136
      }
    }
  };
};

// Get worker dashboard stats
export const getWorkerDashboardStats = async (workerId) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    data: {
      assignedRequests: 3,
      completedToday: 5,
      earnings: {
        today: 2500,
        week: 15000,
        month: 60000
      },
      rating: 4.7,
      totalReviews: 89
    }
  };
};

# RoadGaurd

RoadGaurd is a comprehensive roadside assistance platform that connects users with nearby workshops and service providers for emergency vehicle assistance.

Video:
https://drive.google.com/file/d/1fSSi_CTyru4J9Z3jb-ckEz2V74uauIQE/view?usp=sharing

## Project Overview

RoadGaurd provides a seamless experience for users to request roadside assistance services, track service requests, and connect with qualified workshops. The application supports multiple user roles including customers, workshop owners, service workers, and administrators.

### Key Features

- **User Authentication**: Secure login and registration system with role-based access control
- **Geolocation Services**: Find nearby workshops based on user location
- **Service Request Management**: Create, track, and manage service requests
- **Workshop Management**: Admin tools for managing workshops and service providers
- **Notifications System**: Real-time notifications for service updates
- **Multi-language Support**: Internationalization ready with i18next

## Tech Stack

### Backend

- Node.js with Express
- MySQL database
- JWT authentication
- RESTful API architecture

### Frontend

- React 18
- Vite build tool
- React Router for navigation
- Leaflet/OpenLayers for maps
- Axios for API requests
- React-Toastify for notifications

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```
   git clone https://github.com/yourusername/RoadGaurd.git
   cd RoadGaurd
   ```
2. **Backend Setup**

   ```
   cd backend
   npm install
   ```

   Create a `.env` file based on `.env.example` with your database credentials:

   ```
   DATABASE_URL="mysql://username:password@localhost:3306/road_guard"
   JWT_SECRET="your-secret-key"
   ```

   Initialize the database:

   ```
   npm run db:init
   ```
3. **Frontend Setup**

   ```
   cd ../frontend
   npm install
   ```

   Create a `.env` file based on `.env.example`:

   ```
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

### Running the Application

1. **Start the Backend Server**

   ```
   cd backend
   npm run dev
   ```

   The server will run on http://localhost:8000
2. **Start the Frontend Development Server**

   ```
   cd frontend
   npm run dev
   ```

   The application will be available at http://localhost:5173

## Project Structure

```
RoadGaurd/
├── backend/               # Backend Node.js application
│   ├── scripts/           # Database scripts
│   └── src/               # Source code
│       ├── index.js       # Entry point
│       ├── lib/           # Utilities and helpers
│       ├── middleware/    # Express middleware
│       └── routes/        # API routes
└── frontend/              # Frontend React application
    ├── public/            # Static assets
    └── src/               # Source code
        ├── assets/        # Images and other assets
        ├── components/    # Reusable components
        ├── contexts/      # React contexts
        ├── i18n/          # Internationalization
        ├── pages/         # Page components
        ├── services/      # API services
        ├── styles/        # CSS styles
        └── utils/         # Utility functions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the open-source community for the amazing tools and libraries


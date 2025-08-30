# Roadside Assistance Frontend

A modern, responsive web application for roadside assistance services built with React (Vite), featuring role-based dashboards, real-time tracking, workshop listings, and multi-language support.

## 🚀 Features

### Core Functionality
- **Role-based Access Control**: Separate dashboards and features for Users, Admins, and Workers
- **Service Request Management**: Create, track, and manage roadside assistance requests
- **Workshop Discovery**: Browse and filter nearby workshops with multiple view modes (Grid, List, Map)
- **Real-time Tracking**: Track mechanic location and ETA (with Google Maps integration)
- **Multi-language Support**: English and Hindi localization
- **Dark Theme**: Modern dark UI with blue accent colors
- **Responsive Design**: Optimized for desktop and mobile devices

### User Features
- Request roadside assistance services
- View and track service requests
- Browse nearby workshops
- View workshop details and services
- Track mechanic in real-time
- Receive notifications
- Rate completed services

### Admin Features
- Dashboard with analytics and metrics
- Manage workshops and workers
- Monitor active service requests
- View revenue reports
- System-wide notifications

### Worker Features
- View assigned requests
- Update request status
- Track earnings
- View performance metrics
- Navigate to customer locations

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with Vite
- **Routing**: React Router DOM v6
- **Styling**: CSS with CSS Variables (Dark Theme)
- **Icons**: React Icons
- **Maps**: Google Maps API (optional)
- **Internationalization**: i18next
- **Notifications**: React Toastify
- **State Management**: React Context API

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── assets/         # Images and media files
│   ├── components/     # Reusable components
│   │   ├── Layout.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── GoogleMap.jsx
│   │   └── LanguageSwitcher.jsx
│   ├── contexts/       # React contexts
│   │   └── AuthContext.jsx
│   ├── i18n/          # Internationalization
│   │   ├── i18n.js
│   │   └── locales/
│   │       ├── en.json
│   │       └── hi.json
│   ├── pages/         # Page components
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── WorkerDashboard.jsx
│   │   ├── Workshops.jsx
│   │   ├── WorkshopDetail.jsx
│   │   ├── ServiceRequest.jsx
│   │   ├── MyRequests.jsx
│   │   ├── RequestDetail.jsx
│   │   └── Notifications.jsx
│   ├── services/      # API and data services
│   │   ├── auth.js
│   │   └── mockData.js
│   ├── styles/        # Component-specific CSS
│   ├── utils/         # Utility functions
│   ├── App.jsx        # Main app component
│   ├── App.css        # Global styles
│   └── main.jsx       # Entry point
├── .env.example       # Environment variables template
├── package.json       # Dependencies
└── vite.config.js     # Vite configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Google Maps API key (optional, for map features)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd OdooXCGC/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Add your Google Maps API key (optional):
Edit `.env` and add your API key:
```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## 🔐 Authentication

The app uses mock authentication for demo purposes. Default credentials:

**User Account:**
- Email: user@example.com
- Password: password123

**Admin Account:**
- Email: admin@example.com
- Password: admin123

**Worker Account:**
- Email: worker@example.com
- Password: worker123

## 🗺️ Google Maps Integration

To enable Google Maps features:

1. Get an API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
3. Add the API key to your `.env` file
4. Restart the development server

Without the API key, map views will show a placeholder.

## 🌐 Internationalization

The app supports:
- **English** (en)
- **Hindi** (hi)

Language can be switched using the language switcher in the header. The preference is saved in localStorage.

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🎨 Theming

The app uses a dark theme with CSS variables defined in `App.css`:
- Primary color: Blue (#3b82f6)
- Background: Near-black (#0a0a0a, #151515)
- Text: White/Gray shades
- Accents: Success (Green), Warning (Yellow), Danger (Red)

## 🧪 Mock Data

The app uses mock data for demonstration. Real API integration points are clearly marked in the code. Mock services include:
- Authentication
- Workshop listings
- Service requests
- Notifications
- Dashboard statistics

## 📝 Key Features Implementation

### Role-based Routing
Routes are protected based on user roles using the `ProtectedRoute` component.

### Service Request Flow
1. User selects service type and workshop
2. Fills vehicle and location information
3. Submits request
4. Tracks mechanic arrival
5. Completes payment
6. Rates service

### Workshop Discovery
- Filter by service type, rating, distance
- Three view modes: Grid, List, Map
- Detailed workshop information
- Direct service request from workshop page

## 🚧 Future Enhancements

- [ ] Real backend API integration
- [ ] WebSocket for real-time updates
- [ ] Push notifications
- [ ] Payment gateway integration
- [ ] Advanced analytics dashboard
- [ ] Mobile app versions (React Native)
- [ ] Voice assistance
- [ ] Chat support
- [ ] Service history export
- [ ] Loyalty program

## 📄 License

This project is proprietary and confidential.

## 🤝 Contributing

Please follow the existing code style and structure when contributing.

## 📞 Support

For issues or questions, please contact the development team.

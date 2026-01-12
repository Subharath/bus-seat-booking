# 🚌 Bus Seat Booking System

A modern, full-stack web application for booking bus seats with real-time seat availability, route management, and an intuitive user interface.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

The Bus Seat Booking System is a comprehensive solution designed to streamline the bus ticket booking process for passengers and provide powerful management tools for bus operators. The system provides real-time seat availability, an interactive seat selection interface, and automated booking management.

### Purpose

- Enable passengers to view available seats and book bus tickets seamlessly
- Help bus operators manage bookings, routes, and schedules efficiently
- Eliminate booking conflicts with real-time seat status updates

### Target Users

- **Passengers**: Individuals looking to book bus seats for travel
- **Bus Operators/Admins**: Staff managing bus schedules, routes, and bookings

## ✨ Features

### For Passengers

- 🔍 **Route Search**: Browse available routes with advanced filtering
  - Filter by origin and destination
  - Filter by travel date
  - Filter by time of day (Morning, Afternoon, Evening, Night)
  
- 🪑 **Interactive Seat Selection**
  - Visual seat layout (2×2 configuration)
  - Real-time seat availability
  - Color-coded seats:
    - 🟢 Green: Available
    - 🟡 Yellow: Selected
    - 🔴 Red: Booked
    - 🟣 Purple: Reserved
  - Support for multi-seat booking (up to 10 seats)
  
- 📝 **Booking Management**
  - Easy passenger detail input
  - Phone number validation (+94 format, 9 digits)
  - Instant booking confirmation
  - Unique booking ID generation
  - View booking history in dashboard
  - Cancel bookings (up to 24 hours before departure)

- 💳 **Payment Information**
  - Clear pricing display
  - Total cost calculation
  - Per-seat pricing

### For Administrators

- 🚌 **Bus Management**
  - Add new buses with details (number, make, model, capacity)
  - Configure seat layouts
  - View all registered buses

- 🛣️ **Route Management**
  - Create routes between cities
  - Pre-populated Sri Lankan cities
  - View all existing routes

- 📅 **Schedule Management**
  - Create schedules with:
    - Date and departure time
    - Bus assignment
    - Route assignment
    - Ticket pricing
  - View all schedules with detailed information

- 📊 **Booking Overview**
  - View all bookings
  - Filter by status (Confirmed, Cancelled, Pending)
  - Booking analytics

## 🛠️ Technology Stack

### Frontend

- **Framework**: React 18
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **State Management**: React Context API

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt

### Development Tools

- **Version Control**: Git
- **Package Manager**: npm
- **Database Migration**: Prisma Migrate

## 🏗️ System Architecture

```
┌─────────────────┐
│   React Frontend │
│   (Vite + Tailwind) │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│  Express Backend  │
│  (Node.js + JWT)  │
└────────┬────────┘
         │ Prisma ORM
         ▼
┌─────────────────┐
│   PostgreSQL DB   │
│   (Relational)    │
└─────────────────┘
```

## 📥 Installation

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bus-seat-booking
   ```

2. **Navigate to backend directory**
   ```bash
   cd backend
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the backend directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/bus_booking"
   JWT_SECRET="your-super-secret-jwt-key"
   PORT=5000
   ```

5. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

6. **Seed the database (optional)**
   ```bash
   npx prisma db seed
   ```

7. **Start the backend server**
   ```bash
   npm start
   ```
   
   The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The frontend will run on `http://localhost:3000`

## 🚀 Usage

### For Passengers

1. **Register/Login**
   - Navigate to the registration page
   - Create an account with email and password
   - Login with your credentials

2. **Search for Routes**
   - Go to the "Routes" page
   - Use filters to find your desired route:
     - Select origin and destination
     - Choose travel date
     - Select preferred time range
   
3. **Book Seats**
   - Click on a schedule to view available seats
   - Select your desired seat(s) from the seat map
   - Enter passenger details for each seat
   - Confirm your booking
   - Save your booking ID for reference

4. **Manage Bookings**
   - View your bookings in the Dashboard
   - Cancel bookings if needed (before 24 hours)

### For Administrators

1. **Login as Admin**
   - Use admin credentials to access admin panel
   - Navigate to admin dashboard

2. **Manage Buses**
   - Add new buses with registration details
   - Configure seat capacity and layout

3. **Create Routes**
   - Add routes between cities
   - Define origin and destination

4. **Schedule Buses**
   - Create schedules by selecting:
     - Date and time
     - Bus
     - Route
     - Ticket price
   
5. **Monitor Bookings**
   - View all bookings in the system
   - Track booking status
   - Generate reports

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "771234567"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Route Endpoints

#### Get All Routes
```http
GET /api/routes
```

#### Get Schedules for Route
```http
GET /api/routes/:routeId/schedules
```

#### Get Available Seats
```http
GET /api/routes/schedules/:scheduleId/available-seats
```

### Booking Endpoints

#### Create Booking
```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "scheduleId": 1,
  "seatId": 5,
  "passengerName": "John Doe",
  "phoneNumber": "771234567"
}
```

#### Get User Bookings
```http
GET /api/bookings/my-bookings
Authorization: Bearer <token>
```

#### Cancel Booking
```http
PATCH /api/bookings/:bookingId/cancel
Authorization: Bearer <token>
```

### Admin Endpoints

#### Create Bus
```http
POST /api/admin/buses
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "busNumber": "NA-1234",
  "make": "Ashok Leyland",
  "model": "Viking",
  "totalSeats": 45
}
```

#### Create Route
```http
POST /api/admin/routes
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "from": "Colombo",
  "to": "Kandy"
}
```

#### Create Schedule
```http
POST /api/admin/schedules
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "date": "2026-01-15",
  "time": "08:30",
  "busId": 1,
  "routeId": 1,
  "ticketPrice": 500
}
```

## 🗄️ Database Schema

### Main Tables

- **User**: Stores user account information
- **Bus**: Bus details (number, make, model, capacity)
- **Seat**: Individual seats for each bus
- **Route**: Routes between cities
- **Schedule**: Bus schedules with date, time, pricing
- **Booking**: Passenger bookings with status tracking

### Key Relationships

```
User ──────< Booking
Bus ───────< Seat
Bus ───────< Schedule
Route ─────< Schedule
Seat ──────< Booking
Schedule ──< Booking
```

## 📁 Project Structure

```
bus-seat-booking/
│
├── backend/
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Auth & validation
│   │   ├── routes/            # API routes
│   │   ├── utils/             # Helper functions
│   │   ├── app.js             # Express app setup
│   │   ├── server.js          # Server entry point
│   │   └── prisma.js          # Prisma client
│   │
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   ├── migrations/        # Database migrations
│   │   └── seed.js            # Seed data
│   │
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── booking/       # Booking-related components
│   │   │   ├── common/        # Shared components
│   │   │   └── layout/        # Layout components
│   │   │
│   │   ├── contexts/          # React context providers
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service layer
│   │   ├── App.jsx            # Main app component
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Global styles
│   │
│   ├── public/                # Static assets
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── README.md
```

## 📸 Screenshots

### User Interface

- **Home Page**: Landing page with hero section and featured routes
- **Routes Page**: Advanced filtering and schedule browsing
- **Seat Selection**: Interactive seat map with real-time availability
- **Booking Form**: Passenger details collection with validation
- **Dashboard**: User booking history and management

### Admin Interface

- **Admin Dashboard**: Overview of system statistics
- **Bus Management**: Add and manage bus fleet
- **Route Management**: Create and view routes
- **Schedule Management**: Create schedules with pricing
- **Booking Management**: View and manage all bookings

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Protected Routes**: Middleware-based route protection
- **Input Validation**: Server-side validation for all inputs
- **Admin Authorization**: Role-based access control

## 📊 System Requirements

### Functional Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| FR1 | Display list of bus routes | ✅ Implemented |
| FR2 | Display available dates and times | ✅ Implemented |
| FR3 | Show seat layout for each bus | ✅ Implemented |
| FR4 | Allow seat selection | ✅ Implemented |
| FR5 | Prevent double booking | ✅ Implemented |
| FR6 | Store passenger details | ✅ Implemented |
| FR7 | Generate unique booking ID | ✅ Implemented |
| FR8 | Admin booking management | ✅ Implemented |

### Non-Functional Requirements

| ID | Requirement | Target | Status |
|----|-------------|--------|--------|
| NFR1 | Simple and intuitive UI | High usability | ✅ Achieved |
| NFR2 | Booking completion time | < 2 seconds | ✅ Achieved |
| NFR3 | Real-time seat availability | 100% accuracy | ✅ Achieved |
| NFR4 | Secure data storage | Encrypted passwords | ✅ Achieved |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Your Name** - Initial work

## 🙏 Acknowledgments

- Sri Lankan cities data for route creation
- Tailwind CSS for styling framework
- Prisma for database management
- React community for excellent documentation

## 📞 Support

For support, email support@busbooking.com or open an issue in the repository.

## 🔄 Changelog

### Version 1.0.0 (Current)

- ✅ User registration and authentication
- ✅ Route browsing with advanced filters
- ✅ Interactive seat selection
- ✅ Real-time booking management
- ✅ Admin panel for system management
- ✅ Booking cancellation workflow
- ✅ Mobile-responsive design

### Upcoming Features

- 📧 Email notifications for bookings
- 💳 Online payment integration
- 📱 Mobile app (React Native)
- 📊 Advanced analytics dashboard
- 🎫 QR code ticket generation
- 🔔 SMS notifications
- 🌐 Multi-language support

---

**Built with ❤️ for seamless bus booking experience**

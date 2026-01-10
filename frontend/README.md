# Bus Seat Booking - Frontend

React frontend for the Bus Seat Booking System.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components
│   │   ├── common/       # Common components (ProtectedRoute, etc.)
│   │   └── layout/       # Layout components (Header, Footer, Layout)
│   ├── contexts/         # React contexts (AuthContext)
│   ├── pages/            # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Routes.jsx
│   ├── services/         # API services
│   │   └── api.js
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── index.html
└── package.json
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root:

```env
VITE_API_URL=http://localhost:5000/api
```

## 📦 Dependencies

- **React 19** - UI library
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **Zustand** - State management
- **Tailwind CSS** - Styling

## 🎨 Features

- ✅ User authentication (Login/Register)
- ✅ Protected routes
- ✅ API integration with auto token refresh
- ✅ Responsive design
- ✅ Modern UI with Tailwind CSS

## 🔗 API Integration

The frontend connects to the backend API at `http://localhost:5000/api`.

Make sure the backend server is running before starting the frontend.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🚧 Next Steps

- [ ] 3D Bus visualization on homepage
- [ ] Dynamic seat selection
- [ ] Booking flow
- [ ] Admin dashboard
- [ ] User dashboard with bookings

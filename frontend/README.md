# Sanskaar.co - Professional Frontend

A modern, professional frontend for the Sanskaar platform - your comprehensive guide to Hindu rituals, traditions, and spiritual practices.

## Features

### 🕉️ Core Functionality
- **Authentic Poojas & Rituals**: Browse and learn about traditional Hindu rituals with step-by-step guidance
- **Multi-Method Support**: View poojas with different methods (Dashopchar, Panchopchar, Shadopchar, Shodashopchar)
- **Multilingual Support**: Interface in English, Hindi, and Sanskrit
- **Mantra Guidance**: Audio playback, transliteration, and meanings for each step
- **E-Commerce**: Shop for complete pooja kits and individual samagri items
- **Pandit Booking**: Find and book verified pandits for ceremonies
- **Temple Directory**: Explore temples and pilgrimage sites
- **User Authentication**: Secure login and registration system
- **Shopping Cart**: Full-featured cart with quantity management
- **Responsive Design**: Mobile-first, works on all devices

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend server running on http://localhost:5000

### Steps

1. **Install Dependencies**
```bash
cd sanskaar-frontend
npm install
```

2. **Configure Environment**
Edit `.env` file to match your backend URL:
```
REACT_APP_API_URL=http://localhost:5000/api
```

3. **Start Development Server**
```bash
npm start
```

The app will open at http://localhost:3000

4. **Build for Production**
```bash
npm run build
```

## Technical Stack
- React 18
- React Router DOM
- Tailwind CSS
- Axios
- Lucide React Icons
- Context API for state management

## Project Structure
```
src/
├── components/     # Reusable components (Navbar, Footer)
├── pages/         # Page components (Home, Poojas, Shop, etc.)
├── context/       # Global state management
├── services/      # API integration
└── utils/         # Utility functions
```

---
Built with ❤️ for the spiritual community

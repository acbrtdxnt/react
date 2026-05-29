# React Bootstrap Form App

A modern React application built with Vite and Bootstrap featuring form validation, HTTPS API integration, and local data persistence.

## Features

- **Fetch API Users Button**
  - Click button to fetch 10 real users from JSONPlaceholder API
  - Display API-fetched users in a table
  - HTTPS connection with proper error handling

- **Add User Form**
  - Name, email, and phone fields with real-time validation
  - Submit via HTTPS POST to JSONPlaceholder API
  - Stores added users locally (browser localStorage)
  - Prevents data loss on page refresh

- **Local Data Persistence**
  - Added users are saved to browser localStorage
  - Merges API-fetched users with locally-added users
  - Displays badge indicating source (Local vs API)
  - Delete button for locally-added users

- **Bootstrap Styling**
  - Responsive card-based layout
  - Table display for users
  - Bootstrap form components with validation feedback
  - Status alerts and loading indicators

## Environment

The app reads configuration from `.env`:

```env
VITE_API_URL=https://jsonplaceholder.typicode.com/users
VITE_APP_NAME=React Bootstrap Form App
```

## Setup

```bash
cd react-bootstrap-form-app
npm install
```

## Run

```bash
npm run dev
```

The app will start on `http://localhost:5173`

## Build

```bash
npm run build
```

## How It Works

1. **Fetch Users**: Click "Fetch Users from API" button at the top to fetch 10 users from JSONPlaceholder API
2. **Add User**: Use the form to add a new user
   - Form submits via HTTPS POST to the API
   - User is stored in browser localStorage for persistence
3. **View Users**: See merged list of API users and locally-added users in the table
4. **Delete Local Users**: Remove any locally-added user (API users cannot be deleted)
5. **Persistence**: Page refresh preserves all locally-added users

## API Endpoints Used

- **Fetch Users:** `GET https://jsonplaceholder.typicode.com/users`
- **Add User:** `POST https://jsonplaceholder.typicode.com/users`

Both use HTTPS and include comprehensive error handling.

## Data Storage

- **API Users**: Fetched fresh from the API on button click
- **Local Users**: Stored in browser's localStorage under key `localUsers`
- All locally-added users persist across page refreshes and browser sessions



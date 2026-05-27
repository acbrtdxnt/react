# React Bootstrap Form App

A simple React application built with Vite and Bootstrap.

## Features

- Form with validation for name, email, and phone
- Bootstrap styling
- HTTPS submission to a dummy API endpoint (`https://jsonplaceholder.typicode.com/users`)
- Proper error handling for network and server failures
- Environment configuration via `.env`

## Setup

```bash
cd react-bootstrap-form-app
npm install
```

## Run

```bash
npm run dev
```

## Environment

The app reads the API base URL from `.env`:

```env
VITE_API_URL=https://jsonplaceholder.typicode.com/users
VITE_APP_NAME=React Bootstrap Form App
```

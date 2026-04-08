# Homely API

A RESTful API for managing [property listings, bookings & sales].

## Overview
Homely API allows users to:
- Create and manage homes/properties
- Handle user authentication
- Perform CRUD operations on listings
- Allows users make payment with either their card or bank transfers through paystack

## Tech Stack
- Node.js
- Express
- MongoDB

## Features
- User authentication (JWT)
- CRUD operations
- Secure endpoints

## Installation

```bash
git clone https://github.com/Rejoice2374/Homely-API.git
cd Homely-API
npm install
npm start
```

## API Endpoints
### User

- POST /api/register || /api/upload (User signup/registration with user authentication and profile picture upload to cloudinary)
- POST /api/user/login || /api/user/
- POST /api/user/logout 
- GET /api/user/ || api/user/me (View user profile)
- GET /api/user/whitelists || /api/user/me/whitelists

### /Properties

GET /api/properties
POST /api/properties

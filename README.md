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

- POST /api/register (User signup/registration with user authentication and profile picture upload to cloudinary)
- POST /api/user/login 
- POST /api/user/logout 
- GET /api/user/ (View user profile)
- GET /api/user/whitelists (View users whitelisted by loggedIn user)

### Properties

- GET /api/property (fetches all available properties)
- POST /api/property
- GET api/property/myproperty (get properties by userId)
- GET api/property/:id (get property with it's ID)
- PUT api/property/:id (add/remove property from wishlist)
- PUT api/property/update/:id (Update a property by ID)
- DELETE api/property/:id (Delete a property by ID

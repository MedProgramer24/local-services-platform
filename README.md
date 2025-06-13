# Souk Al Khadamat Maghrib - Provider Dashboard

This is a service marketplace platform for Morocco, connecting service providers with customers. The provider dashboard now shows real data from the database instead of mock data.

## Features

- **Real-time Dashboard**: Shows actual booking statistics, revenue, and ratings
- **Service Management**: Add, edit, and delete services with real database persistence
- **Booking Management**: View and manage customer bookings with real-time updates
- **Profile Management**: Update provider profile information
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd localServices
```

### 2. Install dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../souk-al-khadamat-maghrib
npm install
```

### 3. Environment Setup

Create a `.env` file in the backend directory:
```bash
cd backend
touch .env
```

Add the following environment variables:
```env
MONGODB_URI=mongodb://localhost:27017/souk-al-khadamat
JWT_SECRET=your-secret-key-here
PORT=5000
```

### 4. Database Setup

Make sure MongoDB is running on your system, then seed the database with sample data:

```bash
cd backend
npm run seed
```

This will create:
- Service categories (Plumbing, Electricity, Cleaning, Welding)
- A sample service provider (محمد السباك)
- Sample customers
- Sample bookings with different statuses

### 5. Start the application

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd souk-al-khadamat-maghrib
npm run dev
```

## Usage

### Provider Login
- Email: `mohamed@example.com`
- Password: `password123`

### Customer Login
- Email: `ahmed@example.com`
- Password: `password123`

### Dashboard Features

1. **Overview Tab**: Shows real statistics including:
   - Total bookings
   - Completed bookings
   - Pending bookings
   - Cancelled bookings
   - Total revenue
   - Average rating
   - Total reviews

2. **Services Tab**: Manage your services:
   - View all services with real data
   - Add new services
   - Edit existing services
   - Delete services

3. **Bookings Tab**: View and manage customer bookings:
   - See all bookings with real customer data
   - View booking details
   - Update booking status

4. **Profile Tab**: Manage your business profile:
   - View and edit business information
   - Update contact details
   - Manage location information

## API Endpoints

### Provider Dashboard
- `GET /api/provider/stats` - Get dashboard statistics
- `GET /api/provider/profile` - Get provider profile
- `PUT /api/provider/profile` - Update provider profile

### Services
- `GET /api/services/provider` - Get provider services
- `POST /api/services` - Create new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Bookings
- `GET /api/bookings/provider` - Get provider bookings
- `GET /api/bookings/customer` - Get customer bookings
- `POST /api/bookings` - Create new booking
- `PATCH /api/bookings/:id/status` - Update booking status

## Database Schema

### ServiceProvider
- User information
- Business details
- Services array
- Location and contact info
- Availability schedule
- Rating and reviews

### Booking
- Customer and provider references
- Service details
- Date, time, and status
- Price and address
- Notes and reviews

### User
- Authentication details
- Role (customer/service_provider)
- Profile information

## Real Data Implementation

The dashboard now shows real data by:

1. **Database Integration**: All API endpoints now query the MongoDB database
2. **Aggregation Queries**: Statistics are calculated using MongoDB aggregation
3. **Real-time Updates**: Changes are immediately reflected in the dashboard
4. **Data Validation**: Proper validation and error handling
5. **Relationships**: Proper population of related data (customers, services, categories)

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the connection string in `.env`
   - Verify database permissions

2. **Authentication Issues**
   - Clear browser localStorage
   - Check JWT token expiration
   - Verify user credentials

3. **Data Not Loading**
   - Run the seed script: `npm run seed`
   - Check API endpoints are accessible
   - Verify CORS configuration

### Development

To add more sample data or modify existing data:

1. Edit `backend/src/scripts/seedData.ts`
2. Run `npm run seed` to reset and reseed the database

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License. 

## Additional Changes

### Backend

To install the required Socket.IO types in your backend:

```bash
npm install --save-dev @types/socket.io
``` 
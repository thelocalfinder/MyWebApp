# Fashion Shopping Platform

A modern e-commerce platform built with Next.js and ASP.NET Core.

## Features

- Browse products by category and subcategory
- Filter products by brand, color, size, and price
- Shopping cart functionality
- Secure checkout process
- Responsive design for all devices
- Real-time product updates
- User-friendly navigation

## Tech Stack

### Frontend
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- React Query for data fetching
- Zustand for state management
- Framer Motion for animations

### Backend
- ASP.NET Core
- Entity Framework Core
- SQL Server
- RESTful API

## Getting Started

### Prerequisites
- Node.js 18 or later
- .NET 7 SDK or later
- SQL Server

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd lyst-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd MyWebApp
   ```

2. Update the connection string in `appsettings.json`

3. Run database migrations:
   ```bash
   dotnet ef database update
   ```

4. Start the development server:
   ```bash
   dotnet run
   ```

5. The API will be available at [http://localhost:5234](http://localhost:5234)

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/by-category/{categoryId}` - Get products by category
- `GET /api/products/by-brand/{brandId}` - Get products by brand

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/{id}` - Get category by ID
- `GET /api/categories/{id}/subcategories` - Get subcategories by category ID

### Brands
- `GET /api/brands` - Get all brands
- `GET /api/brands/{id}` - Get brand by ID

## Project Structure

```
lyst-frontend/
├── src/
│   ├── app/                 # Next.js app router pages
│   ├── components/          # Reusable components
│   ├── hooks/              # Custom React hooks
│   ├── store/              # Zustand stores
│   └── lib/                # Utility functions
├── public/                 # Static assets
└── package.json

MyWebApp/
├── Controllers/            # API controllers
├── Models/                # Data models
├── Data/                  # Database context and configurations
└── Program.cs             # Application entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

# MyWebApp

A full-stack web application with Next.js frontend and .NET backend.

## Project Structure

```
MyWebApp/
├── frontend/           # Next.js frontend application
│   ├── src/           # Source code
│   ├── public/        # Static files
│   └── ...
│
└── backend/           # .NET backend application
    ├── Controllers/   # API Controllers
    ├── Models/        # Data Models
    └── ...
```

## Getting Started

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Run the backend server:
   ```bash
   dotnet run
   ```
   The backend will be available at http://localhost:5234

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
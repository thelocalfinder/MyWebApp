# MyWebApp - E-commerce API

A .NET Core Web API for an e-commerce platform similar to Lyst, featuring product management, categories, subcategories, and brand tracking.

## Features

- Product management with detailed information
- Category and subcategory organization
- Brand tracking and statistics
- Click tracking for products
- Advanced filtering and search capabilities
- Export functionality for data analysis

## Tech Stack

- .NET Core 9.0
- Entity Framework Core
- MySQL Database
- CORS enabled for frontend integration

## API Endpoints

### Products
- `GET /api/products` - Get all products with filtering options
- `GET /api/products/{id}` - Get product details
- `POST /api/products/{id}/click` - Track product clicks
- `GET /api/products/category/{categoryId}` - Get products by category
- `GET /api/products/color/{color}` - Get products by color
- `GET /api/products/material/{material}` - Get products by material
- `GET /api/products/search` - Advanced search with multiple criteria

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/home/categories/{gender}` - Get categories by gender

### SubCategories
- `GET /api/subcategory` - Get all subcategories
- `GET /api/home/subcategories/{categoryId}` - Get subcategories by category
- `GET /api/home/products/subcategory/{subCategoryId}` - Get products by subcategory

### Brands
- `GET /api/brands` - Get all brands
- `GET /api/brands/{id}` - Get brand details with statistics
- `GET /api/brands/{id}/products` - Get products by brand

### Export
- `GET /api/export/products` - Export products data
- `GET /api/export/brands` - Export brands data
- `GET /api/export/categories` - Export categories data
- `GET /api/export/daily-stats` - Export daily statistics
- `GET /api/export/weekly-stats` - Export weekly statistics

## Setup

1. Clone the repository
2. Update the connection string in `appsettings.json`
3. Run migrations:
   ```bash
   dotnet ef database update
   ```
4. Run the application:
   ```bash
   dotnet run
   ```

## Database Schema

The application uses the following main tables:
- Products
- Categories
- SubCategories
- Brands
- Users
- Likes

## Development

The application is configured to run on:
- HTTP: http://localhost:5234
- HTTPS: https://localhost:7085

## License

This project is licensed under the MIT License. 
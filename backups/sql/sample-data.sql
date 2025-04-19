-- Create Tables
CREATE TABLE IF NOT EXISTS Brands (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    WebsiteURL TEXT
);

CREATE TABLE IF NOT EXISTS Categories (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Gender TEXT
);

CREATE TABLE IF NOT EXISTS SubCategories (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    CategoryID INTEGER,
    FOREIGN KEY (CategoryID) REFERENCES Categories(ID)
);

CREATE TABLE IF NOT EXISTS Products (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Description TEXT,
    Price DECIMAL(18,2) NOT NULL,
    DiscountedPrice DECIMAL(18,2),
    ImageURL TEXT,
    Color TEXT,
    Size TEXT,
    Material TEXT,
    ProductURL TEXT,
    ClickCount INTEGER DEFAULT 0,
    IsEditorsPick BOOLEAN DEFAULT 0,
    BrandID INTEGER,
    CategoryID INTEGER,
    SubCategoryID INTEGER,
    FOREIGN KEY (BrandID) REFERENCES Brands(ID),
    FOREIGN KEY (CategoryID) REFERENCES Categories(ID),
    FOREIGN KEY (SubCategoryID) REFERENCES SubCategories(ID)
);

-- Insert Brands
INSERT INTO Brands (Name, WebsiteURL) VALUES
('Luxe Living', 'https://luxeliving.com'),
('Urban Edge', 'https://urbanedge.com'),
('Nature''s Best', 'https://naturesbest.com'),
('Tech Elite', 'https://techelite.com'),
('Sport Pro', 'https://sportpro.com'),
('Eco Friendly', 'https://ecofriendly.com'),
('Modern Home', 'https://modernhome.com'),
('Fashion Forward', 'https://fashionforward.com'),
('Outdoor Adventure', 'https://outdooradventure.com'),
('Wellness Plus', 'https://wellnessplus.com'),
('Artisan Crafts', 'https://artisancrafts.com'),
('Global Goods', 'https://globalgoods.com'),
('Smart Living', 'https://smartliving.com'),
('Pure Beauty', 'https://purebeauty.com'),
('Kids World', 'https://kidsworld.com'),
('Pet Paradise', 'https://petparadise.com'),
('Home Essentials', 'https://homeessentials.com'),
('Garden Glory', 'https://gardenglory.com'),
('Digital Dreams', 'https://digitaldreams.com'),
('Fitness First', 'https://fitnessfirst.com');

-- Insert Categories
INSERT INTO Categories (Name, Gender) VALUES
('Clothing', 'Women'),
('Clothing', 'Men'),
('Accessories', 'Women'),
('Accessories', 'Men'),
('Beauty', NULL),
('Electronics', NULL),
('Home & Living', NULL),
('Sports', NULL),
('Kids', NULL),
('Outdoor', NULL),
('Jewelry', 'Women'),
('Shoes', 'Women'),
('Shoes', 'Men'),
('Wellness', NULL),
('Books', NULL),
('Art', NULL),
('Garden', NULL),
('Pet Supplies', NULL),
('Office', NULL),
('Toys', NULL);

-- Insert SubCategories
INSERT INTO SubCategories (Name, CategoryID) VALUES
('Dresses', 1),
('Tops', 1),
('Pants', 1),
('Suits', 2),
('Shirts', 2),
('Jeans', 2),
('Bags', 3),
('Watches', 4),
('Skincare', 5),
('Makeup', 5),
('Laptops', 6),
('Smartphones', 6),
('Furniture', 7),
('Decor', 7),
('Fitness Equipment', 8),
('Sports Wear', 8),
('Boys Clothing', 9),
('Girls Clothing', 9),
('Camping Gear', 10),
('Hiking Equipment', 10);

-- Insert Products
INSERT INTO Products (Name, Description, Price, DiscountedPrice, ImageURL, Color, Size, Material, ProductURL, ClickCount, IsEditorsPick, BrandID, CategoryID, SubCategoryID) VALUES
('Floral Summer Dress', 'Beautiful floral print dress perfect for summer', 89.99, 79.99, 'https://example.com/dress1.jpg', 'Blue', 'M', 'Cotton', 'https://example.com/products/dress1', 150, 1, 8, 1, 1),
('Classic White Shirt', 'Timeless white shirt for any occasion', 59.99, NULL, 'https://example.com/shirt1.jpg', 'White', 'L', 'Cotton', 'https://example.com/products/shirt1', 120, 0, 2, 2, 5),
('Leather Tote Bag', 'Spacious leather tote for everyday use', 199.99, 179.99, 'https://example.com/bag1.jpg', 'Brown', NULL, 'Leather', 'https://example.com/products/bag1', 200, 1, 1, 3, 7),
('Smart Watch Pro', 'Advanced smartwatch with health tracking', 299.99, 279.99, 'https://example.com/watch1.jpg', 'Black', NULL, 'Metal', 'https://example.com/products/watch1', 180, 1, 4, 4, 8),
('Natural Face Serum', 'Organic face serum for glowing skin', 49.99, NULL, 'https://example.com/serum1.jpg', NULL, NULL, NULL, 'https://example.com/products/serum1', 90, 0, 14, 5, 9),
('Ultra Slim Laptop', 'Powerful and portable laptop', 1299.99, 1199.99, 'https://example.com/laptop1.jpg', 'Silver', NULL, NULL, 'https://example.com/products/laptop1', 250, 1, 4, 6, 11),
('Modern Sofa', 'Contemporary 3-seater sofa', 899.99, 799.99, 'https://example.com/sofa1.jpg', 'Gray', NULL, 'Fabric', 'https://example.com/products/sofa1', 80, 0, 7, 7, 13),
('Yoga Mat Premium', 'Non-slip professional yoga mat', 39.99, NULL, 'https://example.com/yoga1.jpg', 'Purple', NULL, 'TPE', 'https://example.com/products/yoga1', 110, 0, 10, 8, 15),
('Kids Dinosaur Tee', 'Fun dinosaur print t-shirt for kids', 24.99, 19.99, 'https://example.com/kidstee1.jpg', 'Green', 'S', 'Cotton', 'https://example.com/products/kidstee1', 70, 0, 15, 9, 17),
('Camping Tent', '4-person waterproof tent', 199.99, NULL, 'https://example.com/tent1.jpg', 'Blue', NULL, 'Nylon', 'https://example.com/products/tent1', 95, 0, 9, 10, 19),
('Designer Sunglasses', 'UV protection trendy sunglasses', 159.99, 139.99, 'https://example.com/sunglasses1.jpg', 'Black', NULL, NULL, 'https://example.com/products/sunglasses1', 160, 1, 8, 3, 7),
('Running Shoes Pro', 'Professional running shoes', 129.99, NULL, 'https://example.com/shoes1.jpg', 'Blue', '42', 'Mesh', 'https://example.com/products/shoes1', 140, 1, 5, 13, NULL),
('Organic Face Mask', 'Natural clay face mask', 29.99, 24.99, 'https://example.com/mask1.jpg', NULL, NULL, NULL, 'https://example.com/products/mask1', 85, 0, 14, 5, 9),
('Smart Speaker', 'Voice-controlled smart speaker', 79.99, 69.99, 'https://example.com/speaker1.jpg', 'Black', NULL, NULL, 'https://example.com/products/speaker1', 130, 0, 4, 6, NULL),
('Leather Wallet', 'Handcrafted leather wallet', 49.99, NULL, 'https://example.com/wallet1.jpg', 'Brown', NULL, 'Leather', 'https://example.com/products/wallet1', 100, 0, 11, 4, NULL),
('Silk Scarf', 'Elegant silk scarf with floral print', 69.99, 59.99, 'https://example.com/scarf1.jpg', 'Multi', NULL, 'Silk', 'https://example.com/products/scarf1', 75, 1, 8, 3, NULL),
('Gaming Mouse', 'High-precision gaming mouse', 89.99, 79.99, 'https://example.com/mouse1.jpg', 'Black', NULL, NULL, 'https://example.com/products/mouse1', 110, 0, 19, 6, NULL),
('Yoga Pants', 'High-waisted yoga pants', 59.99, NULL, 'https://example.com/yogapants1.jpg', 'Black', 'M', 'Spandex', 'https://example.com/products/yogapants1', 120, 1, 5, 8, 16),
('Kids Backpack', 'Colorful kids school backpack', 34.99, 29.99, 'https://example.com/backpack1.jpg', 'Red', NULL, 'Polyester', 'https://example.com/products/backpack1', 65, 0, 15, 9, NULL),
('Hiking Boots', 'Waterproof hiking boots', 149.99, 129.99, 'https://example.com/boots1.jpg', 'Brown', '43', 'Leather', 'https://example.com/products/boots1', 90, 0, 9, 10, 20); 
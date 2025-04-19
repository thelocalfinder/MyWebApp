-- Disable safe update mode temporarily
SET SQL_SAFE_UPDATES = 0;

-- Clear existing data (if any)
DELETE FROM Products WHERE Id > 0;
DELETE FROM SubCategories WHERE ID > 0;
DELETE FROM Categories WHERE ID > 0;
DELETE FROM Brands WHERE ID > 0;

-- Reset auto-increment counters
ALTER TABLE Products AUTO_INCREMENT = 1;
ALTER TABLE SubCategories AUTO_INCREMENT = 1;
ALTER TABLE Categories AUTO_INCREMENT = 1;
ALTER TABLE Brands AUTO_INCREMENT = 1;

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
('Accessories', NULL),
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
('Toys', NULL),
('Fashion', NULL);

-- Insert SubCategories
INSERT INTO SubCategories (Name, CategoryID) VALUES
('Dresses', 1),
('Tops', 1),
('Pants', 1),
('Suits', 2),
('Shirts', 2),
('Jeans', 2),
('Bags', 3),
('Watches', 3),
('Skincare', 4),
('Makeup', 4),
('Laptops', 5),
('Smartphones', 5),
('Furniture', 6),
('Decor', 6),
('Fitness Equipment', 7),
('Sports Wear', 7),
('Boys Clothing', 8),
('Girls Clothing', 8),
('Camping Gear', 9),
('Hiking Equipment', 9);

-- Insert Products
INSERT INTO Products (Name, Description, Price, DiscountedPrice, ImageURL, Color, Size, Material, ProductURL, ClickCount, IsEditorsPick, BrandID, CategoryID, SubCategoryID) VALUES
-- Women's Clothing
('Evening Gown', 'Elegant floor-length evening gown', 299.99, 249.99, 'https://example.com/gown1.jpg', 'Red', 'S', 'Silk', 'https://fashionforward.com/products/evening-gown', 320, 1, 8, 1, 1),
('Summer Blouse', 'Light and airy summer blouse', 45.99, NULL, 'https://example.com/blouse1.jpg', 'White', 'M', 'Cotton', 'https://fashionforward.com/products/summer-blouse', 280, 0, 2, 1, 2),
('Designer Jeans', 'Premium denim skinny jeans', 159.99, 139.99, 'https://example.com/jeans1.jpg', 'Blue', 'L', 'Denim', 'https://fashionforward.com/products/designer-jeans', 310, 1, 2, 1, 3),

-- Men's Clothing
('Business Suit', 'Classic fit business suit', 599.99, 499.99, 'https://example.com/suit1.jpg', 'Navy', '42', 'Wool', 'https://urbanedge.com/products/business-suit', 290, 1, 2, 2, 4),
('Casual Polo', 'Comfortable weekend polo shirt', 49.99, NULL, 'https://example.com/polo1.jpg', 'Green', 'XL', 'Cotton', 'https://urbanedge.com/products/casual-polo', 270, 0, 5, 2, 5),
('Designer Belt', 'Genuine leather designer belt', 89.99, NULL, 'serpentine-splendor-belt-black-and-silver.jpeg.webp', 'Brown', '34', 'Leather', 'https://urbanedge.com/products/designer-belt', 260, 0, 1, 2, NULL),

-- Accessories
('Luxury Handbag', 'Designer leather handbag', 899.99, 799.99, 'https://example.com/handbag1.jpg', 'Black', NULL, 'Leather', 'https://luxeliving.com/products/luxury-handbag', 340, 1, 1, 3, 7),
('Diamond Necklace', '18K gold diamond necklace', 1299.99, NULL, 'https://example.com/necklace1.jpg', 'Gold', NULL, 'Gold', 'https://luxeliving.com/products/diamond-necklace', 230, 1, 11, 11, NULL),
('Smart Watch Elite', 'Premium smartwatch with health features', 399.99, 349.99, 'https://example.com/watch2.jpg', 'Silver', NULL, 'Metal', 'https://techelite.com/products/smart-watch-elite', 300, 1, 4, 4, 8),

-- Beauty Products
('Luxury Perfume', 'Exclusive designer fragrance', 129.99, NULL, 'https://example.com/perfume1.jpg', NULL, NULL, NULL, 'https://purebeauty.com/products/luxury-perfume', 285, 1, 14, 5, NULL),
('Anti-aging Cream', 'Premium anti-aging skincare', 89.99, 79.99, 'https://example.com/cream1.jpg', NULL, NULL, NULL, 'https://purebeauty.com/products/anti-aging-cream', 275, 0, 14, 5, 9),
('Makeup Set Pro', 'Professional makeup collection', 199.99, 179.99, 'https://example.com/makeup1.jpg', NULL, NULL, NULL, 'https://purebeauty.com/products/makeup-set-pro', 295, 1, 14, 5, 10),

-- Electronics
('Gaming Laptop', 'High-performance gaming laptop', 1999.99, 1799.99, 'https://example.com/laptop2.jpg', 'Black', NULL, NULL, 'https://techelite.com/products/gaming-laptop', 330, 1, 4, 6, 11),
('Wireless Earbuds', 'Premium wireless earbuds', 199.99, 179.99, 'https://example.com/earbuds1.jpg', 'White', NULL, NULL, 'https://techelite.com/products/wireless-earbuds', 315, 1, 4, 6, NULL),
('4K Smart TV', 'Large screen 4K smart TV', 1499.99, 1299.99, 'https://example.com/tv1.jpg', 'Black', NULL, NULL, 'https://techelite.com/products/4k-smart-tv', 265, 0, 4, 6, NULL),

-- Home & Living
('Designer Lamp', 'Modern designer floor lamp', 299.99, 249.99, 'https://example.com/lamp1.jpg', 'Gold', NULL, 'Metal', 'https://modernhome.com/products/designer-lamp', 245, 0, 7, 7, 14),
('Kitchen Set', 'Premium cookware set', 399.99, 349.99, 'https://example.com/kitchen1.jpg', 'Silver', NULL, 'Stainless Steel', 'https://modernhome.com/products/kitchen-set', 255, 0, 7, 7, NULL),
('Bed Linens', 'Luxury Egyptian cotton bed set', 199.99, NULL, 'https://example.com/bedset1.jpg', 'White', 'King', 'Cotton', 'https://modernhome.com/products/bed-linens', 235, 0, 7, 7, NULL),

-- Sports & Fitness
('Smart Treadmill', 'Connected home treadmill', 1299.99, 1199.99, 'https://example.com/treadmill1.jpg', 'Black', NULL, 'Metal', 'https://fitnessfirst.com/products/smart-treadmill', 305, 1, 5, 8, 15),
('Tennis Racket Pro', 'Professional tennis racket', 199.99, 179.99, 'https://example.com/racket1.jpg', 'Blue', NULL, 'Carbon Fiber', 'https://fitnessfirst.com/products/tennis-racket-pro', 225, 0, 5, 8, NULL),
('Gym Set', 'Complete home gym equipment', 999.99, 899.99, 'https://example.com/gymset1.jpg', 'Black', NULL, 'Metal', 'https://fitnessfirst.com/products/gym-set', 250, 0, 5, 8, 15),

-- Kids
('Educational Toy Set', 'Interactive learning toys', 79.99, 69.99, 'https://example.com/toys1.jpg', 'Multi', NULL, 'Plastic', 'https://kidsworld.com/products/educational-toy-set', 215, 0, 15, 9, NULL),
('Kids Smart Watch', 'Child tracking smartwatch', 129.99, 119.99, 'https://example.com/kidswatch1.jpg', 'Blue', NULL, NULL, 'https://kidsworld.com/products/kids-smart-watch', 240, 0, 15, 9, NULL),
('School Essentials Set', 'Complete school supplies kit', 89.99, 79.99, 'https://example.com/school1.jpg', 'Multi', NULL, NULL, 'https://kidsworld.com/products/school-essentials-set', 220, 0, 15, 9, NULL),

-- Outdoor
('Mountain Bike', 'Professional mountain bike', 899.99, 799.99, 'https://example.com/bike1.jpg', 'Red', 'L', 'Aluminum', 'https://outdooradventure.com/products/mountain-bike', 335, 1, 9, 10, NULL),
('Camping Set', 'Complete camping gear set', 499.99, 449.99, 'https://example.com/campset1.jpg', 'Green', NULL, 'Mixed', 'https://outdooradventure.com/products/camping-set', 325, 1, 9, 10, 19),
('Hiking Backpack', 'Professional hiking backpack', 159.99, 139.99, 'https://example.com/hikingbag1.jpg', 'Orange', NULL, 'Nylon', 'https://outdooradventure.com/products/hiking-backpack', 345, 1, 9, 10, 20);

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1; 
-- Additional Products
INSERT INTO Products (Name, Description, Price, DiscountedPrice, ImageURL, Color, Size, Material, ProductURL, ClickCount, IsEditorsPick, BrandID, CategoryID, SubCategoryID) VALUES
-- Women's Clothing
('Evening Gown', 'Elegant floor-length evening gown', 299.99, 249.99, 'https://example.com/gown1.jpg', 'Red', 'S', 'Silk', 'https://example.com/products/gown1', 320, 1, 8, 1, 1),
('Summer Blouse', 'Light and airy summer blouse', 45.99, NULL, 'https://example.com/blouse1.jpg', 'White', 'M', 'Cotton', 'https://example.com/products/blouse1', 280, 0, 2, 1, 2),
('Designer Jeans', 'Premium denim skinny jeans', 159.99, 139.99, 'https://example.com/jeans1.jpg', 'Blue', 'L', 'Denim', 'https://example.com/products/jeans1', 310, 1, 2, 1, 3),

-- Men's Clothing
('Business Suit', 'Classic fit business suit', 599.99, 499.99, 'https://example.com/suit1.jpg', 'Navy', '42', 'Wool', 'https://example.com/products/suit1', 290, 1, 2, 2, 4),
('Casual Polo', 'Comfortable weekend polo shirt', 49.99, NULL, 'https://example.com/polo1.jpg', 'Green', 'XL', 'Cotton', 'https://example.com/products/polo1', 270, 0, 5, 2, 5),
('Designer Belt', 'Genuine leather designer belt', 89.99, NULL, 'https://example.com/belt1.jpg', 'Brown', '34', 'Leather', 'https://example.com/products/belt1', 260, 0, 1, 2, NULL),

-- Accessories
('Luxury Handbag', 'Designer leather handbag', 899.99, 799.99, 'https://example.com/handbag1.jpg', 'Black', NULL, 'Leather', 'https://example.com/products/handbag1', 340, 1, 1, 3, 7),
('Diamond Necklace', '18K gold diamond necklace', 1299.99, NULL, 'https://example.com/necklace1.jpg', 'Gold', NULL, 'Gold', 'https://example.com/products/necklace1', 230, 1, 11, 11, NULL),
('Smart Watch Elite', 'Premium smartwatch with health features', 399.99, 349.99, 'https://example.com/watch2.jpg', 'Silver', NULL, 'Metal', 'https://example.com/products/watch2', 300, 1, 4, 4, 8),

-- Beauty Products
('Luxury Perfume', 'Exclusive designer fragrance', 129.99, NULL, 'https://example.com/perfume1.jpg', NULL, NULL, NULL, 'https://example.com/products/perfume1', 285, 1, 14, 5, NULL),
('Anti-aging Cream', 'Premium anti-aging skincare', 89.99, 79.99, 'https://example.com/cream1.jpg', NULL, NULL, NULL, 'https://example.com/products/cream1', 275, 0, 14, 5, 9),
('Makeup Set Pro', 'Professional makeup collection', 199.99, 179.99, 'https://example.com/makeup1.jpg', NULL, NULL, NULL, 'https://example.com/products/makeup1', 295, 1, 14, 5, 10),

-- Electronics
('Gaming Laptop', 'High-performance gaming laptop', 1999.99, 1799.99, 'https://example.com/laptop2.jpg', 'Black', NULL, NULL, 'https://example.com/products/laptop2', 330, 1, 4, 6, 11),
('Wireless Earbuds', 'Premium wireless earbuds', 199.99, 179.99, 'https://example.com/earbuds1.jpg', 'White', NULL, NULL, 'https://example.com/products/earbuds1', 315, 1, 4, 6, NULL),
('4K Smart TV', 'Large screen 4K smart TV', 1499.99, 1299.99, 'https://example.com/tv1.jpg', 'Black', NULL, NULL, 'https://example.com/products/tv1', 265, 0, 4, 6, NULL),

-- Home & Living
('Designer Lamp', 'Modern designer floor lamp', 299.99, 249.99, 'https://example.com/lamp1.jpg', 'Gold', NULL, 'Metal', 'https://example.com/products/lamp1', 245, 0, 7, 7, 14),
('Kitchen Set', 'Premium cookware set', 399.99, 349.99, 'https://example.com/kitchen1.jpg', 'Silver', NULL, 'Stainless Steel', 'https://example.com/products/kitchen1', 255, 0, 7, 7, NULL),
('Bed Linens', 'Luxury Egyptian cotton bed set', 199.99, NULL, 'https://example.com/bedset1.jpg', 'White', 'King', 'Cotton', 'https://example.com/products/bedset1', 235, 0, 7, 7, NULL),

-- Sports & Fitness
('Smart Treadmill', 'Connected home treadmill', 1299.99, 1199.99, 'https://example.com/treadmill1.jpg', 'Black', NULL, 'Metal', 'https://example.com/products/treadmill1', 305, 1, 5, 8, 15),
('Tennis Racket Pro', 'Professional tennis racket', 199.99, 179.99, 'https://example.com/racket1.jpg', 'Blue', NULL, 'Carbon Fiber', 'https://example.com/products/racket1', 225, 0, 5, 8, NULL),
('Gym Set', 'Complete home gym equipment', 999.99, 899.99, 'https://example.com/gymset1.jpg', 'Black', NULL, 'Metal', 'https://example.com/products/gymset1', 250, 0, 5, 8, 15),

-- Kids
('Educational Toy Set', 'Interactive learning toys', 79.99, 69.99, 'https://example.com/toys1.jpg', 'Multi', NULL, 'Plastic', 'https://example.com/products/toys1', 215, 0, 15, 9, NULL),
('Kids Smart Watch', 'Child tracking smartwatch', 129.99, 119.99, 'https://example.com/kidswatch1.jpg', 'Blue', NULL, NULL, 'https://example.com/products/kidswatch1', 240, 0, 15, 9, NULL),
('School Essentials Set', 'Complete school supplies kit', 89.99, 79.99, 'https://example.com/school1.jpg', 'Multi', NULL, NULL, 'https://example.com/products/school1', 220, 0, 15, 9, NULL),

-- Outdoor
('Mountain Bike', 'Professional mountain bike', 899.99, 799.99, 'https://example.com/bike1.jpg', 'Red', 'L', 'Aluminum', 'https://example.com/products/bike1', 335, 1, 9, 10, NULL),
('Camping Set', 'Complete camping gear set', 499.99, 449.99, 'https://example.com/campset1.jpg', 'Green', NULL, 'Mixed', 'https://example.com/products/campset1', 325, 1, 9, 10, 19),
('Hiking Backpack', 'Professional hiking backpack', 159.99, 139.99, 'https://example.com/hikingbag1.jpg', 'Orange', NULL, 'Nylon', 'https://example.com/products/hikingbag1', 345, 1, 9, 10, 20); 
-- Custom SQL migration file, put your code below! ---- Initial Expenses
INSERT INTO expenses (id, concept, amount, category_id, date) VALUES
('exp_grocery_mar15', 'Grocery Shopping at Walmart', 156.78, 'cat_food', '2024-03-15'),
('exp_netflix_mar14', 'Netflix Monthly Subscription', 15.99, 'cat_ent', '2024-03-14'),
('exp_electric_mar13', 'Electric Bill - March', 89.50, 'cat_util', '2024-03-13'),
('exp_gas_mar12', 'Gas Station Fill-up', 45.23, 'cat_trans', '2024-03-12'),
('exp_dinner_mar11', 'Dinner at Italian Restaurant', 68.90, 'cat_dining', '2024-03-11'),
('exp_pharmacy_mar10', 'Pharmacy - Prescription Meds', 35.00, 'cat_health', '2024-03-10'),
('exp_clothes_mar09', 'New Work Clothes', 120.50, 'cat_shop', '2024-03-09'),
('exp_rent_mar01', 'Monthly Rent Payment', 1200.00, 'cat_house', '2024-03-01'),
('exp_course_mar05', 'Online Programming Course', 49.99, 'cat_edu', '2024-03-05'),
('exp_misc_mar08', 'Office Supplies', 25.30, 'cat_other', '2024-03-08'); 
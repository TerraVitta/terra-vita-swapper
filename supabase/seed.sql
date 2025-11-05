-- Sample Categories
insert into categories (name, description) values
  ('Clothing', 'Sustainable and eco-friendly fashion items'),
  ('Home & Living', 'Environmentally conscious home products'),
  ('Personal Care', 'Natural and sustainable personal care items'),
  ('Tech Accessories', 'Eco-friendly technology accessories'),
  ('Food & Beverages', 'Sustainable food and drink products'),
  ('Garden & Plants', 'Plants and gardening supplies');

-- Sample Products
insert into products (name, description, price, category, image_url, eco_score, material, recyclable, stock) values
  (
    'Bamboo Fiber T-Shirt',
    'Ultra-soft, breathable t-shirt made from sustainable bamboo fibers. Features moisture-wicking properties and natural antibacterial qualities.',
    29.99,
    'Clothing',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
    9,
    'Bamboo Fiber',
    true,
    100
  ),
  (
    'Recycled Ocean Plastic Watch',
    'Stylish timepiece crafted from recycled ocean plastic. Each purchase helps remove 1kg of plastic waste from our oceans.',
    89.99,
    'Tech Accessories',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    8,
    'Recycled Ocean Plastic',
    true,
    50
  ),
  (
    'Hemp Canvas Tote Bag',
    'Durable and spacious tote bag made from organic hemp canvas. Perfect for shopping, beach trips, or daily use.',
    24.99,
    'Home & Living',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800',
    9,
    'Organic Hemp',
    true,
    200
  ),
  (
    'Biodegradable Phone Case',
    'Protective phone case made from plant-based materials. Fully biodegradable and compostable.',
    19.99,
    'Tech Accessories',
    'https://images.unsplash.com/photo-1586766020546-8573f76baa09?w=800',
    10,
    'Plant-based Bioplastic',
    true,
    150
  ),
  (
    'Solar-Powered Desk Lamp',
    'Modern desk lamp powered by built-in solar panels. Features adjustable brightness and color temperature.',
    49.99,
    'Home & Living',
    'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800',
    7,
    'Recycled Aluminum',
    true,
    75
  ),
  (
    'Cork Yoga Mat',
    'Natural cork yoga mat with excellent grip and antimicrobial properties. Sustainable and biodegradable.',
    39.99,
    'Personal Care',
    'https://images.unsplash.com/photo-1593164842264-854604db2260?w=800',
    8,
    'Natural Cork',
    true,
    100
  ),
  (
    'Bamboo Cutlery Set',
    'Portable cutlery set made from sustainable bamboo. Includes fork, knife, spoon, and carrying case.',
    14.99,
    'Home & Living',
    'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800',
    9,
    'Bamboo',
    true,
    300
  ),
  (
    'Recycled Glass Water Bottle',
    'Sleek water bottle made from recycled glass with silicone sleeve. Plastic-free and dishwasher safe.',
    34.99,
    'Food & Beverages',
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800',
    8,
    'Recycled Glass',
    true,
    200
  ),
  (
    'Natural Bamboo Toothbrush',
    'Biodegradable toothbrush with bamboo handle and plant-based bristles. Plastic-free packaging.',
    4.99,
    'Personal Care',
    'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800',
    10,
    'Bamboo',
    true,
    500
  ),
  (
    'Organic Cotton Bedding Set',
    'Luxurious bedding set made from 100% organic cotton. GOTS certified and ethically produced.',
    129.99,
    'Home & Living',
    'https://images.unsplash.com/photo-1629949009765-5bc75135a15f?w=800',
    8,
    'Organic Cotton',
    true,
    50
  );

-- Sample Sustainability Metrics
insert into sustainability_metrics (
  product_id,
  carbon_footprint,
  water_usage,
  energy_efficiency_rating,
  biodegradable,
  packaging_type,
  certification_info
) 
select 
  id,
  random() * 20,  -- Carbon footprint between 0-20
  random() * 200,  -- Water usage between 0-200
  floor(random() * 10 + 1)::int,  -- Energy rating between 1-10
  true,  -- All sample products are biodegradable
  'Plastic-free, recycled paper packaging',
  'GOTS Certified, Fair Trade'
from products;
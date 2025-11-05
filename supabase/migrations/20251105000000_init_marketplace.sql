-- Create profiles table with user roles
create type user_role as enum ('admin', 'seller', 'buyer');

create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique,
  role user_role default 'buyer',
  full_name text,
  avatar_url text,
  bio text,
  website text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create products table
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  seller_id uuid references profiles(id) on delete cascade,
  name text not null,
  description text,
  price decimal(10,2) not null,
  category text not null,
  image_url text,
  eco_score int check (eco_score >= 0 and eco_score <= 10),
  material text,
  recyclable boolean default false,
  stock int not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create categories table
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create orders table
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  buyer_id uuid references profiles(id) on delete cascade,
  total_amount decimal(10,2) not null,
  status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create order_items table
create table if not exists order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  quantity int not null,
  price_at_time decimal(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create reviews table
create table if not exists reviews (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  rating int check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create sustainability_metrics table
create table if not exists sustainability_metrics (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade,
  carbon_footprint decimal(10,2),
  water_usage decimal(10,2),
  energy_efficiency_rating int check (energy_efficiency_rating >= 0 and energy_efficiency_rating <= 10),
  biodegradable boolean default false,
  packaging_type text,
  certification_info text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table products enable row level security;
alter table categories enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table reviews enable row level security;
alter table sustainability_metrics enable row level security;

-- Create RLS Policies

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Products policies
create policy "Products are viewable by everyone"
  on products for select
  using ( true );

create policy "Sellers can insert their own products"
  on products for insert
  with check ( auth.uid() = seller_id and exists (
    select 1 from profiles
    where id = auth.uid() and role = 'seller'
  ));

create policy "Sellers can update their own products"
  on products for update
  using ( auth.uid() = seller_id );

create policy "Sellers can delete their own products"
  on products for delete
  using ( auth.uid() = seller_id );

-- Orders policies
create policy "Users can view their own orders"
  on orders for select
  using ( auth.uid() = buyer_id );

create policy "Users can create their own orders"
  on orders for insert
  with check ( auth.uid() = buyer_id );

-- Reviews policies
create policy "Reviews are viewable by everyone"
  on reviews for select
  using ( true );

create policy "Authenticated users can create reviews"
  on reviews for insert
  with check ( auth.uid() = user_id );

-- Function to calculate eco score
create or replace function calculate_eco_score(
  carbon_footprint decimal,
  water_usage decimal,
  energy_rating int,
  is_biodegradable boolean,
  has_eco_packaging boolean
) returns int as $$
declare
  score int := 0;
begin
  -- Base score from energy rating (0-3 points)
  score := score + (energy_rating / 3);
  
  -- Carbon footprint score (0-2 points)
  if carbon_footprint < 10.0 then
    score := score + 2;
  elsif carbon_footprint < 20.0 then
    score := score + 1;
  end if;
  
  -- Water usage score (0-2 points)
  if water_usage < 100.0 then
    score := score + 2;
  elsif water_usage < 200.0 then
    score := score + 1;
  end if;
  
  -- Biodegradable bonus (0-2 points)
  if is_biodegradable then
    score := score + 2;
  end if;
  
  -- Eco packaging bonus (0-1 point)
  if has_eco_packaging then
    score := score + 1;
  end if;
  
  return least(score, 10);
end;
$$ language plpgsql;
-- Admin Users Table
create table if not exists admin_users (
  id            serial primary key,
  username      text not null unique,
  email         text not null unique,
  password_hash text not null,
  name          text not null,
  role          text not null default 'owner',
  created_at    timestamptz not null default now()
);

-- Activity Logs Table
create table if not exists activity_logs (
  id             serial primary key,
  admin_username text not null,
  action         text not null,
  details        text not null,
  type           text not null default 'info',
  created_at     timestamptz not null default now()
);

-- Orders Table
create table if not exists orders (
  id                serial primary key,
  order_ref         text not null unique,
  customer_name     text not null,
  customer_phone    text not null,
  customer_email    text,
  delivery_location text not null,
  items_json        text not null,
  total_ugx         integer not null,
  status            text not null default 'Pending',
  notes             text,
  created_at        timestamptz not null default now()
);

-- Shop Settings Table
create table if not exists shop_settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

-- Default Admin Account (username: admin, email: owner@toolhub.ug, password: password123)
insert into admin_users (username, email, password_hash, name, role) values
  ('admin', 'owner@toolhub.ug', 'ef92b778ba7158759a407736a323019808d76df3178736e4f3862b5d43e264...123', 'Shop Owner', 'owner')
on conflict (username) do nothing;

-- Default Initial Activity Log
insert into activity_logs (admin_username, action, details, type) values
  ('system', 'System Initialized', 'Tool Hub Admin Dashboard and Database online.', 'system')
on conflict do nothing;

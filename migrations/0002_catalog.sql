create table if not exists categories (
  slug       text primary key,
  name       text not null,
  tagline    text not null,
  sort_order integer not null default 0
);

create table if not exists products (
  id            serial primary key,
  slug          text not null unique,
  name          text not null,
  brand         text not null,
  make          text,
  fitment       text,
  category_slug text not null references categories(slug),
  price_ugx     integer not null,
  grade         text not null,
  stock         integer not null default 0,
  hot           boolean not null default false,
  description   text not null,
  image         text not null
);

create index if not exists products_category_idx on products (category_slug);
create index if not exists products_make_idx on products (make);

insert into categories (slug, name, tagline, sort_order) values
  ('headlamps',   'Headlamps',   'Projector, halogen and LED assemblies', 1),
  ('taillamps',   'Taillamps',   'OEM and LED rear lamps',                2),
  ('cornerlamps', 'Cornerlamps', 'Side markers and corner units',         3),
  ('foglights',   'Foglights',   'Spot kits and fog lamp rings',          4),
  ('body-parts',  'Body parts',  'Grills, bumpers, spoilers, fenders',    5),
  ('lubricants',  'Lubricants',  'Oils, polish, cleaners, sealants',      6),
  ('additives',   'Additives',   'AdBlue, treatments, fuel care',         7),
  ('accessories', 'Accessories', 'Jacks, mats, audio, safety kits',       8)
on conflict (slug) do nothing;

insert into products (slug, name, brand, make, fitment, category_slug, price_ugx, grade, stock, hot, description, image) values
  ('premio-2008-headlamp', 'Premio 2008-2010 headlamp', 'TYC', 'Toyota', 'Premio 2008-2010', 'headlamps', 365000, 'Aftermarket', 5, true, 'Direct-fit headlamp assembly for the 2008-2010 Premio. Clear lens, sealed housing, ready to bolt on.', '/parts/headlamp.jpg'),
  ('hilux-revo-2015-headlamp', 'Hilux Revo 2015 headlamp', 'OEM', 'Toyota', 'Hilux Revo 2015-2018', 'headlamps', 425000, 'OEM', 4, true, 'OEM-spec Revo headlamp. Check your VIN if you are between facelift years.', '/parts/headlamp.jpg'),
  ('dmax-2018-headlamp', 'Isuzu D-Max 2018 headlamp', 'OEM', 'Isuzu', 'D-Max 2017-2019', 'headlamps', 1400000, 'OEM', 2, true, 'High-grade D-Max projector headlamp. Sold as a single side - confirm left or right on WhatsApp.', '/parts/headlamp.jpg'),
  ('forester-xt-headlamp', 'Forester XT 2017-2018 headlamp', 'OEM', 'Subaru', 'Forester XT 2017-2018', 'headlamps', 2500000, 'OEM', 1, true, 'XT projector unit with the factory look. Limited stock, inspect on pickup.', '/parts/headlamp.jpg'),
  ('navara-2015-headlamp', 'Navara 2015 headlamp', 'TYC', 'Nissan', 'Navara 2015-2018', 'headlamps', 1100000, 'Aftermarket', 3, false, 'TYC aftermarket headlamp for the D23 Navara. Solid fitment, catalog grade.', '/parts/headlamp.jpg'),
  ('townace-2006-headlamp', 'TownAce 2006 headlamp', 'OEM', 'Toyota', 'TownAce 2005-2007', 'headlamps', 185000, 'OEM', 7, false, 'Straightforward halogen unit for the TownAce. Good daily-driver stock.', '/parts/headlamp.jpg'),
  ('harrier-hybrid-headlamp', 'Harrier hybrid 2016-2020 headlamp', 'OEM', 'Toyota', 'Harrier 2016-2020', 'headlamps', 2800000, 'OEM', 1, true, 'Hybrid Harrier LED headlamp. Bring the car or a clear photo so we match the generation.', '/parts/headlamp.jpg'),
  ('lc-tx-1998-headlamp', 'Land Cruiser TX 1998 headlamp', 'Toyota', 'Toyota', 'Land Cruiser TX 1996-1998', 'headlamps', 200000, 'Genuine', 6, false, 'Classic TX Super headlamp. Clear housing, new lens, no fogging.', '/parts/headlamp.jpg'),
  ('corolla-210-taillamp', 'Corolla 210 taillamp', 'OEM', 'Toyota', 'Corolla 210', 'taillamps', 160000, 'OEM', 8, true, 'Corolla 210 rear lamp. Sold per side. Wiring plug is standard.', '/parts/taillamp.jpg'),
  ('hilux-revo-2015-taillamp', 'Hilux Revo 2015 taillamp', 'OEM', 'Toyota', 'Hilux Revo 2015-2018', 'taillamps', 235000, 'OEM', 5, true, 'Revo tail lamp with the factory red lens. Confirm extra cab vs double cab.', '/parts/taillamp.jpg'),
  ('tiida-2010-taillamp', 'Tiida 2010 taillamp', 'Nissan', 'Nissan', 'Tiida 2008-2012', 'taillamps', 265000, 'Genuine', 3, false, 'Tiida rear lamp, genuine pattern. Clean contacts, new gasket.', '/parts/taillamp.jpg'),
  ('fj70-led-taillamp', 'Land Cruiser FJ70 LED taillamp', 'Toyota', 'Toyota', 'FJ70 / FJ75 / FJ79', 'taillamps', 200000, 'Aftermarket', 6, true, 'LED conversion-style tail for the 70-series. Bright, low draw, pickup-ready.', '/parts/taillamp.jpg'),
  ('l200-2020-taillamp', 'L200 2020-2022 taillamp', 'Mitsubishi', 'Mitsubishi', 'L200 2020-2022', 'taillamps', 485000, 'OEM', 2, false, 'Current-shape L200 rear lamp. Pair available on request.', '/parts/taillamp.jpg'),
  ('rav4-2002-taillamp', 'RAV4 2002-2004 taillamp', 'OEM', 'Toyota', 'RAV4 2002-2004', 'taillamps', 115000, 'OEM', 9, false, 'Second-gen RAV4 tail. Affordable, in stock, easy swap.', '/parts/taillamp.jpg'),
  ('wish-2003-taillamp', 'Wish 2003-2008 taillamp', 'Koito', 'Toyota', 'Wish 2003-2008', 'taillamps', 165000, 'Genuine', 4, true, 'Koito-pattern Wish tail lamp. First-gen body only.', '/parts/taillamp.jpg'),
  ('hiace-2014-taillamp', 'Hiace 2014 taillamp', 'OEM', 'Toyota', 'Hiace 2014-2018', 'taillamps', 225000, 'OEM', 5, false, 'Hiace van tail. Commuter and panel van share this shell.', '/parts/taillamp.jpg'),
  ('xtrail-2002-cornerlamp', 'X-Trail 2002-2004 cornerlamp', 'OEM', 'Nissan', 'X-Trail 2002-2004', 'cornerlamps', 65000, 'OEM', 12, false, 'Amber corner unit for the first X-Trail. Left and right in stock.', '/parts/cornerlamp.jpg'),
  ('tx-1996-cornerlamp', 'TX 1996-1998 cornerlamp', 'Toyota', 'Toyota', 'Land Cruiser TX 1996-1998', 'cornerlamps', 85000, 'Genuine', 10, false, 'TX Super corner marker. Pairs with the matching headlamp.', '/parts/cornerlamp.jpg'),
  ('premio-cornerlamp', 'Premio Super cornerlamp', 'OEM', 'Toyota', 'Premio Super 1998-2001', 'cornerlamps', 70000, 'OEM', 8, false, 'Clear/amber corner for the early Premio Super.', '/parts/cornerlamp.jpg'),
  ('mark-x-fog-led', 'Mark X LED foglight set', 'Toyota', 'Toyota', 'Mark X 2009-2016', 'foglights', 265000, 'Aftermarket', 4, true, 'Aftermarket LED fog pair for Mark X. Includes brackets.', '/parts/foglight.jpg'),
  ('wish-fog-set', 'Wish foglight / spotlight set', 'Toyota', 'Toyota', 'Wish 2003-2009', 'foglights', 265000, 'Aftermarket', 3, false, 'Spot kit for the Wish front bumper. Wiring loom sold separately.', '/parts/foglight.jpg'),
  ('lc150-fog-ring', 'LC150 foglight chrome ring', 'Toyota', 'Toyota', 'Land Cruiser 150', 'foglights', 85000, 'Aftermarket', 11, false, 'Chrome bezel for LC150 fog lamps. Pair.', '/parts/foglight.jpg'),
  ('runx-foglights', 'Runx foglights', 'Toyota', 'Toyota', 'Allex / Runx', 'foglights', 125000, 'Aftermarket', 6, false, 'Compact fog pair for Runx bumper openings.', '/parts/foglight.jpg'),
  ('harrier-hybrid-grill', 'Harrier hybrid grill 2014-2016', 'Toyota', 'Toyota', 'Harrier 2014-2016', 'body-parts', 1250000, 'OEM', 1, true, 'Hybrid Harrier front grill. Inspect the mesh before you travel - this is a large piece.', '/parts/grill.jpg'),
  ('revo-rocco-grill', 'Hilux Revo / Rocco 2020-2024 grill', 'OEM', 'Toyota', 'Hilux Revo / Rocco 2020-2024', 'body-parts', 550000, 'OEM', 2, true, 'Late Revo / Rocco face grill. Confirm chrome vs black before ordering.', '/parts/grill.jpg'),
  ('premio-super-grill', 'Premio Super 1998 grill', 'OEM', 'Toyota', 'Premio Super 1998', 'body-parts', 125000, 'OEM', 4, false, 'Early Premio Super grill. Clean chrome, no cracks.', '/parts/grill.jpg'),
  ('vigo-bumper-grill', 'Hilux Vigo 2008-2009 bumper grill', 'Toyota', 'Toyota', 'Hilux Vigo 2008-2009', 'body-parts', 235000, 'Genuine', 3, false, 'Lower bumper grill insert for the Vigo facelift.', '/parts/grill.jpg'),
  ('hiace-2006-bumper', 'Hiace 2006-2007 front bumper', 'Toyota', 'Toyota', 'Hiace 2006-2007', 'body-parts', 400000, 'OEM', 2, false, 'Front bumper cover. Primer finish - paint to match on site.', '/parts/bumper.jpg'),
  ('mark-x-spoiler', 'Mark X rear boot spoiler', 'OEM', 'Toyota', 'Mark X', 'body-parts', 165000, 'Aftermarket', 5, false, 'Boot lip spoiler. Paint-ready ABS.', '/parts/bumper.jpg'),
  ('hardtop-fender', 'Land Cruiser hardtop side fender', 'Toyota', 'Toyota', '70-series hardtop', 'body-parts', 700000, 'OEM', 1, true, '70-series hardtop fender. Heavy panel - pickup recommended.', '/parts/bumper.jpg'),
  ('silicon-sealant', 'Automotive silicon sealant 42.5g', 'Abro', null, 'Universal', 'lubricants', 20000, 'Aftermarket', 30, false, 'Small tube for lamp seals, trim and weatherstrips.', '/parts/lubricant.jpg'),
  ('paint-polish-grey', 'Car paint polish, grey', 'Abro', null, 'Universal', 'lubricants', 65000, 'Aftermarket', 18, false, 'Grey compound polish for faded paint and light scratches.', '/parts/lubricant.jpg'),
  ('engine-surface-cleaner', 'Engine surface cleaner', 'OEM', null, 'Universal', 'lubricants', 35000, 'Aftermarket', 22, false, 'Degreaser for engine bays and oily metal. Rinse off.', '/parts/lubricant.jpg'),
  ('lamp-cleaner-polish', 'Headlamp plastic cleaner and polish', 'OEM', null, 'Universal', 'lubricants', 35000, 'Aftermarket', 16, true, 'Restores yellowed lamp plastic. Use with a microfibre, not a dry cloth.', '/parts/lubricant.jpg'),
  ('adblue-10l', 'AdBlue 10L can', 'Mercedes', 'Mercedes', 'Euro 6 diesel', 'additives', 200000, 'Genuine', 8, true, '10 litre AdBlue for Mercedes and other SCR diesels. Keep sealed.', '/parts/additive.jpg'),
  ('oil-treatment-super', 'Super oil treatment', 'Mobil', null, 'Universal', 'additives', 45000, 'Aftermarket', 20, false, 'Oil treatment for older engines with light consumption.', '/parts/additive.jpg'),
  ('gauge-oil-treatment', 'Gauge oil treatment', 'OEM', null, 'Universal', 'additives', 50000, 'Aftermarket', 14, false, 'Stop-smoke style treatment. Not a substitute for a rebuild.', '/parts/additive.jpg'),
  ('hilux-hydraulic-jack', 'Hilux hydraulic jack', 'Koito', 'Toyota', 'Hilux Surf / pickup', 'accessories', 165000, 'Aftermarket', 6, true, 'Heavy-duty hydraulic jack sized for Surf and pickup chassis.', '/parts/jack.jpg'),
  ('lc200-floor-mats', 'Land Cruiser LC200 floor mats', 'Toyota', 'Toyota', 'Land Cruiser 200', 'accessories', 485000, 'Aftermarket', 3, true, 'Full-set rubber mats for LC200. Driver, passenger, second row.', '/parts/mats.jpg'),
  ('steering-cover-leather', 'Black leather steering cover', 'OEM', null, 'Universal 38cm', 'accessories', 25000, 'Aftermarket', 25, false, 'Stitched leather-look cover. 38cm standard passenger-car wheel.', '/parts/accessory.jpg'),
  ('jumpstarter-kit', 'Jump starter kit with compressor', 'OEM', null, 'Universal 12V', 'accessories', 325000, 'Aftermarket', 4, true, 'Jump pack with built-in tyre compressor. Charge before first use.', '/parts/jack.jpg'),
  ('car-alarm-system', 'Car security alarm system', 'OEM', null, 'Universal', 'accessories', 135000, 'Aftermarket', 7, false, 'Basic alarm with remote. Installation extra - we can point you to a fitter.', '/parts/accessory.jpg'),
  ('heavy-duty-radio', 'Heavy duty radio 12V / 24V', 'OEM', null, 'Universal', 'accessories', 200000, 'Aftermarket', 5, false, 'Workshop-grade head unit that takes 12V and 24V. Good for trucks.', '/parts/accessory.jpg'),
  ('fire-extinguisher', 'Car fire extinguisher', 'OEM', null, 'Universal', 'accessories', 25000, 'Aftermarket', 20, false, 'Small vehicle extinguisher. Check the gauge on pickup.', '/parts/accessory.jpg'),
  ('first-aid-kit', 'Vehicle first aid kit', 'OEM', null, 'Universal', 'accessories', 35000, 'Aftermarket', 18, false, 'Compact kit for the boot. Contents listed on the lid.', '/parts/accessory.jpg'),
  ('kyb-lc150-shocks', 'LC150 rear shock absorbers (KYB)', 'KYB', 'Toyota', 'Land Cruiser 150', 'accessories', 465000, 'Genuine', 2, false, 'KYB rear pair for LC150. Sold as a pair.', '/parts/jack.jpg')
on conflict (slug) do nothing;

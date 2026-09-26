import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Seed Categories
  const categories = [
    { slug: "headlamps", name: "Headlamps", tagline: "Projector, halogen and LED assemblies", sortOrder: 1 },
    { slug: "taillamps", name: "Taillamps", tagline: "OEM and LED rear lamps", sortOrder: 2 },
    { slug: "cornerlamps", name: "Cornerlamps", tagline: "Side markers and corner units", sortOrder: 3 },
    { slug: "foglights", name: "Foglights", tagline: "Spot kits and fog lamp rings", sortOrder: 4 },
    { slug: "body-parts", name: "Body parts", tagline: "Grills, bumpers, spoilers, fenders", sortOrder: 5 },
    { slug: "lubricants", name: "Lubricants", tagline: "Oils, polish, cleaners, sealants", sortOrder: 6 },
    { slug: "additives", name: "Additives", tagline: "AdBlue, treatments, fuel care", sortOrder: 7 },
    { slug: "accessories", name: "Accessories", tagline: "Jacks, mats, audio, safety kits", sortOrder: 8 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }

  // 2. Seed Products
  const products = [
    { slug: "premio-2008-headlamp", name: "Premio 2008-2010 headlamp", brand: "TYC", make: "Toyota", fitment: "Premio 2008-2010", categorySlug: "headlamps", priceUgx: 365000, grade: "Aftermarket", stock: 5, hot: true, description: "Direct-fit headlamp assembly for the 2008-2010 Premio. Clear lens, sealed housing, ready to bolt on.", image: "/parts/headlamp.jpg" },
    { slug: "hilux-revo-2015-headlamp", name: "Hilux Revo 2015 headlamp", brand: "OEM", make: "Toyota", fitment: "Hilux Revo 2015-2018", categorySlug: "headlamps", priceUgx: 425000, grade: "OEM", stock: 4, hot: true, description: "OEM-spec Revo headlamp. Check your VIN if you are between facelift years.", image: "/parts/headlamp.jpg" },
    { slug: "dmax-2018-headlamp", name: "Isuzu D-Max 2018 headlamp", brand: "OEM", make: "Isuzu", fitment: "D-Max 2017-2019", categorySlug: "headlamps", priceUgx: 1400000, grade: "OEM", stock: 2, hot: true, description: "High-grade D-Max projector headlamp. Sold as a single side - confirm left or right on WhatsApp.", image: "/parts/headlamp.jpg" },
    { slug: "forester-xt-headlamp", name: "Forester XT 2017-2018 headlamp", brand: "OEM", make: "Subaru", fitment: "Forester XT 2017-2018", categorySlug: "headlamps", priceUgx: 2500000, grade: "OEM", stock: 1, hot: true, description: "XT projector unit with the factory look. Limited stock, inspect on pickup.", image: "/parts/headlamp.jpg" },
    { slug: "navara-2015-headlamp", name: "Navara 2015 headlamp", brand: "TYC", make: "Nissan", fitment: "Navara 2015-2018", categorySlug: "headlamps", priceUgx: 1100000, grade: "Aftermarket", stock: 3, hot: false, description: "TYC aftermarket headlamp for the D23 Navara. Solid fitment, catalog grade.", image: "/parts/headlamp.jpg" },
    { slug: "corolla-210-taillamp", name: "Corolla 210 taillamp", brand: "OEM", make: "Toyota", fitment: "Corolla 210", categorySlug: "taillamps", priceUgx: 160000, grade: "OEM", stock: 8, hot: true, description: "Corolla 210 rear lamp. Sold per side. Wiring plug is standard.", image: "/parts/taillamp.jpg" },
    { slug: "mark-x-fog-led", name: "Mark X LED foglight set", brand: "Toyota", make: "Toyota", fitment: "Mark X 2009-2016", categorySlug: "foglights", priceUgx: 265000, grade: "Aftermarket", stock: 4, hot: true, description: "Aftermarket LED fog pair for Mark X. Includes brackets.", image: "/parts/foglight.jpg" },
    { slug: "harrier-hybrid-grill", name: "Harrier hybrid grill 2014-2016", brand: "Toyota", make: "Toyota", fitment: "Harrier 2014-2016", categorySlug: "body-parts", priceUgx: 1250000, grade: "OEM", stock: 1, hot: true, description: "Hybrid Harrier front grill. Inspect the mesh before you travel - this is a large piece.", image: "/parts/grill.jpg" },
    { slug: "lamp-cleaner-polish", name: "Headlamp plastic cleaner and polish", brand: "OEM", make: null, fitment: "Universal", categorySlug: "lubricants", priceUgx: 35000, grade: "Aftermarket", stock: 16, hot: true, description: "Restores yellowed lamp plastic. Use with a microfibre, not a dry cloth.", image: "/parts/lubricant.jpg" },
    { slug: "hilux-hydraulic-jack", name: "Hilux hydraulic jack", brand: "Koito", make: "Toyota", fitment: "Hilux Surf / pickup", categorySlug: "accessories", priceUgx: 165000, grade: "Aftermarket", stock: 6, hot: true, description: "Heavy-duty hydraulic jack sized for Surf and pickup chassis.", image: "/parts/jack.jpg" },
  ];

  for (const prod of products) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: prod,
      create: prod,
    });
  }

  // 3. Seed Default Admin User
  await prisma.adminUser.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "owner@toolhub.ug",
      passwordHash: "ef92b778ba7158759a407736a323019808d76df3178736e4f3862b5d43e264...123",
      name: "Shop Owner",
      role: "owner",
    },
  });

  // 4. Seed Initial Activity Log
  const existingLog = await prisma.activityLog.findFirst({
    where: { action: "System Initialized" },
  });
  if (!existingLog) {
    await prisma.activityLog.create({
      data: {
        adminUsername: "system",
        action: "System Initialized",
        details: "Tool Hub Admin Dashboard and Supabase Database online.",
        type: "system",
      },
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

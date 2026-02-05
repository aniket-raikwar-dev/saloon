import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User, Service, Booking } from '../models/index.js';

// Load environment variables
dotenv.config();

// Seed Data
const services = [
  // Hair Services
  { name: 'Haircut & Style', category: 'hair', price: 599, duration: '45 mins', durationMinutes: 45, icon: '✂️', isPopular: true, order: 1 },
  { name: 'Hair Coloring', category: 'hair', price: 2499, duration: '2 hrs', durationMinutes: 120, icon: '🎨', isPopular: false, order: 2 },
  { name: 'Hair Spa', category: 'hair', price: 1499, duration: '1.5 hrs', durationMinutes: 90, icon: '💆‍♀️', isPopular: true, order: 3 },
  { name: 'Keratin Treatment', category: 'hair', price: 4999, duration: '3 hrs', durationMinutes: 180, icon: '✨', isPopular: false, order: 4 },
  
  // Skin Services
  { name: 'Classic Facial', category: 'skin', price: 999, duration: '45 mins', durationMinutes: 45, icon: '🌟', isPopular: true, order: 5 },
  { name: 'Anti-Aging Facial', category: 'skin', price: 1999, duration: '1 hr', durationMinutes: 60, icon: '⏳', isPopular: false, order: 6 },
  { name: 'Hydrating Facial', category: 'skin', price: 1299, duration: '50 mins', durationMinutes: 50, icon: '💧', isPopular: false, order: 7 },
  
  // Makeup Services
  { name: 'Bridal Makeup', category: 'makeup', price: 5999, duration: '3 hrs', durationMinutes: 180, icon: '💄', isPopular: true, order: 8 },
  { name: 'Party Makeup', category: 'makeup', price: 1999, duration: '1 hr', durationMinutes: 60, icon: '🎉', isPopular: false, order: 9 },
  { name: 'Natural Makeup', category: 'makeup', price: 999, duration: '45 mins', durationMinutes: 45, icon: '🌸', isPopular: false, order: 10 },
  
  // Nails Services
  { name: 'Classic Manicure', category: 'nails', price: 499, duration: '30 mins', durationMinutes: 30, icon: '💅', isPopular: false, order: 11 },
  { name: 'Gel Nails', category: 'nails', price: 1299, duration: '1 hr', durationMinutes: 60, icon: '✨', isPopular: true, order: 12 },
  { name: 'Nail Art', category: 'nails', price: 799, duration: '45 mins', durationMinutes: 45, icon: '🎨', isPopular: false, order: 13 },
  
  // Spa Services
  { name: 'Full Body Massage', category: 'spa', price: 1999, duration: '1 hr', durationMinutes: 60, icon: '🧘‍♀️', isPopular: true, order: 14 },
  { name: 'Aromatherapy', category: 'spa', price: 2499, duration: '1.5 hrs', durationMinutes: 90, icon: '🌿', isPopular: false, order: 15 },
  { name: 'Body Scrub', category: 'spa', price: 1499, duration: '45 mins', durationMinutes: 45, icon: '🧴', isPopular: false, order: 16 },
];

const users = [
  {
    name: 'Sarah Johnson',
    email: 'sarah@glamour.com',
    password: 'user123',
    phone: '9876543210',
    dateOfBirth: new Date('1995-06-15'),
    gender: 'female',
    role: 'user',
    authProvider: 'local',
  },
  {
    name: 'Priya Sharma',
    email: 'priya@glamour.com',
    password: 'user123',
    phone: '9876543211',
    dateOfBirth: new Date('1992-03-22'),
    gender: 'female',
    role: 'user',
    authProvider: 'local',
  },
  {
    name: 'Anita Verma',
    email: 'admin@glamour.com',
    password: 'admin123',
    phone: '9999900000',
    dateOfBirth: new Date('1988-11-08'),
    gender: 'female',
    role: 'admin',
    position: 'Salon Manager',
    authProvider: 'local',
  },
  {
    name: 'Rekha Patel',
    email: 'manager@glamour.com',
    password: 'admin123',
    phone: '9999900001',
    dateOfBirth: new Date('1990-07-25'),
    gender: 'female',
    role: 'admin',
    position: 'Senior Stylist',
    authProvider: 'local',
  },
];

// Seed function
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/glamour-studio';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Service.deleteMany({});
    await Booking.deleteMany({});

    // Seed Services
    console.log('🌱 Seeding services...');
    const createdServices = await Service.insertMany(services);
    console.log(`   ✅ Created ${createdServices.length} services`);

    // Seed Users (hash passwords manually)
    console.log('🌱 Seeding users...');
    const hashedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 12),
      }))
    );
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`   ✅ Created ${createdUsers.length} users`);

    // Create sample bookings (using save to trigger pre-save hooks)
    console.log('🌱 Seeding bookings...');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const bookingsData = [
      {
        user: createdUsers[0]._id,
        userName: createdUsers[0].name,
        userPhone: createdUsers[0].phone,
        userEmail: createdUsers[0].email,
        services: [createdServices[0]._id, createdServices[2]._id], // Haircut & Hair Spa
        serviceNames: [createdServices[0].name, createdServices[2].name],
        date: tomorrow,
        time: '10:00 AM',
        totalAmount: 2098,
        status: 'confirmed',
        notes: 'First time visit',
      },
      {
        user: createdUsers[0]._id,
        userName: createdUsers[0].name,
        userPhone: createdUsers[0].phone,
        userEmail: createdUsers[0].email,
        services: [createdServices[4]._id], // Classic Facial
        serviceNames: [createdServices[4].name],
        date: nextWeek,
        time: '02:30 PM',
        totalAmount: 999,
        status: 'pending',
        notes: '',
      },
      {
        user: createdUsers[1]._id,
        userName: createdUsers[1].name,
        userPhone: createdUsers[1].phone,
        userEmail: createdUsers[1].email,
        services: [createdServices[7]._id], // Bridal Makeup
        serviceNames: [createdServices[7].name],
        date: nextWeek,
        time: '09:00 AM',
        totalAmount: 5999,
        status: 'confirmed',
        notes: 'Bridal trial session',
      },
      {
        user: createdUsers[1]._id,
        userName: createdUsers[1].name,
        userPhone: createdUsers[1].phone,
        userEmail: createdUsers[1].email,
        services: [createdServices[11]._id, createdServices[10]._id], // Gel Nails, Classic Manicure
        serviceNames: [createdServices[11].name, createdServices[10].name],
        date: today,
        time: '11:30 AM',
        totalAmount: 1798,
        status: 'pending',
        notes: '',
      },
      {
        user: createdUsers[0]._id,
        userName: createdUsers[0].name,
        userPhone: createdUsers[0].phone,
        userEmail: createdUsers[0].email,
        services: [createdServices[13]._id], // Full Body Massage
        serviceNames: [createdServices[13].name],
        date: lastWeek,
        time: '03:00 PM',
        totalAmount: 1999,
        status: 'completed',
        notes: 'Regular customer',
      },
    ];

    // Create bookings one by one to trigger pre-save hooks for bookingId generation
    const createdBookings = [];
    for (const bookingData of bookingsData) {
      const booking = new Booking(bookingData);
      await booking.save();
      createdBookings.push(booking);
    }
    console.log(`   ✅ Created ${createdBookings.length} bookings`);

    console.log('\n✨ Database seeded successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('   User:  sarah@glamour.com / user123');
    console.log('   Admin: admin@glamour.com / admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seed
seedDatabase();

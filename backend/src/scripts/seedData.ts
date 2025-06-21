import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { ServiceProvider } from '../models/ServiceProvider';
import { ServiceCategory } from '../models/ServiceCategory';
import { Booking } from '../models/Booking';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/souk-al-khadamat');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await ServiceProvider.deleteMany({});
    await ServiceCategory.deleteMany({});
    await Booking.deleteMany({});

    // Create service categories with proper slugs
    const categories = await ServiceCategory.create([
      {
        name: 'السباكة',
        description: 'خدمات السباكة والإصلاح',
        icon: '🔧',
        slug: 'plumbing'
      },
      {
        name: 'الكهرباء',
        description: 'خدمات الكهرباء والإصلاح',
        icon: '⚡',
        slug: 'electrical'
      },
      {
        name: 'التنظيف',
        description: 'خدمات التنظيف والغسيل',
        icon: '🧹',
        slug: 'cleaning'
      },
      {
        name: 'الحدادة',
        description: 'خدمات الحدادة واللحام',
        icon: '🔨',
        slug: 'blacksmithing'
      }
    ]);

    console.log('Categories created:', categories.length);

    // Create a provider user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const providerUser = await User.create({
      name: 'محمد السباك',
      email: 'mohamed@example.com',
      phone: '+212 6XX XX XX XX',
      password: hashedPassword,
      role: 'service_provider',
      isVerified: true
    });

    console.log('Provider user created');

    // Create a service provider
    const serviceProvider = await ServiceProvider.create({
      user: providerUser._id,
      businessName: 'محمد للسباكة',
      description: 'خدمات سباكة احترافية منذ 10 سنوات. نقدم جميع أنواع خدمات السباكة بأسعار منافسة وجودة عالية.',
      categories: [categories[0]._id], // Plumbing category
      services: [
        {
          name: 'إصلاح تسريبات المياه',
          description: 'إصلاح جميع أنواع تسريبات المياه في المنازل والمكاتب',
          price: 150,
          duration: 120,
          category: categories[0]._id
        },
        {
          name: 'تركيب الحنفيات',
          description: 'تركيب وتغيير جميع أنواع الحنفيات',
          price: 80,
          duration: 60,
          category: categories[0]._id
        },
        {
          name: 'إصلاح المراحيض',
          description: 'إصلاح وصيانة المراحيض والمجاري',
          price: 100,
          duration: 90,
          category: categories[0]._id
        }
      ],
      location: {
        type: 'Point',
        coordinates: [-7.5898, 33.5731], // Casablanca coordinates
        address: 'شارع محمد الخامس',
        city: 'الدار البيضاء',
        state: 'الدار البيضاء',
        country: 'المغرب',
        postalCode: '20000'
      },
      contactInfo: {
        phone: '+212 6XX XX XX XX',
        email: 'mohamed@example.com'
      },
      availability: {
        days: [
          { day: 'monday', isAvailable: true, slots: [{ start: '08:00', end: '18:00' }] },
          { day: 'tuesday', isAvailable: true, slots: [{ start: '08:00', end: '18:00' }] },
          { day: 'wednesday', isAvailable: true, slots: [{ start: '08:00', end: '18:00' }] },
          { day: 'thursday', isAvailable: true, slots: [{ start: '08:00', end: '18:00' }] },
          { day: 'friday', isAvailable: true, slots: [{ start: '08:00', end: '18:00' }] },
          { day: 'saturday', isAvailable: true, slots: [{ start: '09:00', end: '16:00' }] },
          { day: 'sunday', isAvailable: false, slots: [] }
        ]
      },
      rating: 4.8,
      totalReviews: 15,
      isVerified: true,
      isActive: true,
      subscriptionStatus: 'active'
    });

    console.log('Service provider created');

    // Create customer users
    const customers = await User.create([
      {
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        phone: '+212 6XX XX XX XX',
        password: hashedPassword,
        role: 'customer',
        isVerified: true
      },
      {
        name: 'فاطمة الزهراء',
        email: 'fatima@example.com',
        phone: '+212 6XX XX XX XX',
        password: hashedPassword,
        role: 'customer',
        isVerified: true
      },
      {
        name: 'محمد علي',
        email: 'mohamed.ali@example.com',
        phone: '+212 6XX XX XX XX',
        password: hashedPassword,
        role: 'customer',
        isVerified: true
      }
    ]);

    console.log('Customer users created:', customers.length);

    // Create bookings
    await Booking.create([
      {
        customer: customers[0]._id,
        provider: serviceProvider._id,
        serviceName: 'إصلاح تسريبات المياه',
        serviceDescription: 'تسريب في الحمام الرئيسي',
        date: new Date('2024-01-15'),
        time: '14:00',
        status: 'completed',
        price: 150,
        address: 'شارع محمد الخامس، الدار البيضاء',
        customerNotes: 'التسريب في الحمام الرئيسي',
        rating: 5,
        review: 'خدمة ممتازة وسريعة'
      },
      {
        customer: customers[1]._id,
        provider: serviceProvider._id,
        serviceName: 'تركيب الحنفيات',
        serviceDescription: 'تركيب حنفية جديدة في المطبخ',
        date: new Date('2024-01-16'),
        time: '10:00',
        status: 'confirmed',
        price: 80,
        address: 'شارع الحسن الثاني، الرباط',
        customerNotes: 'حنفية جديدة للمطبخ'
      },
      {
        customer: customers[2]._id,
        provider: serviceProvider._id,
        serviceName: 'إصلاح تسريبات المياه',
        serviceDescription: 'تسريب في المرحاض',
        date: new Date('2024-01-14'),
        time: '16:00',
        status: 'cancelled',
        price: 150,
        address: 'شارع مولاي عبد الله، مراكش',
        customerNotes: 'تم إلغاء الحجز لظروف طارئة'
      },
      {
        customer: customers[0]._id,
        provider: serviceProvider._id,
        serviceName: 'إصلاح المراحيض',
        serviceDescription: 'مشكلة في تدفق المياه',
        date: new Date('2024-01-20'),
        time: '11:00',
        status: 'pending',
        price: 100,
        address: 'شارع محمد الخامس، الدار البيضاء',
        customerNotes: 'المياه لا تتدفق بشكل صحيح'
      }
    ]);

    console.log('Sample data seeded successfully!');
    console.log('\nTest Accounts:');
    console.log('Provider: mohamed@example.com / password123');
    console.log('Customer: ahmed@example.com / password123');
    console.log('Customer: fatima@example.com / password123');
    console.log('Customer: mohamed.ali@example.com / password123');
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedData(); 
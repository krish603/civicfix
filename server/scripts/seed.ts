import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Issue, Category } from '../models';
import { connectToDatabase } from '../config/database';

dotenv.config();

const seedData = async () => {
  try {
    await connectToDatabase();
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Issue.deleteMany({});
    await Category.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create categories
    const categories = await Category.insertMany([
      {
        name: 'Infrastructure',
        description: 'Roads, bridges, utilities',
        iconName: 'construction',
        colorHex: '#3B82F6',
        displayOrder: 1,
        isActive: true
      },
      {
        name: 'Environment',
        description: 'Pollution, waste management, cleanliness',
        iconName: 'leaf',
        colorHex: '#10B981',
        displayOrder: 2,
        isActive: true
      },
      {
        name: 'Public Safety',
        description: 'Crime, lighting, traffic safety',
        iconName: 'shield',
        colorHex: '#EF4444',
        displayOrder: 3,
        isActive: true
      },
      {
        name: 'Transportation',
        description: 'Public transport, parking',
        iconName: 'car',
        colorHex: '#F59E0B',
        displayOrder: 4,
        isActive: true
      },
      {
        name: 'Health & Sanitation',
        description: 'Healthcare, sanitation, hygiene',
        iconName: 'heart',
        colorHex: '#EC4899',
        displayOrder: 5,
        isActive: true
      }
    ]);
    console.log('📁 Created categories');

    // Create sample users
    const users = await User.insertMany([
      {
        email: 'sarah.johnson@email.com',
        password: 'password123',
        name: 'Sarah Johnson',
        location: 'Downtown District',
        role: 'citizen',
        status: 'active',
        emailVerified: true
      },
      {
        email: 'mike.chen@email.com',
        password: 'password123',
        name: 'Mike Chen',
        location: 'Residential Area',
        role: 'citizen',
        status: 'active',
        emailVerified: true
      },
      {
        email: 'admin@civicfix.com',
        password: 'admin123',
        name: 'Admin User',
        location: 'City Hall',
        role: 'admin',
        status: 'active',
        emailVerified: true
      }
    ]);
    console.log('👥 Created users');

    // Create sample issues
    const issues = await Issue.insertMany([
      {
        title: 'Broken Street Light on Main Street',
        description: 'The street light at the intersection of Main Street and Oak Avenue has been out for over a week, creating a safety hazard for pedestrians and drivers.',
        locationAddress: 'Main Street & Oak Avenue, Downtown',
        latitude: 40.7589,
        longitude: -73.9851,
        categoryId: categories.find(c => c.name === 'Public Safety')?._id,
        status: 'pending',
        priority: 'high',
        reportedBy: users[0]._id,
        tags: ['streetlights', 'safety', 'urgent'],
        images: [{
          url: '/placeholder.svg',
          isPrimary: true
        }],
        upvotesCount: 24,
        downvotesCount: 2,
        viewsCount: 156,
        commentsCount: 8
      },
      {
        title: 'Large Pothole Causing Vehicle Damage',
        description: "There's a massive pothole on Elm Street that's causing damage to vehicles. Several residents have reported tire damage.",
        locationAddress: 'Elm Street, Residential Area',
        latitude: 40.7505,
        longitude: -73.9934,
        categoryId: categories.find(c => c.name === 'Infrastructure')?._id,
        status: 'in_progress',
        priority: 'high',
        reportedBy: users[1]._id,
        tags: ['potholes', 'infrastructure', 'urgent'],
        images: [{
          url: '/placeholder.svg',
          isPrimary: true
        }],
        upvotesCount: 41,
        downvotesCount: 1,
        viewsCount: 234,
        commentsCount: 12
      },
      {
        title: 'Graffiti on Public Building',
        description: 'The community center building has been vandalized with graffiti on the east wall facing the parking lot.',
        locationAddress: 'Community Center, 123 Park Ave',
        latitude: 40.7614,
        longitude: -73.9776,
        categoryId: categories.find(c => c.name === 'Environment')?._id,
        status: 'resolved',
        priority: 'medium',
        reportedBy: users[0]._id,
        tags: ['graffiti', 'vandalism', 'community'],
        images: [{
          url: '/placeholder.svg',
          isPrimary: true
        }],
        upvotesCount: 15,
        downvotesCount: 0,
        viewsCount: 89,
        commentsCount: 3,
        resolvedAt: new Date()
      },
      {
        title: 'Overflowing Trash Bin at Bus Stop',
        description: 'The trash bin at the bus stop on Pine Street is constantly overflowing, attracting pests and creating unsanitary conditions.',
        locationAddress: 'Pine Street Bus Stop',
        latitude: 40.7549,
        longitude: -73.9840,
        categoryId: categories.find(c => c.name === 'Environment')?._id,
        status: 'pending',
        priority: 'medium',
        reportedBy: users[1]._id,
        tags: ['cleanliness', 'health', 'urgent'],
        images: [{
          url: '/placeholder.svg',
          isPrimary: true
        }],
        upvotesCount: 18,
        downvotesCount: 3,
        viewsCount: 67,
        commentsCount: 5
      },
      {
        title: 'Damaged Crosswalk Signal',
        description: 'The pedestrian crossing signal at the school zone is malfunctioning, not giving enough time for students to cross safely.',
        locationAddress: 'School Zone, Maple Street',
        latitude: 40.7580,
        longitude: -73.9855,
        categoryId: categories.find(c => c.name === 'Public Safety')?._id,
        status: 'in_progress',
        priority: 'high',
        reportedBy: users[0]._id,
        tags: ['safety', 'traffic', 'schools'],
        images: [{
          url: '/placeholder.svg',
          isPrimary: true
        }],
        upvotesCount: 67,
        downvotesCount: 2,
        viewsCount: 198,
        commentsCount: 15
      },
      {
        title: 'Broken Park Bench',
        description: 'Several benches in Central Park are broken and need repair or replacement. They pose a safety risk to visitors.',
        locationAddress: 'Central Park',
        latitude: 40.7829,
        longitude: -73.9654,
        categoryId: categories.find(c => c.name === 'Infrastructure')?._id,
        status: 'pending',
        priority: 'low',
        reportedBy: users[1]._id,
        tags: ['parks', 'safety', 'children'],
        images: [{
          url: '/placeholder.svg',
          isPrimary: true
        }],
        upvotesCount: 12,
        downvotesCount: 0,
        viewsCount: 43,
        commentsCount: 2
      },
      {
        title: 'Poor Street Drainage Causing Flooding',
        description: 'Poor drainage system causes flooding every time it rains, blocking traffic and making the intersection impassable.',
        locationAddress: 'Park Street & First Avenue',
        latitude: 40.7614,
        longitude: -73.9840,
        categoryId: categories.find(c => c.name === 'Infrastructure')?._id,
        status: 'in_progress',
        priority: 'high',
        reportedBy: users[0]._id,
        tags: ['drainage', 'flooding', 'infrastructure'],
        images: [{
          url: '/placeholder.svg',
          isPrimary: true
        }],
        upvotesCount: 35,
        downvotesCount: 0,
        viewsCount: 145,
        commentsCount: 8
      },
      {
        title: 'Broken Sidewalk Near Hospital',
        description: 'Large cracks and uneven surfaces on Oak Avenue sidewalk near the hospital entrance, making it dangerous for wheelchair users and elderly pedestrians.',
        locationAddress: 'Oak Avenue, Hospital District',
        latitude: 40.7505,
        longitude: -73.9780,
        categoryId: categories.find(c => c.name === 'Infrastructure')?._id,
        status: 'pending',
        priority: 'high',
        reportedBy: users[1]._id,
        tags: ['accessibility', 'safety', 'sidewalk'],
        images: [{
          url: '/placeholder.svg',
          isPrimary: true
        }],
        upvotesCount: 28,
        downvotesCount: 1,
        viewsCount: 87,
        commentsCount: 6
      }
    ]);
    console.log('🚨 Created issues');

    console.log('✅ Database seeding completed successfully!');
    console.log(`Created ${categories.length} categories, ${users.length} users, and ${issues.length} issues`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
  }
};

// Run seeder if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedData();
}

export default seedData;

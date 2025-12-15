require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Pooja = require('./models/Pooja');
const Pandit = require('./models/Pandit');
const Temple = require('./models/Temple');
const Course = require('./models/Course');
const Review = require('./models/Review');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sanskar')
  .then(() => console.log('MongoDB Connected for seeding'))
  .catch(err => console.error(err));

const seedData = async () => {
  try {
    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Pooja.deleteMany({}),
      Pandit.deleteMany({}),
      Temple.deleteMany({}),
      Course.deleteMany({}),
      Review.deleteMany({})
    ]);

    console.log('Cleared existing data...');

    // Create Users
    const users = await User.insertMany([
      {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890',
        phone: '+91-9876543210',
        role: 'user'
      },
      {
        name: 'Priya Gupta',
        email: 'priya@example.com',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890',
        phone: '+91-9876543211',
        role: 'user'
      }
    ]);

    console.log('Created users...');

    // Create Products
    const products = await Product.insertMany([
      {
        name: { english: 'Complete Pooja Thali Set', hindi: 'पूर्ण पूजा थाली सेट' },
        slug: 'complete-pooja-thali-set',
        description: { 
          english: 'Traditional brass pooja thali with all essential items including diya, incense holder, and bell',
          hindi: 'सभी आवश्यक वस्तुओं के साथ पारंपरिक पीतल की पूजा थाली'
        },
        category: 'Puja Thali',
        price: 599,
        mrp: 899,
        discountPrice: 599,
        mainImage: 'https://images.unsplash.com/photo-1558317374-067fb382f4e6?w=800',
        stock: 50,
        ecoFriendly: true,
        featured: true,
        ratings: { average: 4.7, count: 128 },
        specifications: {
          weight: '500g',
          dimensions: '30cm diameter',
          material: 'Brass',
          origin: 'Jaipur, Rajasthan'
        }
      },
      {
        name: { english: 'Organic Dhoop Sticks', hindi: 'जैविक धूप स्टिक' },
        slug: 'organic-dhoop-sticks',
        description: { 
          english: 'Natural dhoop sticks made from pure herbs and resins. Creates calming fragrance',
          hindi: 'शुद्ध जड़ी-बूटियों और राल से बनी प्राकृतिक धूप स्टिक'
        },
        category: 'Incense',
        price: 149,
        mrp: 199,
        discountPrice: 149,
        mainImage: 'https://images.unsplash.com/photo-1597844161122-53ea23c5e234?w=800',
        stock: 200,
        ecoFriendly: true,
        featured: true,
        ratings: { average: 4.5, count: 89 },
        specifications: {
          weight: '100g',
          material: 'Natural herbs & resins',
          origin: 'Bangalore, Karnataka'
        }
      },
      {
        name: { english: 'Brass Diya (Set of 4)', hindi: 'पीतल के दीये (4 का सेट)' },
        slug: 'brass-diya-set-of-4',
        description: { 
          english: 'Beautiful handcrafted brass diyas perfect for daily pooja and festivals',
          hindi: 'दैनिक पूजा और त्योहारों के लिए सुंदर हस्तनिर्मित पीतल के दीये'
        },
        category: 'Lamps & Diyas',
        price: 299,
        mrp: 450,
        discountPrice: 299,
        mainImage: 'https://images.unsplash.com/photo-1604095098299-c99c70547df3?w=800',
        stock: 75,
        ecoFriendly: false,
        featured: true,
        ratings: { average: 4.8, count: 156 },
        specifications: {
          weight: '200g',
          dimensions: '6cm diameter each',
          material: 'Pure Brass',
          origin: 'Moradabad, UP'
        }
      },
      {
        name: { english: 'Ganesh Idol - Marble', hindi: 'गणेश की मूर्ति - संगमरमर' },
        slug: 'ganesh-idol-marble',
        description: { 
          english: 'Handcrafted white marble Ganesh idol with intricate detailing',
          hindi: 'जटिल विस्तार के साथ हस्तनिर्मित सफेद संगमरमर गणेश मूर्ति'
        },
        category: 'Idols',
        price: 1299,
        mrp: 1999,
        discountPrice: 1299,
        mainImage: 'https://images.unsplash.com/photo-1580492516014-4a28466d55df?w=800',
        stock: 30,
        ecoFriendly: false,
        featured: true,
        ratings: { average: 4.9, count: 234 },
        specifications: {
          weight: '800g',
          dimensions: '8 inches height',
          material: 'White Marble',
          origin: 'Jaipur, Rajasthan'
        }
      },
      {
        name: { english: 'Camphor Tablets (Pure)', hindi: 'कपूर की गोलियाँ (शुद्ध)' },
        slug: 'pure-camphor-tablets',
        description: { 
          english: 'Pure camphor tablets for aarti and religious ceremonies',
          hindi: 'आरती और धार्मिक समारोहों के लिए शुद्ध कपूर की गोलियाँ'
        },
        category: 'Pooja Kit',
        price: 99,
        mrp: 129,
        discountPrice: 99,
        mainImage: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800',
        stock: 150,
        ecoFriendly: true,
        featured: false,
        ratings: { average: 4.6, count: 67 },
        specifications: {
          weight: '50g',
          material: 'Pure Camphor',
          origin: 'Bhimashankar'
        }
      },
      {
        name: { english: 'Rudraksha Mala (108 Beads)', hindi: 'रुद्राक्ष माला (108 मनके)' },
        slug: 'rudraksha-mala-108-beads',
        description: { 
          english: 'Original 5 Mukhi Rudraksha mala for meditation and japa',
          hindi: 'ध्यान और जप के लिए मूल 5 मुखी रुद्राक्ष माला'
        },
        category: 'Accessories',
        price: 799,
        mrp: 1200,
        discountPrice: 799,
        mainImage: 'https://images.unsplash.com/photo-1610375228550-d5cdb1b9d33e?w=800',
        stock: 40,
        ecoFriendly: true,
        featured: true,
        ratings: { average: 4.7, count: 91 },
        specifications: {
          weight: '30g',
          material: '5 Mukhi Rudraksha',
          origin: 'Nepal'
        }
      },
      {
        name: { english: 'Eco-Friendly Ganges Clay Diyas', hindi: 'पर्यावरण के अनुकूल गंगा मिट्टी के दीये' },
        slug: 'eco-friendly-ganges-clay-diyas',
        description: { 
          english: 'Biodegradable clay diyas made from sacred Ganges river clay',
          hindi: 'पवित्र गंगा नदी की मिट्टी से बने बायोडिग्रेडेबल मिट्टी के दीये'
        },
        category: 'Eco-Friendly',
        price: 199,
        mrp: 299,
        discountPrice: 199,
        mainImage: 'https://images.unsplash.com/photo-1604937376108-920c7b3e1bae?w=800',
        stock: 120,
        ecoFriendly: true,
        featured: true,
        ratings: { average: 4.5, count: 112 },
        specifications: {
          weight: '500g (pack of 50)',
          material: 'Ganges Clay',
          origin: 'Varanasi, UP'
        }
      },
      {
        name: { english: 'Bhagavad Gita (Hindi-English)', hindi: 'भगवद गीता (हिंदी-अंग्रेजी)' },
        slug: 'bhagavad-gita-hindi-english',
        description: { 
          english: 'Complete Bhagavad Gita with translations and commentary',
          hindi: 'अनुवाद और टिप्पणी के साथ पूर्ण भगवद गीता'
        },
        category: 'Books',
        price: 399,
        mrp: 599,
        discountPrice: 399,
        mainImage: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=800',
        stock: 80,
        ecoFriendly: false,
        featured: true,
        ratings: { average: 4.9, count: 287 },
        specifications: {
          weight: '400g',
          material: 'Premium Paper',
          origin: 'Gorakhpur, UP'
        }
      }
    ]);

    console.log('Created products...');

    // Create Poojas
    const poojas = await Pooja.insertMany([
      {
        name: { english: 'Griha Pravesh Pooja', hindi: 'गृह प्रवेश पूजा' },
        slug: 'griha-pravesh-pooja',
        description: {
          english: 'Traditional house warming ceremony to invoke divine blessings for new home',
          hindi: 'नए घर के लिए दिव्य आशीर्वाद प्राप्त करने के लिए पारंपरिक गृह प्रवेश समारोह'
        },
        category: 'Lifecycle',
        duration: 180,
        price: 5100,
        benefits: [
          'Removes negative energies',
          'Brings prosperity',
          'Protects from evil eye',
          'Establishes positive vibrations'
        ],
        items: ['Hawan samagri', 'Fruits', 'Flowers', 'Coconut', 'Sacred thread'],
        deity: 'Ganesh & Lakshmi',
        featured: true,
        videoGuide: 'https://youtube.com/example1',
        ratings: { average: 4.8, count: 145 }
      },
      {
        name: { english: 'Satyanarayan Katha', hindi: 'सत्यनारायण कथा' },
        slug: 'satyanarayan-katha',
        description: {
          english: 'Sacred ritual dedicated to Lord Vishnu for peace and prosperity',
          hindi: 'शांति और समृद्धि के लिए भगवान विष्णु को समर्पित पवित्र अनुष्ठान'
        },
        category: 'Devotional',
        duration: 120,
        price: 3100,
        benefits: [
          'Fulfills desires',
          'Removes obstacles',
          'Brings harmony',
          'Divine blessings'
        ],
        items: ['Pooja thali', 'Fruits', 'Sweets', 'Panchamrit', 'Yellow cloth'],
        deity: 'Vishnu',
        featured: true,
        videoGuide: 'https://youtube.com/example2',
        ratings: { average: 4.7, count: 203 }
      },
      {
        name: { english: 'Navagraha Shanti Pooja', hindi: 'नवग्रह शांति पूजा' },
        slug: 'navagraha-shanti-pooja',
        description: {
          english: 'Powerful ritual to appease the nine planets and reduce their negative effects',
          hindi: 'नौ ग्रहों को प्रसन्न करने और उनके नकारात्मक प्रभावों को कम करने के लिए शक्तिशाली अनुष्ठान'
        },
        category: 'Remedial',
        duration: 240,
        price: 7100,
        benefits: [
          'Reduces planetary afflictions',
          'Improves career prospects',
          'Enhances health',
          'Brings mental peace'
        ],
        items: ['Nine types of grains', 'Colored cloths', 'Specific herbs', 'Gemstones offerings'],
        deity: 'Nine Planets',
        featured: true,
        videoGuide: 'https://youtube.com/example3',
        ratings: { average: 4.9, count: 167 }
      },
      {
        name: { english: 'Ganesh Chaturthi Special Pooja', hindi: 'गणेश चतुर्थी विशेष पूजा' },
        slug: 'ganesh-chaturthi-special-pooja',
        description: {
          english: 'Complete Ganesh Chaturthi pooja with all rituals and mantras',
          hindi: 'सभी अनुष्ठानों और मंत्रों के साथ पूर्ण गणेश चतुर्थी पूजा'
        },
        category: 'Festival',
        duration: 150,
        price: 4100,
        benefits: [
          'Removes obstacles',
          'Brings wisdom',
          'Ensures success',
          'Provides protection'
        ],
        items: ['Modak', 'Durva grass', 'Red flowers', '21 leaves', 'Coconut'],
        deity: 'Ganesh',
        featured: true,
        videoGuide: 'https://youtube.com/example4',
        ratings: { average: 4.8, count: 198 }
      },
      {
        name: { english: 'Lakshmi Pooja', hindi: 'लक्ष्मी पूजा' },
        slug: 'lakshmi-pooja',
        description: {
          english: 'Worship of Goddess Lakshmi for wealth and prosperity',
          hindi: 'धन और समृद्धि के लिए देवी लक्ष्मी की पूजा'
        },
        category: 'Devotional',
        duration: 90,
        price: 2100,
        benefits: [
          'Attracts wealth',
          'Business success',
          'Financial stability',
          'Material prosperity'
        ],
        items: ['Lotus flowers', 'Gold/silver coin', 'Sweets', 'New clothes', 'Kumkum'],
        deity: 'Lakshmi',
        featured: true,
        videoGuide: 'https://youtube.com/example5',
        ratings: { average: 4.6, count: 176 }
      }
    ]);

    console.log('Created poojas...');

    // Create Pandits
    const pandits = await Pandit.insertMany([
      {
        name: 'Pt. Rajesh Shastri',
        email: 'rajesh.shastri@example.com',
        phone: '+91-9876543220',
        specialties: ['Vedic Rituals', 'Marriage Ceremonies', 'Graha Shanti'],
        languages: ['Hindi', 'Sanskrit', 'English'],
        experience: 15,
        education: 'Shastri from Sampurnanand Sanskrit University',
        location: {
          city: 'Varanasi',
          state: 'Uttar Pradesh',
          coordinates: [82.9739, 25.3176]
        },
        availability: {
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          hours: { start: '06:00', end: '20:00' }
        },
        pricing: {
          basePrice: 3100,
          travelCharges: 500
        },
        ratings: { average: 4.8, count: 156 },
        verified: true,
        featured: true,
        image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400'
      },
      {
        name: 'Pt. Arun Dikshit',
        email: 'arun.dikshit@example.com',
        phone: '+91-9876543221',
        specialties: ['Satyanarayan Katha', 'Griha Pravesh', 'Naamkaran'],
        languages: ['Hindi', 'Sanskrit', 'Marathi'],
        experience: 12,
        education: 'Acharya from Rashtriya Sanskrit Vidyapeeth',
        location: {
          city: 'Pune',
          state: 'Maharashtra',
          coordinates: [73.8567, 18.5204]
        },
        availability: {
          days: ['Monday', 'Wednesday', 'Friday', 'Saturday', 'Sunday'],
          hours: { start: '07:00', end: '19:00' }
        },
        pricing: {
          basePrice: 2600,
          travelCharges: 400
        },
        ratings: { average: 4.7, count: 134 },
        verified: true,
        featured: true,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
      },
      {
        name: 'Pt. Krishna Sharma',
        email: 'krishna.sharma@example.com',
        phone: '+91-9876543222',
        specialties: ['Navgraha Pooja', 'Kaal Sarp Dosh', 'Pitru Paksha'],
        languages: ['Hindi', 'Sanskrit', 'Punjabi', 'English'],
        experience: 20,
        education: 'Vidyavaridhi from Sri Lal Bahadur Shastri Rashtriya Sanskrit Vidyapeeth',
        location: {
          city: 'Delhi',
          state: 'Delhi',
          coordinates: [77.2090, 28.6139]
        },
        availability: {
          days: ['Tuesday', 'Thursday', 'Saturday', 'Sunday'],
          hours: { start: '06:00', end: '21:00' }
        },
        pricing: {
          basePrice: 4100,
          travelCharges: 600
        },
        ratings: { average: 4.9, count: 211 },
        verified: true,
        featured: true,
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'
      },
      {
        name: 'Pt. Mahesh Joshi',
        email: 'mahesh.joshi@example.com',
        phone: '+91-9876543223',
        specialties: ['Rudrabhishek', 'Ganesh Pooja', 'Durga Pooja'],
        languages: ['Hindi', 'Sanskrit', 'Bengali'],
        experience: 18,
        education: 'Shastri from Sanskrit College Calcutta',
        location: {
          city: 'Kolkata',
          state: 'West Bengal',
          coordinates: [88.3639, 22.5726]
        },
        availability: {
          days: ['Monday', 'Tuesday', 'Wednesday', 'Friday', 'Saturday'],
          hours: { start: '06:30', end: '19:30' }
        },
        pricing: {
          basePrice: 3600,
          travelCharges: 500
        },
        ratings: { average: 4.6, count: 98 },
        verified: true,
        featured: false,
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'
      },
      {
        name: 'Pt. Suresh Pandey',
        email: 'suresh.pandey@example.com',
        phone: '+91-9876543224',
        specialties: ['Vivah Sanskar', 'Upanayana', 'Annaprashan'],
        languages: ['Hindi', 'Sanskrit', 'Gujarati'],
        experience: 10,
        education: 'Shastri from Gujarat Vidyapith',
        location: {
          city: 'Ahmedabad',
          state: 'Gujarat',
          coordinates: [72.5714, 23.0225]
        },
        availability: {
          days: ['Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          hours: { start: '07:00', end: '20:00' }
        },
        pricing: {
          basePrice: 2900,
          travelCharges: 400
        },
        ratings: { average: 4.7, count: 87 },
        verified: true,
        featured: false,
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400'
      }
    ]);

    console.log('Created pandits...');

    // Create Temples
    const temples = await Temple.insertMany([
      {
        name: 'Kashi Vishwanath Temple',
        slug: 'kashi-vishwanath-temple',
        description: 'One of the twelve Jyotirlingas dedicated to Lord Shiva, located on the western bank of holy river Ganges',
        deity: 'Shiva',
        city: 'Varanasi',
        state: 'Uttar Pradesh',
        address: 'Lahori Tola, Varanasi, Uttar Pradesh 221001',
        location: {
          type: 'Point',
          coordinates: [83.0106, 25.3107]
        },
        timings: '3:00 AM - 11:00 PM',
        phone: '+91-542-2392159',
        image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800',
        rating: 4.8,
        featured: true,
        facilities: ['Prasad', 'Drinking Water', 'Wheelchair Access', 'Parking'],
        history: 'Ancient temple with documented history over 3500 years'
      },
      {
        name: 'Siddhivinayak Temple',
        slug: 'siddhivinayak-temple',
        description: 'Famous temple dedicated to Lord Ganesha, fulfiller of wishes and remover of obstacles',
        deity: 'Ganesh',
        city: 'Mumbai',
        state: 'Maharashtra',
        address: 'SK Bole Road, Prabhadevi, Mumbai, Maharashtra 400028',
        location: {
          type: 'Point',
          coordinates: [72.8311, 19.0170]
        },
        timings: '5:30 AM - 10:00 PM',
        phone: '+91-22-24307641',
        image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800',
        rating: 4.7,
        featured: true,
        facilities: ['Prasad', 'Donation Counter', 'Book Stall', 'Parking'],
        history: 'Built in 1801, attracts millions of devotees annually'
      },
      {
        name: 'Golden Temple',
        slug: 'golden-temple-amritsar',
        description: 'The holiest Gurdwara and most important pilgrimage site of Sikhism',
        deity: 'Guru Granth Sahib',
        city: 'Amritsar',
        state: 'Punjab',
        address: 'Golden Temple Road, Atta Mandi, Amritsar, Punjab 143006',
        location: {
          type: 'Point',
          coordinates: [74.8765, 31.6200]
        },
        timings: '24 hours',
        phone: '+91-183-2553954',
        image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
        rating: 4.9,
        featured: true,
        facilities: ['Langar', 'Accommodation', 'Medical Aid', 'Free Parking'],
        history: 'Founded in 1577 by Guru Ram Das, gold plating added in 19th century'
      },
      {
        name: 'Tirupati Balaji Temple',
        slug: 'tirupati-balaji-temple',
        description: 'Richest temple in the world dedicated to Lord Venkateswara',
        deity: 'Vishnu',
        city: 'Tirupati',
        state: 'Andhra Pradesh',
        address: 'Tirumala, Tirupati, Andhra Pradesh 517504',
        location: {
          type: 'Point',
          coordinates: [79.3478, 13.6832]
        },
        timings: '2:30 AM - 1:00 AM (varies)',
        phone: '+91-877-2277777',
        image: 'https://images.unsplash.com/photo-1604948501466-4e9c339b9c24?w=800',
        rating: 4.8,
        featured: true,
        facilities: ['Online Booking', 'Accommodation', 'Prasad', 'TTD Services'],
        history: 'Ancient temple mentioned in Tamil and Sanskrit literature, over 2000 years old'
      },
      {
        name: 'Meenakshi Amman Temple',
        slug: 'meenakshi-amman-temple',
        description: 'Historic Hindu temple dedicated to Goddess Meenakshi and Lord Sundareswarar',
        deity: 'Durga',
        city: 'Madurai',
        state: 'Tamil Nadu',
        address: 'Madurai Main, Madurai, Tamil Nadu 625001',
        location: {
          type: 'Point',
          coordinates: [78.1198, 9.9195]
        },
        timings: '5:00 AM - 12:30 PM, 4:00 PM - 9:30 PM',
        phone: '+91-452-2345789',
        image: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800',
        rating: 4.9,
        featured: true,
        facilities: ['Museum', 'Book Stall', 'Audio Guide', 'Photography Area'],
        history: 'Dravidian architecture masterpiece, current structure dates to 17th century'
      },
      {
        name: 'Jagannath Temple',
        slug: 'jagannath-temple-puri',
        description: 'Famous temple and important Hindu pilgrimage site, one of the Char Dham',
        deity: 'Krishna',
        city: 'Puri',
        state: 'Odisha',
        address: 'Grand Road, Puri, Odisha 752001',
        location: {
          type: 'Point',
          coordinates: [85.8189, 19.8048]
        },
        timings: '5:00 AM - 12:00 PM, 3:00 PM - 10:00 PM',
        phone: '+91-6752-222664',
        image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800',
        rating: 4.7,
        featured: true,
        facilities: ['Mahaprasad', 'Rath Yatra', 'Ananda Bazar', 'Accommodation'],
        history: 'Built in 12th century, famous for annual Rath Yatra festival'
      },
      {
        name: 'Somnath Temple',
        slug: 'somnath-temple',
        description: 'First among the twelve Jyotirlinga shrines of Lord Shiva',
        deity: 'Shiva',
        city: 'Somnath',
        state: 'Gujarat',
        address: 'Veraval, Somnath, Gujarat 362268',
        location: {
          type: 'Point',
          coordinates: [70.4011, 20.8880]
        },
        timings: '6:00 AM - 9:30 PM',
        phone: '+91-2876-231920',
        image: 'https://images.unsplash.com/photo-1582699293615-1662c7c3f785?w=800',
        rating: 4.8,
        featured: true,
        facilities: ['Sound & Light Show', 'Museum', 'Beach View', 'Parking'],
        history: 'Ancient temple destroyed and rebuilt several times, current structure from 1951'
      },
      {
        name: 'Kedarnath Temple',
        slug: 'kedarnath-temple',
        description: 'Highest of the twelve Jyotirlingas, one of the Char Dham',
        deity: 'Shiva',
        city: 'Kedarnath',
        state: 'Uttarakhand',
        address: 'Kedarnath, Rudraprayag, Uttarakhand 246445',
        location: {
          type: 'Point',
          coordinates: [79.0669, 30.7346]
        },
        timings: 'Open May-Nov (summer only)',
        phone: '+91-1364-262360',
        image: 'https://images.unsplash.com/photo-1626308064775-b3f58cd0c5e0?w=800',
        rating: 4.9,
        featured: true,
        facilities: ['Helicopter Service', 'Pony Service', 'Medical Aid', 'Accommodation'],
        history: 'Ancient temple at 3583m altitude, believed to be over 1000 years old'
      }
    ]);

    console.log('Created temples...');

    // Create Courses
    const courses = await Course.insertMany([
      {
        title: { english: 'Sanskrit for Beginners', hindi: 'शुरुआती के लिए संस्कृत', sanskrit: 'आरम्भकाः संस्कृतम्' },
        slug: 'sanskrit-for-beginners',
        description: {
          english: 'Learn basic Sanskrit grammar, vocabulary and simple sentences. Perfect for absolute beginners',
          hindi: 'बुनियादी संस्कृत व्याकरण, शब्दावली और सरल वाक्य सीखें'
        },
        instructor: {
          name: 'Dr. Ramesh Shukla',
          bio: 'PhD in Sanskrit from BHU, 15 years teaching experience',
          image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
          credentials: ['PhD Sanskrit', 'M.A. Sanskrit', '15+ years experience']
        },
        level: 'Beginner',
        duration: { weeks: 8, hoursPerWeek: 3 },
        price: 2999,
        discountPrice: 1999,
        thumbnail: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800',
        category: 'Sanskrit Grammar',
        modules: [
          {
            title: 'Introduction to Sanskrit',
            description: 'Basics of Devanagari script and pronunciation',
            lessons: [
              { title: 'Sanskrit Alphabet', duration: 30, type: 'video' },
              { title: 'Vowels and Consonants', duration: 45, type: 'video' },
              { title: 'Practice Writing', duration: 20, type: 'practice' }
            ]
          },
          {
            title: 'Basic Grammar',
            description: 'Introduction to Sanskrit grammar rules',
            lessons: [
              { title: 'Sandhi Rules', duration: 40, type: 'video' },
              { title: 'Noun Declensions', duration: 50, type: 'video' },
              { title: 'Quiz', duration: 15, type: 'quiz' }
            ]
          }
        ],
        enrolledStudents: 1247,
        ratings: { average: 4.7, count: 234 },
        featured: true,
        status: 'published'
      },
      {
        title: { english: 'Vedic Chanting Basics', hindi: 'वैदिक मंत्रोच्चारण मूल बातें', sanskrit: 'वैदिक मन्त्रोच्चारणम्' },
        slug: 'vedic-chanting-basics',
        description: {
          english: 'Learn authentic Vedic chanting techniques with proper pronunciation and intonation',
          hindi: 'उचित उच्चारण और स्वरक्रम के साथ प्रामाणिक वैदिक मंत्रोच्चारण सीखें'
        },
        instructor: {
          name: 'Pt. Vishwanath Jha',
          bio: 'Veda Pandit from traditional Gurukul, expert in Rigveda',
          image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400',
          credentials: ['Vedacharya', '20+ years in Vedic studies', 'Gurukul trained']
        },
        level: 'Intermediate',
        duration: { weeks: 10, hoursPerWeek: 4 },
        price: 4999,
        discountPrice: 3499,
        thumbnail: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800',
        category: 'Vedic Chanting',
        modules: [
          {
            title: 'Understanding Vedic Accents',
            description: 'Learn Udatta, Anudatta and Swarita',
            lessons: [
              { title: 'Three Vedic Accents', duration: 45, type: 'video' },
              { title: 'Accent Practice', duration: 30, type: 'practice' }
            ]
          }
        ],
        enrolledStudents: 567,
        ratings: { average: 4.8, count: 89 },
        featured: true,
        status: 'published'
      },
      {
        title: { english: 'Spoken Sanskrit - Intermediate', hindi: 'संवाद संस्कृत - मध्यवर्ती', sanskrit: 'संवाद संस्कृतम् - मध्यमम्' },
        slug: 'spoken-sanskrit-intermediate',
        description: {
          english: 'Develop conversational skills in Sanskrit for everyday situations',
          hindi: 'रोजमर्रा की स्थितियों के लिए संस्कृत में संवाद कौशल विकसित करें'
        },
        instructor: {
          name: 'Prof. Meera Dixit',
          bio: 'Professor of Sanskrit at Delhi University, promotes spoken Sanskrit',
          image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
          credentials: ['M.A. Sanskrit', 'PhD Linguistics', 'Spoken Sanskrit expert']
        },
        level: 'Intermediate',
        duration: { weeks: 12, hoursPerWeek: 3 },
        price: 3999,
        discountPrice: 2799,
        thumbnail: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
        category: 'Spoken Sanskrit',
        modules: [
          {
            title: 'Daily Conversations',
            description: 'Common phrases and sentences',
            lessons: [
              { title: 'Greetings', duration: 25, type: 'video' },
              { title: 'Family Relations', duration: 30, type: 'video' }
            ]
          }
        ],
        enrolledStudents: 892,
        ratings: { average: 4.6, count: 156 },
        featured: true,
        status: 'published'
      },
      {
        title: { english: 'Sanskrit for Kids', hindi: 'बच्चों के लिए संस्कृत', sanskrit: 'बालकानाम् संस्कृतम्' },
        slug: 'sanskrit-for-kids',
        description: {
          english: 'Fun and interactive Sanskrit learning for children aged 8-14',
          hindi: '8-14 वर्ष के बच्चों के लिए मजेदार और इंटरैक्टिव संस्कृत सीखना'
        },
        instructor: {
          name: 'Smt. Anjali Pandey',
          bio: 'Child education specialist with focus on Sanskrit',
          image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
          credentials: ['B.Ed', 'M.A. Sanskrit', '10+ years teaching kids']
        },
        level: 'Beginner',
        duration: { weeks: 6, hoursPerWeek: 2 },
        price: 1999,
        discountPrice: 1299,
        thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
        category: 'Sanskrit for Kids',
        modules: [
          {
            title: 'Sanskrit Alphabet Fun',
            description: 'Learning letters through games and stories',
            lessons: [
              { title: 'Letter Games', duration: 20, type: 'video' },
              { title: 'Story Time', duration: 25, type: 'video' }
            ]
          }
        ],
        enrolledStudents: 1523,
        ratings: { average: 4.9, count: 312 },
        featured: true,
        status: 'published'
      }
    ]);

    console.log('Created courses...');

    console.log('✅ Database seeded successfully with dummy data!');
    console.log(`
    Summary:
    - ${users.length} Users
    - ${products.length} Products
    - ${poojas.length} Poojas
    - ${pandits.length} Pandits
    - ${temples.length} Temples
    - ${courses.length} Courses
    `);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();

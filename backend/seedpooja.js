// Run this script to add sample poojas to your database
// node seedPoojas.js

require("dotenv").config();
const mongoose = require("mongoose");
const Pooja = require("./models/Pooja");

const samplePoojas = [
  {
    poojaType: "Ganesh Puja",
    poojaLanguage: "hindi",
    importance: {
      hindi:
        "गणेश पूजा सभी शुभ कार्यों की शुरुआत में की जाती है। भगवान गणेश विघ्नहर्ता हैं और उनकी पूजा से सभी बाधाएं दूर होती हैं।",
      sanskrit:
        "गणेशः विघ्नहर्ता देवः अस्ति। सर्वेषां शुभकार्याणां आरम्भे गणेशपूजा आवश्यकी।",
      english:
        "Ganesh Puja is performed at the beginning of all auspicious events. Lord Ganesh is the remover of obstacles.",
    },
    steps: {
      hindi: [
        {
          order: 1,
          description:
            "सबसे पहले गणेश जी की मूर्ति को जल से स्वच्छ करें और लाल वस्त्र से ढकें।",
          mantra: "ॐ गं गणपतये नमः",
          image: "",
          audio: "",
          video: "",
        },
        {
          order: 2,
          description:
            "दीपक जलाएं और धूप अर्पित करें। फूल, दूर्वा और मोदक चढ़ाएं।",
          mantra:
            "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा।।",
          image: "",
          audio: "",
          video: "",
        },
      ],
      sanskrit: [
        {
          order: 1,
          description:
            "प्रथमं गणेशमूर्तिं जलेन शुद्धं कुर्यात्। रक्तवस्त्रेण आच्छादयेत्।",
          mantra: "ॐ गं गणपतये नमः",
          image: "",
          audio: "",
          video: "",
        },
      ],
      english: [
        {
          order: 1,
          description:
            "First, clean the Ganesh idol with water and cover it with red cloth.",
          mantra: "Om Gam Ganapataye Namah",
          image: "",
          audio: "",
          video: "",
        },
      ],
    },
    isActive: true,
    createdBy: null, // Will be set to admin user ID
    views: 150,
    ratings: {
      average: 4.5,
      count: 25,
    },
  },
  {
    poojaType: "Satyanarayan Katha",
    poojaLanguage: "hindi",
    importance: {
      hindi:
        "सत्यनारायण व्रत कथा भगवान विष्णु की कृपा प्राप्त करने के लिए की जाती है। यह समृद्धि और मनोकामना पूर्ति का व्रत है।",
      sanskrit:
        "सत्यनारायणव्रतं विष्णुप्रसादाय कृतम्। धनसमृद्धिं मनोकामनापूर्तिं च प्राप्नुयात्।",
      english:
        "Satyanarayan Vrat is performed to seek blessings of Lord Vishnu for prosperity and fulfillment of wishes.",
    },
    steps: {
      hindi: [
        {
          order: 1,
          description:
            "व्रत के लिए पीले वस्त्र धारण करें और स्नान करके पवित्र हों।",
          mantra: "ॐ नमो भगवते वासुदेवाय",
          image: "",
          audio: "",
          video: "",
        },
        {
          order: 2,
          description:
            "भगवान सत्यनारायण की प्रतिमा स्थापित करें और पंचामृत से स्नान कराएं।",
          mantra: "सत्यं परं धीमहि सत्यमेव जयते",
          image: "",
          audio: "",
          video: "",
        },
        {
          order: 3,
          description: "कथा सुनें और प्रसाद वितरण करें।",
          mantra: "श्री सत्यनारायणाय नमः",
          image: "",
          audio: "",
          video: "",
        },
      ],
      sanskrit: [],
      english: [
        {
          order: 1,
          description:
            "Wear yellow clothes and take a purifying bath before the vrat.",
          mantra: "Om Namo Bhagavate Vasudevaya",
          image: "",
          audio: "",
          video: "",
        },
      ],
    },
    isActive: true,
    createdBy: null,
    views: 200,
    ratings: {
      average: 4.8,
      count: 40,
    },
  },
  {
    poojaType: "Lakshmi Puja",
    poojaLanguage: "hindi",
    importance: {
      hindi:
        "लक्ष्मी पूजा धन, समृद्धि और सौभाग्य की देवी माँ लक्ष्मी की आराधना है। दीपावली पर यह पूजा विशेष रूप से की जाती है।",
      sanskrit:
        "लक्ष्मीपूजा धनसमृद्ध्यर्थं भाग्यवृद्ध्यर्थं च कृतम्। दीपावल्यां विशेषतः आराध्यते।",
      english:
        "Lakshmi Puja is worship of Goddess Lakshmi for wealth, prosperity and good fortune, especially performed on Diwali.",
    },
    steps: {
      hindi: [
        {
          order: 1,
          description:
            "घर को साफ करें और रंगोली बनाएं। लक्ष्मी जी के चरण बनाएं।",
          mantra: "ॐ श्रीं महालक्ष्म्यै नमः",
          image: "",
          audio: "",
          video: "",
        },
        {
          order: 2,
          description:
            "लाल वस्त्र पहनें और लक्ष्मी-गणेश की मूर्ति स्थापित करें।",
          mantra: "ॐ ह्रीं श्रीं क्लीं महालक्ष्म्यै नमः",
          image: "",
          audio: "",
          video: "",
        },
      ],
      sanskrit: [
        {
          order: 1,
          description: "गृहं स्वच्छं कुर्यात्। रङ्गावलीं रचयेत्।",
          mantra: "ॐ श्रीं महालक्ष्म्यै नमः",
          image: "",
          audio: "",
          video: "",
        },
      ],
      english: [
        {
          order: 1,
          description:
            "Clean the house and make rangoli. Draw Lakshmi's footprints.",
          mantra: "Om Shreem Mahalakshmyai Namah",
          image: "",
          audio: "",
          video: "",
        },
      ],
    },
    isActive: true,
    createdBy: null,
    views: 350,
    ratings: {
      average: 4.7,
      count: 60,
    },
  },
  {
    poojaType: "Durga Puja",
    poojaLanguage: "hindi",
    importance: {
      hindi:
        "माँ दुर्गा की पूजा शक्ति और साहस की प्राप्ति के लिए की जाती है। नवरात्रि में यह पूजा विशेष महत्व रखती है।",
      sanskrit:
        "दुर्गापूजा शक्तिसाहसप्राप्त्यर्थं कृतम्। नवरात्रौ विशेषं महत्त्वम् अस्ति।",
      english:
        "Durga Puja is performed to attain strength and courage. It holds special significance during Navratri.",
    },
    steps: {
      hindi: [
        {
          order: 1,
          description:
            "कलश स्थापना करें और माँ दुर्गा की प्रतिमा विराजमान करें।",
          mantra: "ॐ दुं दुर्गायै नमः",
          image: "",
          audio: "",
          video: "",
        },
        {
          order: 2,
          description: "नौ दिन तक व्रत रखें और प्रतिदिन आरती करें।",
          mantra:
            "सर्वमङ्गल मांगल्ये शिवे सर्वार्थसाधिके। शरण्ये त्र्यम्बके गौरी नारायणि नमोस्तुते।।",
          image: "",
          audio: "",
          video: "",
        },
      ],
      sanskrit: [],
      english: [
        {
          order: 1,
          description:
            "Establish kalash and install the idol of Goddess Durga.",
          mantra: "Om Dum Durgayai Namah",
          image: "",
          audio: "",
          video: "",
        },
      ],
    },
    isActive: true,
    createdBy: null,
    views: 280,
    ratings: {
      average: 4.9,
      count: 50,
    },
  },
  {
    poojaType: "Shiv Puja",
    poojaLanguage: "hindi",
    importance: {
      hindi:
        "भगवान शिव की पूजा मोक्ष और आध्यात्मिक उन्नति के लिए की जाती है। सोमवार को शिव पूजा का विशेष महत्व है।",
      sanskrit:
        "शिवपूजा मोक्षाय आध्यात्मिकोन्नत्यर्थं च कृतम्। सोमवासरे विशेषं महत्त्वम्।",
      english:
        "Shiv Puja is performed for liberation and spiritual progress. Monday holds special significance for Shiv worship.",
    },
    steps: {
      hindi: [
        {
          order: 1,
          description: "शिवलिंग को जल, दूध और बेलपत्र से स्नान कराएं।",
          mantra: "ॐ नमः शिवाय",
          image: "",
          audio: "",
          video: "",
        },
        {
          order: 2,
          description: "धतूरा, आक के फूल और भांग अर्पित करें।",
          mantra:
            "त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्।।",
          image: "",
          audio: "",
          video: "",
        },
      ],
      sanskrit: [
        {
          order: 1,
          description: "शिवलिङ्गं जलेन दुग्धेन बिल्वपत्रैश्च स्नापयेत्।",
          mantra: "ॐ नमः शिवाय",
          image: "",
          audio: "",
          video: "",
        },
      ],
      english: [
        {
          order: 1,
          description: "Bathe the Shivling with water, milk and bilva leaves.",
          mantra: "Om Namah Shivaya",
          image: "",
          audio: "",
          video: "",
        },
      ],
    },
    isActive: true,
    createdBy: null,
    views: 420,
    ratings: {
      average: 4.8,
      count: 75,
    },
  },
];

async function seedPoojas() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/sanskar"
    );
    console.log("Connected to MongoDB");

    // Find admin user (you need to have at least one admin user)
    const User = require("./models/User");
    let adminUser = await User.findOne({ role: "admin" });

    if (!adminUser) {
      // Create a default admin user if none exists
      adminUser = await User.create({
        name: "Admin",
        email: "admin@sanskaar.com",
        password: "admin123", // Change this!
        role: "admin",
        phone: "1234567890",
      });
      console.log("Created admin user");
    }

    // Set createdBy to admin user ID
    const poojasToInsert = samplePoojas.map((pooja) => ({
      ...pooja,
      createdBy: adminUser._id,
    }));

    // Clear existing poojas (optional - comment this out if you want to keep existing)
    // await Pooja.deleteMany({});
    // console.log('Cleared existing poojas');

    // Insert sample poojas
    const result = await Pooja.insertMany(poojasToInsert);
    console.log(`✅ Successfully added ${result.length} sample poojas!`);

    console.log("\nSample Poojas Added:");
    result.forEach((pooja, index) => {
      console.log(`${index + 1}. ${pooja.poojaType} (${pooja.poojaLanguage})`);
    });

    mongoose.connection.close();
    console.log("\n✅ Database seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seeder
seedPoojas();

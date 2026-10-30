const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Curriculum = require('../models/Curriculum');
const Lesson = require('../models/Lesson');
const LessonTranslation = require('../models/LessonTranslation');
const Assessment = require('../models/Assessment');
const Question = require('../models/Question');
const Response = require('../models/Response');
const Result = require('../models/Result');

dotenv.config();

const seed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/literacy_assistant';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Curriculum.deleteMany();
    await Lesson.deleteMany();
    await LessonTranslation.deleteMany();
    await Assessment.deleteMany();
    await Question.deleteMany();
    await Response.deleteMany();
    await Result.deleteMany();

    console.log('Cleaned old records successfully.');

    // 1. Create Users (Admin, Teacher, Learner)
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@literacy.com',
      password: 'admin123',
      age: 38,
      education: 'PhD in Linguistics',
      preferredLanguage: 'English',
      role: 'admin',
    });

    const teacherUser = await User.create({
      name: 'Anjali Sharma',
      email: 'teacher@literacy.com',
      password: 'teacher123',
      age: 34,
      education: 'Master of Education',
      preferredLanguage: 'Hindi',
      role: 'teacher',
    });

    const learnerUser = await User.create({
      name: 'Ramu Rao',
      email: 'learner@literacy.com',
      password: 'learner123',
      age: 62,
      education: 'None',
      preferredLanguage: 'Telugu',
      role: 'learner',
      xp: 40,
      streak: 2,
      hearts: 5,
    });

    console.log('Seed: Created Admin, Teacher, and Learner profiles.');

    // 2. Create Lessons
    // Lesson 1: Alphabets & Basic Sounds (Beginner)
    const lesson1 = await Lesson.create({
      title: 'Vowels & Pronunciation Basics',
      description: 'Learn the first group of sounds and letters in your chosen language.',
      difficulty: 'Beginner',
      estimatedDuration: 10,
      category: 'Alphabet',
      status: 'published',
    });

    // Translations for Lesson 1
    const trans1En = await LessonTranslation.create({
      lessonId: lesson1._id,
      language: 'English',
      title: 'Vowels & Sounds',
      description: 'Learn simple English vowel sounds.',
      learningMaterials: `
# English Vowels
The English alphabet has 26 letters. Out of these, 5 letters are **vowels**:
* **A** (Apple)
* **E** (Egg)
* **I** (Ink)
* **O** (Orange)
* **U** (Umbrella)

Consonants are all the other letters (e.g. B, C, D).
      `,
      exercises: [
        { question: 'Which letter is an English vowel?', options: ['B', 'P', 'E', 'Z'], correctAnswer: 'E' }
      ],
      status: 'published'
    });

    const trans1Hi = await LessonTranslation.create({
      lessonId: lesson1._id,
      language: 'Hindi',
      title: 'स्वर वर्ण और बुनियादी ध्वनियां',
      description: 'हिंदी स्वर और उनकी उच्चारण ध्वनियों को सीखें।',
      learningMaterials: `
# हिंदी स्वर वर्ण
हिंदी वर्णमाला में अ से अः तक स्वर वर्ण होते हैं। स्वर स्वतंत्र ध्वनियां हैं:
* **अ** (अक्षर)
* **आ** (आम)
* **इ** (इमली)
* **ई** (ईख)

ये स्वर शब्दों में मात्राओं का काम करते हैं।
      `,
      exercises: [
        { question: 'इनमें से कौन सा एक स्वर वर्ण है?', options: ['क', 'अ', 'ख', 'ग'], correctAnswer: 'अ' }
      ],
      status: 'published'
    });

    const trans1Ta = await LessonTranslation.create({
      lessonId: lesson1._id,
      language: 'Tamil',
      title: 'உயிரெழுத்துக்கள் அறிமுகம்',
      description: 'தமிழ் மொழியின் முதல் ஒலி வடிவங்களைக் கற்கவும்.',
      learningMaterials: `
# தமிழ் உயிரெழுத்துக்கள்
தமிழ் மொழியின் உயிர்நாடியாக விளங்குவது உயிரெழுத்துக்கள் 12 ஆகும்:
* **அ** (அம்மா)
* **ஆ** (ஆடு)
* **இ** (இலை)
* **ஈ** (ஈட்டி)

இவை பிற எழுத்துக்களுடன் இணைந்து உயிர்மெய் எழுத்துக்களை உருவாக்குகிறது.
      `,
      exercises: [
        { question: 'உயிரெழுத்துக்களில் முதல் எழுத்து எது?', options: ['ஆ', 'அ', 'இ', 'உ'], correctAnswer: 'அ' }
      ],
      status: 'published'
    });

    const trans1Te = await LessonTranslation.create({
      lessonId: lesson1._id,
      language: 'Telugu',
      title: 'తెలుగు అచ్చులు పరిచయం',
      description: 'తెలుగు భాషలోని మొదటి అక్షరాలను మరియు శబ్దాలను నేర్చుకోండి.',
      learningMaterials: `
# తెలుగు అచ్చులు
తెలుగు వర్ణమాలలో మొదటి భాగం అచ్చులు. ఇవి స్వతంత్రంగా పలికే అక్షరాలు:
* **అ** (అమ్మ)
* **ఆ** (ఆవు)
* **ఇ** (ఇల్లు)
* **ఈ** (ఈల)

తెలుగు భాషలో అచ్చులు చాలా ముఖ్యమైనవి.
      `,
      exercises: [
        { question: 'కింది వాటిలో అచ్చు అక్షరం ఏది?', options: ['క', 'చ', 'అ', 'ట'], correctAnswer: 'అ' }
      ],
      status: 'published'
    });

    lesson1.translations.push(trans1En._id, trans1Hi._id, trans1Ta._id, trans1Te._id);
    await lesson1.save();


    // Lesson 2: Word Formations (Intermediate)
    const lesson2 = await Lesson.create({
      title: 'Sentence Building Basics',
      description: 'Learn to group words into clean, readable sentences.',
      difficulty: 'Intermediate',
      estimatedDuration: 15,
      category: 'Sentence Building',
      status: 'published',
    });

    const trans2En = await LessonTranslation.create({
      lessonId: lesson2._id,
      language: 'English',
      title: 'Simple Sentences',
      description: 'Learn simple subject-verb structures.',
      learningMaterials: `
# Building Sentences
To form a sentence, we join a **Subject** (who is acting) and a **Verb** (what is happening):
* **The cat runs.** (Subject: Cat | Verb: Runs)
* **We write words.** (Subject: We | Verb: Write)

Proper spacing and order makes sentences readable.
      `,
      exercises: [
        { question: 'Identify the verb in: "The boy sleeps."', options: ['Boy', 'The', 'Sleeps', 'House'], correctAnswer: 'Sleeps' }
      ],
      status: 'published'
    });

    const trans2Hi = await LessonTranslation.create({
      lessonId: lesson2._id,
      language: 'Hindi',
      title: 'सरल वाक्य निर्माण',
      description: 'शब्दों को जोड़कर सरल और अर्थपूर्ण वाक्य बनाना सीखें।',
      learningMaterials: `
# वाक्य रचना
हिंदी में वाक्य की सामान्य रचना **कर्ता + कर्म + क्रिया** होती है:
* **राम पुस्तक पढ़ता है।** (राम = कर्ता | पढ़ना = क्रिया)
* **लड़का दौड़ता है।**

वाक्य के अंत में पूर्ण विराम (।) लगाया जाता है।
      `,
      exercises: [
        { question: 'वाक्य "राम खाता है" में क्रिया क्या है?', options: ['राम', 'है', 'खाता', 'घर'], correctAnswer: 'खाता' }
      ],
      status: 'published'
    });

    const trans2Ta = await LessonTranslation.create({
      lessonId: lesson2._id,
      language: 'Tamil',
      title: 'எளிய வாக்கியங்கள் அமைத்தல்',
      description: 'சொற்களை இணைத்து தெளிவான வாக்கியங்களை உருவாக்கக் கற்றுக்கொள்ளுங்கள்.',
      learningMaterials: `
# வாக்கியம் அமைப்போம்
எழுவாய், செயப்படுபொருள், பயனிலை ஆகியவற்றை இணைத்தால் வாக்கியங்கள் உருவாகும்:
* **நான் பாடம் எழுதுகிறேன்.** (எழுவாய்: நான் | பயனிலை: எழுதுகிறேன்)
* **ஆடு புல் மேய்கிறது.**
      `,
      exercises: [
        { question: '"நான் படிக்கிறேன்" என்பதில் உள்ள பயனிலை எது?', options: ['நான்', 'படிக்கிறேன்', 'புத்தகம்', 'பள்ளி'], correctAnswer: 'படிக்கிறேன்' }
      ],
      status: 'published'
    });

    const trans2Te = await LessonTranslation.create({
      lessonId: lesson2._id,
      language: 'Telugu',
      title: 'సరళ వాక్యాల నిర్మాణం',
      description: 'పదాలను కలుపుతూ సరళమైన వాక్యాలను రాయడం నేర్చుకోండి.',
      learningMaterials: `
# వాక్య నిర్మాణం
తెలుగులో ఒక పూర్తి వాక్యం ఏర్పడటానికి కర్త, కర్మ మరియు క్రియ ఉపయోగపడతాయి:
* **రాము బడికి వెళ్తున్నాడు.** (క్రియ: వెళ్తున్నాడు)
* **ఆవు గడ్డి మేస్తుంది.** (కర్త: ఆవు)
      `,
      exercises: [
        { question: '"గోపి చదువుతున్నాడు" లో క్రియ ఏది?', options: ['గోపి', 'చదువుతున్నాడు', 'పుస్తకం', 'బడి'], correctAnswer: 'చదువుతున్నాడు' }
      ],
      status: 'published'
    });

    lesson2.translations.push(trans2En._id, trans2Hi._id, trans2Ta._id, trans2Te._id);
    await lesson2.save();

    // 3. Create Pathways Curriculum
    const curriculum = await Curriculum.create({
      title: 'Core Literacy Pathway',
      description: 'A structured roadmap designed to build complete literacy confidence from sounds to reading stories.',
      difficulty: 'Beginner',
      order: 1,
      status: 'published',
      lessons: [lesson1._id, lesson2._id],
    });

    console.log('Seed: Created Core Pathways and connected seeded lessons.');

    // 4. Create Standard Assessments & Questions
    const assessment = await Assessment.create({
      title: 'Foundational Sound Review',
      description: 'Evaluate your sound recognition and letter structure understanding.',
      type: 'Comprehension',
      difficulty: 'Beginner',
      status: 'published',
      questions: [],
    });

    const q1 = await Question.create({
      assessmentId: assessment._id,
      type: 'Reading',
      text: "Identify the letter in English which is a vowel sound:",
      options: ['F', 'P', 'A', 'N'],
      correctAnswer: 'A',
      difficulty: 'Beginner',
      points: 20,
    });

    const q2 = await Question.create({
      assessmentId: assessment._id,
      type: 'Comprehension',
      text: "Read: 'The white cow gives sweet milk.' Question: What color is the cow?",
      options: ['Red', 'Black', 'Brown', 'White'],
      correctAnswer: 'White',
      difficulty: 'Beginner',
      points: 20,
    });

    assessment.questions.push(q1._id, q2._id);
    await assessment.save();

    console.log('Seed: Created Assessments and connected questions.');

    console.log('Database seeded successfully with multi-lingual pathways!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seed();

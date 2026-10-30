const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Lesson = require('./models/Lesson');
const Curriculum = require('./models/Curriculum');
const { generateExercise } = require('./utils/curriculumGenerator');

dotenv.config({ path: './.env' });

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/literacy_assistant', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected.');

        // Clear existing
        await Lesson.deleteMany();
        await Curriculum.deleteMany();
        console.log('Cleared existing lessons and curricula.');

        const languages = ['English', 'Tamil', 'Hindi', 'Kannada', 'Telugu', 'Malayalam'];

        const levels = [
            {
                name: 'Beginner',
                units: [
                    'Alphabet', 'Consonants', 'Phonics', 'Greetings', 'Numbers',
                    'Colours', 'Common Verbs', 'Family', 'Food', 'Time',
                    'Daily Objects', 'Directions', 'Simple Sentences', 'Reading Practice', 'Beginner Final Challenge'
                ]
            },
            {
                name: 'Intermediate',
                units: [
                    'Sentence Formation', 'Present Tense', 'Past Tense', 'Future Tense', 'Question Formation',
                    'Daily Conversation', 'Shopping', 'School', 'Travel', 'Workplace',
                    'Paragraph Reading', 'Listening Practice', 'Writing Practice', 'Conversation Practice', 'Intermediate Final Challenge'
                ]
            },
            {
                name: 'Advanced',
                units: [
                    'Advanced Grammar', 'Professional Communication', 'Business Vocabulary', 'Essay Writing', 'Formal Speaking',
                    'Public Speaking', 'Email Writing', 'Reading Articles', 'News', 'Literature',
                    'Idioms', 'Interviews', 'Debates', 'AI Conversation', 'Advanced Certification Challenge'
                ]
            }
        ];

        // Ensure efficient bulk insertion for 5400 lessons
        for (const lang of languages) {
            console.log(`Generating curriculum for ${lang}...`);

            const allLessonIds = [];

            for (const level of levels) {
                let unitNumber = 1;
                for (const unitTitle of level.units) {

                    const lessonsToInsert = [];
                    for (let activityNumber = 1; activityNumber <= 20; activityNumber++) {

                        let activityType = 'multiple_choice';
                        if (activityNumber % 5 === 1) activityType = 'learn_word'; // New word intro!
                        else if (activityNumber % 5 === 2) activityType = 'listening';
                        else if (activityNumber % 5 === 3) activityType = 'listen_repeat';
                        else if (activityNumber % 5 === 4) activityType = 'speaking';
                        else activityType = 'word_match';

                        const exerciseData = generateExercise(lang, level.name, unitTitle, activityType, activityNumber);

                        lessonsToInsert.push({
                            title: `${unitTitle} - Activity ${activityNumber}`,
                            description: `Activity ${activityNumber} for ${unitTitle} in ${lang}`,
                            difficulty: level.name,
                            estimatedDuration: 5,
                            category: unitTitle,
                            language: lang,
                            unit: unitNumber,
                            activityNumber: activityNumber,
                            order: (unitNumber - 1) * 20 + activityNumber,
                            status: 'published',
                            vocabulary: [
                                {
                                    word: exerciseData.correctAnswer,
                                    translation: `(Translation of ${exerciseData.correctAnswer})`,
                                    pronunciation: `(${exerciseData.correctAnswer} sound)`
                                }
                            ],
                            exercises: [exerciseData]
                        });
                    }

                    const insertedLessons = await Lesson.insertMany(lessonsToInsert);
                    allLessonIds.push(...insertedLessons.map(l => l._id));

                    unitNumber++;
                }
            }

            // Create a wrapper Curriculum object for the language
            await Curriculum.create({
                title: `${lang} Master Curriculum`,
                description: `Complete ${lang} literacy learning platform. From Beginner to Advanced.`,
                language: lang,
                difficulty: 'Beginner', // starts at beginner
                order: languages.indexOf(lang) + 1,
                status: 'published',
                lessons: allLessonIds
            });
        }

        console.log('Seeded completely structured curricula for all languages successfully.');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();

// Real curriculum content dictionary to dynamically generate structured exercises

const languageLexicons = {
    English: {
        Beginner: {
            'Alphabet': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
            'Vowels': ['A', 'E', 'I', 'O', 'U'],
            'Consonants': ['B', 'C', 'D', 'F', 'G'],
            'Phonics': ['cat', 'bat', 'mat', 'sat'],
            'Greetings': ['Hello', 'Hi', 'Good Morning', 'Good Night'],
            'Numbers': ['One', 'Two', 'Three', 'Four', 'Five'],
            'Colours': ['Red', 'Blue', 'Green', 'Yellow', 'Black'],
            'Daily Verbs': ['Eat', 'Sleep', 'Run', 'Walk', 'Read'],
            'Family': ['Mother', 'Father', 'Brother', 'Sister'],
            'Food': ['Apple', 'Banana', 'Rice', 'Water'],
            'Time': ['Day', 'Night', 'Morning', 'Evening'],
            'Directions': ['Left', 'Right', 'Up', 'Down'],
            'Common Objects': ['Book', 'Pen', 'Chair', 'Table'],
            'Simple Sentences': ['I eat apple', 'She runs fast', 'He is tall'],
            'Beginner Final Challenge': ['Hello Mother', 'Eat Apple', 'Good Morning']
        }
    },
    Tamil: {
        Beginner: {
            'Uyir Ezhuthukkal': ['அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ'],
            'Mei Ezhuthukkal': ['க்', 'ங்', 'ச்', 'ஞ்', 'ட்', 'ண்'],
            'Varisai': ['க', 'கா', 'கி', 'கீ'],
            'Greetings': ['வணக்கம்', 'நன்றி', 'காலை வணக்கம்'],
            'Numbers': ['ஒன்று', 'இரண்டு', 'மூன்று', 'நான்கு'],
            'Colours': ['சிவப்பு', 'நீலம்', 'பச்சை', 'மஞ்சள்'],
            'Daily Verbs': ['சாப்பிடு', 'தூங்கு', 'ஓடு', 'நட', 'படி'],
            'Family': ['அம்மா', 'அப்பா', 'அண்ணன்', 'தங்கை'],
            'Food': ['ஆப்பிள்', 'வாழைப்பழம்', 'சாதம்', 'தண்ணீர்'],
            'Time': ['பகல்', 'இரவு', 'காலை', 'மாலை'],
            'Directions': ['இடது', 'வலது', 'மேலே', 'கீழே'],
            'Common Objects': ['புத்தகம்', 'பேனா', 'நாற்காலி', 'மேஜை'],
            'Simple Sentences': ['நான் ஆப்பிள் சாப்பிடுகிறேன்', 'அவள் வேகமாக ஓடுகிறாள்'],
            'Reading Basics': ['மரம்', 'படம்', 'நாய்'],
            'Beginner Final Challenge': ['காலை வணக்கம் அம்மா', 'சாதம் சாப்பிடு']
        }
    },
    Hindi: {
        Beginner: {
            'Swar': ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ'],
            'Vyanjan': ['क', 'ख', 'ग', 'घ', 'च', 'छ'],
            'Matra': ['का', 'कि', 'की', 'कु'],
            'Greetings': ['नमस्ते', 'धन्यवाद', 'शुभ प्रभात'],
            'Numbers': ['एक', 'दो', 'तीन', 'चार'],
            'Colours': ['लाल', 'नीला', 'हरा', 'पीला'],
            'Daily Verbs': ['खाना', 'सोना', 'दौड़ना', 'चलना', 'पढ़ना'],
            'Family': ['माँ', 'पिता', 'भाई', 'बहन'],
            'Food': ['सेब', 'केला', 'चावल', 'पानी'],
            'Time': ['दिन', 'रात', 'सुबह', 'शाम'],
            'Directions': ['बायें', 'दायें', 'ऊपर', 'नीचे'],
            'Common Objects': ['किताब', 'कलम', 'कुर्सी', 'मेज'],
            'Simple Sentences': ['मैं सेब खाता हूँ', 'वह तेज दौड़ती है'],
            'Reading Basics': ['पेड़', 'चित्र', 'कुत्ता'],
            'Beginner Final Challenge': ['नमस्ते माँ', 'चावल खाना']
        }
    },
    Kannada: {
        Beginner: {
            'Swaragalu': ['ಅ', 'ಆ', 'ಇ', 'ಈ', 'ಉ', 'ಊ'],
            'Vyanjanagalu': ['ಕ', 'ಖ', 'ಗ', 'ಘ', 'ಚ', 'ಛ'],
            'Gunintagalu': ['ಕಾ', 'ಕಿ', 'ಕೀ', 'ಕು'],
            'Greetings': ['ನಮಸ್ಕಾರ', 'ಧನ್ಯವಾದ', 'ಶುಭೋದಯ'],
            'Numbers': ['ಒಂದು', 'ಎರಡು', 'ಮೂರು', 'ನಾಲ್ಕು'],
            'Colours': ['ಕೆಂಪು', 'ನೀಲಿ', 'ಹಸಿರು', 'ಹಳದಿ'],
            'Daily Verbs': ['ತಿನ್ನು', 'ಮಲಗು', 'ಓಡು', 'ನಡಿ', 'ಓದು'],
            'Family': ['ಅಮ್ಮ', 'ಅಪ್ಪ', 'ಅಣ್ಣ', 'ತಂಗಿ'],
            'Food': ['ಸೇಬು', 'ಬಾಳೆಹಣ್ಣು', 'ಅನ್ನ', 'ನೀರು'],
            'Time': ['ಹಗಲು', 'ರಾತ್ರಿ', 'ಬೆಳಿಗ್ಗೆ', 'ಸಂಜೆ'],
            'Directions': ['ಎಡ', 'ಬಲ', 'ಮೇಲೆ', 'ಕೆಳಗೆ'],
            'Common Objects': ['ಪುಸ್ತಕ', 'ಪೆನ್', 'ಕುರ್ಚಿ', 'ಮೇಜು'],
            'Simple Sentences': ['ನಾನು ಸೇಬು ತಿನ್ನುತ್ತೇನೆ', 'ಅವಳು ವೇಗವಾಗಿ ಓಡುತ್ತಾಳೆ'],
            'Reading Basics': ['ಮರ', 'ಚಿತ್ರ', 'ನಾಯಿ'],
            'Beginner Final Challenge': ['ನಮಸ್ಕಾರ ಅಮ್ಮ', 'ಅನ್ನ ತಿನ್ನು']
        }
    },
    Telugu: {
        Beginner: {
            'Achulu': ['అ', 'ఆ', 'ఇ', 'ఈ', 'ఉ', 'ఊ'],
            'Hallulu': ['క', 'ఖ', 'గ', 'ఘ', 'చ', 'ఛ'],
            'Guninthalu': ['కా', 'కి', 'కీ', 'కు'],
            'Greetings': ['నమస్కారం', 'ధన్యవాదాలు', 'శుభోదయం'],
            'Numbers': ['ఒకటి', 'రెండు', 'మూడు', 'నాలుగు'],
            'Colours': ['ఎరుపు', 'నీలం', 'ఆకుపచ్చ', 'పసుపు'],
            'Daily Verbs': ['తిను', 'నిద్రపో', 'పరుగెత్తు', 'నడువు', 'చదువు'],
            'Family': ['అమ్మ', 'నాన్న', 'అన్న', 'చెల్లి'],
            'Food': ['ఆపిల్', 'అరటిపండు', 'అన్నం', 'నీరు'],
            'Time': ['పగలు', 'రాత్రి', 'ఉదయం', 'సాయంత్రం'],
            'Directions': ['ఎడమ', 'కుడి', 'పైన', 'కింద'],
            'Common Objects': ['పుస్తకం', 'పెన్', 'కుర్చీ', 'బల్ల'],
            'Simple Sentences': ['నేను ఆపిల్ తింటాను', 'ఆమె వేగంగా పరుగెత్తుతుంది'],
            'Reading Basics': ['చెట్టు', 'బొమ్మ', 'కుక్క'],
            'Beginner Final Challenge': ['నమస్కారం అమ్మ', 'అన్నం తిను']
        }
    },
    Malayalam: {
        Beginner: {
            'Swarangal': ['അ', 'ആ', 'ഇ', 'ഈ', 'ഉ', 'ഊ'],
            'Vyanjanangal': ['ക', 'ഖ', 'ഗ', 'ഘ', 'ച', 'ഛ'],
            'Chinnangal': ['കാ', 'കി', 'കീ', 'കു'],
            'Greetings': ['നമസ്കാരം', 'നന്ദി', 'സുപ്രഭാതം'],
            'Numbers': ['ഒന്ന്', 'രണ്ട്', 'മൂന്ന്', 'നാല്'],
            'Colours': ['ചുവപ്പ്', 'നീല', 'പച്ച', 'മഞ്ഞ'],
            'Daily Verbs': ['തിന്നുക', 'ഉറങ്ങുക', 'ഓടുക', 'നടക്കുക', 'വായിക്കുക'],
            'Family': ['അമ്മ', 'അച്ഛൻ', 'ജ്യേഷ്ഠൻ', 'അനുജത്തി'],
            'Food': ['ആപ്പിൾ', 'വാഴപ്പഴം', 'ചോറ്', 'വെള്ളം'],
            'Time': ['പകൽ', 'രാത്രി', 'രാവിലെ', 'വൈകുന്നേരം'],
            'Directions': ['ഇടത്ത്', 'വലത്ത്', 'മുകളിൽ', 'താഴെ'],
            'Common Objects': ['പുസ്തകം', 'പേന', 'കസേര', 'മേശ'],
            'Simple Sentences': ['ഞാൻ ആപ്പിൾ തിന്നുന്നു', 'അവൾ വേഗത്തിൽ ഓടുന്നു'],
            'Reading Basics': ['മരം', 'ചിത്രം', 'നായ'],
            'Beginner Final Challenge': ['നമസ്കാരം അമ്മ', 'ചോറ് തിന്നുക']
        }
    }
};

const generateExercise = (language, level, unitTitle, activityType, activityNumber) => {
    // Determine the lexicon target
    let words = ['Apple', 'Book', 'Tree']; // fallback
    if (languageLexicons[language] && languageLexicons[language][level] && languageLexicons[language][level][unitTitle]) {
        words = languageLexicons[language][level][unitTitle];
    } else if (languageLexicons['English'][level] && languageLexicons['English'][level][unitTitle]) {
        words = languageLexicons['English'][level][unitTitle];
    } else {
        // Advanced fallback, generic sentence extraction for now
        words = ['Business', 'Professional', 'Meeting', 'Finance', 'Growth'];
    }

    const word = words[activityNumber % words.length];

    // Vary options
    const options = [word, words[(activityNumber + 1) % words.length] || 'Option B', words[(activityNumber + 2) % words.length] || 'Option C'];

    // Shuffle options
    options.sort(() => Math.random() - 0.5);

    let question = `Translate this into your native language: ${word}`;

    if (activityType === 'listening') {
        question = `Listen and select the word: ${word}`;
    } else if (activityType === 'speaking') {
        question = `Read the word aloud: ${word}`;
    } else if (activityType === 'word_match') {
        question = `Match the correct meaning for: ${word}`;
    } else if (activityType === 'sentence_builder') {
        question = `Construct a sentence using: ${word} `;
    }

    return {
        type: activityType,
        question: question,
        options: options,
        correctAnswer: word
    };
};

module.exports = { generateExercise };

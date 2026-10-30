import React, { createContext, useState, useEffect } from 'react';

export const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [fontSize, setFontSizeState] = useState(localStorage.getItem('accessibility-font-size') || 'normal');
  const [highContrast, setHighContrastState] = useState(localStorage.getItem('accessibility-high-contrast') === 'true');

  const setFontSize = (size) => {
    setFontSizeState(size);
    localStorage.setItem('accessibility-font-size', size);
  };

  const toggleHighContrast = () => {
    setHighContrastState((prev) => {
      const next = !prev;
      localStorage.setItem('accessibility-high-contrast', String(next));
      return next;
    });
  };

  // 1. Text-To-Speech (TTS) Read Aloud Engine
  const speak = (text, lang = 'English') => {
    if (!('speechSynthesis' in window)) {
      console.warn('Text-to-Speech not supported in this browser.');
      return;
    }

    // Cancel any active speech first
    window.speechSynthesis.cancel();

    // Map language names to BCP-47 tags
    const langMap = {
      English: 'en-US',
      Hindi: 'hi-IN',
      Tamil: 'ta-IN',
      Telugu: 'te-IN',
      Kannada: 'kn-IN',
      Malayalam: 'ml-IN',
    };

    const targetLang = langMap[lang] || 'en-US';
    
    // Clean markdown text before speaking
    const cleanText = text
      .replace(/[#*`_~-]/g, '') // remove headings, bold, bullet points
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = targetLang;
    utterance.rate = fontSize === 'extra-large' ? 0.75 : 0.85; // Speak slower for older adults

    // Attempt to pick a suitable native voice matching the language code
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang === targetLang || v.lang.startsWith(targetLang.split('-')[0]));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  // 2. Speech-To-Text (STT) Listen Engine for Voice Pronunciation Exercises
  const getSpeechRecognizer = (lang = 'English') => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser.');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    const langMap = {
      English: 'en-US',
      Hindi: 'hi-IN',
      Tamil: 'ta-IN',
      Telugu: 'te-IN',
      Kannada: 'kn-IN',
      Malayalam: 'ml-IN',
    };

    recognition.lang = langMap[lang] || 'en-US';
    return recognition;
  };

  // Effect to apply styles globally to body/root for font sizing and high-contrast
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply font-size multipliers
    if (fontSize === 'large') {
      root.style.setProperty('--global-font-scale', '1.2');
    } else if (fontSize === 'extra-large') {
      root.style.setProperty('--global-font-scale', '1.4');
    } else {
      root.style.setProperty('--global-font-scale', '1.0');
    }

    // Apply high-contrast class helper
    if (highContrast) {
      root.classList.add('high-contrast-active');
    } else {
      root.classList.remove('high-contrast-active');
    }
  }, [fontSize, highContrast]);

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        setFontSize,
        highContrast,
        toggleHighContrast,
        speak,
        getSpeechRecognizer,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

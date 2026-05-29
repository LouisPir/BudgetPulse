import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './languages/en';

export type Language = 'fr' | 'en';

const languages: Record<Exclude<Language, 'fr'>, Record<string, string>> = { en };

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  tr: (key: string, defaultFr: string) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'fr',
  setLanguage: () => {},
  tr: (_key, defaultFr) => defaultFr,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('fr');

  useEffect(() => {
    AsyncStorage.getItem('language').then((saved) => {
      if (saved && (saved === 'fr' || saved in languages)) {
        setLanguageState(saved as Language);
      }
    });
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem('language', lang);
  };

  const tr = (key: string, defaultFr: string): string => {
    if (language === 'fr') return defaultFr;
    return languages[language as Exclude<Language, 'fr'>]?.[key] ?? defaultFr;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, tr }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
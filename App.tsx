import React from 'react';
import { ThemeProvider } from './src/context/ThemeContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { Navigation } from './src/navigation';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Navigation />
      </LanguageProvider>
    </ThemeProvider>
  );
}
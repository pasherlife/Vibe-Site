import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
];

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

  const handleLanguageChange = (language: typeof languages[0]) => {
    setSelectedLanguage(language);
    setIsOpen(false);
    // In a real app, you would update the UI language here
    document.documentElement.lang = language.code;
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 w-9"
      >
        <Globe className="h-5 w-5" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background border z-50">
          <div className="p-2">
            {languages.map((language) => (
              <Button
                key={language.code}
                variant="ghost"
                className={`w-full justify-start gap-2 ${selectedLanguage.code === language.code ? 'bg-muted' : ''}`}
                onClick={() => handleLanguageChange(language)}
              >
                <span>{language.flag}</span>
                <span>{language.name}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

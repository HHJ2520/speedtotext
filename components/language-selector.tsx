"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Languages } from "lucide-react"

interface LanguageSelectorProps {
  currentLanguage: string
  onLanguageChange: (language: string) => void
}

export function LanguageSelector({ currentLanguage, onLanguageChange }: LanguageSelectorProps) {
  const languages = [
    { code: "th-TH", name: "ไทย", flag: "🇹🇭" },
    { code: "en-US", name: "English", flag: "🇺🇸" },
  ]

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-0">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Languages className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">ภาษา / Language:</span>
          <div className="flex gap-2">
            {languages.map((lang) => (
              <Button
                key={lang.code}
                variant={currentLanguage === lang.code ? "default" : "outline"}
                size="sm"
                onClick={() => onLanguageChange(lang.code)}
                className="text-xs"
              >
                {lang.flag} {lang.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

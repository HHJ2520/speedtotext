"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MicOff, Volume2, Loader2, Settings } from "lucide-react"

// Language Selector Component
const LanguageSelector = ({ currentLanguage, onLanguageChange }: { currentLanguage: string, onLanguageChange: (lang: string) => void }) => {
  const languages = [
    { code: "th-TH", name: "ไทย", flag: "🇹🇭" },
    { code: "en-US", name: "English", flag: "🇺🇸" },
    { code: "zh-CN", name: "中文", flag: "🇨🇳" },
    { code: "ja-JP", name: "日本語", flag: "🇯🇵" },
  ]

  return (
    <div className="flex justify-center">
      <div className="flex bg-white rounded-lg shadow-sm border p-1 gap-1">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${currentLanguage === lang.code
                ? "bg-blue-500 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
              }
            `}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  )
}

// TTS Controls Component
const TTSControls = ({ 
  speed, 
  pitch, 
  volume, 
  onSpeedChange, 
  onPitchChange, 
  onVolumeChange 
}: {
  speed: number
  pitch: number
  volume: number
  onSpeedChange: (value: number) => void
  onPitchChange: (value: number) => void
  onVolumeChange: (value: number) => void
}) => {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-medium text-gray-900 flex items-center gap-2">
        <Settings className="w-4 h-4" />
        การตั้งค่าเสียงพูด
      </h4>
      
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            ความเร็ว: {speed.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={speed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            ระดับเสียง: {pitch.toFixed(1)}
          </label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={pitch}
            onChange={(e) => onPitchChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            ระดับเสียง: {Math.round(volume * 100)}%
          </label>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.1"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          onSpeedChange(1.0)
          onPitchChange(1.0)
          onVolumeChange(0.8)
        }}
        className="w-full"
      >
        รีเซ็ตค่าเริ่มต้น
      </Button>
    </div>
  )
}

interface AppState {
  // Basic states
  isListening: boolean
  isProcessing: boolean
  isSpeaking: boolean
  
  // Content
  transcribedText: string
  response: string
  error: string
  
  // Settings
  language: string
  ttsSpeed: number
  ttsPitch: number
  ttsVolume: number
  showTTSControls: boolean
}

declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
    SpeechSynthesisUtterance: any
    SpeechSynthesis: any
  }
}

export default function VoiceCommandApp() {
  const [state, setState] = useState<AppState>({
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    transcribedText: "",
    response: "",
    error: "",
    language: "th-TH",
    ttsSpeed: 1.5,
    ttsPitch: 1.0,
    ttsVolume: 0.8,
    showTTSControls: false,
  })

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  const API_ENDPOINT = "http://localhost:5678/webhook/voice-command"

  // Initialize Speech APIs
  useEffect(() => {
    // Speech Recognition
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = state.language

      recognitionRef.current.onstart = () => {
        setState(prev => ({ ...prev, isListening: true, error: "" }))
      }

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = ""
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }

        if (finalTranscript) {
          setState(prev => ({ 
            ...prev, 
            transcribedText: finalTranscript, 
            isListening: false, 
            isProcessing: true 
          }))
          sendToAPI(finalTranscript)
        }
      }

      recognitionRef.current.onerror = (event) => {
        setState(prev => ({ 
          ...prev, 
          isListening: false, 
          error: `ข้อผิดพลาด: ${event.error}` 
        }))
      }

      recognitionRef.current.onend = () => {
        setState(prev => ({ ...prev, isListening: false }))
      }
    }

    // Speech Synthesis
    if ("speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [state.language])

  // Start Listening
  const startListening = () => {
    // ตรวจสอบเงื่อนไข
    if (!recognitionRef.current || state.isListening || state.isProcessing || state.isSpeaking) {
      return
    }

    // หยุดการพูดก่อน
    if (synthRef.current && state.isSpeaking) {
      synthRef.current.cancel()
      setState(prev => ({ ...prev, isSpeaking: false }))
    }

    // รีเซ็ตข้อมูล
    setState(prev => ({ 
      ...prev, 
      transcribedText: "", 
      response: "", 
      error: "" 
    }))

    // เริ่มฟัง
    try {
      recognitionRef.current.lang = state.language
      recognitionRef.current.start()
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: "ไม่สามารถเริ่มการฟังได้" 
      }))
    }
  }

  // Stop Listening
  const stopListening = () => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop()
    }
  }

  // Send to API
  const sendToAPI = async (text: string) => {
    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: text,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      const responseText = data.message || data.response || "ประมวลผลเสร็จสิ้น"

      setState(prev => ({ 
        ...prev, 
        response: responseText, 
        isProcessing: false 
      }))

      // รอเล็กน้อยแล้วพูด
      setTimeout(() => {
        speakText(responseText)
      }, 500)

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : "เกิดข้อผิดพลาด", 
        isProcessing: false 
      }))
    }
  }

  // Speak Text
  const speakText = (text: string) => {
    if (!synthRef.current || !text) return

    // หยุดการพูดเก่า
    synthRef.current.cancel()

    // หยุดการฟังถ้ายังฟังอยู่
    if (state.isListening && recognitionRef.current) {
      recognitionRef.current.stop()
    }

    setState(prev => ({ 
      ...prev, 
      isSpeaking: true, 
      isListening: false 
    }))

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = state.ttsSpeed
    utterance.pitch = state.ttsPitch
    utterance.volume = state.ttsVolume
    utterance.lang = state.language

    utterance.onend = () => {
      setState(prev => ({ ...prev, isSpeaking: false }))
    }

    utterance.onerror = () => {
      setState(prev => ({ 
        ...prev, 
        isSpeaking: false, 
        error: "การพูดล้มเหลว" 
      }))
    }

    synthRef.current.speak(utterance)
  }

  // Status Text
  const getStatusText = () => {
    if (state.isListening) return "กำลังฟัง..."
    if (state.isProcessing) return "กำลังประมวลผล..."
    if (state.isSpeaking) return "กำลังพูด..."
    return "คลิกไมโครโฟนเพื่อเริ่มต้น"
  }

  // Status Color
  const getStatusColor = () => {
    if (state.error) return "text-red-600"
    if (state.isListening) return "text-blue-600"
    if (state.isProcessing || state.isSpeaking) return "text-orange-600"
    if (state.response) return "text-green-600"
    return "text-gray-600"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Voice Command | คำสั่งเสียง</h1>
          <p className="text-gray-600">พูดคำสั่งของคุณและรับการตอบกลับจาก AI</p>
        </div>

        {/* Language Selector */}
        <LanguageSelector 
          currentLanguage={state.language} 
          onLanguageChange={(lang) => setState(prev => ({ ...prev, language: lang }))} 
        />

        {/* TTS Controls Toggle */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setState(prev => ({ ...prev, showTTSControls: !prev.showTTSControls }))}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            {state.showTTSControls ? 'ซ่อนการตั้งค่าเสียง' : 'แสดงการตั้งค่าเสียง'}
          </Button>
        </div>

        {/* TTS Controls */}
        {state.showTTSControls && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <TTSControls
                speed={state.ttsSpeed}
                pitch={state.ttsPitch}
                volume={state.ttsVolume}
                onSpeedChange={(speed) => setState(prev => ({ ...prev, ttsSpeed: speed }))}
                onPitchChange={(pitch) => setState(prev => ({ ...prev, ttsPitch: pitch }))}
                onVolumeChange={(volume) => setState(prev => ({ ...prev, ttsVolume: volume }))}
              />
            </CardContent>
          </Card>
        )}

        {/* Main Interface */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 space-y-8">
            
            {/* Microphone Button */}
            <div className="flex flex-col items-center gap-4">
              <Button
                onClick={state.isListening ? stopListening : startListening}
                disabled={state.isProcessing || state.isSpeaking}
                size="lg"
                className={`
                  w-24 h-24 rounded-full transition-all duration-300 transform hover:scale-105
                  ${state.isListening ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"}
                  ${(state.isProcessing || state.isSpeaking) ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {state.isListening ? <MicOff className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
              </Button>

              {/* Stop Speaking Button */}
              {state.isSpeaking && (
                <Button
                  onClick={() => {
                    if (synthRef.current) {
                      synthRef.current.cancel()
                      setState(prev => ({ ...prev, isSpeaking: false }))
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  หยุดการพูด
                </Button>
              )}
            </div>

            {/* Status */}
            <div className="text-center">
              <div className={`text-lg font-medium ${getStatusColor()} flex items-center justify-center gap-2`}>
                {(state.isProcessing || state.isSpeaking) && <Loader2 className="w-4 h-4 animate-spin" />}
                {state.isSpeaking && <Volume2 className="w-4 h-4" />}
                {getStatusText()}
              </div>
            </div>

            {/* Transcribed Text */}
            {state.transcribedText && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-blue-800 mb-2">คุณพูดว่า:</div>
                  <div className="text-blue-900">{state.transcribedText}</div>
                </CardContent>
              </Card>
            )}

            {/* Response */}
            {state.response && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
                    การตอบกลับ:
                    {state.isSpeaking && <Volume2 className="w-4 h-4 animate-pulse" />}
                  </div>
                  <div className="text-green-900">{state.response}</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => speakText(state.response)}
                    disabled={state.isSpeaking}
                    className="mt-2 flex items-center gap-2"
                  >
                    <Volume2 className="w-4 h-4" />
                    {state.isSpeaking ? 'กำลังพูด...' : 'ทดสอบเสียง'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Error */}
            {state.error && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-red-800 mb-2">ข้อผิดพลาด:</div>
                  <div className="text-red-900">{state.error}</div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-white/60 backdrop-blur-sm border-0">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3">วิธีการใช้งาน:</h3>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>คลิกปุ่มไมโครโฟนเพื่อเริ่มฟัง</li>
              <li>พูดคำสั่งของคุณให้ชัดเจน</li>
              <li>แอปจะหยุดการฟังเมื่อคุณพูดเสร็จ</li>
              <li>รอการตอบกลับจาก API</li>
              <li>ฟังการตอบกลับจาก AI</li>
            </ol>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  )
}
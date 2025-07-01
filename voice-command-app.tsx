"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MicOff, Volume2, Loader2, Settings, Activity, Send, BarChart3, Table } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

// Language Selector Component
const LanguageSelector = ({ currentLanguage, onLanguageChange }) => {
  const languages = [
    { code: "th-TH", name: "ไทย", flag: "🇹🇭" },
    { code: "en-US", name: "English", flag: "🇺🇸" },
    { code: "zh-CN", name: "中文", flag: "🇨🇳" },
    { code: "ja-JP", name: "日本語", flag: "🇯🇵" },
  ]

  return (
    <div className="flex gap-1 bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onLanguageChange(lang.code)}
          className={`
            px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
            ${currentLanguage === lang.code
              ? "bg-gray-700 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }
          `}
        >
          <span className="mr-1.5">{lang.flag}</span>
          {lang.name}
        </button>
      ))}
    </div>
  )
}

// AI Avatar Component
const AIAvatar = ({ isSpeaking, isProcessing }) => {
  const [pulseFrame, setPulseFrame] = useState(0)

  // Pulse animation for speaking
  useEffect(() => {
    let pulseInterval
    if (isSpeaking) {
      pulseInterval = setInterval(() => {
        setPulseFrame(prev => (prev + 1) % 3)
      }, 400)
    } else {
      setPulseFrame(0)
    }
    return () => clearInterval(pulseInterval)
  }, [isSpeaking])

  const getPulseIntensity = () => {
    if (!isSpeaking) return 1
    const intensities = [1, 1.1, 1.05]
    return intensities[pulseFrame]
  }

  return (
    <div className="relative w-32 h-32 mx-auto">
      {/* Main Avatar Circle */}
      <div className={`
        absolute inset-0 rounded-full transition-all duration-300 flex items-center justify-center
        ${isSpeaking 
          ? 'bg-gradient-to-br from-slate-100 to-slate-200 shadow-lg border-2 border-slate-300' 
          : isProcessing
          ? 'bg-gradient-to-br from-slate-50 to-slate-100 shadow-md border-2 border-slate-250'
          : 'bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200'
        }
      `}>
        
        {/* Professional Icon */}
        <div className={`
          transition-transform duration-400
          ${isSpeaking ? 'scale-110' : 'scale-100'}
        `}>
          <svg 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-slate-600"
          >
            {/* Professional headset/microphone icon */}
            <path 
              d="M12 1C8.5 1 5.5 4 5.5 7.5V12C5.5 12.8 6.2 13.5 7 13.5S8.5 12.8 8.5 12V7.5C8.5 5.6 10.1 4 12 4S15.5 5.6 15.5 7.5V12C15.5 12.8 16.2 13.5 17 13.5S18.5 12.8 18.5 12V7.5C18.5 4 15.5 1 12 1Z" 
              fill="currentColor"
              opacity="0.8"
            />
            <path 
              d="M19 10V12C19 16.4 15.4 20 11 20H10C9.4 20 9 20.4 9 21S9.4 22 10 22H11C16.5 22 21 17.5 21 12V10C21 9.4 20.6 9 20 9S19 9.4 19 10Z" 
              fill="currentColor"
              opacity="0.8"
            />
            <circle 
              cx="12" 
              cy="18" 
              r="2" 
              fill="currentColor"
              opacity={isSpeaking ? getPulseIntensity() : 0.6}
              className="transition-opacity duration-400"
            />
          </svg>
        </div>

        {/* Speaking pulse rings */}
        {isSpeaking && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-slate-400/30 animate-ping"></div>
            <div className="absolute inset-2 rounded-full border border-slate-400/20 animate-pulse"></div>
          </>
        )}

        {/* Processing indicator */}
        {isProcessing && (
          <div className="absolute bottom-2 right-2">
            <div className="w-3 h-3 bg-slate-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>

      {/* Sound wave visualization */}
      {isSpeaking && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute -right-8 flex items-center gap-1">
            <div className="w-1 bg-slate-400 rounded-full animate-pulse" style={{height: '8px'}}></div>
            <div className="w-1 bg-slate-400 rounded-full animate-pulse" style={{height: '12px', animationDelay: '0.1s'}}></div>
            <div className="w-1 bg-slate-400 rounded-full animate-pulse" style={{height: '6px', animationDelay: '0.2s'}}></div>
          </div>
        </div>
      )}

      {/* Status Text */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-center">
        <div className={`text-xs font-medium tracking-wide ${
          isSpeaking ? 'text-slate-700' : 
          isProcessing ? 'text-slate-600' : 
          'text-slate-500'
        }`}>
          {isSpeaking ? 'SPEAKING' : isProcessing ? 'PROCESSING' : 'READY'}
        </div>
      </div>
    </div>
  )
}

// Chart Component
const ChartDisplay = ({ data, title = "Chart" }) => {
  if (!data || data.length === 0) return null

  // Format data for the chart
  const formattedData = data.map(item => {
    const obj = { ...item.json }
    // Format date if it exists
    if (obj.DateStr) {
      obj.DateStr = new Date(obj.DateStr).toLocaleDateString('th-TH')
    }
    return obj
  })

  // Get all numeric keys for chart (exclude DateStr and non-numeric fields)
  const numericKeys = Object.keys(formattedData[0] || {}).filter(key => 
    key !== 'DateStr' && typeof formattedData[0][key] === 'number'
  )

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#8dd1e1', '#d084d0']

  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="text-xs font-medium text-blue-600 mb-4 flex items-center gap-2">
        <BarChart3 className="w-4 h-4" />
        {title}
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="DateStr" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              labelFormatter={(value) => `Date: ${value}`}
              formatter={(value, name) => [value?.toFixed(2), name]}
            />
            <Legend />
            {numericKeys.map((key, index) => (
              <Line 
                key={key}
                type="monotone" 
                dataKey={key} 
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// Table Component
const TableDisplay = ({ data, title = "Table" }) => {
  if (!data || data.length === 0) return null

  // Format data for table display
  const formattedData = data.map(item => {
    const obj = { ...item.json }
    // Format date if it exists
    if (obj.DateStr) {
      obj.DateStr = new Date(obj.DateStr).toLocaleDateString('th-TH')
    }
    return obj
  })

  // Get headers from the first item
  const headers = Object.keys(formattedData[0] || {})

  return (
    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="text-xs font-medium text-green-600 mb-4 flex items-center gap-2">
        <Table className="w-4 h-4" />
        {title}
      </div>
      <div className="overflow-x-auto max-h-64 overflow-y-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-green-100">
            <tr>
              {headers.map((header, index) => (
                <th 
                  key={index}
                  className="border border-green-200 px-3 py-2 text-left text-xs font-medium text-green-800"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {formattedData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-green-50">
                {headers.map((header, colIndex) => (
                  <td 
                    key={colIndex}
                    className="border border-green-200 px-3 py-2 text-sm text-gray-700"
                  >
                    {typeof row[header] === 'number' ? row[header].toFixed(2) : row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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
}) => {
  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h4 className="font-medium text-gray-700 flex items-center gap-2 text-sm">
        <Settings className="w-4 h-4 text-gray-600" />
        Voice Settings
      </h4>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-2 block">
            Speed: {speed.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={speed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-2 block">
            Pitch: {pitch.toFixed(1)}
          </label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={pitch}
            onChange={(e) => onPitchChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-2 block">
            Volume: {Math.round(volume * 100)}%
          </label>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.1"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
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
        className="w-full bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 text-xs"
      >
        Reset Defaults
      </Button>
    </div>
  )
}

export default function VoiceCommandApp() {
  const [state, setState] = useState({
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    transcribedText: "",
    typedText: "",
    response: "",
    error: "",
    language: "th-TH",
    ttsSpeed: 1.5,
    ttsPitch: 1.0,
    ttsVolume: 0.8,
    showTTSControls: false,
    inputMethod: "voice",
    chartData: null,
    tableData: null,
  })

  const recognitionRef = useRef(null)
  const synthRef = useRef(null)
  const textInputRef = useRef(null)

  const API_ENDPOINT = "http://localhost:5678/webhook/voice-command"

  // Initialize Speech APIs
  useEffect(() => {
    if (typeof window !== 'undefined' && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
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
            typedText: finalTranscript, // Update the text input as well
            isListening: false, 
            isProcessing: true,
            inputMethod: "voice"
          }))
          sendToAPI(finalTranscript)
        }
      }

      recognitionRef.current.onerror = (event) => {
        setState(prev => ({ 
          ...prev, 
          isListening: false, 
          error: `Error: ${event.error}` 
        }))
      }

      recognitionRef.current.onend = () => {
        setState(prev => ({ ...prev, isListening: false }))
      }
    }

    if (typeof window !== 'undefined' && "speechSynthesis" in window) {
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

  // Voice Functions
  const startListening = () => {
    if (!recognitionRef.current || state.isListening || state.isProcessing || state.isSpeaking) {
      return
    }

    if (synthRef.current && state.isSpeaking) {
      synthRef.current.cancel()
      setState(prev => ({ ...prev, isSpeaking: false }))
    }

    setState(prev => ({ 
      ...prev, 
      transcribedText: "", 
      response: "", 
      error: "",
      chartData: null,
      tableData: null,
      inputMethod: "voice"
    }))

    try {
      recognitionRef.current.lang = state.language
      recognitionRef.current.start()
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: "Failed to start voice recognition" 
      }))
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop()
    }
  }

  // Text Input Functions
  const handleTextSubmit = () => {
    if (!state.typedText.trim() || state.isProcessing || state.isSpeaking) {
      return
    }

    setState(prev => ({ 
      ...prev, 
      transcribedText: prev.typedText,
      isProcessing: true,
      inputMethod: "text",
      response: "",
      error: "",
      chartData: null,
      tableData: null
    }))

    sendToAPI(state.typedText)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleTextSubmit()
    }
  }

  // API Functions
  const sendToAPI = async (text) => {
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
      
      // Handle different response structures
      let responseData = data
      if (Array.isArray(data) && data.length > 0) {
        responseData = data[0].response?.body || data[0]
      }

      const message = responseData.message || []
      const stage = responseData.stage || ""
      
      // Clear previous data
      setState(prev => ({ 
        ...prev, 
        response: "", 
        chartData: null,
        tableData: null,
        isProcessing: false 
      }))

      // Handle different stages
      if (stage === "text") {
        // For text stage, extract the output from message
        const textOutput = message.length > 0 && message[0].json?.output 
          ? message[0].json.output 
          : "การประมวลผลเสร็จสิ้น"
        
        setState(prev => ({ 
          ...prev, 
          response: textOutput,
          isProcessing: false 
        }))

        setTimeout(() => {
          speakText(textOutput)
        }, 500)

      } else if (stage === "graph") {
        // For graph stage, show chart
        setState(prev => ({ 
          ...prev, 
          chartData: message,
          isProcessing: false 
        }))

        setTimeout(() => {
          speakText("ข้อมูลกราฟได้แสดงผลแล้ว")
        }, 500)

      } else if (stage === "table") {
        // For table stage, show table
        setState(prev => ({ 
          ...prev, 
          tableData: message,
          isProcessing: false 
        }))

        setTimeout(() => {
          speakText("ข้อมูลตารางได้แสดงผลแล้ว")
        }, 500)

      } else if (stage === "both" || stage === "`both") {
        // For both stage, show both chart and table
        setState(prev => ({ 
          ...prev, 
          chartData: message,
          tableData: message,
          isProcessing: false 
        }))

        setTimeout(() => {
          speakText("ข้อมูลกราฟและตารางได้แสดงผลแล้ว")
        }, 500)

      } else {
        // Fallback for unknown stage
        setState(prev => ({ 
          ...prev, 
          response: "ได้รับข้อมูลแล้ว",
          isProcessing: false 
        }))

        setTimeout(() => {
          speakText("การประมวลผลเสร็จสิ้น")
        }, 500)
      }

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : "An error occurred", 
        isProcessing: false,
        chartData: null,
        tableData: null
      }))
    }
  }

  const speakText = (text) => {
    if (!synthRef.current || !text) return

    synthRef.current.cancel()

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
        error: "Speech synthesis failed" 
      }))
    }

    synthRef.current.speak(utterance)
  }

  // Status Functions
  const getStatusText = () => {
    if (state.isListening) return "Listening..."
    if (state.isProcessing) return "Processing..."
    if (state.isSpeaking) return "Speaking..."
    return "Ready"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">AI Voice Assistant</h1>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Activity className="w-4 h-4 text-gray-600" />
            <span>{getStatusText()}</span>
            <div className={`w-2 h-2 rounded-full ${
              state.isListening ? 'bg-gray-600 animate-pulse' :
              state.isProcessing || state.isSpeaking ? 'bg-gray-600 animate-pulse' :
              state.error ? 'bg-red-500' :
              state.response ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
          </div>
        </div>

        {/* Language & Settings */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <LanguageSelector 
            currentLanguage={state.language} 
            onLanguageChange={(lang) => setState(prev => ({ ...prev, language: lang }))} 
          />
          
          <Button
            onClick={() => setState(prev => ({ ...prev, showTTSControls: !prev.showTTSControls }))}
            variant="outline"
            size="sm"
            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
          >
            <Settings className="w-4 h-4 text-gray-600" />
          </Button>
        </div>

        {/* TTS Controls */}
        {state.showTTSControls && (
          <div className="mb-8 max-w-md mx-auto">
            <TTSControls
              speed={state.ttsSpeed}
              pitch={state.ttsPitch}
              volume={state.ttsVolume}
              onSpeedChange={(speed) => setState(prev => ({ ...prev, ttsSpeed: speed }))}
              onPitchChange={(pitch) => setState(prev => ({ ...prev, ttsPitch: pitch }))}
              onVolumeChange={(volume) => setState(prev => ({ ...prev, ttsVolume: volume }))}
            />
          </div>
        )}

        {/* Main Interface */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-xl">
          <CardContent className="p-8">
            
            {/* AI Avatar */}
            <div className="mb-8">
              <AIAvatar 
                isSpeaking={state.isSpeaking} 
                isProcessing={state.isProcessing}
              />
            </div>

            {/* Input Display */}
            {state.transcribedText && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-xs font-medium text-blue-600 mb-2 flex items-center gap-2">
                  {state.inputMethod === "voice" ? <Mic className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                  {state.inputMethod === "voice" ? "Voice Input" : "Text Input"}
                </div>
                <div className="text-gray-800">{state.transcribedText}</div>
              </div>
            )}

            {/* Chart Display */}
            {state.chartData && (
              <ChartDisplay 
                data={state.chartData} 
                title="Data Visualization"
              />
            )}

            {/* Table Display */}
            {state.tableData && (
              <TableDisplay 
                data={state.tableData} 
                title="Data Table"
              />
            )}

            {/* Response */}
            {state.response && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-xs font-medium text-green-600 mb-2 flex items-center gap-2">
                  <Activity className="w-3 h-3" />
                  AI Response
                  {state.isSpeaking && <Volume2 className="w-3 h-3 animate-pulse" />}
                </div>
                <div className="text-gray-800 mb-3">{state.response}</div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => speakText(state.response)}
                    disabled={state.isSpeaking}
                    variant="outline"
                    size="sm"
                    className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  >
                    <Volume2 className="w-3 h-3 mr-1" />
                    {state.isSpeaking ? 'Speaking...' : 'Replay'}
                  </Button>
                  
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
                      className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                    >
                      Stop
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Error */}
            {state.error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-xs font-medium text-red-600 mb-2">Error</div>
                <div className="text-gray-800">{state.error}</div>
              </div>
            )}

            {/* Chat Input */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <textarea
                    ref={textInputRef}
                    value={state.typedText}
                    onChange={(e) => setState(prev => ({ ...prev, typedText: e.target.value }))}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message or use voice..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    rows="3"
                    disabled={state.isProcessing || state.isSpeaking}
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  {/* Voice Button */}
                  <Button
                    onClick={state.isListening ? stopListening : startListening}
                    disabled={state.isProcessing || state.isSpeaking}
                    size="sm"
                    className={`
                      w-10 h-10 rounded-full transition-all duration-300 relative
                      ${state.isListening 
                        ? "bg-gray-700 hover:bg-gray-800" 
                        : "bg-gray-600 hover:bg-gray-700"
                      }
                      ${(state.isProcessing || state.isSpeaking) ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}
                    `}
                  >
                    {state.isListening ? (
                      <MicOff className="w-4 h-4 text-white" />
                    ) : (
                      <Mic className="w-4 h-4 text-white" />
                    )}
                    
                    {state.isListening && (
                      <div className="absolute inset-0 rounded-full border-2 border-gray-400/50 animate-ping"></div>
                    )}
                  </Button>

                  {/* Send Button */}
                  <Button
                    onClick={handleTextSubmit}
                    disabled={!state.typedText.trim() || state.isProcessing || state.isSpeaking}
                    size="sm"
                    className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {state.isProcessing ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 text-white" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-500 text-center">
                Press Enter to send • Click mic to record voice
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #4b5563;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(75,85,99,0.3);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #4b5563;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(75,85,99,0.3);
        }
      `}</style>
    </div>
  )
}
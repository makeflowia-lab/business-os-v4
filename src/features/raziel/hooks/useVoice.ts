'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export function useVoice() {
  const [isSpeaking, setIsSpeaking]   = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [autoSpeak, setAutoSpeak]     = useState(true)
  const [voicesReady, setVoicesReady] = useState(false)
  const [mouthOpen, setMouthOpen]     = useState(false)

  const mouthTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)
  const accumulatedRef = useRef('')
  const onResultRef    = useRef<((text: string) => void) | null>(null)
  const activeRef      = useRef(false)  // true while user wants mic open

  /* ── Voices ── */
  useEffect(() => {
    if (typeof window === 'undefined') return
    const synth = window.speechSynthesis
    const load = () => { if (synth.getVoices().length > 0) setVoicesReady(true) }
    load()
    synth.onvoiceschanged = load
  }, [])

  const getBestVoice = useCallback(() => {
    const voices = window.speechSynthesis.getVoices()
    const priorities = [
      (v: SpeechSynthesisVoice) => /raúl|raul/i.test(v.name),
      (v: SpeechSynthesisVoice) => /jorge/i.test(v.name),
      (v: SpeechSynthesisVoice) => /pablo/i.test(v.name),
      (v: SpeechSynthesisVoice) => /diego/i.test(v.name),
      (v: SpeechSynthesisVoice) => v.lang === 'es-MX',
      (v: SpeechSynthesisVoice) => v.lang.startsWith('es'),
    ]
    for (const test of priorities) {
      const match = voices.find(test)
      if (match) return match
    }
    return voices[0] || null
  }, [voicesReady]) // eslint-disable-line

  /* ── TTS ── */
  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined') return
    const synth = window.speechSynthesis
    synth.cancel()

    const clean = text
      .replace(/\[ESTADO:(humano|soul_reaver)\]\n?/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/^\s*[-*+]\s/gm, '')
      .replace(/^\s*\d+\.\s/gm, '')
      .trim()

    if (!clean) return

    const utterance = new SpeechSynthesisUtterance(clean)
    utterance.lang   = 'es-MX'
    utterance.rate   = 1.0
    utterance.pitch  = 1.0
    utterance.volume = 1

    const voice = getBestVoice()
    if (voice) utterance.voice = voice

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend   = () => { setIsSpeaking(false); setMouthOpen(false) }
    utterance.onerror = () => { setIsSpeaking(false); setMouthOpen(false) }

    utterance.onboundary = (e: SpeechSynthesisEvent) => {
      if (e.name === 'word') {
        setMouthOpen(true)
        if (mouthTimerRef.current) clearTimeout(mouthTimerRef.current)
        mouthTimerRef.current = setTimeout(() => setMouthOpen(false), 120)
      }
    }

    synth.speak(utterance)
  }, [getBestVoice])

  const stopSpeaking = useCallback(() => {
    if (typeof window === 'undefined') return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  /* ── STT internal session starter ── */
  const startSession = useCallback(() => {
    const SR =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SR) return

    const recognition = new SR()
    recognition.lang            = 'es-MX'
    recognition.continuous      = true
    recognition.interimResults  = true
    recognition.maxAlternatives = 1

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const segment = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          accumulatedRef.current += segment + ' '
        } else {
          interim += segment
        }
      }
      setInterimText((accumulatedRef.current + interim).trim())
    }

    // Browser cuts session after silence — restart if user still wants mic open
    recognition.onend = () => {
      if (activeRef.current) {
        try { startSession() } catch { /* ignore */ }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (e: any) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        console.warn('STT:', e.error)
      }
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [])

  /* ── STT public API ── */
  const startListening = useCallback((onResult: (text: string) => void) => {
    if (typeof window === 'undefined') return
    const SR =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SR) {
      alert('Tu browser no soporta voz. Usa Chrome.')
      return
    }

    accumulatedRef.current = ''
    onResultRef.current    = onResult
    activeRef.current      = true
    setIsListening(true)
    setInterimText('')
    startSession()
  }, [startSession])

  const stopListening = useCallback(() => {
    activeRef.current = false                 // Tell onend not to restart
    recognitionRef.current?.stop()
    recognitionRef.current = null

    const text = accumulatedRef.current.trim()
    accumulatedRef.current = ''
    setIsListening(false)
    setInterimText('')

    if (text && onResultRef.current) {
      onResultRef.current(text)
    }
  }, [])

  return {
    speak,
    stopSpeaking,
    isSpeaking,
    mouthOpen,
    startListening,
    stopListening,
    isListening,
    interimText,
    autoSpeak,
    setAutoSpeak,
  }
}

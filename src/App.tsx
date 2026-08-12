import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Types ──────────────────────────────────────────────────────────────────

interface User {
  ra: string
  name: string
  createdAt: string
}

interface Calculation {
  id: string
  date: string
  time: string
  a1: number
  a2: number
  a3Notes: number[]
  final: number
  approved: boolean
}

interface GradeInputs {
  a1: string
  a2: string
  a3Notes: string[]
}

interface ValidationErrors {
  a1?: string
  a2?: string
  a3Notes?: string[]
}

interface Result {
  a1: number
  a2: number
  a3Notes: number[]
  a3: number
  percentA1: number
  percentA2: number
  percentA3: number
  final: number
  approved: boolean
}

// ─── Constants ──────────────────────────────────────────────────────────────

const PASSING_GRADE = 70
const USERS_KEY = 'nota-calc-users'
const SESSION_KEY = 'nota-calc-session'
const historyKey = (ra: string) => `nota-calc-history-${ra}`

// ─── User persistence ────────────────────────────────────────────────────────

function getUsers(): Record<string, User> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}')
  } catch { return {} }
}

function saveUser(user: User): void {
  const users = getUsers()
  users[user.ra] = user
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function findUser(ra: string): User | null {
  return getUsers()[ra.trim().toUpperCase()] ?? null
}

function saveSession(ra: string): void {
  localStorage.setItem(SESSION_KEY, ra)
}

function getSession(): string | null {
  return localStorage.getItem(SESSION_KEY)
}

function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
}

// ─── Calculation persistence ─────────────────────────────────────────────────

function saveCalculation(ra: string, calc: Calculation): void {
  const history = getCalculationHistory(ra)
  history.unshift(calc)
  localStorage.setItem(historyKey(ra), JSON.stringify(history.slice(0, 50)))
}

function getCalculationHistory(ra: string): Calculation[] {
  try {
    return JSON.parse(localStorage.getItem(historyKey(ra)) || '[]')
  } catch { return [] }
}

function deleteCalculation(ra: string, id: string): Calculation[] {
  const history = getCalculationHistory(ra).filter((c) => c.id !== id)
  localStorage.setItem(historyKey(ra), JSON.stringify(history))
  return history
}

function clearHistory(ra: string): void {
  localStorage.removeItem(historyKey(ra))
}

// ─── Logic ──────────────────────────────────────────────────────────────────

function validate(inputs: GradeInputs): ValidationErrors {
  const errors: ValidationErrors = {}
  if (inputs.a1.trim() === '') errors.a1 = 'Informe a nota da A1.'
  else if (!/^\d+$/.test(inputs.a1)) errors.a1 = 'Use apenas números inteiros.'
  else if (Number(inputs.a1) > 30) errors.a1 = 'A A1 vale no máximo 30 pontos.'

  if (inputs.a2.trim() === '') errors.a2 = 'Informe a nota da A2.'
  else if (!/^\d+$/.test(inputs.a2)) errors.a2 = 'Use apenas números inteiros.'
  else if (Number(inputs.a2) > 30) errors.a2 = 'A A2 vale no máximo 30 pontos.'

  if (inputs.a3Notes.length === 0 || inputs.a3Notes.every(n => n.trim() === '')) {
    errors.a3Notes = ['Informe pelo menos uma nota da A3.']
  } else {
    const a3Errors: string[] = []
    let a3Total = 0
    inputs.a3Notes.forEach((note, idx) => {
      if (note.trim() !== '') {
        if (!/^\d+$/.test(note)) {
          a3Errors[idx] = 'Use apenas números inteiros.'
        } else {
          const val = Number(note)
          a3Total += val
          if (val < 0) a3Errors[idx] = 'O valor não pode ser negativo.'
          else if (a3Total > 40) a3Errors[idx] = 'A soma total da A3 não pode exceder 40 pontos.'
        }
      }
    })
    if (a3Errors.length > 0) errors.a3Notes = a3Errors
  }

  return errors
}

function calculate(a1: number, a2: number, a3Notes: number[]): Result {
  const a3 = a3Notes.reduce((sum, note) => sum + note, 0)
  const final = a1 + a2 + a3
  return {
    a1, a2, a3Notes, a3,
    percentA1: Math.round((a1 / 30) * 100),
    percentA2: Math.round((a2 / 30) * 100),
    percentA3: Math.round((a3 / 40) * 100),
    final,
    approved: final >= PASSING_GRADE,
  }
}

function classify(score: number): { label: string; accent: string; soft: string } {
  if (score >= 90) return { label: 'Excelente', accent: '#047857', soft: '#d1fae5' }
  if (score >= 80) return { label: 'Ótimo', accent: '#0369a1', soft: '#e0f2fe' }
  if (score >= 70) return { label: 'Bom', accent: '#1d4ed8', soft: '#dbeafe' }
  if (score >= 60) return { label: 'Regular', accent: '#b45309', soft: '#fef3c7' }
  if (score >= 50) return { label: 'Atenção', accent: '#c2410c', soft: '#ffedd5' }
  return { label: 'Baixo', accent: '#b91c1c', soft: '#fee2e2' }
}

function motivationalMessage(score: number): { emoji: string; title: string; message: string; accent: string; soft: string } {
  if (score === 100) return { emoji: '🏆', title: 'Nota perfeita!', message: 'Incrível! Você atingiu a pontuação máxima — 100 de 100. Isso é resultado de muito esforço, dedicação e comprometimento. Parabéns, você é um exemplo de excelência acadêmica!', accent: '#7c3aed', soft: '#ede9fe' }
  if (score >= 90) return { emoji: '🌟', title: 'Resultado excepcional!', message: 'Você está entre os melhores! Seu desempenho demonstra domínio do conteúdo e dedicação acima da média. Continue assim — você está no caminho certo para grandes conquistas.', accent: '#047857', soft: '#d1fae5' }
  if (score >= 81) return { emoji: '🎉', title: 'Muito parabéns!', message: 'Excelente resultado! Você demonstrou sólido domínio do conteúdo. Seu esforço está valendo muito. Continue com esse ritmo e os resultados continuarão a impressionar.', accent: '#0369a1', soft: '#e0f2fe' }
  if (score >= 70) return { emoji: '👏', title: 'Muito bom!', message: 'Bom trabalho! Você atingiu a média e está aprovado. Com um pouco mais de empenho nas próximas avaliações, você pode alcançar resultados ainda melhores.', accent: '#1d4ed8', soft: '#dbeafe' }
  if (score >= 60) return { emoji: '📚', title: 'Quase lá!', message: 'Você chegou perto! Faltou pouco para atingir a média. Revise os pontos em que teve mais dificuldade e busque apoio do professor ou colegas — você tem potencial para ir além.', accent: '#b45309', soft: '#fef3c7' }
  if (score >= 50) return { emoji: '💪', title: 'Não desista!', message: 'O resultado está abaixo da média, mas ainda há tempo para reverter. Identifique onde estão as dificuldades, organize seus estudos e busque ajuda. Cada ponto conquistado conta.', accent: '#c2410c', soft: '#ffedd5' }
  return { emoji: '🌱', title: 'Vamos juntos melhorar!', message: 'Sabemos que nem sempre é fácil. Este é o momento de refletir sobre sua jornada e buscar novos caminhos. Converse com seu professor, reorganize seus estudos e acredite na sua capacidade de crescer.', accent: '#b91c1c', soft: '#fee2e2' }
}

function barColor(pct: number): string {
  if (pct >= 80) return '#1d4ed8'
  if (pct >= 70) return '#0369a1'
  if (pct >= 60) return '#b45309'
  if (pct >= 50) return '#c2410c'
  return '#b91c1c'
}

function formatDate(date: Date) {
  return {
    date: date.toLocaleDateString('pt-BR'),
    time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  }
}

function buildSpeechText(result: Result): string {
  const status = result.approved ? 'aprovado' : 'em recuperação'
  const a3Details = result.a3Notes.length > 1 
    ? `notas adicionais da A3: ${result.a3Notes.join(', ')} pontos, totalizando ${result.a3} de 40 pontos`
    : `Nota A3: ${result.a3} de 40 pontos`
  return `Resultado do cálculo de notas. Nota A1: ${result.a1} de 30 pontos, equivalência de ${result.percentA1} por cento. Nota A2: ${result.a2} de 30 pontos, equivalência de ${result.percentA2} por cento. ${a3Details}, equivalência de ${result.percentA3} por cento. Nota final: ${result.final} de 100 pontos. Situação: ${status}. A média mínima para aprovação é ${PASSING_GRADE} pontos.`
}

function formatRA(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '')
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useSpeech() {
  const [speaking, setSpeaking] = useState(false)
  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'pt-BR'; u.rate = 0.95
    u.onstart = () => setSpeaking(true)
    u.onend = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(u)
  }, [])
  const stop = useCallback(() => { window.speechSynthesis.cancel(); setSpeaking(false) }, [])
  useEffect(() => () => { window.speechSynthesis.cancel() }, [])
  return { speaking, speak, stop }
}

const ZOOM_STEPS = [85, 100, 115, 130, 150]
function useZoom() {
  const [zoomIndex, setZoomIndex] = useState(1)
  useEffect(() => { document.documentElement.style.fontSize = `${ZOOM_STEPS[zoomIndex]}%` }, [zoomIndex])
  return {
    zoom: ZOOM_STEPS[zoomIndex],
    zoomIn: () => setZoomIndex((i) => Math.min(i + 1, ZOOM_STEPS.length - 1)),
    zoomOut: () => setZoomIndex((i) => Math.max(i - 1, 0)),
    zoomReset: () => setZoomIndex(1),
    canZoomIn: zoomIndex < ZOOM_STEPS.length - 1,
    canZoomOut: zoomIndex > 0,
  }
}

// ─── Auth screen ──────────────────────────────────────────────────────────────

function AuthScreen({ onAuth }: { onAuth: (user: User) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [ra, setRa] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [nameError, setNameError] = useState('')
  const [raError, setRaError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess(''); setNameError(''); setRaError('')

    const cleanRA = formatRA(ra)
    let hasError = false

    if (mode === 'register' && name.trim().split(' ').length < 2) {
      setNameError('Informe o nome completo (nome e sobrenome).')
      hasError = true
    }
    if (cleanRA.length < 3) {
      setRaError('Informe um número de RA válido.')
      hasError = true
    }
    if (hasError) return

    if (mode === 'register') {
      if (findUser(cleanRA)) {
        setRaError('Este RA já está cadastrado. Faça login.')
        return
      }
      const now = new Date().toISOString()
      const user: User = { ra: cleanRA, name: name.trim(), createdAt: now }
      saveUser(user)
      saveSession(cleanRA)
      setSuccess('Conta criada com sucesso!')
      setTimeout(() => onAuth(user), 800)
    } else {
      const user = findUser(cleanRA)
      if (!user) {
        setRaError('RA não encontrado. Verifique ou crie uma conta.')
        return
      }
      saveSession(cleanRA)
      onAuth(user)
    }
  }

  const field: React.CSSProperties = {
    width: '100%', padding: '0.875rem 1rem',
    border: '1.5px solid #d1d5db', borderRadius: '0.5rem',
    fontFamily: 'var(--font-body)', fontSize: '0.9375rem',
    color: '#1a1a2e', background: '#f9f8f6', outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9f8f6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.25rem' }}>
      {/* Logo / wordmark */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, background: '#1a1a2e', borderRadius: '0.875rem', marginBottom: '1rem' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b49650" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 300, color: '#1a1a2e', marginBottom: '0.25rem' }}>
          Calculadora de Notas
        </h1>
        <p style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>A1 · A2 · A3 &nbsp;—&nbsp; Sistema acadêmico</p>
      </div>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: 420, background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        {/* Tab switcher */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #e5e7eb' }}>
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); setNameError(''); setRaError(''); setSuccess('') }}
              style={{
                padding: '1rem', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 500,
                background: mode === m ? '#ffffff' : '#f9f8f6',
                color: mode === m ? '#1a1a2e' : '#9ca3af',
                borderBottom: mode === m ? '2px solid #1a1a2e' : '2px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              {m === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {mode === 'register' && (
            <div>
              <label htmlFor="auth-name" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Nome completo
              </label>
              <input
                id="auth-name"
                type="text"
                placeholder="Ex: Maria Silva Souza"
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError('') }}
                autoComplete="name"
                style={{ ...field, borderColor: nameError ? '#dc2626' : '#d1d5db' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#6b5c38'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(107,92,56,0.15)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = nameError ? '#dc2626' : '#d1d5db'; e.currentTarget.style.boxShadow = 'none' }}
              />
              {nameError && <p role="alert" style={{ marginTop: 4, fontSize: '0.78rem', color: '#dc2626' }}>⚠ {nameError}</p>}
            </div>
          )}

          <div>
            <label htmlFor="auth-ra" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Número de RA (Matrícula)
            </label>
            <input
              id="auth-ra"
              type="text"
              placeholder="Ex: 2024001234"
              value={ra}
              onChange={(e) => { setRa(e.target.value); setRaError('') }}
              autoComplete="username"
              style={{ ...field, borderColor: raError ? '#dc2626' : '#d1d5db', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#6b5c38'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(107,92,56,0.15)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = raError ? '#dc2626' : '#d1d5db'; e.currentTarget.style.boxShadow = 'none' }}
            />
            {raError && <p role="alert" style={{ marginTop: 4, fontSize: '0.78rem', color: '#dc2626' }}>⚠ {raError}</p>}
            <p style={{ marginTop: 4, fontSize: '0.72rem', color: '#9ca3af' }}>
              Seu RA fica salvo apenas neste dispositivo.
            </p>
          </div>

          {error && (
            <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#dc2626' }}>
              {error}
            </div>
          )}
          {success && (
            <div role="status" style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '0.5rem', padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#15803d' }}>
              ✓ {success}
            </div>
          )}

          <button
            type="submit"
            style={{
              padding: '0.9375rem', background: '#1a1a2e', color: '#ffffff',
              border: 'none', borderRadius: '0.625rem', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '0.9375rem',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#2d3561')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#1a1a2e')}
          >
            {mode === 'login' ? 'Acessar minha conta' : 'Criar conta'}
          </button>
        </form>
      </div>

      <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#c4b99a', textAlign: 'center' }}>
        Seus dados são armazenados apenas neste dispositivo. Nenhum dado é enviado a servidores.
      </p>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function A3NotesInput({ notes, errors, onChange, onBlur, onAddNote, onRemoveNote }: {
  notes: string[]
  errors?: string[]
  onChange: (value: string, index: number) => void
  onBlur: (index: number) => void
  onAddNote: () => void
  onRemoveNote: (index: number) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>A3 - Notas adicionais</label>
        <button
          type="button"
          onClick={onAddNote}
          style={{ fontSize: '0.75rem', padding: '0.35rem 0.625rem', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 500 }}
        >
          + Adicionar nota
        </button>
      </div>
      {notes.map((note, idx) => (
        <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={40}
            value={note}
            onChange={(e) => onChange(e.target.value, idx)}
            onBlur={() => onBlur(idx)}
            placeholder="—"
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              fontSize: '1rem',
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              color: '#1a1a2e',
              background: errors?.[idx] ? '#fff5f5' : '#f9f8f6',
              border: `2px solid ${errors?.[idx] ? '#dc2626' : '#d1d5db'}`,
              borderRadius: '0.5rem',
              outline: 'none',
              textAlign: 'center',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#6b5c38'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(107,92,56,0.15)' }}
            onBlurCapture={(e) => { e.currentTarget.style.borderColor = errors?.[idx] ? '#dc2626' : '#d1d5db'; e.currentTarget.style.boxShadow = 'none' }}
          />
          {notes.length > 1 && (
            <button
              type="button"
              onClick={() => onRemoveNote(idx)}
              style={{ padding: '0.75rem 0.75rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}
            >
              ×
            </button>
          )}
        </div>
      ))}
      <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>0 a 40 pontos (soma total)</span>
      {errors && errors.length > 0 && errors.some(e => e) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {errors.map((err, idx) => err && (
            <p key={idx} role="alert" style={{ fontSize: '0.78rem', color: '#dc2626', marginTop: 2 }}>⚠ Nota {idx + 1}: {err}</p>
          ))}
        </div>
      )}
    </div>
  )
}

function GradeField({ id, label, max, value, error, onChange, onBlur }: {
  id: string; label: string; max: number; value: string
  error?: string; onChange: (v: string) => void; onBlur: () => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>
        {label}
      </label>
      <input
        id={id} type="number" inputMode="numeric" min={0} max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-describedby={error ? `${id}-err` : `${id}-hint`}
        aria-invalid={!!error}
        placeholder="—"
        style={{
          width: '100%', padding: '0.75rem 1rem', fontSize: '1.5rem',
          fontFamily: 'var(--font-display)', fontWeight: 400, color: '#1a1a2e',
          background: error ? '#fff5f5' : '#f9f8f6',
          border: `2px solid ${error ? '#dc2626' : '#d1d5db'}`,
          borderRadius: '0.5rem', outline: 'none', textAlign: 'center',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = '#6b5c38'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(107,92,56,0.15)' }}
        onBlurCapture={(e) => { e.currentTarget.style.borderColor = error ? '#dc2626' : '#d1d5db'; e.currentTarget.style.boxShadow = 'none' }}
      />
      <span id={`${id}-hint`} style={{ fontSize: '0.72rem', color: '#9ca3af' }}>0 a {max} pontos</span>
      {error && <p id={`${id}-err`} role="alert" style={{ fontSize: '0.78rem', color: '#dc2626', marginTop: 2 }}>⚠ {error}</p>}
    </div>
  )
}

function ProgressBar({ label, score, max, percent }: { label: string; score: number; max: number; percent: number }) {
  const color = barColor(percent)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }} role="group" aria-label={`${label}: ${score} de ${max} pontos, ${percent}%`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', fontFamily: 'var(--font-body)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{score}/{max} — <strong style={{ color }}>{percent}%</strong></span>
      </div>
      <div role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}
        style={{ height: 10, width: '100%', borderRadius: 999, background: '#e5e7eb', overflow: 'hidden' }}>
        <div className="bar-fill" style={{ height: '100%', width: `${percent}%`, background: color, borderRadius: 999 }} />
      </div>
    </div>
  )
}

function MotivationalMessage({ score }: { score: number }) {
  const { emoji, title, message, accent, soft } = motivationalMessage(score)
  return (
    <div className="animate-fade-in-up" style={{ borderRadius: '0.875rem', padding: '1.5rem', background: soft, border: `1.5px solid ${accent}30`, display: 'flex', gap: '1rem', alignItems: 'flex-start', animationDelay: '0.15s' }}>
      <span style={{ fontSize: '2rem', lineHeight: 1, flexShrink: 0 }} aria-hidden="true">{emoji}</span>
      <div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 400, color: accent, marginBottom: '0.375rem' }}>{title}</p>
        <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.65 }}>{message}</p>
      </div>
    </div>
  )
}

function ApprovalBadge({ approved, score }: { approved: boolean; score: number }) {
  const missing = PASSING_GRADE - score
  return (
    <div role="status" aria-live="polite" className="animate-fade-in" style={{ borderRadius: '0.75rem', padding: '1.25rem 1.5rem', background: approved ? '#f0fdf4' : '#fff7ed', border: `2px solid ${approved ? '#86efac' : '#fed7aa'}`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: approved ? '#22c55e' : '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.25rem', color: '#fff' }}>
        {approved ? '✓' : '△'}
      </div>
      <div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 400, color: '#1a1a2e', marginBottom: 2 }}>{approved ? 'Aprovado' : 'Em recuperação'}</p>
        <p style={{ fontSize: '0.8125rem', color: '#6b7280', fontFamily: 'var(--font-body)' }}>
          {approved ? `Média ${PASSING_GRADE} atingida — parabéns!` : `Faltam ${missing} ponto${missing > 1 ? 's' : ''} para atingir a média ${PASSING_GRADE}.`}
        </p>
      </div>
    </div>
  )
}

function ResultCard({ result, onSpeak, speaking }: { result: Result; onSpeak: () => void; speaking: boolean }) {
  const { label, accent, soft } = classify(result.final)
  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ApprovalBadge approved={result.approved} score={result.final} />
      <div style={{ background: '#1a1a2e', borderRadius: '0.875rem', padding: '2rem', textAlign: 'center', position: 'relative' }}>
        <p style={{ fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '0.5rem', fontFamily: 'var(--font-body)' }}>Nota final</p>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', fontWeight: 300, color: '#ffffff', lineHeight: 1, marginBottom: '0.75rem' }}>
          {result.final}<span style={{ fontSize: '1.5rem', color: '#6b7280' }}>/100</span>
        </p>
        <span style={{ display: 'inline-block', background: soft, color: accent, borderRadius: 999, padding: '0.25rem 0.875rem', fontSize: '0.8125rem', fontWeight: 600 }}>{label} desempenho</span>
        <button onClick={onSpeak} aria-label={speaking ? 'Parar leitura' : 'Ouvir resultado em voz alta'}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: speaking ? '#f97316' : 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '0.5rem', padding: '0.5rem', cursor: 'pointer', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {speaking
            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>}
        </button>
      </div>
      <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.875rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <p style={{ fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9ca3af', fontFamily: 'var(--font-body)' }}>Equivalência percentual por avaliação</p>
        <ProgressBar label="A1" score={result.a1} max={30} percent={result.percentA1} />
        <ProgressBar label="A2" score={result.a2} max={30} percent={result.percentA2} />
        <ProgressBar label="A3" score={result.a3} max={40} percent={result.percentA3} />
      </div>
      <MotivationalMessage score={result.final} />
      <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#c4b99a' }}>Seus cálculos são armazenados apenas neste dispositivo.</p>
    </div>
  )
}

function HistoryItem({ calc, onReuse, onDelete }: { calc: Calculation; onReuse: (c: Calculation) => void; onDelete: (id: string) => void }) {
  const a3Total = calc.a3Notes.reduce((sum, n) => sum + n, 0)
  return (
    <div className="animate-fade-in" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderLeft: `4px solid ${calc.approved ? '#22c55e' : '#f97316'}`, borderRadius: '0.5rem', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{calc.date} — {calc.time}</span>
        <span style={{ fontSize: '0.72rem', fontWeight: 600, borderRadius: 999, padding: '0.2rem 0.6rem', background: calc.approved ? '#dcfce7' : '#ffedd5', color: calc.approved ? '#15803d' : '#c2410c' }}>
          {calc.approved ? 'Aprovado' : 'Recuperação'}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8125rem', color: '#374151' }}>A1: <b>{calc.a1}</b> · A2: <b>{calc.a2}</b> · A3: <b>{a3Total}</b></span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#1a1a2e' }}>{calc.final}/100</span>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button onClick={() => onReuse(calc)} style={{ fontSize: '0.78rem', padding: '0.35rem 0.875rem', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>Reutilizar</button>
        <button onClick={() => onDelete(calc.id)} style={{ fontSize: '0.78rem', padding: '0.35rem 0.875rem', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>Excluir</button>
      </div>
    </div>
  )
}

function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="animate-fade-in" style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.45)' }} onClick={onCancel}>
      <div style={{ background: '#ffffff', borderRadius: '1rem', padding: '2rem', maxWidth: 380, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }} onClick={(e) => e.stopPropagation()}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#1a1a2e', marginBottom: '0.5rem', textAlign: 'center' }}>{message}</p>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'center', marginBottom: '1.5rem' }}>Esta ação não pode ser desfeita.</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '0.75rem', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 500 }}>Cancelar</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '0.75rem', background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 500 }}>Confirmar</button>
        </div>
      </div>
    </div>
  )
}

function AccessibilityBar({ zoom, zoomIn, zoomOut, zoomReset, canZoomIn, canZoomOut, speaking, onSpeak, onStopSpeak, hasResult }: {
  zoom: number; zoomIn: () => void; zoomOut: () => void; zoomReset: () => void
  canZoomIn: boolean; canZoomOut: boolean
  speaking: boolean; onSpeak: () => void; onStopSpeak: () => void; hasResult: boolean
}) {
  const btn = (disabled = false): React.CSSProperties => ({
    width: 28, height: 28, border: 'none', borderRadius: '0.375rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: disabled ? 'transparent' : '#ffffff',
    color: disabled ? '#d1d5db' : '#374151',
    fontWeight: 700, fontSize: '0.875rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: disabled ? 'none' : '0 1px 3px rgba(0,0,0,0.1)',
  })
  return (
    <div role="toolbar" aria-label="Ferramentas de acessibilidade" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '0.625rem', padding: '0.3rem 0.5rem' }}>
      <span style={{ fontSize: '0.7rem', color: '#9ca3af', paddingRight: 4, userSelect: 'none' }}>Zoom</span>
      <button onClick={zoomOut} disabled={!canZoomOut} aria-label="Diminuir texto" style={btn(!canZoomOut)}>A−</button>
      <button onClick={zoomReset} aria-label={`Redefinir zoom, atual ${zoom}%`} style={{ minWidth: 36, height: 28, border: 'none', borderRadius: '0.375rem', cursor: 'pointer', background: zoom !== 100 ? '#1a1a2e' : '#ffffff', color: zoom !== 100 ? '#ffffff' : '#6b7280', fontSize: '0.68rem', fontWeight: 600, padding: '0 6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>{zoom}%</button>
      <button onClick={zoomIn} disabled={!canZoomIn} aria-label="Aumentar texto" style={btn(!canZoomIn)}>A+</button>
      {hasResult && (
        <>
          <div style={{ width: 1, height: 20, background: '#d1d5db', margin: '0 2px' }} />
          <button onClick={speaking ? onStopSpeak : onSpeak} aria-label={speaking ? 'Parar leitura' : 'Ouvir resultado'}
            style={{ height: 28, border: 'none', borderRadius: '0.375rem', cursor: 'pointer', background: speaking ? '#f97316' : '#ffffff', color: speaking ? '#ffffff' : '#374151', fontSize: '0.7rem', fontWeight: 600, padding: '0 8px', display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {speaking
              ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>Parar</>
              : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>Ouvir</>}
          </button>
        </>
      )}
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [inputs, setInputs] = useState<GradeInputs>({ a1: '', a2: '', a3Notes: [''] })
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [result, setResult] = useState<Result | null>(null)
  const [history, setHistory] = useState<Calculation[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showConfirm, setShowConfirm] = useState<'history' | 'logout' | null>(null)
  const [savedFlash, setSavedFlash] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)
  const { zoom, zoomIn, zoomOut, zoomReset, canZoomIn, canZoomOut } = useZoom()
  const { speaking, speak, stop } = useSpeech()

  // Restore session on mount
  useEffect(() => {
    const ra = getSession()
    if (ra) {
      const u = findUser(ra)
      if (u) setUser(u)
    }
    setAuthReady(true)
  }, [])

  useEffect(() => {
    if (user) setHistory(getCalculationHistory(user.ra))
  }, [user])

  // Close user menu on outside click
  useEffect(() => {
    if (!showUserMenu) return
    const handler = () => setShowUserMenu(false)
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [showUserMenu])

  function handleAuth(u: User) { setUser(u) }

  function handleLogout() {
    clearSession()
    setUser(null)
    setResult(null)
    setInputs({ a1: '', a2: '', a3Notes: [''] })
    setErrors({}); setTouched({})
    setHistory([])
    setShowConfirm(null)
    setShowUserMenu(false)
  }

  function handleChange(field: keyof GradeInputs, value: string, index?: number) {
    if (field === 'a3Notes' && index !== undefined) {
      if (value !== '' && !/^\d+$/.test(value)) return
      setInputs((prev) => {
        const newA3Notes = [...prev.a3Notes]
        newA3Notes[index] = value
        return { ...prev, a3Notes: newA3Notes }
      })
      if (touched[`a3Notes.${index}`]) {
        const errs = validate({ ...inputs, a3Notes: [...inputs.a3Notes.slice(0, index), value, ...inputs.a3Notes.slice(index + 1)] })
        setErrors((prev) => ({ ...prev, a3Notes: errs.a3Notes }))
      }
    } else {
      if (value !== '' && !/^\d+$/.test(value)) return
      setInputs((prev) => ({ ...prev, [field]: value }))
      if (touched[field]) {
        const errs = validate({ ...inputs, [field]: value })
        setErrors((prev) => ({ ...prev, [field]: errs[field as keyof ValidationErrors] }))
      }
    }
  }

  function handleBlur(field: keyof GradeInputs, index?: number) {
    const key = index !== undefined ? `${field}.${index}` : field
    setTouched((prev) => ({ ...prev, [key]: true }))
    const errs = validate(inputs)
    if (field === 'a3Notes' && index !== undefined) {
      setErrors((prev) => ({ ...prev, a3Notes: errs.a3Notes }))
    } else {
      setErrors((prev) => ({ ...prev, [field]: errs[field as keyof ValidationErrors] }))
    }
  }

  function handleSubmit() {
    if (!user) return
    const allFields = { a1: true, a2: true, ...Object.fromEntries(inputs.a3Notes.map((_, i) => [`a3Notes.${i}`, true])) }
    setTouched(allFields)
    const errs = validate(inputs)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    const a1 = Number(inputs.a1), a2 = Number(inputs.a2)
    const a3Notes = inputs.a3Notes.filter(n => n.trim() !== '').map(n => Number(n))
    const res = calculate(a1, a2, a3Notes)
    setResult(res)

    const { date, time } = formatDate(new Date())
    const calc: Calculation = { id: `${Date.now()}`, date, time, a1, a2, a3Notes, final: res.final, approved: res.approved }
    saveCalculation(user.ra, calc)
    setHistory(getCalculationHistory(user.ra))
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 2000)
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  function handleReuse(calc: Calculation) {
    setInputs({ a1: String(calc.a1), a2: String(calc.a2), a3Notes: calc.a3Notes.map(n => String(n)) })
    setResult(null); setErrors({}); setTouched({}); setShowHistory(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleDeleteCalc(id: string) {
    if (!user) return
    setHistory(deleteCalculation(user.ra, id))
  }

  function handleClearHistory() {
    if (!user) return
    clearHistory(user.ra)
    setHistory([])
    setShowConfirm(null)
    setShowHistory(false)
  }

  if (!authReady) return null
  if (!user) return <AuthScreen onAuth={handleAuth} />

  const firstName = user.name.split(' ')[0]

  return (
    <div style={{ minHeight: '100vh', background: '#f9f8f6', fontFamily: 'var(--font-body)' }}>
      {showConfirm === 'history' && (
        <ConfirmDialog message="Apagar todo o histórico?" onConfirm={handleClearHistory} onCancel={() => setShowConfirm(null)} />
      )}
      {showConfirm === 'logout' && (
        <ConfirmDialog message="Deseja sair da sua conta?" onConfirm={handleLogout} onCancel={() => setShowConfirm(null)} />
      )}

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(26,26,46,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 400, color: '#ffffff', letterSpacing: '-0.01em' }}>Calculadora de Notas</span>
          <span style={{ fontSize: '0.7rem', color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase' }}>A1 · A2 · A3</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AccessibilityBar zoom={zoom} zoomIn={zoomIn} zoomOut={zoomOut} zoomReset={zoomReset} canZoomIn={canZoomIn} canZoomOut={canZoomOut} speaking={speaking} onSpeak={() => result && speak(buildSpeechText(result))} onStopSpeak={stop} hasResult={!!result} />

          <button onClick={() => setShowHistory((v) => !v)} aria-expanded={showHistory} style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative', padding: '0.35rem 0.75rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', background: showHistory ? '#b49650' : 'rgba(255,255,255,0.1)', color: '#ffffff', fontSize: '0.8125rem', fontWeight: 500 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Histórico
            {history.length > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: '#fff', fontSize: '0.6rem', fontWeight: 700, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {history.length > 9 ? '9+' : history.length}
              </span>
            )}
          </button>

          {/* User menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowUserMenu((v) => !v) }}
              aria-label="Menu da conta"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.35rem 0.625rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', background: 'rgba(255,255,255,0.08)', color: '#ffffff' }}
            >
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#b49650', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#1a1a2e', flexShrink: 0 }}>
                {firstName[0].toUpperCase()}
              </div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 500, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{firstName}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>

            {showUserMenu && (
              <div className="animate-fade-in" style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '0.5rem', minWidth: 220, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 100 }} onClick={(e) => e.stopPropagation()}>
                <div style={{ padding: '0.75rem 0.875rem 0.625rem', borderBottom: '1px solid #f3f4f6', marginBottom: '0.25rem' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9375rem', color: '#1a1a2e', marginBottom: 2 }}>{user.name}</p>
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>RA: {user.ra}</p>
                </div>
                <button
                  onClick={() => { setShowConfirm('logout'); setShowUserMenu(false) }}
                  style={{ width: '100%', textAlign: 'left', padding: '0.625rem 0.875rem', background: 'none', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: 8 }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Sair da conta
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '0 1.25rem 5rem' }}>
        {/* History panel */}
        {showHistory && (
          <div className="animate-fade-in-up" style={{ paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af' }}>Histórico de cálculos</h2>
              {history.length > 0 && (
                <button onClick={() => setShowConfirm('history')} style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>Limpar tudo</button>
              )}
            </div>
            {history.length === 0
              ? <div style={{ border: '2px dashed #e5e7eb', borderRadius: '0.75rem', padding: '2.5rem', textAlign: 'center' }}><p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Nenhum cálculo salvo.</p></div>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{history.map((c) => <HistoryItem key={c.id} calc={c} onReuse={handleReuse} onDelete={handleDeleteCalc} />)}</div>}
            <hr style={{ margin: '2rem 0 0', borderColor: '#e5e7eb' }} />
          </div>
        )}

        {/* Page title */}
        <div style={{ paddingTop: '2.5rem', paddingBottom: '1.75rem', borderBottom: '1px solid #e5e7eb', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#b49650', marginBottom: '0.625rem' }}>
            Olá, {firstName}
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: 300, color: '#1a1a2e', lineHeight: 1.15, marginBottom: '0.75rem' }}>
            Descubra sua nota final<br />
            <em style={{ fontStyle: 'italic', color: '#6b7280', fontWeight: 300 }}>e equivalência percentual</em>
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#6b7280', maxWidth: 480, lineHeight: 1.6 }}>
            Informe as notas divulgadas pelo professor. O sistema calcula o desempenho em cada avaliação e a situação final com base na média <strong style={{ color: '#1a1a2e' }}>{PASSING_GRADE}/100</strong>.
          </p>
        </div>

        {/* Grading table */}
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', overflow: 'hidden', marginBottom: '1.75rem' }}>
          <div style={{ padding: '0.875rem 1.25rem', background: '#f9f8f6', borderBottom: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af' }}>Estrutura de avaliação</p>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                {['Avaliação', 'Peso máximo', 'Média mínima'].map((h) => (
                  <th key={h} style={{ padding: '0.625rem 1.25rem', textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9ca3af', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[{ l: 'A1', m: 30 }, { l: 'A2', m: 30 }, { l: 'A3', m: 40 }].map(({ l, m }, i) => (
                <tr key={l} style={{ borderBottom: i < 2 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={{ padding: '0.75rem 1.25rem', fontFamily: 'var(--font-display)', color: '#1a1a2e' }}>{l}</td>
                  <td style={{ padding: '0.75rem 1.25rem', color: '#374151' }}>{m} pontos</td>
                  <td style={{ padding: '0.75rem 1.25rem', color: '#9ca3af', fontSize: '0.8rem' }}>— de 100</td>
                </tr>
              ))}
              <tr style={{ background: '#f9f8f6', borderTop: '2px solid #e5e7eb' }}>
                <td style={{ padding: '0.75rem 1.25rem', fontWeight: 600, color: '#1a1a2e', fontSize: '0.8rem' }}>Total</td>
                <td style={{ padding: '0.75rem 1.25rem', fontWeight: 700, color: '#1a1a2e' }}>100 pontos</td>
                <td style={{ padding: '0.75rem 1.25rem', fontWeight: 600, color: '#b49650', fontSize: '0.8rem' }}>Aprovação: ≥ {PASSING_GRADE}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Input form */}
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.875rem', padding: '1.75rem', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', marginBottom: '1.25rem' }}>Informe suas notas</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1rem' }}>
              <GradeField id="a1" label="A1" max={30} value={inputs.a1} error={errors.a1} onChange={(v) => handleChange('a1', v)} onBlur={() => handleBlur('a1')} />
              <GradeField id="a2" label="A2" max={30} value={inputs.a2} error={errors.a2} onChange={(v) => handleChange('a2', v)} onBlur={() => handleBlur('a2')} />
            </div>
            <A3NotesInput
              notes={inputs.a3Notes}
              errors={errors.a3Notes}
              onChange={(v, idx) => handleChange('a3Notes', v, idx)}
              onBlur={(idx) => handleBlur('a3Notes', idx)}
              onAddNote={() => setInputs((prev) => ({ ...prev, a3Notes: [...prev.a3Notes, ''] }))}
              onRemoveNote={(idx) => setInputs((prev) => ({ ...prev, a3Notes: prev.a3Notes.filter((_, i) => i !== idx) }))}
            />
          </div>
          <button
            onClick={handleSubmit}
            style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', background: '#1a1a2e', color: '#ffffff', border: 'none', borderRadius: '0.625rem', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '0.9375rem', transition: 'background 0.15s', minHeight: 52 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#2d3561')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#1a1a2e')}
          >
            {savedFlash ? <span className="animate-fade-in" style={{ color: '#86efac' }}>✓ Resultado salvo no histórico</span> : 'Calcular minha nota'}
          </button>
        </div>

        {result && <div ref={resultRef}><ResultCard result={result} onSpeak={() => speak(buildSpeechText(result))} speaking={speaking} /></div>}
      </main>

      <style>{`@media(max-width:560px){.grade-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}

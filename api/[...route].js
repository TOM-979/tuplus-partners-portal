import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { opportunities } from '../src/data/crm.js'
import { territories } from '../src/data/territories.js'
import { applications } from '../src/data/applications.js'

// Cuentas de demostración; en producción se conectarán al proveedor de identidad.
const accounts = {
  'partner@tuplus.test': { password: 'PartnerDemo2026!', role: 'partner', id: 'P-014', name: 'Partner de muestra', level: 'L2', territory: 'Barranca' },
  'lider@tuplus.test': { password: 'LiderDemo2026!', role: 'lider_regional', id: 'LR-001', name: 'Líder Regional de muestra', territory: 'Barranca' },
  'direccion@tuplus.test': { password: 'DireccionDemo2026!', role: 'direccion', id: 'DIR-001', name: 'Dirección Comercial' },
}
const sessionSecret = process.env.SESSION_SECRET || 'tuplus-demo-only-change-before-production'
const ownData = opportunities.map((item) => ({ ...item }))
const liveTerritories = territories.map((t) => ({ ...t }))
const liveApplications = applications.map((a) => ({ ...a }))
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }
const partnerTerritories = { 'P-014': 'Barranca', 'P-022': 'Lima Metropolitana', 'P-031': 'Barranca' }
const forbidden = { error: 'No tienes permiso para ver esta sección' }

function send(res, status, body, extraHeaders = {}) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  for (const [name, value] of Object.entries(extraHeaders)) res.setHeader(name, value)
  res.end(JSON.stringify(body))
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body)
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => { data += chunk })
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}) } catch { reject(new Error('JSON inválido')) }
    })
    req.on('error', reject)
  })
}

function getSession(req) {
  const cookie = req.headers?.cookie || ''
  const token = cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith('tuplus_session='))?.slice('tuplus_session='.length)
  if (!token) return null
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null
  const expected = createHmac('sha256', sessionSecret).update(payload).digest('base64url')
  const left = Buffer.from(signature); const right = Buffer.from(expected)
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return session.exp > Date.now() ? session.user : null
  } catch { return null }
}

export default async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost')
  const path = url.pathname.replace(/\/$/, '') || '/'
  const method = req.method || 'GET'

  if (path === '/api/session' && method === 'POST') {
    try {
      const { email, password } = await readBody(req)
      const account = accounts[email]
      if (!account || account.password !== password) return send(res, 401, { error: 'Correo o contraseña incorrectos' })
      const { password: ignored, ...safeUser } = account
      const payload = Buffer.from(JSON.stringify({ user: safeUser, exp: Date.now() + 28800000, nonce: randomBytes(8).toString('hex') })).toString('base64url')
      const signature = createHmac('sha256', sessionSecret).update(payload).digest('base64url')
      const token = `${payload}.${signature}`
      return send(res, 200, { user: safeUser }, { 'Set-Cookie': `tuplus_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=28800` })
    } catch { return send(res, 400, { error: 'Solicitud inválida' }) }
  }
   if (path === '/api/convocatorias' && method === 'GET') {
    const lista = liveTerritories.map(({ id, name, state }) => ({ id, name, state }))
    return send(res, 200, { territories: lista }, { 'Access-Control-Allow-Origin': '*' })
  }

  if (path === '/api/postulaciones') {
    if (method === 'OPTIONS') return send(res, 200, {}, cors)
    if (method === 'POST') {
      try {
        const body = await readBody(req)
        const name = String(body.name || '').trim()
        const email = String(body.email || '').trim()
        const phone = String(body.phone || '').trim()
        const target = liveTerritories.find((t) => t.id === body.territory)
        if (!name || !email.includes('@') || !phone) return send(res, 400, { error: 'Faltan datos obligatorios' }, cors)
        if (!target) return send(res, 400, { error: 'Territorio no válido' }, cors)
        if (target.state !== 'abierta') return send(res, 409, { error: 'Convocatoria cerrada' }, cors)
        const nueva = {
          id: `POST-${String(41 + liveApplications.length).padStart(4, '0')}`,
          territory: target.name,
          score: 0,
          state: 'recibida',
          date: new Date().toISOString().slice(0, 10),
          contact: { name, email, phone },
        }
        liveApplications.push(nueva)
        return send(res, 201, { id: nueva.id }, cors)
      } catch { return send(res, 400, { error: 'Solicitud inválida' }, cors) }
    }
  }

  const user = getSession(req)
  if (path === '/api/session' && method === 'DELETE') {
    const token = (req.headers?.cookie || '').split(';').map((part) => part.trim()).find((part) => part.startsWith('tuplus_session='))?.slice('tuplus_session='.length)
    return send(res, 200, { ok: true }, { 'Set-Cookie': 'tuplus_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0' })
  }
  if (!user) return send(res, 401, { error: 'Inicia sesión para continuar' })

  if (path === '/api/session' && method === 'GET') {
    const { password, ...safeUser } = user
    return send(res, 200, { user: safeUser })
  }

  if (path === '/api/profile' && method === 'GET') {
    if (user.role !== 'partner' || (url.searchParams.has('code') && url.searchParams.get('code') !== user.id)) return send(res, 403, forbidden)
    const { password, ...profile } = user
    return send(res, 200, { profile })
  }

  if (path === '/api/opportunities' && method === 'GET') {
    const requestedCode = url.searchParams.get('partnerCode')
    if (user.role === 'partner' && requestedCode && requestedCode !== user.id) return send(res, 403, forbidden)
    if (user.role === 'lider_regional' && requestedCode && partnerTerritories[requestedCode] !== user.territory) return send(res, 403, forbidden)
    let data = ownData
    if (user.role === 'partner') data = ownData.filter((o) => o.partner === user.id)
    if (user.role === 'lider_regional') {
      const partnerCodes = new Set(Object.entries(partnerTerritories).filter(([, territory]) => territory === user.territory).map(([code]) => code))
      data = ownData.filter((o) => partnerCodes.has(o.partner))
    }
    if (requestedCode) data = data.filter((o) => o.partner === requestedCode)
    return send(res, 200, { opportunities: data })
  }

    if (path === '/api/direccion' && method === 'GET') {
    if (user.role !== 'direccion') return send(res, 403, forbidden)
    return send(res, 200, { territories: liveTerritories, applications: liveApplications, opportunities: ownData })
  }

  if (path === '/api/territorios' && method === 'PATCH') {
    if (user.role !== 'direccion') return send(res, 403, forbidden)
    try {
      const { id, state } = await readBody(req)
      const validos = ['abierta', 'revision', 'proximamente', 'cerrada', 'activa']
      const target = liveTerritories.find((t) => t.id === id)
      if (!target || !validos.includes(state)) return send(res, 400, { error: 'Datos no válidos' })
      target.state = state
      return send(res, 200, { id: target.id, state: target.state })
    } catch { return send(res, 400, { error: 'Solicitud inválida' }) }
  }

  return send(res, 404, { error: 'No encontrado' })
}

export const __test = { ownData, accounts }

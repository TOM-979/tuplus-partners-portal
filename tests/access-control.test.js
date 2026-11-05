import test from 'node:test'
import assert from 'node:assert/strict'
import handler from '../api/[...route].js'

async function request(path, { method = 'GET', cookie = '', body, headers: extraHeaders = {} } = {}) {
  const headers = { ...extraHeaders, cookie }
  const req = { url: path, method, headers, body, on() {} }
  const result = { headers: {}, setHeader(name, value) { this.headers[name] = value }, end(value) { this.body = value } }
  await handler(req, result)
  return { status: result.statusCode, headers: result.headers, data: JSON.parse(result.body) }
}

async function login(email, password) {
  const response = await request('/api/session', { method: 'POST', body: { email, password } })
  assert.equal(response.status, 200)
  assert.match(response.headers['Set-Cookie'], /HttpOnly/)
  return response.headers['Set-Cookie'].split(';')[0]
}

const partner = ['partner@tuplus.test', 'PartnerDemo2026!']
const leader = ['lider@tuplus.test', 'LiderDemo2026!']
const director = ['direccion@tuplus.test', 'DireccionDemo2026!']
const deniedText = 'No tienes permiso para ver esta sección'

test('Partner no puede leer Dirección ni el perfil u oportunidades de otro código', async () => {
  const cookie = await login(...partner)
  const forbidden = await request('/api/direccion', { cookie })
  assert.equal(forbidden.status, 403); assert.equal(forbidden.data.error, deniedText)
  const foreignProfile = await request('/api/profile?code=P-022', { cookie })
  assert.equal(foreignProfile.status, 403); assert.equal(foreignProfile.data.error, deniedText)
  const foreignOpportunities = await request('/api/opportunities?partnerCode=P-022', { cookie })
  assert.equal(foreignOpportunities.status, 403); assert.equal(foreignOpportunities.data.error, deniedText)
  const own = await request('/api/opportunities', { cookie })
  assert.equal(own.status, 200); assert.ok(own.data.opportunities.every((item) => item.partner === 'P-014'))
})

test('Líder Regional ve su territorio y no puede leer Dirección ni otros territorios', async () => {
  const cookie = await login(...leader)
  const forbidden = await request('/api/direccion', { cookie })
  assert.equal(forbidden.status, 403); assert.equal(forbidden.data.error, deniedText)
  const foreign = await request('/api/opportunities?partnerCode=P-022', { cookie })
  assert.equal(foreign.status, 403); assert.equal(foreign.data.error, deniedText)
  const territory = await request('/api/opportunities', { cookie })
  assert.equal(territory.status, 200)
  assert.deepEqual([...new Set(territory.data.opportunities.map((item) => item.partner))].sort(), ['P-014', 'P-031'])
})

test('Dirección ve todas las oportunidades', async () => {
  const cookie = await login(...director)
  const response = await request('/api/direccion', { cookie })
  assert.equal(response.status, 200)
  assert.equal(response.data.opportunities.length, 7)
})

test('La identidad del rol no se acepta desde encabezados del cliente', async () => {
  const response = await request('/api/direccion', { headers: { 'x-role': 'direccion' } })
  assert.equal(response.status, 401)
})

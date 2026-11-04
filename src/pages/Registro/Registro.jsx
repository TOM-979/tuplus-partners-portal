import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './Registro.css'
import Field from '../../components/Field/Field.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import { territories, territoryStates } from '../../data/territories.js'

// Postulación a la Red en pasos (WEB-02, RF-03 y RF-04).
// El primer formulario NO pide documento de identidad ni datos bancarios (minimización por etapa).
const steps = ['Contacto', 'Territorio', 'Experiencia', 'Consentimiento', 'Revisión']
const DRAFT_KEY = 'tuplus-postulacion-borrador'
const CONSENT_VERSION = 'Privacidad v1.0 · Términos de la Red v1.0 (borrador)'

const empty = { nombre: '', correo: '', telefono: '', territorio: '', experiencia: '', sectores: '', disponibilidad: '', motivo: '', privacidad: false, terminos: false }

function loadDraft() {
  try { return { ...empty, ...JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}'), privacidad: false, terminos: false } } catch { return empty }
}

const rules = {
  nombre: (v) => (v.trim().length < 3 ? 'Escribe tu nombre completo.' : ''),
  correo: (v) => (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? 'Escribe un correo con el formato usuario@dominio.com.' : ''),
  telefono: (v) => (!/^\+?[0-9\s]{9,15}$/.test(v) ? 'Escribe solo números, con 9 a 15 dígitos. Puedes empezar con +51.' : ''),
  territorio: (v) => (!v ? 'Elige el territorio donde trabajarías.' : ''),
  experiencia: (v) => (!v ? 'Elige tu experiencia en ventas.' : ''),
  disponibilidad: (v) => (!v ? 'Elige cuántas horas puedes dedicar.' : ''),
  privacidad: (v) => (!v ? 'Debes aceptar el aviso de privacidad para continuar.' : ''),
  terminos: (v) => (!v ? 'Debes aceptar los términos de la Red para continuar.' : ''),
}
const fieldsByStep = [['nombre', 'correo', 'telefono'], ['territorio'], ['experiencia', 'disponibilidad'], ['privacidad', 'terminos'], []]

export default function Registro() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState(loadDraft)
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)
  const [sent, setSent] = useState(false)
  const headingRef = useRef(null)

  // Borrador en este navegador, sin los consentimientos
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const { privacidad, terminos, ...rest } = data
        localStorage.setItem(DRAFT_KEY, JSON.stringify(rest)); setSaved(true)
      } catch { setSaved(false) }
    }, 500)
    return () => clearTimeout(t)
  }, [data])

  useEffect(() => { headingRef.current?.focus() }, [step, sent])

  const set = (name, value) => {
    setData((d) => ({ ...d, [name]: value }))
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' })) // el error se borra al corregir
  }
  const blur = (name) => rules[name] && setErrors((e) => ({ ...e, [name]: rules[name](data[name]) }))

  const validateStep = () => {
    const found = {}
    fieldsByStep[step].forEach((f) => { const msg = rules[f](data[f]); if (msg) found[f] = msg })
    setErrors((e) => ({ ...e, ...found }))
    if (Object.keys(found).length) {
      document.getElementById(Object.keys(found)[0])?.focus()
      return false
    }
    return true
  }

  const next = () => validateStep() && setStep((s) => s + 1)
  const back = () => setStep((s) => s - 1)
  const submit = () => {
    setSent(true)
    try { localStorage.removeItem(DRAFT_KEY) } catch { /* sin almacenamiento */ }
  }

  const territory = territories.find((t) => t.id === data.territorio)
  const input = (name, props = {}) => (a) => (
    <input {...a} name={name} value={data[name]} onChange={(e) => set(name, e.target.value)} onBlur={() => blur(name)} {...props} />
  )
  const select = (name, options) => (a) => (
    <select {...a} name={name} value={data[name]} onChange={(e) => set(name, e.target.value)} onBlur={() => blur(name)}>
      <option value="">Elige una opción</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  )

  if (sent) {
    return (
      <section className="card apply apply--done" aria-labelledby="enviado">
        <span className="apply__done-icon"><Icon name="check" size={28} /></span>
        <h1 id="enviado" tabIndex={-1} ref={headingRef}>Postulación recibida</h1>
        <p>Gracias, {data.nombre.split(' ')[0]}. Un responsable de {territory?.name} revisará tu postulación.</p>
        <p className="apply__warning">
          Postular no garantiza el ingreso a la Red y no te autoriza a representar a TUPLUS. Te escribiremos al correo que dejaste.
        </p>
        <p className="muted apply__demo">Demostración: en esta base no se envía ningún dato. La Etapa 1 conecta el formulario con la API y guarda la postulación.</p>
        <Link className="btn btn-ghost" to="/acceso"><Icon name="arrowLeft" size={18} /> Volver al acceso</Link>
      </section>
    )
  }

  return (
    <section className="apply" aria-labelledby="titulo-paso">
      <div className="apply__intro">
        <h1>Postula a la Red de Socios Comerciales</h1>
        <p>Toma unos 5 minutos. Solo pedimos lo necesario para una primera revisión: nada de documentos ni datos bancarios en esta etapa.</p>
      </div>

      <ol className="apply__steps" aria-label="Pasos de la postulación">
        {steps.map((s, i) => (
          <li key={s} className={i < step ? 'is-done' : i === step ? 'is-current' : ''} aria-current={i === step ? 'step' : undefined}>
            <span>{i < step ? <Icon name="check" size={14} /> : i + 1}</span> {s}
          </li>
        ))}
      </ol>

      <div className="card apply__card">
        <h2 id="titulo-paso" tabIndex={-1} ref={headingRef}>Paso {step + 1} de {steps.length}: {steps[step]}</h2>

        {step === 0 && (
          <div className="apply__fields">
            <Field id="nombre" label="Nombre completo" error={errors.nombre}>{input('nombre', { autoComplete: 'name' })}</Field>
            <Field id="correo" label="Correo electrónico" error={errors.correo}>{input('correo', { type: 'email', autoComplete: 'email', inputMode: 'email' })}</Field>
            <Field id="telefono" label="Teléfono o WhatsApp" hint="Ejemplo: +51 987 654 321" error={errors.telefono}>{input('telefono', { type: 'tel', autoComplete: 'tel', inputMode: 'tel' })}</Field>
          </div>
        )}

        {step === 1 && (
          <fieldset className="apply__territories">
            <legend>¿En qué territorio trabajarías?</legend>
            {territories.map((t) => {
              const st = territoryStates[t.state]
              const available = t.state === 'abierta'
              return (
                <label key={t.id} className={`territory${data.territorio === t.id ? ' is-selected' : ''}${available ? '' : ' is-muted'}`}>
                  <input type="radio" name="territorio" id={t.id === territories[0].id ? 'territorio' : undefined}
                    value={t.id} checked={data.territorio === t.id} onChange={() => set('territorio', t.id)} />
                  <span className="territory__name">{t.name}<small>{t.region}</small></span>
                  <Badge tone={st.tone}>{st.label}</Badge>
                </label>
              )
            })}
            {errors.territorio && <p className="field__error">{errors.territorio}</p>}
            {territory && territory.state !== 'abierta' && (
              <p className="apply__info"><Icon name="info" size={16} /> {territory.name} aún no recibe postulaciones. Guardaremos tu interés para avisarte cuando abra la convocatoria.</p>
            )}
          </fieldset>
        )}

        {step === 2 && (
          <div className="apply__fields">
            <Field id="experiencia" label="Experiencia en ventas a empresas" error={errors.experiencia}>
              {select('experiencia', ['Sin experiencia', 'Menos de 1 año', '1 a 3 años', 'Más de 3 años'])}
            </Field>
            <Field id="sectores" label="Sectores que conoces (opcional)" hint="Ejemplo: salud, educación, comercio">{input('sectores')}</Field>
            <Field id="disponibilidad" label="Horas por semana que puedes dedicar" error={errors.disponibilidad}>
              {select('disponibilidad', ['Hasta 5 horas', '5 a 10 horas', '10 a 20 horas', 'Más de 20 horas'])}
            </Field>
            <Field id="motivo" label="¿Por qué quieres ser Partner? (opcional)">
              {(a) => <textarea {...a} value={data.motivo} onChange={(e) => set('motivo', e.target.value)} maxLength={500} />}
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="apply__consent">
            <p>Antes de enviar, ten en cuenta que postular no garantiza el ingreso y que no puedes presentarte como representante de TUPLUS hasta tu activación formal.</p>
            {[['privacidad', 'Acepto el aviso de privacidad para candidatos'], ['terminos', 'Acepto los términos de la Red de Socios']].map(([name, text]) => (
              <div key={name} className={`check${errors[name] ? ' check--error' : ''}`}>
                <input type="checkbox" id={name} checked={data[name]} onChange={(e) => set(name, e.target.checked)}
                  aria-describedby={errors[name] ? `${name}-error` : undefined} aria-invalid={errors[name] ? true : undefined} />
                <label htmlFor={name}>{text}</label>
                {errors[name] && <p className="field__error" id={`${name}-error`}>{errors[name]}</p>}
              </div>
            ))}
            <p className="muted apply__version">Versión que aceptas: {CONSENT_VERSION}</p>
          </div>
        )}

        {step === 4 && (
          <dl className="apply__review">
            {[['Nombre', data.nombre], ['Correo', data.correo], ['Teléfono', data.telefono], ['Territorio', territory?.name],
              ['Experiencia', data.experiencia], ['Sectores', data.sectores || 'No indicado'], ['Disponibilidad', data.disponibilidad]].map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
        )}

        <div className="apply__actions">
          {step > 0 && <button type="button" className="btn btn-ghost" onClick={back}>Volver</button>}
          <span className="apply__saved" aria-live="polite">{saved && step < 4 ? 'Borrador guardado en este navegador' : ''}</span>
          {step < steps.length - 1
            ? <button key="continuar" type="button" className="btn btn-primary" onClick={next}>Continuar</button>
            : <button key="enviar" type="button" className="btn btn-gold" onClick={submit}>Enviar postulación</button>}
        </div>
      </div>
    </section>
  )
}

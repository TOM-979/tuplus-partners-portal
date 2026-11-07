# Portal TUPLUS Partners

El sistema privado de la Red de Socios Comerciales. Es un proyecto **separado de la web corporativa** (Astro) y se conecta con ella mediante un enlace de acceso y la API de `tuplus-partners-api` (repositorio aparte).

**Estado: completo y funcional.** Inicio de sesión real con doble verificación, postulación, panel comercial, CRM, Academia y panel de Dirección funcionan contra la API — no quedan datos de muestra ni "modo demostración". Lo único pendiente es conectarlo con la web corporativa y el AdminPanel, que se hace desde esos otros dos repositorios (ver "Cómo conectarlo con la web y el AdminPanel" en el `README.md` de `tuplus-partners-api`).

## Cómo usarlo

Necesita la API corriendo (ver `tuplus-partners-api/README.md`: `npm install`, `.env`, `npm run db:reiniciar`, `npm run dev`, por defecto en `http://localhost:4000`).

```bash
npm install
cp .env.example .env   # por defecto ya apunta a http://localhost:4000/api
npm run dev             # abre http://localhost:5173
```

Otros comandos: `npm run build` (versión final en `dist/`) y `npm run preview` (prueba la versión final).

Entra con una cuenta real (creada en la API, por ejemplo con `npm run db:demo` en `tuplus-partners-api`):

| Correo | Contraseña | Verás |
|---|---|---|
| `partner@tuplus.pe` | `Partner.2026` | Panel comercial, CRM (solo su cartera), Academia, perfil |
| `direccion@tuplus.pe` | `Direccion.2026` | Pide un código de 6 dígitos (se imprime en la consola de la API en desarrollo), luego el Panel de Dirección |

## Pantallas

| Ruta | Pantalla | Quién la ve | De dónde vienen los datos |
|---|---|---|---|
| `/acceso` | Inicio de sesión (con doble verificación para Dirección) | Todos | `POST /auth/login`, `POST /auth/codigo` |
| `/postulacion` | Postulación a la Red en 5 pasos | Todos (público) | `GET /territorios`, `POST /postulaciones` |
| `/` | Panel comercial personalizado | Partner | `GET /perfil`, `GET /crm`, `GET /academia/cursos` |
| `/perfil` | Perfil, código, rango e historial de cambios | Partner / Líder Regional | `GET /perfil`, `GET /perfil/historial`, `PATCH /auth/contrasena` |
| `/crm` | Oportunidades por etapa | Partner (lo suyo) · Líder Regional (su territorio) · Dirección (todo) | `GET/POST/PATCH /crm` |
| `/academia` | Cursos y lecciones por nivel | Partner / Líder Regional | `GET /academia/cursos`, `GET /academia/cursos/:id`, `POST .../completar` |
| `/niveles` | Niveles L0–L6 | Todos los que iniciaron sesión | `GET /niveles` (público) |
| `/direccion` | Territorios, bandeja de revisión, activación de Partners | Dirección / Líder Regional | `GET /direccion/...`, `PATCH/POST /direccion/...` |
| `/arquitectura` | Ecosistema y etapas de desarrollo | Dirección | Contenido fijo (`src/data/roadmap.js`) |

Cualquier ruta que no exista muestra una pantalla de "No encontramos esta página" con un enlace de vuelta al inicio.

## Estructura

```
src/
├── components/     un componente por carpeta (.jsx + .css)
│   ├── AvisoConexion/  aviso cuando el navegador pierde internet
│   ├── Badge/          etiqueta de estado
│   ├── Estado/         Cargando / ErrorEstado / Vacío, para cuando depende de la API
│   ├── Field/          campo de formulario con etiqueta y error
│   ├── Icon/           iconos de línea
│   ├── LevelLadder/    escalera de rangos L0–L5
│   ├── Logo/           logo oficial TUPLUS
│   ├── PageHeader/     título y acciones de cada pantalla
│   ├── ProgressBar/    barra de avance
│   └── StatCard/       cifra con etiqueta
├── context/        AuthContext: sesión real (token, 2FA, cierre por inactividad)
├── lib/            api.js: cliente HTTP hacia la API (agrega el token, atrapa errores)
├── layouts/        AppLayout (con menú) y PublicLayout (acceso/postulación)
├── pages/          una carpeta por pantalla, incluida NoEncontrado (404)
├── styles/         tokens.css (colores, letras, espacios) y base.css
├── App.jsx         rutas y permisos por rol (el servidor los vuelve a validar)
└── main.jsx
public/             logo claro, logo para fondo oscuro, colibrí y favicon
```

## Sesión

- El token (JWT) que entrega la API se guarda en `localStorage` y se manda en cada solicitud.
- Si la API responde que la sesión no es válida (401), el portal cierra sesión solo y explica por qué en `/acceso`.
- Si no hay actividad del mouse/teclado por `VITE_INACTIVIDAD_MINUTOS` (30 por defecto, configurable en `.env`), cierra sesión solo, por seguridad.
- Dirección debe confirmar un código de 6 dígitos enviado a su correo antes de entrar (doble verificación).

## Marca

| Token | Color | Uso |
|---|---|---|
| `--navy-950` | `#0a152c` | Menú lateral y fondos oscuros (tomado del logo oficial) |
| `--navy-900` | `#0f2038` | Botón principal |
| `--gold-500` | `#cb9d54` | Ala del colibrí: rango actual, avance y foco |
| `--gold-ink` | `#7a5a1c` | Texto dorado sobre fondo claro |

Tipografías: Saira (títulos, cercana a las letras del logo) y Public Sans (texto). Están incluidas en el proyecto, no dependen de internet.

## Reglas que sigue (documento WEB-02)

- La postulación no pide documento de identidad ni datos bancarios en el primer paso (el servidor descarta cualquier campo extra).
- Solo se puede postular a un territorio con convocatoria **abierta**.
- Postular no garantiza ingreso ni autoriza a representar a TUPLUS: se dice antes y después de enviar.
- La decisión de activar a un Partner la toma una persona (Dirección o Líder Regional de ese territorio) y queda en el historial.
- No se muestran comisiones ni porcentajes sin aprobación.
- El Partner solo ve sus propias oportunidades en el CRM; el Líder Regional, las de su territorio.

## Cómo conectarlo con la web y el AdminPanel

Esto se hace desde los otros repositorios, no desde este:

1. Desplegar `tuplus-partners-api` (ver su README) y este portal cada uno en su dominio (por ejemplo `partners.tuplus.pe` para este portal).
2. En este repo, definir `.env` en producción con `VITE_API_URL=https://api.tuplus.pe/api` (la URL real de la API ya desplegada).
3. En la web corporativa (Astro), agregar un enlace o botón "Acceso Partners" que lleve a `https://partners.tuplus.pe/acceso`, y cambiar el formulario de postulación para llamar directamente a la API (ver el README de `tuplus-partners-api`) o enlazar a `https://partners.tuplus.pe/postulacion`.
4. El AdminPanel (ASP.NET Core), si necesita leer o decidir postulaciones/Partners, llama a las rutas `/api/direccion/...` de la misma API — no hace falta tocar este repositorio para eso.

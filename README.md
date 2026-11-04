# Portal TUPLUS Partners (base)

Base del Portal TUPLUS Partners: el sistema privado de la Red de Socios Comerciales. Es un proyecto **separado de la web corporativa** (Astro) y se conecta con ella mediante un enlace de acceso y una API segura.

> Es una base de demostración: no tiene inicio de sesión real ni guarda datos en un servidor. Todos los datos son de muestra.

## Cómo usarla

```bash
npm install
npm run dev        # abre http://localhost:5173
```

Otros comandos: `npm run build` (versión final en `dist/`) y `npm run preview` (prueba la versión final).

En la pantalla de acceso elige **Entrar como Partner** o **Entrar como Dirección**. Desde el menú lateral puedes cambiar de vista.

## Pantallas

| Ruta | Pantalla | Quién la ve |
|---|---|---|
| `/acceso` | Acceso al portal | Todos |
| `/postulacion` | Postulación a la Red en 5 pasos | Todos (público) |
| `/` | Panel comercial personalizado | Partner |
| `/perfil` | Perfil, código, rango y permisos | Partner |
| `/crm` | CRM de oportunidades por etapa | Partner (solo lo suyo) y Dirección (todo) |
| `/academia` | Academia Comercial · Aula 2 Plus | Partner y Dirección |
| `/niveles` | Niveles L0–L6 | Partner y Dirección |
| `/direccion` | Panel de Dirección: territorios, revisión y comisiones | Dirección |
| `/arquitectura` | Ecosistema y etapas de desarrollo | Dirección |

## Estructura

```
src/
├── components/     una carpeta por componente, con su .jsx y su .css
│   ├── Badge/          etiqueta de estado
│   ├── Field/          campo de formulario con etiqueta y error
│   ├── Icon/           iconos de línea
│   ├── LevelLadder/    escalera de rangos L0–L5
│   ├── Logo/           logo oficial TUPLUS
│   ├── PageHeader/     título y acciones de cada pantalla
│   ├── ProgressBar/    barra de avance
│   └── StatCard/       cifra con etiqueta
├── context/        rol de demostración (Partner o Dirección)
├── data/           datos de muestra: niveles, territorios, CRM, Academia, postulaciones, etapas
├── layouts/        estructura con menú lateral (AppLayout) y páginas públicas (PublicLayout)
├── pages/          una carpeta por pantalla
├── styles/         tokens.css (colores, letras, espacios) y base.css
├── App.jsx         rutas y permisos por rol
└── main.jsx
public/             logo claro, logo para fondo oscuro, colibrí y favicon
```

## Qué cubre en cada etapa

| Etapa | Qué pide Dirección | Qué hay en esta base | Qué falta |
|---|---|---|---|
| 1. Portal y seguridad | Registro, perfiles, códigos, niveles L0–L6, permisos | Postulación, perfil, niveles, vistas por rol | Inicio de sesión real, API, base de datos MySQL, permisos en el servidor |
| 2. Academia | Módulos, evaluaciones, certificados | Módulos por nivel con avance y certificados | Contenidos, evaluaciones reales, gestión de módulos |
| 3. CRM B2B | Empresas, contactos, oportunidades, ventas, posventa | Tablero por etapa y registro de oportunidades | Integración con el CRM elegido (EspoCRM por evaluar) |
| 4. Gestión ejecutiva | Comisiones, reportes, supervisión regional | Panel con territorios, bandeja de revisión e historial | Comisiones (bloqueadas hasta aprobación), reportes |

## Marca

| Token | Color | Uso |
|---|---|---|
| `--navy-950` | `#0a152c` | Menú lateral y fondos oscuros (tomado del logo oficial) |
| `--navy-900` | `#0f2038` | Botón principal |
| `--gold-500` | `#cb9d54` | Ala del colibrí: rango actual, avance y foco |
| `--gold-ink` | `#7a5a1c` | Texto dorado sobre fondo claro |

Tipografías: Saira (títulos, cercana a las letras del logo) y Public Sans (texto). Están incluidas en el proyecto, no dependen de internet.

## Reglas que sigue (documento WEB-02)

- La postulación no pide documento de identidad ni datos bancarios en el primer paso.
- Postular no garantiza ingreso ni autoriza a representar a TUPLUS: se dice antes y después de enviar.
- El puntaje ayuda a priorizar; la decisión la toma una persona y queda en el historial.
- No se muestran comisiones ni porcentajes sin aprobación.
- El Partner solo ve sus oportunidades en el CRM.

## Por confirmar en la reunión técnica

- **L6:** WEB-02 define L0 a L5 como rangos y Líder Regional como función. Aquí se muestra como L6.
- **CRM:** EspoCRM está por evaluar; el tablero actual es solo la interfaz.
- **Academia:** módulo propio ahora; Moodle como posible evolución.
- **Alojamiento:** qué queda en Hostinger y qué necesita un servidor aparte.

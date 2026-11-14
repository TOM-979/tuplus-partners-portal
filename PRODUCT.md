# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Partner (socio comercial):** vendedor de la Red TUPLUS Partners. Usa el portal a diario, en celular y en laptop, para registrar y mover oportunidades en el CRM, llevar seguimiento, estudiar en la Academia y ver su rango.
- **Líder Regional:** supervisa a los Partners de su territorio; ve su cartera, reportes y comisiones.
- **Dirección:** decide, desde laptop, sobre postulaciones, activación de Partners, convocatorias por territorio, cursos y comisiones.
- **Postulante (público):** persona que aún no es Partner y envía su postulación.

## Product Purpose
Portal privado del Sistema Master Partner de TUPLUS (servicios y soluciones web B2B). Reúne acceso seguro, postulación, niveles L0–L6, Academia con evaluación y certificados, CRM B2B y gestión ejecutiva. Éxito: cada Partner sabe qué hacer hoy para vender y avanzar de rango, y Dirección decide con datos reales y respaldo.

## Positioning
La red comercial de TUPLUS en un solo lugar: formación certificada, CRM y comisiones aprobadas por una persona, con historial de cada decisión.

## Operating Context
Frontend React + Vite conectado a `tuplus-partners-api` (Node/Express/MySQL). Todos los permisos los valida el servidor. Dirección entra con doble verificación por código de 6 dígitos. Se despliega en Vercel.

## Capabilities and Constraints
- Sin datos de muestra ni modo demostración: todo viene de la API.
- Postular no pide documento ni datos bancarios; no garantiza ingreso ni autoriza a representar a TUPLUS.
- No se muestran comisiones ni porcentajes sin aprobación de Dirección.
- Cada Partner solo ve sus oportunidades; el Líder Regional, las de su territorio.
- Accesibilidad: foco visible, contraste AA, navegación por teclado, respeto de reduced-motion.
- Español de Perú; importes en USD y PEN.

## Brand Commitments
- Logo oficial y colibrí: no se modifican.
- Azul marino (#0a152c) y dorado (#cb9d54) del logo se conservan como identidad.
- Tipografía y resto del lenguaje visual: abiertos a mejora (tipografías actuales Saira y Public Sans, no obligatorias).
- Voz: profesional y cercana. Seria con el dinero y las decisiones, y que anima al Partner a avanzar.

## Evidence on Hand
Datos reales solo desde la API. No hay testimonios, cifras de ingresos ni casos de éxito aprobados: no se deben inventar.

## Product Principles
1. Cada pantalla responde "¿qué hago ahora?" antes que "¿qué hay aquí?".
2. Lo que toca dinero o decisiones se muestra claro, con estado y respaldo; nunca se insinúa un monto sin aprobar.
3. Celular primero para el Partner: las acciones frecuentes se alcanzan con una mano.
4. Mostrar el estado real (cargando, vacío, error) en vez de rellenar con datos falsos.

## Arquitectura

El proyecto sigue una **arquitectura basada en rutas y módulos funcionales, con colocation como criterio de organización**. No exige una cadena de abstracciones ni organizar todo en capas globales.

### 1. Rutas: puntos de entrada

`app/` contiene la aplicación.

- **`page.tsx`** define y compone la vista de una URL.
- **`layout.tsx`** mantiene una estructura compartida entre rutas.
- **Los grupos `(group)`** organizan rutas y layouts sin agregar segmentos a la URL.

La página puede componer directamente sus componentes. No necesita un contenedor intermedio obligatorio.

### 2. Módulos: unidades de responsabilidad

Un módulo reúne lo necesario para una responsabilidad concreta: componentes, hooks, lógica, tipos y recursos.

**Su ubicación depende de quién lo consume:**

- Un único consumidor: junto a él.
- Varias rutas: en su ancestro común más cercano.
- Toda la aplicación: en el nivel raíz correspondiente.

Usá carpetas privadas como `_components/`, `_hooks/` y `_dal/` para organizar implementaciones sin crear rutas.

Compartir un módulo no significa desarmarlo y repartir sus archivos entre carpetas genéricas. Conservá su identidad funcional al moverlo a un scope compartido.

### 3. UI genérica y módulos funcionales

Son categorías diferentes:

- **UI genérica:** presentación reutilizable, sin conocimiento del negocio ni consultas de datos.
- **Módulo funcional:** implementa un comportamiento concreto y puede coordinar datos, estado y presentación.

Ambos pueden compartirse, pero conservan responsabilidades distintas.

### 4. Acceso a datos

El DAL encapsula cómo se obtienen los datos y sus contratos.

Los **Server Components consumidores** realizan las consultas cerca de donde presentan sus resultados. No se concentran consultas en un padre solamente para distribuirlas mediante props.

Pasar props sigue siendo válido: lo que evitamos es intermediación innecesaria.

### 5. Servidor y cliente

- **Servidor:** acceso a datos y renderizado que no requiere interacción del navegador.
- **Cliente:** estado interactivo, eventos y APIs del navegador.

La frontera cliente se mantiene cerca de la interacción; no convierte automáticamente toda una vista en componente cliente.

### 6. Dirección de dependencias

```text
Entradas de rutas
       ↓
Módulos locales o compartidos
       ↓
UI genérica · DAL · utilidades
```

Los módulos compartidos no dependen de páginas ni de sus implementaciones privadas. Las rutas pueden compartir módulos, pero no importar los detalles internos de otras rutas.

Este esquema indica la dirección de las dependencias, no una cadena obligatoria de capas. Una página puede consumir directamente UI genérica o el DAL cuando le corresponda.

### 7. Criterio de abstracción

**Primero composición local; después extracción justificada.**

Se extrae cuando existe reutilización real o una responsabilidad suficientemente clara para encapsular. No se introducen wrappers solamente para consultar datos o reenviar props.

Los mecanismos especiales del framework se eligen por el comportamiento que necesitás, no para aparentar modularidad.

**En síntesis:** ubicación por consumidores, límites por responsabilidad y abstracciones por necesidad comprobada.

## Composición institucional y header

- `UserenaLayout`, en `app/_features/userena/`, compone la franja institucional, el contenido recibido y el pie institucional sin agregar un contenedor DOM.
- `HeaderLayout`, en `app/_features/header/`, incorpora el header y superpone el contenido recibido mediante una grilla. Su límite excluye la franja y el pie institucionales; el footer del proyecto sigue siendo contenido del layout raíz.
- Ambos layouts son Server Components. `HeaderRuntime` mantiene la frontera cliente para la navegación y los estados visuales.
- El header usa `sticky` para comenzar debajo de la franja institucional desde el primer render, sin calcular un `top` en el cliente ni desplazar el hero. Al abrir el menú, el header conserva su posición `sticky` y la misma animación de expansión. La altura disponible se calcula desde su propio layout, sin medir elementos institucionales, y se limita al viewport y al borde inferior de ese layout. El panel y su fondo usan esa misma altura; la barra no se contrae si queda menos espacio que su altura habitual.
- En la home permanece transparente y visible hasta que el marcador `data-header-solid-start` del mapa entra en el viewport. Desde ese punto es sólido y se oculta al bajar o reaparece al subir, con el umbral existente de 6 px. En rutas sin marcador es sólido cuando `scrollY > 0`; al inicio de la página o con el menú abierto permanece visible. La animación de ocultamiento sigue usando `translate`.

## Carga del mapa y del cielo

- El contenedor del mapa conserva su tamaño desde el render inicial. `DeferredMapCanvas` activa la descarga de MapLibre y su montaje cuando el mapa se aproxima a un viewport de distancia; después permanece montado. Si `IntersectionObserver` no está disponible, se carga directamente. Los filtros y el detalle conservan su estado en `MapExplorer`.
- Las imágenes del cielo usan la optimización responsive de Next y un `sizes` que contempla el ancho real del plano 16:9 también en pantallas verticales. No se fuerza el archivo 2x por resolución de pantalla. El composite inicial/fallback tiene prioridad alta; los originales generados se conservan sin cambios.
- Los logos del header y de la franja institucional declaran tamaños de descarga acordes a su presentación. Se mantienen las dimensiones y estilos existentes.

La validación visual y los nuevos resultados de Lighthouse se realizan sobre el despliegue de producción; las comprobaciones de compilación no prueban una mejora de puntuación.

## Proyecto y equipo

- `/proyecto` presenta el propósito, las actividades, recomendaciones y el equipo de IluminAconciencia.
- `/equipo` utiliza la misma composición y, al hidratarse, cambia la URL a `/proyecto` y desplaza el foco al equipo, sin fragmentos ni identificadores de sección. Al recargar `/proyecto`, comienza desde arriba.
- Ambas rutas están agrupadas en `app/(site)/(proyecto)/`. El contenido se renderiza en servidor; solo la navegación local y los `InfoPopover` necesitan interactividad cliente.
- El índice del sidebar desplaza y enfoca las secciones sin modificar la URL. Sin JavaScript, el contenido completo sigue disponible para lectura.
- Las fuentes institucionales están enlazadas en la página. La nómina refleja la publicación institucional, no una confirmación independiente de cargos actuales. No se presentan metas históricas de nodos ni promesas de actualización como hechos actuales.

## Noticias: API y caché

Configurá `API_BASE_URL` en `.env.local` para desarrollo y en el entorno de build y ejecución del despliegue:

```dotenv
API_BASE_URL=https://iluminaconciencia.userena.digital/api/v1/
```

La variable es exclusiva del servidor. El DAL consulta `noticias/?format=json` y usa el schema de Zod en `app/_dal/news/schemas/` para validar y transformar la respuesta; los tipos se derivan del schema. No hay un mapper separado ni un snapshot de respaldo. La API debe estar disponible durante el build, que genera las rutas de detalle.

- **Caché:** tag `noticias`, revalidación SWR a los 7 días y expiración a los 30 días totales; el router cliente puede reutilizar el resultado durante 5 minutos.
- **Eventos:** el tag permite invalidación desde un contexto de servidor. El receptor del evento y su autenticación no están incluidos; al conectarlos, hay que elegir explícitamente la ventana de contenido desactualizado.
- **Límites:** la revalidación necesita una lectura; no es un cron ni garantiza frescura semanal si la API falla. La caché en memoria puede perderse con reinicios o despliegues.
- **Presentación:** se respeta `mostrar`, se ignora `mostrar_principal` y se ordena por fecha descendente. Home muestra las últimas 3 noticias y el sidebar las últimas 5.
- **Identidad:** ID basado en el timestamp de publicación; URL con título normalizado sin timestamp. Las colisiones entre noticias visibles se resuelven en orden de respuesta con sufijos incrementales `-2`, `-3`, etc., saltando los slugs ya ocupados, sin solicitudes adicionales. Cambiar el título o el orden de entrada puede reasignar slugs existentes. Las URLs anteriores con timestamp no tienen redirección.
- **Contenido y fechas:** el detalle procesa únicamente `cuerpo` con la sanitización existente. Los enlaces relativos usan el origen configurado de la API, sin inventar URLs de detalle. La fecha conserva el offset recibido y se formatea al consumirla, sin convertir de nuevo su hora chilena ni agregar un polyfill.

Los errores HTTP, timeouts y respuestas inválidas se propagan: no se sustituyen por una lista vacía ni por un snapshot.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

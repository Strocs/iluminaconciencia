# Arquitectura

El proyecto organiza el código por rutas y responsabilidades concretas. El punto de entrada es la página correspondiente y sus imports, sin una cadena obligatoria de capas.

[Volver al README](../README.md)

## Cómo se compone una pantalla

Una URL llega a su `page.tsx`. Next la coloca dentro de los `layout.tsx` de sus carpetas antecesoras. La página compone componentes y módulos; los componentes de servidor que consumen datos llaman al DAL cerca de donde los necesitan.

El DAL obtiene respuestas de la API y las valida con Zod. La presentación recibe datos ya preparados; no necesita conocer los nombres de campos originales ni repetir formatos de fecha.

## Archivos y nombres

| Nombre                                         | Significado                                                                                                       |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `page.tsx`                                     | Pantalla pública de un segmento de URL. Tiene un export default requerido por Next.                               |
| `layout.tsx`                                   | Estructura compartida que envuelve las páginas descendientes mediante `children`. Next la aplica automáticamente. |
| `route.ts`                                     | Endpoint HTTP con exports por método, como `POST`; no es una pantalla.                                            |
| `(site)`, `(home)`, `(proyecto)`               | Grupos organizativos. Los nombres entre paréntesis no agregan segmentos a la URL.                                 |
| `[slug]`, `[punto-id]`                         | Segmentos variables de una URL. Los valores se reciben en `params`.                                               |
| `_components/`                                 | Presentación local; no crea rutas públicas.                                                                       |
| `_features/`                                   | Módulos funcionales que reúnen composición, lógica y sus componentes internos.                                    |
| `_dal/`                                        | Acceso a datos y sus contratos.                                                                                   |
| `_hooks/`, `_utils/`, `_assets/`, `_sections/` | Hooks, utilidades, recursos y secciones locales, respectivamente.                                                 |
| `index.tsx`                                    | Archivo convencional de entrada/exportación de un módulo. No crea una URL.                                        |
| `@/`                                           | Alias a `app/`; por ejemplo, `@/_components/Button`.                                                              |

Una carpeta privada no es una barrera de seguridad: organiza código fuera del enrutamiento. Las credenciales siguen siendo exclusivas del servidor.

## Dónde colocar código

- **Una ruta lo usa:** junto a esa ruta.
- **Varias rutas lo usan:** en su ancestro común más cercano.
- **Pertenece a una funcionalidad:** mantener el módulo y su responsabilidad, sin repartirlo entre carpetas genéricas.

Por ejemplo, noticias tiene componentes en `app/(site)/noticias/_components/`, mientras `getNews()` vive en `app/_dal/news/` porque lo consumen portada, páginas interiores y módulos compartidos.

Los módulos compartidos no importan implementaciones privadas de una ruta. El código propio utiliza exports e imports nombrados; los exports default de páginas y layouts son la excepción del framework.

## Servidor y navegador

- Los componentes son **de servidor por defecto**. Pueden llamar al DAL sin enviar esa implementación al navegador.
- [`'use client'`](https://nextjs.org/docs/app/api-reference/directives/use-client) delimita los componentes con interacción, eventos y APIs como `window`; conviene mantener esa frontera cerca de la interacción.
- Que un componente cliente reciba contenido servidor mediante `children` no convierte ese contenido automáticamente en código cliente.
- Las consultas se realizan desde el componente servidor consumidor, no desde un wrapper creado solo para reenviar resultados.

El paso de props es válido; elevar consultas a páginas o layouts requiere una responsabilidad concreta que lo justifique.

## Layouts y wrappers actuales

`app/layout.tsx` configura el documento global y compone `UserenaLayout`, `HeaderLayout` y el footer del proyecto. Esos dos componentes son wrappers ordinarios: reciben `children` y se aplican porque el layout raíz los importa.

`app/(site)/layout.tsx` define el `<main>`, sus márgenes internos y el adaptador de parámetros de URL para las páginas interiores. La home usa su propio `<main>` en `app/(home)/page.tsx` y no hereda el layout de `(site)`.

El header, el pie y el `<main>` ya forman parte de los layouts existentes, sin necesidad de repetirlos en cada página. Un layout nuevo debe aportar una estructura compartida concreta; un wrapper es opcional y solo se extrae cuando hay una responsabilidad o reutilización real.

Los ejemplos de creación y uso están en la [guía de rutas](guides/adding-routes.md).

## Estilos y datos

[Tailwind CSS](https://tailwindcss.com/docs/styling-with-utility-classes) define estilos mediante clases de utilidad en el marcado: `p-4` aplica padding y `md:flex` activa flex desde el breakpoint `md`. Los componentes propios utilizan estas utilidades; CSS Modules queda reservado para sobrescribir estilos de paquetes externos.

La función [`cn()`](../app/_utils/cn.ts) combina clases condicionales con `clsx` y resuelve conflictos entre utilidades de Tailwind con `tailwind-merge`, dando prioridad a la última clase incompatible. Por ejemplo, `cn('px-4', { 'px-6': true })` devuelve `'px-6'`. Las utilidades de un único consumidor permanecen junto a él.

Las consultas y los tiempos de caché se describen en [Datos y revalidación](guides/data-and-revalidation.md). El webhook y la extensión de endpoints tienen su propia [guía de la API](guides/api.md). Los archivos públicos del cielo conservan su atribución en `public/hero/CREDITS.txt` y `public/hero/source.json`.

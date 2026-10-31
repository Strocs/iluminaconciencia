# Crear una ruta y componer su contenido

Elegí primero qué estructura debe heredar la página. Para una página interior normal, usá `app/(site)/`: ya incluye el header y los pies globales, además del `<main>` y espaciado de las páginas interiores.

[Volver al README](../../README.md) · [Arquitectura](../architecture.md)

## 1. Crear la página

Para publicar `/observatorio`, creá `app/(site)/observatorio/page.tsx`:

```tsx
import { SectionHeading } from '@/_components/SectionHeading'

export default function ObservatoryPage() {
  return (
    <div className="space-y-6">
      <SectionHeading as="h1" eyebrow="OBSERVATORIO" title="Observatorio" />
      <p>Información del observatorio y sus actividades.</p>
    </div>
  )
}
```

No hace falta registrar la URL en otro archivo ni crear un layout nuevo. Next aplica, en orden, `app/layout.tsx`, `app/(site)/layout.tsx` y la página. `(site)` no aparece en la URL.

Para separar una presentación extensa, creá componentes con exports nombrados en `observatorio/_components/` e importalos desde la página. No hace falta extraer un componente que solo reenvía props.

## 2. Usar layouts

Un `layout.tsx` se aplica automáticamente a todas las páginas bajo su carpeta. Crealo solo si hay estructura que deba compartirse, por ejemplo entre `/observatorio` y `/observatorio/visitas`.

Ejemplo opcional en `app/(site)/observatorio/layout.tsx`:

```tsx
import type { ReactNode } from 'react'
import Link from 'next/link'

export default function ObservatoryLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-8">
      <nav aria-label="Observatorio">
        <Link href="/observatorio">Información</Link>
        <Link href="/observatorio/visitas">Visitas</Link>
      </nav>
      {children}
    </div>
  )
}
```

El enlace de visitas requiere crear también `observatorio/visitas/page.tsx`. No importes este layout manualmente en las páginas: Next ya las envuelve con él. Los layouts antecesores siguen aplicándose; este no reemplaza el global ni el de `(site)`.

## 3. Usar wrappers de contenido

Un wrapper es un componente que recibe `children` para aportar una responsabilidad de presentación o composición. No tiene comportamiento especial por su nombre: se importa y usa explícitamente.

Los wrappers institucionales `UserenaLayout` y `HeaderLayout` ya se usan en el layout raíz. No los repitas dentro de la nueva página. Para un wrapper local reutilizado, por ejemplo un panel con espaciado común, podés crear `observatorio/_components/ContentPanel.tsx`:

```tsx
import type { ReactNode } from 'react'

export function ContentPanel({ children }: { children: ReactNode }) {
  return <section className="space-y-6 rounded-lg border border-border p-6">{children}</section>
}
```

Luego importá `ContentPanel` desde `./_components/ContentPanel` en la página y colocá dentro el contenido: `<ContentPanel>…</ContentPanel>`. Si solo necesitás un `<div>` una vez, escribilo directamente: no es obligatorio crear un wrapper.

Conservá un solo `<main>` y un título principal claro. Para compartir un wrapper entre rutas, movelo al ancestro común más cercano, no a una carpeta global por anticipado.

## 4. Datos, parámetros y navegación

- Si la página necesita datos, dejá que su componente servidor consumidor llame al DAL. Mantené los módulos de un único consumidor junto a la ruta.
- Para una URL variable, creá una carpeta como `observatorio/[slug]/page.tsx`. En Next actual, `params` es una promesa: se lee con `const { slug } = await params` en un componente servidor asíncrono. Revisá `app/(site)/noticias/[slug]/page.tsx` como ejemplo real y la [guía de datos](data-and-revalidation.md) para prerenderizado y caché.
- Si debe aparecer en el menú principal, agregá su entrada a `navigationItems` en `app/_features/navigation/navigation.ts`. Crear la ruta no agrega el enlace automáticamente.
- Para enlazar páginas, usá `Link` de `next/link` o componentes existentes como `Button` con `href`. Un endpoint HTTP se crea con `route.ts` y exports por método; no coloques `page.tsx` y `route.ts` en el mismo segmento de URL.

## Metadata de la ruta

Definí título y descripción en el export `metadata` de la página; si varias rutas hijas comparten valores, podés definirlos en su layout común. Seguí la [guía de metadata](editing-metadata.md) para ejemplos, herencia y URLs canonical.

## Comprobación

Abrí `/observatorio` con `pnpm dev`. Revisá que aparezcan una sola vez el header, los pies y el contenido; verificá enlaces, título y espaciado. Si agregaste rutas hijas, comprobá que hereden el layout previsto. Ejecutá `pnpm lint`, `pnpm typecheck` y `pnpm build` antes de dar el cambio por terminado.

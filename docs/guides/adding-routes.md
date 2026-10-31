# Crear una ruta y componer su contenido

El ejemplo utiliza `/recursos`, una página para publicar materiales descargables del proyecto. La ruta y los datos mostrados son ilustrativos; no representan una funcionalidad implementada.

Las páginas interiores pertenecen a `app/(site)/`, que aporta el contenedor principal y sus márgenes internos, además de heredar el header y los pies globales.

[Volver al README](../../README.md) · [Arquitectura](../architecture.md)

## 1. Crear la página

La página de `/recursos` corresponde a `app/(site)/recursos/page.tsx`:

```tsx
import { SectionHeading } from '@/_components/SectionHeading'
import { getResources } from './_dal/getResources'

export default async function ResourcesPage() {
  const resources = await getResources()

  return (
    <div className="space-y-6">
      <SectionHeading as="h1" eyebrow="RECURSOS" title="Materiales descargables" />
      <p>Guías y documentos del proyecto disponibles para descarga.</p>
      <ul className="space-y-4">
        {resources.map((resource) => (
          <li key={resource.id}>
            <a href={resource.href} download>
              {resource.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

Next aplica, en orden, [`app/layout.tsx`](../../app/layout.tsx), [`app/(site)/layout.tsx`](../../app/%28site%29/layout.tsx) y la página, sin un registro adicional de la URL.

Una presentación extensa puede separarse en componentes con exports nombrados dentro de `recursos/_components/`. La consulta permanece en el componente servidor que consume los datos.

## 2. Datos y publicación de descargables

Para un catálogo local, los archivos pueden ubicarse en `public/recursos/` y sus datos en `app/(site)/recursos/_dal/getResources.ts`:

```ts
export async function getResources() {
  return [
    {
      id: 'lighting-guide',
      title: 'Guía de iluminación responsable',
      href: '/recursos/guia-iluminacion.pdf'
    }
  ]
}
```

En este ejemplo, publicar otro descargable consiste en incorporar el archivo y su entrada al catálogo. El PDF indicado también es ilustrativo y tendría que existir para que el enlace funcione.

Si los archivos se suben desde un administrador del backend, el DAL consulta su API y valida los datos antes de devolverlos a la página, siguiendo la [guía de datos y revalidación](data-and-revalidation.md). La carga de archivos y su almacenamiento pertenecen a ese flujo de administración, no al listado público. La ubicación del DAL puede pasar al ancestro común más cercano si otras rutas también consumen el catálogo.

Para una ficha individual, `recursos/[slug]/page.tsx` representa una URL variable. `params` es una promesa y se lee con `const { slug } = await params` en un componente servidor asíncrono. El detalle de noticias ofrece una [referencia real](../../app/%28site%29/noticias/%5Bslug%5D/page.tsx).

## 3. Usar layouts

Un `layout.tsx` permite compartir estructura entre rutas, por ejemplo `/recursos` y `/recursos/guias`. Un layout local solo resulta necesario si ambas páginas comparten una composición adicional.

Ejemplo en `app/(site)/recursos/layout.tsx`:

```tsx
import type { ReactNode } from 'react'
import Link from 'next/link'

export default function ResourcesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-8">
      <nav aria-label="Recursos">
        <Link href="/recursos">Todos los recursos</Link>
        <Link href="/recursos/guias">Guías</Link>
      </nav>
      {children}
    </div>
  )
}
```

La segunda ruta requiere su propio `recursos/guias/page.tsx`. Next aplica el layout automáticamente y conserva los layouts antecesores.

## 4. Usar wrappers de contenido

Un wrapper recibe `children` y aporta una responsabilidad de presentación o composición. A diferencia de `layout.tsx`, se importa explícitamente donde se utiliza.

`UserenaLayout` y `HeaderLayout` ya forman parte del layout raíz. Para un panel reutilizado dentro de recursos, una opción sería `recursos/_components/ContentPanel.tsx`:

```tsx
import type { ReactNode } from 'react'

export function ContentPanel({ children }: { children: ReactNode }) {
  return <section className="space-y-6 rounded-lg border border-border p-6">{children}</section>
}
```

Su uso en la página sería `<ContentPanel>…</ContentPanel>`, con un import desde `./_components/ContentPanel`. Para una única composición sencilla, el marcado puede permanecer en la página. El `<main>` ya está definido en el layout de `(site)`.

## 5. Navegación y metadata

La entrada `{ label: 'Recursos', href: '/recursos' }` en [`navigationItems`](../../app/_features/navigation/navigation.ts) incorpora la página al header y al footer del proyecto. La creación de la ruta y su inclusión en el menú son pasos independientes.

Los enlaces internos utilizan `Link` de `next/link` o componentes existentes como `Button` con `href`. Los enlaces de descarga apuntan al archivo correspondiente.

El export `metadata` de la página define su título y descripción; los valores compartidos por rutas hijas pueden residir en su layout común. La [guía de metadata](editing-metadata.md) utiliza el mismo ejemplo de recursos.

Los endpoints HTTP corresponden a `route.ts`, con exports por método y sin un `page.tsx` en el mismo segmento de URL.

## Comprobación

La revisión de `/recursos` incluye la descarga de los archivos publicados, los enlaces del menú, el título y la composición con los layouts heredados. En caso de rutas hijas, también su estructura compartida. Los scripts `lint`, `typecheck` y `build` cubren análisis estático, tipos y compilación.

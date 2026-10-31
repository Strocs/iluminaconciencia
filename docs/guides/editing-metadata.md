# Editar metadata global y por ruta

La metadata define el título de la pestaña, la descripción y otros datos usados por buscadores y vistas previas al compartir enlaces. Se exporta desde archivos de servidor; no se edita agregando etiquetas `<head>` manualmente al contenido.

[Volver al README](../../README.md) · [Crear rutas](adding-routes.md)

## Valores globales

Editá el bloque `export const metadata: Metadata` existente en `app/layout.tsx`. Conservá el resto del layout y sus wrappers:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IluminAconciencia',
  description: 'Monitoreo de contaminación lumínica y cuidado del cielo nocturno.'
}
```

Estos son los valores de respaldo para las rutas que no los redefinen. Editar el título visible de un componente no modifica automáticamente esta metadata.

## Valores de una página interior

Agregá o editá el export `metadata` en su `page.tsx`. Por ejemplo, en la ruta hipotética `app/(site)/observatorio/page.tsx`:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Observatorio | IluminAconciencia',
  description: 'Información del observatorio y sus actividades.'
}
```

Este bloque acompaña al componente de página; no lo reemplaza. Como referencia real, `app/(site)/(proyecto)/proyecto/page.tsx` ya define título, descripción y canonical propios.

Para valores compartidos por varias rutas hijas, usá el `layout.tsx` de su carpeta común. Un componente wrapper ordinario, como `HeaderLayout`, no define metadata por tener "Layout" en su nombre: el export corresponde al `layout.tsx` o `page.tsx` reconocido por Next.

## Herencia y URLs

- Next combina los valores desde el layout raíz hacia la página. Los campos no redefinidos se heredan; los más específicos reemplazan a los anteriores.
- La combinación no es profunda: redefinir un objeto como `openGraph` puede reemplazar sus campos heredados. Incluí los valores que necesites conservar.
- Actualmente el título global es un string, sin plantilla automática. Por eso los títulos internos incluyen explícitamente `| IluminAconciencia`. Si más adelante se agrega `title.template` a un layout padre, revisá los títulos hijos para no duplicar el nombre del sitio.
- `alternates.canonical` indica la URL pública preferida de una página. No debe apuntar a la API ni al servidor de desarrollo.
- El layout raíz todavía no declara `metadataBase`. Antes de usar URLs relativas nuevas en metadata, configurá esa base con el origen público definitivo o usá URLs absolutas. Por ejemplo, `metadataBase: new URL('https://www.example.com')` en el export global, reemplazando el dominio ilustrativo por el real, permite usar `alternates: { canonical: '/observatorio' }` en la página. Revisá también el canonical relativo existente de `/proyecto` en el despliegue.

## Metadata que depende del contenido

Si cada noticia necesita su propio título y descripción, se usa `generateMetadata()` en `noticias/[slug]/page.tsx`: recibe `params`, espera el slug y obtiene la noticia mediante el DAL existente. No dupliques la URL de la API ni su validación para esa función.

No exportes `metadata` y `generateMetadata` en el mismo archivo. Ambos mecanismos requieren un componente de servidor: si necesitás interacción, extraela a un componente cliente separado en lugar de marcar la página completa con `'use client'`. La metadata dinámica de noticias es una posibilidad de mantenimiento, no una función implementada actualmente en esa página.

## Comprobación

Abrí la ruta y revisá el título de la pestaña y, en las herramientas del navegador, la descripción, el canonical y los tags sociales que hayas definido. Comprobá tanto una página con valores propios como una que herede los globales. Ejecutá `pnpm typecheck` y `pnpm build`; para canonical y URLs de imágenes, verificá además el resultado publicado con el dominio real.

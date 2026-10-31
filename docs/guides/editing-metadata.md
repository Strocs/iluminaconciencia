# Editar metadata global y por ruta

La metadata define el título de la pestaña, la descripción y otros datos usados por buscadores y vistas previas al compartir enlaces. Se exporta desde archivos de servidor; no se edita agregando etiquetas `<head>` manualmente al contenido.

[Volver al README](../../README.md) · [Crear rutas](adding-routes.md)

## Valores globales

La metadata global se define en el bloque `export const metadata: Metadata` de [`app/layout.tsx`](../../app/layout.tsx), sin cambios en la composición del layout:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IluminAconciencia',
  description: 'Monitoreo de contaminación lumínica y cuidado del cielo nocturno.'
}
```

Estos son los valores de respaldo para las rutas que no los redefinen. Editar el título visible de un componente no modifica automáticamente esta metadata.

## Valores de una página interior

El export `metadata` de `page.tsx` define los valores de la ruta. Por ejemplo, en la ruta hipotética `app/(site)/recursos/page.tsx`:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Recursos | IluminAconciencia',
  description: 'Información del recursos y sus actividades.'
}
```

Este bloque acompaña al componente de página; no lo reemplaza. Como referencia real, `app/(site)/(proyecto)/proyecto/page.tsx` ya define título, descripción y canonical propios.

Los valores compartidos por varias rutas hijas corresponden al `layout.tsx` de su carpeta común. Un componente wrapper ordinario, como `HeaderLayout`, no define metadata por tener "Layout" en su nombre: el export corresponde al `layout.tsx` o `page.tsx` reconocido por Next.

## Herencia y URLs

- Next combina los valores desde el layout raíz hacia la página. Los campos no redefinidos se heredan; los más específicos reemplazan a los anteriores.
- La combinación no es profunda: redefinir un objeto como `openGraph` puede reemplazar sus campos heredados. Es necesario incluir los valores que deban conservarse.
- Actualmente el título global es un string, sin plantilla automática. Por eso los títulos internos incluyen explícitamente `| IluminAconciencia`. Si más adelante se agrega `title.template` a un layout padre, conviene revisar los títulos hijos para evitar duplicar el nombre del sitio.
- `alternates.canonical` indica la URL pública preferida de una página. No debe apuntar a la API ni al servidor de desarrollo.
- El layout raíz todavía no declara `metadataBase`. El uso de nuevas URLs relativas requiere configurar esa base con el origen público definitivo; las URLs absolutas son otra opción. Por ejemplo, `metadataBase: new URL('https://www.example.com')` en el export global, reemplazando el dominio ilustrativo por el real, permite usar `alternates: { canonical: '/recursos' }` en la página. El canonical relativo de `/proyecto` también requiere verificación en el despliegue.

## Metadata que depende del contenido

Si cada noticia necesita su propio título y descripción, se usa `generateMetadata()` en `noticias/[slug]/page.tsx`: recibe `params`, espera el slug y obtiene la noticia mediante el DAL existente. La consulta reutiliza la URL y la validación del DAL.

`metadata` y `generateMetadata` son alternativas y no pueden exportarse desde el mismo archivo. Ambos requieren un componente de servidor; la interacción puede quedar en un componente cliente separado. La metadata dinámica de noticias es una posibilidad de mantenimiento, no una función implementada actualmente en esa página.

## Comprobación

La comprobación abarca título, descripción, canonical y tags sociales, tanto en una página con valores propios como en otra con valores heredados. Los scripts `typecheck` y `build` permiten detectar errores de tipos y compilación; el canonical y las URLs de imágenes requieren además comprobar el resultado publicado con el dominio real.

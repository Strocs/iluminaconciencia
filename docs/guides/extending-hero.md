# Editar o agregar una escena del hero

Las escenas son los mensajes con título, texto y botón que se suceden en la portada. Se editan en `app/(home)/_sections/hero/capabilities/scenes/scenes-data.ts`. No hace falta crear una sección nueva ni modificar la estructura visual del hero.

[Volver al README](../../README.md)

## Editar una escena

Buscá su entrada en `heroScenes` y modificá los campos necesarios:

| Campo             | Uso                                                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------------------------------- |
| `id`              | Identificador único y estable; no necesita cambiar al editar el texto.                                               |
| `title.before`    | Parte del título anterior al destacado.                                                                              |
| `title.highlight` | Fragmento destacado; debe estar declarado en `HighlightedTitleFragment`.                                             |
| `title.after`     | Resto del título.                                                                                                    |
| `copy`            | Texto de apoyo.                                                                                                      |
| `cta.label`       | Texto del botón.                                                                                                     |
| `cta.href`        | Ruta de destino, por ejemplo `/proyecto`.                                                                            |
| `cta.section`     | Opcional: actualmente solo admite `explorar`, para desplazar al mapa de la home. En ese caso prevalece sobre `href`. |

Conservá los espacios necesarios entre `before`, `highlight` y `after`: se concatenan tal como están escritos.

## Agregar una escena

1. Agregá un objeto al array `heroScenes`, en la posición donde debe aparecer.
2. Asignale un `id` distinto de los existentes.
3. Si incorporás un destacado nuevo, agregá su texto exacto al tipo `HighlightedTitleFragment` del mismo archivo.

Por ejemplo, agregá `'cuidar la noche'` a la unión de destacados permitidos y luego esta entrada al array:

```tsx
{
  id: 'night-care',
  title: {
    before: 'Podemos ',
    highlight: 'cuidar la noche',
    after: ' con mejores decisiones de iluminación'
  },
  copy: 'Conoce las acciones del proyecto para proteger nuestros cielos.',
  cta: {
    label: 'Conoce el proyecto',
    href: '/proyecto'
  }
}
```

`HeroNarrative`, en `capabilities/scenes/index.tsx`, recorre el array y compone cada entrada con `HeroScene.tsx`. No tenés que importar la nueva escena en la página, crear otro componente ni registrarla en un segundo lugar. El orden del array determina el orden de aparición.

## Recomendaciones y comprobación

- Mantené títulos y textos breves: todas las escenas usan el mismo espacio disponible.
- Conservá al menos una escena. Con la configuración actual, **no superes cuatro escenas**: una quinta requiere coordinar un ajuste de la configuración de la propuesta con su responsable, no solo agregar contenido.
- Usá destinos existentes. Para ir al mapa, conservá el patrón `href: '/'` y `section: 'explorar'`; no inventes valores nuevos de `section`.
- Revisá la portada en escritorio, móvil y pantallas de poca altura. Recorré todas las escenas, probá sus botones y comprobá que el texto no se corte.
- Revisá también el contenido inicial con movimiento reducido; no des por hecho que todas las escenas se muestran en ese modo.
- Ejecutá `pnpm lint`, `pnpm typecheck` y `pnpm build` para detectar errores de código y de los datos tipados. Estas comprobaciones no sustituyen la revisión de lectura y navegación.

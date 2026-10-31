# Editar o agregar una escena del hero

Las escenas son los mensajes con título, texto y botón que se suceden en la portada. Se editan en `app/(home)/_sections/hero/capabilities/scenes/scenes-data.ts`. No hace falta crear una sección nueva ni modificar la estructura visual del hero.

[Volver al README](../../README.md)

## Editar una escena

Cada entrada de `heroScenes` contiene los siguientes campos editables:

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

Los espacios entre `before`, `highlight` y `after` forman parte del texto: los campos se concatenan tal como están escritos.

## Agregar una escena

1. Añadir un objeto al array `heroScenes`, en la posición donde debe aparecer.
2. Asignar un `id` distinto de los existentes.
3. Para un destacado nuevo, añadir su texto exacto al tipo `HighlightedTitleFragment` del mismo archivo.

Por ejemplo, tras añadir `'cuidar la noche'` a la unión de destacados permitidos, la entrada del array sería:

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

`HeroNarrative`, en `capabilities/scenes/index.tsx`, recorre el array y compone cada entrada con `HeroScene.tsx`. La nueva escena no requiere imports en la página, otro componente ni un registro adicional. El orden del array determina el orden de aparición.

## Recomendaciones y comprobación

- Mantener títulos y textos breves: todas las escenas usan el mismo espacio disponible.
- Conservar entre **una y cuatro escenas** con la configuración actual: una quinta requiere coordinar un ajuste de la configuración de la propuesta con su responsable, no solo agregar contenido.
- Utilizar destinos existentes. El mapa utiliza `href: '/'` y `section: 'explorar'`, único valor de `section` admitido actualmente.
- Comprobar la portada en escritorio, móvil y pantallas de poca altura: recorrido de escenas, destinos de botones y texto sin cortes.
- Comprobar también el contenido inicial con movimiento reducido; ese modo no garantiza mostrar todas las escenas.
- Ejecutar los scripts `lint`, `typecheck` y `build` para detectar errores de código y de los datos tipados. Estas comprobaciones no sustituyen la revisión de lectura y navegación.

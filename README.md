# IluminAconciencia

Frontend del proyecto de monitoreo y divulgación de contaminación lumínica de la Región de Coquimbo. Usa Next.js App Router, React, TypeScript y Tailwind CSS. Consulta una API externa para noticias y artículos; el servidor de desarrollo de Next no inicia ese backend.

## Levantar el proyecto

### Requisitos

- Node.js compatible con Next.js 16.3 y pnpm 12; se recomienda Node.js 24 LTS.
- **pnpm 12.8.1**, la versión declarada en `package.json`. Si no lo tenés: `npm install --global pnpm@12.8.1`.
- Acceso a la API desde la máquina donde ejecutás el servidor o el build.

### Instalación y entorno

Desde la raíz del repositorio:

```bash
pnpm install --frozen-lockfile
```

Creá `.env.local` con la URL base de la API:

```dotenv
API_BASE_URL=https://iluminaconciencia.userena.digital/api/v1/
```

`API_BASE_URL` es exclusiva del servidor: no lleva prefijo `NEXT_PUBLIC_` y no debe importarse desde componentes cliente. También debe estar disponible durante el build y la ejecución en producción. No subas `.env.local` al repositorio.

### Servidor de desarrollo

```bash
pnpm dev
```

Abrí [http://localhost:3000](http://localhost:3000). Si el puerto está ocupado, usá la dirección que imprime la terminal, o elegí uno con `pnpm dev --port 3001`. Los cambios de código se recargan automáticamente; reiniciá el servidor si cambiás variables de entorno.

La home está en `app/(home)/page.tsx`, no en `app/page.tsx`. Para detener el servidor, usá `Ctrl+C`.

## Comandos habituales

| Comando                                                                      | Uso                                                                                                |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `pnpm dev`                                                                   | Desarrollo con recarga automática.                                                                 |
| `pnpm build`                                                                 | Compilar y prerenderizar las páginas para producción; necesita acceso a la API.                    |
| `pnpm start`                                                                 | Servir el resultado del último build; ejecutá `pnpm build` antes. No es el servidor de desarrollo. |
| `pnpm lint`                                                                  | Revisar reglas de código.                                                                          |
| `pnpm typecheck`                                                             | Comprobar tipos sin compilar la aplicación.                                                        |
| `pnpm exec prettier --check README.md docs/architecture.md docs/guides/*.md` | Comprobar formato de la documentación de desarrollo.                                               |
| `pnpm format`                                                                | Reformatear archivos del proyecto; modifica archivos, revisá el diff después.                      |

## Arquitectura en breve

Todo el código de la aplicación vive en `app/`. Las rutas componen la pantalla; los módulos cercanos reúnen su presentación, lógica y acceso a datos. Los componentes se ejecutan en el servidor por defecto; solo las partes que necesitan interacción o APIs del navegador se marcan con `'use client'`.

| Ubicación          | Responsabilidad                                                       |
| ------------------ | --------------------------------------------------------------------- |
| `app/layout.tsx`   | Estructura global, fuentes, header y pies institucionales.            |
| `app/(home)/`      | Portada y sus secciones.                                              |
| `app/(site)/`      | Páginas interiores con estructura y espaciado comunes.                |
| `app/_features/`   | Módulos funcionales compartidos, como navegación y footer.            |
| `app/_components/` | Elementos de presentación reutilizables.                              |
| `app/_dal/`        | Consultas y validación de datos compartidos.                          |
| `app/api/`         | Endpoints HTTP propios de Next.js.                                    |
| `public/`          | Archivos públicos servidos desde `/`, sin incluir `public` en la URL. |

Los paréntesis agrupan rutas sin aparecer en la URL y el prefijo `_` identifica carpetas privadas de implementación. No hace falta crear una capa o un wrapper por cada página. Más detalles en [Arquitectura](docs/architecture.md).

## Guías

- [Crear rutas y componer contenido con layouts y wrappers](docs/guides/adding-routes.md).
- [Editar o agregar escenas del hero](docs/guides/extending-hero.md).
- [Editar metadata global y de páginas internas](docs/guides/editing-metadata.md).
- [Consultar datos, usar caché y revalidar por tags](docs/guides/data-and-revalidation.md).
- [Usar y extender la API: contrato, tags, respuestas y diagnóstico](docs/guides/api.md).

La documentación de mantenimiento vive en `docs/` y se versiona. El material histórico de análisis y diseño se conserva en `.docs-archive/`; sus archivos locales siguen ignorados, salvo las copias de respaldo que ya estaban versionadas.

## Problemas frecuentes

- **`API_BASE_URL is required`:** revisá `.env.local` y reiniciá el proceso. En producción configurá la variable tanto en build como en runtime.
- **La API falla o el build no termina correctamente:** comprobá conectividad, URL base y respuesta del backend. Noticias y artículos validan las respuestas; un error no se reemplaza por datos ficticios.
- **El contenido no cambia al editarlo en el backend:** puede estar cacheado. Consultá la guía de datos antes de reconstruir el sitio o borrar archivos locales.
- **`pnpm start` no encuentra el build:** ejecutá `pnpm build` primero. Para programar, usá `pnpm dev`.
- **Algo funciona en desarrollo pero no en producción:** comprobá también con build/start. El despliegue AWS agrega cachés e infraestructura que no se validan solo con el servidor local.

Las guías describen el código actual. La instalación y configuración de Amplify self-managed no están implementadas en este repositorio; no se requiere una cuenta AWS para desarrollar localmente.

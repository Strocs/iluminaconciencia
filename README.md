# IluminAconciencia

Frontend del proyecto de monitoreo y divulgación de contaminación lumínica de la Región de Coquimbo. Usa Next.js App Router, React, TypeScript y Tailwind CSS. Consulta una API externa para noticias y artículos.

## Levantar el proyecto

### Requisitos

- Node.js compatible con Next.js 16.3; se recomienda Node.js 24 LTS.
- **pnpm (recomendado)**, npm o Bun como gestor de paquetes. El proyecto declara `pnpm@12.8.1` en `package.json`; si se utiliza otro gestor o versión, se recomienda actualizar el campo `packageManager` para reflejarlo.
- Acceso a la API durante el desarrollo y el build.

### Instalación y entorno

Una vez clonado el repositorio, la instalación de dependencias con el gestor elegido:

```bash
pnpm install
# Alternativas: npm install / bun install
```

La configuración de entorno toma `.env.example` como referencia para `.env.local`, con las variables necesarias para el entorno:

```dotenv
API_BASE_URL=https://iluminaconciencia.userena.digital/api/v1/
```

### Servidor de desarrollo

```bash
pnpm dev
# Alternativas: npm run dev / bun run dev
```

El log indica la dirección del servidor, normalmente en el puerto 3000.

## Comandos habituales

Los siguientes scripts están definidos en `package.json` y pueden ejecutarse con `pnpm <script>`, `npm run <script>` o `bun run <script>`.

| Script      | Uso                                                                     |
| ----------- | ----------------------------------------------------------------------- |
| `dev`       | Desarrollo con recarga automática.                                      |
| `build`     | Compilación y prerenderizado para producción; requiere acceso a la API. |
| `start`     | Servidor de producción a partir del build.                              |
| `lint`      | Análisis estático de código con ESLint.                                 |
| `typecheck` | Comprobación de tipos con TypeScript.                                   |
| `format`    | Formato del proyecto con Prettier.                                      |

## Arquitectura en breve

Todo el código de la aplicación vive en `app/`. Las rutas componen la pantalla; los módulos cercanos reúnen su presentación, lógica y acceso a datos. Los componentes se ejecutan en el servidor por defecto; las partes que necesitan interacción o APIs del navegador se marcan con [`'use client'`](https://nextjs.org/docs/app/api-reference/directives/use-client).

| Ubicación          | Responsabilidad                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| `app/layout.tsx`   | Estructura global, fuentes, header y pies institucionales.                                              |
| `app/(home)/`      | Portada y sus secciones.                                                                                |
| `app/(site)/`      | Páginas interiores con un layout compartido que define el contenedor principal y sus márgenes internos. |
| `app/_features/`   | Módulos funcionales compartidos, como navegación y footer.                                              |
| `app/_components/` | Elementos de presentación reutilizables.                                                                |
| `app/_dal/`        | Consultas y validación de datos compartidos.                                                            |
| `app/api/`         | Endpoints HTTP propios de Next.js.                                                                      |
| `public/`          | Recursos estáticos públicos.                                                                            |

Los paréntesis agrupan rutas sin aparecer en la URL y el prefijo `_` identifica carpetas privadas de implementación. Más detalles en [Arquitectura](docs/architecture.md).

## Guías

- [Crear rutas y componer contenido con layouts y wrappers](docs/guides/adding-routes.md).
- [Editar o agregar escenas del hero](docs/guides/extending-hero.md).
- [Editar metadata global y de páginas internas](docs/guides/editing-metadata.md).
- [Consultar datos, usar caché y revalidar por tags](docs/guides/data-and-revalidation.md).
- [Usar y extender la API: contrato, tags, respuestas y diagnóstico](docs/guides/api.md).

## Problemas frecuentes

- **`API_BASE_URL is required`:** configuración de `.env.local` y disponibilidad de la variable en build y runtime.
- **Errores de API o build:** conectividad, URL base y respuesta del backend. Noticias y artículos validan las respuestas; los errores no se reemplazan por datos ficticios.
- **Contenido desactualizado tras cambios en el backend:** la política de caché y los mecanismos de invalidación se describen en la [guía de datos](docs/guides/data-and-revalidation.md).

# Datos, caché y revalidación

Los componentes de servidor consultan el DAL; este valida y prepara la respuesta de la API. La caché permite reutilizar los resultados sin consultar el backend por cada visita.

[Volver al README](../../README.md) · [Arquitectura](../architecture.md)

## Agregar una consulta

1. Ubicá el DAL junto a su consumidor; si varias rutas lo comparten, usá su ancestro común más cercano. Noticias y artículos usan `app/_dal/` porque también los consumen la portada y los sidebars.
2. Obtené la URL base mediante `getApiBaseUrl()` de `app/_dal/api.ts`; no dupliques hosts ni expongas variables de servidor al navegador.
3. Validá la respuesta con un schema de Zod y derivá sus tipos. Prepará allí los datos y formatos que consume la presentación.
4. Llamá la función desde el componente servidor que muestra esos datos. No agregues un wrapper dedicado solo a consultar y reenviar props.
5. Si el contenido es cacheable, definí su tiempo de vida y tag de forma explícita. Para invalidarlo mediante el webhook, agregá también el tag al registro permitido de la [API de revalidación](api.md).

## Prerenderizado y contenido nuevo

`generateStaticParams()` indica qué URLs conocidas se preparan durante el build. No se vuelve a ejecutar al invalidar un tag y no impide por sí solo resolver URLs nuevas en runtime. Noticias obtiene su lista desde `getNews()`; después de publicar contenido, esa lista debe actualizarse para encontrar el nuevo slug.

El proyecto usa Cache Components. Si se declara `generateStaticParams()`, la versión actual requiere al menos un parámetro durante el build: una lista vacía necesita tratamiento específico. No agregues opciones de caché copiadas de otras versiones sin consultar la documentación instalada de Next.

## Noticias: API y caché

Configurá `API_BASE_URL` en `.env.local` para desarrollo y en el entorno de build y ejecución del despliegue:

```dotenv
API_BASE_URL=https://iluminaconciencia.userena.digital/api/v1/
```

La variable es exclusiva del servidor. El DAL consulta `noticias/?format=json` y usa el schema de Zod en `app/_dal/news/schemas/` para validar y transformar la respuesta; los tipos se derivan del schema. No hay un mapper separado ni un snapshot de respaldo. La API debe estar disponible durante el build, que genera las rutas de detalle.

- **Caché:** tag `noticias`, revalidación SWR a los 7 días y expiración a los 30 días totales; el router cliente puede reutilizar el resultado durante 5 minutos.
- **Eventos:** `POST /api/revalidate` permite expirar los datos del tag `noticias` sin servir el valor anterior en la siguiente lectura. El endpoint es público y no tiene autenticación por decisión de esta etapa; ver el contrato y sus límites en la [guía de la API](api.md).
- **Límites:** la revalidación necesita una lectura; no es un cron ni garantiza frescura semanal si la API falla. La caché en memoria puede perderse con reinicios o despliegues.
- **Presentación:** se respeta `mostrar`, se ignora `mostrar_principal` y se ordena por fecha descendente. Home muestra las últimas 3 noticias y el sidebar las últimas 5.
- **Identidad:** ID de la base de datos recibido en `id` desde la API, validado como entero positivo obligatorio; URL con título normalizado sin timestamp. Las colisiones entre noticias visibles se resuelven en orden de respuesta con sufijos incrementales `-2`, `-3`, etc., saltando los slugs ya ocupados, sin solicitudes adicionales. Cambiar el título o el orden de entrada puede reasignar slugs existentes. Las URLs anteriores con timestamp no tienen redirección.
- **Contenido y fechas:** el detalle procesa únicamente `cuerpo` con la sanitización existente. Los enlaces relativos usan el origen configurado de la API, sin inventar URLs de detalle. La fecha conserva el offset recibido; el DAL entrega también `publishedAtLabel` con el formato visible existente, sin convertir de nuevo su hora chilena ni agregar un polyfill.

Los errores HTTP, timeouts y respuestas inválidas se propagan: no se sustituyen por una lista vacía ni por un snapshot.

## Artículos: API y fechas

El DAL consulta `articulos/?format=json` con la misma variable `API_BASE_URL` de noticias. El schema de Zod en `app/_dal/articles/schemas/` valida `id` como entero positivo, `titulo` no vacío, `fecha` como fecha ISO exacta (`YYYY-MM-DD`) y `archivo` como URL HTTP/HTTPS. Los tipos se derivan del schema; el snapshot anterior deja de ser una fuente de datos y no se usa como respaldo.

- **Datos:** se conserva la ID de la base de datos y la fecha completa; `archivo` es el destino de la publicación. Como el endpoint no entrega imagen, `image` es `null`.
- **Caché:** tag `articulos`, revalidación SWR a los 7 días, expiración a los 30 días y reutilización cliente durante 5 minutos. El timeout de consulta es de 10 segundos; los errores HTTP, de red y de validación se propagan.
- **Presentación:** orden por fecha descendente; home muestra las últimas 3 publicaciones y el sidebar las últimas 5. El DAL entrega `publishedAtLabel` con solo mes y año, por ejemplo `junio del 2023`; las tarjetas reciben ese texto ya preparado y mantienen `2023-06-01` en el atributo `datetime`. No se altera el formato de noticias ni el del resumen del mapa.
- **Meses:** el mapeo existente se comparte desde `app/_utils/months.ts`; `formatMonthYear()` lo reutiliza sin convertir zonas horarias. Ambos DAL entregan sus etiquetas listas para mostrar: las páginas y `PublicationCard` no eligen ni ejecutan formatos.

## API de revalidación por tags

El backend puede avisar cambios enviando `POST /api/revalidate` con un tag permitido. Next expira los datos asociados; la siguiente lectura obtiene una respuesta fresca del backend. No hace falta reconstruir el sitio por cada cambio.

El contrato completo, ejemplos de llamadas, respuestas, logs, límites y pasos para **agregar tags o nuevos endpoints** están en la [guía de la API](api.md). La revalidación temporal sigue siendo un respaldo si se pierde el aviso; no garantiza frescura si la API falla.

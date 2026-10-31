# API: uso y extensión

La API propia del frontend vive en `app/api/`. Actualmente expone `POST /api/revalidate` para invalidar datos cacheados. No reemplaza los endpoints de noticias y artículos del backend: esos se consultan desde el DAL usando `API_BASE_URL`.

[Volver al README](../../README.md) · [Datos y caché](data-and-revalidation.md) · [Crear rutas](adding-routes.md)

## Dónde está implementada

| Archivo                              | Responsabilidad                                                             |
| ------------------------------------ | --------------------------------------------------------------------------- |
| `app/api/revalidate/route.ts`        | Entrada HTTP, lectura limitada del cuerpo, invalidación, respuestas y logs. |
| `app/api/revalidate/_lib/request.ts` | Registro de tags permitidos y schema Zod derivado de ese registro.          |
| `app/_dal/news/getNews.ts`           | Datos cacheados asociados al tag `noticias`.                                |
| `app/_dal/articles/getArticles.ts`   | Datos cacheados asociados al tag `articulos`.                               |

## Cómo procesa una llamada

1. Genera un `requestId` propio para correlacionar respuesta y logs.
2. Rechaza métodos distintos de POST y tipos de contenido distintos de JSON.
3. Lee como máximo 1024 bytes del cuerpo, incluso si no hay header `Content-Length`, y decodifica JSON.
4. Valida la estructura y el tag con Zod. Las peticiones rechazadas no ejecutan invalidación.
5. Ejecuta `revalidateTag(tag, { expire: 0 })` para expirar los datos asociados.
6. Devuelve el resultado y registra un evento de servidor. Un error de invalidación produce `500`; sus detalles no se envían al cliente.

La llamada no consulta por sí misma las noticias o los artículos ni recibe contenido para guardarlo. Su única operación de negocio es invalidar el tag permitido.

## API de revalidación por tags

`POST /api/revalidate` recibe un único tag y ejecuta `revalidateTag(tag, { expire: 0 })`. Django no envía el tipo de operación, IDs ni slugs. No necesita implementar un CRUD adicional: debe avisar después de confirmar la transacción que cambia el contenido.

```bash
curl -i -X POST 'http://localhost:3000/api/revalidate' \
  -H 'Content-Type: application/json' \
  --data '{"tag":"noticias"}'
```

### Contrato

- El cuerpo debe ser un objeto JSON con exactamente una propiedad `tag`. Se rechazan arrays, propiedades adicionales, tags desconocidos y cuerpos mayores de 1024 bytes con `400 INVALID_REQUEST`.
- Los tags son sensibles a mayúsculas y minúsculas; inicialmente se admiten `noticias` y `articulos`.
- Se acepta `application/json` con parámetros como `charset=utf-8`. No se aceptan formularios ni otros tipos de contenido.
- **Sin autenticación ni rate limiting:** cualquier cliente que descubra la URL puede invalidar estos tags repetidamente y aumentar carga y costos. La validación no evita ese abuso. No hay un secreto que configurar en esta etapa.
- Las respuestas incluyen `Cache-Control: no-store` y `X-Request-Id`. El JSON contiene el mismo `requestId`; `HEAD` conserva los headers y el estado, pero no tiene cuerpo por semántica HTTP.

| HTTP | `code`                   | Resultado                                              |
| ---- | ------------------------ | ------------------------------------------------------ |
| 200  | `TAG_INVALIDATED`        | Se ejecutó la invalidación del tag.                    |
| 400  | `INVALID_REQUEST`        | JSON, estructura, tag o tamaño inválido.               |
| 405  | `METHOD_NOT_ALLOWED`     | Solo se admite POST; se devuelve `Allow: POST`.        |
| 415  | `UNSUPPORTED_MEDIA_TYPE` | Falta `Content-Type: application/json` o es otro tipo. |
| 500  | `INTERNAL_ERROR`         | Falló la operación de invalidación.                    |

Respuesta exitosa de ejemplo:

```json
{
  "code": "TAG_INVALIDATED",
  "requestId": "4aaada4b-becd-4345-938a-50eb56ad4e24",
  "tag": "noticias"
}
```

Los errores conservan `code` y `requestId`; un fallo de invalidación incluye también el tag validado. No se devuelve el cuerpo recibido ni detalles internos del error.

### Agregar un tag

Esta es la extensión habitual para nuevos contenidos: no requiere otro endpoint ni cambiar el contrato de Django.

El registro permitido está en `app/api/revalidate/_lib/request.ts`: agregá el nuevo nombre a `revalidationTags` y asigná ese mismo tag con `cacheTag()` en los datos cacheados correspondientes. El schema se deriva del registro; el handler no requiere cambios ni un caso especial por cada tag. Actualizá esta documentación y coordiná el nuevo nombre con Django. No se modifican los tags ni los tiempos de caché actuales al ampliar el registro.

Por ejemplo, si incorporás datos cacheados de mediciones, el registro podría quedar así:

```ts
export const revalidationTags = ['noticias', 'articulos', 'mediciones'] as const
```

Este es un ejemplo de ampliación: `mediciones` todavía no está habilitado. La función servidor que cachea esos datos debe usar `'use cache'` y `cacheTag('mediciones')`; registrar el nombre en la API no crea una caché ni asigna el tag a datos automáticamente.

Después de desplegar la ampliación, el backend puede enviar `{"tag":"mediciones"}` al mismo endpoint. Comprobá que el nuevo tag se acepte, que sus consumidores se actualicen y que `noticias`, `articulos` y los rechazos anteriores sigan funcionando. El handler genérico no requiere un nuevo `if` por cada tag.

### Ejecución y diagnóstico

Un `200` confirma invalidación, no regeneración completa: la siguiente lectura obtiene datos nuevos y puede esperar al backend. No se purga todo CloudFront, no se reconstruye el sitio y no se actualizan pestañas abiertas automáticamente. `generateStaticParams()` se conserva; el webhook no vuelve a ejecutarlo. La revalidación temporal actual queda como respaldo si se pierde un aviso. Django puede reintentar ante errores de red o `500`; no debe reintentar indefinidamente errores de contrato `4xx`.

El servidor emite logs JSON con `event`, `requestId`, `method`, `status`, `code` y `durationMs`, además del tag cuando está validado. Los fallos de invalidación agregan el nombre y mensaje del error solo al log de servidor. Los eventos son `revalidation.completed`, `revalidation.rejected` y `revalidation.failed`. En Lambda pueden consultarse en CloudWatch Logs si el despliegue habilita su envío y permisos; el endpoint no provisiona monitoreo ni infraestructura AWS.

### Verificación manual en el despliegue

1. Visitá portada, listado y detalle para poblar caché; editá una noticia en Django y enviá el POST después del commit. Comprobá el contenido desde la URL pública de CloudFront.
2. Publicá una noticia nueva sin rebuild, incluyendo un slug previamente visitado que devolvía 404. Verificá también eliminación y cambio de slug, y repetí el flujo para el listado de artículos.
3. Enviá un tag desconocido, JSON inválido, propiedades adicionales, un cuerpo mayor de 1024 bytes, otro tipo de contenido y métodos distintos de POST. Verificá los estados, códigos, headers y logs de rechazo, sin eventos de invalidación completada.
4. Correlacioná cada respuesta con sus logs mediante `requestId`. Confirmá que el adaptador comparta la invalidación entre instancias y la coordine con las respuestas cacheadas en CloudFront: el éxito local del endpoint no prueba esa integración.

## Extender la API con otro endpoint

Si la nueva necesidad no es invalidar datos por tag, no sobrecargues este contrato con rutas arbitrarias, slugs o acciones sin relación. Creá un endpoint separado:

1. Elegí una URL y creá su `route.ts` bajo `app/api/`. Por ejemplo, `app/api/estado/route.ts` correspondería a `/api/estado`; es un ejemplo, no un endpoint disponible actualmente.
2. Exportá funciones nombradas para los métodos que admita, como `GET` o `POST`. Un Route Handler recibe `Request` y devuelve `Response`; no usa los layouts visuales ni devuelve una página.
3. Mantené sus schemas y utilidades junto al endpoint, en una carpeta privada como `_lib/`. Validá antes de ejecutar efectos; no importes los detalles privados del endpoint de revalidación.
4. Definí explícitamente sus respuestas, política de caché, límites, logs y protección de acceso según la operación. Que revalidación sea pública no es una regla para futuros endpoints.
5. Actualizá esta guía con su URL, contrato y ejemplos. Comprobá tanto la petición válida como los rechazos y que estos no ejecuten efectos.

No agregues `page.tsx` en el mismo segmento de URL que un `route.ts`. Los detalles generales del enrutamiento están en la [guía de rutas](adding-routes.md).

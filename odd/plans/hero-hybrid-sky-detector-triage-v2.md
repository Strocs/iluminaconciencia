# Auditoría acotada del detector — T7

**Conclusión:** los 2.673 rechazos multi-pico no son 2.673 mesetas planas. Las listas guardadas contienen **6.621 máximos aislados** (ningún par de píxeles de máximo se toca en 8-conectividad); las 12 muestras confirman picos locales separados, pero no permiten afirmar que cada pico sea una estrella física distinta. Es plausible que parte del rechazo sea conservadurismo del detector, no se ha demostrado cuántos casos son recuperables. No cambio de código en esta unidad.

La afirmación anterior de “duplicación visible” **sigue provisional**, no queda demostrada como identidad fotográfica en los pares anotados. Las fotos contienen población tenue intencional; un punto remanente no basta para llamarlo contraparte del catálogo. El candidato no tiene aprobación humana y `appEditAllowed=false`.

## Cómo leer la evidencia

- [Mosaico de 24 casos](../../output/hero-sky-prototype/production/detector-triage-v2/case-overview.png) y paneles individuales enlazados abajo. Cada panel incluye píxeles de fuente y fondo nativos sin escala, zoom anotado ×4 por vecino más cercano, parche actual/shift de la composición 1920×1080 DPR1, crédito ESO/S. Brunier / CC BY 4.0 y coordenadas.
- Cian: centro predicho y radio de búsqueda 6 px. Números: máximos locales listados, con distancias, RGB y exceso high-pass en JSON. Magenta: estimación de footprint alrededor del pico provisional; en multi-pico no es una máscara aceptada por el inventario. En miniaturas del frame, amarillo marca el centro original del catálogo y verde su centro en el diagnóstico desplazado +8/−6 CSS.
- En el caso polar, la imagen corta en el borde Y real: **no hay wrap vertical**. X sí usa el wrap periódico registrado.
- [Evidencia máquina](./evidence/hero-hybrid-sky-detector-triage-v2.json) contiene medidas completas, hashes de los artefactos, centros/candidatos por caso, máscara y residual de los controles.

## Qué discrimina la auditoría

**Topología del detector.** En `production_inventory.py:61–65`, los candidatos son los máximos de `high == maximum_filter(high, 3)` dentro del disco de 6 px y sobre el umbral. En las 2.673 filas se encontraron 6.621 puntos candidatos; al agrupar sus coordenadas por 8-conectividad, los 6.621 son singleton. La distribución por fila: 1.697 con 2 máximos; 742 con 3; 191 con 4; 29 con 5; 9 con 6; 2 con 7; 3 con 8. Así se refuta “muchos píxeles adyacentes de la misma meseta” para las listas guardadas; **no** se refuta que varios picos cercanos sean estructura de una misma fuente, espigas, ruido o estrellas físicas distintas. La forma actual no estima ninguna de esas identidades.

**Evidencia a favor de ranking espacial, no de selección automática.** Los 12 anclajes almacenados (Alnitak duplicado deduplicado) tienen residuales centro medido−predicho entre 0,108 y 3,747 px; mediana 0,656 px. Para los cinco controles `held-out` de fase 2 los valores son: Sirius 0,632; Canopus 0,621; Aldebaran 1,458; Regulus 2,739; Spica 3,747 px. El máximo más cercano al centro predicho queda a ≤1,43 px del centro medido en los 12 anclajes. Es evidencia útil, pero los siete centros Orion fueron parte del grupo `fit`, y los cinco restantes son asociaciones tentativas; no es astrometría externa ni garantía para 2.673 filas.

**Contraejemplos a reglas de una sola variable.** En 10/12 casos multi-pico muestreados, el máximo de mayor exceso también es el más cercano. En `catalog-01043`, el más cercano está a 0 px con exceso 17,1, mientras otro a 3,16 px tiene exceso 81,5. En `catalog-04252`, el más cercano está a 4,47 px/exceso 11,6 frente a picos a 5/6 px con excesos 81,3/71,8. “Elegir el más brillante” y “elegir el más cercano” no son intercambiables ni resuelven identidad; ambos casos aún pueden ser estrella correcta desplazada, vecino o estructura múltiple. Los paneles también enseñan conglomerados densos (`00626`, `00964`, `01272`) donde una máscara alrededor del máximo provisional podría abarcar población que el usuario desea conservar.

**Los avisos de máscara son contadores morfológicos, no veredictos físicos.** `reconstruct_background.py:113–148` segmenta exceso gris local sobre `max(3×noiseMAD, 3)` dentro de radio 32 px; crea una elipse/halo y cuenta los componentes umbralizados que intersectan el footprint (`:142`). `otherBrightComponentsInFootprint` no identifica vecinos astronómicos: nebulosidad, lóbulos de una PSF o una fuente distinta pueden incrementar el contador. `saturatedChannelSamples` cuenta canales RGB ≥250 **en el parche completo 192×192**, no sólo núcleo objetivo; no prueba que el centro esté saturado. Ejemplo extremo `catalog-00889`: 18 componentes y semiejes 9,3×26 px; el panel muestra fuentes y estructura brillante solapadas, pero no permite decidir qué componente es una estrella independiente. Los casos truncados `00880`, `03813`, `02853` fallan por perfil central ausente en esta recálculo, o límite de footprint; el `03813` detecta un pico débil (exceso 4,5 a 4,12 px) pero no aporta perfil de núcleo claro. Los amplios/saturados `01725` y `03778` no presentan máximo local aislado. Estos justifican abstención por soporte, no relajación de guardas.

## 24 recortes anotados

**Multi-pico — 12 casos, tres tertiles de brillo candidato crudo × cuatro cuadrantes de la fuente; no son 12 IDs iniciales.**

| Caso | Panel | Candidatos: distancia px / exceso high-pass |
|---|---|---|
| `catalog-01058` | [ver panel](../../output/hero-sky-prototype/production/detector-triage-v2/catalog-01058-multi-peak.png) | 0/52,2; 5,10/35,9 |
| `catalog-02722` | [ver panel](../../output/hero-sky-prototype/production/detector-triage-v2/catalog-02722-multi-peak.png) | 3,16/63,5; 5/15,5 |
| `catalog-00626` | [ver panel](../../output/hero-sky-prototype/production/detector-triage-v2/catalog-00626-multi-peak.png) | 1/79,5; 4,24/27,1; 4,47/51,9; 5,83/20,6 |
| `catalog-00964` | [ver panel](../../output/hero-sky-prototype/production/detector-triage-v2/catalog-00964-multi-peak.png) | 2,24/47,9; 5/44,9; 5,83/30,8 |
| `catalog-04252` | [ver panel](../../output/hero-sky-prototype/production/detector-triage-v2/catalog-04252-multi-peak.png) | 4,47/11,6; 5/81,3; 6/71,8 |
| `catalog-02147` | [ver panel](../../output/hero-sky-prototype/production/detector-triage-v2/catalog-02147-multi-peak.png) | 2/67,2; 2,24/37,9 |
| `catalog-00167` | [ver panel](../../output/hero-sky-prototype/production/detector-triage-v2/catalog-00167-multi-peak.png) | 0/84,5; 4/18,2 |
| `catalog-01272` | [ver panel](../../output/hero-sky-prototype/production/detector-triage-v2/catalog-01272-multi-peak.png) | 1,41/62,9; 3,61/52,4 |
| `catalog-01043` | [ver panel](../../output/hero-sky-prototype/production/detector-triage-v2/catalog-01043-multi-peak.png) | 0/17,1; 3,16/81,5; 5,10/22,7 |
| `catalog-02303` | [ver panel](../../output/hero-sky-prototype/production/detector-triage-v2/catalog-02303-multi-peak.png) | 1,41/93,0; 3,16/30,2; 5,38/14,1 |
| `catalog-00297` | [ver panel](../../output/hero-sky-prototype/production/detector-triage-v2/catalog-00297-multi-peak.png) | 1/88,5; 5/23,7; 6/35,7 |
| `catalog-00258` | [ver panel](../../output/hero-sky-prototype/production/detector-triage-v2/catalog-00258-multi-peak.png) | 2/93,8; 6/44,7; 6/17,8 |

**Otros motivos.** Vecino-footprint: [00889](../../output/hero-sky-prototype/production/detector-triage-v2/catalog-00889-neighbor-footprint.png), [04021](../../output/hero-sky-prototype/production/detector-triage-v2/catalog-04021-neighbor-footprint.png), [03467](../../output/hero-sky-prototype/production/detector-triage-v2/catalog-03467-neighbor-footprint.png), [03355](../../output/hero-sky-prototype/production/detector-triage-v2/catalog-03355-neighbor-footprint.png), [04265](../../output/hero-sky-prototype/production/detector-triage-v2/catalog-04265-neighbor-footprint.png), [00005](../../output/hero-sky-prototype/production/detector-triage-v2/catalog-00005-neighbor-footprint.png).

Perfil ausente/truncado: [00880](../../output/hero-sky-prototype/production/detector-triage-v2/catalog-00880-missing-truncated.png), [03813](../../output/hero-sky-prototype/production/detector-triage-v2/catalog-03813-missing-truncated.png), [02853](../../output/hero-sky-prototype/production/detector-triage-v2/catalog-02853-missing-truncated.png).

Exceso amplio/saturado sin pico: [01725](../../output/hero-sky-prototype/production/detector-triage-v2/catalog-01725-broad-saturated.png), [03778](../../output/hero-sky-prototype/production/detector-triage-v2/catalog-03778-broad-saturated.png). Polo sin wrap-Y: [03468](../../output/hero-sky-prototype/production/detector-triage-v2/catalog-03468-pole.png).

## Residuales de los 12 centros fuente almacenados

Son offsets en píxeles de fuente, medidos contra los centros provisionales guardados; Alnitak repetido cuenta una vez. **No** son solución de placa externa.

| Identidad | Δx, Δy | Radio px | Máximos en búsqueda |
|---|---:|---:|---:|
| Aldebaran | −0,704; +1,277 | 1,458 | 1 |
| Rigel | +0,413; +0,291 | 0,505 | 2 |
| Bellatrix | −1,405; +0,115 | 1,410 | 1 |
| Mintaka | −0,337; +0,589 | 0,679 | 2 |
| Alnilam | +0,125; −0,425 | 0,443 | 1 |
| Alnitak | +0,534; +0,120 | 0,547 | 4 (mismo centro duplicado) |
| Saiph | +0,585; −0,514 | 0,778 | 3 |
| Betelgeuse | +0,086; −0,065 | 0,108 | 1 |
| Canopus | +0,268; +0,561 | 0,621 | 2 |
| Sirius | +0,205; +0,598 | 0,632 | 1 |
| Regulus | −2,488; +1,146 | 2,739 | 2 |
| Spica | +3,611; −1,000 | 3,747 | 1 |

## Corrección mínima recomendada — propuesta, no ejecutada

En `production_inventory.py:83–85`, reemplazar el `if len(peaks)>1: continue` como decisión única por una **clasificación/ranking explícito por candidato**, manteniendo el conjunto completo y el estado abstain por defecto. Ordenar y reportar distancia al centro predicho, exceso local normalizado por ruido y compatibilidad del perfil/footprint; aceptar automáticamente cero casos nuevos hasta calibrar una regla de separación con controles `held-out` y negativos de este audit. Si el top no se distingue o cae en máscara de vecino/perfil truncado, sigue unresolved. No colapsar máximos separados como si fueran una misma meseta; no seleccionar a ciegas el cercano ni el más brillante; no expandir búsqueda, cambiar umbral, reducir guards ni tocar donantes. La evidencia permite introducir scoring informativo; **no permite todavía fijar un score/margen de autoaceptación seguro**.

Esto es más estrecho que reabrir calibración: ranking determinista dentro del radio/umbral existentes, pruebas de controles previos y abstención conservada. Ninguna promesa de cuántas filas resolverá; ningún umbral de limpieza, precisión física del polvo, ni gate 0,5 CSS px.

## Veredicto y cobertura

La auditoría refuta que multi-pico equivalga a mesetas adyacentes, pero no prueba identidad física de esos máximos. Algunas coincidencias cerca del centro y controles almacenados apoyan un ranking de proximidad como señal; casos 01043/04252 refutan proximidad o brillo como regla única. Vecinos/flags y saturación describen morfología de ventana, no identidad. La reclamación general de duplicación queda provisional; para probar pares concretos hay que establecer que el catálogo y un máximo fotográfico son la misma fuente bajo incertidumbre de registro. No llamar duplicado a la población tenue restante.

S1 parcial; S5 imágenes nuevas para revisión, aprobación humana sigue pendiente; S6 evaluación de claridad/nitidez sin gates arbitrarios; S7 coordenadas del mapping almacenado reutilizadas, no responsive universal; S9 reconstrucción nativa/contexto inspeccionada, no garantiza ausencia de fuentes para movimiento; S10 no se exige certeza de estructura oculta ni se declara mancha donde no se observó; S14 reanudación respetada y v1/v2 originales preservadas. Ningún cambio de código/receta/app, ninguna aprobación del asset ni integración hero.

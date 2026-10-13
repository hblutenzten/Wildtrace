# WildTrace Field · Prototipo 0.1

Cuaderno de campo Android, en español, para evaluar con un biólogo. Proyecto independiente: no es un producto oficial de WCS.

## Qué incluye

- Expediciones con nombre y observador.
- Observaciones con fecha/hora, tipo, identificación manual, cantidad opcional, hábitat y notas.
- Captura automática de GPS al abrir un registro sin ubicación, con precisión, altitud y momento de captura. Se puede guardar sin GPS.
- Varias fotos por registro, desde cámara o galería.
- Grabación y reproducción de un audio por registro.
- SQLite local con borradores guardados al modificar campos; transacciones para confirmar observaciones.
- Fotos y audios copiados a almacenamiento persistente de la app.
- Edición y eliminación con confirmación.
- Vista geográfica de puntos sin mapa base, disponible offline.
- Exportación CSV, GeoJSON y ZIP que incluye los adjuntos y un manifiesto JSON.

No incluye identificación IA, sincronización, usuarios, mapas topográficos, UTM, importación de respaldos, seguimiento de recorrido ni informes PDF. No tiene botón de sincronización simulado.

## Probar en Android

Este archivo contiene código fuente, **no un APK**. Hace falta una computadora para iniciar el proyecto o construir el instalador.

1. Instala Node.js compatible con Expo SDK 57 y descarga/descomprime el proyecto.
2. En una terminal dentro de esta carpeta:

```sh
npm ci
npx expo start
```

3. Abre el proyecto desde Expo Go en Android mediante el QR. Expo Go debe admitir SDK 57; si no lo admite, usa un APK de desarrollo/preview compatible.
4. Acepta permisos de cámara, ubicación y micrófono cuando uses cada función.

Expo Go sirve para primeras pruebas. Para probar varios días sin depender del servidor de desarrollo, usa un APK autónomo:

```sh
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

EAS requiere una cuenta Expo, acceso a Internet y disponibilidad de su servicio. No se ha ejecutado una compilación EAS ni se ha creado un APK en este entorno. También se puede compilar con Android Studio y el SDK de Android instalado.

## Primera prueba de campo

Usa registros de prueba antes de información sensible o irremplazable.

1. Crea “Prueba de campo” y registra el nombre del observador.
2. Crea 5–10 observaciones: identificada, desconocida, huella, audio, varias fotos y una sin GPS.
3. Sal del formulario a mitad de escribir y continúa desde Nueva observación.
4. Cierra y vuelve a abrir la app. Comprueba borrador, registros y adjuntos.
5. Con APK autónomo: activa modo avión, crea registros, reinicia el teléfono y comprueba persistencia. El GPS puede tardar más sin asistencia de red.
6. Edita un registro y elimina otro de prueba.
7. Exporta ZIP; en una computadora abre el CSV, GeoJSON, manifiesto JSON y todos los adjuntos.
8. Cronometra tres registros y anota pasos lentos, datos faltantes y campos que sobran.

Preguntas al biólogo: ¿qué herramienta usas hoy?, ¿qué dato volverías a transcribir?, ¿qué falta para tu método de muestreo?, ¿necesitas UTM/transectos/esfuerzo de muestreo?, ¿qué proceso posterior consume más tiempo?, ¿qué función te haría llevarla a campo?

## Límites y conservación de datos

- Los registros y borradores están en el teléfono. No se suben a servidores.
- Desinstalar la app o borrar sus datos puede eliminarlos. Exporta ZIP después de cada sesión.
- CSV/GeoJSON incluyen referencias a fotos/audio; por sí solos no guardan los archivos. ZIP sí.
- El ZIP incluye coordenadas exactas. Comparte únicamente con destinatarios autorizados.
- Los adjuntos retirados o de registros eliminados se conservan localmente para evitar borrado accidental; todavía no hay limpieza de archivos huérfanos.
- Cada expedición mantiene un borrador. Debes retomarlo o descartarlo antes de abrir otra edición.
- El audio en curso no está confirmado hasta detenerlo. Una terminación forzada durante la grabación puede perder ese audio.
- Un GPS capturado al editar representa la ubicación actual, no reconstruye la ubicación histórica.
- Los ZIP se construyen en memoria: para esta primera prueba exporta expediciones pequeñas; aún no se ha medido el límite con grandes volúmenes de medios.
- Fechas ISO exportadas incluyen zona horaria; la interfaz usa la hora local del dispositivo.

## Validación de desarrollo

```sh
npm run typecheck
npm test
EXPO_OFFLINE=1 npx expo export --platform android --output-dir dist-android
```

Las pruebas verifican persistencia SQLite tras reabrir, borradores, edición, eliminación, atomicidad ante fallo de guardado, CSV y geometrías GeoJSON. No sustituyen una prueba en Android de permisos, cámara, audio, GPS, espacio de almacenamiento y ciclo de vida.

Documentación base: https://docs.expo.dev/versions/latest/sdk/sqlite/ · https://docs.expo.dev/versions/latest/sdk/audio/ · https://docs.expo.dev/versions/latest/sdk/filesystem/

## Estado de esta entrega

Verificado: TypeScript sin errores, seis pruebas automatizadas aprobadas y exportación Android con Metro/Hermes. Pendiente: ejecución en un teléfono Android y compilación de APK. Las pruebas de persistencia usan SQLite real con un adaptador de pruebas; no prueban directamente el almacenamiento nativo de Expo en un dispositivo.

import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { zipSync, strToU8 } from 'fflate';
import { Expedition, Observation, toCSV, toGeoJSON } from './domain';
import { mediaDirectory } from './store';
export async function exportExpedition(e:Expedition,rows:Observation[],format:'csv'|'geojson'|'zip') {
 if (!await Sharing.isAvailableAsync()) throw new Error('Este dispositivo no permite compartir archivos.');
 const file = new File(Paths.cache,`wildtrace-${e.id}.${format}`);
 file.create({overwrite:true});
 if(format==='csv')file.write(toCSV(e,rows));
 else if(format==='geojson')file.write(JSON.stringify(toGeoJSON(e,rows),null,2));
 else {
 const entries:Record<string,Uint8Array>={
 'expedicion.json':strToU8(JSON.stringify({schemaVersion:1,exportedAt:new Date().toISOString(),expedition:e,observations:rows},null,2)),
 'registros.csv':strToU8(toCSV(e,rows)),
 'registros.geojson':strToU8(JSON.stringify(toGeoJSON(e,rows),null,2))};
 for (const name of new Set(rows.flatMap(o=>[...o.photos,...(o.audio?[o.audio]:[])]))) {
 const media = new File(mediaDirectory,name);
 if(!media.exists)throw new Error('Falta un archivo adjunto. No se generó el respaldo completo.');
 entries['media/'+name]=await media.bytes();
 }
 file.write(zipSync(entries,{level:0}));
 }
 await Sharing.shareAsync(file.uri,{mimeType:format==='zip'?'application/zip':format==='csv'?'text/csv':'application/geo+json',dialogTitle:'Exportar expedición'});
}

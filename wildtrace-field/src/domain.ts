export const TYPES = ['Avistamiento', 'Huella', 'Sonido', 'Restos', 'Cámara trampa', 'Conflicto', 'Otro'] as const;
export type RecordType = typeof TYPES[number];
export interface Expedition { id: string; name: string; observer: string; createdAt: string }
export interface Coordinates { latitude: number; longitude: number; accuracy: number | null; altitude: number | null; capturedAt: string }
export interface Observation { id: string; expeditionId: string; observedAt: string; updatedAt: string; species: string; type: RecordType; count: number | null; notes: string; habitat: string; coordinates: Coordinates | null; photos: string[]; audio: string | null }
export function validate(o: Observation): string | null {
 if (!TYPES.includes(o.type)) return 'Selecciona un tipo de registro.';
 if (o.count !== null && (!Number.isSafeInteger(o.count) || o.count < 1)) return 'La cantidad debe ser un entero positivo o quedar vacía.';
 if (!o.species.trim() && !o.notes.trim() && !o.photos.length && !o.audio) return 'Añade una especie, una nota, una foto o un audio.';
 if (o.coordinates && (!Number.isFinite(o.coordinates.latitude) || Math.abs(o.coordinates.latitude)>90 || !Number.isFinite(o.coordinates.longitude) || Math.abs(o.coordinates.longitude)>180)) return 'Coordenadas inválidas.';
 return null;
}
const headers = ['id','expedicion','observador','fecha_hora_iso','especie','tipo','cantidad','latitud','longitud','precision_m','altitud_m','gps_fecha_iso','habitat','notas','fotos','audio'];
export function csvCell(value: unknown): string {
 let text = value == null ? '' : String(value);
 // Prevent text fields being executed as spreadsheet formulas.
 if (/^[\s]*[=+@-]/.test(text) && typeof value !== 'number') text = "'"+text;
 return '"'+text.replace(/"/g,'""')+'"';
}
export function toCSV(expedition: Expedition, rows: Observation[]): string {
 return '\ufeff'+[headers.map(csvCell).join(','), ...rows.map(o => [o.id,expedition.name,expedition.observer,o.observedAt,o.species,o.type,o.count,o.coordinates?.latitude,o.coordinates?.longitude,o.coordinates?.accuracy,o.coordinates?.altitude,o.coordinates?.capturedAt,o.habitat,o.notes,o.photos.join(';'),o.audio].map(csvCell).join(','))].join('\r\n');
}
export function toGeoJSON(expedition: Expedition, rows: Observation[]) {
 return {type:'FeatureCollection', features:rows.map(o=>({type:'Feature',id:o.id,geometry:o.coordinates?{type:'Point',coordinates:[o.coordinates.longitude,o.coordinates.latitude]}:null,properties:{...o,coordinates:undefined,expedition:expedition.name,observer:expedition.observer}}))};
}

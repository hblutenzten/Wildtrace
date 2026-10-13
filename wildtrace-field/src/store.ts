import * as SQLite from 'expo-sqlite';
import { Directory, File, Paths } from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import { Expedition, Observation } from './domain';
const db = SQLite.openDatabaseSync('wildtrace-v1.db');
db.execSync(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS expeditions (id TEXT PRIMARY KEY, body TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS observations (id TEXT PRIMARY KEY, expedition_id TEXT NOT NULL REFERENCES expeditions(id), body TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS drafts (expedition_id TEXT PRIMARY KEY REFERENCES expeditions(id), body TEXT NOT NULL);`);
export const uid = () => Crypto.randomUUID();
export const mediaDirectory = new Directory(Paths.document, 'wildtrace-media');
mediaDirectory.create({idempotent:true,intermediates:true});
export function mediaURI(name: string) { return new File(mediaDirectory,name).uri; }
export function copyMedia(uri:string,kind:'photo'|'audio'):string {
 const ext = uri.split('?')[0].split('.').pop()?.toLowerCase();
 const safeExt = ext && /^[a-z0-9]{1,5}$/.test(ext) ? ext : kind==='photo'?'jpg':'m4a';
 const name = uid()+'.'+safeExt;
 new File(uri).copy(new File(mediaDirectory,name));
 return name;
}
export function expeditions():Expedition[] { return db.getAllSync<{body:string}>('SELECT body FROM expeditions ORDER BY rowid DESC').map(r=>JSON.parse(r.body)); }
export function addExpedition(name:string,observer:string):Expedition {
 const e={id:uid(),name:name.trim(),observer:observer.trim(),createdAt:new Date().toISOString()};
 db.runSync('INSERT INTO expeditions(id,body) VALUES(?,?)',e.id,JSON.stringify(e)); return e;
}
export function observations(expeditionId:string):Observation[] { return db.getAllSync<{body:string}>('SELECT body FROM observations WHERE expedition_id=? ORDER BY rowid DESC',expeditionId).map(r=>JSON.parse(r.body)); }
export function saveDraft(o:Observation) { db.runSync('INSERT OR REPLACE INTO drafts(expedition_id,body) VALUES(?,?)',o.expeditionId,JSON.stringify(o)); }
export function readDraft(expeditionId:string):Observation|null { const r=db.getFirstSync<{body:string}>('SELECT body FROM drafts WHERE expedition_id=?',expeditionId);return r?JSON.parse(r.body):null; }
export function clearDraft(expeditionId:string) { db.runSync('DELETE FROM drafts WHERE expedition_id=?',expeditionId); }
export function saveObservation(o:Observation) {
 db.withTransactionSync(()=>{ db.runSync('INSERT OR REPLACE INTO observations(id,expedition_id,body) VALUES(?,?,?)',o.id,o.expeditionId,JSON.stringify({...o,updatedAt:new Date().toISOString()})); clearDraft(o.expeditionId); });
}
export function removeObservation(id:string) { db.runSync('DELETE FROM observations WHERE id=?',id); }
export function blank(expeditionId:string):Observation { const now=new Date().toISOString(); return {id:uid(),expeditionId,observedAt:now,updatedAt:now,species:'',type:'Avistamiento',count:null,notes:'',habitat:'',coordinates:null,photos:[],audio:null}; }

import { db } from './firebase-config.js';
import { collection, doc, onSnapshot, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
export function saveProfile(user) {
  return setDoc(doc(db,'users',user.uid), {displayName:user.displayName || 'Sahabat Birri', updatedAt:serverTimestamp()}, {merge:true});
}
export function watchLogs(uid, callback, onError) {
  return onSnapshot(collection(db,'users',uid,'dailyLogs'), {includeMetadataChanges:true}, snapshot => {
    const logs = Object.fromEntries(snapshot.docs.map(d=>[d.id,d.data()]));
    callback(logs, snapshot.metadata);
  }, onError);
}
export function saveTask(uid, date, task, checked) {
  return setDoc(doc(db,'users',uid,'dailyLogs',date), {[task]:checked}, {merge:true});
}

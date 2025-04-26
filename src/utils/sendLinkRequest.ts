// utils/sendLinkRequest.ts
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { firestore } from '../config/firebase';

export const sendLinkRequest = async (fromUser, toUser) => {
  const requestId = `${fromUser.uid}_${toUser.uid}`;
  const ref = doc(firestore, 'linkRequests', requestId);

  const existing = await getDoc(ref);
  if (existing.exists()) return false;

  const data = {
    from: fromUser.uid,
    to: toUser.uid,
    fromName: fromUser.fullName,
    toName: toUser.fullName || 'No Name',
    fromAvatar: fromUser.photoURL || '',
    toAvatar: toUser.photoURL || '',
    status: 'pending',
    createdAt: Date.now(),
  };
  console.log("📝 Writing Link Request:", data);
  console.log("📄 Doc Path:", ref.path);

  await setDoc(ref, data);
  return true;
};

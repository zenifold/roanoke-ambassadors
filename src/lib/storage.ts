import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export const uploadFile = async (
  eventId: string,
  file: File
): Promise<{ url: string }> => {
  const fileRef = ref(storage, `events/${eventId}/files/${file.name}`);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);
  return { url };
};

export const deleteFile = async (
  eventId: string,
  fileName: string
): Promise<void> => {
  const fileRef = ref(storage, `events/${eventId}/files/${fileName}`);
  await deleteObject(fileRef);
};

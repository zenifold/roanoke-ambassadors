import { useEffect, useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { getSharedFiles, addSharedFile, deleteSharedFile, type SharedFile } from '../../../../lib/firestore';
import { uploadFile, deleteFile } from '../../../../lib/storage';

interface FileSharingProps {
  eventId: string;
}

export default function FileSharing({ eventId }: FileSharingProps) {
  const { user } = useAuth();
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadFiles() {
      if (!user || !eventId) return;

      try {
        const sharedFiles = await getSharedFiles(eventId);
        setFiles(sharedFiles);
      } catch (error) {
        console.error('Error loading files:', error);
        setError('Failed to load files');
      }
    }

    loadFiles();
    // Poll for new files every 10 seconds
    const interval = setInterval(loadFiles, 10000);
    return () => clearInterval(interval);
  }, [user, eventId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !eventId || !e.target.files?.length) return;

    setUploading(true);
    setError('');

    try {
      const file = e.target.files[0];
      const { url } = await uploadFile(eventId, file);
      
      await addSharedFile(eventId, {
        name: file.name,
        size: file.size,
        type: file.type,
        url
      }, user.uid);

      const updatedFiles = await getSharedFiles(eventId);
      setFiles(updatedFiles);
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload file');
    } finally {
      setUploading(false);
      // Clear the input
      e.target.value = '';
    }
  };

  const handleDelete = async (file: SharedFile) => {
    if (!user || !eventId) return;

    try {
      await deleteFile(eventId, file.name);
      await deleteSharedFile(file.id);
      
      const updatedFiles = await getSharedFiles(eventId);
      setFiles(updatedFiles);
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('Failed to delete file');
    }
  };

  if (error) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">File Sharing</h3>
      <input
        type="file"
        onChange={handleFileUpload}
        disabled={uploading}
        className="mb-4"
      />
      {uploading && (
        <div className="mb-4 text-sm text-gray-500">
          Uploading...
        </div>
      )}
      {files.length > 0 ? (
        <ul className="space-y-2">
          {files.map((file) => (
            <li key={file.id} className="p-2 bg-white rounded shadow-sm">
              <div className="flex justify-between items-center">
                <a 
                  href={file.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {file.name}
                </a>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </span>
                  <button
                    onClick={() => handleDelete(file)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No files uploaded yet</p>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { getEditorContent, updateEditorContent } from '../../../../lib/firestore';
import { useDebounce } from 'use-debounce';

interface CollaborativeEditorProps {
  eventId: string;
}

export default function CollaborativeEditor({ eventId }: CollaborativeEditorProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debouncedContent] = useDebounce(content, 1000);

  useEffect(() => {
    async function loadContent() {
      if (!user || !eventId) return;

      try {
        const editorContent = await getEditorContent(eventId);
        if (editorContent) {
          setContent(editorContent.content);
        }
      } catch (error) {
        console.error('Error loading editor content:', error);
        setError('Failed to load editor content');
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, [user, eventId]);

  // Save content when it changes (debounced)
  useEffect(() => {
    async function saveContent() {
      if (!user || !eventId || !debouncedContent) return;

      try {
        await updateEditorContent(eventId, debouncedContent, user.uid);
      } catch (error) {
        console.error('Error saving editor content:', error);
        setError('Failed to save changes');
      }
    }

    saveContent();
  }, [debouncedContent, user, eventId]);

  if (loading) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="animate-pulse h-40"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Collaborative Editor</h3>
      <textarea
        className="w-full h-40 p-2 border rounded"
        placeholder="Start collaborating on event details..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="mt-2 text-sm text-gray-500">
        Changes are saved automatically and visible to all collaborators.
      </div>
    </div>
  );
}

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Textarea } from '../../../../../components/ui/textarea';
import { Button } from '../../../../../components/ui/button';
import { Trash2 } from 'lucide-react';

interface StickyNoteData {
  content: string;
  color: string;
}

export default function StickyNoteNode({ data, selected }: NodeProps<StickyNoteData>) {
  const [content, setContent] = React.useState(data.content);
  const [color, setColor] = React.useState(data.color);

  return (
    <div 
      className={`p-4 rounded-lg shadow-sm min-w-[200px] min-h-[150px] transition-colors ${
        selected ? 'ring-2 ring-black' : ''
      }`}
      style={{ backgroundColor: color }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      
      <div className="flex flex-col h-full">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 mb-2 bg-transparent border-none resize-none focus-visible:ring-0"
          placeholder="Write your note..."
        />
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            {['#fef08a', '#bbf7d0', '#bfdbfe', '#fecaca'].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-4 h-4 rounded-full border border-gray-300 hover:border-black"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <Button variant="ghost" size="sm" className="p-1 h-auto">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

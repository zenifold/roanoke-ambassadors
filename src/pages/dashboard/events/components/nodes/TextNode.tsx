import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Input } from '../../../../../components/ui/input';
import { Button } from '../../../../../components/ui/button';
import { Trash2 } from 'lucide-react';

interface TextData {
  content: string;
  fontSize: number;
}

export default function TextNode({ data, selected }: NodeProps<TextData>) {
  const [content, setContent] = React.useState(data.content);
  const [fontSize, setFontSize] = React.useState(data.fontSize);

  return (
    <div className={`p-2 ${selected ? 'ring-2 ring-black' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      
      <div className="flex flex-col gap-2">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border-none focus-visible:ring-0"
          style={{ fontSize: `${fontSize}px` }}
        />
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFontSize(Math.max(12, fontSize - 2))}
            >
              -
            </Button>
            <span className="text-sm">{fontSize}px</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFontSize(Math.min(72, fontSize + 2))}
            >
              +
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="p-1 h-auto">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

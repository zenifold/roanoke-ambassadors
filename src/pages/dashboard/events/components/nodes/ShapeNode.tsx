import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Button } from '../../../../../components/ui/button';
import { Trash2 } from 'lucide-react';

interface ShapeData {
  type: 'rectangle' | 'circle' | 'triangle';
  color: string;
}

export default function ShapeNode({ data, selected }: NodeProps<ShapeData>) {
  const [color, setColor] = React.useState(data.color);

  const shapeStyles = {
    rectangle: 'w-24 h-16',
    circle: 'w-16 h-16 rounded-full',
    triangle: 'w-0 h-0 border-l-[32px] border-l-transparent border-r-[32px] border-r-transparent border-b-[64px]'
  };

  return (
    <div className={`p-2 ${selected ? 'ring-2 ring-black' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      
      <div className="flex flex-col items-center gap-2">
        <div 
          className={shapeStyles[data.type]}
          style={{ backgroundColor: color }}
        />
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
  );
}

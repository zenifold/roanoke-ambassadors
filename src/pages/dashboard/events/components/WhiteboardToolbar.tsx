import React from 'react';
import { Button } from '../../../../components/ui/button';
import { 
  StickyNote, 
  Square, 
  Circle, 
  Triangle, 
  Type, 
  ArrowRight, 
  Eraser 
} from 'lucide-react';

interface WhiteboardToolbarProps {
  eventId: string;
}

export default function WhiteboardToolbar({ eventId }: WhiteboardToolbarProps) {
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-lg shadow-sm flex gap-2 z-10">
      <Button variant="outline" size="sm">
        <StickyNote className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="sm">
        <Square className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="sm">
        <Circle className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="sm">
        <Triangle className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="sm">
        <Type className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="sm">
        <ArrowRight className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="sm">
        <Eraser className="w-4 h-4" />
      </Button>
    </div>
  );
}

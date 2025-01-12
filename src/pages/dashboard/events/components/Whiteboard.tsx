import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
  ReactFlowProvider
} from 'reactflow';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAuth } from '../../../../contexts/AuthContext';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { debounce } from 'lodash';

import 'reactflow/dist/style.css';
import StickyNoteNode from './nodes/StickyNoteNode';
import ShapeNode from './nodes/ShapeNode';
import TextNode from './nodes/TextNode';
import WhiteboardToolbar from './WhiteboardToolbar';

const nodeTypes = {
  stickyNote: StickyNoteNode,
  shape: ShapeNode,
  text: TextNode
};

interface WhiteboardProps {
  eventId: string;
}

export default function Whiteboard({ eventId }: WhiteboardProps) {
  const { user } = useAuth();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load initial whiteboard state
  useEffect(() => {
    if (!eventId) return;

    const unsubscribe = onSnapshot(doc(db, 'whiteboards', eventId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
        setLoading(false);
      } else {
        setNodes([]);
        setEdges([]);
        setLoading(false);
      }
    }, (error) => {
      console.error('Error loading whiteboard:', error);
      setError('Failed to load whiteboard');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [eventId]);

  // Auto-save changes
  const saveWhiteboard = useCallback(debounce(async (nodes: Node[], edges: Edge[]) => {
    if (!eventId || !user) return;

    try {
      await setDoc(doc(db, 'whiteboards', eventId), {
        nodes,
        edges,
        updatedAt: new Date(),
        updatedBy: user.uid
      }, { merge: true });
    } catch (error) {
      console.error('Error saving whiteboard:', error);
      setError('Failed to save whiteboard');
    }
  }, 1000), [eventId, user]);

  useEffect(() => {
    saveWhiteboard(nodes, edges);
  }, [nodes, edges, saveWhiteboard]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  if (loading) {
    return (
      <div className="h-[600px] bg-gray-50 rounded-lg animate-pulse"></div>
    );
  }

  if (error) {
    return (
      <div className="h-[600px] bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <ReactFlowProvider>
        <div className="h-[600px] bg-white rounded-lg shadow-sm">
          <WhiteboardToolbar eventId={eventId} />
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </DndProvider>
  );
}

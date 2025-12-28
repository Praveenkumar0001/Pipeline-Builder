import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  Background,
  Panel,
  ConnectionLineType,
  addEdge,
  useReactFlow,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Import components
import Toolbar from './components/ui/Toolbar';
import SubmitButton from './components/ui/SubmitButton';
import PipelineStatus from './components/ui/PipelineStatus';
import useStore from './store/useStore';
import DeleteToolbar from './components/ui/DeleteToolbar';
import { nodeTypes } from './components/nodes/nodeTypes';
// Import icons
import {
  Save,
  Plus,
  Activity,
  Zap
} from 'lucide-react';

// Enhanced connection styling
const connectionLineStyle = {
  strokeWidth: 3,
  stroke: '#6366f1',
  strokeDasharray: '8,4',
};

const defaultEdgeOptions = {
  style: { 
    strokeWidth: 3, 
    stroke: '#6366f1',
  },
  type: 'smoothstep',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#6366f1',
    width: 25,
    height: 25
  },
  animated: true,
};

// Welcome Screen Component
const WelcomeScreen = ({ onGetStarted }) => (
  <div className="h-screen w-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
    <div className="text-center p-16 bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-2xl max-w-2xl">
      <div className="text-8xl mb-8 animate-bounce">🚀</div>
      <h1 className="text-5xl font-bold text-gray-800 mb-6">
       Welcome to Pipeline Builder
      </h1>
      <p className="text-gray-600 text-lg leading-relaxed mb-12 max-w-lg mx-auto">
        Create powerful data pipelines by adding nodes and connecting them together. 
        Build, analyze, and optimize your data workflows with ease.
      </p>
      
      <button
        onClick={onGetStarted}
        className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-12 py-4 rounded-2xl text-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
      >
        <div className="flex items-center space-x-3">
          <span>Get Started</span>
          <Activity className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </div>
      </button>
      
      <div className="grid grid-cols-3 gap-8 max-w-md mx-auto mt-12">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <span className="font-semibold text-gray-700">Add Nodes</span>
          <span className="text-xs text-gray-500 mt-1">Click or drag</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <span className="font-semibold text-gray-700">Connect</span>
          <span className="text-xs text-gray-500 mt-1">Create flow</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <span className="font-semibold text-gray-700">Analyze</span>
          <span className="text-xs text-gray-500 mt-1">Get insights</span>
        </div>
      </div>
    </div>
  </div>
);

// Main Flow Component
const Flow = () => {
  const reactFlowWrapper = useRef(null);
  
  const {
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  addNode,
  setEdges,
  exportPipeline,
  deleteSelected,
  deleteAll,
  undoDelete,
  selectAll,
  clearSelection,
  deletedHistory
} = useStore();

  const { screenToFlowPosition } = useReactFlow();

  // Enhanced connection handler with duplicate prevention
  const onConnect = useCallback(
    (params) => {
      console.log('Creating connection:', params);
      
      // Check for duplicate connections
      const isDuplicate = edges.some(edge => 
        edge.source === params.source && 
        edge.target === params.target &&
        edge.sourceHandle === params.sourceHandle &&
        edge.targetHandle === params.targetHandle
      );

      if (isDuplicate) {
        console.warn('Duplicate connection prevented');
        alert('⚠️ This connection already exists!');
        return;
      }

      // Check for self-loop
      if (params.source === params.target) {
        console.warn('Self-loop prevented');
        alert('⚠️ Cannot connect a node to itself!');
        return;
      }

      const newEdge = {
        id: `e${params.source}-${params.sourceHandle || 'out'}-${params.target}-${params.targetHandle || 'in'}`,
        ...params,
        animated: true,
        style: {
          strokeWidth: 3,
          stroke: '#6366f1',
        },
        type: 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#6366f1',
        }
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges, edges]
  );

  // Enhanced drag handlers
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    
    // Add visual feedback
    event.currentTarget.style.background = 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #ddd6fe 100%)';
  }, []);

  const onDragLeave = useCallback((event) => {
    // Remove visual feedback
    event.currentTarget.style.background = '';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      event.currentTarget.style.background = '';

      const nodeType = event.dataTransfer.getData('application/reactflow');
      if (!nodeType) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      console.log(`Dropping ${nodeType} at position:`, position);
      addNode(nodeType, {
        x: Math.round(position.x),
        y: Math.round(position.y),
      });
    },
    [addNode, screenToFlowPosition]
  );

  // Save pipeline handler
  const handleSavePipeline = useCallback(() => {
    try {
      const pipelineData = exportPipeline();
      const blob = new Blob([JSON.stringify(pipelineData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pipeline-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      console.log('Pipeline saved successfully');
    } catch (error) {
      console.error('Save failed:', error);
    }
  }, [exportPipeline]);

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden relative">
      {/* Main Canvas */}
      <div
        ref={reactFlowWrapper}
        className="w-full h-full"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          connectionLineType={ConnectionLineType.SmoothStep}
          connectionLineStyle={connectionLineStyle}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          fitViewOptions={{
            padding: 0.15,
            includeHiddenNodes: false,
          }}
          snapToGrid
          snapGrid={[20, 20]}
          deleteKeyCode={["Delete", "Backspace"]}
          multiSelectionKeyCode="Ctrl"
          panOnScroll
          selectionOnDrag
          panOnDrag={[1, 2]}
          selectionMode="partial"
          attributionPosition="bottom-left"
          proOptions={{ hideAttribution: true }}
          className="bg-transparent"
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.75 }}
        >
          {/* Enhanced Background */}
          <Background 
            color="#cbd5e1" 
            gap={25} 
            size={1.5}
            style={{ 
              opacity: 0.5,
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 30%, #e0f2fe 60%, #ddd6fe 100%)',
            }}
            variant="dots"
          />

          {/* Enhanced Controls */}
          <Controls 
            position="bottom-right"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              border: '2px solid rgba(99, 102, 241, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              marginRight: '24px',
              marginBottom: '24px',
              backdropFilter: 'blur(16px)'
            }}
            showZoom={true}
            showFitView={true}
            showInteractive={true}
          />

          {/* Header Panel */}
          <Panel position="top-center">
            <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl px-8 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-5">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-2xl">🚀</span>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Pipeline Builder
                      </h1>
                      <p className="text-sm text-gray-600">Visual data pipeline creator & analyzer</p>
                    </div>
                  </div>
                  
                  {(nodes.length > 0 || edges.length > 0) && (
                    <div className="flex items-center space-x-6 ml-8 pl-6 border-l border-gray-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-gray-700">{nodes.length} nodes</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-gray-700">{edges.length} connections</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleSavePipeline}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Save className="w-5 h-5" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </Panel>

          {/* Sidebar Panels */}
          <Panel position="top-left">
            <Toolbar />
          </Panel>

          <Panel position="bottom-left">
            <DeleteToolbar 
              nodes={nodes}
              edges={edges}
              onDeleteSelected={deleteSelected}
              onDeleteAll={deleteAll}
              onUndoDelete={undoDelete}
              onSelectAll={selectAll}
              onClearSelection={clearSelection}
              deletedHistory={deletedHistory}
            />
          </Panel>

          <Panel position="bottom-center">
            <SubmitButton />
          </Panel>

          <Panel position="top-right">
            <PipelineStatus />
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [showWelcome, setShowWelcome] = useState(true);

  if (showWelcome) {
    return <WelcomeScreen onGetStarted={() => setShowWelcome(false)} />;
  }

  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
};

export default App;

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
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';

// Import components
import Toolbar from './components/ui/Toolbar';
import SubmitButton from './components/ui/SubmitButton';
import PipelineStatus from './components/ui/PipelineStatus';
import useStore from './store/useStore';

// Import icons
import {
  Database,
  BarChart3,
  Cpu,
  Filter,
  Globe,
  Shuffle,
  HardDrive,
  Save,
  Plus,
  Activity,
  Zap
} from 'lucide-react';

// Enhanced node types with handles for connections
const nodeTypes = {
  input: ({ data, selected }) => (
    <div className={`group px-6 py-4 shadow-lg rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white border-2 min-w-[160px] transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
      selected ? 'border-white scale-110 shadow-2xl' : 'border-emerald-300'
    }`}>
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
          <Database className="w-6 h-6" />
        </div>
        <div>
          <div className="text-lg font-bold">Input</div>
          <div className="text-xs text-emerald-100 mt-1 line-clamp-1">{data.label}</div>
        </div>
      </div>
      <div className="mt-2 text-xs text-emerald-100 opacity-80">
        {data.description}
      </div>
      {/* Only output handle for input nodes */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-4 h-4 bg-white border-2 border-emerald-400"
      />
    </div>
  ),

  output: ({ data, selected }) => (
    <div className={`group px-6 py-4 shadow-lg rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-2 min-w-[160px] transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
      selected ? 'border-white scale-110 shadow-2xl' : 'border-blue-400'
    }`}>
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <div className="text-lg font-bold">Output</div>
          <div className="text-xs text-blue-100 mt-1 line-clamp-1">{data.label}</div>
        </div>
      </div>
      <div className="mt-2 text-xs text-blue-100 opacity-80">
        {data.description}
      </div>
      {/* Only input handle for output nodes */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-4 h-4 bg-white border-2 border-blue-400"
      />
    </div>
  ),

  process: ({ data, selected }) => (
    <div className={`group px-6 py-4 shadow-lg rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white border-2 min-w-[160px] transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
      selected ? 'border-white scale-110 shadow-2xl' : 'border-purple-400'
    }`}>
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
          <Cpu className="w-6 h-6" />
        </div>
        <div>
          <div className="text-lg font-bold">Process</div>
          <div className="text-xs text-purple-100 mt-1 line-clamp-1">{data.label}</div>
        </div>
      </div>
      <div className="mt-2 text-xs text-purple-100 opacity-80">
        {data.description}
      </div>
      {/* Both input and output handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-4 h-4 bg-white border-2 border-purple-400"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-4 h-4 bg-white border-2 border-purple-400"
      />
    </div>
  ),

  filter: ({ data, selected }) => (
    <div className={`group px-6 py-4 shadow-lg rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white border-2 min-w-[160px] transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
      selected ? 'border-white scale-110 shadow-2xl' : 'border-orange-400'
    }`}>
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
          <Filter className="w-6 h-6" />
        </div>
        <div>
          <div className="text-lg font-bold">Filter</div>
          <div className="text-xs text-orange-100 mt-1 line-clamp-1">{data.label}</div>
        </div>
      </div>
      <div className="mt-2 text-xs text-orange-100 opacity-80">
        {data.description}
      </div>
      <Handle
        type="target"
        position={Position.Left}
        className="w-4 h-4 bg-white border-2 border-orange-400"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-4 h-4 bg-white border-2 border-orange-400"
      />
    </div>
  ),

  api: ({ data, selected }) => (
    <div className={`group px-6 py-4 shadow-lg rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white border-2 min-w-[160px] transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
      selected ? 'border-white scale-110 shadow-2xl' : 'border-cyan-400'
    }`}>
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
          <Globe className="w-6 h-6" />
        </div>
        <div>
          <div className="text-lg font-bold">API</div>
          <div className="text-xs text-cyan-100 mt-1 line-clamp-1">{data.label}</div>
        </div>
      </div>
      <div className="mt-2 text-xs text-cyan-100 opacity-80">
        {data.description}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-4 h-4 bg-white border-2 border-cyan-400"
      />
    </div>
  ),

  transform: ({ data, selected }) => (
    <div className={`group px-6 py-4 shadow-lg rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-2 min-w-[160px] transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
      selected ? 'border-white scale-110 shadow-2xl' : 'border-indigo-400'
    }`}>
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
          <Shuffle className="w-6 h-6" />
        </div>
        <div>
          <div className="text-lg font-bold">Transform</div>
          <div className="text-xs text-indigo-100 mt-1 line-clamp-1">{data.label}</div>
        </div>
      </div>
      <div className="mt-2 text-xs text-indigo-100 opacity-80">
        {data.description}
      </div>
      <Handle
        type="target"
        position={Position.Left}
        className="w-4 h-4 bg-white border-2 border-indigo-400"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-4 h-4 bg-white border-2 border-indigo-400"
      />
    </div>
  ),

  database: ({ data, selected }) => (
    <div className={`group px-6 py-4 shadow-lg rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 text-white border-2 min-w-[160px] transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
      selected ? 'border-white scale-110 shadow-2xl' : 'border-slate-400'
    }`}>
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
          <HardDrive className="w-6 h-6" />
        </div>
        <div>
          <div className="text-lg font-bold">Database</div>
          <div className="text-xs text-slate-100 mt-1 line-clamp-1">{data.label}</div>
        </div>
      </div>
      <div className="mt-2 text-xs text-slate-100 opacity-80">
        {data.description}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-4 h-4 bg-white border-2 border-slate-400"
      />
    </div>
  )
};

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
    exportPipeline
  } = useStore();

  const { screenToFlowPosition } = useReactFlow();

  // Enhanced connection handler
  const onConnect = useCallback(
    (params) => {
      console.log('Creating connection:', params);
      const newEdge = {
        id: `e${params.source}-${params.target}`,
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
    [setEdges]
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
                  className="p-3 rounded-xl bg-indigo-100 hover:bg-indigo-200 transition-all duration-300 group hover:scale-110"
                  title="Save pipeline"
                >
                  <Save className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </Panel>

          {/* Welcome Panel - Enhanced */}
          {nodes.length === 0 && (
            <Panel position="center" className="pointer-events-none">
              {/* <div className="text-center p-16 bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-2xl max-w-2xl">
                <div className="text-8xl mb-8 animate-bounce">🚀</div>
                <h2 className="text-4xl font-bold text-gray-800 mb-6">
                  Welcome to Pipeline Builder
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-lg mx-auto">
                  Create powerful data pipelines by adding nodes from the palette and connecting them together. 
                  Build, analyze, and optimize your data workflows with ease.
                </p>
                
                <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
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
              </div> */}
            </Panel>
          )}
        </ReactFlow>
      </div>

      {/* Floating UI Components */}
      <div className="fixed top-6 left-6 z-30 pointer-events-auto">
        <PipelineStatus />
      </div>
      
      <div className="fixed top-6 right-6 z-40 pointer-events-auto">
        <Toolbar />
      </div>
      
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto">
        <SubmitButton />
      </div>

      {/* Progress Indicator - Enhanced */}
      {nodes.length > 0 && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-lg px-8 py-4 rounded-2xl border border-gray-200/60 shadow-xl flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-gray-700">{nodes.length} nodes active</span>
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-gray-700">{edges.length} connections</span>
            </div>
            {nodes.length > 1 && edges.length > 0 && (
              <>
                <div className="w-px h-6 bg-gray-300"></div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-purple-700">Ready to analyze</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Main App Component
function App() {
  const [showWorkingArea, setShowWorkingArea] = useState(false);

  const handleGetStarted = () => {
    setShowWorkingArea(true);
  };

  if (!showWorkingArea) {
    return <WelcomeScreen onGetStarted={handleGetStarted} />;
  }

  return (
    <div className="w-full h-full overflow-hidden">
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    </div>
  );
}

export default App;
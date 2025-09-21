import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  Controls,
  Background,
  addEdge,
  ConnectionLineType,
  Panel,
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
  applyNodeChanges,
  applyEdgeChanges
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Maximize2, 
  Minimize2, 
  Save, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Plus, 
  Activity,
  Play,
  Download,
  Zap,
  Search,
  ChevronDown,
  ChevronRight,
  Database,
  Filter,
  Cpu,
  FileText,
  Globe,
  BarChart3,
  Trash2,
  Settings,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { create } from 'zustand';

// Enhanced Zustand store
const useStore = create((set, get) => ({
  nodes: [],
  edges: [],
  isLoading: false,
  error: null,
  pipelineResult: null,

  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes)
    }));
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges)
    }));
  },

  addNode: (nodeType, position) => {
    const newNode = {
      id: `${nodeType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: nodeType,
      position,
      data: { 
        label: getNodeLabel(nodeType),
        config: getDefaultNodeConfig(nodeType)
      },
    };

    set((state) => ({
      nodes: [...state.nodes, newNode]
    }));
  },

  setEdges: (edgesOrFunction) => {
    if (typeof edgesOrFunction === 'function') {
      set((state) => ({
        edges: edgesOrFunction(state.edges)
      }));
    } else {
      set({ edges: edgesOrFunction });
    }
  },

  clearPipeline: () => {
    set({
      nodes: [],
      edges: [],
      error: null,
      pipelineResult: null
    });
  },

  exportPipeline: () => {
    const state = get();
    return {
      nodes: state.nodes,
      edges: state.edges,
      timestamp: new Date().toISOString()
    };
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setPipelineResult: (result) => set({ pipelineResult: result }),
}));

// Node type definitions with proper React components
const nodeTypes = {
  input: ({ data, selected }) => (
    <div className={`px-6 py-4 shadow-lg rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white border-2 min-w-[140px] transition-all duration-300 hover:shadow-2xl hover:scale-105 ${selected ? 'border-white scale-110' : 'border-emerald-300'}`}>
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <Database className="w-5 h-5" />
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">Input</div>
          <div className="text-xs text-emerald-100 mt-1">{data.label}</div>
        </div>
      </div>
    </div>
  ),
  output: ({ data, selected }) => (
    <div className={`px-6 py-4 shadow-lg rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-2 min-w-[140px] transition-all duration-300 hover:shadow-2xl hover:scale-105 ${selected ? 'border-white scale-110' : 'border-blue-400'}`}>
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">Output</div>
          <div className="text-xs text-blue-100 mt-1">{data.label}</div>
        </div>
      </div>
    </div>
  ),
  process: ({ data, selected }) => (
    <div className={`px-6 py-4 shadow-lg rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white border-2 min-w-[140px] transition-all duration-300 hover:shadow-2xl hover:scale-105 ${selected ? 'border-white scale-110' : 'border-purple-400'}`}>
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <Cpu className="w-5 h-5" />
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">Process</div>
          <div className="text-xs text-purple-100 mt-1">{data.label}</div>
        </div>
      </div>
    </div>
  ),
  filter: ({ data, selected }) => (
    <div className={`px-6 py-4 shadow-lg rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white border-2 min-w-[140px] transition-all duration-300 hover:shadow-2xl hover:scale-105 ${selected ? 'border-white scale-110' : 'border-orange-400'}`}>
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <Filter className="w-5 h-5" />
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">Filter</div>
          <div className="text-xs text-orange-100 mt-1">{data.label}</div>
        </div>
      </div>
    </div>
  ),
  api: ({ data, selected }) => (
    <div className={`px-6 py-4 shadow-lg rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white border-2 min-w-[140px] transition-all duration-300 hover:shadow-2xl hover:scale-105 ${selected ? 'border-white scale-110' : 'border-cyan-400'}`}>
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <Globe className="w-5 h-5" />
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">API</div>
          <div className="text-xs text-cyan-100 mt-1">{data.label}</div>
        </div>
      </div>
    </div>
  )
};

// Helper functions
function getNodeLabel(nodeType) {
  const labels = {
    input: 'Data Input',
    output: 'Data Output',
    process: 'Process Data',
    filter: 'Filter Data',
    api: 'API Call'
  };
  return labels[nodeType] || nodeType;
}

function getDefaultNodeConfig(nodeType) {
  const configs = {
    input: { source: 'file', format: 'json' },
    output: { destination: 'file', format: 'json' },
    process: { operation: 'transform', settings: {} },
    filter: { condition: 'equals', value: '' },
    api: { method: 'GET', url: '', headers: {} }
  };
  return configs[nodeType] || {};
}

// Node categories for palette
const nodeCategories = {
  'Data Sources': [
    { type: 'input', label: 'Data Input', description: 'Input data source', icon: Database },
    { type: 'api', label: 'API Call', description: 'External API integration', icon: Globe },
  ],
  'Processing': [
    { type: 'process', label: 'Data Process', description: 'Transform and process data', icon: Cpu },
    { type: 'filter', label: 'Data Filter', description: 'Filter and validate data', icon: Filter },
  ],
  'Outputs': [
    { type: 'output', label: 'Data Output', description: 'Output processed data', icon: BarChart3 },
  ]
};

// Enhanced connection styling
const connectionLineStyle = {
  strokeWidth: 3,
  stroke: '#6366f1',
  strokeDasharray: '8,4',
};

const defaultEdgeOptions = {
  style: { 
    strokeWidth: 2.5, 
    stroke: '#6366f1',
    strokeDasharray: '0'
  },
  type: 'smoothstep',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#6366f1',
    width: 20,
    height: 20
  },
  animated: true,
};

// Enhanced Toolbar Component
const Toolbar = () => {
  const { addNode, nodes, edges } = useStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set(['Data Sources', 'Processing']));

  const handleAddNode = (nodeType) => {
    const position = {
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
    };
    addNode(nodeType, position);
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const filteredCategories = Object.entries(nodeCategories).reduce((acc, [category, nodes]) => {
    if (!searchTerm) return { ...acc, [category]: nodes };
    
    const filteredNodes = nodes.filter(node => 
      node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (filteredNodes.length > 0) {
      acc[category] = filteredNodes;
    }
    return acc;
  }, {});

  if (isCollapsed) {
    return (
      <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-3">
        <button
          onClick={() => setIsCollapsed(false)}
          className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl flex items-center justify-center hover:scale-110 transition-all hover:shadow-lg relative overflow-hidden group"
          title="Open Node Palette"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform relative z-10" />
          {nodes.length > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {nodes.length}
            </div>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 max-h-[85vh] bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 bg-[radial-gradient(circle_at_30%_20%,_white_0%,_transparent_50%)]"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-lg flex items-center">
              <span className="mr-2 text-xl">🧩</span>
              Node Palette
            </h3>
            <p className="text-white/90 text-sm">
              {nodes.length} nodes • {edges.length} connections
            </p>
          </div>
          <button
            onClick={() => setIsCollapsed(true)}
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/20 transition-all"
          >
            <EyeOff className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(filteredCategories).map(([category, nodes]) => (
          <div key={category} className="border-b border-gray-50 last:border-b-0">
            <button
              onClick={() => toggleCategory(category)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-700">{category}</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {nodes.length}
                </span>
                {expandedCategories.has(category) ? 
                  <ChevronDown className="w-4 h-4 text-gray-400" /> : 
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                }
              </div>
            </button>
            
            {expandedCategories.has(category) && (
              <div className="pb-2">
                {nodes.map((node) => {
                  const IconComponent = node.icon;
                  return (
                    <button
                      key={node.type}
                      onClick={() => handleAddNode(node.type)}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData('application/reactflow', node.type);
                        event.dataTransfer.effectAllowed = 'move';
                      }}
                      className="w-full mx-2 mb-2 p-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all hover:shadow-lg hover:scale-[1.02] flex items-center space-x-3"
                    >
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-sm">{node.label}</div>
                        <div className="text-xs text-indigo-100">{node.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 text-center">
        💡 Click nodes to add or drag them onto the canvas
      </div>
    </div>
  );
};

// Enhanced Submit Button Component
const SubmitButton = () => {
  const { nodes, edges, clearPipeline, isLoading, setLoading, setError, error } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleAnalyze = async () => {
    if (nodes.length === 0) {
      setError('Please add some nodes first!');
      return;
    }

    setLoading(true);
    setError(null);
    
    setTimeout(() => {
      setLoading(false);
      alert(`Pipeline Analysis:\n- Nodes: ${nodes.length}\n- Edges: ${edges.length}\n- Status: Analysis complete!`);
    }, 2000);
  };

  const handleClear = () => {
    if (nodes.length > 0 || edges.length > 0) {
      if (window.confirm('Are you sure you want to clear the pipeline?')) {
        clearPipeline();
      }
    }
  };

  const handleDownload = () => {
    const data = useStore.getState().exportPipeline();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isExpanded) {
    return (
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg flex items-center justify-center hover:scale-110 transition-all hover:shadow-xl relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Activity className="w-7 h-7 group-hover:scale-110 transition-transform relative z-10" />
          {nodes.length > 0 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 text-white text-sm font-bold rounded-full flex items-center justify-center">
              {nodes.length}
            </div>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6 min-w-96">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-indigo-600" />
          Pipeline Control
        </h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          <Minimize2 className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
          <XCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{nodes.length}</div>
          <div className="text-sm text-blue-600">Nodes</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{edges.length}</div>
          <div className="text-sm text-green-600">Connections</div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleAnalyze}
          disabled={isLoading || nodes.length === 0}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Analyze Pipeline</span>
            </>
          )}
        </button>

        <div className="flex space-x-2">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          
          {(nodes.length > 0 || edges.length > 0) && (
            <button
              onClick={handleClear}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Pipeline Status
const PipelineStatus = () => {
  const { nodes, edges } = useStore();
  const [isMinimized, setIsMinimized] = useState(false);

  const hasInput = nodes.some(node => node.type === 'input');
  const hasOutput = nodes.some(node => node.type === 'output');
  const isConnected = edges.length > 0;

  const getStatus = () => {
    if (nodes.length === 0) return { text: 'Empty Pipeline', color: 'gray', icon: Plus };
    if (!hasInput) return { text: 'Needs Input', color: 'yellow', icon: AlertTriangle };
    if (!hasOutput) return { text: 'Needs Output', color: 'yellow', icon: AlertTriangle };
    if (!isConnected && nodes.length > 1) return { text: 'Not Connected', color: 'red', icon: XCircle };
    return { text: 'Ready to Analyze', color: 'green', icon: CheckCircle };
  };

  const status = getStatus();

  if (isMinimized) {
    return (
      <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-3">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center space-x-3"
        >
          <div className={`w-3 h-3 rounded-full animate-pulse ${
            status.color === 'green' ? 'bg-green-400' :
            status.color === 'yellow' ? 'bg-yellow-400' :
            status.color === 'red' ? 'bg-red-400' : 'bg-gray-400'
          }`}></div>
          <span className="text-sm font-medium">{nodes.length} nodes</span>
          <Maximize2 className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-4 min-w-72">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            status.color === 'green' ? 'bg-green-100 text-green-600' :
            status.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
            status.color === 'red' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
          }`}>
            <status.icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Pipeline Status</h3>
            <p className="text-xs text-gray-500">Real-time monitoring</p>
          </div>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          <Minimize2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-xl font-bold text-blue-600">{nodes.length}</div>
          <div className="text-xs text-blue-600">Nodes</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-xl font-bold text-green-600">{edges.length}</div>
          <div className="text-xs text-green-600">Connections</div>
        </div>
      </div>

      <div className={`p-3 rounded-lg border ${
        status.color === 'green' ? 'bg-green-50 border-green-200' :
        status.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
        status.color === 'red' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full animate-pulse ${
            status.color === 'green' ? 'bg-green-400' :
            status.color === 'yellow' ? 'bg-yellow-400' :
            status.color === 'red' ? 'bg-red-400' : 'bg-gray-400'
          }`}></div>
          <span className={`font-medium ${
            status.color === 'green' ? 'text-green-700' :
            status.color === 'yellow' ? 'text-yellow-700' :
            status.color === 'red' ? 'text-red-700' : 'text-gray-700'
          }`}>
            {status.text}
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${hasInput ? 'bg-green-400' : 'bg-gray-300'}`}></div>
          <span className="text-gray-600">Input</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-blue-400' : 'bg-gray-300'}`}></div>
          <span className="text-gray-600">Connected</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${hasOutput ? 'bg-green-400' : 'bg-gray-300'}`}></div>
          <span className="text-gray-600">Output</span>
        </div>
      </div>
    </div>
  );
};

// Main Flow Component
const FlowContent = () => {
  const reactFlowWrapper = useRef(null);
  
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    addNode,
    setEdges
  } = useStore();

  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData('application/reactflow');
      if (!nodeType) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(nodeType, {
        x: Math.round(position.x),
        y: Math.round(position.y),
      });
    },
    [addNode, screenToFlowPosition]
  );

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div 
        ref={reactFlowWrapper} 
        className="w-full h-full"
        onDragOver={onDragOver}
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
          snapGrid={[15, 15]}
          deleteKeyCode="Delete"
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
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        >
          <Background 
            color="#cbd5e1" 
            gap={20} 
            size={1.2}
            style={{ 
              opacity: 0.4,
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 30%, #e0f2fe 60%, #ddd6fe 100%)',
            }}
            variant="dots"
          />

          {/* No MiniMap - removed for better performance */}

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
          
          {/* Header */}
          <Panel position="top-center">
            <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-xl">🚀</span>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Pipeline Builder
                      </h1>
                      <p className="text-xs text-gray-500">Visual data pipeline creator</p>
                    </div>
                  </div>
                  
                  {(nodes.length > 0 || edges.length > 0) && (
                    <div className="flex items-center space-x-4 ml-6">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">{nodes.length} nodes</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">{edges.length} connections</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      try {
                        const pipelineData = useStore.getState().exportPipeline();
                        const blob = new Blob([JSON.stringify(pipelineData, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `pipeline-${Date.now()}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      } catch (error) {
                        console.error('Save failed:', error);
                      }
                    }}
                    className="p-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 transition-colors group"
                    title="Save pipeline"
                  >
                    <Save className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </Panel>

          {nodes.length === 0 && (
            <Panel position="center" className="pointer-events-none">
              {/* <div className="text-center p-12 bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-2xl max-w-lg">
                <div className="text-6xl mb-6 animate-bounce">🚀</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Welcome to Pipeline Builder
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Create powerful data pipelines by adding nodes from the palette and connecting them together.
                </p>
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mb-2">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium">Add Nodes</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center mb-2">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium">Connect</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center mb-2">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium">Analyze</span>
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
    </div>
  );
};

// Main Component
const PipelineFlow = () => {
  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <ReactFlowProvider>
        <FlowContent />
      </ReactFlowProvider>
    </div>
  );
};

export default PipelineFlow;
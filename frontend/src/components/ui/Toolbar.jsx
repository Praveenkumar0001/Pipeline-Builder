import React, { useState, useCallback } from 'react';
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Minus, 
  XCircle,
  Database,
  Filter,
  Cpu,
  Globe,
  BarChart3,
  Shuffle,
  HardDrive,
  FileText,
  Upload,
  Download,
  Server,
  Cloud,
  Zap,
  Settings,
  Mail,
  MessageSquare,
  Image,
  Video,
  Music,
  Brain,
  Code,
  Network,
  FileJson,
  Hash,
  Eye,
  Shield,
  GitBranch,
  Timer,
  Layers,
  Target,
  Workflow,
  Radio,
  MonitorSpeaker
} from 'lucide-react';
import useStore from '../../store/useStore';

// Comprehensive node categories with enhanced types
const nodeCategories = {
  'Data Sources': [
    { 
      type: 'input', 
      label: 'File Input', 
      description: 'Input data from CSV, JSON, Excel, or other file formats', 
      icon: FileText,
      color: 'from-emerald-500 to-teal-600',
      handles: { source: true, target: false }
    },
    { 
      type: 'api', 
      label: 'REST API', 
      description: 'Fetch data from REST APIs with authentication support', 
      icon: Globe,
      color: 'from-cyan-500 to-blue-600',
      handles: { source: true, target: false }
    },
    { 
      type: 'database', 
      label: 'Database', 
      description: 'Connect to SQL/NoSQL databases (MySQL, PostgreSQL, MongoDB)', 
      icon: Database,
      color: 'from-slate-500 to-gray-600',
      handles: { source: true, target: false }
    },
    { 
      type: 'cloud', 
      label: 'Cloud Storage', 
      description: 'Access AWS S3, Google Cloud, Azure Blob storage', 
      icon: Cloud,
      color: 'from-sky-500 to-blue-600',
      handles: { source: true, target: false }
    },
    { 
      type: 'stream', 
      label: 'Data Stream', 
      description: 'Real-time data from Kafka, RabbitMQ, or WebSocket', 
      icon: Radio,
      color: 'from-yellow-500 to-orange-600',
      handles: { source: true, target: false }
    },
    { 
      type: 'webhook', 
      label: 'Webhook', 
      description: 'Receive data via HTTP webhooks and callbacks', 
      icon: Network,
      color: 'from-green-500 to-emerald-600',
      handles: { source: true, target: false }
    }
  ],
  'Processing': [
    { 
      type: 'process', 
      label: 'Data Processor', 
      description: 'Transform, clean, and manipulate data records', 
      icon: Cpu,
      color: 'from-purple-500 to-pink-600',
      handles: { source: true, target: true }
    },
    { 
      type: 'filter', 
      label: 'Data Filter', 
      description: 'Filter records based on conditions and rules', 
      icon: Filter,
      color: 'from-orange-500 to-red-500',
      handles: { source: true, target: true }
    },
    { 
      type: 'transform', 
      label: 'Data Transform', 
      description: 'Convert data formats and structures', 
      icon: Shuffle,
      color: 'from-indigo-500 to-purple-600',
      handles: { source: true, target: true }
    },
    { 
      type: 'aggregate', 
      label: 'Aggregator', 
      description: 'Group and summarize data with functions (sum, avg, count)', 
      icon: BarChart3,
      color: 'from-green-500 to-emerald-600',
      handles: { source: true, target: true }
    },
    { 
      type: 'join', 
      label: 'Data Join', 
      description: 'Join multiple data sources on common keys', 
      icon: GitBranch,
      color: 'from-teal-500 to-cyan-600',
      handles: { source: true, target: true }
    },
    { 
      type: 'sort', 
      label: 'Data Sort', 
      description: 'Sort data by specified fields and criteria', 
      icon: Layers,
      color: 'from-blue-500 to-indigo-600',
      handles: { source: true, target: true }
    },
    { 
      type: 'validate', 
      label: 'Data Validator', 
      description: 'Validate data quality and schema compliance', 
      icon: Shield,
      color: 'from-red-500 to-pink-600',
      handles: { source: true, target: true }
    }
  ],
  'AI & ML': [
    { 
      type: 'llm', 
      label: 'LLM Node', 
      description: 'Large Language Model processing (GPT, Claude, etc.)', 
      icon: Brain,
      color: 'from-violet-500 to-purple-600',
      handles: { source: true, target: true }
    },
    { 
      type: 'ml', 
      label: 'ML Model', 
      description: 'Apply trained machine learning models for prediction', 
      icon: Server,
      color: 'from-indigo-500 to-purple-600',
      handles: { source: true, target: true }
    },
    { 
      type: 'embedding', 
      label: 'Text Embeddings', 
      description: 'Generate vector embeddings from text data', 
      icon: Hash,
      color: 'from-pink-500 to-rose-600',
      handles: { source: true, target: true }
    },
    { 
      type: 'sentiment', 
      label: 'Sentiment Analysis', 
      description: 'Analyze sentiment and emotions in text', 
      icon: MessageSquare,
      color: 'from-blue-500 to-cyan-600',
      handles: { source: true, target: true }
    },
    { 
      type: 'classification', 
      label: 'Classifier', 
      description: 'Classify data into predefined categories', 
      icon: Target,
      color: 'from-green-500 to-teal-600',
      handles: { source: true, target: true }
    }
  ],
  'Analytics': [
    { 
      type: 'statistics', 
      label: 'Statistics', 
      description: 'Statistical analysis and calculations (mean, std, correlation)', 
      icon: BarChart3,
      color: 'from-blue-500 to-indigo-600',
      handles: { source: true, target: true }
    },
    { 
      type: 'timeseries', 
      label: 'Time Series', 
      description: 'Time series analysis and forecasting', 
      icon: Timer,
      color: 'from-orange-500 to-red-600',
      handles: { source: true, target: true }
    },
    { 
      type: 'anomaly', 
      label: 'Anomaly Detection', 
      description: 'Detect outliers and anomalies in data', 
      icon: Eye,
      color: 'from-red-500 to-pink-600',
      handles: { source: true, target: true }
    }
  ],
  'Outputs': [
    { 
      type: 'output', 
      label: 'File Output', 
      description: 'Save processed data to files (CSV, JSON, Parquet)', 
      icon: Download,
      color: 'from-blue-500 to-indigo-600',
      handles: { source: false, target: true }
    },
    { 
      type: 'visualization', 
      label: 'Data Visualization', 
      description: 'Create charts, graphs, and interactive dashboards', 
      icon: BarChart3,
      color: 'from-pink-500 to-rose-600',
      handles: { source: false, target: true }
    },
    { 
      type: 'notification', 
      label: 'Notification', 
      description: 'Send alerts via email, Slack, or webhooks', 
      icon: Mail,
      color: 'from-red-500 to-pink-600',
      handles: { source: false, target: true }
    },
    { 
      type: 'dashboard', 
      label: 'Dashboard', 
      description: 'Create real-time monitoring dashboards', 
      icon: MonitorSpeaker,
      color: 'from-green-500 to-emerald-600',
      handles: { source: false, target: true }
    }
  ],
  'Media Processing': [
    { 
      type: 'image', 
      label: 'Image Processor', 
      description: 'Process, resize, and analyze images', 
      icon: Image,
      color: 'from-emerald-500 to-green-600',
      handles: { source: true, target: true }
    },
    { 
      type: 'video', 
      label: 'Video Processor', 
      description: 'Process video files, extract frames, convert formats', 
      icon: Video,
      color: 'from-purple-500 to-indigo-600',
      handles: { source: true, target: true }
    },
    { 
      type: 'audio', 
      label: 'Audio Processor', 
      description: 'Process audio files, extract features, transcribe', 
      icon: Music,
      color: 'from-orange-500 to-red-600',
      handles: { source: true, target: true }
    },
    { 
      type: 'ocr', 
      label: 'OCR Text Extract', 
      description: 'Extract text from images and documents', 
      icon: FileText,
      color: 'from-blue-500 to-cyan-600',
      handles: { source: true, target: true }
    }
  ],
  'Utilities': [
    { 
      type: 'basenode', 
      label: 'Base Node', 
      description: 'Generic configurable node for custom operations', 
      icon: Code,
      color: 'from-gray-500 to-slate-600',
      handles: { source: true, target: true }
    },
    { 
      type: 'conditional', 
      label: 'Conditional Logic', 
      description: 'Route data based on conditional statements', 
      icon: GitBranch,
      color: 'from-yellow-500 to-orange-600',
      handles: { source: true, target: true }
    },
    { 
      type: 'delay', 
      label: 'Delay/Throttle', 
      description: 'Add delays or throttle data processing rate', 
      icon: Timer,
      color: 'from-indigo-500 to-blue-600',
      handles: { source: true, target: true }
    },
    { 
      type: 'batch', 
      label: 'Batch Processor', 
      description: 'Process data in configurable batch sizes', 
      icon: Layers,
      color: 'from-teal-500 to-green-600',
      handles: { source: true, target: true }
    },
    { 
      type: 'router', 
      label: 'Data Router', 
      description: 'Route data to multiple outputs based on rules', 
      icon: Workflow,
      color: 'from-purple-500 to-pink-600',
      handles: { source: true, target: true }
    }
  ]
};

const Toolbar = () => {
  const { addNode, nodes, edges } = useStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(
    new Set(['Data Sources', 'Processing', 'AI & ML'])
  );

  // Enhanced node positioning with better overlap detection
  const handleAddNode = useCallback((nodeType) => {
    const gridSize = 25;
    const nodeWidth = 180;
    const nodeHeight = 120;
    const margin = 40;
    
    let position = { x: 150, y: 150 };
    
    if (nodes.length > 0) {
      let attempts = 0;
      const maxAttempts = 100;
      
      while (attempts < maxAttempts) {
        // Create a more distributed grid pattern
        const col = attempts % 6;
        const row = Math.floor(attempts / 6);
        
        position = {
          x: 150 + (col * (nodeWidth + margin)),
          y: 150 + (row * (nodeHeight + margin))
        };
        
        // Check for overlaps with existing nodes
        const hasOverlap = nodes.some(existingNode => {
          const dx = Math.abs(existingNode.position.x - position.x);
          const dy = Math.abs(existingNode.position.y - position.y);
          return dx < (nodeWidth + 20) && dy < (nodeHeight + 20);
        });
        
        if (!hasOverlap) break;
        attempts++;
      }
      
      // If all positions are taken, add some randomness
      if (attempts >= maxAttempts) {
        position.x += Math.random() * 200 - 100;
        position.y += Math.random() * 200 - 100;
      }
    }
    
    // Snap to grid for cleaner alignment
    position.x = Math.round(position.x / gridSize) * gridSize;
    position.y = Math.round(position.y / gridSize) * gridSize;
    
    console.log(`Adding ${nodeType} node at position:`, position);
    addNode(nodeType, position);
  }, [addNode, nodes]);

  // Toggle category expansion
  const toggleCategory = useCallback((category) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }, []);

  // Enhanced search with better filtering
  const filteredCategories = React.useMemo(() => {
    if (!searchTerm.trim()) return nodeCategories;
    
    const searchLower = searchTerm.toLowerCase();
    const filtered = {};
    
    Object.entries(nodeCategories).forEach(([category, categoryNodes]) => {
      const matchingNodes = categoryNodes.filter(node => 
        node.label.toLowerCase().includes(searchLower) ||
        node.description.toLowerCase().includes(searchLower) ||
        node.type.toLowerCase().includes(searchLower) ||
        category.toLowerCase().includes(searchLower)
      );
      
      if (matchingNodes.length > 0) {
        filtered[category] = matchingNodes;
      }
    });
    
    return filtered;
  }, [searchTerm]);

  // Auto-expand categories when searching
  React.useEffect(() => {
    if (searchTerm.trim()) {
      setExpandedCategories(new Set(Object.keys(filteredCategories)));
    }
  }, [searchTerm, filteredCategories]);

  const totalAvailableNodes = Object.values(filteredCategories)
    .reduce((sum, categoryNodes) => sum + categoryNodes.length, 0);

  // Collapsed view - enhanced
  if (isCollapsed) {
    return (
      <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-3">
        <button
          onClick={() => setIsCollapsed(false)}
          className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl flex items-center justify-center hover:scale-110 transition-all hover:shadow-lg relative overflow-hidden group"
          title="Open Enhanced Node Palette"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform relative z-10" />
          {nodes.length > 0 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {nodes.length}
            </div>
          )}
          <div className="absolute bottom-1 left-1 right-1 text-[8px] font-bold text-white/80 text-center">
            {totalAvailableNodes} NODES
          </div>
        </button>
      </div>
    );
  }

  // Enhanced expanded view
  return (
    <div className="w-96 max-h-[90vh] bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 bg-[radial-gradient(circle_at_30%_20%,_white_0%,_transparent_50%)]"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-xl flex items-center">
              <span className="mr-3 text-2xl">🧩</span>
              Enhanced Node Palette
            </h3>
            <p className="text-white/90 text-sm">
              {nodes.length} active nodes • {edges.length} connections • {totalAvailableNodes} available
            </p>
          </div>
          <button
            onClick={() => setIsCollapsed(true)}
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/20 transition-all"
            title="Collapse palette"
          >
            <Minus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Enhanced Search */}
      <div className="p-5 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search nodes by name, type, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear search"
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>
            {searchTerm ? (
              <span className="font-medium">Found {totalAvailableNodes} nodes</span>
            ) : (
              <span>{totalAvailableNodes} nodes across {Object.keys(nodeCategories).length} categories</span>
            )}
          </span>
          <span className="text-gray-400">v3.0</span>
        </div>
      </div>

      {/* Enhanced Categories */}
      <div className="flex-1 overflow-y-auto">
        {Object.keys(filteredCategories).length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-700 mb-2">No matching nodes found</h4>
            <p className="text-sm text-gray-500 mb-4">
              Try different keywords or browse all categories
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors font-medium"
            >
              Show All Nodes
            </button>
          </div>
        ) : (
          Object.entries(filteredCategories).map(([category, categoryNodes]) => (
            <div key={category} className="border-b border-gray-50 last:border-b-0">
              {/* Enhanced Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                    {category}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                    {categoryNodes.length}
                  </span>
                </div>
                {expandedCategories.has(category) ? 
                  <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" /> : 
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                }
              </button>
              
              {/* Enhanced Category Nodes */}
              {expandedCategories.has(category) && (
                <div className="pb-3">
                  {categoryNodes.map((node) => {
                    const IconComponent = node.icon;
                    return (
                      <div key={node.type} className="px-3 mb-2">
                        <button
                          onClick={() => handleAddNode(node.type)}
                          draggable
                          onDragStart={(event) => {
                            event.dataTransfer.setData('application/reactflow', node.type);
                            event.dataTransfer.effectAllowed = 'move';
                          }}
                          className={`w-full p-4 bg-gradient-to-r ${node.color} text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center space-x-4 group border border-white/20`}
                          title={`${node.label}: ${node.description}\n\nClick to add to canvas or drag for precise placement\nHandles: ${node.handles.source ? 'Output' : ''}${node.handles.source && node.handles.target ? ' + ' : ''}${node.handles.target ? 'Input' : ''}`}
                        >
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors shadow-sm">
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <div className="font-semibold text-base truncate">{node.label}</div>
                            <div className="text-sm text-white/90 line-clamp-2 leading-relaxed">
                              {node.description}
                            </div>
                            <div className="mt-2 flex items-center space-x-2">
                              <div className="flex items-center space-x-1">
                                {node.handles.target && (
                                  <div className="w-2 h-2 bg-white/60 rounded-full" title="Input handle" />
                                )}
                                {node.handles.source && (
                                  <div className="w-2 h-2 bg-white rounded-full" title="Output handle" />
                                )}
                              </div>
                              <span className="text-xs text-white/70 font-medium">
                                {node.type.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Enhanced Footer */}
      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-gray-700">{totalAvailableNodes} nodes ready</span>
          </div>
          <span className="text-xs text-gray-400 font-medium">Enhanced v3.0</span>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">
            💡 <span className="font-medium">Pro tip:</span> Click to add • Drag for placement • Check handles for connectivity
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
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
  Music
} from 'lucide-react';
import useStore from '../../store/useStore';

// Enhanced node categories with more node types
const nodeCategories = {
  'Data Sources': [
    { 
      type: 'input', 
      label: 'File Input', 
      description: 'Input data from CSV, JSON, or other files', 
      icon: FileText,
      color: 'from-emerald-500 to-teal-600'
    },
    { 
      type: 'api', 
      label: 'API Source', 
      description: 'Fetch data from REST APIs or web services', 
      icon: Globe,
      color: 'from-cyan-500 to-blue-600'
    },
    { 
      type: 'database', 
      label: 'Database', 
      description: 'Connect to SQL/NoSQL databases', 
      icon: Database,
      color: 'from-slate-500 to-gray-600'
    },
    { 
      type: 'cloud', 
      label: 'Cloud Storage', 
      description: 'Access cloud storage services', 
      icon: Cloud,
      color: 'from-sky-500 to-blue-600'
    },
    { 
      type: 'stream', 
      label: 'Data Stream', 
      description: 'Real-time data streaming source', 
      icon: Zap,
      color: 'from-yellow-500 to-orange-600'
    }
  ],
  'Processing': [
    { 
      type: 'process', 
      label: 'Data Processor', 
      description: 'Transform and process data', 
      icon: Cpu,
      color: 'from-purple-500 to-pink-600'
    },
    { 
      type: 'filter', 
      label: 'Data Filter', 
      description: 'Filter and validate data based on conditions', 
      icon: Filter,
      color: 'from-orange-500 to-red-500'
    },
    { 
      type: 'transform', 
      label: 'Data Transform', 
      description: 'Transform data structure and format', 
      icon: Shuffle,
      color: 'from-indigo-500 to-purple-600'
    },
    { 
      type: 'aggregate', 
      label: 'Aggregator', 
      description: 'Aggregate and summarize data', 
      icon: BarChart3,
      color: 'from-green-500 to-emerald-600'
    },
    { 
      type: 'join', 
      label: 'Data Join', 
      description: 'Join multiple data sources', 
      icon: Settings,
      color: 'from-teal-500 to-cyan-600'
    }
  ],
  'Analysis': [
    { 
      type: 'ml', 
      label: 'ML Model', 
      description: 'Apply machine learning models', 
      icon: Server,
      color: 'from-violet-500 to-purple-600'
    },
    { 
      type: 'statistics', 
      label: 'Statistics', 
      description: 'Statistical analysis and calculations', 
      icon: BarChart3,
      color: 'from-blue-500 to-indigo-600'
    }
  ],
  'Outputs': [
    { 
      type: 'output', 
      label: 'File Output', 
      description: 'Save data to files or databases', 
      icon: Download,
      color: 'from-blue-500 to-indigo-600'
    },
    { 
      type: 'visualization', 
      label: 'Visualization', 
      description: 'Create charts and visualizations', 
      icon: BarChart3,
      color: 'from-pink-500 to-rose-600'
    },
    { 
      type: 'notification', 
      label: 'Notification', 
      description: 'Send alerts and notifications', 
      icon: Mail,
      color: 'from-red-500 to-pink-600'
    }
  ],
  'Media': [
    { 
      type: 'image', 
      label: 'Image Processor', 
      description: 'Process and analyze images', 
      icon: Image,
      color: 'from-emerald-500 to-green-600'
    },
    { 
      type: 'video', 
      label: 'Video Processor', 
      description: 'Process video files', 
      icon: Video,
      color: 'from-purple-500 to-indigo-600'
    },
    { 
      type: 'audio', 
      label: 'Audio Processor', 
      description: 'Process audio files', 
      icon: Music,
      color: 'from-orange-500 to-red-600'
    }
  ]
};

const Toolbar = () => {
  const { addNode, nodes, edges } = useStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(
    new Set(['Data Sources', 'Processing'])
  );

  // Add node with smart positioning
  const handleAddNode = useCallback((nodeType) => {
    const gridSize = 20;
    const nodeWidth = 200;
    const nodeHeight = 100;
    
    let position = { x: 100, y: 100 };
    
    if (nodes.length > 0) {
      // Find a good position that doesn't overlap
      let attempts = 0;
      const maxAttempts = 50;
      
      while (attempts < maxAttempts) {
        const col = attempts % 5;
        const row = Math.floor(attempts / 5);
        
        position = {
          x: 100 + (col * (nodeWidth + 50)),
          y: 100 + (row * (nodeHeight + 50))
        };
        
        // Check for overlaps
        const hasOverlap = nodes.some(node => {
          const dx = Math.abs(node.position.x - position.x);
          const dy = Math.abs(node.position.y - position.y);
          return dx < nodeWidth && dy < nodeHeight;
        });
        
        if (!hasOverlap) break;
        attempts++;
      }
    }
    
    // Snap to grid
    position.x = Math.round(position.x / gridSize) * gridSize;
    position.y = Math.round(position.y / gridSize) * gridSize;
    
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

  // Filter categories based on search
  const filteredCategories = React.useMemo(() => {
    if (!searchTerm.trim()) return nodeCategories;
    
    const searchLower = searchTerm.toLowerCase();
    return Object.entries(nodeCategories).reduce((acc, [category, nodes]) => {
      const filteredNodes = nodes.filter(node => 
        node.label.toLowerCase().includes(searchLower) ||
        node.description.toLowerCase().includes(searchLower) ||
        node.type.toLowerCase().includes(searchLower) ||
        category.toLowerCase().includes(searchLower)
      );
      
      if (filteredNodes.length > 0) {
        acc[category] = filteredNodes;
      }
      return acc;
    }, {});
  }, [searchTerm]);

  // Auto-expand categories when searching
  React.useEffect(() => {
    if (searchTerm.trim()) {
      setExpandedCategories(new Set(Object.keys(filteredCategories)));
    }
  }, [searchTerm, filteredCategories]);

  const totalAvailableNodes = Object.values(filteredCategories)
    .reduce((sum, nodes) => sum + nodes.length, 0);

  // Collapsed view
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
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {nodes.length}
            </div>
          )}
        </button>
      </div>
    );
  }

  // Expanded view
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
            title="Collapse palette"
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear search"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="text-xs text-gray-600">
          {searchTerm ? (
            <span>Found {totalAvailableNodes} nodes</span>
          ) : (
            <span>Browse {totalAvailableNodes} available nodes</span>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto">
        {Object.keys(filteredCategories).length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-700 mb-2">No nodes found</h4>
            <p className="text-sm text-gray-500 mb-4">
              Try adjusting your search term
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              Clear search
            </button>
          </div>
        ) : (
          Object.entries(filteredCategories).map(([category, categoryNodes]) => (
            <div key={category} className="border-b border-gray-50 last:border-b-0">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-700">{category}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {categoryNodes.length}
                  </span>
                  {expandedCategories.has(category) ? 
                    <ChevronDown className="w-4 h-4 text-gray-400" /> : 
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  }
                </div>
              </button>
              
              {/* Category Nodes */}
              {expandedCategories.has(category) && (
                <div className="pb-2">
                  {categoryNodes.map((node) => {
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
                        className={`w-full mx-2 mb-2 p-3 bg-gradient-to-r ${node.color} text-white rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all flex items-center space-x-3 group`}
                        title={`${node.label}: ${node.description}\nClick to add or drag to canvas`}
                      >
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-medium text-sm">{node.label}</div>
                          <div className="text-xs text-white/80 line-clamp-1">
                            {node.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
        <div className="flex items-center justify-between mb-2">
          <span>Available nodes: {totalAvailableNodes}</span>
          <span className="text-gray-400">v2.1</span>
        </div>
        <div className="text-center text-gray-500">
          💡 Click to add • Drag for precise placement
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
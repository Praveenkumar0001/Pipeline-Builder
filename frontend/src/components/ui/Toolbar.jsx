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
  Globe,
  BarChart3,
  Shuffle,
  FileText,
  Upload,
  Download,
  Cloud,
  Settings,
  Mail,
  Image,
  Brain,
  Code,
  Hash,
  GitBranch,
  Timer,
  Layers,
  Radio,
  Trash2,
  Wand2,
  Save,
  CircleDot,
  Square
} from 'lucide-react';
import useStore from '../../store/useStore';

// Comprehensive node categories with existing and enhanced types
const nodeCategories = {
  'Core Nodes': [
    { 
      type: 'basenode', 
      label: 'Base Node', 
      description: 'Generic configurable base node for custom operations', 
      icon: Code,
      color: 'from-gray-500 to-slate-600',
      handles: { source: true, target: true },
      component: 'BaseNode'
    },
    { 
      type: 'input', 
      label: 'Input Node', 
      description: 'Input data from various sources and formats', 
      icon: Upload,
      color: 'from-emerald-500 to-teal-600',
      handles: { source: true, target: false },
      component: 'InputNode'
    },
    { 
      type: 'output', 
      label: 'Output Node', 
      description: 'Output processed data to files or destinations', 
      icon: Download,
      color: 'from-blue-500 to-indigo-600',
      handles: { source: false, target: true },
      component: 'OutputNode'
    },
    { 
      type: 'text', 
      label: 'Text Node', 
      description: 'Text processing with variable parsing and templating', 
      icon: FileText,
      color: 'from-purple-500 to-pink-600',
      handles: { source: true, target: true },
      component: 'TextNode'
    }
  ],
  'AI & Processing': [
    { 
      type: 'llm', 
      label: 'LLM Node', 
      description: 'Large Language Model processing (GPT, Claude, etc.)', 
      icon: Brain,
      color: 'from-violet-500 to-purple-600',
      handles: { source: true, target: true },
      component: 'LLMNode'
    },
    { 
      type: 'api', 
      label: 'API Node', 
      description: 'Make HTTP requests to external APIs', 
      icon: Globe,
      color: 'from-cyan-500 to-blue-600',
      handles: { source: true, target: true },
      component: 'APINode'
    },
    { 
      type: 'filter', 
      label: 'Filter Node', 
      description: 'Filter data based on conditions and rules', 
      icon: Filter,
      color: 'from-orange-500 to-red-500',
      handles: { source: true, target: true },
      component: 'FilterNode'
    },
    { 
      type: 'transform', 
      label: 'Transform Node', 
      description: 'Transform data structure and format', 
      icon: Shuffle,
      color: 'from-indigo-500 to-purple-600',
      handles: { source: true, target: true },
      component: 'TransformNode'
    },
    { 
      type: 'math', 
      label: 'Math Node', 
      description: 'Mathematical operations and calculations', 
      icon: Hash,
      color: 'from-red-500 to-pink-600',
      handles: { source: true, target: true },
      component: 'MathNode'
    }
  ],
  'Data Sources': [
    { 
      type: 'database', 
      label: 'Database Node', 
      description: 'Connect to SQL/NoSQL databases', 
      icon: Database,
      color: 'from-slate-500 to-gray-600',
      handles: { source: true, target: false },
      component: 'DatabaseNode'
    },
    { 
      type: 'document', 
      label: 'Document Node', 
      description: 'Process PDF, Word, and other documents', 
      icon: FileText,
      color: 'from-green-500 to-teal-600',
      handles: { source: true, target: false },
      component: 'DocumentNode'
    },
    { 
      type: 'cloud', 
      label: 'Cloud Storage', 
      description: 'Access cloud storage services (AWS, GCP, Azure)', 
      icon: Cloud,
      color: 'from-sky-500 to-blue-600',
      handles: { source: true, target: false },
      component: 'BaseNode'
    },
    { 
      type: 'stream', 
      label: 'Data Stream', 
      description: 'Real-time data streaming (Kafka, RabbitMQ)', 
      icon: Radio,
      color: 'from-yellow-500 to-orange-600',
      handles: { source: true, target: false },
      component: 'BaseNode'
    }
  ],
  'Analytics': [
    { 
      type: 'statistics', 
      label: 'Statistics Node', 
      description: 'Statistical analysis and calculations', 
      icon: BarChart3,
      color: 'from-blue-500 to-indigo-600',
      handles: { source: true, target: true },
      component: 'BaseNode'
    },
    { 
      type: 'aggregate', 
      label: 'Aggregator', 
      description: 'Group and summarize data', 
      icon: Layers,
      color: 'from-green-500 to-emerald-600',
      handles: { source: true, target: true },
      component: 'AggregateNode'
    },
    { 
      type: 'join', 
      label: 'Data Join', 
      description: 'Join multiple data sources', 
      icon: GitBranch,
      color: 'from-teal-500 to-cyan-600',
      handles: { source: true, target: true },
      component: 'JoinNode'
    }
  ],
  'Media & Communication': [
    { 
      type: 'image', 
      label: 'Image Processor', 
      description: 'Process and analyze images', 
      icon: Image,
      color: 'from-emerald-500 to-green-600',
      handles: { source: true, target: true },
      component: 'BaseNode'
    },
    { 
      type: 'notification', 
      label: 'Notification Node', 
      description: 'Send alerts via email, Slack, webhooks', 
      icon: Mail,
      color: 'from-red-500 to-pink-600',
      handles: { source: false, target: true },
      component: 'BaseNode'
    },
    { 
      type: 'visualization', 
      label: 'Data Visualization', 
      description: 'Create charts and dashboards', 
      icon: BarChart3,
      color: 'from-pink-500 to-rose-600',
      handles: { source: false, target: true },
      component: 'BaseNode'
    },
    { 
      type: 'custom', 
      label: 'Custom Code', 
      description: 'Execute custom JavaScript/Python code', 
      icon: Code,
      color: 'from-gray-500 to-slate-600',
      handles: { source: true, target: true },
      component: 'CustomNode'
    }
  ],
  'Demo Nodes (Part 1)': [
    { 
      type: 'email', 
      label: 'Email Sender', 
      description: 'Configure and send emails via SMTP, SendGrid, or Mailgun', 
      icon: Mail,
      color: 'from-green-500 to-emerald-600',
      handles: { source: true, target: true },
      component: 'EmailNode'
    },
    { 
      type: 'imageProcessing', 
      label: 'Image Processor', 
      description: 'Resize, crop, filter and convert images', 
      icon: Image,
      color: 'from-pink-500 to-rose-600',
      handles: { source: true, target: true },
      component: 'ImageProcessingNode'
    },
    { 
      type: 'dataVisualization', 
      label: 'Data Visualization', 
      description: 'Generate bar, line, pie, scatter and heatmap charts', 
      icon: BarChart3,
      color: 'from-blue-500 to-indigo-600',
      handles: { source: false, target: true },
      component: 'DataVisualizationNode'
    },
    { 
      type: 'timer', 
      label: 'Timer & Scheduler', 
      description: 'Add delays, intervals, and scheduled execution', 
      icon: Timer,
      color: 'from-yellow-500 to-orange-600',
      handles: { source: true, target: true },
      component: 'TimerNode'
    },
    { 
      type: 'documentGenerator', 
      label: 'Document Generator', 
      description: 'Generate PDF and DOCX documents from templates', 
      icon: FileText,
      color: 'from-purple-500 to-violet-600',
      handles: { source: false, target: true },
      component: 'DocumentGeneratorNode'
    }
  ]
};

// Color palette for manual node creation
const colorPalette = [
  { name: 'Blue', value: 'from-blue-500 to-blue-600', preview: 'bg-blue-500' },
  { name: 'Green', value: 'from-green-500 to-green-600', preview: 'bg-green-500' },
  { name: 'Purple', value: 'from-purple-500 to-purple-600', preview: 'bg-purple-500' },
  { name: 'Red', value: 'from-red-500 to-red-600', preview: 'bg-red-500' },
  { name: 'Orange', value: 'from-orange-500 to-orange-600', preview: 'bg-orange-500' },
  { name: 'Pink', value: 'from-pink-500 to-pink-600', preview: 'bg-pink-500' },
  { name: 'Indigo', value: 'from-indigo-500 to-indigo-600', preview: 'bg-indigo-500' },
  { name: 'Teal', value: 'from-teal-500 to-teal-600', preview: 'bg-teal-500' },
  { name: 'Cyan', value: 'from-cyan-500 to-cyan-600', preview: 'bg-cyan-500' },
  { name: 'Gray', value: 'from-gray-500 to-gray-600', preview: 'bg-gray-500' },
  { name: 'Emerald', value: 'from-emerald-500 to-emerald-600', preview: 'bg-emerald-500' },
  { name: 'Violet', value: 'from-violet-500 to-violet-600', preview: 'bg-violet-500' }
];

const Toolbar = () => {
  const { addNode, nodes, edges, clearPipeline } = useStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(
    new Set(['Core Nodes', 'AI & Processing'])
  );
  const [showManualCreator, setShowManualCreator] = useState(false);
  const [showDeleteMode, setShowDeleteMode] = useState(false);

  // Manual node creation state
  const [manualNode, setManualNode] = useState({
    title: '',
    color: 'from-blue-500 to-blue-600',
    inputs: ['input'],
    outputs: ['output'],
    content: '',
    icon: 'Code',
    category: 'Custom'
  });

  // Input/Output management
  const [newInputLabel, setNewInputLabel] = useState('');
  const [newOutputLabel, setNewOutputLabel] = useState('');

  // Enhanced node positioning with collision detection
  const calculateNodePosition = useCallback(() => {
    const gridSize = 25;
    const nodeWidth = 200;
    const nodeHeight = 140;
    const margin = 50;
    
    let position = { x: 200, y: 200 };
    
    if (nodes.length > 0) {
      let attempts = 0;
      const maxAttempts = 100;
      
      while (attempts < maxAttempts) {
        const col = attempts % 5;
        const row = Math.floor(attempts / 5);
        
        position = {
          x: 200 + (col * (nodeWidth + margin)),
          y: 200 + (row * (nodeHeight + margin))
        };
        
        const currentX = position.x;
        const currentY = position.y;
        const hasCollision = nodes.some(existingNode => {
          const dx = Math.abs(existingNode.position.x - currentX);
          const dy = Math.abs(existingNode.position.y - currentY);
          return dx < (nodeWidth + 30) && dy < (nodeHeight + 30);
        });
        
        if (!hasCollision) break;
        attempts++;
      }
      
      // Add randomness if all positions are occupied
      if (attempts >= maxAttempts) {
        position.x += Math.random() * 300 - 150;
        position.y += Math.random() * 300 - 150;
      }
    }
    
    // Snap to grid
    position.x = Math.round(position.x / gridSize) * gridSize;
    position.y = Math.round(position.y / gridSize) * gridSize;
    
    return position;
  }, [nodes]);

  // Add node handler
  const handleAddNode = useCallback((nodeType) => {
    const position = calculateNodePosition();
    console.log(`Adding ${nodeType} node at position:`, position);
    addNode(nodeType, position);
  }, [addNode, calculateNodePosition]);

  // Create manual node
  const createManualNode = useCallback(() => {
    if (!manualNode.title.trim()) {
      alert('Please enter a node title');
      return;
    }

    const position = calculateNodePosition();
    const nodeId = `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create a BaseNode-based manual node
    const customNode = {
      id: nodeId,
      type: 'basenode', // Use BaseNode as foundation
      position: position,
      data: {
        // BaseNode properties
        label: manualNode.title,
        description: manualNode.content || `Custom ${manualNode.title} node`,
        
        // Manual node specific properties
        isManualNode: true,
        manualConfig: {
          title: manualNode.title,
          color: manualNode.color,
          inputs: manualNode.inputs.filter(input => input.trim()),
          outputs: manualNode.outputs.filter(output => output.trim()),
          content: manualNode.content,
          icon: manualNode.icon,
          category: manualNode.category,
          createdAt: new Date().toISOString()
        },
        
        // Visual customization
        customStyle: {
          background: manualNode.color,
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px'
        },
        
        // Handle configuration
        handles: {
          source: manualNode.outputs.length > 0,
          target: manualNode.inputs.length > 0
        }
      },
      draggable: true,
      selectable: true,
      deletable: true
    };

    try {
      // Add node using store
      const currentState = useStore.getState();
      useStore.setState({
        ...currentState,
        nodes: [...currentState.nodes, customNode],
        error: null
      });

      console.log('Manual node created successfully:', customNode);
      
      // Reset form
      setManualNode({
        title: '',
        color: 'from-blue-500 to-blue-600',
        inputs: ['input'],
        outputs: ['output'],
        content: '',
        icon: 'Code',
        category: 'Custom'
      });
      setShowManualCreator(false);
      
    } catch (error) {
      console.error('Error creating manual node:', error);
      alert('Failed to create node. Please try again.');
    }
  }, [manualNode, calculateNodePosition]);

  // Handle input/output management
  const addInput = () => {
    if (newInputLabel.trim() && !manualNode.inputs.includes(newInputLabel.trim())) {
      setManualNode(prev => ({
        ...prev,
        inputs: [...prev.inputs, newInputLabel.trim()]
      }));
      setNewInputLabel('');
    }
  };

  const addOutput = () => {
    if (newOutputLabel.trim() && !manualNode.outputs.includes(newOutputLabel.trim())) {
      setManualNode(prev => ({
        ...prev,
        outputs: [...prev.outputs, newOutputLabel.trim()]
      }));
      setNewOutputLabel('');
    }
  };

  const removeInput = (index) => {
    setManualNode(prev => ({
      ...prev,
      inputs: prev.inputs.filter((_, i) => i !== index)
    }));
  };

  const removeOutput = (index) => {
    setManualNode(prev => ({
      ...prev,
      outputs: prev.outputs.filter((_, i) => i !== index)
    }));
  };

  // Category management
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

  // Search functionality
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

  // Auto-expand search results
  React.useEffect(() => {
    if (searchTerm.trim()) {
      setExpandedCategories(new Set(Object.keys(filteredCategories)));
    }
  }, [searchTerm, filteredCategories]);

  const totalAvailableNodes = Object.values(filteredCategories)
    .reduce((sum, categoryNodes) => sum + categoryNodes.length, 0);

  // Delete functionality
  const handleDeleteAll = useCallback(() => {
    if (nodes.length === 0 && edges.length === 0) {
      alert('Pipeline is already empty!');
      return;
    }
    
    const confirmMessage = `⚠️ Delete Entire Pipeline?\n\nThis will permanently remove:\n• ${nodes.length} nodes\n• ${edges.length} connections\n\nThis action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      clearPipeline();
      setShowDeleteMode(false);
      console.log('Pipeline cleared successfully');
    }
  }, [nodes.length, edges.length, clearPipeline]);

  // Collapsed view
  if (isCollapsed) {
    return (
      <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-3">
        <div className="space-y-3">
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl flex items-center justify-center hover:scale-110 transition-all hover:shadow-lg relative overflow-hidden group"
            title="Open Node Palette"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform relative z-10" />
            {nodes.length > 0 && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                {nodes.length}
              </div>
            )}
          </button>
          
          <button
            onClick={() => setShowManualCreator(true)}
            className="w-16 h-12 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-lg flex items-center justify-center hover:scale-110 transition-all hover:shadow-lg"
            title="Create Manual Node"
          >
            <Wand2 className="w-5 h-5" />
          </button>
          
          {(nodes.length > 0 || edges.length > 0) && (
            <button
              onClick={handleDeleteAll}
              className="w-16 h-12 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg flex items-center justify-center hover:scale-110 transition-all hover:shadow-lg"
              title={`Delete Pipeline (${nodes.length} nodes, ${edges.length} edges)`}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Manual node creator modal
  if (showManualCreator) {
    return (
      <div className="w-[420px] max-h-[90vh] bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 bg-[radial-gradient(circle_at_30%_20%,_white_0%,_transparent_50%)]"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl">Create Custom Node</h3>
                <p className="text-white/80 text-sm">Build your own node using BaseNode</p>
              </div>
            </div>
            <button
              onClick={() => setShowManualCreator(false)}
              className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/20 transition-all"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Node Title *</label>
              <input
                type="text"
                value={manualNode.title}
                onChange={(e) => setManualNode(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Data Processor, Custom Filter..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                value={manualNode.content}
                onChange={(e) => setManualNode(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Describe what this node does..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              />
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Node Color</label>
            <div className="grid grid-cols-4 gap-3">
              {colorPalette.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setManualNode(prev => ({ ...prev, color: color.value }))}
                  className={`p-3 rounded-xl border-2 transition-all group ${
                    manualNode.color === color.value
                      ? 'border-purple-500 ring-2 ring-purple-200 scale-105'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-full h-8 rounded-lg ${color.preview} group-hover:shadow-md transition-shadow`}></div>
                  <span className="text-xs text-gray-600 mt-2 block font-medium">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Handles */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Input Handles</label>
            <div className="space-y-2">
              {manualNode.inputs.map((input, index) => (
                <div key={index} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border">
                  <CircleDot className="w-4 h-4 text-blue-500" />
                  <span className="flex-1 text-sm font-medium">{input}</span>
                  <button
                    onClick={() => removeInput(index)}
                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newInputLabel}
                  onChange={(e) => setNewInputLabel(e.target.value)}
                  placeholder="Input handle name"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onKeyPress={(e) => e.key === 'Enter' && addInput()}
                />
                <button
                  onClick={addInput}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Output Handles */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Output Handles</label>
            <div className="space-y-2">
              {manualNode.outputs.map((output, index) => (
                <div key={index} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border">
                  <Square className="w-4 h-4 text-green-500" />
                  <span className="flex-1 text-sm font-medium">{output}</span>
                  <button
                    onClick={() => removeOutput(index)}
                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newOutputLabel}
                  onChange={(e) => setNewOutputLabel(e.target.value)}
                  placeholder="Output handle name"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onKeyPress={(e) => e.key === 'Enter' && addOutput()}
                />
                <button
                  onClick={addOutput}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Preview</label>
            <div className={`p-4 bg-gradient-to-r ${manualNode.color} text-white rounded-xl border border-white/20`}>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Code className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold">{manualNode.title || 'Custom Node'}</div>
                  <div className="text-xs text-white/80">{manualNode.content || 'No description'}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <div className="flex space-x-1">
                  {manualNode.inputs.map((_, idx) => (
                    <CircleDot key={idx} className="w-3 h-3 text-white/60" />
                  ))}
                </div>
                <div className="flex space-x-1">
                  {manualNode.outputs.map((_, idx) => (
                    <Square key={idx} className="w-3 h-3 text-white/60" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-4">
            <button
              onClick={() => setShowManualCreator(false)}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={createManualNode}
              disabled={!manualNode.title.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>Create Node</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main expanded view
  return (
    <div className="w-[380px] max-h-[88vh] bg-white/98 backdrop-blur-2xl border-2 border-indigo-100/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
      {/* Enhanced Header */}
      <div className="bg-indigo-500 p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="flex items-center space-x-2.5 min-w-0 flex-1">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-white font-bold text-lg leading-tight">Node Palette</h3>
                <p className="text-white/90 text-[10px] font-medium mt-0.5">Professional toolkit</p>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 flex-shrink-0">
              <button
                onClick={() => setShowDeleteMode(!showDeleteMode)}
                className={`p-1.5 rounded-lg transition-all ${
                  showDeleteMode 
                    ? 'bg-red-500 text-white' 
                    : 'text-white/80 hover:text-white hover:bg-white/20'
                }`}
                title="Toggle delete mode"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsCollapsed(true)}
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/20 transition-all"
                title="Collapse palette"
              >
                <Minus className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] gap-2">
            <div className="text-white/90 font-medium truncate">
              {nodes.length} active • {edges.length} edges • {totalAvailableNodes} available
            </div>
            <div className="text-white/70 font-bold flex-shrink-0">v3.2</div>
          </div>
        </div>
      </div>

      {/* Delete Mode Panel */}
      {showDeleteMode && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-red-800 flex items-center">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Pipeline
              </h4>
              <p className="text-sm text-red-600">
                {nodes.length} nodes, {edges.length} connections will be removed
              </p>
            </div>
            <button
              onClick={handleDeleteAll}
              disabled={nodes.length === 0 && edges.length === 0}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete All</span>
            </button>
          </div>
        </div>
      )}

      {/* Create Manual Node Section */}
      <div className="p-4 border-b-2 border-gray-100 bg-gray-50">
        <button
          onClick={() => setShowManualCreator(true)}
          className="w-full p-3.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center space-x-2.5 font-bold shadow-md"
        >
          <Wand2 className="w-5 h-5" />
          <span className="text-sm">Create Custom Node</span>
          <div className="px-2 py-0.5 bg-white/25 rounded-full text-[10px] font-extrabold shadow-sm">
            NEW
          </div>
        </button>
        <p className="text-center text-[10px] text-gray-600 mt-2 font-medium">
          🎨 Build using BaseNode foundation
        </p>
      </div>

      {/* Enhanced Search */}
      <div className="p-4 border-b-2 border-gray-100 bg-white">
        <div className="relative mb-2.5">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-indigo-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border-2 border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-xs bg-white shadow-sm font-medium transition-all duration-300 hover:border-indigo-200"
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
        <div className="flex items-center justify-between text-[10px] text-gray-600">
          <span>
            {searchTerm ? (
              <span className="font-bold">Found {totalAvailableNodes}</span>
            ) : (
              <span className="font-medium">{totalAvailableNodes} nodes available</span>
            )}
          </span>
          <span className="text-gray-400 font-medium">Enhanced</span>
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
              className="px-6 py-3 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors font-medium"
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
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 group"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-base font-extrabold text-gray-800 group-hover:text-indigo-600 transition-colors">
                    {category}
                  </span>
                  <span className="text-[10px] text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full font-bold shadow-sm">
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
                <div className="pb-2">
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
                          className={`w-full p-3 bg-gradient-to-r ${node.color} text-white rounded-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex items-center space-x-3 group border-2 border-white/20 shadow-lg`}
                          title={`${node.label}: ${node.description}\n\nComponent: ${node.component}\nHandles: ${node.handles.source ? 'Output' : ''}${node.handles.source && node.handles.target ? ' + ' : ''}${node.handles.target ? 'Input' : ''}\n\nClick to add or drag for precise placement`}
                        >
                          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors shadow-sm flex-shrink-0">
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <div className="font-bold text-sm leading-tight">{node.label}</div>
                            <div className="text-xs text-white/90 line-clamp-1 leading-tight mt-0.5">
                              {node.description}
                            </div>
                            <div className="mt-1.5 flex items-center justify-between">
                              <div className="flex items-center space-x-1.5">
                                <div className="flex items-center space-x-0.5">
                                  {node.handles.target && (
                                    <div className="w-1.5 h-1.5 bg-white/60 rounded-full" title="Input handle" />
                                  )}
                                  {node.handles.source && (
                                    <div className="w-1.5 h-1.5 bg-white rounded-full" title="Output handle" />
                                  )}
                                </div>
                                <span className="text-[10px] text-white/70 font-semibold">
                                  {node.component}
                                </span>
                              </div>
                              <div className="text-[9px] text-white/60 font-medium bg-white/10 px-1.5 py-0.5 rounded-full">
                                {node.type.toUpperCase()}
                              </div>
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
      <div className="p-3.5 bg-gray-50 border-t-2 border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-pulse shadow-md shadow-indigo-300/30"></div>
              <span className="text-xs font-extrabold text-gray-700">{totalAvailableNodes} ready</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="text-[10px] text-gray-600 font-medium">
              📦 Pro toolkit
            </div>
          </div>
          <span className="text-[10px] text-indigo-500 font-bold px-2.5 py-1 bg-white rounded-full shadow-sm">v3.2</span>
        </div>
        
      </div>
    </div>
  );
};

export default Toolbar;
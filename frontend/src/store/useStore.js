import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges } from 'reactflow';

const useStore = create((set, get) => ({
  // State
  nodes: [],
  edges: [],
  isLoading: false,
  error: null,
  pipelineResult: null,

  // Node operations
  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
      error: null // Clear errors when nodes change
    }));
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
      error: null // Clear errors when edges change
    }));
  },

  addNode: (nodeType, position) => {
    const newNode = {
      id: `${nodeType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: nodeType,
      position: position || { x: 0, y: 0 },
      data: getDefaultNodeData(nodeType),
      draggable: true,
      selectable: true,
      deletable: true,
    };

    console.log('Adding node:', newNode);

    set((state) => ({
      nodes: [...state.nodes, newNode],
      error: null
    }));
  },

  updateNode: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map(node =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      )
    }));
  },

  deleteNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter(node => node.id !== nodeId),
      edges: state.edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId)
    }));
  },

  setEdges: (edgesOrFunction) => {
    if (typeof edgesOrFunction === 'function') {
      set((state) => ({
        edges: edgesOrFunction(state.edges),
        error: null
      }));
    } else {
      set({ 
        edges: Array.isArray(edgesOrFunction) ? edgesOrFunction : [],
        error: null
      });
    }
  },

  // Pipeline operations
  clearPipeline: () => {
    set({
      nodes: [],
      edges: [],
      error: null,
      pipelineResult: null,
      isLoading: false
    });
  },

  exportPipeline: () => {
    const state = get();
    return {
      nodes: state.nodes,
      edges: state.edges,
      timestamp: new Date().toISOString(),
      metadata: {
        nodeCount: state.nodes.length,
        edgeCount: state.edges.length,
        nodeTypes: [...new Set(state.nodes.map(n => n.type))],
        version: '2.1'
      }
    };
  },

  importPipeline: (pipelineData) => {
    try {
      if (pipelineData && pipelineData.nodes && Array.isArray(pipelineData.nodes)) {
        // Validate nodes
        const validNodes = pipelineData.nodes.filter(node => 
          node.id && node.type && node.position && node.data
        );

        // Validate edges
        const validEdges = Array.isArray(pipelineData.edges) ? 
          pipelineData.edges.filter(edge => 
            edge.id && edge.source && edge.target &&
            validNodes.some(n => n.id === edge.source) &&
            validNodes.some(n => n.id === edge.target)
          ) : [];

        set({
          nodes: validNodes,
          edges: validEdges,
          error: null,
          pipelineResult: null
        });
        return true;
      }
      throw new Error('Invalid pipeline data format');
    } catch (error) {
      set({ error: `Import failed: ${error.message}` });
      return false;
    }
  },

  // Analysis operations
  analyzePipeline: async () => {
    const state = get();
    
    if (state.nodes.length === 0) {
      set({ error: 'Cannot analyze empty pipeline' });
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500));

      // Perform pipeline analysis
      const analysis = performPipelineAnalysis(state.nodes, state.edges);
      
      set({ 
        pipelineResult: analysis,
        isLoading: false,
        error: null
      });
      
      return true;
    } catch (error) {
      set({ 
        error: `Analysis failed: ${error.message}`,
        isLoading: false 
      });
      return false;
    }
  },

  // State setters
  setLoading: (loading) => set({ isLoading: !!loading }),
  
  setError: (error) => {
    console.error('Store error:', error);
    set({ error: typeof error === 'string' ? error : 'An unexpected error occurred' });
  },
  
  setPipelineResult: (result) => set({ pipelineResult: result }),

  // Validation helpers
  validatePipeline: () => {
    const { nodes, edges } = get();
    const issues = [];

    if (nodes.length === 0) {
      issues.push('Pipeline is empty');
      return { valid: false, issues };
    }

    const hasInput = nodes.some(node => 
      ['input', 'api', 'database', 'cloud', 'stream'].includes(node.type)
    );
    const hasOutput = nodes.some(node => 
      ['output', 'visualization', 'notification'].includes(node.type)
    );

    if (!hasInput) issues.push('Missing input source');
    if (!hasOutput) issues.push('Missing output destination');

    // Check for isolated nodes
    const connectedNodes = new Set();
    edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });

    const isolatedNodes = nodes.filter(node => !connectedNodes.has(node.id));
    if (isolatedNodes.length > 0 && nodes.length > 1) {
      issues.push(`${isolatedNodes.length} isolated node(s)`);
    }

    // Check for cycles (simplified check)
    const hasCycle = detectCycle(nodes, edges);
    if (hasCycle) {
      issues.push('Pipeline contains cycles');
    }

    return {
      valid: issues.length === 0,
      issues,
      stats: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        hasInput,
        hasOutput,
        isolatedNodes: isolatedNodes.length
      }
    };
  }
}));

// Helper function for default node data based on expanded node types
function getDefaultNodeData(nodeType) {
  const defaults = {
    // Data Sources
    input: { 
      label: 'File Input',
      type: 'file',
      format: 'csv',
      description: 'Input data from files'
    },
    api: { 
      label: 'API Source',
      method: 'GET',
      url: 'https://api.example.com/data',
      description: 'Fetch data from REST API'
    },
    database: {
      label: 'Database',
      type: 'postgresql',
      query: 'SELECT * FROM table',
      description: 'Connect to database'
    },
    cloud: {
      label: 'Cloud Storage',
      provider: 'aws-s3',
      bucket: 'data-bucket',
      description: 'Access cloud storage'
    },
    stream: {
      label: 'Data Stream',
      protocol: 'kafka',
      topic: 'data-stream',
      description: 'Real-time data streaming'
    },

    // Processing
    process: {
      label: 'Data Processor',
      operation: 'transform',
      description: 'Transform and process data'
    },
    filter: { 
      label: 'Data Filter',
      condition: 'equals',
      field: 'status',
      value: 'active',
      description: 'Filter data by conditions'
    },
    transform: {
      label: 'Data Transform',
      operation: 'map',
      mapping: '{}',
      description: 'Transform data structure'
    },
    aggregate: {
      label: 'Aggregator',
      function: 'sum',
      groupBy: 'category',
      description: 'Aggregate and summarize data'
    },
    join: {
      label: 'Data Join',
      type: 'inner',
      on: 'id',
      description: 'Join multiple data sources'
    },

    // Analysis
    ml: {
      label: 'ML Model',
      model: 'linear_regression',
      features: [],
      description: 'Apply machine learning'
    },
    statistics: {
      label: 'Statistics',
      metrics: ['mean', 'median', 'std'],
      description: 'Statistical analysis'
    },

    // Outputs
    output: { 
      label: 'File Output',
      type: 'file',
      format: 'json',
      path: '/output/data',
      description: 'Save processed data'
    },
    visualization: {
      label: 'Visualization',
      chartType: 'bar',
      xAxis: 'category',
      yAxis: 'value',
      description: 'Create data visualizations'
    },
    notification: {
      label: 'Notification',
      type: 'email',
      recipients: 'admin@example.com',
      description: 'Send alerts and notifications'
    },

    // Media
    image: {
      label: 'Image Processor',
      operation: 'resize',
      format: 'jpg',
      description: 'Process image files'
    },
    video: {
      label: 'Video Processor',
      operation: 'encode',
      format: 'mp4',
      description: 'Process video files'
    },
    audio: {
      label: 'Audio Processor',
      operation: 'normalize',
      format: 'mp3',
      description: 'Process audio files'
    }
  };

  return defaults[nodeType] || { 
    label: `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Node`,
    description: 'Custom node',
    config: {}
  };
}

// Pipeline analysis function
function performPipelineAnalysis(nodes, edges) {
  const nodeTypes = {};
  nodes.forEach(node => {
    nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
  });

  // Check pipeline validity
  const hasInput = nodes.some(node => 
    ['input', 'api', 'database', 'cloud', 'stream'].includes(node.type)
  );
  const hasOutput = nodes.some(node => 
    ['output', 'visualization', 'notification'].includes(node.type)
  );
  const hasProcessing = nodes.some(node => 
    ['process', 'filter', 'transform', 'aggregate', 'join', 'ml', 'statistics'].includes(node.type)
  );

  // Calculate complexity
  const complexityScore = nodes.length * 0.5 + edges.length * 0.3;
  let complexity = 'Simple';
  if (complexityScore >= 12) complexity = 'Complex';
  else if (complexityScore >= 6) complexity = 'Moderate';

  // Detect issues
  const issues = [];
  if (!hasInput) issues.push('Missing input nodes');
  if (!hasOutput) issues.push('Missing output nodes');
  if (nodes.length > 1 && edges.length === 0) issues.push('No connections between nodes');

  // Generate recommendations
  const recommendations = [];
  if (!hasProcessing && nodes.length > 2) {
    recommendations.push('Add processing nodes for data transformation');
  }
  if (edges.length < nodes.length - 1 && nodes.length > 2) {
    recommendations.push('Consider adding more connections for better data flow');
  }
  if (hasInput && hasOutput && edges.length > 0) {
    recommendations.push('Pipeline structure looks good for execution');
  }

  return {
    timestamp: new Date().toISOString(),
    num_nodes: nodes.length,
    num_edges: edges.length,
    node_types: Object.keys(nodeTypes),
    node_distribution: nodeTypes,
    complexity,
    complexity_score: complexityScore.toFixed(1),
    is_dag: !detectCycle(nodes, edges),
    has_input: hasInput,
    has_output: hasOutput,
    has_processing: hasProcessing,
    execution_time_estimate: `${(complexityScore * 0.8).toFixed(1)}s`,
    memory_estimate: `${(nodes.length * 64 + edges.length * 32).toFixed(0)}MB`,
    issues,
    recommendations,
    message: issues.length === 0 ? 
      'Pipeline analysis complete - structure is valid' : 
      `Found ${issues.length} issue(s) that need attention`,
    score: Math.max(0, 100 - (issues.length * 20))
  };
}

// Simple cycle detection
function detectCycle(nodes, edges) {
  if (edges.length === 0) return false;

  const graph = {};
  nodes.forEach(node => {
    graph[node.id] = [];
  });

  edges.forEach(edge => {
    if (graph[edge.source]) {
      graph[edge.source].push(edge.target);
    }
  });

  const visited = new Set();
  const recursionStack = new Set();

  function hasCycleUtil(nodeId) {
    if (recursionStack.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;

    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = graph[nodeId] || [];
    for (const neighbor of neighbors) {
      if (hasCycleUtil(neighbor)) return true;
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const nodeId of Object.keys(graph)) {
    if (!visited.has(nodeId)) {
      if (hasCycleUtil(nodeId)) return true;
    }
  }

  return false;
}

export default useStore;
import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges } from 'reactflow';

const useStore = create((set, get) => ({
  // State
  nodes: [],
  edges: [],
  isLoading: false,
  error: null,
  pipelineResult: null,
  deletedHistory: [],

  onNodesChange: (changes) => {
    set((state) => {
      // Handle delete changes specially to store in history
      const deleteChanges = changes.filter(change => change.type === 'remove');
      
      // Store deleted nodes in history for undo
      if (deleteChanges.length > 0) {
        const deletedNodes = deleteChanges.map(change => 
          state.nodes.find(node => node.id === change.id)
        ).filter(Boolean);
        
        const connectedEdges = state.edges.filter(edge =>
          deleteChanges.some(change => 
            edge.source === change.id || edge.target === change.id
          )
        );

        const newHistory = [...state.deletedHistory, {
          type: 'reactflow_nodes',
          nodes: deletedNodes,
          edges: connectedEdges,
          timestamp: Date.now()
        }];

        return {
          nodes: applyNodeChanges(changes, state.nodes),
          edges: state.edges.filter(edge =>
            !deleteChanges.some(change => 
              edge.source === change.id || edge.target === change.id
            )
          ),
          deletedHistory: newHistory.slice(-10), // Keep last 10 deletions
          error: null
        };
      }

      return {
        nodes: applyNodeChanges(changes, state.nodes),
        error: null
      };
    });
  },

  onEdgesChange: (changes) => {
    set((state) => {
      // Handle delete changes specially
      const deleteChanges = changes.filter(change => change.type === 'remove');
      
      if (deleteChanges.length > 0) {
        const deletedEdges = deleteChanges.map(change =>
          state.edges.find(edge => edge.id === change.id)
        ).filter(Boolean);

        const newHistory = [...state.deletedHistory, {
          type: 'reactflow_edges',
          edges: deletedEdges,
          timestamp: Date.now()
        }];

        return {
          edges: applyEdgeChanges(changes, state.edges),
          deletedHistory: newHistory.slice(-10),
          error: null
        };
      }

      return {
        edges: applyEdgeChanges(changes, state.edges),
        error: null
      };
    });
  },

  // Enhanced addNode with proper deletable flags
  addNode: (nodeType, position) => {
    const newNode = {
      id: `${nodeType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: nodeType,
      position: position || { x: 0, y: 0 },
      data: getDefaultNodeData(nodeType),
      draggable: true,
      selectable: true,
      deletable: true, // Enable deletion
      focusable: true,
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

  // Back-compat alias used by most node components
  updateNodeData: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      ),
    }));
  },

  // Direct delete methods
  deleteNode: (nodeId) => {
    set((state) => {
      const nodeToDelete = state.nodes.find(n => n.id === nodeId);
      const connectedEdges = state.edges.filter(e => e.source === nodeId || e.target === nodeId);
      
      if (nodeToDelete) {
        const newHistory = [...state.deletedHistory, {
          type: 'manual_node',
          node: nodeToDelete,
          edges: connectedEdges,
          timestamp: Date.now()
        }];

        return {
          nodes: state.nodes.filter(node => node.id !== nodeId),
          edges: state.edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId),
          deletedHistory: newHistory.slice(-10)
        };
      }
      return state;
    });
  },

  deleteEdge: (edgeId) => {
    set((state) => {
      const edgeToDelete = state.edges.find(e => e.id === edgeId);
      
      if (edgeToDelete) {
        const newHistory = [...state.deletedHistory, {
          type: 'manual_edge',
          edge: edgeToDelete,
          timestamp: Date.now()
        }];

        return {
          edges: state.edges.filter(edge => edge.id !== edgeId),
          deletedHistory: newHistory.slice(-10)
        };
      }
      return state;
    });
  },

  // Delete selected items
  deleteSelected: () => {
    set((state) => {
      const selectedNodes = state.nodes.filter(n => n.selected);
      const selectedEdges = state.edges.filter(e => e.selected);
      const selectedNodeIds = selectedNodes.map(n => n.id);
      
      // Find edges connected to selected nodes
      const connectedEdges = state.edges.filter(e => 
        selectedNodeIds.includes(e.source) || selectedNodeIds.includes(e.target)
      );

      if (selectedNodes.length > 0 || selectedEdges.length > 0) {
        const newHistory = [...state.deletedHistory, {
          type: 'bulk_delete',
          nodes: selectedNodes,
          edges: [...selectedEdges, ...connectedEdges.filter(e => !selectedEdges.includes(e))],
          timestamp: Date.now()
        }];

        return {
          nodes: state.nodes.filter(n => !selectedNodeIds.includes(n.id)),
          edges: state.edges.filter(e => 
            !selectedEdges.some(se => se.id === e.id) &&
            !selectedNodeIds.includes(e.source) && 
            !selectedNodeIds.includes(e.target)
          ),
          deletedHistory: newHistory.slice(-10)
        };
      }
      return state;
    });
  },

  // Delete all
  deleteAll: () => {
    set((state) => {
      if (state.nodes.length > 0 || state.edges.length > 0) {
        const newHistory = [...state.deletedHistory, {
          type: 'delete_all',
          nodes: [...state.nodes],
          edges: [...state.edges],
          timestamp: Date.now()
        }];

        return {
          nodes: [],
          edges: [],
          deletedHistory: newHistory.slice(-10)
        };
      }
      return state;
    });
  },

  // Undo functionality
  undoDelete: () => {
    set((state) => {
      if (state.deletedHistory.length === 0) return state;

      const lastDeleted = state.deletedHistory[state.deletedHistory.length - 1];
      
      switch (lastDeleted.type) {
        case 'manual_node':
          return {
            nodes: [...state.nodes, lastDeleted.node],
            edges: [...state.edges, ...lastDeleted.edges],
            deletedHistory: state.deletedHistory.slice(0, -1)
          };
        case 'manual_edge':
          return {
            edges: [...state.edges, lastDeleted.edge],
            deletedHistory: state.deletedHistory.slice(0, -1)
          };
        case 'reactflow_nodes':
        case 'bulk_delete':
          return {
            nodes: [...state.nodes, ...lastDeleted.nodes],
            edges: [...state.edges, ...lastDeleted.edges],
            deletedHistory: state.deletedHistory.slice(0, -1)
          };
        case 'reactflow_edges':
          return {
            edges: [...state.edges, ...lastDeleted.edges],
            deletedHistory: state.deletedHistory.slice(0, -1)
          };
        case 'delete_all':
          return {
            nodes: lastDeleted.nodes,
            edges: lastDeleted.edges,
            deletedHistory: state.deletedHistory.slice(0, -1)
          };
        default:
          return state;
      }
    });
  },

  // Selection helpers
  selectAll: () => {
    set((state) => ({
      nodes: state.nodes.map(n => ({ ...n, selected: true })),
      edges: state.edges.map(e => ({ ...e, selected: true }))
    }));
  },

  clearSelection: () => {
    set((state) => ({
      nodes: state.nodes.map(n => ({ ...n, selected: false })),
      edges: state.edges.map(e => ({ ...e, selected: false }))
    }));
  },

  // Enhanced setEdges with proper edge properties
  setEdges: (edgesOrFunction) => {
    if (typeof edgesOrFunction === 'function') {
      set((state) => {
        const newEdges = edgesOrFunction(state.edges);
        // Ensure all edges have proper deletion properties
        const enhancedEdges = newEdges.map(edge => ({
          ...edge,
          deletable: true,
          selectable: true,
          focusable: true
        }));
        
        return {
          edges: enhancedEdges,
          error: null
        };
      });
    } else {
      const enhancedEdges = (Array.isArray(edgesOrFunction) ? edgesOrFunction : [])
        .map(edge => ({
          ...edge,
          deletable: true,
          selectable: true,
          focusable: true
        }));
        
      set({ 
        edges: enhancedEdges,
        error: null
      });
    }
  },

  // Pipeline operations
  clearPipeline: () => {
    set((state) => {
      const newHistory = [...state.deletedHistory, {
        type: 'clear_pipeline',
        nodes: [...state.nodes],
        edges: [...state.edges],
        timestamp: Date.now()
      }];

      return {
        nodes: [],
        edges: [],
        error: null,
        pipelineResult: null,
        isLoading: false,
        deletedHistory: newHistory.slice(-10)
      };
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
        version: '2.2'
      }
    };
  },

  importPipeline: (pipelineData) => {
    try {
      if (pipelineData && pipelineData.nodes && Array.isArray(pipelineData.nodes)) {
        // Validate and enhance nodes with deletion properties
        const validNodes = pipelineData.nodes.filter(node => 
          node.id && node.type && node.position && node.data
        ).map(node => ({
          ...node,
          draggable: true,
          selectable: true,
          deletable: true,
          focusable: true
        }));

        // Validate and enhance edges
        const validEdges = Array.isArray(pipelineData.edges) ? 
          pipelineData.edges.filter(edge => 
            edge.id && edge.source && edge.target &&
            validNodes.some(n => n.id === edge.source) &&
            validNodes.some(n => n.id === edge.target)
          ).map(edge => ({
            ...edge,
            deletable: true,
            selectable: true,
            focusable: true
          })) : [];

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
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500));
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

    const connectedNodes = new Set();
    edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });

    const isolatedNodes = nodes.filter(node => !connectedNodes.has(node.id));
    if (isolatedNodes.length > 0 && nodes.length > 1) {
      issues.push(`${isolatedNodes.length} isolated node(s)`);
    }

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
    webhook: {
      label: 'Webhook',
      method: 'POST',
      endpoint: '/webhook',
      description: 'Receive HTTP webhooks'
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
    sort: {
      label: 'Data Sort',
      field: 'timestamp',
      order: 'asc',
      description: 'Sort data by field'
    },
    validate: {
      label: 'Data Validator',
      schema: '{}',
      strict: true,
      description: 'Validate data schema'
    },

    // AI & ML
    llm: {
      label: 'LLM Node',
      model: 'gpt-4',
      prompt: 'Process this data',
      description: 'Large language model processing'
    },
    ml: {
      label: 'ML Model',
      model: 'linear_regression',
      features: [],
      description: 'Apply machine learning'
    },
    embedding: {
      label: 'Text Embeddings',
      model: 'text-embedding-ada-002',
      description: 'Generate text embeddings'
    },
    sentiment: {
      label: 'Sentiment Analysis',
      model: 'vader',
      description: 'Analyze sentiment'
    },
    classification: {
      label: 'Classifier',
      model: 'naive_bayes',
      classes: [],
      description: 'Classify data'
    },

    // Analytics
    statistics: {
      label: 'Statistics',
      metrics: ['mean', 'median', 'std'],
      description: 'Statistical analysis'
    },
    timeseries: {
      label: 'Time Series',
      method: 'arima',
      periods: 12,
      description: 'Time series analysis'
    },
    anomaly: {
      label: 'Anomaly Detection',
      method: 'isolation_forest',
      threshold: 0.1,
      description: 'Detect anomalies'
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
    dashboard: {
      label: 'Dashboard',
      layout: 'grid',
      refresh: 30,
      description: 'Real-time dashboard'
    },

    // Media Processing
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
    },
    ocr: {
      label: 'OCR Text Extract',
      language: 'eng',
      confidence: 0.8,
      description: 'Extract text from images'
    },

    // Utilities
    basenode: {
      label: 'Base Node',
      operation: 'custom',
      description: 'Generic configurable node'
    },
    conditional: {
      label: 'Conditional Logic',
      condition: 'if-then-else',
      description: 'Route data conditionally'
    },
    delay: {
      label: 'Delay/Throttle',
      delay: 1000,
      description: 'Add processing delays'
    },
    batch: {
      label: 'Batch Processor',
      batchSize: 100,
      description: 'Process data in batches'
    },
    router: {
      label: 'Data Router',
      routes: ['route1', 'route2'],
      description: 'Route data to multiple outputs'
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

  const hasInput = nodes.some(node => 
    ['input', 'api', 'database', 'cloud', 'stream'].includes(node.type)
  );
  const hasOutput = nodes.some(node => 
    ['output', 'visualization', 'notification'].includes(node.type)
  );
  const hasProcessing = nodes.some(node => 
    ['process', 'filter', 'transform', 'aggregate', 'join', 'ml', 'statistics'].includes(node.type)
  );

  const complexityScore = nodes.length * 0.5 + edges.length * 0.3;
  let complexity = 'Simple';
  if (complexityScore >= 12) complexity = 'Complex';
  else if (complexityScore >= 6) complexity = 'Moderate';

  const issues = [];
  if (!hasInput) issues.push('Missing input nodes');
  if (!hasOutput) issues.push('Missing output nodes');
  if (nodes.length > 1 && edges.length === 0) issues.push('No connections between nodes');

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
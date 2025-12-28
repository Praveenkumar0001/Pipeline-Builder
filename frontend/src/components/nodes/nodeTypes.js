import InputNode from './InputNode';
import OutputNode from './OutputNode';
import TextNode from './TextNode';
import LLMNode from './LLMNode';
import APINode from './APINode';
import { 
  FilterNode,
  TransformNode,
  MathNode,
  DocumentNode,
  DatabaseNode,
  JoinNode,
  AggregateNode,
  CustomNode
} from './CustomNodes';
import {
  EmailNode,
  ImageProcessingNode,
  DataVisualizationNode,
  TimerNode,
  DocumentGeneratorNode
} from './NewNodeTypes';
import BaseNodeNode from './BaseNodeNode';
import {
  CloudNode,
  StreamNode,
  StatisticsNode,
  ImageNode,
  NotificationNode,
  VisualizationNode,
  ProcessNode
} from './ExtraNodes';

// Node type registry for ReactFlow
export const nodeTypes = {
  basenode: BaseNodeNode,
  input: InputNode,
  output: OutputNode,
  text: TextNode,
  llm: LLMNode,
  api: APINode,
  process: ProcessNode,
  filter: FilterNode,
  transform: TransformNode,
  math: MathNode,
  document: DocumentNode,
  database: DatabaseNode,
  join: JoinNode,
  aggregate: AggregateNode,
  custom: CustomNode,
  cloud: CloudNode,
  stream: StreamNode,
  statistics: StatisticsNode,
  image: ImageNode,
  notification: NotificationNode,
  visualization: VisualizationNode,
  email: EmailNode,
  imageProcessing: ImageProcessingNode,
  dataVisualization: DataVisualizationNode,
  timer: TimerNode,
  documentGenerator: DocumentGeneratorNode,
};

// Enhanced node configurations for the toolbar
export const nodeConfigs = [
  // IO Nodes
  {
    type: 'input',
    label: 'Input',
    description: 'Data input source',
    category: 'IO',
    color: 'from-green-400 to-green-600',
    icon: '📥',
  },
  {
    type: 'output',
    label: 'Output',
    description: 'Data output destination',
    category: 'IO',
    color: 'from-orange-400 to-orange-600',
    icon: '📤',
  },
  
  // Processing Nodes
  {
    type: 'text',
    label: 'Text',
    description: 'Text processing and templates',
    category: 'Processing',
    color: 'from-purple-400 to-purple-600',
    icon: '📝',
  },
  {
    type: 'filter',
    label: 'Filter',
    description: 'Filter and condition data',
    category: 'Processing',
    color: 'from-yellow-400 to-yellow-600',
    icon: '🔍',
  },
  {
    type: 'transform',
    label: 'Transform',
    description: 'Transform and modify data',
    category: 'Processing',
    color: 'from-pink-400 to-pink-600',
    icon: '🔄',
  },
  {
    type: 'math',
    label: 'Math',
    description: 'Mathematical operations',
    category: 'Processing',
    color: 'from-red-400 to-red-600',
    icon: '🧮',
  },
  {
    type: 'join',
    label: 'Join',
    description: 'Join multiple data sources',
    category: 'Processing',
    color: 'from-cyan-400 to-cyan-600',
    icon: '🔗',
  },
  {
    type: 'aggregate',
    label: 'Aggregate',
    description: 'Aggregate and summarize data',
    category: 'Processing',
    color: 'from-emerald-400 to-emerald-600',
    icon: '📊',
  },

  // AI & ML Nodes
  {
    type: 'llm',
    label: 'LLM',
    description: 'Language model processing',
    category: 'AI & ML',
    color: 'from-blue-400 to-blue-600',
    icon: '🧠',
  },

  // Integration Nodes
  {
    type: 'api',
    label: 'API',
    description: 'External API calls',
    category: 'Integration',
    color: 'from-indigo-400 to-indigo-600',
    icon: '🌐',
  },
  {
    type: 'database',
    label: 'Database',
    description: 'Database operations',
    category: 'Integration',
    color: 'from-red-500 to-red-700',
    icon: '🗄️',
  },
  {
    type: 'email',
    label: 'Email',
    description: 'Send emails and notifications',
    category: 'Integration',
    color: 'from-green-400 to-green-600',
    icon: '📧',
  },

  // Media & Content
  {
    type: 'document',
    label: 'Document',
    description: 'Document processing',
    category: 'Media & Content',
    color: 'from-green-500 to-green-700',
    icon: '📄',
  },
  {
    type: 'imageProcessing',
    label: 'Image Processing',
    description: 'Process and transform images',
    category: 'Media & Content',
    color: 'from-pink-400 to-pink-600',
    icon: '🖼️',
  },
  {
    type: 'documentGenerator',
    label: 'Doc Generator',
    description: 'Generate formatted documents',
    category: 'Media & Content',
    color: 'from-indigo-400 to-indigo-600',
    icon: '📋',
  },

  // Visualization & Analytics
  {
    type: 'dataVisualization',
    label: 'Data Viz',
    description: 'Create charts and visualizations',
    category: 'Visualization',
    color: 'from-blue-400 to-blue-600',
    icon: '📈',
  },

  // Automation & Scheduling
  {
    type: 'timer',
    label: 'Timer',
    description: 'Delays and scheduling',
    category: 'Automation',
    color: 'from-yellow-400 to-yellow-600',
    icon: '⏰',
  },

  // Advanced
  {
    type: 'custom',
    label: 'Custom',
    description: 'Custom code execution',
    category: 'Advanced',
    color: 'from-gray-400 to-gray-600',
    icon: '⚙️',
  },
];

// Group nodes by category
export const nodeCategories = nodeConfigs.reduce((categories, node) => {
  if (!categories[node.category]) {
    categories[node.category] = [];
  }
  categories[node.category].push(node);
  return categories;
}, {});

// Helper function to get node config by type
export const getNodeConfig = (nodeType) => {
  return nodeConfigs.find(config => config.type === nodeType);
};

// Helper function to get default node data
export const getDefaultNodeData = (nodeType) => {
  const config = getNodeConfig(nodeType);
  return {
    label: config?.label || nodeType,
    type: nodeType,
    ...getNodeTypeDefaults(nodeType)
  };
};

// Node-specific default configurations
function getNodeTypeDefaults(nodeType) {
  const defaults = {
    input: {
      inputs: [],
      outputs: ['output'],
      inputType: 'file',
      inputName: 'input_data',
      description: '',
    },
    output: {
      inputs: ['input'],
      outputs: [],
      outputType: 'file',
      outputName: 'output_data',
      format: 'json',
      description: '',
    },
    text: {
      inputs: [],
      outputs: ['output'],
      text: 'Enter your text here...',
      variables: [],
    },
    llm: {
      inputs: ['prompt', 'context'],
      outputs: ['output'],
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 150,
      systemPrompt: '',
    },
    api: {
      inputs: ['data'],
      outputs: ['response'],
      method: 'GET',
      url: '',
      headers: '',
      body: '',
      authentication: 'none',
      apiKey: '',
    },
    filter: {
      inputs: ['input'],
      outputs: ['output'],
      condition: '',
      operator: 'equals',
      value: '',
    },
    transform: {
      inputs: ['input'],
      outputs: ['output'],
      operation: 'map',
      expression: '',
    },
    math: {
      inputs: ['a', 'b'],
      outputs: ['result'],
      operation: 'add',
      operandB: 0,
    },
    document: {
      inputs: ['file', 'config'],
      outputs: ['content', 'metadata'],
      docType: 'pdf',
      extractType: 'text',
    },
    database: {
      inputs: ['connection', 'params'],
      outputs: ['result', 'count'],
      dbType: 'postgresql',
      query: 'SELECT * FROM table;',
    },
    join: {
      inputs: ['input1', 'input2'],
      outputs: ['output'],
      joinType: 'inner',
      leftKey: '',
      rightKey: '',
    },
    aggregate: {
      inputs: ['input'],
      outputs: ['output'],
      groupBy: '',
      aggregateFunction: 'sum',
      field: '',
    },
    custom: {
      inputs: ['input'],
      outputs: ['output'],
      code: '',
      language: 'javascript',
    },
    email: {
      inputs: ['content', 'recipients', 'attachments'],
      outputs: ['status', 'tracking'],
      to: '',
      subject: '',
      template: 'default',
      provider: 'smtp',
    },
    imageProcessing: {
      inputs: ['image', 'parameters'],
      outputs: ['processed', 'metadata'],
      operation: 'resize',
      width: 800,
      height: 600,
      quality: 80,
      format: 'jpeg',
    },
    dataVisualization: {
      inputs: ['data', 'config'],
      outputs: ['chart', 'interactive'],
      type: 'bar',
      xAxis: '',
      yAxis: '',
      title: 'Chart Title',
      theme: 'default',
    },
    timer: {
      inputs: ['trigger', 'config'],
      outputs: ['output', 'status'],
      type: 'delay',
      duration: 5,
      unit: 'seconds',
      schedule: '',
      timezone: 'UTC',
    },
    documentGenerator: {
      inputs: ['content', 'template', 'metadata'],
      outputs: ['document', 'preview'],
      format: 'pdf',
      template: 'standard',
      orientation: 'portrait',
      fontSize: 12,
      includeHeader: true,
    },
  };

  return defaults[nodeType] || { inputs: ['input'], outputs: ['output'] };
}

export default nodeTypes;
// frontend/src/components/nodes/NewNodeTypes.jsx
import React, { useState } from 'react';
import { 
  Mail, 
  Image, 
  BarChart3, 
  Clock, 
  FileText,
  Send,
  Upload,
  TrendingUp,
  Timer,
  FileCheck
} from 'lucide-react';
import BaseNode from './BaseNode';
import useStore from '../../store/useStore';

// 1. Email Node
export const EmailNode = ({ id, data, selected }) => {
  const [emailConfig, setEmailConfig] = useState({
    to: data?.to || '',
    subject: data?.subject || '',
    template: data?.template || 'default',
    provider: data?.provider || 'smtp'
  });
  
  const updateNodeData = useStore(state => state.updateNodeData);

  const handleConfigChange = (field, value) => {
    const newConfig = { ...emailConfig, [field]: value };
    setEmailConfig(newConfig);
    updateNodeData(id, newConfig);
  };

  const inputs = [
    { id: 'content', label: 'Email Content' },
    { id: 'recipients', label: 'Recipients' },
    { id: 'attachments', label: 'Attachments' }
  ];

  const outputs = [
    { id: 'status', label: 'Send Status' },
    { id: 'tracking', label: 'Tracking Info' }
  ];

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      title="Email Sender"
      icon={Mail}
      headerColor="bg-green-50"
      headerTextColor="text-green-800"
      borderColor="border-green-200"
      inputs={inputs}
      outputs={outputs}
      collapsible={true}
    >
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Email Provider
          </label>
          <select
            value={emailConfig.provider}
            onChange={(e) => handleConfigChange('provider', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="smtp">SMTP</option>
            <option value="sendgrid">SendGrid</option>
            <option value="mailgun">Mailgun</option>
            <option value="ses">Amazon SES</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Subject Template
          </label>
          <input
            type="text"
            value={emailConfig.subject}
            onChange={(e) => handleConfigChange('subject', e.target.value)}
            placeholder="Email subject..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-xs text-green-700">
            <Send className="w-3 h-3" />
            <span>Provider: {emailConfig.provider.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </BaseNode>
  );
};

// 2. Image Processing Node
export const ImageProcessingNode = ({ id, data, selected }) => {
  const [imageConfig, setImageConfig] = useState({
    operation: data?.operation || 'resize',
    width: data?.width || 800,
    height: data?.height || 600,
    quality: data?.quality || 80,
    format: data?.format || 'jpeg'
  });

  const updateNodeData = useStore(state => state.updateNodeData);

  const handleConfigChange = (field, value) => {
    const newConfig = { ...imageConfig, [field]: value };
    setImageConfig(newConfig);
    updateNodeData(id, newConfig);
  };

  const inputs = [
    { id: 'image', label: 'Input Image' },
    { id: 'parameters', label: 'Parameters' }
  ];

  const outputs = [
    { id: 'processed', label: 'Processed Image' },
    { id: 'metadata', label: 'Image Info' }
  ];

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      title="Image Processor"
      icon={Image}
      headerColor="bg-pink-50"
      headerTextColor="text-pink-800"
      borderColor="border-pink-200"
      inputs={inputs}
      outputs={outputs}
      collapsible={true}
    >
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Operation
          </label>
          <select
            value={imageConfig.operation}
            onChange={(e) => handleConfigChange('operation', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="resize">Resize</option>
            <option value="crop">Crop</option>
            <option value="compress">Compress</option>
            <option value="filter">Apply Filter</option>
            <option value="convert">Convert Format</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Width
            </label>
            <input
              type="number"
              value={imageConfig.width}
              onChange={(e) => handleConfigChange('width', parseInt(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Height
            </label>
            <input
              type="number"
              value={imageConfig.height}
              onChange={(e) => handleConfigChange('height', parseInt(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        <div className="bg-pink-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-xs text-pink-700">
            <Upload className="w-3 h-3" />
            <span>{imageConfig.width}x{imageConfig.height} {imageConfig.operation}</span>
          </div>
        </div>
      </div>
    </BaseNode>
  );
};

// 3. Data Visualization Node
export const DataVisualizationNode = ({ id, data, selected }) => {
  const [chartConfig, setChartConfig] = useState({
    type: data?.type || 'bar',
    xAxis: data?.xAxis || '',
    yAxis: data?.yAxis || '',
    title: data?.title || 'Chart Title',
    theme: data?.theme || 'default'
  });

  const updateNodeData = useStore(state => state.updateNodeData);

  const handleConfigChange = (field, value) => {
    const newConfig = { ...chartConfig, [field]: value };
    setChartConfig(newConfig);
    updateNodeData(id, newConfig);
  };

  const inputs = [
    { id: 'data', label: 'Dataset' },
    { id: 'config', label: 'Chart Config' }
  ];

  const outputs = [
    { id: 'chart', label: 'Chart Image' },
    { id: 'interactive', label: 'Interactive Chart' }
  ];

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      title="Data Visualizer"
      icon={BarChart3}
      headerColor="bg-blue-50"
      headerTextColor="text-blue-800"
      borderColor="border-blue-200"
      inputs={inputs}
      outputs={outputs}
      collapsible={true}
    >
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Chart Type
          </label>
          <select
            value={chartConfig.type}
            onChange={(e) => handleConfigChange('type', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="scatter">Scatter Plot</option>
            <option value="heatmap">Heatmap</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Chart Title
          </label>
          <input
            type="text"
            value={chartConfig.title}
            onChange={(e) => handleConfigChange('title', e.target.value)}
            placeholder="Enter chart title..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              X-Axis
            </label>
            <input
              type="text"
              value={chartConfig.xAxis}
              onChange={(e) => handleConfigChange('xAxis', e.target.value)}
              placeholder="X field"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Y-Axis
            </label>
            <input
              type="text"
              value={chartConfig.yAxis}
              onChange={(e) => handleConfigChange('yAxis', e.target.value)}
              placeholder="Y field"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-xs text-blue-700">
            <TrendingUp className="w-3 h-3" />
            <span>{chartConfig.type} chart</span>
          </div>
        </div>
      </div>
    </BaseNode>
  );
};

// 4. Timer/Scheduler Node
export const TimerNode = ({ id, data, selected }) => {
  const [timerConfig, setTimerConfig] = useState({
    type: data?.type || 'delay',
    duration: data?.duration || 5,
    unit: data?.unit || 'seconds',
    schedule: data?.schedule || '',
    timezone: data?.timezone || 'UTC'
  });

  const updateNodeData = useStore(state => state.updateNodeData);

  const handleConfigChange = (field, value) => {
    const newConfig = { ...timerConfig, [field]: value };
    setTimerConfig(newConfig);
    updateNodeData(id, newConfig);
  };

  const inputs = [
    { id: 'trigger', label: 'Trigger Signal' },
    { id: 'config', label: 'Timer Config' }
  ];

  const outputs = [
    { id: 'output', label: 'Delayed Output' },
    { id: 'status', label: 'Timer Status' }
  ];

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      title="Timer & Scheduler"
      icon={Clock}
      headerColor="bg-yellow-50"
      headerTextColor="text-yellow-800"
      borderColor="border-yellow-200"
      inputs={inputs}
      outputs={outputs}
      collapsible={true}
    >
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Timer Type
          </label>
          <select
            value={timerConfig.type}
            onChange={(e) => handleConfigChange('type', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="delay">Delay</option>
            <option value="interval">Interval</option>
            <option value="schedule">Schedule</option>
            <option value="timeout">Timeout</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Duration
            </label>
            <input
              type="number"
              value={timerConfig.duration}
              onChange={(e) => handleConfigChange('duration', parseInt(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Unit
            </label>
            <select
              value={timerConfig.unit}
              onChange={(e) => handleConfigChange('unit', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="seconds">Seconds</option>
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
            </select>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-xs text-yellow-700">
            <Timer className="w-3 h-3" />
            <span>{timerConfig.duration} {timerConfig.unit} {timerConfig.type}</span>
          </div>
        </div>
      </div>
    </BaseNode>
  );
};

// 5. Document Generator Node
export const DocumentGeneratorNode = ({ id, data, selected }) => {
  const [docConfig, setDocConfig] = useState({
    format: data?.format || 'pdf',
    template: data?.template || 'standard',
    orientation: data?.orientation || 'portrait',
    fontSize: data?.fontSize || 12,
    includeHeader: data?.includeHeader || true
  });

  const updateNodeData = useStore(state => state.updateNodeData);

  const handleConfigChange = (field, value) => {
    const newConfig = { ...docConfig, [field]: value };
    setDocConfig(newConfig);
    updateNodeData(id, newConfig);
  };

  const inputs = [
    { id: 'content', label: 'Document Content' },
    { id: 'template', label: 'Template Data' },
    { id: 'metadata', label: 'Document Metadata' }
  ];

  const outputs = [
    { id: 'document', label: 'Generated Document' },
    { id: 'preview', label: 'Document Preview' }
  ];

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      title="Document Generator"
      icon={FileText}
      headerColor="bg-indigo-50"
      headerTextColor="text-indigo-800"
      borderColor="border-indigo-200"
      inputs={inputs}
      outputs={outputs}
      collapsible={true}
    >
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Output Format
          </label>
          <select
            value={docConfig.format}
            onChange={(e) => handleConfigChange('format', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="pdf">PDF</option>
            <option value="docx">Word Document</option>
            <option value="html">HTML</option>
            <option value="markdown">Markdown</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Template
          </label>
          <select
            value={docConfig.template}
            onChange={(e) => handleConfigChange('template', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="standard">Standard</option>
            <option value="report">Report</option>
            <option value="invoice">Invoice</option>
            <option value="letter">Letter</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={`header-${id}`}
            checked={docConfig.includeHeader}
            onChange={(e) => handleConfigChange('includeHeader', e.target.checked)}
            className="rounded text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor={`header-${id}`} className="text-xs text-gray-700">
            Include Header & Footer
          </label>
        </div>

        <div className="bg-indigo-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-xs text-indigo-700">
            <FileCheck className="w-3 h-3" />
            <span>{docConfig.format.toUpperCase()} {docConfig.template}</span>
          </div>
        </div>
      </div>
    </BaseNode>
  );
};

// Export all node components
EmailNode.displayName = 'EmailNode';
ImageProcessingNode.displayName = 'ImageProcessingNode';
DataVisualizationNode.displayName = 'DataVisualizationNode';
TimerNode.displayName = 'TimerNode';
DocumentGeneratorNode.displayName = 'DocumentGeneratorNode';
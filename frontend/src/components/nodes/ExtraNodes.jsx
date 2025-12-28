import React, { memo, useState } from 'react';
import { Cloud, Radio, BarChart3, Image as ImageIcon, Bell, Cpu } from 'lucide-react';
import BaseNode from './BaseNode';
import useStore from '../../store/useStore';

export const CloudNode = memo(({ id, data, selected }) => {
  const updateNodeData = useStore((s) => s.updateNodeData);
  const [provider, setProvider] = useState(data?.provider || 'aws-s3');
  const [bucket, setBucket] = useState(data?.bucket || '');

  const onProvider = (value) => {
    setProvider(value);
    updateNodeData(id, { provider: value });
  };

  const onBucket = (value) => {
    setBucket(value);
    updateNodeData(id, { bucket: value });
  };

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      title="Cloud Storage"
      icon={Cloud}
      headerColor="bg-sky-50"
      headerTextColor="text-sky-800"
      borderColor="border-sky-200"
      inputs={[{ id: 'input', label: 'Data In' }]}
      outputs={[{ id: 'output', label: 'Data Out' }]}
      collapsible={true}
      minWidth={280}
    >
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Provider</label>
          <select
            value={provider}
            onChange={(e) => onProvider(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="aws-s3">AWS S3</option>
            <option value="gcs">Google Cloud Storage</option>
            <option value="azure-blob">Azure Blob</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Bucket / Container</label>
          <input
            value={bucket}
            onChange={(e) => onBucket(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="my-bucket"
          />
        </div>
      </div>
    </BaseNode>
  );
});
CloudNode.displayName = 'CloudNode';

export const StreamNode = memo(({ id, data, selected }) => {
  const updateNodeData = useStore((s) => s.updateNodeData);
  const [protocol, setProtocol] = useState(data?.protocol || 'kafka');
  const [topic, setTopic] = useState(data?.topic || '');

  const onProtocol = (value) => {
    setProtocol(value);
    updateNodeData(id, { protocol: value });
  };

  const onTopic = (value) => {
    setTopic(value);
    updateNodeData(id, { topic: value });
  };

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      title="Data Stream"
      icon={Radio}
      headerColor="bg-emerald-50"
      headerTextColor="text-emerald-800"
      borderColor="border-emerald-200"
      inputs={[{ id: 'input', label: 'Stream In' }]}
      outputs={[{ id: 'output', label: 'Stream Out' }]}
      collapsible={true}
      minWidth={280}
    >
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Protocol</label>
          <select
            value={protocol}
            onChange={(e) => onProtocol(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="kafka">Kafka</option>
            <option value="kinesis">Kinesis</option>
            <option value="pubsub">Pub/Sub</option>
            <option value="websocket">WebSocket</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Topic / Channel</label>
          <input
            value={topic}
            onChange={(e) => onTopic(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="events.topic"
          />
        </div>
      </div>
    </BaseNode>
  );
});
StreamNode.displayName = 'StreamNode';

export const StatisticsNode = memo(({ id, data, selected }) => {
  const updateNodeData = useStore((s) => s.updateNodeData);
  const [metrics, setMetrics] = useState(Array.isArray(data?.metrics) ? data.metrics : ['mean', 'median']);

  const toggle = (metric) => {
    const next = metrics.includes(metric) ? metrics.filter((m) => m !== metric) : [...metrics, metric];
    setMetrics(next);
    updateNodeData(id, { metrics: next });
  };

  const options = ['mean', 'median', 'std', 'min', 'max', 'count'];

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      title="Statistics"
      icon={BarChart3}
      headerColor="bg-violet-50"
      headerTextColor="text-violet-800"
      borderColor="border-violet-200"
      inputs={[{ id: 'data', label: 'Dataset' }]}
      outputs={[{ id: 'stats', label: 'Stats' }]}
      collapsible={true}
      minWidth={300}
    >
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-700">Metrics</div>
        <div className="grid grid-cols-2 gap-2">
          {options.map((m) => (
            <label key={m} className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                className="rounded"
                checked={metrics.includes(m)}
                onChange={() => toggle(m)}
              />
              <span className="text-xs">{m}</span>
            </label>
          ))}
        </div>
      </div>
    </BaseNode>
  );
});
StatisticsNode.displayName = 'StatisticsNode';

export const ImageNode = memo(({ id, data, selected }) => {
  const updateNodeData = useStore((s) => s.updateNodeData);
  const [url, setUrl] = useState(data?.url || '');

  const onUrl = (value) => {
    setUrl(value);
    updateNodeData(id, { url: value });
  };

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      title="Image"
      icon={ImageIcon}
      headerColor="bg-pink-50"
      headerTextColor="text-pink-800"
      borderColor="border-pink-200"
      inputs={[{ id: 'image', label: 'Image In' }]}
      outputs={[{ id: 'image', label: 'Image Out' }]}
      collapsible={true}
      minWidth={300}
    >
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-700 mb-1">Image URL</label>
        <input
          value={url}
          onChange={(e) => onUrl(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="https://..."
        />
        {url ? (
          <div className="rounded-lg overflow-hidden border border-pink-200">
            <img alt="preview" src={url} className="w-full h-28 object-cover" />
          </div>
        ) : null}
      </div>
    </BaseNode>
  );
});
ImageNode.displayName = 'ImageNode';

export const NotificationNode = memo(({ id, data, selected }) => {
  const updateNodeData = useStore((s) => s.updateNodeData);
  const [channel, setChannel] = useState(data?.channel || 'email');
  const [message, setMessage] = useState(data?.message || '');

  const onChannel = (value) => {
    setChannel(value);
    updateNodeData(id, { channel: value });
  };

  const onMessage = (value) => {
    setMessage(value);
    updateNodeData(id, { message: value });
  };

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      title="Notification"
      icon={Bell}
      headerColor="bg-amber-50"
      headerTextColor="text-amber-800"
      borderColor="border-amber-200"
      inputs={[{ id: 'input', label: 'Signal' }]}
      outputs={[{ id: 'status', label: 'Status' }]}
      collapsible={true}
      minWidth={320}
    >
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Channel</label>
          <select
            value={channel}
            onChange={(e) => onChannel(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="email">Email</option>
            <option value="slack">Slack</option>
            <option value="webhook">Webhook</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Message</label>
          <textarea
            value={message}
            onChange={(e) => onMessage(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none h-20"
            placeholder="Notification message..."
          />
        </div>
      </div>
    </BaseNode>
  );
});
NotificationNode.displayName = 'NotificationNode';

export const VisualizationNode = memo(({ id, data, selected }) => {
  const updateNodeData = useStore((s) => s.updateNodeData);
  const [type, setType] = useState(data?.chartType || 'bar');
  const [title, setTitle] = useState(data?.title || '');

  const onType = (value) => {
    setType(value);
    updateNodeData(id, { chartType: value });
  };

  const onTitle = (value) => {
    setTitle(value);
    updateNodeData(id, { title: value });
  };

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      title="Visualization"
      icon={BarChart3}
      headerColor="bg-blue-50"
      headerTextColor="text-blue-800"
      borderColor="border-blue-200"
      inputs={[{ id: 'data', label: 'Dataset' }]}
      outputs={[{ id: 'chart', label: 'Chart' }]}
      collapsible={true}
      minWidth={320}
    >
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Chart Type</label>
          <select
            value={type}
            onChange={(e) => onType(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="bar">Bar</option>
            <option value="line">Line</option>
            <option value="pie">Pie</option>
            <option value="scatter">Scatter</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => onTitle(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Chart title"
          />
        </div>
      </div>
    </BaseNode>
  );
});
VisualizationNode.displayName = 'VisualizationNode';

export const ProcessNode = memo(({ id, data, selected }) => {
  const updateNodeData = useStore((s) => s.updateNodeData);
  const [operation, setOperation] = useState(data?.operation || 'transform');

  const onOperation = (value) => {
    setOperation(value);
    updateNodeData(id, { operation: value });
  };

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      title="Processor"
      icon={Cpu}
      headerColor="bg-fuchsia-50"
      headerTextColor="text-fuchsia-800"
      borderColor="border-fuchsia-200"
      inputs={[{ id: 'input', label: 'Input' }]}
      outputs={[{ id: 'output', label: 'Output' }]}
      collapsible={true}
      minWidth={300}
    >
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Operation</label>
          <select
            value={operation}
            onChange={(e) => onOperation(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
          >
            <option value="transform">Transform</option>
            <option value="clean">Clean</option>
            <option value="enrich">Enrich</option>
          </select>
        </div>
      </div>
    </BaseNode>
  );
});
ProcessNode.displayName = 'ProcessNode';

import React, { useState } from 'react';
import { Download, Save, Share2, FileText } from 'lucide-react';
import BaseNode from './BaseNode';
import useStore from '../../store/useStore';

const OutputNode = ({ id, data, selected }) => {
  const [outputType, setOutputType] = useState(data?.outputType || 'file');
  const [outputName, setOutputName] = useState(data?.outputName || 'output_data');
  const [format, setFormat] = useState(data?.format || 'json');
  const [description, setDescription] = useState(data?.description || '');
  const [destination, setDestination] = useState(data?.destination || '');
  const updateNodeData = useStore(state => state.updateNodeData);

  const handleOutputTypeChange = (type) => {
    setOutputType(type);
    updateNodeData(id, { outputType: type });
  };

  const handleOutputNameChange = (e) => {
    const name = e.target.value;
    setOutputName(name);
    updateNodeData(id, { outputName: name });
  };

  const handleFormatChange = (e) => {
    const fmt = e.target.value;
    setFormat(fmt);
    updateNodeData(id, { format: fmt });
  };

  const handleDescriptionChange = (e) => {
    const desc = e.target.value;
    setDescription(desc);
    updateNodeData(id, { description: desc });
  };

  const handleDestinationChange = (e) => {
    const dest = e.target.value;
    setDestination(dest);
    updateNodeData(id, { destination: dest });
  };

  const getIcon = () => {
    switch (outputType) {
      case 'file':
        return Download;
      case 'database':
        return Save;
      case 'api':
        return Share2;
      case 'report':
        return FileText;
      default:
        return Download;
    }
  };

  const outputTypes = [
    { value: 'file', label: 'File Export', icon: Download },
    { value: 'database', label: 'Database', icon: Save },
    { value: 'api', label: 'API Output', icon: Share2 },
    { value: 'report', label: 'Report', icon: FileText },
  ];

  const formats = [
    { value: 'json', label: 'JSON' },
    { value: 'csv', label: 'CSV' },
    { value: 'xlsx', label: 'Excel' },
    { value: 'pdf', label: 'PDF' },
    { value: 'html', label: 'HTML' },
    { value: 'xml', label: 'XML' },
  ];

  const inputs = [
    { id: 'input', label: 'Data Input' },
    { id: 'metadata', label: 'Output Metadata' }
  ];

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      title="Data Output"
      icon={getIcon()}
      headerColor="bg-orange-50"
      headerTextColor="text-orange-800"
      borderColor="border-orange-200"
      inputs={inputs}
      outputs={[]}
      collapsible={true}
    >
      <div className="space-y-4">
        {/* Output Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Output Destination Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {outputTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => handleOutputTypeChange(type.value)}
                  className={`
                    flex flex-col items-center p-3 rounded-lg text-xs transition-all duration-200
                    ${outputType === type.value
                      ? 'bg-orange-100 text-orange-700 border-2 border-orange-300 transform scale-105'
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }
                  `}
                >
                  <IconComponent className="w-5 h-5 mb-1" />
                  <span className="text-center font-medium leading-tight">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Output Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Output Name
          </label>
          <input
            type="text"
            value={outputName}
            onChange={handleOutputNameChange}
            placeholder="Enter output name..."
            className="form-input"
          />
        </div>

        {/* Format Selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Output Format
          </label>
          <select
            value={format}
            onChange={handleFormatChange}
            className="form-select"
          >
            {formats.map((fmt) => (
              <option key={fmt.value} value={fmt.value}>
                {fmt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Destination Path/URL */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Destination {outputType === 'api' ? 'URL' : 'Path'}
          </label>
          <input
            type="text"
            value={destination}
            onChange={handleDestinationChange}
            placeholder={outputType === 'api' ? 'https://api.example.com/webhook' : './outputs/data.json'}
            className="form-input"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Describe this output destination..."
            className="form-textarea"
            rows={2}
          />
        </div>

        {/* Configuration Preview */}
        <div className="pt-3 border-t border-gray-100">
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Download className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-semibold text-orange-800">Output Configuration</span>
            </div>
            <div className="text-xs text-orange-700 space-y-1">
              <div className="flex items-center justify-between">
                <span>Type:</span>
                <span className="font-medium capitalize">{outputType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Format:</span>
                <span className="font-medium uppercase">{format}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Name:</span>
                <span className="font-medium">{outputName || 'Unnamed'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseNode>
  );
};

export default OutputNode;
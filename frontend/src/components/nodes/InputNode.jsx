import React, { useState } from 'react';
import { Upload, File, Database, Link } from 'lucide-react';
import BaseNode from './BaseNode';
import useStore from '../../store/useStore';

const InputNode = ({ id, data, selected }) => {
  const [inputType, setInputType] = useState(data?.inputType || 'file');
  const [inputName, setInputName] = useState(data?.inputName || 'input_data');
  const [description, setDescription] = useState(data?.description || '');
  const [fileFormat, setFileFormat] = useState(data?.fileFormat || 'json');
  const updateNodeData = useStore(state => state.updateNodeData);

  const handleInputTypeChange = (type) => {
    setInputType(type);
    updateNodeData(id, { inputType: type });
  };

  const handleInputNameChange = (e) => {
    const name = e.target.value;
    setInputName(name);
    updateNodeData(id, { inputName: name });
  };

  const handleDescriptionChange = (e) => {
    const desc = e.target.value;
    setDescription(desc);
    updateNodeData(id, { description: desc });
  };

  const handleFileFormatChange = (e) => {
    const format = e.target.value;
    setFileFormat(format);
    updateNodeData(id, { fileFormat: format });
  };

  const getIcon = () => {
    switch (inputType) {
      case 'file':
        return File;
      case 'database':
        return Database;
      case 'api':
        return Link;
      default:
        return Upload;
    }
  };

  const inputTypes = [
    { value: 'file', label: 'File Upload', icon: File },
    { value: 'database', label: 'Database Query', icon: Database },
    { value: 'api', label: 'API Endpoint', icon: Link },
    { value: 'manual', label: 'Manual Input', icon: Upload },
  ];

  const fileFormats = [
    { value: 'json', label: 'JSON' },
    { value: 'csv', label: 'CSV' },
    { value: 'xlsx', label: 'Excel' },
    { value: 'txt', label: 'Text' },
    { value: 'xml', label: 'XML' },
    { value: 'parquet', label: 'Parquet' },
  ];

  const outputs = [
    { id: 'output', label: 'Data Output' },
    { id: 'metadata', label: 'Data Info' }
  ];

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      title="Data Input"
      icon={getIcon()}
      headerColor="bg-green-50"
      headerTextColor="text-green-800"
      borderColor="border-green-200"
      inputs={[]}
      outputs={outputs}
      collapsible={true}
    >
      <div className="space-y-4">
        {/* Input Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Input Source Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {inputTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => handleInputTypeChange(type.value)}
                  className={`
                    flex flex-col items-center p-3 rounded-lg text-xs transition-all duration-200
                    ${inputType === type.value
                      ? 'bg-green-100 text-green-700 border-2 border-green-300 transform scale-105'
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

        {/* Input Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Input Name
          </label>
          <input
            type="text"
            value={inputName}
            onChange={handleInputNameChange}
            placeholder="Enter input identifier..."
            className="form-input"
          />
        </div>

        {/* File Format (for file inputs) */}
        {inputType === 'file' && (
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Expected File Format
            </label>
            <select
              value={fileFormat}
              onChange={handleFileFormatChange}
              className="form-select"
            >
              {fileFormats.map((format) => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Describe the input data..."
            className="form-textarea"
            rows={2}
          />
        </div>

        {/* Configuration Preview */}
        <div className="pt-3 border-t border-gray-100">
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Upload className="w-4 h-4 text-green-600" />
              <span className="text-xs font-semibold text-green-800">Input Configuration</span>
            </div>
            <div className="text-xs text-green-700 space-y-1">
              <div className="flex items-center justify-between">
                <span>Type:</span>
                <span className="font-medium capitalize">{inputType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Name:</span>
                <span className="font-medium">{inputName || 'Unnamed'}</span>
              </div>
              {inputType === 'file' && (
                <div className="flex items-center justify-between">
                  <span>Format:</span>
                  <span className="font-medium uppercase">{fileFormat}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </BaseNode>
  );
};

export default InputNode;
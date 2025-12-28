import React, { useState } from 'react';
import { Upload, File, Database, Link } from 'lucide-react';
import BaseNode from './BaseNode';
import useStore from '../../store/useStore';

const InputNode = ({ id, data, selected }) => {
  const [inputType, setInputType] = useState(data?.inputType || 'file');
  const [inputName, setInputName] = useState(data?.inputName || 'input_data');
  const [description, setDescription] = useState(data?.description || '');
  const [fileFormat, setFileFormat] = useState(data?.fileFormat || 'json');
  const [uploadedFile, setUploadedFile] = useState(data?.uploadedFile || null);
  const [fileContent, setFileContent] = useState(data?.fileContent || null);
  const [isProcessing, setIsProcessing] = useState(false);
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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    try {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const content = event.target.result;
        setUploadedFile({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        });
        setFileContent(content);
        updateNodeData(id, { 
          uploadedFile: {
            name: file.name,
            size: file.size,
            type: file.type
          },
          fileContent: content,
          hasData: true
        });
        setIsProcessing(false);
      };

      reader.onerror = () => {
        alert('Error reading file');
        setIsProcessing(false);
      };

      // Read file based on format
      if (['json', 'csv', 'txt', 'xml'].includes(fileFormat)) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file');
      setIsProcessing(false);
    }
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    setFileContent(null);
    updateNodeData(id, { 
      uploadedFile: null,
      fileContent: null,
      hasData: false
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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

        {/* File Upload */}
        {inputType === 'file' && (
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Upload File
            </label>
            
            {!uploadedFile ? (
              <div className="relative">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept={
                    fileFormat === 'json' ? '.json' :
                    fileFormat === 'csv' ? '.csv' :
                    fileFormat === 'xlsx' ? '.xlsx,.xls' :
                    fileFormat === 'txt' ? '.txt' :
                    fileFormat === 'xml' ? '.xml' :
                    fileFormat === 'parquet' ? '.parquet' : '*'
                  }
                  disabled={isProcessing}
                  className="hidden"
                  id={`file-input-${id}`}
                />
                <label
                  htmlFor={`file-input-${id}`}
                  className={`
                    flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg
                    transition-all duration-200 cursor-pointer
                    ${isProcessing 
                      ? 'border-gray-300 bg-gray-50 cursor-wait' 
                      : 'border-green-300 bg-green-50 hover:bg-green-100 hover:border-green-400'
                    }
                  `}
                >
                  <Upload className={`w-8 h-8 mb-2 ${isProcessing ? 'text-gray-400 animate-pulse' : 'text-green-600'}`} />
                  <span className="text-sm font-medium text-green-700">
                    {isProcessing ? 'Processing...' : 'Click to upload file'}
                  </span>
                  <span className="text-xs text-green-600 mt-1">
                    {fileFormat.toUpperCase()} format
                  </span>
                </label>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <File className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-900 truncate">
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {formatFileSize(uploadedFile.size)} • {fileFormat.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClearFile}
                    className="ml-2 p-1 text-green-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Remove file"
                  >
                    <Upload className="w-4 h-4 rotate-180" />
                  </button>
                </div>
                <div className="mt-2 pt-2 border-t border-green-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-green-700">File loaded and ready</span>
                  </div>
                </div>
              </div>
            )}
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
                <>
                  <div className="flex items-center justify-between">
                    <span>Format:</span>
                    <span className="font-medium uppercase">{fileFormat}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <span className={`font-medium ${uploadedFile ? 'text-green-700' : 'text-orange-600'}`}>
                      {uploadedFile ? '✓ File Loaded' : '○ No File'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </BaseNode>
  );
};

export default InputNode;
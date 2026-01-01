import React, { useState } from 'react';
import { Upload, File, Database, Link, Code, CheckCircle, XCircle } from 'lucide-react';
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
  
  // Database fields
  const [dbConnectionString, setDbConnectionString] = useState(data?.dbConnectionString || '');
  const [dbQuery, setDbQuery] = useState(data?.dbQuery || '');
  const [dbConnected, setDbConnected] = useState(data?.dbConnected || false);
  
  // API fields
  const [apiEndpoint, setApiEndpoint] = useState(data?.apiEndpoint || '');
  const [apiMethod, setApiMethod] = useState(data?.apiMethod || 'GET');
  const [apiHeaders, setApiHeaders] = useState(data?.apiHeaders || '');
  const [apiBody, setApiBody] = useState(data?.apiBody || '');
  const [apiResponse, setApiResponse] = useState(data?.apiResponse || null);
  
  // Manual input fields
  const [manualInput, setManualInput] = useState(data?.manualInput || '');
  
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

  // Database handlers
  const handleDbConnectionChange = (e) => {
    const conn = e.target.value;
    setDbConnectionString(conn);
    updateNodeData(id, { dbConnectionString: conn });
  };

  const handleDbQueryChange = (e) => {
    const query = e.target.value;
    setDbQuery(query);
    updateNodeData(id, { dbQuery: query });
  };

  const handleTestDbConnection = () => {
    if (!dbConnectionString) {
      alert('Please enter a connection string');
      return;
    }
    setIsProcessing(true);
    // Simulate connection test
    setTimeout(() => {
      setDbConnected(true);
      updateNodeData(id, { dbConnected: true, hasData: true });
      setIsProcessing(false);
      alert('✅ Database connection successful!');
    }, 1500);
  };

  // API handlers
  const handleApiEndpointChange = (e) => {
    const endpoint = e.target.value;
    setApiEndpoint(endpoint);
    updateNodeData(id, { apiEndpoint: endpoint });
  };

  const handleApiMethodChange = (e) => {
    const method = e.target.value;
    setApiMethod(method);
    updateNodeData(id, { apiMethod: method });
  };

  const handleApiHeadersChange = (e) => {
    const headers = e.target.value;
    setApiHeaders(headers);
    updateNodeData(id, { apiHeaders: headers });
  };

  const handleApiBodyChange = (e) => {
    const body = e.target.value;
    setApiBody(body);
    updateNodeData(id, { apiBody: body });
  };

  const handleTestApiCall = async () => {
    if (!apiEndpoint) {
      alert('Please enter an API endpoint');
      return;
    }
    setIsProcessing(true);
    try {
      const options = {
        method: apiMethod,
        headers: apiHeaders ? JSON.parse(apiHeaders) : {},
      };
      if (apiMethod !== 'GET' && apiBody) {
        options.body = apiBody;
      }
      const response = await fetch(apiEndpoint, options);
      const data = await response.json();
      setApiResponse(data);
      updateNodeData(id, { apiResponse: data, hasData: true });
      alert('✅ API call successful!');
    } catch (error) {
      alert('❌ API call failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Manual input handler
  const handleManualInputChange = (e) => {
    const input = e.target.value;
    setManualInput(input);
    updateNodeData(id, { manualInput: input, hasData: input.length > 0 });
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
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <File className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="text-sm font-medium text-green-900 break-words">
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {formatFileSize(uploadedFile.size)} • {fileFormat.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClearFile}
                    className="flex-shrink-0 ml-2 p-1 text-green-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Remove file"
                  >
                    <XCircle className="w-4 h-4" />
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

        {/* Database Configuration */}
        {inputType === 'database' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Database Connection String
              </label>
              <input
                type="text"
                value={dbConnectionString}
                onChange={handleDbConnectionChange}
                placeholder="postgresql://user:pass@localhost:5432/db"
                className="form-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                SQL Query
              </label>
              <textarea
                value={dbQuery}
                onChange={handleDbQueryChange}
                placeholder="SELECT * FROM table_name WHERE..."
                className="form-textarea text-xs font-mono"
                rows={3}
              />
            </div>
            <button
              onClick={handleTestDbConnection}
              disabled={isProcessing || !dbConnectionString}
              className={`
                w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-semibold text-sm
                transition-all duration-200
                ${
                  isProcessing || !dbConnectionString
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }
              `}
            >
              <Database className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Testing...' : dbConnected ? 'Connected ✓' : 'Test Connection'}</span>
            </button>
          </div>
        )}

        {/* API Configuration */}
        {inputType === 'api' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                API Endpoint
              </label>
              <input
                type="text"
                value={apiEndpoint}
                onChange={handleApiEndpointChange}
                placeholder="https://api.example.com/data"
                className="form-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                HTTP Method
              </label>
              <select
                value={apiMethod}
                onChange={handleApiMethodChange}
                className="form-select text-xs"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Headers (JSON)
              </label>
              <textarea
                value={apiHeaders}
                onChange={handleApiHeadersChange}
                placeholder='{"Content-Type": "application/json"}'
                className="form-textarea text-xs font-mono"
                rows={2}
              />
            </div>
            {apiMethod !== 'GET' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Request Body
                </label>
                <textarea
                  value={apiBody}
                  onChange={handleApiBodyChange}
                  placeholder='{"key": "value"}'
                  className="form-textarea text-xs font-mono"
                  rows={3}
                />
              </div>
            )}
            <button
              onClick={handleTestApiCall}
              disabled={isProcessing || !apiEndpoint}
              className={`
                w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-semibold text-sm
                transition-all duration-200
                ${
                  isProcessing || !apiEndpoint
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }
              `}
            >
              <Link className={`w-4 h-4 ${isProcessing ? 'animate-pulse' : ''}`} />
              <span>{isProcessing ? 'Calling...' : apiResponse ? 'Call Again' : 'Test API Call'}</span>
            </button>
            {apiResponse && (
              <div className="bg-green-50 border border-green-200 rounded p-2">
                <p className="text-xs text-green-700 font-medium mb-1">✓ Response received</p>
                <pre className="text-xs text-green-900 overflow-x-auto break-words whitespace-pre-wrap">
                  {JSON.stringify(apiResponse, null, 2).substring(0, 200)}...
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Manual Input */}
        {inputType === 'manual' && (
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Manual Data Input
            </label>
            <textarea
              value={manualInput}
              onChange={handleManualInputChange}
              placeholder="Paste or type your data here...&#10;Supports JSON, CSV, plain text, etc."
              className="form-textarea text-xs font-mono"
              rows={6}
            />
            {manualInput && (
              <div className="mt-2 flex items-center space-x-2 text-xs text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>{manualInput.length} characters entered</span>
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
                <span className="font-medium truncate ml-2 max-w-[150px]" title={inputName}>{inputName || 'Unnamed'}</span>
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
              {inputType === 'database' && (
                <div className="flex items-center justify-between">
                  <span>Connection:</span>
                  <span className={`font-medium ${dbConnected ? 'text-green-700' : 'text-orange-600'}`}>
                    {dbConnected ? '✓ Connected' : '○ Not Connected'}
                  </span>
                </div>
              )}
              {inputType === 'api' && (
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <span className={`font-medium ${apiResponse ? 'text-green-700' : 'text-orange-600'}`}>
                    {apiResponse ? '✓ Response OK' : '○ No Response'}
                  </span>
                </div>
              )}
              {inputType === 'manual' && (
                <div className="flex items-center justify-between">
                  <span>Data:</span>
                  <span className={`font-medium ${manualInput ? 'text-green-700' : 'text-orange-600'}`}>
                    {manualInput ? `✓ ${manualInput.length} chars` : '○ No Data'}
                  </span>
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
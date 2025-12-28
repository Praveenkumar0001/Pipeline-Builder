
import React, { useState } from 'react';
import { Globe, Key, Settings, Send } from 'lucide-react';
import BaseNode from './BaseNode';
import useStore from '../../store/useStore';

const APINode = ({ id, data, selected }) => {
  const [method, setMethod] = useState(data.method || 'GET');
  const [url, setUrl] = useState(data.url || '');
  const [headers, setHeaders] = useState(data.headers || '');
  const [body, setBody] = useState(data.body || '');
  const [authentication, setAuthentication] = useState(data.authentication || 'none');
  const [apiKey, setApiKey] = useState(data.apiKey || '');
  const [testResponse, setTestResponse] = useState(data.testResponse || null);
  const [isTesting, setIsTesting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const updateNodeData = useStore(state => state.updateNodeData);

  const handleMethodChange = (e) => {
    const newMethod = e.target.value;
    setMethod(newMethod);
    updateNodeData(id, { method: newMethod });
  };

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    updateNodeData(id, { url: newUrl });
  };

  const handleHeadersChange = (e) => {
    const newHeaders = e.target.value;
    setHeaders(newHeaders);
    updateNodeData(id, { headers: newHeaders });
  };

  const handleBodyChange = (e) => {
    const newBody = e.target.value;
    setBody(newBody);
    updateNodeData(id, { body: newBody });
  };

  const handleAuthChange = (e) => {
    const newAuth = e.target.value;
    setAuthentication(newAuth);
    updateNodeData(id, { authentication: newAuth });
  };

  const handleApiKeyChange = (e) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    updateNodeData(id, { apiKey: newKey });
  };

  const handleTestAPI = async () => {
    if (!url.trim()) {
      alert('Please enter a URL');
      return;
    }

    setIsTesting(true);
    
    try {
      const requestOptions = {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      // Add headers if provided
      if (headers.trim()) {
        try {
          const parsedHeaders = JSON.parse(headers);
          requestOptions.headers = { ...requestOptions.headers, ...parsedHeaders };
        } catch (e) {
          console.warn('Invalid headers JSON, using defaults');
        }
      }

      // Add authentication
      if (authentication === 'api-key' && apiKey) {
        requestOptions.headers['X-API-Key'] = apiKey;
      } else if (authentication === 'bearer' && apiKey) {
        requestOptions.headers['Authorization'] = `Bearer ${apiKey}`;
      }

      // Add body for POST/PUT/PATCH
      if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {
        requestOptions.body = body;
      }

      const response = await fetch(url, requestOptions);
      const responseData = await response.json().catch(() => response.text());

      const result = {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        data: responseData,
        timestamp: new Date().toISOString(),
        method: method,
        url: url
      };

      setTestResponse(result);
      updateNodeData(id, { 
        testResponse: result,
        lastTest: new Date().toISOString()
      });

    } catch (error) {
      const errorResult = {
        status: 0,
        statusText: 'Error',
        ok: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        method: method,
        url: url
      };
      
      setTestResponse(errorResult);
      updateNodeData(id, { testResponse: errorResult });
      alert('API Test failed: ' + error.message);
    } finally {
      setIsTesting(false);
    }
  };

  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
  const authTypes = [
    { value: 'none', label: 'None' },
    { value: 'api-key', label: 'API Key' },
    { value: 'bearer', label: 'Bearer Token' },
    { value: 'basic', label: 'Basic Auth' },
  ];

  const getMethodColor = (method) => {
    const colors = {
      GET: 'bg-green-100 text-green-700 border-green-300',
      POST: 'bg-blue-100 text-blue-700 border-blue-300',
      PUT: 'bg-orange-100 text-orange-700 border-orange-300',
      PATCH: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      DELETE: 'bg-red-100 text-red-700 border-red-300',
    };
    return colors[method] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const inputs = [
    { id: 'data', label: 'Request Data' },
    { id: 'params', label: 'URL Parameters' },
    { id: 'headers', label: 'Custom Headers' }
  ];

  const outputs = [
    { id: 'response', label: 'API Response' },
    { id: 'status', label: 'Status Code' },
    { id: 'headers', label: 'Response Headers' }
  ];

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      title="API Call"
      icon={Globe}
      headerColor="bg-indigo-50"
      headerTextColor="text-indigo-800"
      borderColor="border-indigo-200"
      inputs={inputs}
      outputs={outputs}
      collapsible={true}
      minWidth={320}
    >
      <div className="space-y-4">
        {/* Method and URL */}
        <div className="flex space-x-2">
          <div className="w-24">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Method
            </label>
            <select
              value={method}
              onChange={handleMethodChange}
              className={`
                form-select text-xs font-medium border rounded-lg
                ${getMethodColor(method)}
              `}
            >
              {methods.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              URL
            </label>
            <input
              type="text"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://api.example.com/endpoint"
              className="form-input"
            />
          </div>
        </div>

        {/* Authentication */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Authentication
          </label>
          <select
            value={authentication}
            onChange={handleAuthChange}
            className="form-select"
          >
            {authTypes.map((auth) => (
              <option key={auth.value} value={auth.value}>
                {auth.label}
              </option>
            ))}
          </select>
        </div>

        {/* API Key Input */}
        {authentication !== 'none' && (
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              {authentication === 'api-key' ? 'API Key' : 
               authentication === 'bearer' ? 'Bearer Token' : 'Credentials'}
            </label>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={handleApiKeyChange}
                placeholder={`Enter your ${authentication === 'api-key' ? 'API key' : 'token'}`}
                className="form-input pr-10"
              />
              <Key className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>
        )}

        {/* Advanced Settings Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 text-xs text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <Settings className="w-3 h-3" />
          <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Settings</span>
        </button>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="space-y-4 pt-3 border-t border-gray-100">
            {/* Headers */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Headers (JSON format)
              </label>
              <textarea
                value={headers}
                onChange={handleHeadersChange}
                placeholder='{"Content-Type": "application/json"}'
                className="form-textarea font-mono"
                rows={3}
              />
            </div>

            {/* Request Body */}
            {['POST', 'PUT', 'PATCH'].includes(method) && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Request Body (JSON format)
                </label>
                <textarea
                  value={body}
                  onChange={handleBodyChange}
                  placeholder='{"key": "value"}'
                  className="form-textarea font-mono"
                  rows={4}
                />
              </div>
            )}
          </div>
        )}

        {/* Test API Button */}
        <div className="pt-3 border-t border-gray-100">
          <button
            onClick={handleTestAPI}
            disabled={isTesting || !url.trim()}
            className={`
              w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-semibold text-sm
              transition-all duration-200 transform
              ${isTesting || !url.trim()
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                : 'bg-indigo-500 text-white hover:bg-indigo-600 hover:scale-105 active:scale-95'
              }
            `}
          >
            <Send className={`w-4 h-4 ${isTesting ? 'animate-pulse' : ''}`} />
            <span>{isTesting ? 'Testing...' : 'Test API Call'}</span>
          </button>

          {/* Test Response Display */}
          {testResponse && (
            <div className={`mt-3 border rounded-lg p-3 ${
              testResponse.ok ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className={`text-xs font-semibold mb-2 flex items-center justify-between ${
                testResponse.ok ? 'text-green-800' : 'text-red-800'
              }`}>
                <span>Response</span>
                <span className={testResponse.ok ? 'text-green-600' : 'text-red-600'}>
                  {testResponse.status} {testResponse.statusText}
                </span>
              </div>
              <div className={`text-xs whitespace-pre-wrap font-mono bg-white p-2 rounded border max-h-32 overflow-y-auto ${
                testResponse.ok ? 'border-green-100 text-green-900' : 'border-red-100 text-red-900'
              }`}>
                {testResponse.error || JSON.stringify(testResponse.data, null, 2)}
              </div>
              <div className={`text-xs mt-2 text-right ${
                testResponse.ok ? 'text-green-600' : 'text-red-600'
              }`}>
                {new Date(testResponse.timestamp).toLocaleTimeString()}
              </div>
            </div>
          )}
        </div>

        {/* Configuration Summary */}
        <div className="pt-3 border-t border-gray-100">
          <div className="bg-indigo-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Send className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-semibold text-indigo-800">Request Summary</span>
            </div>
            <div className="text-xs text-indigo-700 space-y-1">
              <div className="flex items-center justify-between">
                <span>Method:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(method)}`}>
                  {method}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Auth:</span>
                <span className="font-medium capitalize">
                  {authentication === 'none' ? 'None' : authentication.replace('-', ' ')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>URL Set:</span>
                <span className={`font-medium ${url ? 'text-green-700' : 'text-red-600'}`}>
                  {url ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseNode>
  );
};

export default APINode;
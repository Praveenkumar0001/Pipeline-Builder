import React, { useState } from 'react';
import { Brain, Settings } from 'lucide-react';
import BaseNode from './BaseNode';
import useStore from '../../store/useStore';

const LLMNode = ({ id, data, selected }) => {
  const [model, setModel] = useState(data.model || 'gpt-3.5-turbo');
  const [temperature, setTemperature] = useState(data.temperature || 0.7);
  const [maxTokens, setMaxTokens] = useState(data.maxTokens || 150);
  const [systemPrompt, setSystemPrompt] = useState(data.systemPrompt || '');
  const [testPrompt, setTestPrompt] = useState(data.testPrompt || '');
  const [testResponse, setTestResponse] = useState(data.testResponse || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const updateNodeData = useStore(state => state.updateNodeData);

  const handleModelChange = (e) => {
    const newModel = e.target.value;
    setModel(newModel);
    updateNodeData(id, { model: newModel });
  };

  const handleTemperatureChange = (e) => {
    const temp = parseFloat(e.target.value);
    setTemperature(temp);
    updateNodeData(id, { temperature: temp });
  };

  const handleMaxTokensChange = (e) => {
    const tokens = parseInt(e.target.value);
    setMaxTokens(tokens);
    updateNodeData(id, { maxTokens: tokens });
  };

  const handleSystemPromptChange = (e) => {
    const prompt = e.target.value;
    setSystemPrompt(prompt);
    updateNodeData(id, { systemPrompt: prompt });
  };

  const handleTestGenerate = async () => {
    if (!testPrompt.trim()) {
      alert('Please enter a test prompt');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate LLM response (in production, this would call actual API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResponses = {
        'gpt-4': `[GPT-4 Response]\n\nBased on your prompt: "${testPrompt}"\n\nI understand you're looking for assistance. Here's a comprehensive response that demonstrates GPT-4's advanced reasoning capabilities. This model excels at complex tasks, nuanced understanding, and detailed explanations.\n\nKey points:\n• Advanced natural language understanding\n• Context-aware responses\n• Creative and analytical thinking\n\nTemperature: ${temperature} | Max Tokens: ${maxTokens}`,
        'gpt-3.5-turbo': `[GPT-3.5 Turbo Response]\n\nPrompt: "${testPrompt}"\n\nThis is a fast, efficient response from GPT-3.5 Turbo. It provides quick, accurate answers while being cost-effective. Great for most conversational and analytical tasks.\n\nConfiguration: Temperature ${temperature}, Max Tokens ${maxTokens}`,
        'claude-3': `[Claude 3 Response]\n\nThank you for your query: "${testPrompt}"\n\nI'm Claude, an AI assistant created by Anthropic. I aim to be helpful, harmless, and honest. Let me provide you with a thoughtful response that considers multiple perspectives and prioritizes safety.\n\nSettings: Temp ${temperature}, Tokens ${maxTokens}`,
        'llama-2': `[Llama 2 Response]\n\nInput: "${testPrompt}"\n\nThis is an open-source response from Meta's Llama 2 model. It offers strong performance for a variety of tasks while being freely available for research and commercial use.\n\nParams: temperature=${temperature}, max_tokens=${maxTokens}`
      };

      const response = {
        text: mockResponses[model] || mockResponses['gpt-3.5-turbo'],
        model: model,
        timestamp: new Date().toISOString(),
        tokens: Math.floor(Math.random() * 100) + 50,
        temperature: temperature,
        maxTokens: maxTokens
      };

      setTestResponse(response);
      updateNodeData(id, { 
        testResponse: response,
        lastTest: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate response: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const models = [
    { value: 'gpt-4', label: 'GPT-4', description: 'Most capable model' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
    { value: 'claude-3', label: 'Claude 3', description: 'Anthropic model' },
    { value: 'llama-2', label: 'Llama 2', description: 'Open source model' },
  ];

  const inputs = [
    { id: 'prompt', label: 'Prompt Input' },
    { id: 'context', label: 'Context Data' }
  ];

  const outputs = [
    { id: 'output', label: 'LLM Response' },
    { id: 'tokens', label: 'Token Usage' }
  ];

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      title="Language Model"
      icon={Brain}
      headerColor="bg-blue-50"
      headerTextColor="text-blue-800"
      borderColor="border-blue-200"
      inputs={inputs}
      outputs={outputs}
      collapsible={true}
      minWidth={280}
    >
      <div className="space-y-4">
        {/* Model Selection */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Language Model
          </label>
          <select
            value={model}
            onChange={handleModelChange}
            className="form-select"
          >
            {models.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <div className="text-xs text-gray-500 mt-1">
            {models.find(m => m.value === model)?.description}
          </div>
        </div>

        {/* System Prompt */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            System Prompt
          </label>
          <textarea
            value={systemPrompt}
            onChange={handleSystemPromptChange}
            placeholder="You are a helpful assistant that..."
            className="form-textarea"
            rows={3}
          />
        </div>

        {/* Advanced Settings Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 text-xs text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Settings className="w-3 h-3" />
          <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Settings</span>
        </button>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="space-y-4 pt-3 border-t border-gray-100">
            {/* Temperature */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Temperature: {temperature}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={handleTemperatureChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Deterministic</span>
                <span>Creative</span>
              </div>
            </div>

            {/* Max Tokens */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Max Tokens
              </label>
              <input
                type="number"
                min="1"
                max="4000"
                value={maxTokens}
                onChange={handleMaxTokensChange}
                className="form-input"
              />
            </div>
          </div>
        )}

        {/* Test Prompt Section */}
        <div className="pt-3 border-t border-gray-100 space-y-3">
          <label className="block text-xs font-semibold text-gray-700">
            Test Prompt
          </label>
          <textarea
            value={testPrompt}
            onChange={(e) => setTestPrompt(e.target.value)}
            placeholder="Enter a test prompt to try the model..."
            className="form-textarea"
            rows={2}
          />
          
          <button
            onClick={handleTestGenerate}
            disabled={isGenerating || !testPrompt.trim()}
            className={`
              w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-semibold text-sm
              transition-all duration-200 transform
              ${isGenerating || !testPrompt.trim()
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-105 active:scale-95'
              }
            `}
          >
            <Brain className={`w-4 h-4 ${isGenerating ? 'animate-pulse' : ''}`} />
            <span>{isGenerating ? 'Generating...' : 'Test Generate'}</span>
          </button>

          {/* Test Response Display */}
          {testResponse && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-xs font-semibold text-green-800 mb-2 flex items-center justify-between">
                <span>Response</span>
                <span className="text-green-600">{testResponse.tokens} tokens</span>
              </div>
              <div className="text-xs text-green-900 whitespace-pre-wrap font-mono bg-white p-2 rounded border border-green-100 max-h-32 overflow-y-auto">
                {testResponse.text}
              </div>
              <div className="text-xs text-green-600 mt-2 text-right">
                {new Date(testResponse.timestamp).toLocaleTimeString()}
              </div>
            </div>
          )}
        </div>

        {/* Configuration Summary */}
        <div className="pt-3 border-t border-gray-100">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-xs text-blue-700 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">Model:</span>
                <span>{model}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Temperature:</span>
                <span>{temperature}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Max Tokens:</span>
                <span>{maxTokens}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseNode>
  );
};

export default LLMNode;
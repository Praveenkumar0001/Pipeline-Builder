import React, { useState } from 'react';
import { Brain, Settings } from 'lucide-react';
import BaseNode from './BaseNode';
import useStore from '../../store/useStore';

const LLMNode = ({ id, data, selected }) => {
  const [model, setModel] = useState(data.model || 'gpt-3.5-turbo');
  const [temperature, setTemperature] = useState(data.temperature || 0.7);
  const [maxTokens, setMaxTokens] = useState(data.maxTokens || 150);
  const [systemPrompt, setSystemPrompt] = useState(data.systemPrompt || '');
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
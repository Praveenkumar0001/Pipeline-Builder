// frontend/src/components/nodes/TextNode.jsx
import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { Type } from 'lucide-react';
import BaseNode from './BaseNode';
import useStore from '../../store/useStore';

const TextNode = memo(({ id, data, selected }) => {
  const [text, setText] = useState(data?.text || '');
  const [variables, setVariables] = useState([]);
  const textareaRef = useRef(null);
  const updateNodeData = useStore((state) => state.updateNodeData);

  // Extract variables from text using regex
  const extractVariables = useCallback((inputText) => {
    const variableRegex = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g;
    const found = [];
    let match;
    
    while ((match = variableRegex.exec(inputText)) !== null) {
      const variableName = match[1].trim();
      if (!found.includes(variableName)) {
        found.push(variableName);
      }
    }
    
    return found;
  }, []);

  // Update variables when text changes
  useEffect(() => {
    const newVariables = extractVariables(text);
    setVariables(newVariables);
    
    // Update node data in store
    updateNodeData(id, { 
      text, 
      variables: newVariables
    });
  }, [text, id, extractVariables, updateNodeData]);

  // Auto-resize textarea
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Calculate dynamic width based on text content
  const getNodeWidth = () => {
    if (!text) return 280;
    
    const lines = text.split('\n');
    const maxLineLength = Math.max(...lines.map(line => line.length), 20);
    return Math.max(280, Math.min(maxLineLength * 8 + 60, 450));
  };

  // Create input handles for variables
  const variableInputs = variables.map((variable, index) => ({
    id: variable,
    label: `Variable: ${variable}`,
    position: `${((index + 1) * 100) / (variables.length + 1)}%`,
    style: {
      background: '#f59e0b',
      border: '2px solid #ffffff'
    }
  }));

  // Output handle
  const outputs = [
    {
      id: 'output',
      label: 'Text Output'
    }
  ];

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      title="Text Template"
      icon={Type}
      headerColor="bg-purple-50"
      headerTextColor="text-purple-800"
      borderColor="border-purple-200"
      inputs={variableInputs}
      outputs={outputs}
      minWidth={getNodeWidth()}
      collapsible={true}
    >
      <div className="space-y-3">
        {/* Text Input Area */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Text Content
          </label>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            placeholder="Enter your text here... Use {{variableName}} for dynamic variables"
            className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 font-mono text-sm"
            style={{
              minHeight: '80px',
              maxHeight: '300px',
              overflowY: 'auto'
            }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
          />
        </div>

        {/* Variables Preview */}
        {variables.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-amber-800 mb-2">
              Detected Variables:
            </h4>
            <div className="flex flex-wrap gap-1">
              {variables.map((variable, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300"
                >
                  {variable}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Character Count */}
        <div className="text-xs text-gray-500 text-right">
          {text.length} characters
        </div>
      </div>
    </BaseNode>
  );
});

TextNode.displayName = 'TextNode';

export default TextNode;
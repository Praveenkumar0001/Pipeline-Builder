
import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Settings, Maximize2, Minimize2 } from 'lucide-react';

const BaseNode = memo(({ 
  id,
  data,
  selected,
  title = "Node",
  icon: IconComponent = null,
  headerColor = "bg-blue-50",
  headerTextColor = "text-blue-800",
  borderColor = "border-blue-200",
  inputs = [],
  outputs = [],
  children,
  className = "",
  collapsible = false,
  minWidth = 200,
  maxWidth = 500
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleStyle = {
    width: '12px',
    height: '12px',
    border: '2px solid #ffffff',
    borderRadius: '50%',
    background: '#3b82f6',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  };

  const inputHandleStyle = {
    ...handleStyle,
    background: '#ef4444'
  };

  const outputHandleStyle = {
    ...handleStyle,
    background: '#10b981'
  };

  return (
    <div 
      className={`
        bg-white rounded-xl shadow-lg border-2 transition-all duration-200
        ${selected ? 'ring-2 ring-blue-400 ring-opacity-75 shadow-xl' : 'hover:shadow-xl'}
        ${borderColor}
        ${className}
      `}
      style={{
        minWidth: `${minWidth}px`,
        maxWidth: `${maxWidth}px`,
        transform: selected ? 'scale(1.02)' : 'scale(1)'
      }}
    >
      {/* Input Handles */}
      {inputs.map((input, index) => (
        <Handle
          key={`input-${input.id || index}`}
          type="target"
          position={Position.Left}
          id={input.id || `input-${index}`}
          style={{
            ...inputHandleStyle,
            top: input.position || `${((index + 1) * 100) / (inputs.length + 1)}%`,
            ...input.style
          }}
          title={input.label || `Input ${index + 1}`}
        />
      ))}

      {/* Header */}
      <div className={`
        flex items-center justify-between p-3 rounded-t-xl
        ${headerColor} ${headerTextColor}
      `}>
        <div className="flex items-center space-x-2">
          {IconComponent && <IconComponent className="w-5 h-5" />}
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        
        <div className="flex items-center space-x-1">
          {collapsible && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded hover:bg-black hover:bg-opacity-10 transition-colors"
            >
              {isCollapsed ? (
                <Maximize2 className="w-3 h-3" />
              ) : (
                <Minimize2 className="w-3 h-3" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-4">
          {children}
        </div>
      )}

      {/* Output Handles */}
      {outputs.map((output, index) => (
        <Handle
          key={`output-${output.id || index}`}
          type="source"
          position={Position.Right}
          id={output.id || `output-${index}`}
          style={{
            ...outputHandleStyle,
            top: output.position || `${((index + 1) * 100) / (outputs.length + 1)}%`,
            ...output.style
          }}
          title={output.label || `Output ${index + 1}`}
        />
      ))}
    </div>
  );
});

BaseNode.displayName = 'BaseNode';

export default BaseNode;
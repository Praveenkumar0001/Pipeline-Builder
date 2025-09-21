// frontend/src/components/nodes/CustomNodes.jsx
import React from 'react';
import { Handle, Position } from 'reactflow';

// Base Node Component for consistency
const BaseCustomNode = ({ title, icon, children, inputs = [], outputs = [], color = '#3b82f6' }) => (
  <div className="bg-white rounded-lg border-2 shadow-lg p-4 min-w-[200px]" 
       style={{ borderColor: color }}>
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xl">{icon}</span>
      <span className="font-semibold text-gray-800">{title}</span>
    </div>
    
    {/* Input Handles */}
    {inputs.map((input, index) => (
      <Handle
        key={input.id}
        type="target"
        position={Position.Left}
        id={input.id}
        style={{
          top: `${((index + 1) * 100) / (inputs.length + 1)}%`,
          background: color,
          border: `2px solid ${color}`,
          width: '12px',
          height: '12px'
        }}
        title={input.label}
      />
    ))}
    
    {/* Node Content */}
    <div className="text-sm text-gray-600">
      {children}
    </div>
    
    {/* Output Handles */}
    {outputs.map((output, index) => (
      <Handle
        key={output.id}
        type="source"
        position={Position.Right}
        id={output.id}
        style={{
          top: `${((index + 1) * 100) / (outputs.length + 1)}%`,
          background: '#10b981',
          border: '2px solid #10b981',
          width: '12px',
          height: '12px'
        }}
        title={output.label}
      />
    ))}
  </div>
);

// 1. Filter Node
export const FilterNode = ({ id, data }) => {
  const [condition, setCondition] = React.useState(data?.condition || 'equals');
  const [value, setValue] = React.useState(data?.value || '');

  return (
    <BaseCustomNode
      title="Filter"
      icon="🔍"
      color="#8b5cf6"
      inputs={[
        { id: 'data', label: 'Data Input' },
        { id: 'condition', label: 'Condition' }
      ]}
      outputs={[
        { id: 'filtered', label: 'Filtered Data' },
        { id: 'rejected', label: 'Rejected Data' }
      ]}
    >
      <div className="space-y-2">
        <div>
          <label className="block text-xs font-medium mb-1">Condition:</label>
          <select 
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full px-2 py-1 text-xs border rounded"
          >
            <option value="equals">Equals</option>
            <option value="contains">Contains</option>
            <option value="greater">Greater Than</option>
            <option value="less">Less Than</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Value:</label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-2 py-1 text-xs border rounded"
            placeholder="Filter value"
          />
        </div>
      </div>
    </BaseCustomNode>
  );
};

// 2. Transform Node
export const TransformNode = ({ id, data }) => {
  const [operation, setOperation] = React.useState(data?.operation || 'uppercase');
  const [customCode, setCustomCode] = React.useState(data?.customCode || '');

  return (
    <BaseCustomNode
      title="Transform"
      icon="🔄"
      color="#f59e0b"
      inputs={[
        { id: 'input', label: 'Input Data' },
        { id: 'config', label: 'Config' }
      ]}
      outputs={[
        { id: 'output', label: 'Transformed Data' }
      ]}
    >
      <div className="space-y-2">
        <div>
          <label className="block text-xs font-medium mb-1">Operation:</label>
          <select 
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
            className="w-full px-2 py-1 text-xs border rounded"
          >
            <option value="uppercase">Uppercase</option>
            <option value="lowercase">Lowercase</option>
            <option value="trim">Trim</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        {operation === 'custom' && (
          <div>
            <label className="block text-xs font-medium mb-1">Code:</label>
            <textarea
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              className="w-full px-2 py-1 text-xs border rounded h-16 resize-none"
              placeholder="// Custom transformation code"
            />
          </div>
        )}
      </div>
    </BaseCustomNode>
  );
};

// 3. Math Node
export const MathNode = ({ id, data }) => {
  const [operation, setOperation] = React.useState(data?.operation || 'add');
  const [operandB, setOperandB] = React.useState(data?.operandB || 0);

  return (
    <BaseCustomNode
      title="Math"
      icon="🧮"
      color="#ef4444"
      inputs={[
        { id: 'a', label: 'Number A' },
        { id: 'b', label: 'Number B' }
      ]}
      outputs={[
        { id: 'result', label: 'Result' }
      ]}
    >
      <div className="space-y-2">
        <div>
          <label className="block text-xs font-medium mb-1">Operation:</label>
          <select 
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
            className="w-full px-2 py-1 text-xs border rounded"
          >
            <option value="add">Add (+)</option>
            <option value="subtract">Subtract (-)</option>
            <option value="multiply">Multiply (×)</option>
            <option value="divide">Divide (÷)</option>
            <option value="power">Power (^)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Operand B:</label>
          <input
            type="number"
            value={operandB}
            onChange={(e) => setOperandB(Number(e.target.value))}
            className="w-full px-2 py-1 text-xs border rounded"
            placeholder="0"
          />
        </div>
        <div className="text-xs text-gray-500">
          Result: A {operation} {operandB}
        </div>
      </div>
    </BaseCustomNode>
  );
};

// 4. Document Node
export const DocumentNode = ({ id, data }) => {
  const [docType, setDocType] = React.useState(data?.docType || 'pdf');
  const [extractType, setExtractType] = React.useState(data?.extractType || 'text');

  return (
    <BaseCustomNode
      title="Document"
      icon="📄"
      color="#10b981"
      inputs={[
        { id: 'file', label: 'Document File' },
        { id: 'config', label: 'Config' }
      ]}
      outputs={[
        { id: 'content', label: 'Extracted Content' },
        { id: 'metadata', label: 'Metadata' }
      ]}
    >
      <div className="space-y-2">
        <div>
          <label className="block text-xs font-medium mb-1">Document Type:</label>
          <select 
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="w-full px-2 py-1 text-xs border rounded"
          >
            <option value="pdf">PDF</option>
            <option value="docx">Word Document</option>
            <option value="txt">Text File</option>
            <option value="csv">CSV File</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Extract:</label>
          <select 
            value={extractType}
            onChange={(e) => setExtractType(e.target.value)}
            className="w-full px-2 py-1 text-xs border rounded"
          >
            <option value="text">Text Only</option>
            <option value="tables">Tables</option>
            <option value="images">Images</option>
            <option value="all">Everything</option>
          </select>
        </div>
      </div>
    </BaseCustomNode>
  );
};

// 5. Database Node
export const DatabaseNode = ({ id, data }) => {
  const [dbType, setDbType] = React.useState(data?.dbType || 'postgresql');
  const [query, setQuery] = React.useState(data?.query || 'SELECT * FROM table;');

  return (
    <BaseCustomNode
      title="Database"
      icon="🗄️"
      color="#dc2626"
      inputs={[
        { id: 'connection', label: 'Connection' },
        { id: 'params', label: 'Parameters' }
      ]}
      outputs={[
        { id: 'result', label: 'Query Result' },
        { id: 'count', label: 'Row Count' }
      ]}
    >
      <div className="space-y-2">
        <div>
          <label className="block text-xs font-medium mb-1">Database:</label>
          <select 
            value={dbType}
            onChange={(e) => setDbType(e.target.value)}
            className="w-full px-2 py-1 text-xs border rounded"
          >
            <option value="postgresql">PostgreSQL</option>
            <option value="mysql">MySQL</option>
            <option value="sqlite">SQLite</option>
            <option value="mongodb">MongoDB</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Query:</label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-2 py-1 text-xs border rounded h-16 resize-none font-mono"
            placeholder="SELECT * FROM table;"
          />
        </div>
      </div>
    </BaseCustomNode>
  );
};

// 6. Join Node (NEW)
export const JoinNode = ({ id, data }) => {
  const [joinType, setJoinType] = React.useState(data?.joinType || 'inner');
  const [leftKey, setLeftKey] = React.useState(data?.leftKey || '');
  const [rightKey, setRightKey] = React.useState(data?.rightKey || '');

  return (
    <BaseCustomNode
      title="Join"
      icon="🔗"
      color="#0891b2"
      inputs={[
        { id: 'input1', label: 'Left Input' },
        { id: 'input2', label: 'Right Input' }
      ]}
      outputs={[
        { id: 'output', label: 'Joined Data' }
      ]}
    >
      <div className="space-y-2">
        <div>
          <label className="block text-xs font-medium mb-1">Join Type:</label>
          <select 
            value={joinType}
            onChange={(e) => setJoinType(e.target.value)}
            className="w-full px-2 py-1 text-xs border rounded"
          >
            <option value="inner">Inner Join</option>
            <option value="left">Left Join</option>
            <option value="right">Right Join</option>
            <option value="outer">Full Outer Join</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Left Key:</label>
          <input
            type="text"
            value={leftKey}
            onChange={(e) => setLeftKey(e.target.value)}
            className="w-full px-2 py-1 text-xs border rounded"
            placeholder="id"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Right Key:</label>
          <input
            type="text"
            value={rightKey}
            onChange={(e) => setRightKey(e.target.value)}
            className="w-full px-2 py-1 text-xs border rounded"
            placeholder="user_id"
          />
        </div>
      </div>
    </BaseCustomNode>
  );
};

// 7. Aggregate Node (NEW)
export const AggregateNode = ({ id, data }) => {
  const [groupBy, setGroupBy] = React.useState(data?.groupBy || '');
  const [aggregateFunction, setAggregateFunction] = React.useState(data?.aggregateFunction || 'sum');
  const [field, setField] = React.useState(data?.field || '');

  return (
    <BaseCustomNode
      title="Aggregate"
      icon="📊"
      color="#059669"
      inputs={[
        { id: 'input', label: 'Data Input' }
      ]}
      outputs={[
        { id: 'output', label: 'Aggregated Data' }
      ]}
    >
      <div className="space-y-2">
        <div>
          <label className="block text-xs font-medium mb-1">Group By:</label>
          <input
            type="text"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="w-full px-2 py-1 text-xs border rounded"
            placeholder="category"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Function:</label>
          <select 
            value={aggregateFunction}
            onChange={(e) => setAggregateFunction(e.target.value)}
            className="w-full px-2 py-1 text-xs border rounded"
          >
            <option value="sum">Sum</option>
            <option value="count">Count</option>
            <option value="avg">Average</option>
            <option value="min">Minimum</option>
            <option value="max">Maximum</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Field:</label>
          <input
            type="text"
            value={field}
            onChange={(e) => setField(e.target.value)}
            className="w-full px-2 py-1 text-xs border rounded"
            placeholder="price"
          />
        </div>
      </div>
    </BaseCustomNode>
  );
};

// 8. Custom Node (NEW)
export const CustomNode = ({ id, data }) => {
  const [code, setCode] = React.useState(data?.code || '');
  const [language, setLanguage] = React.useState(data?.language || 'javascript');

  return (
    <BaseCustomNode
      title="Custom"
      icon="⚙️"
      color="#6b7280"
      inputs={[
        { id: 'input', label: 'Input Data' }
      ]}
      outputs={[
        { id: 'output', label: 'Output Data' }
      ]}
    >
      <div className="space-y-2">
        <div>
          <label className="block text-xs font-medium mb-1">Language:</label>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-2 py-1 text-xs border rounded"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="sql">SQL</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Code:</label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-2 py-1 text-xs border rounded h-20 resize-none font-mono"
            placeholder="// Enter your custom code here"
          />
        </div>
      </div>
    </BaseCustomNode>
  );
};

// Make sure all components have display names for debugging
FilterNode.displayName = 'FilterNode';
TransformNode.displayName = 'TransformNode';
MathNode.displayName = 'MathNode';
DocumentNode.displayName = 'DocumentNode';
DatabaseNode.displayName = 'DatabaseNode';
JoinNode.displayName = 'JoinNode';
AggregateNode.displayName = 'AggregateNode';
CustomNode.displayName = 'CustomNode';
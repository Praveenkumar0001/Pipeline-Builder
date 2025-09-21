import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Minimize2, 
  Maximize2, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  XCircle,
  Trash2,
  TrendingUp,
  Eye,
  EyeOff,
  Clock,
  Zap,
  Target,
  Link
} from 'lucide-react';
import useStore from '../../store/useStore';

const PipelineStatus = () => {
  const { nodes, edges, clearPipeline, validatePipeline } = useStore();
  const [isMinimized, setIsMinimized] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Calculate comprehensive pipeline statistics
  const pipelineStats = useMemo(() => {
    const validation = validatePipeline();
    const nodeTypes = {};
    nodes.forEach(node => {
      nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
    });

    // Categorize nodes
    const inputNodes = nodes.filter(node => 
      ['input', 'database', 'api', 'cloud', 'stream'].includes(node.type)
    );
    const outputNodes = nodes.filter(node => 
      ['output', 'visualization', 'notification'].includes(node.type)
    );
    const processingNodes = nodes.filter(node => 
      ['process', 'filter', 'transform', 'aggregate', 'join', 'ml', 'statistics'].includes(node.type)
    );
    const mediaNodes = nodes.filter(node => 
      ['image', 'video', 'audio'].includes(node.type)
    );

    // Calculate complexity score
    const complexityScore = nodes.length * 0.5 + edges.length * 0.3 + processingNodes.length * 0.2;
    let complexity = 'Simple';
    if (complexityScore >= 10) complexity = 'Complex';
    else if (complexityScore >= 5) complexity = 'Moderate';

    // Check connectivity
    const connectedNodes = new Set();
    edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });
    const isolatedNodes = nodes.filter(node => !connectedNodes.has(node.id));
    const connectivityRatio = nodes.length > 0 ? (connectedNodes.size / nodes.length) * 100 : 0;

    // Determine overall status
    let status = { text: 'Empty Pipeline', color: 'gray', icon: Plus, level: 0 };
    
    if (nodes.length > 0) {
      if (!validation.valid) {
        if (validation.issues.includes('Missing input nodes')) {
          status = { text: 'Needs Input Source', color: 'yellow', icon: AlertTriangle, level: 1 };
        } else if (validation.issues.includes('Missing output nodes')) {
          status = { text: 'Needs Output Target', color: 'yellow', icon: AlertTriangle, level: 1 };
        } else if (validation.issues.includes('No connections between nodes')) {
          status = { text: 'Nodes Not Connected', color: 'red', icon: XCircle, level: 2 };
        } else {
          status = { text: 'Has Issues', color: 'yellow', icon: AlertTriangle, level: 1 };
        }
      } else {
        if (processingNodes.length > 0 && edges.length >= nodes.length - 1) {
          status = { text: 'Optimal Pipeline', color: 'green', icon: TrendingUp, level: 4 };
        } else if (inputNodes.length > 0 && outputNodes.length > 0) {
          status = { text: 'Ready to Analyze', color: 'green', icon: CheckCircle, level: 3 };
        } else {
          status = { text: 'Basic Pipeline', color: 'blue', icon: Activity, level: 2 };
        }
      }
    }

    return {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      nodeTypes,
      inputNodes: inputNodes.length,
      outputNodes: outputNodes.length,
      processingNodes: processingNodes.length,
      mediaNodes: mediaNodes.length,
      complexity,
      complexityScore: complexityScore.toFixed(1),
      isolatedNodes: isolatedNodes.length,
      connectivityRatio: connectivityRatio.toFixed(0),
      status,
      validation,
      hasInput: inputNodes.length > 0,
      hasOutput: outputNodes.length > 0,
      hasProcessing: processingNodes.length > 0,
      isConnected: edges.length > 0 || nodes.length <= 1
    };
  }, [nodes, edges, validatePipeline]);

  const handleClearPipeline = () => {
    if (window.confirm('Are you sure you want to clear all nodes and connections? This action cannot be undone.')) {
      clearPipeline();
    }
  };

  // Minimized view
  if (isMinimized) {
    return (
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-3">
        <button
          onClick={() => setIsMinimized(false)}
          className={`flex items-center space-x-3 w-full group transition-all duration-300 hover:scale-105`}
          title={`Pipeline Status: ${pipelineStats.status.text}`}
        >
          <div className={`w-12 h-12 rounded-xl shadow-sm flex items-center justify-center transition-all ${
            pipelineStats.status.color === 'green' ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' :
            pipelineStats.status.color === 'yellow' ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white' :
            pipelineStats.status.color === 'red' ? 'bg-gradient-to-br from-red-500 to-pink-600 text-white' :
            pipelineStats.status.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' :
            'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
          }`}>
            <Activity className="w-5 h-5 group-hover:scale-110 transition-transform" />
            
            {/* Status indicator */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
              <pipelineStats.status.icon className={`w-2.5 h-2.5 ${
                pipelineStats.status.color === 'green' ? 'text-green-500' :
                pipelineStats.status.color === 'yellow' ? 'text-yellow-500' :
                pipelineStats.status.color === 'red' ? 'text-red-500' :
                pipelineStats.status.color === 'blue' ? 'text-blue-500' : 'text-gray-400'
              }`} />
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="font-medium text-gray-700">{pipelineStats.totalNodes}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium text-gray-700">{pipelineStats.totalEdges}</span>
            </div>
            <Maximize2 className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          </div>
        </button>
      </div>
    );
  }

  // Expanded view
  return (
    <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg overflow-hidden max-w-md">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          {/* Status Icon and Title */}
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all relative ${
              pipelineStats.status.color === 'green' ? 'bg-green-100 text-green-600' :
              pipelineStats.status.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
              pipelineStats.status.color === 'red' ? 'bg-red-100 text-red-600' :
              pipelineStats.status.color === 'blue' ? 'bg-blue-100 text-blue-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              <pipelineStats.status.icon className="w-6 h-6" />
              
              {/* Activity indicator */}
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse ${
                pipelineStats.status.color === 'green' ? 'bg-green-400' :
                pipelineStats.status.color === 'yellow' ? 'bg-yellow-400' :
                pipelineStats.status.color === 'red' ? 'bg-red-400' :
                pipelineStats.status.color === 'blue' ? 'bg-blue-400' :
                'bg-gray-300'
              }`}></div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                Pipeline Status
                <div className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
                  pipelineStats.status.level >= 4 ? 'bg-green-100 text-green-700' :
                  pipelineStats.status.level >= 3 ? 'bg-blue-100 text-blue-700' :
                  pipelineStats.status.level >= 2 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  Level {pipelineStats.status.level}
                </div>
              </h2>
              <p className="text-sm text-gray-500">Real-time monitoring & analysis</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {pipelineStats.totalNodes > 0 && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                title={`${showDetails ? 'Hide' : 'Show'} details`}
              >
                {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
            
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="Minimize status panel"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pipeline Statistics */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-xl font-bold text-blue-600">{pipelineStats.totalNodes}</div>
            <div className="text-xs text-blue-600 font-medium">Nodes</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
            <div className="text-xl font-bold text-green-600">{pipelineStats.totalEdges}</div>
            <div className="text-xs text-green-600 font-medium">Edges</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100">
            <div className="text-sm font-bold text-purple-600">{pipelineStats.complexity}</div>
            <div className="text-xs text-purple-600 font-medium">Level</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-100">
            <div className="text-sm font-bold text-orange-600">{pipelineStats.connectivityRatio}%</div>
            <div className="text-xs text-orange-600 font-medium">Connected</div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className={`p-4 rounded-lg border ${
          pipelineStats.status.color === 'green' ? 'bg-green-50 border-green-200' :
          pipelineStats.status.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
          pipelineStats.status.color === 'red' ? 'bg-red-50 border-red-200' :
          pipelineStats.status.color === 'blue' ? 'bg-blue-50 border-blue-200' :
          'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full animate-pulse ${
                pipelineStats.status.color === 'green' ? 'bg-green-400' :
                pipelineStats.status.color === 'yellow' ? 'bg-yellow-400' :
                pipelineStats.status.color === 'red' ? 'bg-red-400' :
                pipelineStats.status.color === 'blue' ? 'bg-blue-400' :
                'bg-gray-400'
              }`}></div>
              <span className={`font-medium ${
                pipelineStats.status.color === 'green' ? 'text-green-700' :
                pipelineStats.status.color === 'yellow' ? 'text-yellow-700' :
                pipelineStats.status.color === 'red' ? 'text-red-700' :
                pipelineStats.status.color === 'blue' ? 'text-blue-700' :
                'text-gray-700'
              }`}>
                {pipelineStats.status.text}
              </span>
            </div>
            
            {pipelineStats.totalNodes > 0 && (
              <button
                onClick={handleClearPipeline}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors flex items-center space-x-1"
                title="Clear pipeline"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Component Health Indicators */}
        <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
          <div className="flex flex-col items-center space-y-1">
            <div className={`w-3 h-3 rounded-full ${pipelineStats.hasInput ? 'bg-green-400' : 'bg-gray-300'}`}></div>
            <span className="text-gray-600 text-center">Input<br/>({pipelineStats.inputNodes})</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <div className={`w-3 h-3 rounded-full ${pipelineStats.hasProcessing ? 'bg-blue-400' : 'bg-gray-300'}`}></div>
            <span className="text-gray-600 text-center">Process<br/>({pipelineStats.processingNodes})</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <div className={`w-3 h-3 rounded-full ${pipelineStats.hasOutput ? 'bg-green-400' : 'bg-gray-300'}`}></div>
            <span className="text-gray-600 text-center">Output<br/>({pipelineStats.outputNodes})</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <div className={`w-3 h-3 rounded-full ${pipelineStats.isConnected ? 'bg-purple-400' : 'bg-gray-300'}`}></div>
            <span className="text-gray-600 text-center">Connected<br/>({pipelineStats.totalEdges})</span>
          </div>
        </div>

        {/* Detailed Status Messages - Collapsible */}
        {showDetails && pipelineStats.totalNodes > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-600 space-y-3">
              {/* Issues */}
              {pipelineStats.validation.issues.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
                    Issues ({pipelineStats.validation.issues.length})
                  </h4>
                  <div className="space-y-1">
                    {pipelineStats.validation.issues.map((issue, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-yellow-50 rounded text-yellow-700">
                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full flex-shrink-0"></span>
                        <span className="text-xs">{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Node Distribution */}
              {Object.keys(pipelineStats.nodeTypes).length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                    <Target className="w-4 h-4 text-blue-500 mr-2" />
                    Node Distribution
                  </h4>
                  <div className="grid grid-cols-2 gap-1">
                    {Object.entries(pipelineStats.nodeTypes).map(([type, count]) => (
                      <div key={type} className="flex justify-between text-xs p-1 bg-gray-50 rounded">
                        <span className="capitalize">{type}:</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Connectivity Info */}
              <div>
                <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                  <Link className="w-4 h-4 text-purple-500 mr-2" />
                  Connectivity
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Connectivity Ratio:</span>
                    <span className="font-medium">{pipelineStats.connectivityRatio}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Isolated Nodes:</span>
                    <span className="font-medium">{pipelineStats.isolatedNodes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Complexity Score:</span>
                    <span className="font-medium">{pipelineStats.complexityScore}</span>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {pipelineStats.status.level < 4 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                    <Zap className="w-4 h-4 text-green-500 mr-2" />
                    Quick Tips
                  </h4>
                  <div className="space-y-1 text-xs text-gray-600">
                    {!pipelineStats.hasInput && (
                      <div className="p-2 bg-blue-50 rounded text-blue-700">
                        Add input nodes (File, API, Database) to define data sources
                      </div>
                    )}
                    {!pipelineStats.hasOutput && (
                      <div className="p-2 bg-blue-50 rounded text-blue-700">
                        Add output nodes to define data destinations
                      </div>
                    )}
                    {!pipelineStats.hasProcessing && pipelineStats.totalNodes > 2 && (
                      <div className="p-2 bg-blue-50 rounded text-blue-700">
                        Add processing nodes for data transformation
                      </div>
                    )}
                    {pipelineStats.isolatedNodes > 0 && (
                      <div className="p-2 bg-blue-50 rounded text-blue-700">
                        Connect isolated nodes to create data flow
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Success Message */}
              {pipelineStats.status.level >= 4 && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-green-700 text-sm font-medium">
                      Excellent! Your pipeline is optimally structured and ready for analysis.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PipelineStatus;
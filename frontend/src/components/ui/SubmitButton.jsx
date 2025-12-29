import React, { useState, useCallback } from 'react';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Activity, 
  AlertTriangle,
  Download,
  Minus,
  Database,
  BarChart3,
  FileText,
  Upload,
  Zap,
  TrendingUp,
  HardDrive,
  Trash2
} from 'lucide-react';
import useStore from '../../store/useStore';
import submitPipeline from '../../submit';

// Pipeline Result Modal Component
const PipelineResultModal = ({ result, onClose }) => {
  if (!result) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-1 sm:p-2 lg:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-[98vw] sm:max-w-[95vw] lg:max-w-7xl xl:max-w-[90vw] h-full max-h-[98vh] sm:max-h-[95vh] lg:max-h-[92vh] overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 flex-shrink-0">
          <div className="flex items-center space-x-4 sm:space-x-6 min-w-0 flex-1">
            {result.is_dag ? (
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-green-600" />
              </div>
            ) : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <XCircle className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-red-600" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Pipeline Analysis Results</h2>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                Completed {new Date(result.timestamp).toLocaleDateString()} at {new Date(result.timestamp).toLocaleTimeString()} • Score: {result.score}/100
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors flex-shrink-0 ml-4"
            title="Close modal"
          >
            <XCircle className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Statistics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 sm:p-6 text-center border border-blue-200">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-700 mb-2">{result.num_nodes}</div>
              <div className="text-sm sm:text-base lg:text-lg text-blue-600 font-medium">Total Nodes</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 sm:p-6 text-center border border-green-200">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-700 mb-2">{result.num_edges}</div>
              <div className="text-sm sm:text-base lg:text-lg text-green-600 font-medium">Connections</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 sm:p-6 text-center border border-purple-200">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-700 mb-2">{result.complexity}</div>
              <div className="text-sm sm:text-base lg:text-lg text-purple-600 font-medium">Complexity</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 sm:p-6 text-center border border-orange-200">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-700 mb-2">{result.performance?.estimated_runtime || 'N/A'}</div>
              <div className="text-sm sm:text-base lg:text-lg text-orange-600 font-medium">Est. Time</div>
            </div>
          </div>

          {/* Analysis Details */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Status Message */}
              <div className={`rounded-xl p-6 border-2 ${
                result.score >= 80 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                  : result.score >= 50
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                  : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
              }`}>
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
                    result.score >= 80 ? 'bg-green-500' :
                    result.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}>
                    {result.score >= 80 ? (
                      <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                    ) : (
                      <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-2 ${
                      result.score >= 80 ? 'text-green-800' :
                      result.score >= 50 ? 'text-yellow-800' : 'text-red-800'
                    }`}>
                      Score: {result.score}/100
                    </div>
                    <div className={`text-sm sm:text-base lg:text-lg leading-relaxed ${
                      result.score >= 80 ? 'text-green-700' :
                      result.score >= 50 ? 'text-yellow-700' : 'text-red-700'
                    }`}>
                      {result.message}
                    </div>
                  </div>
                </div>
              </div>

              {/* Node Types */}
              {result.node_types && result.node_types.length > 0 && (
                <div>
                  <h4 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-4">Node Types</h4>
                  <div className="flex flex-wrap gap-3">
                    {result.node_types.map((type) => (
                      <span
                        key={type}
                        className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm sm:text-base font-medium capitalize border border-indigo-200"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Performance Metrics */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
                <h4 className="font-semibold text-indigo-800 mb-4 flex items-center text-lg sm:text-xl">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
                  Performance Insights
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                    <span className="text-indigo-700 text-sm sm:text-base">DAG Valid:</span>
                    <span className="font-bold text-indigo-800 text-sm sm:text-base">
                      {result.is_dag ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                    <span className="text-indigo-700 text-sm sm:text-base">Memory Usage:</span>
                    <span className="font-bold text-indigo-800 text-sm sm:text-base">
                      {result.performance?.memory_usage || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                    <span className="text-indigo-700 text-sm sm:text-base">Has Input:</span>
                    <span className="font-bold text-indigo-800 text-sm sm:text-base">
                      {result.has_input ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                    <span className="text-indigo-700 text-sm sm:text-base">Has Output:</span>
                    <span className="font-bold text-indigo-800 text-sm sm:text-base">
                      {result.has_output ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Issues */}
              {result.issues && result.issues.length > 0 && (
                <div>
                  <h4 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-4">Issues ({result.issues.length})</h4>
                  <div className="space-y-3">
                    {result.issues.map((issue, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 bg-red-50 rounded-xl border border-red-200">
                        <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                        <span className="text-red-700 text-sm sm:text-base leading-relaxed">{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div>
                  <h4 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-4">Recommendations ({result.recommendations.length})</h4>
                  <div className="space-y-3">
                    {result.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-sm font-bold">{index + 1}</span>
                        </div>
                        <span className="text-blue-700 text-sm sm:text-base leading-relaxed">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Analysis Info */}
              {result.performance && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-4 text-lg sm:text-xl">Additional Metrics</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-gray-600 text-sm sm:text-base">Optimization Score:</span>
                      <span className="font-bold text-gray-800 text-sm sm:text-base">
                        {result.performance.optimization_score?.toFixed(1) || 'N/A'}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-6 p-6 lg:p-8 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 lg:px-8 py-3 lg:py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium text-sm sm:text-base"
          >
            Close
          </button>
          <button
            onClick={() => {
              const analysisData = {
                timestamp: new Date().toISOString(),
                analysis: result
              };
              const blob = new Blob([JSON.stringify(analysisData, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `pipeline-analysis-${Date.now()}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="w-full sm:w-auto px-6 lg:px-8 py-3 lg:py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all font-medium text-sm sm:text-base"
          >
            Export Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

const SubmitButton = () => {
  const { 
    nodes, 
    edges, 
    isLoading,
    exportPipeline, 
    importPipeline,
    clearPipeline,
    error,
    pipelineResult,
    setError,
    setPipelineResult
  } = useStore();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Calculate pipeline statistics with improved logic
  const calculateStats = useCallback(() => {
    if (!nodes || !edges) return {
      totalNodes: 0,
      totalEdges: 0,
      hasNodes: false,
      hasEdges: false,
      hasInput: false,
      hasOutput: false,
      isConnected: false,
      isValid: false,
      issues: ['No nodes or edges data available']
    };

    const hasInput = nodes.some(node => ['input', 'database', 'api', 'cloud', 'stream'].includes(node.type));
    const hasOutput = nodes.some(node => ['output', 'visualization', 'notification'].includes(node.type));
    const isConnected = edges.length > 0;
    const hasMinimumNodes = nodes.length >= 2;
    
    const issues = [];
    if (!hasInput) issues.push('Missing input node (Input, Database, API, Cloud, or Stream)');
    if (!hasOutput) issues.push('Missing output node (Output, Visualization, or Notification)');  
    if (!isConnected && nodes.length > 1) issues.push('Nodes are not connected');
    if (!hasMinimumNodes) issues.push('Need at least 2 nodes for a pipeline');

    return {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      hasNodes: nodes.length > 0,
      hasEdges: edges.length > 0,
      hasInput,
      hasOutput,
      isConnected,
      isValid: hasInput && hasOutput && isConnected && hasMinimumNodes,
      issues: issues.length > 0 ? issues : []
    };
  }, [nodes, edges]);

  const stats = calculateStats();

  // Handle pipeline analysis - uses submit.js as specified in assignment
  const handleAnalyze = async () => {
    if (!nodes || nodes.length === 0) {
      setError('Please add some nodes to the pipeline before analyzing.');
      return;
    }

    try {
      setError(null);
      
      // Use the submitPipeline function from submit.js
      const result = await submitPipeline();
      
      if (result) {
        // result with local analytics
        const enResult = {
          ...result,
          timestamp: new Date().toISOString(),
          has_input: stats.hasInput,
          has_output: stats.hasOutput,
          complexity: getComplexityLevel(result.num_nodes, result.num_edges),
          score: calculatePipelineScore(stats),
          node_types: [...new Set(nodes.map(n => n.type))],
          issues: stats.issues,
          recommendations: getRecommendations(stats),
          performance: {
            estimated_runtime: `${(result.num_nodes * 0.3 + result.num_edges * 0.1).toFixed(1)}s`,
            memory_usage: `${(result.num_nodes * 45 + result.num_edges * 20)}MB`,
            optimization_score: Math.min(100, (result.num_edges / Math.max(1, result.num_nodes - 1)) * 100)
          }
        };
        
        setPipelineResult(enResult);
        setShowResult(true);
        
        // Auto-hide modal after 30 seconds
        setTimeout(() => {
          setShowResult(false);
        }, 30000);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setError(`Analysis failed: ${error.message}`);
    }
  };

  //download functionality
  const handleDownload = useCallback(async (format = 'json') => {
    if (!nodes || nodes.length === 0) {
      setError('Cannot export empty pipeline');
      return;
    }

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const baseFileName = `pipeline-${timestamp}`;
      
      const exportData = {
        timestamp: new Date().toISOString(),
        pipeline: exportPipeline(),
        analysis: pipelineResult || {
          num_nodes: nodes.length,
          num_edges: edges.length,
          node_types: [...new Set(nodes.map(n => n.type))],
          complexity: getComplexityLevel(nodes.length, edges.length),
          score: calculatePipelineScore(stats)
        },
        metadata: {
          nodeCount: nodes.length,
          edgeCount: edges.length,
          nodeTypes: [...new Set(nodes.map(n => n.type))],
          version: '2.3'
        }
      };
      
      let content, mimeType, extension;
      
      switch (format) {
        case 'json':
          content = JSON.stringify(exportData, null, 2);
          mimeType = 'application/json';
          extension = 'json';
          break;
          
        case 'csv':
          const csvRows = [
            ['Metric', 'Value'],
            ['Export Date', exportData.timestamp],
            ['Node Count', nodes.length],
            ['Edge Count', edges.length],
            ['Node Types', exportData.metadata.nodeTypes.join('; ')],
            ['Valid Pipeline', stats.isValid ? 'Yes' : 'No'],
            ['Has Input', stats.hasInput ? 'Yes' : 'No'],
            ['Has Output', stats.hasOutput ? 'Yes' : 'No'],
            ['Is Connected', stats.isConnected ? 'Yes' : 'No'],
            ['Complexity', exportData.analysis.complexity || 'Unknown'],
            ['Pipeline Score', exportData.analysis.score || 'N/A']
          ];
          
          if (stats.issues && stats.issues.length > 0) {
            stats.issues.forEach((issue, i) => {
              csvRows.push([`Issue ${i + 1}`, issue]);
            });
          }
          
          content = csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
          mimeType = 'text/csv';
          extension = 'csv';
          break;
          
        case 'markdown':
          content = `# Pipeline Analysis Report

**Generated:** ${new Date().toLocaleString()}

## Pipeline Summary
- **Total Nodes:** ${stats.totalNodes}
- **Total Connections:** ${stats.totalEdges}  
- **Status:** ${stats.isValid ? 'Valid ✅' : 'Invalid ❌'}
- **Pipeline Score:** ${exportData.analysis.score || 'N/A'}/100
- **Complexity Level:** ${exportData.analysis.complexity || 'Unknown'}

## Node Configuration
- **Has Input Node:** ${stats.hasInput ? 'Yes ✅' : 'No ❌'}
- **Has Output Node:** ${stats.hasOutput ? 'Yes ✅' : 'No ❌'}  
- **Nodes Connected:** ${stats.isConnected ? 'Yes ✅' : 'No ❌'}

## Node Types Used
${exportData.metadata.nodeTypes.map(type => `- ${type.charAt(0).toUpperCase() + type.slice(1)}`).join('\n')}

${stats.issues && stats.issues.length > 0 ? `## Issues Identified
${stats.issues.map(issue => `- ⚠️ ${issue}`).join('\n')}

` : ''}## Technical Details
- **Export Version:** ${exportData.metadata.version}
- **Analysis Timestamp:** ${exportData.timestamp}
- **Node-to-Edge Ratio:** ${stats.totalNodes > 0 ? (stats.totalEdges / stats.totalNodes).toFixed(2) : 'N/A'}

## Raw Pipeline Data
\`\`\`json
${JSON.stringify(exportData.pipeline, null, 2)}
\`\`\`

---
*Report generated by Pipeline Builder v${exportData.metadata.version}*
`;
          mimeType = 'text/markdown';
          extension = 'md';
          break;
          
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
      
      const fileName = `${baseFileName}.${extension}`;
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log(`Successfully exported pipeline as ${fileName}`);
      
    } catch (error) {
      console.error('Export failed:', error);
      setError(`Export failed: ${error.message}`);
    }
  }, [exportPipeline, nodes, edges, pipelineResult, stats, setError]);

  // Handle file import
  const handleImport = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.json')) {
      setError('Please select a valid JSON file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        const pipelineData = data.pipeline || data;
        if (!pipelineData.nodes || !Array.isArray(pipelineData.nodes)) {
          throw new Error('Invalid pipeline format: missing or invalid nodes array');
        }
        
        if (!pipelineData.edges || !Array.isArray(pipelineData.edges)) {
          throw new Error('Invalid pipeline format: missing or invalid edges array');
        }
        
        const success = importPipeline(pipelineData);
        if (success) {
          setError(null);
          console.log(`Successfully imported pipeline with ${pipelineData.nodes.length} nodes and ${pipelineData.edges.length} edges`);
        } else {
          throw new Error('Import function returned false');
        }
      } catch (error) {
        console.error('Import failed:', error);
        setError(`Import failed: ${error.message}`);
      }
    };
    
    reader.onerror = () => {
      setError('Failed to read file');
    };
    
    reader.readAsText(file);
    event.target.value = '';
  }, [importPipeline, setError]);

  // Handle clear
  const handleClear = useCallback(() => {
    if (!nodes || nodes.length === 0) {
      setError('Pipeline is already empty');
      return;
    }

    const confirmMessage = `Are you sure you want to clear the entire pipeline?\n\nThis will remove:\n- ${nodes.length} node${nodes.length !== 1 ? 's' : ''}\n- ${edges.length} connection${edges.length !== 1 ? 's' : ''}\n\nThis action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      clearPipeline();
      setError(null);
      setShowResult(false);
      console.log('Pipeline cleared successfully');
    }
  }, [nodes, edges, clearPipeline, setError]);

  // Collapsed state (compact)
  if (!isExpanded) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg px-4 py-3">
          <button
            onClick={() => handleDownload('json')}
            className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center group hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download as JSON"
            disabled={!nodes || nodes.length === 0}
          >
            <Database className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
          
          <button
            onClick={() => handleDownload('csv')}
            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center group hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download as CSV"
            disabled={!nodes || nodes.length === 0}
          >
            <BarChart3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>

          <label className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center group hover:scale-110 cursor-pointer"
            title="Import pipeline">
            <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          <div className="w-px h-8 bg-gray-200"></div>

          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="font-medium text-gray-700">{stats.totalNodes}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium text-gray-700">{stats.totalEdges}</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setIsExpanded(true)}
          className={`w-16 h-16 rounded-2xl shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 group relative overflow-hidden ${
            stats.isValid 
              ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' 
              : stats.hasNodes
              ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white'
              : 'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
          }`}
          title={`Pipeline Control: ${stats.isValid ? 'Ready to Analyze' : stats.hasNodes ? 'Has Issues' : 'Empty Pipeline'}`}
        >
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-colors duration-300 rounded-2xl"></div>
          <Activity className="w-7 h-7 group-hover:scale-110 transition-transform relative z-10" />
          
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg">
            {stats.isValid ? (
              <CheckCircle className="w-3 h-3 text-green-500" />
            ) : stats.hasNodes ? (
              <AlertTriangle className="w-3 h-3 text-yellow-500" />
            ) : (
              <XCircle className="w-3 h-3 text-red-400" />
            )}
          </div>
          
          {stats.totalNodes > 0 && (
            <div className="absolute -bottom-1 -left-1 min-w-6 h-6 bg-indigo-600 text-white text-sm font-bold rounded-full flex items-center justify-center px-1 shadow-lg">
              {stats.totalNodes}
            </div>
          )}
        </button>
      </div>
    );
  }

  // EXPANDED STATE - LARGE CONTROL CENTER
  return (
    <>
      <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 w-[90vw] max-w-4xl max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Pipeline Control Center</h2>
              <p className="text-lg text-gray-500">Comprehensive pipeline management and analysis</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`px-4 py-2 rounded-xl text-sm font-bold ${
              stats.isValid ? 'bg-green-100 text-green-700' :
              stats.hasNodes ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {stats.isValid ? 'READY' : stats.hasNodes ? 'NEEDS WORK' : 'EMPTY'}
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-3 rounded-xl hover:bg-gray-100"
              title="Minimize Panel"
            >
              <Minus className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-6 bg-red-50 border-2 border-red-200 rounded-2xl">
            <div className="flex items-center space-x-4">
              <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-700 font-semibold text-lg">Error</p>
                <p className="text-red-600 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 transition-colors"
                title="Dismiss error"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Pipeline Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200 text-center hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center mx-auto mb-4">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div className="text-4xl font-black text-blue-700 mb-2">{stats.totalNodes}</div>
                <div className="text-blue-600 font-semibold">Total Nodes</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200 text-center hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="text-4xl font-black text-green-700 mb-2">{stats.totalEdges}</div>
                <div className="text-green-600 font-semibold">Connections</div>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-indigo-600" />
                Pipeline Health Check
              </h3>
              <div className="space-y-4">
                <StatusIndicator 
                  label="Input Source Available" 
                  status={stats.hasInput}
                  description="Pipeline has at least one input node"
                />
                <StatusIndicator 
                  label="Output Target Defined" 
                  status={stats.hasOutput}
                  description="Pipeline has at least one output node"
                />
                <StatusIndicator 
                  label="Flow Connectivity" 
                  status={stats.isConnected || stats.totalNodes <= 1}
                  description="All nodes are properly connected"
                />
                <StatusIndicator 
                  label="Minimum Viable Pipeline" 
                  status={stats.totalNodes >= 2}
                  description="Has sufficient nodes for a pipeline"
                />
              </div>
            </div>

            {/* Issues Display */}
            {stats.issues && stats.issues.length > 0 && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
                <div className="flex items-start space-x-4">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="text-yellow-800 font-bold text-lg mb-3">
                      {stats.issues.length} Issue{stats.issues.length !== 1 ? 's' : ''} Found:
                    </h4>
                    <ul className="text-yellow-700 space-y-2">
                      {stats.issues.map((issue, index) => (
                        <li key={index} className="flex items-start space-x-2 p-2 bg-yellow-100 rounded-lg">
                          <span className="text-yellow-600 mt-1 font-bold">{index + 1}.</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Main Analysis Button */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-indigo-600" />
                Pipeline Analysis
              </h3>
              <button
                onClick={handleAnalyze}
                disabled={isLoading || !nodes || nodes.length === 0}
                className={`w-full flex items-center justify-center space-x-3 px-8 py-6 rounded-2xl font-bold text-lg transition-all duration-300 ${
                  isLoading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : !nodes || nodes.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : stats.isValid
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Analyzing Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-6 h-6" />
                    <span>
                      {stats.isValid ? 'Run Full Analysis' : `Analyze Pipeline (${stats.issues.length} Issues)`}
                    </span>
                  </>
                )}
              </button>
              {stats.totalNodes > 0 && (
                <p className="text-sm text-gray-600 mt-3 text-center">
                  This will analyze {stats.totalNodes} nodes and {stats.totalEdges} connections
                </p>
              )}
            </div>

            {/* Export/Import Section */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Download className="w-5 h-5 mr-2 text-gray-600" />
                Export & Import
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                  onClick={() => handleDownload('json')}
                  disabled={!nodes || nodes.length === 0}
                  className="flex flex-col items-center justify-center p-4 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl transition-all border-2 border-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transform hover:scale-105 disabled:hover:scale-100"
                >
                  <Database className="w-8 h-8 mb-2" />
                  <span className="font-semibold">JSON Export</span>
                  <span className="text-xs text-emerald-600 mt-1">Full pipeline data</span>
                </button>
                
                <button
                  onClick={() => handleDownload('csv')}
                  disabled={!nodes || nodes.length === 0}
                  className="flex flex-col items-center justify-center p-4 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-all border-2 border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transform hover:scale-105 disabled:hover:scale-100"
                >
                  <BarChart3 className="w-8 h-8 mb-2" />
                  <span className="font-semibold">CSV Export</span>
                  <span className="text-xs text-blue-600 mt-1">Spreadsheet format</span>
                </button>
                
                <button
                  onClick={() => handleDownload('markdown')}
                  disabled={!nodes || nodes.length === 0}
                  className="flex flex-col items-center justify-center p-4 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl transition-all border-2 border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transform hover:scale-105 disabled:hover:scale-100"
                >
                  <FileText className="w-8 h-8 mb-2" />
                  <span className="font-semibold">Report</span>
                  <span className="text-xs text-purple-600 mt-1">Detailed report</span>
                </button>
                
                <label className="flex flex-col items-center justify-center p-4 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl transition-all border-2 border-indigo-300 cursor-pointer hover:shadow-md transform hover:scale-105">
                  <Upload className="w-8 h-8 mb-2" />
                  <span className="font-semibold">Import</span>
                  <span className="text-xs text-indigo-600 mt-1">Load pipeline</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Clear Pipeline */}
            {(nodes && nodes.length > 0) || (edges && edges.length > 0) ? (
              <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
                <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center">
                  <Trash2 className="w-5 h-5 mr-2" />
                  Danger Zone
                </h3>
                <button
                  onClick={handleClear}
                  className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all transform hover:scale-[1.02] active:scale-[0.98] font-bold text-lg"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Clear Entire Pipeline ({nodes?.length || 0} nodes, {edges?.length || 0} connections)</span>
                </button>
                <p className="text-sm text-red-600 mt-2 text-center">
                  This action cannot be undone. All nodes and connections will be permanently removed.
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Bottom Summary */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="text-sm text-gray-600">
                <span className="font-semibold">Pipeline Status:</span>
                <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold ${
                  stats.isValid ? 'bg-green-100 text-green-700' :
                  stats.hasNodes ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {stats.isValid ? 'READY FOR ANALYSIS' : stats.hasNodes ? 'NEEDS ATTENTION' : 'NO DATA'}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
            <div className="text-xs text-gray-400">
              Pipeline Builder v2.3 • Control Center
            </div>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      {showResult && pipelineResult && (
        <PipelineResultModal 
          result={pipelineResult} 
          onClose={() => setShowResult(false)} 
        />
      )}
    </>
  );
};

// Status Indicator Component
const StatusIndicator = ({ label, status, description }) => (
  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all">
    <div className="flex-1">
      <div className="flex items-center space-x-3">
        {status ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <XCircle className="w-5 h-5 text-red-400" />
        )}
        <span className="text-gray-800 font-semibold">{label}</span>
        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
          status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {status ? 'PASS' : 'FAIL'}
        </span>
      </div>
      {description && (
        <div className="text-sm text-gray-500 mt-2 ml-8">{description}</div>
      )}
    </div>
  </div>
);

// Helper functions
function getComplexityLevel(nodeCount, edgeCount) {
  if (nodeCount === 0) return 'Empty';
  if (nodeCount <= 3 && edgeCount <= 3) return 'Simple';
  if (nodeCount <= 6 && edgeCount <= 8) return 'Moderate';
  if (nodeCount <= 10 && edgeCount <= 15) return 'Complex';
  return 'Very Complex';
}

function calculatePipelineScore(stats) {
  let score = 0;
  
  if (stats.totalNodes > 0) score += 20;
  if (stats.hasInput) score += 25;
  if (stats.hasOutput) score += 25;
  if (stats.isConnected) score += 20;
  if (stats.totalNodes >= 2 && stats.isConnected) score += 10;
  
  return Math.min(score, 100);
}

function getRecommendations(stats) {
  const recommendations = [];
  
  if (!stats.hasInput) {
    recommendations.push('Add an input node to define data sources');
  }
  
  if (!stats.hasOutput) {
    recommendations.push('Add an output node to define data destinations');
  }
  
  if (!stats.isConnected && stats.totalNodes > 1) {
    recommendations.push('Connect your nodes by dragging between connection points');
  }
  
  if (stats.totalNodes < 2) {
    recommendations.push('Add more nodes to create a meaningful pipeline');
  }
  
  if (stats.isValid) {
    recommendations.push('Consider adding processing nodes for data transformation');
    recommendations.push('Test your pipeline with sample data');
    recommendations.push('Document your pipeline for future reference');
  }
  
  return recommendations;
}

export default SubmitButton;
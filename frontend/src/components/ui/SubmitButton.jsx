import React, { useState, useCallback } from 'react';
import { 
  Play, 
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
  Clock,
  HardDrive,
  Trash2
} from 'lucide-react';
import useStore from '../../store/useStore';

const SubmitButton = () => {
  const { 
    nodes, 
    edges, 
    isLoading, 
    analyzePipeline,
    exportPipeline, 
    importPipeline,
    clearPipeline,
    error,
    pipelineResult,
    setError,
    validatePipeline
  } = useStore();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Calculate pipeline statistics
  const calculateStats = useCallback(() => {
    const validation = validatePipeline();
    return {
      ...validation.stats,
      totalNodes: nodes.length,
      totalEdges: edges.length,
      hasNodes: nodes.length > 0,
      hasEdges: edges.length > 0,
      isValid: validation.valid,
      issues: validation.issues
    };
  }, [nodes, edges, validatePipeline]);

  const stats = calculateStats();

  // Handle pipeline analysis
  const handleAnalyze = async () => {
    if (nodes.length === 0) {
      setError('Please add some nodes to the pipeline before analyzing.');
      return;
    }

    const success = await analyzePipeline();
    if (success && !showResult) {
      setShowResult(true);
      // Auto-hide result after 15 seconds
      setTimeout(() => {
        setShowResult(false);
      }, 15000);
    }
  };

  // Enhanced download functionality
  const handleDownload = useCallback(async (format = 'json') => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const baseFileName = `pipeline-${timestamp}`;
      
      let exportData = {
        timestamp: new Date().toISOString(),
        pipeline: exportPipeline(),
        analysis: pipelineResult,
        metadata: {
          nodeCount: nodes.length,
          edgeCount: edges.length,
          nodeTypes: [...new Set(nodes.map(n => n.type))],
          version: '2.1'
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
            ['Timestamp', exportData.timestamp],
            ['Node Count', exportData.pipeline.nodes.length],
            ['Edge Count', exportData.pipeline.edges.length],
            ['Node Types', exportData.metadata.nodeTypes.join(', ')],
            ['Valid Pipeline', stats.isValid ? 'Yes' : 'No'],
            ['Complexity', pipelineResult?.complexity || 'Unknown'],
            ['Score', pipelineResult?.score || 'N/A'],
            ...((pipelineResult?.recommendations || []).map((rec, i) => [`Recommendation ${i + 1}`, rec]))
          ];
          content = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
          mimeType = 'text/csv';
          extension = 'csv';
          break;
          
        case 'markdown':
          content = `# Pipeline Analysis Report

Generated: ${new Date().toLocaleString()}

## Pipeline Summary
- **Nodes**: ${stats.totalNodes}
- **Connections**: ${stats.totalEdges}  
- **Status**: ${stats.isValid ? 'Valid ✅' : 'Invalid ❌'}
- **Complexity**: ${pipelineResult?.complexity || 'Unknown'}
- **Score**: ${pipelineResult?.score || 'N/A'}/100

## Node Types
${exportData.metadata.nodeTypes.map(type => `- ${type}`).join('\n')}

${pipelineResult?.issues?.length ? `## Issues Found
${pipelineResult.issues.map(issue => `- ⚠️ ${issue}`).join('\n')}

` : ''}${pipelineResult?.recommendations?.length ? `## Recommendations
${pipelineResult.recommendations.map(rec => `- 💡 ${rec}`).join('\n')}

` : ''}## Pipeline Configuration
\`\`\`json
${JSON.stringify(exportData.pipeline, null, 2)}
\`\`\`
`;
          mimeType = 'text/markdown';
          extension = 'md';
          break;
          
        default:
          throw new Error('Unsupported format');
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
      
    } catch (error) {
      console.error('Download failed:', error);
      setError(`Download failed: ${error.message}`);
    }
  }, [exportPipeline, nodes, edges, pipelineResult, stats, setError]);

  // Handle file import
  const handleImport = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const success = importPipeline(data.pipeline || data);
        if (success) {
          console.log('Pipeline imported successfully');
        }
      } catch (error) {
        setError('Failed to import pipeline: Invalid file format');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  }, [importPipeline, setError]);

  // Handle clear with confirmation
  const handleClear = useCallback(() => {
    if (nodes.length > 0 || edges.length > 0) {
      if (window.confirm('Are you sure you want to clear the entire pipeline? This action cannot be undone.')) {
        clearPipeline();
      }
    }
  }, [nodes.length, edges.length, clearPipeline]);

  // Collapsed state
  if (!isExpanded) {
    return (
      <div className="flex items-center space-x-3">
        {/* Quick Actions */}
        <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg px-4 py-3">
          {/* Download buttons */}
          <button
            onClick={() => handleDownload('json')}
            className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center group hover:scale-110"
            title="Download as JSON"
            disabled={nodes.length === 0}
          >
            <Database className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
          
          <button
            onClick={() => handleDownload('csv')}
            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center group hover:scale-110"
            title="Download as CSV"
            disabled={nodes.length === 0}
          >
            <BarChart3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>

          {/* Import button */}
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

          {/* Pipeline stats */}
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
        
        {/* Main control button */}
        <button
          onClick={() => setIsExpanded(true)}
          className={`w-16 h-16 rounded-2xl shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 group relative overflow-hidden ${
            stats.isValid 
              ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' 
              : stats.hasNodes
              ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white'
              : 'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
          }`}
          title={`Pipeline Control: ${stats.isValid ? 'Ready' : stats.hasNodes ? 'Needs Work' : 'Empty'}`}
        >
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-colors duration-300 rounded-2xl"></div>
          <Activity className="w-7 h-7 group-hover:scale-110 transition-transform relative z-10" />
          
          {/* Status indicator */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg">
            {stats.isValid ? (
              <CheckCircle className="w-3 h-3 text-green-500" />
            ) : stats.hasNodes ? (
              <AlertTriangle className="w-3 h-3 text-yellow-500" />
            ) : (
              <XCircle className="w-3 h-3 text-red-400" />
            )}
          </div>
          
          {/* Node count badge */}
          {stats.totalNodes > 0 && (
            <div className="absolute -bottom-1 -left-1 min-w-6 h-6 bg-indigo-600 text-white text-sm font-bold rounded-full flex items-center justify-center px-1 shadow-lg">
              {stats.totalNodes}
            </div>
          )}
        </button>
      </div>
    );
  }

  // Expanded state
  return (
    <>
      <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6 min-w-96 max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Pipeline Control</h3>
              <p className="text-sm text-gray-500">Analyze • Export • Import • Manage</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
            title="Minimize Panel"
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-red-700 font-medium text-sm">Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pipeline Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 text-center">
            <div className="text-3xl font-bold text-blue-700 mb-1">{stats.totalNodes}</div>
            <div className="text-sm text-blue-600 font-medium">Nodes</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 text-center">
            <div className="text-3xl font-bold text-green-700 mb-1">{stats.totalEdges}</div>
            <div className="text-sm text-green-600 font-medium">Connections</div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="mb-6 space-y-2">
          <StatusIndicator label="Input Source" status={stats.hasInput} />
          <StatusIndicator label="Output Target" status={stats.hasOutput} />
          <StatusIndicator label="Connected Flow" status={stats.isConnected || stats.totalNodes <= 1} />
        </div>

        {/* Issues Display */}
        {stats.issues && stats.issues.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-yellow-800 font-medium text-sm mb-2">Issues Found:</h4>
                <ul className="text-yellow-700 text-sm space-y-1">
                  {stats.issues.map((issue, index) => (
                    <li key={index}>• {issue}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={isLoading || nodes.length === 0}
            className={`w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
              isLoading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : nodes.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : stats.isValid
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg transform hover:scale-[1.02]'
                : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 hover:shadow-lg transform hover:scale-[1.02]'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analyzing Pipeline...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>
                  {stats.isValid ? 'Analyze Pipeline' : 'Analyze (With Issues)'}
                </span>
              </>
            )}
          </button>

          {/* Export/Import Row */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleDownload('json')}
              disabled={nodes.length === 0}
              className="flex flex-col items-center justify-center p-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors border border-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export as JSON"
            >
              <Database className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">JSON</span>
            </button>
            <button
              onClick={() => handleDownload('csv')}
              disabled={nodes.length === 0}
              className="flex flex-col items-center justify-center p-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors border border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export as CSV"
            >
              <BarChart3 className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">CSV</span>
            </button>
            <button
              onClick={() => handleDownload('markdown')}
              disabled={nodes.length === 0}
              className="flex flex-col items-center justify-center p-3 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors border border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export as Report"
            >
              <FileText className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">Report</span>
            </button>
            <label className="flex flex-col items-center justify-center p-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors border border-indigo-300 cursor-pointer"
              title="Import pipeline">
              <Upload className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">Import</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>

          {/* Clear Button */}
          {(nodes.length > 0 || edges.length > 0) && (
            <button
              onClick={handleClear}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Pipeline</span>
            </button>
          )}
        </div>

        {/* Quick Tips */}
        <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-indigo-600 text-sm">💡</span>
            </div>
            <div className="text-sm text-indigo-700">
              <p className="font-medium mb-1">Quick Tips:</p>
              <ul className="text-xs space-y-1 text-indigo-600">
                <li>• Drag nodes from the palette to create connections</li>
                {/* <li>• Ensure your pipeline has input and output nodes</li>
                <li>• Use processing nodes for data transformation</li>
                <li>• Connect nodes by dragging from output handles to input handles</li> */}
              </ul>
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
const StatusIndicator = ({ label, status }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-600 font-medium">{label}</span>
    <div className="flex items-center space-x-2">
      {status ? (
        <>
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-green-600 font-medium text-xs">Ready</span>
        </>
      ) : (
        <>
          <XCircle className="w-4 h-4 text-red-400" />
          <span className="text-red-500 font-medium text-xs">Missing</span>
        </>
      )}
    </div>
  </div>
);

// Pipeline Result Modal
// Pipeline Result Modal with responsive design
// Pipeline Result Modal with responsive design
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

        {/* Content - Scrollable */}
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
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-700 mb-2">{result.execution_time_estimate}</div>
              <div className="text-sm sm:text-base lg:text-lg text-orange-600 font-medium">Est. Time</div>
            </div>
          </div>

          {/* Three Column Layout for larger screens */}
          <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Column */}
            <div className="xl:col-span-1 space-y-6">
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

              {/* Performance Metrics */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
                <h4 className="font-semibold text-indigo-800 mb-4 flex items-center text-lg sm:text-xl">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
                  Performance Insights
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                    <span className="text-indigo-700 text-sm sm:text-base">Complexity Score:</span>
                    <span className="font-bold text-indigo-800 text-sm sm:text-base">{result.complexity_score}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                    <span className="text-indigo-700 text-sm sm:text-base">DAG Valid:</span>
                    <span className="font-bold text-indigo-800 text-sm sm:text-base">
                      {result.is_dag ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                    <span className="text-indigo-700 text-sm sm:text-base">Memory Estimate:</span>
                    <span className="font-bold text-indigo-800 text-sm sm:text-base">{result.memory_estimate}</span>
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
                  <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                    <span className="text-indigo-700 text-sm sm:text-base">Processing Nodes:</span>
                    <span className="font-bold text-indigo-800 text-sm sm:text-base">
                      {result.has_processing ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column */}
            <div className="xl:col-span-1 space-y-6">
              {/* Node Types */}
              {result.node_types && result.node_types.length > 0 && (
                <div>
                  <h4 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-4">Node Types in Pipeline</h4>
                  <div className="flex flex-wrap gap-3">
                    {result.node_types.map((type) => (
                      <span
                        key={type}
                        className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm sm:text-base font-medium capitalize border border-indigo-200"
                      >
                        {type} ({result.node_distribution?.[type] || 1})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Node Distribution Details */}
              {result.node_distribution && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-4 text-lg sm:text-xl">Node Distribution Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(result.node_distribution).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                        <span className="capitalize text-gray-600 text-sm sm:text-base font-medium">{type}:</span>
                        <span className="font-bold text-gray-800 text-lg">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="xl:col-span-1 lg:col-span-2 xl:col-span-1 space-y-6">
              {/* Issues */}
              {result.issues && result.issues.length > 0 && (
                <div>
                  <h4 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-4">Issues Found ({result.issues.length})</h4>
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
            </div>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
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
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all font-medium text-sm sm:text-base"
          >
            Export Analysis
          </button>
        </div>
      </div>
    </div>
  );
};
export default SubmitButton;
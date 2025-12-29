import React, { useState } from 'react';
import { 
  Activity, 
  XCircle, 
  CheckCircle, 
  AlertTriangle, 
  Download, 
  BarChart3, 
  TrendingUp, 
  HardDrive, 
  Clock,
  Zap,
  Database,
  FileText,
  Target,
  Settings,
  Shield,
  Cpu,
  Globe,
  Eye
} from 'lucide-react';

const PipelineResultModal = ({ result, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  if (!result) return null;

  // Determine theme based on pipeline health
  const getTheme = () => {
    if (result.is_dag && result.num_nodes >= 2 && result.num_edges > 0) {
      return {
        color: 'green',
        bg: 'bg-green-500',
        text: 'text-green-600',
        gradient: 'from-green-500 to-emerald-600',
        lightBg: 'bg-green-50',
        status: 'Excellent'
      };
    } else if (result.num_nodes > 0 && result.num_edges > 0) {
      return {
        color: 'yellow',
        bg: 'bg-yellow-500',
        text: 'text-yellow-600',
        gradient: 'from-yellow-500 to-orange-500',
        lightBg: 'bg-yellow-50',
        status: 'Good'
      };
    } else {
      return {
        color: 'red',
        bg: 'bg-red-500',
        text: 'text-red-600',
        gradient: 'from-red-500 to-pink-500',
        lightBg: 'bg-red-50',
        status: 'Needs Work'
      };
    }
  };

  const theme = getTheme();
  const score = result.score || Math.round(
    (result.is_dag ? 40 : 0) + 
    (result.num_nodes > 0 ? 20 : 0) + 
    (result.num_edges > 0 ? 20 : 0) + 
    (result.num_nodes >= 3 ? 20 : result.num_nodes * 6.67)
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'technical', label: 'Technical Analysis', icon: Activity },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'recommendations', label: 'Recommendations', icon: Target },
    { id: 'export', label: 'Export Results', icon: Download }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-[95vw] h-[90vh] max-w-[1600px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className={`bg-gradient-to-r ${theme.gradient} p-8 text-white relative overflow-hidden`}>
          <div className="absolute inset-0 bg-white/10 bg-[radial-gradient(circle_at_20%_50%,_white_0%,_transparent_50%)]"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                <Activity className="w-12 h-12" />
              </div>
              <div>
                <h1 className="text-5xl font-black mb-2">Pipeline Analysis Portal</h1>
                <p className="text-white/90 text-xl">Comprehensive evaluation and insights for your data pipeline</p>
                <div className="flex items-center space-x-6 mt-4">
                  <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Completed: {new Date(result.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Analysis ID: #{result.timestamp.slice(-8)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`w-32 h-32 ${theme.bg} rounded-3xl flex items-center justify-center text-white shadow-2xl backdrop-blur-sm`}>
                <div className="text-center">
                  <span className="text-5xl font-black">{score}</span>
                  <div className="text-sm font-bold opacity-90">SCORE</div>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-16 h-16 bg-white/20 hover:bg-white/30 rounded-2xl flex items-center justify-center transition-colors backdrop-blur-sm"
              >
                <XCircle className="w-8 h-8" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        <div className={`${theme.lightBg} border-b-2 px-8 py-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 ${theme.bg} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                  {result.is_dag ? <CheckCircle className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    Pipeline Score: {score}/100
                  </div>
                  <div className={`text-xl font-semibold ${theme.text}`}>
                    Overall Status: {theme.status}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-black text-blue-600">{result.num_nodes}</div>
                  <div className="text-blue-500 font-medium">Total Nodes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-green-600">{result.num_edges}</div>
                  <div className="text-green-500 font-medium">Connections</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-black ${result.is_dag ? 'text-green-600' : 'text-red-600'}`}>
                    {result.is_dag ? 'VALID' : 'INVALID'}
                  </div>
                  <div className="text-gray-500 font-medium">DAG Structure</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b-2 border-gray-100">
          <div className="px-8">
            <div className="flex space-x-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-3 px-8 py-6 text-lg font-semibold border-b-4 transition-all ${
                    activeTab === tab.id
                      ? `${theme.text} border-current bg-gray-50`
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-6 h-6" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {[
                  { 
                    label: 'Pipeline Nodes', 
                    value: result.num_nodes || 0, 
                    icon: HardDrive, 
                    color: 'blue',
                    description: 'Total processing units'
                  },
                  { 
                    label: 'Data Connections', 
                    value: result.num_edges || 0, 
                    icon: Activity, 
                    color: 'green',
                    description: 'Inter-node data flows'
                  },
                  { 
                    label: 'Structure Health', 
                    value: result.is_dag ? 'Valid DAG' : 'Has Cycles', 
                    icon: CheckCircle, 
                    color: result.is_dag ? 'green' : 'red',
                    description: 'Execution readiness'
                  },
                  { 
                    label: 'Complexity Level', 
                    value: getComplexity(result.num_nodes, result.num_edges), 
                    icon: TrendingUp, 
                    color: 'purple',
                    description: 'Pipeline sophistication'
                  }
                ].map((metric, index) => (
                  <div key={metric.label} className="bg-white border-2 border-gray-200 rounded-3xl p-8 text-center hover:shadow-lg transition-all transform hover:scale-105">
                    <div className={`w-20 h-20 bg-${metric.color}-100 text-${metric.color}-600 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                      <metric.icon className="w-10 h-10" />
                    </div>
                    <div className="text-4xl font-black text-gray-900 mb-3">{metric.value}</div>
                    <div className="text-lg font-bold text-gray-700 mb-2">{metric.label}</div>
                    <div className="text-sm text-gray-500">{metric.description}</div>
                  </div>
                ))}
              </div>

              {/* Pipeline Health Dashboard */}
              <div className="bg-white rounded-3xl p-10 border-2 border-gray-200 shadow-lg">
                <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center">
                  <Shield className="w-8 h-8 mr-4 text-indigo-600" />
                  Pipeline Health Dashboard
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[
                    { 
                      label: 'Structure Validation', 
                      status: result.is_dag, 
                      description: 'DAG compliance and cycle detection',
                      icon: Settings
                    },
                    { 
                      label: 'Input Coverage', 
                      status: result.has_input, 
                      description: 'Data source availability check',
                      icon: Database
                    },
                    { 
                      label: 'Output Definition', 
                      status: result.has_output, 
                      description: 'Result destination configuration',
                      icon: Target
                    },
                    { 
                      label: 'Flow Connectivity', 
                      status: result.num_edges > 0, 
                      description: 'Inter-node connection verification',
                      icon: Activity
                    },
                    { 
                      label: 'Minimum Viability', 
                      status: result.num_nodes >= 2, 
                      description: 'Basic pipeline structure requirements',
                      icon: CheckCircle
                    },
                    { 
                      label: 'Complexity Balance', 
                      status: result.num_nodes <= 15, 
                      description: 'Manageable pipeline complexity',
                      icon: TrendingUp
                    }
                  ].map((check, index) => (
                    <div key={check.label} className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <check.icon className={`w-6 h-6 ${check.status ? 'text-green-600' : 'text-red-500'}`} />
                          <span className="font-bold text-gray-800 text-lg">{check.label}</span>
                        </div>
                        <span className={`px-4 py-2 text-sm font-black rounded-full ${
                          check.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {check.status ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{check.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Node Types Breakdown */}
              {result.node_types && result.node_types.length > 0 && (
                <div className="bg-white rounded-3xl p-10 border-2 border-gray-200 shadow-lg">
                  <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center">
                    <Cpu className="w-8 h-8 mr-4 text-purple-600" />
                    Node Type Analysis
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    {result.node_types.map((type, index) => (
                      <div
                        key={type}
                        className="px-6 py-4 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 rounded-2xl text-lg font-bold capitalize border-2 border-indigo-200 hover:shadow-md transition-all"
                      >
                        {type} Node
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'technical' && (
            <div className="space-y-8">
              {/* Technical Specifications */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl p-8 border-2 border-blue-200 shadow-lg">
                  <h3 className="text-2xl font-black text-blue-900 mb-6 flex items-center">
                    <Database className="w-6 h-6 mr-3" />
                    Technical Specifications
                  </h3>
                  <div className="space-y-6">
                    {[
                      { label: 'Total Processing Nodes', value: result.num_nodes || 0 },
                      { label: 'Data Flow Connections', value: result.num_edges || 0 },
                      { label: 'Directed Acyclic Graph', value: result.is_dag ? 'Valid' : 'Invalid' },
                      { label: 'Node Density Ratio', value: getNodeDensity(result.num_nodes, result.num_edges) },
                      { label: 'Average Node Connections', value: getAverageConnections(result.num_nodes, result.num_edges) },
                      { label: 'Pipeline Complexity Score', value: `${getComplexityScore(result.num_nodes, result.num_edges)}/100` }
                    ].map((item, index) => (
                      <div key={item.label} className="flex justify-between items-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <span className="font-semibold text-blue-800 text-lg">{item.label}</span>
                        <span className="font-black text-blue-900 text-xl">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-8 border-2 border-green-200 shadow-lg">
                  <h3 className="text-2xl font-black text-green-900 mb-6 flex items-center">
                    <Activity className="w-6 h-6 mr-3" />
                    Structure Analysis
                  </h3>
                  <div className="space-y-6">
                    <div className="p-6 bg-green-50 rounded-2xl border border-green-200">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold text-green-800 text-lg">Overall Pipeline Score</span>
                        <span className="text-4xl font-black text-green-900">{score}/100</span>
                      </div>
                      <div className="w-full bg-green-200 rounded-full h-4 mb-4">
                        <div 
                          className="bg-green-600 h-4 rounded-full transition-all duration-1000"
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-green-700">
                        {score >= 80 ? 'Excellent pipeline structure' :
                         score >= 60 ? 'Good pipeline with room for improvement' :
                         score >= 40 ? 'Basic pipeline needing optimization' :
                         'Pipeline requires significant improvements'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-4 bg-green-50 rounded-xl text-center border border-green-200">
                        <div className="text-2xl font-black text-green-900">
                          {result.is_dag ? 'VALID' : 'INVALID'}
                        </div>
                        <div className="text-sm text-green-700 font-medium">DAG Structure</div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-xl text-center border border-green-200">
                        <div className="text-2xl font-black text-green-900">
                          {getComplexity(result.num_nodes, result.num_edges)}
                        </div>
                        <div className="text-sm text-green-700 font-medium">Complexity</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flow Visualization */}
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-lg">
                <h3 className="text-2xl font-black text-gray-900 mb-6">Pipeline Flow Summary</h3>
                <div className="bg-gray-50 rounded-2xl p-8">
                  <div className="flex items-center justify-center space-x-8 text-xl">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white">
                        <span className="font-black text-2xl">{result.num_nodes}</span>
                      </div>
                      <span className="font-bold text-blue-600">Processing Nodes</span>
                    </div>
                    
                    <div className="text-gray-400 text-3xl">→</div>
                    
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white">
                        <span className="font-black text-2xl">{result.num_edges}</span>
                      </div>
                      <span className="font-bold text-green-600">Data Connections</span>
                    </div>
                    
                    <div className="text-gray-400 text-3xl">→</div>
                    
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white ${theme.bg}`}>
                        <span className="font-black text-lg">{theme.status.slice(0,3)}</span>
                      </div>
                      <span className={`font-bold ${theme.text}`}>Pipeline Status</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-8">
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white rounded-3xl p-8 border-2 border-purple-200 shadow-lg">
                  <h3 className="text-2xl font-black text-purple-900 mb-6 flex items-center">
                    <Clock className="w-6 h-6 mr-3" />
                    Runtime Estimation
                  </h3>
                  <div className="text-center">
                    <div className="text-5xl font-black text-purple-600 mb-4">
                      {result.performance?.estimated_runtime || `${(result.num_nodes * 0.3 + result.num_edges * 0.1).toFixed(1)}s`}
                    </div>
                    <div className="text-purple-500 font-medium">Estimated Execution Time</div>
                    <div className="mt-4 p-4 bg-purple-50 rounded-xl">
                      <div className="text-sm text-purple-700">
                        Based on {result.num_nodes} processing nodes and {result.num_edges} data flows
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-8 border-2 border-orange-200 shadow-lg">
                  <h3 className="text-2xl font-black text-orange-900 mb-6 flex items-center">
                    <HardDrive className="w-6 h-6 mr-3" />
                    Memory Usage
                  </h3>
                  <div className="text-center">
                    <div className="text-5xl font-black text-orange-600 mb-4">
                      {result.performance?.memory_usage || `${(result.num_nodes * 45 + result.num_edges * 20)}MB`}
                    </div>
                    <div className="text-orange-500 font-medium">Estimated Memory Consumption</div>
                    <div className="mt-4 p-4 bg-orange-50 rounded-xl">
                      <div className="text-sm text-orange-700">
                        Memory allocation for processing and data flow
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-8 border-2 border-teal-200 shadow-lg">
                  <h3 className="text-2xl font-black text-teal-900 mb-6 flex items-center">
                    <Zap className="w-6 h-6 mr-3" />
                    Optimization Score
                  </h3>
                  <div className="text-center">
                    <div className="text-5xl font-black text-teal-600 mb-4">
                      {result.performance?.optimization_score?.toFixed(0) || Math.min(100, (result.num_edges / Math.max(1, result.num_nodes - 1)) * 100).toFixed(0)}%
                    </div>
                    <div className="text-teal-500 font-medium">Pipeline Efficiency Rating</div>
                    <div className="mt-4 p-4 bg-teal-50 rounded-xl">
                      <div className="text-sm text-teal-700">
                        Connection density and flow optimization
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Breakdown */}
              <div className="bg-white rounded-3xl p-10 border-2 border-gray-200 shadow-lg">
                <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center">
                  <TrendingUp className="w-8 h-8 mr-4 text-indigo-600" />
                  Performance Analysis Breakdown
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Efficiency Metrics */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Efficiency Metrics</h3>
                    {[
                      { 
                        label: 'Node Utilization', 
                        value: `${Math.min(100, (result.num_edges / Math.max(1, result.num_nodes)) * 50).toFixed(0)}%`,
                        description: 'How well nodes are connected'
                      },
                      { 
                        label: 'Flow Density', 
                        value: getNodeDensity(result.num_nodes, result.num_edges),
                        description: 'Data connection density ratio'
                      },
                      { 
                        label: 'Complexity Balance', 
                        value: getComplexityScore(result.num_nodes, result.num_edges) > 70 ? 'Optimal' : 'Suboptimal',
                        description: 'Structure complexity assessment'
                      }
                    ].map((metric, index) => (
                      <div key={metric.label} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-gray-800">{metric.label}</span>
                          <span className="font-black text-indigo-600 text-lg">{metric.value}</span>
                        </div>
                        <div className="text-sm text-gray-600">{metric.description}</div>
                      </div>
                    ))}
                  </div>

                  {/* Scalability Assessment */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Scalability Assessment</h3>
                    {[
                      { 
                        label: 'Node Scalability', 
                        value: result.num_nodes < 10 ? 'High' : result.num_nodes < 20 ? 'Medium' : 'Limited',
                        description: 'Ability to add more processing nodes'
                      },
                      { 
                        label: 'Connection Overhead', 
                        value: result.num_edges / Math.max(1, result.num_nodes) < 2 ? 'Low' : 'Moderate',
                        description: 'Data flow management complexity'
                      },
                      { 
                        label: 'Maintenance Burden', 
                        value: getComplexity(result.num_nodes, result.num_edges) === 'Simple' ? 'Low' : 'Moderate',
                        description: 'Expected maintenance requirements'
                      }
                    ].map((metric, index) => (
                      <div key={metric.label} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-gray-800">{metric.label}</span>
                          <span className="font-black text-purple-600 text-lg">{metric.value}</span>
                        </div>
                        <div className="text-sm text-gray-600">{metric.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-8">
              {getRecommendations(result).map((section, index) => (
                <div key={index} className={`rounded-3xl p-10 border-2 ${section.bgColor} ${section.borderColor} shadow-lg`}>
                  <div className="flex items-center space-x-4 mb-8">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${section.iconBg}`}>
                      <section.icon className={`w-8 h-8 ${section.iconColor}`} />
                    </div>
                    <div>
                      <h2 className={`text-3xl font-black ${section.textColor}`}>{section.title}</h2>
                      <p className={`text-lg ${section.textColor} opacity-80`}>{section.subtitle}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {section.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start space-x-4 p-6 bg-white/80 rounded-2xl border border-white/50 backdrop-blur-sm">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${section.badgeColor} flex-shrink-0 mt-1`}>
                          <span className="text-white text-sm font-black">{itemIndex + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold leading-relaxed ${section.textColor}`}>{item.title}</p>
                          <p className={`text-sm mt-2 ${section.textColor} opacity-75`}>{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-8">
              <div className="text-center bg-white rounded-3xl p-10 border-2 border-gray-200 shadow-lg">
                <h2 className="text-4xl font-black text-gray-900 mb-4">Export Analysis Results</h2>
                <p className="text-xl text-gray-600 mb-8">Download your comprehensive pipeline analysis in various formats</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { 
                      format: 'Detailed JSON Report', 
                      description: 'Complete analysis data with all metrics and technical details', 
                      icon: Database, 
                      color: 'blue',
                      fileSize: '~15-25KB',
                      action: () => downloadReport(result, 'json')
                    },
                    { 
                      format: 'Executive Summary', 
                      description: 'High-level insights and recommendations for stakeholders', 
                      icon: FileText, 
                      color: 'green',
                      fileSize: '~8-12KB',
                      action: () => downloadReport(result, 'summary')
                    },
                    { 
                      format: 'Data Analytics CSV', 
                      description: 'Structured data export for further analysis and reporting', 
                      icon: BarChart3, 
                      color: 'purple',
                      fileSize: '~5-8KB',
                      action: () => downloadReport(result, 'csv')
                    }
                  ].map((option, index) => (
                    <div key={option.format} className="group">
                      <button
                        onClick={option.action}
                        className={`w-full p-8 bg-${option.color}-50 hover:bg-${option.color}-100 border-2 border-${option.color}-200 hover:border-${option.color}-300 rounded-3xl transition-all text-left hover:shadow-lg transform hover:scale-105`}
                      >
                        <div className={`w-20 h-20 bg-${option.color}-500 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform mx-auto`}>
                          <option.icon className="w-10 h-10" />
                        </div>
                        <h3 className={`text-2xl font-black text-${option.color}-900 mb-4 text-center`}>{option.format}</h3>
                        <p className={`text-sm text-${option.color}-700 mb-4 leading-relaxed`}>{option.description}</p>
                        <div className={`text-xs text-${option.color}-600 text-center font-medium`}>
                          Estimated size: {option.fileSize}
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export History */}
              <div className="bg-white rounded-3xl p-10 border-2 border-gray-200 shadow-lg">
                <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
                  <Clock className="w-6 h-6 mr-3 text-gray-600" />
                  Export Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="font-semibold text-gray-800 mb-2">Analysis Date</div>
                    <div className="text-gray-600">{new Date(result.timestamp).toLocaleDateString()}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="font-semibold text-gray-800 mb-2">Analysis Time</div>
                    <div className="text-gray-600">{new Date(result.timestamp).toLocaleTimeString()}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="font-semibold text-gray-800 mb-2">Pipeline ID</div>
                    <div className="text-gray-600 font-mono">#{result.timestamp.slice(-12)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/*Footer */}
        <div className="bg-white border-t-2 border-gray-100 px-8 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <div className="text-gray-600">
              <span className="font-semibold">Analysis completed</span>
              <span className="mx-2">•</span>
              <span>{new Date(result.timestamp).toLocaleString()}</span>
            </div>
            <div className="text-gray-500 text-sm">
              Pipeline Builder Analysis Engine v2.3
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="px-8 py-4 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-all font-semibold text-lg"
            >
              Close Analysis
            </button>
            <button
              onClick={() => downloadReport(result, 'json')}
              className={`px-8 py-4 ${theme.bg} text-white rounded-xl hover:opacity-90 transition-all flex items-center space-x-3 font-semibold text-lg shadow-lg hover:shadow-xl`}
            >
              <Download className="w-5 h-5" />
              <span>Quick Export JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// helper functions
function getComplexity(nodes, edges) {
  if (nodes === 0) return 'Empty';
  if (nodes <= 3 && edges <= 3) return 'Simple';
  if (nodes <= 6 && edges <= 8) return 'Moderate';
  if (nodes <= 12 && edges <= 20) return 'Complex';
  return 'Very Complex';
}

function getNodeDensity(nodes, edges) {
  if (nodes <= 1) return '0%';
  const maxEdges = nodes * (nodes - 1);
  const density = Math.round((edges / maxEdges) * 100);
  return `${density}%`;
}

function getAverageConnections(nodes, edges) {
  if (nodes === 0) return '0.0';
  return (edges * 2 / nodes).toFixed(1);
}

function getComplexityScore(nodes, edges) {
  if (nodes === 0) return 0;
  const baseScore = Math.min(50, nodes * 5);
  const connectionScore = Math.min(30, edges * 3);
  const balanceScore = edges > 0 && nodes > 1 ? 20 : 0;
  return Math.min(100, baseScore + connectionScore + balanceScore);
}

function getRecommendations(result) {
  const recommendations = [];
  
  if (!result.is_dag) {
    recommendations.push({
      title: 'Critical Issues Detected',
      subtitle: 'Immediate attention required for pipeline execution',
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      badgeColor: 'bg-red-500',
      items: [
        {
          title: 'Resolve Pipeline Cycles',
          description: 'Your pipeline contains circular dependencies that prevent execution. Review and restructure node connections.'
        },
        {
          title: 'Validate Data Flow Direction', 
          description: 'Ensure all connections flow in a single direction from input to output nodes.'
        },
        {
          title: 'Review Architecture Design',
          description: 'Consider redesigning the pipeline structure to eliminate feedback loops and cycles.'
        }
      ]
    });
  }
  
  if (result.num_nodes < 2) {
    recommendations.push({
      title: 'Structure Enhancement Needed',
      subtitle: 'Build a more robust pipeline foundation',
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      badgeColor: 'bg-yellow-500',
      items: [
        {
          title: 'Add More Processing Nodes',
          description: 'Include additional nodes to create a meaningful data transformation pipeline.'
        },
        {
          title: 'Include Input and Output Nodes',
          description: 'Every pipeline needs at least one input source and one output destination.'
        },
        {
          title: 'Consider Data Transformation Steps',
          description: 'Add processing nodes between input and output for data manipulation and analysis.'
        }
      ]
    });
  }
  
  if (result.num_edges === 0 && result.num_nodes > 1) {
    recommendations.push({
      title: 'Connectivity Issues',
      subtitle: 'Establish data flow between your nodes',
      icon: AlertTriangle,
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-800',
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100',
      badgeColor: 'bg-orange-500',
      items: [
        {
          title: 'Connect Your Nodes',
          description: 'Create data flow paths by connecting output handles to input handles between nodes.'
        },
        {
          title: 'Establish Processing Chain',
          description: 'Link nodes in logical sequence from data input through processing to final output.'
        },
        {
          title: 'Verify Connection Validity',
          description: 'Ensure all connections make logical sense for your data processing workflow.'
        }
      ]
    });
  }
  
  if (result.is_dag && result.num_nodes >= 2 && result.num_edges > 0) {
    recommendations.push({
      title: 'Optimization Opportunities',
      subtitle: 'Your pipeline is functional - here are enhancement suggestions',
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      badgeColor: 'bg-green-500',
      items: [
        {
          title: 'Add Error Handling Nodes',
          description: 'Include error handling and validation nodes for production-ready pipelines.'
        },
        {
          title: 'Implement Data Validation',
          description: 'Add validation steps to ensure data quality throughout the processing chain.'
        },
        {
          title: 'Consider Performance Optimization',
          description: 'Review node placement and connections for optimal processing efficiency.'
        },
        {
          title: 'Document Pipeline Logic',
          description: 'Create documentation for future maintenance and team collaboration.'
        }
      ]
    });
  }
  
  return recommendations;
}

function downloadReport(result, format) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const score = result.score || Math.round(
    (result.is_dag ? 40 : 0) + 
    (result.num_nodes > 0 ? 20 : 0) + 
    (result.num_edges > 0 ? 20 : 0) + 
    (result.num_nodes >= 3 ? 20 : result.num_nodes * 6.67)
  );
  
  let content, mimeType, extension;
  
  switch (format) {
    case 'json':
      content = JSON.stringify({
        timestamp: new Date().toISOString(),
        analysis: result,
        score: score,
        complexity: getComplexity(result.num_nodes, result.num_edges),
        performance_metrics: {
          node_density: getNodeDensity(result.num_nodes, result.num_edges),
          average_connections: getAverageConnections(result.num_nodes, result.num_edges),
          complexity_score: getComplexityScore(result.num_nodes, result.num_edges)
        }
      }, null, 2);
      mimeType = 'application/json';
      extension = 'json';
      break;
      
    case 'summary':
      content = `# Pipeline Analysis Executive Summary

**Generated:** ${new Date().toLocaleString()}
**Pipeline Score:** ${score}/100
**Analysis ID:** #${result.timestamp.slice(-8)}

## Executive Summary
Your pipeline consists of ${result.num_nodes || 0} processing nodes connected by ${result.num_edges || 0} data flows. The overall health score is ${score}/100, indicating a ${score >= 80 ? 'highly optimized' : score >= 60 ? 'well-structured' : score >= 40 ? 'functional but improvable' : 'development-stage'} pipeline.

## Key Findings
- **Pipeline Structure:** ${result.is_dag ? 'Valid DAG (Directed Acyclic Graph)' : 'Contains cycles - requires restructuring'}
- **Complexity Level:** ${getComplexity(result.num_nodes, result.num_edges)}
- **Node Utilization:** ${getNodeDensity(result.num_nodes, result.num_edges)} density
- **Processing Efficiency:** ${getComplexityScore(result.num_nodes, result.num_edges)}% optimized

## Strategic Recommendations
${getRecommendations(result).map(section => 
  section.items.map(item => `- **${item.title}:** ${item.description}`).join('\n')
).join('\n')}

## Technical Specifications
- **Total Processing Nodes:** ${result.num_nodes || 0}
- **Data Flow Connections:** ${result.num_edges || 0}
- **Average Node Connections:** ${getAverageConnections(result.num_nodes, result.num_edges)}
- **Estimated Runtime:** ${result.performance?.estimated_runtime || `${(result.num_nodes * 0.3 + result.num_edges * 0.1).toFixed(1)}s`}
- **Memory Requirements:** ${result.performance?.memory_usage || `${(result.num_nodes * 45 + result.num_edges * 20)}MB`}

---
*Generated by Pipeline Builder Analysis Engine v2.3*
`;
      mimeType = 'text/markdown';
      extension = 'md';
      break;
      
    case 'csv':
      content = [
        ['Metric', 'Value', 'Category', 'Description'],
        ['Analysis Timestamp', new Date().toISOString(), 'Metadata', 'When the analysis was performed'],
        ['Pipeline Score', score, 'Overall', 'Composite health score out of 100'],
        ['Total Nodes', result.num_nodes || 0, 'Structure', 'Number of processing nodes'],
        ['Total Connections', result.num_edges || 0, 'Structure', 'Number of data flow connections'],
        ['Is Valid DAG', result.is_dag ? 'Yes' : 'No', 'Structure', 'Directed Acyclic Graph validation'],
        ['Complexity Level', getComplexity(result.num_nodes, result.num_edges), 'Structure', 'Overall pipeline complexity'],
        ['Node Density', getNodeDensity(result.num_nodes, result.num_edges), 'Performance', 'Connection density percentage'],
        ['Average Connections', getAverageConnections(result.num_nodes, result.num_edges), 'Performance', 'Average connections per node'],
        ['Complexity Score', getComplexityScore(result.num_nodes, result.num_edges), 'Performance', 'Complexity optimization score'],
        ['Estimated Runtime', result.performance?.estimated_runtime || `${(result.num_nodes * 0.3 + result.num_edges * 0.1).toFixed(1)}s`, 'Performance', 'Projected execution time'],
        ['Memory Usage', result.performance?.memory_usage || `${(result.num_nodes * 45 + result.num_edges * 20)}MB`, 'Performance', 'Estimated memory consumption']
      ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
      mimeType = 'text/csv';
      extension = 'csv';
      break;
  }
  
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pipeline-analysis-${timestamp}.${extension}`;
  a.click();
  URL.revokeObjectURL(url);
}

export default PipelineResultModal;
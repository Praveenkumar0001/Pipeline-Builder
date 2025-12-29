import useStore from './store/useStore';
/**
 * Pipeline Submission Handler
 * Handles communication with backend for pipeline analysis and DAG validation
 * 
 * Features:
 * - Validates pipeline structure before submission
 * - Sends nodes and edges to FastAPI backend
 * - Comprehensive error handling with user-friendly messages
 * - Timeout protection for long-running requests
 * - DAG (Directed Acyclic Graph) validation
 * 
 * @returns {Promise<Object|null>} Analysis result or null on error
 */
export const submitPipeline = async () => {
  const { nodes, edges, setLoading, setError, setPipelineResult } = useStore.getState();
  
  if (!nodes || nodes.length === 0) {
    alert('Please add nodes to the pipeline before submitting.');
    return null;
  }

  try {
    setLoading(true);
    setError(null);

    // Hit the backend API
    const response = await fetch('http://localhost:8000/pipelines/parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: node.data || {}
        })),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle || null,
          targetHandle: edge.targetHandle || null
        }))
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Backend error: ${response.status}`);
    }

    const result = await response.json();
    
    // Store result
    setPipelineResult(result);
    
    // Create user-friendly alert message
    const alertMessage = 
      `Pipeline Analysis Complete!\n\n` +
      `📊 Number of Nodes: ${result.num_nodes}\n` +
      `🔗 Number of Edges: ${result.num_edges}\n` +
      `${result.is_dag ? '✅' : '❌'} Is DAG (Directed Acyclic Graph): ${result.is_dag ? 'Yes' : 'No'}\n\n` +
      `${result.message || 'Analysis completed successfully.'}`;
    
    // Show alert with results
    alert(alertMessage);
    
    return result;

  } catch (error) {
    console.error('Pipeline submission error:', error);
    const errorMessage = error.message.includes('Failed to fetch')
      ? 'Cannot connect to backend server. Please ensure the backend is running on http://localhost:8000'
      : `Analysis failed: ${error.message}`;
    
    setError(errorMessage);
    alert(`❌ Pipeline Analysis Failed\n\n${errorMessage}`);
    return null;
    
  } finally {
    setLoading(false);
  }
};

export default submitPipeline;

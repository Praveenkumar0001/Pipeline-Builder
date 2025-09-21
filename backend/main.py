# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging
from collections import defaultdict, deque

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="VectorShift Pipeline API", version="1.0.0")

# CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class NodeData(BaseModel):
    label: Optional[str] = None
    type: Optional[str] = None
    content: Optional[str] = None
    inputs: Optional[List[str]] = None
    outputs: Optional[List[str]] = None
    # Allow additional fields for different node types
    class Config:
        extra = "allow"

class PipelineNode(BaseModel):
    id: str
    type: str
    position: Dict[str, float]
    data: NodeData

class PipelineEdge(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None

class PipelineData(BaseModel):
    nodes: List[PipelineNode]
    edges: List[PipelineEdge]

class PipelineAnalysisResponse(BaseModel):
    num_nodes: int
    num_edges: int
    is_dag: bool
    message: str
    cycle_info: Optional[List[str]] = None
    node_analysis: Optional[Dict[str, Any]] = None

class DAGAnalyzer:
    """Utility class for analyzing pipeline structure and detecting cycles"""
    
    def __init__(self, nodes: List[PipelineNode], edges: List[PipelineEdge]):
        self.nodes = {node.id: node for node in nodes}
        self.edges = edges
        self.graph = self._build_graph()
        
    def _build_graph(self) -> Dict[str, List[str]]:
        """Build adjacency list representation of the graph"""
        graph = defaultdict(list)
        
        # Initialize all nodes in the graph
        for node in self.nodes:
            graph[node] = []
            
        # Add edges
        for edge in self.edges:
            if edge.source in self.nodes and edge.target in self.nodes:
                graph[edge.source].append(edge.target)
                
        return dict(graph)
    
    def is_dag(self) -> tuple:
        """
        Check if the graph is a Directed Acyclic Graph (DAG)
        Returns (is_dag, cycle_path)
        """
        # States: 0 = unvisited, 1 = visiting, 2 = visited
        state = {node_id: 0 for node_id in self.nodes}
        cycle_path = []
        
        def dfs(node_id: str, path: List[str]) -> bool:
            if state[node_id] == 1:  # Back edge found - cycle detected
                cycle_start = path.index(node_id) if node_id in path else 0
                cycle_path.extend(path[cycle_start:] + [node_id])
                return False
            
            if state[node_id] == 2:  # Already fully processed
                return True
            
            state[node_id] = 1  # Mark as visiting
            path.append(node_id)
            
            # Visit all neighbors
            for neighbor in self.graph.get(node_id, []):
                if not dfs(neighbor, path):
                    return False
            
            path.pop()
            state[node_id] = 2  # Mark as fully processed
            return True
        
        # Check each unvisited node
        for node_id in self.nodes:
            if state[node_id] == 0:
                if not dfs(node_id, []):
                    return False, cycle_path
                    
        return True, None
    
    def get_node_statistics(self) -> Dict[str, Any]:
        """Get detailed statistics about the pipeline"""
        node_types = defaultdict(int)
        in_degree = defaultdict(int)
        out_degree = defaultdict(int)
        
        # Count node types
        for node in self.nodes.values():
            node_types[node.type] += 1
            
        # Calculate degrees
        for edge in self.edges:
            out_degree[edge.source] += 1
            in_degree[edge.target] += 1
            
        # Find isolated nodes
        isolated_nodes = []
        for node_id in self.nodes:
            if in_degree[node_id] == 0 and out_degree[node_id] == 0:
                isolated_nodes.append(node_id)
        
        # Find source and sink nodes
        source_nodes = [node_id for node_id in self.nodes if in_degree[node_id] == 0 and out_degree[node_id] > 0]
        sink_nodes = [node_id for node_id in self.nodes if out_degree[node_id] == 0 and in_degree[node_id] > 0]
        
        return {
            "node_types": dict(node_types),
            "isolated_nodes": isolated_nodes,
            "source_nodes": source_nodes,
            "sink_nodes": sink_nodes,
            "max_in_degree": max(in_degree.values()) if in_degree else 0,
            "max_out_degree": max(out_degree.values()) if out_degree else 0,
            "connectivity": len(self.edges) / max(len(self.nodes) - 1, 1) if len(self.nodes) > 1 else 0
        }
    
    def topological_sort(self) -> Optional[List[str]]:
        """
        Perform topological sort if graph is DAG
        Returns None if graph contains cycles
        """
        is_dag_result, _ = self.is_dag()
        if not is_dag_result:
            return None
            
        in_degree = defaultdict(int)
        for node_id in self.nodes:
            in_degree[node_id] = 0
            
        for edge in self.edges:
            in_degree[edge.target] += 1
            
        queue = deque([node_id for node_id in self.nodes if in_degree[node_id] == 0])
        result = []
        
        while queue:
            node_id = queue.popleft()
            result.append(node_id)
            
            for neighbor in self.graph.get(node_id, []):
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)
                    
        return result if len(result) == len(self.nodes) else None

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "VectorShift Pipeline API is running",
        "version": "1.0.0",
        "endpoints": {
            "parse": "/pipelines/parse",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "timestamp": "2024-01-01T00:00:00Z",
        "services": {
            "api": "operational",
            "dag_analyzer": "operational"
        }
    }

@app.post("/pipelines/parse", response_model=PipelineAnalysisResponse)
async def parse_pipeline(pipeline: PipelineData):
    """
    Analyze a pipeline and determine if it forms a valid DAG
    """
    try:
        logger.info(f"Received pipeline with {len(pipeline.nodes)} nodes and {len(pipeline.edges)} edges")
        
        # Basic validation
        if len(pipeline.nodes) == 0:
            raise HTTPException(status_code=400, detail="Pipeline must contain at least one node")
        
        # Validate that all edge references point to existing nodes
        node_ids = {node.id for node in pipeline.nodes}
        invalid_edges = []
        
        for edge in pipeline.edges:
            if edge.source not in node_ids or edge.target not in node_ids:
                invalid_edges.append(edge.id)
        
        if invalid_edges:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid edges reference non-existent nodes: {invalid_edges}"
            )
        
        # Initialize DAG analyzer
        analyzer = DAGAnalyzer(pipeline.nodes, pipeline.edges)
        
        # Check if pipeline is a DAG
        is_dag_result, cycle_path = analyzer.is_dag()
        
        # Get detailed statistics
        node_stats = analyzer.get_node_statistics()
        
        # Generate analysis message
        message_parts = []
        message_parts.append(f"Pipeline contains {len(pipeline.nodes)} nodes and {len(pipeline.edges)} edges.")
        
        if is_dag_result:
            message_parts.append("✅ Pipeline forms a valid Directed Acyclic Graph (DAG).")
            
            # Add topological order
            topo_order = analyzer.topological_sort()
            if topo_order:
                message_parts.append(f"Execution order: {' → '.join(topo_order[:5])}{'...' if len(topo_order) > 5 else ''}")
        else:
            message_parts.append("❌ Pipeline contains cycles and is not a valid DAG.")
            if cycle_path:
                cycle_display = ' → '.join(cycle_path[:5]) + ('...' if len(cycle_path) > 5 else '')
                message_parts.append(f"Detected cycle: {cycle_display}")
        
        # Add node type breakdown
        if node_stats["node_types"]:
            types_str = ", ".join([f"{count} {type_name}" for type_name, count in node_stats["node_types"].items()])
            message_parts.append(f"Node types: {types_str}")
        
        # Add warnings for isolated nodes
        if node_stats["isolated_nodes"]:
            message_parts.append(f"⚠️  Warning: {len(node_stats['isolated_nodes'])} isolated node(s) detected.")
        
        # Check for missing inputs/outputs
        if not node_stats["source_nodes"]:
            message_parts.append("⚠️  Warning: No input nodes detected.")
        if not node_stats["sink_nodes"]:
            message_parts.append("⚠️  Warning: No output nodes detected.")
        
        message = "\n".join(message_parts)
        
        logger.info(f"Analysis complete: DAG={is_dag_result}, Message length={len(message)}")
        
        return PipelineAnalysisResponse(
            num_nodes=len(pipeline.nodes),
            num_edges=len(pipeline.edges),
            is_dag=is_dag_result,
            message=message,
            cycle_info=cycle_path if cycle_path else None,
            node_analysis=node_stats
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing pipeline: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/pipelines/validate")
async def validate_pipeline(pipeline: PipelineData):
    """
    Validate pipeline structure without full analysis
    """
    try:
        errors = []
        warnings = []
        
        # Check for empty pipeline
        if len(pipeline.nodes) == 0:
            errors.append("Pipeline is empty")
        
        # Check node IDs are unique
        node_ids = [node.id for node in pipeline.nodes]
        if len(node_ids) != len(set(node_ids)):
            errors.append("Duplicate node IDs detected")
        
        # Check edge validity
        node_id_set = set(node_ids)
        for edge in pipeline.edges:
            if edge.source not in node_id_set:
                errors.append(f"Edge {edge.id} references non-existent source node: {edge.source}")
            if edge.target not in node_id_set:
                errors.append(f"Edge {edge.id} references non-existent target node: {edge.target}")
        
        # Check for self-loops
        self_loops = [edge.id for edge in pipeline.edges if edge.source == edge.target]
        if self_loops:
            warnings.append(f"Self-loops detected: {self_loops}")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "node_count": len(pipeline.nodes),
            "edge_count": len(pipeline.edges)
        }
        
    except Exception as e:
        logger.error(f"Error validating pipeline: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Validation error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )
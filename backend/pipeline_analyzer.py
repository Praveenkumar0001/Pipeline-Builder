# backend/pipeline_analyzer.py
from typing import List, Dict, Set, Tuple, Optional
from collections import defaultdict, deque
import logging

from models import NodeData, EdgeData

logger = logging.getLogger(__name__)

class PipelineAnalyzer:
    """Analyzer for pipeline structure and DAG validation using Kahn's algorithm"""
    
    def __init__(self):
        """Initialize the analyzer"""
        self.reset()
    
    def reset(self):
        """Reset internal state for new analysis"""
        self.nodes: Set[str] = set()
        self.edges: List[Tuple[str, str]] = []
        self.adjacency_list: Dict[str, List[str]] = defaultdict(list)
        self.in_degree: Dict[str, int] = defaultdict(int)
        self.out_degree: Dict[str, int] = defaultdict(int)
    
    def analyze_pipeline(self, nodes: List[NodeData], edges: List[EdgeData]) -> Dict[str, any]:
        """
        Analyze pipeline structure and validate if it forms a DAG
        
        Args:
            nodes: List of pipeline nodes
            edges: List of pipeline edges
            
        Returns:
            Dictionary with analysis results
        """
        try:
            logger.info("Starting pipeline analysis")
            
            # Reset state
            self.reset()
            
            # Build internal representation
            self._build_graph(nodes, edges)
            
            # Perform DAG analysis
            is_dag = self._is_dag_kahns_algorithm()
            
            # Prepare results
            result = {
                "num_nodes": len(nodes),
                "num_edges": len(edges), 
                "is_dag": is_dag,
                "node_count": len(self.nodes),
                "edge_count": len(self.edges)
            }
            
            # Additional analysis for debugging
            if not is_dag:
                cycles = self._find_cycles()
                result["cycles_found"] = len(cycles)
                logger.warning(f"Found {len(cycles)} cycles in the graph")
            
            logger.info(f"Analysis complete: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Error during pipeline analysis: {str(e)}")
            raise
    
    def _build_graph(self, nodes: List[NodeData], edges: List[EdgeData]):
        """Build internal graph representation"""
        logger.info("Building graph representation")
        
        # Add all nodes
        for node in nodes:
            self.nodes.add(node.id)
            self.in_degree[node.id] = 0  # Initialize in-degree
            self.out_degree[node.id] = 0  # Initialize out-degree
            
        logger.info(f"Added {len(nodes)} nodes: {list(self.nodes)}")
        
        # Add all edges and build adjacency list
        for edge in edges:
            source, target = edge.source, edge.target
            
            # Validate edge references existing nodes
            if source not in self.nodes:
                logger.warning(f"Edge references non-existent source node: {source}")
                continue
                
            if target not in self.nodes:
                logger.warning(f"Edge references non-existent target node: {target}")
                continue
            
            # Add to internal structures
            self.edges.append((source, target))
            self.adjacency_list[source].append(target)
            self.in_degree[target] += 1
            self.out_degree[source] += 1
        
        logger.info(f"Added {len(self.edges)} valid edges")
        logger.info(f"Adjacency list: {dict(self.adjacency_list)}")
        logger.info(f"In-degrees: {dict(self.in_degree)}")
        
    def _is_dag_kahns_algorithm(self) -> bool:
        """
        Check if graph is a DAG using Kahn's topological sorting algorithm
        
        Returns:
            True if the graph is a DAG, False if it contains cycles
        """
        if not self.nodes:
            logger.info("Empty graph - considered a DAG")
            return True
        
        logger.info("Starting Kahn's algorithm for DAG detection")
        
        # Create working copy of in-degrees
        working_in_degree = self.in_degree.copy()
        
        # Initialize queue with nodes having no incoming edges
        queue = deque([
            node for node in self.nodes 
            if working_in_degree[node] == 0
        ])
        
        processed_nodes = 0
        topological_order = []
        
        logger.info(f"Starting with {len(queue)} nodes with in-degree 0: {list(queue)}")
        
        while queue:
            current_node = queue.popleft()
            processed_nodes += 1
            topological_order.append(current_node)
            
            logger.debug(f"Processing node: {current_node}")
            
            # Process all outgoing edges
            for neighbor in self.adjacency_list[current_node]:
                working_in_degree[neighbor] -= 1
                logger.debug(f"  Reduced in-degree of {neighbor} to {working_in_degree[neighbor]}")
                
                # If in-degree becomes 0, add to queue
                if working_in_degree[neighbor] == 0:
                    queue.append(neighbor)
                    logger.debug(f"  Added {neighbor} to queue")
        
        is_dag = processed_nodes == len(self.nodes)
        
        logger.info(f"Kahn's algorithm result:")
        logger.info(f"  Total nodes: {len(self.nodes)}")
        logger.info(f"  Processed nodes: {processed_nodes}")
        logger.info(f"  Is DAG: {is_dag}")
        logger.info(f"  Topological order: {topological_order}")
        
        if not is_dag:
            remaining_nodes = [
                node for node in self.nodes 
                if working_in_degree[node] > 0
            ]
            logger.warning(f"Nodes in cycles: {remaining_nodes}")
        
        return is_dag
    
    def _find_cycles(self) -> List[List[str]]:
        """
        Find all cycles in the graph using DFS
        
        Returns:
            List of cycles, where each cycle is a list of node IDs
        """
        if not self.nodes:
            return []
        
        logger.info("Searching for cycles using DFS")
        
        # Track node states: 0=unvisited, 1=visiting, 2=visited
        WHITE, GRAY, BLACK = 0, 1, 2
        colors = {node: WHITE for node in self.nodes}
        cycles = []
        
        def dfs_visit(node: str, path: List[str]) -> bool:
            """DFS visit with cycle detection"""
            if colors[node] == GRAY:
                # Found a back edge - cycle detected
                try:
                    cycle_start = path.index(node)
                    cycle = path[cycle_start:] + [node]
                    cycles.append(cycle)
                    logger.info(f"Found cycle: {' -> '.join(cycle)}")
                    return True
                except ValueError:
                    pass
            
            if colors[node] == BLACK:
                return False
            
            # Mark as currently being processed
            colors[node] = GRAY
            path.append(node)
            
            # Visit all neighbors
            for neighbor in self.adjacency_list[node]:
                if dfs_visit(neighbor, path):
                    return True
            
            # Mark as completely processed
            colors[node] = BLACK
            path.pop()
            return False
        
        # Start DFS from each unvisited node
        for node in self.nodes:
            if colors[node] == WHITE:
                dfs_visit(node, [])
        
        logger.info(f"Cycle detection complete. Found {len(cycles)} cycles")
        return cycles
    
    def get_topological_order(self) -> Optional[List[str]]:
        """
        Get topological ordering of nodes (only valid for DAGs)
        
        Returns:
            List of node IDs in topological order, or None if not a DAG
        """
        if not self._is_dag_kahns_algorithm():
            logger.warning("Cannot get topological order - graph contains cycles")
            return None
        
        # Re-run Kahn's algorithm to get the ordering
        working_in_degree = self.in_degree.copy()
        queue = deque([
            node for node in self.nodes 
            if working_in_degree[node] == 0
        ])
        
        topological_order = []
        
        while queue:
            current_node = queue.popleft()
            topological_order.append(current_node)
            
            for neighbor in self.adjacency_list[current_node]:
                working_in_degree[neighbor] -= 1
                if working_in_degree[neighbor] == 0:
                    queue.append(neighbor)
        
        return topological_order
    
    def get_graph_statistics(self) -> Dict[str, any]:
        """Get detailed graph statistics"""
        if not self.nodes:
            return {"empty_graph": True}
        
        return {
            "node_count": len(self.nodes),
            "edge_count": len(self.edges),
            "is_dag": self._is_dag_kahns_algorithm(),
            "max_in_degree": max(self.in_degree.values()) if self.in_degree else 0,
            "max_out_degree": max(self.out_degree.values()) if self.out_degree else 0,
            "nodes_with_no_inputs": [
                node for node, degree in self.in_degree.items() if degree == 0
            ],
            "nodes_with_no_outputs": [
                node for node, degree in self.out_degree.items() if degree == 0
            ]
        }
# backend/models.py
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Optional, Union
import re

class NodeData(BaseModel):
    """Node data model with flexible structure"""
    id: str = Field(..., description="Unique node identifier")
    type: str = Field(..., description="Node type (input, output, text, llm, etc.)")
    position: Dict[str, Union[int, float]] = Field(..., description="Node position {x, y}")
    data: Dict[str, Any] = Field(default_factory=dict, description="Node-specific data")
    
    @validator('id')
    def validate_id(cls, v):
        if not v or not isinstance(v, str):
            raise ValueError('Node ID must be a non-empty string')
        return v
    
    @validator('type')
    def validate_type(cls, v):
        allowed_types = {
            'input', 'output', 'text', 'llm', 'api', 
            'filter', 'transform', 'math', 'database', 'validator'
        }
        if v not in allowed_types:
            raise ValueError(f'Node type must be one of: {allowed_types}')
        return v
    
    @validator('position')
    def validate_position(cls, v):
        if not isinstance(v, dict) or 'x' not in v or 'y' not in v:
            raise ValueError('Position must be a dict with x and y coordinates')
        try:
            float(v['x'])
            float(v['y'])
        except (ValueError, TypeError):
            raise ValueError('Position coordinates must be numeric')
        return v
    
    class Config:
        schema_extra = {
            "example": {
                "id": "node_1",
                "type": "input",
                "position": {"x": 100.0, "y": 200.0},
                "data": {
                    "label": "Input Node",
                    "inputType": "file"
                }
            }
        }

class EdgeData(BaseModel):
    """Edge data model for connections between nodes"""
    id: str = Field(..., description="Unique edge identifier")
    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    sourceHandle: Optional[str] = Field(None, description="Source handle ID")
    targetHandle: Optional[str] = Field(None, description="Target handle ID")
    
    @validator('id', 'source', 'target')
    def validate_ids(cls, v):
        if not v or not isinstance(v, str):
            raise ValueError('IDs must be non-empty strings')
        return v
    
    @validator('target')
    def validate_no_self_loop(cls, v, values):
        if 'source' in values and v == values['source']:
            raise ValueError('Self-loops are not allowed')
        return v
    
    class Config:
        schema_extra = {
            "example": {
                "id": "edge_1",
                "source": "node_1",
                "target": "node_2",
                "sourceHandle": "output",
                "targetHandle": "input"
            }
        }

class PipelineRequest(BaseModel):
    """Request model for pipeline analysis"""
    nodes: List[NodeData] = Field(..., min_items=1, description="List of pipeline nodes")
    edges: List[EdgeData] = Field(default_factory=list, description="List of pipeline edges")
    
    @validator('nodes')
    def validate_unique_node_ids(cls, v):
        node_ids = [node.id for node in v]
        if len(node_ids) != len(set(node_ids)):
            raise ValueError('All node IDs must be unique')
        return v
    
    @validator('edges')
    def validate_edge_references(cls, v, values):
        if 'nodes' not in values:
            return v
        
        node_ids = {node.id for node in values['nodes']}
        edge_ids = []
        
        for edge in v:
            # Check unique edge IDs
            if edge.id in edge_ids:
                raise ValueError(f'Duplicate edge ID: {edge.id}')
            edge_ids.append(edge.id)
            
            # Check that source and target nodes exist
            if edge.source not in node_ids:
                raise ValueError(f'Edge {edge.id} references non-existent source node: {edge.source}')
            if edge.target not in node_ids:
                raise ValueError(f'Edge {edge.id} references non-existent target node: {edge.target}')
        
        return v
    
    class Config:
        schema_extra = {
            "example": {
                "nodes": [
                    {
                        "id": "input_1",
                        "type": "input",
                        "position": {"x": 100, "y": 100},
                        "data": {"label": "Data Input"}
                    },
                    {
                        "id": "text_1", 
                        "type": "text",
                        "position": {"x": 300, "y": 100},
                        "data": {"label": "Process Text", "text": "Hello {{name}}"}
                    },
                    {
                        "id": "output_1",
                        "type": "output", 
                        "position": {"x": 500, "y": 100},
                        "data": {"label": "Final Output"}
                    }
                ],
                "edges": [
                    {
                        "id": "edge_1",
                        "source": "input_1",
                        "target": "text_1"
                    },
                    {
                        "id": "edge_2", 
                        "source": "text_1",
                        "target": "output_1"
                    }
                ]
            }
        }

class PipelineResponse(BaseModel):
    """Response model for pipeline analysis results"""
    num_nodes: int = Field(..., ge=0, description="Total number of nodes")
    num_edges: int = Field(..., ge=0, description="Total number of edges") 
    is_dag: bool = Field(..., description="Whether pipeline forms a Directed Acyclic Graph")
    
    class Config:
        schema_extra = {
            "example": {
                "num_nodes": 3,
                "num_edges": 2,
                "is_dag": True
            }
        }

class ErrorResponse(BaseModel):
    """Error response model"""
    detail: str = Field(..., description="Error message")
    type: str = Field(default="validation_error", description="Error type")
    
    class Config:
        schema_extra = {
            "example": {
                "detail": "Pipeline must contain at least one node",
                "type": "validation_error"
            }
        }
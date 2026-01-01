# 📚 **VectorShift Pipeline Builder - Complete Technical Guide**

## 🎯 **Project Overview**

This is a **visual pipeline builder** application that allows users to create, connect, and validate data processing workflows. It's a full-stack application with:
- **Frontend**: React + ReactFlow (drag-and-drop visual editor)
- **Backend**: Python FastAPI (pipeline validation and analysis)
- **Core Feature**: DAG (Directed Acyclic Graph) validation to ensure pipelines have no circular dependencies

---

## 🏗️ **Architecture Breakdown**

### **1. Backend (Python FastAPI)**

#### **A. main.py - API Server**

**Purpose**: Entry point for the FastAPI server that handles HTTP requests

**Key Components**:

```python
# 1. FASTAPI APP INITIALIZATION
app = FastAPI(title="VectorShift Pipeline API", version="1.0.0")
```
- Creates the FastAPI application instance
- Sets title and version for API documentation

```python
# 2. CORS MIDDLEWARE
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
**Parameters**:
- `allow_origins`: List of frontend URLs allowed to access the API
- `allow_credentials`: Allows cookies and authentication
- `allow_methods`: Allows all HTTP methods (GET, POST, etc.)
- `allow_headers`: Allows all request headers

---

#### **B. Data Models (Pydantic)**

```python
class NodeData(BaseModel):
    label: Optional[str] = None  # Display name of the node
    type: Optional[str] = None   # Node category (input, output, llm, etc.)
    content: Optional[str] = None  # User-entered content
    inputs: Optional[List[str]] = None  # Input connection points
    outputs: Optional[List[str]] = None  # Output connection points
```
**What it does**: Defines the structure of node data with optional fields

```python
class PipelineNode(BaseModel):
    id: str  # Unique identifier (e.g., "node-1")
    type: str  # Node type (e.g., "input", "llm", "output")
    position: Dict[str, float]  # {x: 100, y: 200} - Canvas position
    data: NodeData  # Additional node information
```
**Parameters**:
- `id`: Unique string identifier for the node
- `type`: Category of node determining its behavior
- `position`: x,y coordinates on the canvas
- `data`: Nested object with node-specific details

```python
class PipelineEdge(BaseModel):
    id: str  # Unique edge identifier (e.g., "edge-1")
    source: str  # Source node ID
    target: str  # Target node ID
    sourceHandle: Optional[str] = None  # Specific output handle
    targetHandle: Optional[str] = None  # Specific input handle
```
**Parameters**:
- `source`: ID of the node where connection starts
- `target`: ID of the node where connection ends
- `sourceHandle`/`targetHandle`: When nodes have multiple connection points

---

#### **C. DAGAnalyzer Class**

**Purpose**: Analyzes pipeline structure to check if it's a valid DAG (no cycles)

```python
class DAGAnalyzer:
    def __init__(self, nodes: List[PipelineNode], edges: List[PipelineEdge]):
        self.nodes = {node.id: node for node in nodes}  # Dictionary for fast lookup
        self.edges = edges  # List of all connections
        self.graph = self._build_graph()  # Adjacency list representation
```
**What it does**: Converts nodes and edges into a graph structure for analysis

```python
def _build_graph(self) -> Dict[str, List[str]]:
    graph = defaultdict(list)
    
    # Initialize all nodes
    for node in self.nodes:
        graph[node] = []
    
    # Add edges (source -> target relationships)
    for edge in self.edges:
        if edge.source in self.nodes and edge.target in self.nodes:
            graph[edge.source].append(edge.target)
    
    return dict(graph)
```
**Returns**: Dictionary like `{"node-1": ["node-2", "node-3"], "node-2": []}`

```python
def is_dag(self) -> tuple:
    """
    Check if the graph is a Directed Acyclic Graph using DFS
    Returns: (is_dag: bool, cycle_path: List[str])
    """
    state = {node_id: 0 for node_id in self.nodes}  # 0=unvisited, 1=visiting, 2=visited
    cycle_path = []
    
    def dfs(node_id: str, path: List[str]) -> bool:
        if state[node_id] == 1:  # Currently visiting = cycle detected!
            cycle_start = path.index(node_id)
            cycle_path.extend(path[cycle_start:] + [node_id])
            return False  # Not a DAG
        
        if state[node_id] == 2:  # Already processed
            return True
        
        state[node_id] = 1  # Mark as visiting
        path.append(node_id)
        
        # Visit all connected nodes
        for neighbor in self.graph.get(node_id, []):
            if not dfs(neighbor, path):
                return False
        
        path.pop()
        state[node_id] = 2  # Mark as fully processed
        return True
```
**How it works**:
1. Uses **Depth-First Search (DFS)** with three states
2. **State 0** (white): Node not visited yet
3. **State 1** (gray): Node currently being visited
4. **State 2** (black): Node fully processed
5. If we encounter a **gray node** again → cycle found!

---

#### **D. API Endpoints**

```python
@app.post("/pipelines/parse", response_model=PipelineAnalysisResponse)
async def parse_pipeline(pipeline: PipelineData):
```
**Parameters**:
- `pipeline`: PipelineData object containing:
  - `nodes`: List[PipelineNode]
  - `edges`: List[PipelineEdge]

**Returns**: PipelineAnalysisResponse object with:
```python
{
    "num_nodes": 5,  # Total number of nodes
    "num_edges": 4,  # Total number of connections
    "is_dag": True,  # Whether it's a valid DAG
    "message": "Pipeline forms a valid DAG...",  # Detailed message
    "cycle_info": None,  # Cycle path if found
    "node_analysis": {  # Statistics
        "node_types": {"input": 1, "llm": 2, "output": 1},
        "isolated_nodes": [],  # Nodes with no connections
        "source_nodes": ["node-1"],  # Nodes with no inputs
        "sink_nodes": ["node-5"]  # Nodes with no outputs
    }
}
```

---

### **2. Backend - pipeline_analyzer.py**

#### **PipelineAnalyzer Class**

**Purpose**: Alternative analyzer using **Kahn's Algorithm** (topological sorting)

```python
class PipelineAnalyzer:
    def __init__(self):
        self.nodes: Set[str] = set()  # Set of node IDs
        self.edges: List[Tuple[str, str]] = []  # List of (source, target) tuples
        self.adjacency_list: Dict[str, List[str]] = defaultdict(list)  # graph[source] = [targets]
        self.in_degree: Dict[str, int] = defaultdict(int)  # Count of incoming edges
        self.out_degree: Dict[str, int] = defaultdict(int)  # Count of outgoing edges
```

```python
def _is_dag_kahns_algorithm(self) -> bool:
    """
    Kahn's Algorithm: Remove nodes with no incoming edges iteratively
    If we can remove all nodes → it's a DAG
    If nodes remain → they're in a cycle
    """
    
    # Copy in-degrees (we'll modify them)
    working_in_degree = self.in_degree.copy()
    
    # Start with nodes that have no incoming edges
    queue = deque([
        node for node in self.nodes 
        if working_in_degree[node] == 0
    ])
    
    processed_nodes = 0  # Counter
    
    while queue:
        current_node = queue.popleft()
        processed_nodes += 1  # We successfully processed this node
        
        # Remove edges from this node
        for neighbor in self.adjacency_list[current_node]:
            working_in_degree[neighbor] -= 1  # Reduce incoming edge count
            
            # If neighbor now has no incoming edges, add to queue
            if working_in_degree[neighbor] == 0:
                queue.append(neighbor)
    
    # If we processed all nodes, it's a DAG!
    return processed_nodes == len(self.nodes)
```

**How Kahn's Algorithm Works**:
1. Find all nodes with **in-degree = 0** (no incoming edges)
2. Remove them and update their neighbors
3. Repeat until no more nodes can be removed
4. If all nodes removed → DAG ✅
5. If nodes remain → they're in a cycle ❌

**Example**:
```
A → B → C
    ↓
    D

In-degrees: A=0, B=1, C=1, D=1
Step 1: Remove A (in-degree 0) → B's in-degree becomes 0
Step 2: Remove B → C and D's in-degree become 0
Step 3: Remove C and D
Result: All removed → It's a DAG!
```

---

### **3. Frontend (React)**

#### **A. App.jsx - Main Component**

```jsx
const App = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const reactFlowWrapper = useRef(null);
  
  const { nodes, edges, onNodesChange, onEdgesChange, setEdges } = useStore();
```
**Parameters**:
- `nodes`: Array of all nodes in the pipeline
- `edges`: Array of all connections
- `onNodesChange`: Handler for node updates (move, delete, etc.)
- `onEdgesChange`: Handler for edge updates

```jsx
const onConnect = useCallback((connection) => {
    const { source, target, sourceHandle, targetHandle } = connection;
    
    // Check if connection already exists
    const existingEdge = edges.find(
      edge => edge.source === source && 
              edge.target === target &&
              edge.sourceHandle === sourceHandle &&
              edge.targetHandle === targetHandle
    );
    
    if (existingEdge) {
      alert('Connection already exists!');
      return;
    }
    
    // Add new edge
    setEdges((eds) => addEdge(connection, eds));
  }, [edges, setEdges]);
```
**Parameters**:
- `connection.source`: Starting node ID
- `connection.target`: Ending node ID
- `connection.sourceHandle`: Specific output port
- `connection.targetHandle`: Specific input port

**What it does**: Prevents duplicate connections between same nodes

```jsx
<ReactFlow
  nodes={nodes}
  edges={edges}
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
  onConnect={onConnect}
  nodeTypes={nodeTypes}  // Custom node components
  connectionLineStyle={connectionLineStyle}
  defaultEdgeOptions={defaultEdgeOptions}
  fitView
>
```
**Parameters**:
- `nodeTypes`: Object mapping type names to React components
- `fitView`: Auto-zoom to fit all nodes in viewport
- `connectionLineStyle`: CSS for connection lines while dragging
- `defaultEdgeOptions`: Default styling for edges

---

#### **B. useStore.js - State Management (Zustand)**

```javascript
const useStore = create((set, get) => ({
  nodes: [],  // Array of nodes
  edges: [],  // Array of edges
  isLoading: false,  // Loading state during API calls
  error: null,  // Error message
  pipelineResult: null,  // Result from backend analysis
  deletedHistory: [],  // For undo functionality
```

```javascript
addNode: (type, data = {}) => {
    const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newNode = {
      id,  // Unique ID
      type,  // Node type (input, llm, output, etc.)
      position: data.position || { x: 250, y: 250 },  // Canvas position
      data: {
        label: data.label || `${type} Node`,
        ...data
      }
    };
    
    set((state) => ({
      nodes: [...state.nodes, newNode]
    }));
    
    return id;  // Return new node ID
  },
```
**Parameters**:
- `type`: String like "input", "llm", "output"
- `data`: Object with optional fields:
  - `position`: {x, y} coordinates
  - `label`: Display name
  - Any custom data fields

```javascript
onNodesChange: (changes) => {
    set((state) => {
      // Handle delete changes specially
      const deleteChanges = changes.filter(change => change.type === 'remove');
      
      if (deleteChanges.length > 0) {
        // Store deleted nodes for undo
        const deletedNodes = deleteChanges.map(change => 
          state.nodes.find(node => node.id === change.id)
        ).filter(Boolean);
        
        // Find connected edges
        const connectedEdges = state.edges.filter(edge =>
          deleteChanges.some(change => 
            edge.source === change.id || edge.target === change.id
          )
        );
        
        // Save to history
        const newHistory = [...state.deletedHistory, {
          type: 'reactflow_nodes',
          nodes: deletedNodes,
          edges: connectedEdges,
          timestamp: Date.now()
        }];
        
        return {
          nodes: applyNodeChanges(changes, state.nodes),
          edges: state.edges.filter(edge =>
            !deleteChanges.some(change => 
              edge.source === change.id || edge.target === change.id
            )
          ),
          deletedHistory: newHistory.slice(-10)  // Keep last 10
        };
      }
      
      return {
        nodes: applyNodeChanges(changes, state.nodes)
      };
    });
  },
```
**What it does**: 
1. Detects when nodes are deleted
2. Stores them in history for undo
3. Removes connected edges automatically
4. Keeps only last 10 deletions in history

---

#### **C. submit.js - API Communication**

```javascript
export const submitPipeline = async () => {
  const { nodes, edges, setLoading, setError, setPipelineResult } = useStore.getState();
  
  // Validation
  if (!nodes || nodes.length === 0) {
    alert('Please add nodes to the pipeline before submitting.');
    return null;
  }
  
  try {
    setLoading(true);
    setError(null);
    
    // Send POST request to backend
    const response = await fetch('http://localhost:8000/pipelines/parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nodes: nodes.map(node => ({
          id: node.id,  // Unique identifier
          type: node.type,  // Node type
          position: node.position,  // {x, y} coordinates
          data: node.data || {}  // Additional data
        })),
        edges: edges.map(edge => ({
          id: edge.id,  // Edge identifier
          source: edge.source,  // Source node ID
          target: edge.target,  // Target node ID
          sourceHandle: edge.sourceHandle || null,  // Output port
          targetHandle: edge.targetHandle || null  // Input port
        }))
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Backend error: ${response.status}`);
    }
    
    const result = await response.json();
    setPipelineResult(result);  // Store in state
    
    // Display results
    alert(
      `Pipeline Analysis Complete!\n\n` +
      `📊 Number of Nodes: ${result.num_nodes}\n` +
      `🔗 Number of Edges: ${result.num_edges}\n` +
      `${result.is_dag ? '✅' : '❌'} Is DAG: ${result.is_dag ? 'Yes' : 'No'}\n\n` +
      `${result.message || 'Analysis completed.'}`
    );
    
    return result;
    
  } catch (error) {
    console.error('Pipeline submission error:', error);
    setError(error.message);
    alert(`❌ Pipeline Analysis Failed\n\n${error.message}`);
    return null;
    
  } finally {
    setLoading(false);
  }
};
```

---

#### **D. BaseNode.jsx - Reusable Node Component**

```jsx
const BaseNode = memo(({ 
  id,  // Node unique identifier
  data,  // Node data object
  selected,  // Boolean: is this node selected?
  title = "Node",  // Display title
  icon: IconComponent = null,  // Icon component
  headerColor = "bg-blue-50",  // Header background color
  headerTextColor = "text-blue-800",  // Header text color
  borderColor = "border-blue-200",  // Border color
  inputs = [],  // Array of input handles
  outputs = [],  // Array of output handles
  children,  // Content to render inside node
  className = "",  // Additional CSS classes
  collapsible = false,  // Can node be collapsed?
  minWidth = 200,  // Minimum width in pixels
  maxWidth = 500  // Maximum width in pixels
}) => {
```

**Handle Configuration Example**:
```jsx
inputs = [
  {
    id: "input-1",  // Unique handle ID
    label: "Input 1",  // Tooltip text
    position: "50%",  // Vertical position (percentage)
    style: {}  // Additional CSS
  },
  {
    id: "input-2",
    label: "Input 2",
    position: "100%"
  }
]

outputs = [
  {
    id: "output-1",
    label: "Result",
    position: "50%"
  }
]
```

**Handle Rendering**:
```jsx
{inputs.map((input, index) => (
  <Handle
    key={`input-${input.id || index}`}
    type="target"  // This is an input (connection target)
    position={Position.Left}  // Left side of node
    id={input.id || `input-${index}`}
    style={{
      ...inputHandleStyle,  // Base styling
      top: input.position || `${((index + 1) * 100) / (inputs.length + 1)}%`,  // Auto-distribute
      ...input.style  // Override styling
    }}
    title={input.label || `Input ${index + 1}`}  // Tooltip
  />
))}
```

---

## 🔄 **Complete Data Flow**

### **1. User Creates Pipeline (Frontend)**
```
User clicks "Add Node" 
→ useStore.addNode(type, data) 
→ New node object created with unique ID
→ Added to nodes array
→ ReactFlow re-renders with new node
```

### **2. User Connects Nodes**
```
User drags from output handle to input handle
→ onConnect() triggered with connection data
→ Check for duplicate connection
→ If unique: addEdge() adds to edges array
→ ReactFlow re-renders with new edge
```

### **3. User Submits Pipeline**
```
User clicks "Analyze Pipeline"
→ submitPipeline() called
→ Prepare nodes and edges data
→ POST to http://localhost:8000/pipelines/parse
→ Backend receives request
```

### **4. Backend Processing**
```
FastAPI receives PipelineData
→ Validate node IDs are unique
→ Validate edges reference existing nodes
→ Create DAGAnalyzer instance
→ Build adjacency list graph
→ Run is_dag() using DFS algorithm
→ Calculate statistics (node types, isolated nodes, etc.)
→ Generate detailed message
→ Return PipelineAnalysisResponse
```

### **5. Frontend Displays Results**
```
Backend sends JSON response
→ submitPipeline() receives result
→ Store in pipelineResult state
→ Display alert with results
→ Show if it's a valid DAG
→ Show cycle information if found
```

---

## 🎓 **Key Concepts Explained**

### **What is a DAG?**
**Directed Acyclic Graph** = A graph with:
- **Directed**: Edges have a direction (A → B, not B → A)
- **Acyclic**: No cycles (can't start at a node and return to it)

**Valid DAG**:
```
Input → LLM → Text → Output
         ↓
        API
```

**Invalid (has cycle)**:
```
A → B → C
↑       ↓
←───────
```

### **Why Check for DAG?**
Data pipelines must be DAGs because:
1. **Execution Order**: Can determine which node runs first
2. **No Infinite Loops**: Cycles would cause infinite processing
3. **Data Flow**: Clear direction of data movement

---

## 🔍 **Algorithm Comparison: DFS vs Kahn's**

### **Depth-First Search (DFS) - Used in main.py**

**How it works**:
- Recursively visits nodes and tracks their state
- Three states: Unvisited (white), Visiting (gray), Visited (black)
- If we visit a gray node again → cycle detected

**Advantages**:
- ✅ Simple to understand and implement
- ✅ Can easily find the exact cycle path
- ✅ Works well for small to medium graphs

**Time Complexity**: O(V + E) where V = nodes, E = edges

**Code Pattern**:
```python
def dfs(node, state, path):
    if state[node] == VISITING:  # Gray node
        return "Cycle found!"
    
    state[node] = VISITING
    for neighbor in graph[node]:
        dfs(neighbor, state, path)
    state[node] = VISITED
```

---

### **Kahn's Algorithm - Used in pipeline_analyzer.py**

**How it works**:
- Repeatedly removes nodes with no incoming edges
- Updates neighbors' in-degree counts
- If all nodes removed → DAG, otherwise → cycle

**Advantages**:
- ✅ Also produces topological sort order
- ✅ Easier to visualize step-by-step
- ✅ Better for parallel processing

**Time Complexity**: O(V + E)

**Code Pattern**:
```python
queue = [nodes with in_degree == 0]
processed = 0

while queue:
    node = queue.pop()
    processed += 1
    
    for neighbor in node.neighbors:
        in_degree[neighbor] -= 1
        if in_degree[neighbor] == 0:
            queue.add(neighbor)

return processed == total_nodes
```

---

## 🚀 **How to Explain to Anyone**

### **Simple Explanation (Non-Technical)**:
"This is a visual tool where you drag and drop boxes (nodes) and connect them with arrows (edges). Each box represents a step in a data processing workflow. The system checks if your workflow is valid - meaning it doesn't have any circular loops that would cause it to run forever."

### **Technical Explanation (Developer)**:
"It's a full-stack application with a React frontend using ReactFlow for visual editing and a FastAPI backend for validation. When users create a pipeline, the frontend sends the graph structure to the backend, which uses graph algorithms (DFS or Kahn's) to verify it's a Directed Acyclic Graph. This ensures the pipeline has a valid execution order and no circular dependencies."

### **Interview Explanation (Detailed)**:
"I built a visual pipeline editor using React and ReactFlow for the UI, with Python FastAPI handling the backend logic. The key challenge was implementing DAG validation using two algorithms: Depth-First Search for cycle detection and Kahn's algorithm for topological sorting. The state management uses Zustand for optimal performance, and I implemented features like duplicate connection prevention, undo functionality, and comprehensive error handling with detailed user feedback."

---

## 📋 **Summary of All Parameters**

### **Backend Parameters**

#### **PipelineData**
- `nodes`: List[PipelineNode] - Array of all nodes
- `edges`: List[PipelineEdge] - Array of all connections

#### **PipelineNode**
- `id`: str - Unique identifier (e.g., "input-1234567")
- `type`: str - Node category (input, output, llm, text, api, etc.)
- `position`: Dict[str, float] - Canvas coordinates {x: 100.0, y: 200.0}
- `data`: NodeData - Additional node information

#### **NodeData**
- `label`: Optional[str] - Display name shown in UI
- `type`: Optional[str] - Additional type information
- `content`: Optional[str] - User-entered text content
- `inputs`: Optional[List[str]] - List of input handle IDs
- `outputs`: Optional[List[str]] - List of output handle IDs

#### **PipelineEdge**
- `id`: str - Unique edge identifier (e.g., "edge-1-2")
- `source`: str - Source node ID (where arrow starts)
- `target`: str - Target node ID (where arrow ends)
- `sourceHandle`: Optional[str] - Specific output port ID
- `targetHandle`: Optional[str] - Specific input port ID

#### **PipelineAnalysisResponse**
- `num_nodes`: int - Total count of nodes in pipeline
- `num_edges`: int - Total count of edges in pipeline
- `is_dag`: bool - True if valid DAG, False if cycles exist
- `message`: str - Detailed human-readable analysis
- `cycle_info`: Optional[List[str]] - Node IDs in cycle path
- `node_analysis`: Optional[Dict] - Statistics about the pipeline

#### **CORS Middleware**
- `allow_origins`: List[str] - Allowed frontend URLs
- `allow_credentials`: bool - Allow cookies/auth (True)
- `allow_methods`: List[str] - Allowed HTTP methods (["*"])
- `allow_headers`: List[str] - Allowed request headers (["*"])

---

### **Frontend Parameters**

#### **ReactFlow Component**
- `nodes`: Node[] - Array of node objects in state
- `edges`: Edge[] - Array of edge objects in state
- `onNodesChange`: (changes: NodeChange[]) => void - Handle node updates
- `onEdgesChange`: (changes: EdgeChange[]) => void - Handle edge updates
- `onConnect`: (connection: Connection) => void - Handle new connections
- `nodeTypes`: Record<string, ComponentType> - Map of node type to component
- `connectionLineStyle`: CSSProperties - Style for connection preview
- `defaultEdgeOptions`: EdgeOptions - Default edge styling
- `fitView`: boolean - Auto-zoom to fit content

#### **Connection Object**
- `source`: string - Starting node ID
- `target`: string - Ending node ID
- `sourceHandle`: string | null - Output port ID
- `targetHandle`: string | null - Input port ID

#### **BaseNode Props**
- `id`: string - Unique node identifier
- `data`: object - Node data from state
- `selected`: boolean - Is node currently selected
- `title`: string - Header text (default: "Node")
- `icon`: ComponentType - Icon component to display
- `headerColor`: string - Tailwind class for header background
- `headerTextColor`: string - Tailwind class for header text
- `borderColor`: string - Tailwind class for border
- `inputs`: HandleConfig[] - Array of input handle configs
- `outputs`: HandleConfig[] - Array of output handle configs
- `children`: ReactNode - Content inside the node
- `className`: string - Additional CSS classes
- `collapsible`: boolean - Can node be collapsed (default: false)
- `minWidth`: number - Minimum width in pixels (default: 200)
- `maxWidth`: number - Maximum width in pixels (default: 500)

#### **HandleConfig**
- `id`: string - Unique handle identifier
- `label`: string - Tooltip text on hover
- `position`: string - Vertical position ("50%", "33%", etc.)
- `style`: CSSProperties - Additional styling overrides

#### **Zustand Store State**
- `nodes`: Node[] - Current nodes in pipeline
- `edges`: Edge[] - Current edges in pipeline
- `isLoading`: boolean - API request in progress
- `error`: string | null - Error message if any
- `pipelineResult`: object | null - Last analysis result
- `deletedHistory`: DeletedItem[] - Stack for undo (max 10)

#### **Store Actions**
- `addNode(type: string, data?: object): string` - Add new node
- `updateNodeData(id: string, data: object): void` - Update node
- `setEdges(edges: Edge[]): void` - Replace all edges
- `onNodesChange(changes: NodeChange[]): void` - Apply changes
- `onEdgesChange(changes: EdgeChange[]): void` - Apply changes
- `deleteSelected(): void` - Delete selected items
- `undoDelete(): void` - Restore last deletion
- `setLoading(loading: boolean): void` - Set loading state
- `setError(error: string | null): void` - Set error state
- `setPipelineResult(result: object): void` - Store analysis result

---

## 🔧 **Technical Implementation Details**

### **Graph Representation**

#### **Adjacency List Format**
```python
graph = {
    "node-1": ["node-2", "node-3"],  # node-1 connects to node-2 and node-3
    "node-2": ["node-4"],             # node-2 connects to node-4
    "node-3": ["node-4"],             # node-3 connects to node-4
    "node-4": []                      # node-4 has no outgoing connections
}
```

#### **In-Degree and Out-Degree**
```python
in_degree = {
    "node-1": 0,  # No incoming edges (source node)
    "node-2": 1,  # One incoming edge (from node-1)
    "node-3": 1,  # One incoming edge (from node-1)
    "node-4": 2   # Two incoming edges (from node-2 and node-3)
}

out_degree = {
    "node-1": 2,  # Two outgoing edges
    "node-2": 1,  # One outgoing edge
    "node-3": 1,  # One outgoing edge
    "node-4": 0   # No outgoing edges (sink node)
}
```

---

### **State Management with Zustand**

**Why Zustand?**
- ✅ Simpler than Redux (less boilerplate)
- ✅ Better performance (only re-renders what changed)
- ✅ TypeScript support out of the box
- ✅ No Provider wrapper needed
- ✅ Works with React hooks naturally

**Example Usage**:
```javascript
// Create store
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 }))
}));

// Use in component
function Counter() {
  const { count, increment } = useStore();
  return <button onClick={increment}>{count}</button>;
}
```

---

### **ReactFlow Integration**

**Node Changes Handling**:
```javascript
// ReactFlow sends changes like:
[
  { type: 'position', id: 'node-1', position: { x: 150, y: 250 } },
  { type: 'remove', id: 'node-2' },
  { type: 'select', id: 'node-3', selected: true }
]

// applyNodeChanges applies these changes to the nodes array
```

**Edge Changes Handling**:
```javascript
// ReactFlow sends changes like:
[
  { type: 'remove', id: 'edge-1' },
  { type: 'select', id: 'edge-2', selected: true }
]

// applyEdgeChanges applies these changes to the edges array
```

---

## 🎨 **Styling and Visual Design**

### **Color Scheme**
- **Primary**: Indigo/Purple (#818cf8)
- **Success**: Green (#10b981)
- **Error**: Red (#f87171)
- **Warning**: Yellow/Amber (#fbbf24)
- **Background**: Slate/Gray gradients

### **Node Styling**
- **Border**: 2px solid with color based on type
- **Shadow**: Elevated shadow on hover/select
- **Border Radius**: Rounded corners (rounded-2xl = 1rem)
- **Selected State**: Ring effect with scale transform

### **Handle Styling**
```javascript
const handleStyle = {
  width: '14px',
  height: '14px',
  border: '3px solid #ffffff',
  borderRadius: '50%',
  background: '#818cf8',
  boxShadow: '0 4px 12px rgba(129, 140, 248, 0.3)'
};
```

---

## 🐛 **Error Handling**

### **Frontend Error Handling**
```javascript
try {
  const response = await fetch('http://localhost:8000/pipelines/parse', {...});
  
  if (!response.ok) {
    // HTTP error (4xx, 5xx)
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Backend error: ${response.status}`);
  }
  
  const result = await response.json();
  // Success handling
  
} catch (error) {
  // Network error or thrown error
  if (error.message.includes('Failed to fetch')) {
    // Backend not running
    alert('Cannot connect to backend server.');
  } else {
    // Other errors
    alert(`Analysis failed: ${error.message}`);
  }
}
```

### **Backend Error Handling**
```python
try:
    # Analysis logic
    analyzer = DAGAnalyzer(pipeline.nodes, pipeline.edges)
    is_dag, cycle_path = analyzer.is_dag()
    
except HTTPException:
    # Re-raise HTTP exceptions
    raise
    
except Exception as e:
    # Catch all other errors
    logger.error(f"Error analyzing pipeline: {str(e)}")
    raise HTTPException(
        status_code=500,
        detail=f"Internal server error: {str(e)}"
    )
```

---

## 📊 **Performance Considerations**

### **Time Complexity**
- **DFS Algorithm**: O(V + E) - Visit each node and edge once
- **Kahn's Algorithm**: O(V + E) - Process each node and edge once
- **Graph Building**: O(E) - Iterate through edges

Where:
- V = number of nodes (vertices)
- E = number of edges

### **Space Complexity**
- **Adjacency List**: O(V + E)
- **State Tracking**: O(V)
- **Deleted History**: O(10 × (V + E)) - Limited to 10 items

### **Optimization Techniques**
1. **Memoization**: React.memo() wraps BaseNode to prevent re-renders
2. **useCallback**: Prevents function recreation on every render
3. **Zustand Selectors**: Only re-render components that use changed data
4. **Lazy Loading**: Welcome screen delays ReactFlow initialization

---

## 🧪 **Testing Scenarios**

### **Test Case 1: Simple Linear Pipeline**
```
Input → LLM → Output
```
**Expected**: ✅ Valid DAG, 3 nodes, 2 edges

### **Test Case 2: Branching Pipeline**
```
Input → LLM → Output 1
        ↓
     Output 2
```
**Expected**: ✅ Valid DAG, 4 nodes, 3 edges

### **Test Case 3: Circular Dependency**
```
A → B → C
↑       ↓
←───────
```
**Expected**: ❌ Not a DAG, cycle detected [A, B, C, A]

### **Test Case 4: Isolated Nodes**
```
Input → LLM → Output

API (not connected)
```
**Expected**: ✅ Valid DAG with warning about isolated node

### **Test Case 5: Multiple Source/Sink Nodes**
```
Input 1 →   → Output 1
         LLM
Input 2 →   → Output 2
```
**Expected**: ✅ Valid DAG, multiple sources and sinks

---

## 🚀 **Deployment Considerations**

### **Backend Deployment**
```bash
# Production server
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# With HTTPS
uvicorn main:app --host 0.0.0.0 --port 443 --ssl-keyfile key.pem --ssl-certfile cert.pem
```

### **Frontend Build**
```bash
# Build for production
npm run build

# Output: dist/ folder with optimized assets
```

### **Environment Variables**
```javascript
// Frontend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Backend
PORT = os.getenv('PORT', 8000)
```

---

## 📚 **Learning Resources**

### **Key Concepts to Master**
1. **Graph Theory**: DAG, topological sort, cycle detection
2. **React**: Hooks, state management, component lifecycle
3. **FastAPI**: Async/await, Pydantic models, CORS
4. **ReactFlow**: Custom nodes, handles, connections
5. **Algorithms**: DFS, BFS, Kahn's algorithm

### **Related Topics**
- **Workflow Orchestration**: Apache Airflow, Prefect
- **Data Flow Programming**: Node-RED, n8n
- **Graph Databases**: Neo4j, graph queries
- **Pipeline Tools**: Jenkins, GitLab CI/CD

---

## 🎯 **Key Takeaways**

1. **DAG Validation is Critical**: Ensures workflows can execute without infinite loops
2. **Two Algorithms Available**: DFS and Kahn's both work with O(V+E) complexity
3. **Full-Stack Integration**: React frontend seamlessly communicates with FastAPI backend
4. **User Experience**: Duplicate connection prevention, undo functionality, detailed feedback
5. **Extensible Design**: Easy to add new node types and validation rules
6. **Production Ready**: Error handling, logging, CORS, validation all implemented

---

## 💡 **Interview Tips**

### **What to Emphasize**
1. **Problem Solving**: "I identified the need for DAG validation and implemented two algorithms"
2. **Architecture**: "Separation of concerns - React handles UI, FastAPI handles validation"
3. **User Experience**: "Added features like duplicate prevention and undo functionality"
4. **Code Quality**: "Used TypeScript concepts, proper error handling, logging"

### **Common Questions & Answers**

**Q: Why did you use FastAPI instead of Flask?**
A: "FastAPI provides automatic API documentation, built-in data validation with Pydantic, and better async support. The interactive docs at /docs make testing easier."

**Q: How would you scale this for thousands of nodes?**
A: "I'd implement pagination for large graphs, use web workers for heavy computation, add caching for repeated analyses, and consider graph database storage for complex queries."

**Q: What if users want to save their pipelines?**
A: "I'd add a database layer (PostgreSQL), implement authentication, and create save/load endpoints. The pipeline JSON is already serializable, so persistence would be straightforward."

---

## 🔮 **Future Enhancements**

### **Potential Features**
1. **Real Execution**: Actually run the pipeline and pass data between nodes
2. **Node Templates**: Pre-built node configurations for common tasks
3. **Version Control**: Track changes and revert to previous versions
4. **Collaboration**: Multiple users editing same pipeline
5. **Auto-Layout**: Automatically organize nodes for clarity
6. **Performance Metrics**: Show execution time for each node
7. **Data Preview**: View data flowing through connections
8. **Export Options**: Generate code from visual pipeline

---

## 📝 **Summary**

This **VectorShift Pipeline Builder** demonstrates:
- ✅ Full-stack development (React + FastAPI)
- ✅ Graph algorithms (DFS + Kahn's)
- ✅ State management (Zustand)
- ✅ Visual programming (ReactFlow)
- ✅ API design and validation
- ✅ Error handling and user feedback
- ✅ Modern UI/UX practices

**Total Lines of Code**: ~3000+ across frontend and backend
**Technologies**: React, ReactFlow, Zustand, FastAPI, Pydantic, Python, JavaScript
**Core Algorithm**: DAG validation using Depth-First Search

---

**Created**: January 1, 2026
**Purpose**: Technical documentation for explaining the VectorShift Pipeline Builder project
**Audience**: Developers, interviewers, technical stakeholders

---

*This guide covers every aspect of the pipeline builder with detailed explanations of code, parameters, algorithms, and architecture. Use it to confidently explain your project to anyone!* 🎉

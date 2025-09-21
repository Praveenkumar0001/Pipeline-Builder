# VectorShift Pipeline Builder - Setup Guide
## 🚀 Quick Start
### Prerequisites
- Node.js 18+ 
- Python 3.8+
- pip (Python package manager)
- npm or yarn

### 1. Project Structure Setup
Create the project directory structure:

```bash
mkdir vectorshift-pipeline
cd vectorshift-pipeline

# Create backend directory
mkdir backend
mkdir backend/static

# Create frontend directory  
mkdir frontend
mkdir frontend/src
mkdir frontend/src/components
mkdir frontend/src/components/nodes
mkdir frontend/src/components/ui
mkdir frontend/src/components/flow
mkdir frontend/src/store
mkdir frontend/src/utils
mkdir frontend/public
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn pydantic python-multipart

# Create the backend files (copy from artifacts above):
# - main.py
# - models.py  
# - pipeline_analyzer.py
# - requirements.txt

# Start backend server
python main.py
```

The backend will run on `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Initialize package.json (copy from artifact above)
# Install dependencies
npm install

# Create all component files (copy from artifacts above):
# - src/main.jsx
# - src/App.jsx  
# - src/index.css
# - src/store/useStore.js
# - src/components/nodes/BaseNode.jsx
# - src/components/nodes/TextNode.jsx
# - src/components/nodes/InputNode.jsx
# - src/components/nodes/OutputNode.jsx
# - src/components/nodes/LLMNode.jsx
# - src/components/nodes/APINode.jsx
# - src/components/nodes/CustomNodes.jsx
# - src/components/nodes/nodeTypes.js
# - src/components/ui/Toolbar.jsx
# - src/components/ui/SubmitButton.jsx
# - src/components/flow/PipelineFlow.jsx

# Create configuration files:
# - tailwind.config.js
# - postcss.config.js  
# - vite.config.js
# - index.html

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

### 4. File Checklist

#### Backend Files:
- ✅ `backend/main.py` - FastAPI application
- ✅ `backend/models.py` - Pydantic models  
- ✅ `backend/pipeline_analyzer.py` - DAG analysis logic
- ✅ `backend/requirements.txt` - Python dependencies

#### Frontend Files:
- ✅ `frontend/package.json` - NPM dependencies
- ✅ `frontend/index.html` - HTML entry point
- ✅ `frontend/vite.config.js` - Vite configuration
- ✅ `frontend/tailwind.config.js` - Tailwind CSS config
- ✅ `frontend/postcss.config.js` - PostCSS configuration
- ✅ `frontend/src/main.jsx` - React entry point
- ✅ `frontend/src/App.jsx` - Main App component
- ✅ `frontend/src/index.css` - Global styles
- ✅ `frontend/src/store/useStore.js` - Zustand state management
- ✅ `frontend/src/components/nodes/BaseNode.jsx` - Base node abstraction
- ✅ `frontend/src/components/nodes/TextNode.jsx` - Text node with variable parsing
- ✅ `frontend/src/components/nodes/InputNode.jsx` - Input node
- ✅ `frontend/src/components/nodes/OutputNode.jsx` - Output node  
- ✅ `frontend/src/components/nodes/LLMNode.jsx` - LLM node
- ✅ `frontend/src/components/nodes/APINode.jsx` - API node
- ✅ `frontend/src/components/nodes/CustomNodes.jsx` - Additional custom nodes
- ✅ `frontend/src/components/nodes/nodeTypes.js` - Node registry
- ✅ `frontend/src/components/ui/Toolbar.jsx` - Node toolbar
- ✅ `frontend/src/components/ui/SubmitButton.jsx` - Pipeline submission
- ✅ `frontend/src/components/flow/PipelineFlow.jsx` - Main flow component

## 🎯 Testing the Application

### 1. Start Both Servers
```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python main.py

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 2. Test Basic Functionality

1. **Add Nodes**: Click toolbar buttons to add different node types
2. **Connect Nodes**: Drag from output handles (right) to input handles (left)
3. **Configure Nodes**: Click on nodes to edit their properties
4. **Test Text Variables**: In Text node, type `Hello {{name}}` to see dynamic handles
5. **Submit Pipeline**: Click "Submit Pipeline" to analyze the graph

### 3. Expected Features

#### Node Abstraction ✅
- All nodes use the same BaseNode component
- Easy to add new node types
- Consistent styling and behavior

#### Dynamic Handles ✅  
- Text nodes parse `{{variables}}` and create input handles
- Auto-resizing text areas
- Real-time variable detection

#### Backend Integration ✅
- Pipeline data sent to FastAPI backend
- DAG validation with cycle detection
- Real-time analysis results

#### Professional UI ✅
- Modern TailwindCSS styling
- Responsive design
- Interactive components
- Visual feedback

## 🔧 Development Tips

### Adding New Node Types

1. Create component in `src/components/nodes/`:
```jsx
import React, { useState } from 'react';
import { YourIcon } from 'lucide-react';
import BaseNode from './BaseNode';
import useStore from '../../store/useStore';

const YourNode = ({ id, data }) => {
  const [yourProperty, setYourProperty] = useState(data?.yourProperty || '');
  const updateNode = useStore((state) => state.updateNode);

  return (
    <BaseNode
      data={data}
      title="Your Node"
      titleIcon={<YourIcon size={16} />}
      inputs={['input1', 'input2']}
      outputs={['output']}
    >
      {/* Your custom UI here */}
    </BaseNode>
  );
};

export default YourNode;
```

2. Register in `nodeTypes.js`:
```javascript
import YourNode from './YourNode';

export const nodeTypes = {
  // ... existing nodes
  'yournode': YourNode,
};

export const nodeConfigs = {
  // ... existing configs  
  yournode: {
    type: 'yournode',
    data: { yourProperty: 'default' },
    position: { x: 0, y: 0 }
  }
};
```

3. Add to toolbar in `Toolbar.jsx`:
```javascript
const nodeButtons = [
  // ... existing buttons
  { type: 'yournode', label: 'Your Node', icon: YourIcon, color: 'bg-purple-50 hover:bg-purple-100 border-purple-200' },
];
```

### Backend Extensions

To add custom pipeline analysis:

```python
# In pipeline_analyzer.py
def get_advanced_analysis(self) -> Dict:
    """Add your custom analysis here"""
    return {
        "num_nodes": len(self.nodes),
        "num_edges": len(self.edges),
        "is_dag": self.is_dag(),
        "complexity_score": self.calculate_complexity(),
        "critical_path": self.find_critical_path(),
        # Add your metrics
    }
```

## 🚀 Production Deployment

### Backend (FastAPI)
```bash
# Install production server
pip install gunicorn

# Run with gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000
```

### Frontend (React)
```bash
# Build for production
npm run build

# Serve with nginx/apache or deploy to Vercel/Netlify
```

### Docker Setup (Optional)

**Backend Dockerfile:**
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
EXPOSE 80
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    
  frontend:
    build: ./frontend  
    ports:
      - "3000:80"
    depends_on:
      - backend
```

## 🐛 Troubleshooting

### Common Issues:

1. **CORS Error**: Make sure backend CORS is configured for your frontend URL
2. **Node Not Rendering**: Check if node type is registered in `nodeTypes.js`
3. **Connection Issues**: Verify handle IDs match between source and target
4. **Styling Problems**: Ensure Tailwind CSS is properly configured
5. **State Not Updating**: Check Zustand store actions are called correctly

### Performance Optimization:

1. **Large Pipelines**: Implement virtualization for 1000+ nodes
2. **Memory Usage**: Use React.memo for node components
3. **Bundle Size**: Lazy load node types
4. **API Calls**: Debounce pipeline submissions

## 📝 Next Steps

### Potential Enhancements:

1. **Save/Load Pipelines**: Add persistence layer
2. **Real Execution**: Actually run pipelines, not just analyze
3. **Collaboration**: Multi-user editing
4. **Templates**: Pre-built pipeline templates
5. **Version Control**: Pipeline versioning system
6. **Monitoring**: Pipeline execution monitoring
7. **Integrations**: Connect to external services
8. **AI Assistant**: AI-powered pipeline suggestions

## 🎉 Congratulations!

You now have a fully functional pipeline builder with:
- ✅ Modern, scalable architecture (SAN model)
- ✅ Visual drag-and-drop interface  
- ✅ 10 different node types
- ✅ Dynamic handle generation
- ✅ Backend pipeline analysis
- ✅ Professional UI/UX
- ✅ Easy extensibility

The system is production-ready and can be extended for various use cases like data processing, AI workflows, automation pipelines, and more!
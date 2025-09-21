import React, { useState, useCallback, useEffect } from 'react';
import { 
  Trash2, 
  X, 
  AlertTriangle,
  Keyboard,
  RotateCcw,
  ShieldCheck,
  Zap,
  MousePointer,
  Eye,
  EyeOff,
  CheckSquare,
  Square
} from 'lucide-react';

const DeleteToolbar = ({ 
  nodes, 
  edges, 
  onDeleteSelected, 
  onDeleteAll, 
  onUndoDelete,
  onSelectAll,
  onClearSelection,
  deletedHistory = [],
  className = ""
}) => {
  const [deleteMode, setDeleteMode] = useState('normal');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationType, setConfirmationType] = useState(null);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Get selected counts
  const selectedNodes = nodes.filter(n => n.selected);
  const selectedEdges = edges.filter(e => e.selected);
  const hasSelection = selectedNodes.length > 0 || selectedEdges.length > 0;
  const allSelected = nodes.length > 0 && edges.length > 0 && 
    nodes.every(n => n.selected) && edges.every(e => e.selected);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only handle shortcuts if not typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Delete key
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (hasSelection) {
          if (deleteMode === 'protected') {
            setConfirmationType('selected');
            setShowConfirmation(true);
          } else {
            onDeleteSelected();
          }
        }
      }
      
      // Ctrl/Cmd + Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (deletedHistory.length > 0) {
          onUndoDelete();
        }
      }

      // Ctrl/Cmd + A for select all
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        onSelectAll();
      }

      // Escape to clear selection
      if (e.key === 'Escape') {
        onClearSelection();
        setShowConfirmation(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [hasSelection, deleteMode, onDeleteSelected, onUndoDelete, onSelectAll, onClearSelection, deletedHistory.length]);

  const handleDeleteClick = useCallback((type) => {
    if (deleteMode === 'protected' || type === 'all') {
      setConfirmationType(type);
      setShowConfirmation(true);
    } else if (type === 'selected') {
      onDeleteSelected();
    } else if (type === 'all') {
      onDeleteAll();
    }
  }, [deleteMode, onDeleteSelected, onDeleteAll]);

  const handleConfirmedDelete = useCallback(() => {
    if (confirmationType === 'selected') {
      onDeleteSelected();
    } else if (confirmationType === 'all') {
      onDeleteAll();
    }
    setShowConfirmation(false);
    setConfirmationType(null);
  }, [confirmationType, onDeleteSelected, onDeleteAll]);

  const getDeleteModeIcon = () => {
    switch (deleteMode) {
      case 'protected': return <ShieldCheck className="w-4 h-4" />;
      case 'instant': return <Zap className="w-4 h-4" />;
      default: return <Trash2 className="w-4 h-4" />;
    }
  };

  const getDeleteModeColor = () => {
    switch (deleteMode) {
      case 'protected': return 'from-green-500 to-emerald-600';
      case 'instant': return 'from-red-500 to-pink-600';
      default: return 'from-blue-500 to-indigo-600';
    }
  };

  // Compact view when not expanded
  if (!isExpanded) {
    return (
      <div className={`bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(true)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            title="Expand delete controls"
          >
            <Trash2 className="w-5 h-5 text-gray-600" />
          </button>
          
          {hasSelection && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleDeleteClick('selected')}
                className={`px-3 py-1 bg-gradient-to-r ${getDeleteModeColor()} text-white rounded-lg hover:shadow-lg transition-all text-sm flex items-center space-x-1`}
              >
                {getDeleteModeIcon()}
                <span>Delete ({selectedNodes.length + selectedEdges.length})</span>
              </button>
            </div>
          )}
          
          {deletedHistory.length > 0 && (
            <button
              onClick={onUndoDelete}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Undo delete"
            >
              <RotateCcw className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 bg-[radial-gradient(circle_at_30%_20%,_white_0%,_transparent_50%)]"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-lg flex items-center">
              <Trash2 className="w-5 h-5 mr-2" />
              Delete Controls
            </h3>
            <p className="text-white/90 text-sm">
              {selectedNodes.length} nodes, {selectedEdges.length} edges selected
            </p>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/20 transition-all"
            title="Collapse controls"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 space-y-4">
        {/* Mode Selection */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Mode:</span>
            <select 
              value={deleteMode}
              onChange={(e) => setDeleteMode(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="normal">Normal</option>
              <option value="protected">Protected</option>
              <option value="instant">Instant</option>
            </select>
          </div>
          
          <button
            onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
            className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Keyboard className="w-3 h-3" />
            <span>Shortcuts</span>
            {showKeyboardShortcuts ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
        </div>

        {/* Keyboard Shortcuts */}
        {showKeyboardShortcuts && (
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <h4 className="font-medium text-gray-800 mb-2 text-sm">Keyboard Shortcuts</h4>
            <div className="grid grid-cols-1 gap-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Delete selected:</span>
                <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">Delete</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Undo delete:</span>
                <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">Ctrl+Z</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Select all:</span>
                <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">Ctrl+A</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Clear selection:</span>
                <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">Escape</kbd>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleDeleteClick('selected')}
            disabled={!hasSelection}
            className={`px-3 py-2 bg-gradient-to-r ${getDeleteModeColor()} text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 text-sm`}
          >
            {getDeleteModeIcon()}
            <span>Delete Selected</span>
          </button>

          <button
            onClick={() => handleDeleteClick('all')}
            disabled={nodes.length === 0 && edges.length === 0}
            className="px-3 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 text-sm"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Delete All</span>
          </button>

          <button
            onClick={onUndoDelete}
            disabled={deletedHistory.length === 0}
            className="px-3 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Undo</span>
          </button>

          <button
            onClick={allSelected ? onClearSelection : onSelectAll}
            disabled={nodes.length === 0 && edges.length === 0}
            className="px-3 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 text-sm"
          >
            {allSelected ? <Square className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
            <span>{allSelected ? 'Clear' : 'Select All'}</span>
          </button>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{nodes.length} nodes, {edges.length} edges</span>
          <span>{deletedHistory.length} actions in history</span>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl">
          <div className="bg-white rounded-xl shadow-2xl p-4 max-w-xs w-full mx-4">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Deletion</h3>
              <p className="text-gray-600 mb-4 text-sm">
                {confirmationType === 'selected' 
                  ? `Delete ${selectedNodes.length} nodes and ${selectedEdges.length} edges?`
                  : `Delete all ${nodes.length} nodes and ${edges.length} edges?`
                }
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmedDelete}
                  className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteToolbar;
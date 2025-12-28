import React, { memo, useMemo } from 'react';
import { Code2 } from 'lucide-react';
import BaseNode from './BaseNode';

function normalizeHandleId(prefix, label, index) {
  const base = String(label ?? '').trim();
  if (!base) return `${prefix}-${index}`;
  return `${prefix}-${base}`
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const BaseNodeNode = memo(({ id, data, selected }) => {
  const manualConfig = data?.manualConfig;

  const title = manualConfig?.title || data?.label || 'Base Node';
  const description = manualConfig?.content || data?.description || 'Custom node built on BaseNode';

  const inputs = useMemo(() => {
    const labels = Array.isArray(manualConfig?.inputs) ? manualConfig.inputs : [];
    return labels.map((label, index) => ({
      id: normalizeHandleId('in', label, index),
      label: String(label || `Input ${index + 1}`),
    }));
  }, [manualConfig?.inputs]);

  const outputs = useMemo(() => {
    const labels = Array.isArray(manualConfig?.outputs) ? manualConfig.outputs : [];
    return labels.map((label, index) => ({
      id: normalizeHandleId('out', label, index),
      label: String(label || `Output ${index + 1}`),
    }));
  }, [manualConfig?.outputs]);

  const headerGradient = manualConfig?.color ? `bg-gradient-to-r ${manualConfig.color}` : 'bg-slate-50';
  const headerTextColor = manualConfig?.color ? 'text-white' : 'text-slate-800';

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      title={title}
      icon={Code2}
      headerColor={headerGradient}
      headerTextColor={headerTextColor}
      borderColor="border-slate-200"
      inputs={inputs}
      outputs={outputs}
      collapsible={true}
      minWidth={260}
      maxWidth={520}
    >
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-700">Description</div>
        <div className="text-sm text-slate-600 whitespace-pre-wrap">{description}</div>
      </div>
    </BaseNode>
  );
});

BaseNodeNode.displayName = 'BaseNodeNode';

export default BaseNodeNode;

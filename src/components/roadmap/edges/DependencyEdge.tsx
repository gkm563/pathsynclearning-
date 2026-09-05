"use client";

import React from 'react';
import { BaseEdge, getBezierPath } from '@xyflow/react';

export default function DependencyEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data
}: any) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const status = data?.status || 'locked';
  
  let stroke = 'var(--roadmap-edge)';
  if (status === 'completed') stroke = '#00c9a7';
  else if (status === 'in_progress') stroke = '#6c63ff';
  
  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          ...style,
          strokeWidth: 2.5,
          stroke,
          animation: status === 'in_progress' ? 'dashdraw 1s linear infinite' : 'none'
        }} 
      />
      {status === 'in_progress' && (
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes dashdraw {
            from { stroke-dashoffset: 10; }
            to { stroke-dashoffset: 0; }
          }
        `}} />
      )}
    </>
  );
}

"use client";

import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  Edge,
  Node as ReactFlowNode,
  Position,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';

import type { Roadmap, RoadmapNodeProgress, RoadmapNode as RTNode } from '@/types/roadmap';

import GoalNode from './nodes/GoalNode';
import SkillNode from './nodes/SkillNode';
import ProjectNode from './nodes/ProjectNode';
import MilestoneNode from './nodes/MilestoneNode';
import PhaseNode from './nodes/PhaseNode';
import DependencyEdge from './edges/DependencyEdge';
import RoadmapToolbar from './RoadmapToolbar';
import RoadmapDetailPanel from './RoadmapDetailPanel';
import RoadmapOverview from './RoadmapOverview';

const nodeTypes = {
  goal: GoalNode,
  skill: SkillNode,
  topic: SkillNode,
  project: ProjectNode,
  milestone: MilestoneNode,
  checkpoint: MilestoneNode,
  phase: PhaseNode,
  career: GoalNode,
  resource: SkillNode,
};
const edgeTypes = { dependency: DependencyEdge };

const getLayoutedElements = (nodes: ReactFlowNode[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, ranksep: 100, nodesep: 80 });

  nodes.forEach((node) => {
    let width = 220;
    let height = 80;

    if (node.type === 'goal') {
      width = 280;
      height = 100;
    } else if (node.type === 'project') {
      width = 240;
      height = 90;
    } else if (node.type === 'milestone' || node.type === 'checkpoint') {
      width = 180;
      height = 70;
    } else if (node.type === 'phase') {
      width = 260;
      height = 120;
    }

    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const width = nodeWithPosition?.width ?? 220;
    const height = nodeWithPosition?.height ?? 80;
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: (nodeWithPosition?.x ?? 0) - width / 2,
        y: (nodeWithPosition?.y ?? 0) - height / 2,
      },
    };
  });

  return { nodes: newNodes, edges };
};

export default function RoadmapCanvas({
  roadmap,
  progress,
  onStatusChange,
  onRegenerate,
  statusError,
}: {
  roadmap: Roadmap;
  progress: RoadmapNodeProgress[];
  onStatusChange: (nodeId: string, status: string) => void | Promise<void>;
  onRegenerate: () => void;
  statusError?: string | null;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<RTNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const rfRef = useRef<any>(null);
  const didFitRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {
          setIsFullscreen((prev) => !prev);
        });
      } else {
        setIsFullscreen((prev) => !prev);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = Boolean(document.fullscreenElement);
      setIsFullscreen(isFs);
      setTimeout(() => {
        rfRef.current?.fitView({ padding: 0.15, duration: 400 });
      }, 150);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const progressMap = useMemo(() => {
    const m = new Map<string, string>();
    progress.forEach((p) => m.set(p.nodeId, p.status));
    // Prefer status already merged onto roadmap nodes when progress rows are missing
    roadmap.nodes.forEach((n) => {
      if (!m.has(n.id) && n.status) m.set(n.id, n.status);
    });
    return m;
  }, [progress, roadmap.nodes]);

  const handleNodeClick = useCallback(
    (node: RTNode) => {
      setSelectedNode({
        ...node,
        status: (progressMap.get(node.id) || node.status || 'locked') as RTNode['status'],
      });
    },
    [progressMap],
  );

  // Keep detail panel status in sync after progress refetch
  useEffect(() => {
    setSelectedNode((prev) => {
      if (!prev) return prev;
      const nextStatus = progressMap.get(prev.id);
      if (!nextStatus || nextStatus === prev.status) return prev;
      return { ...prev, status: nextStatus as RTNode['status'] };
    });
  }, [progressMap]);

  useEffect(() => {
    if (!roadmap) return;

    const nodeIds = new Set(roadmap.nodes.map((n) => n.id));

    const initialNodes: ReactFlowNode[] = roadmap.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: { x: 0, y: 0 },
      data: {
        ...n,
        // Node components expect `label`; API/AI provide `title`
        label: n.title,
        status: progressMap.get(n.id) || 'locked',
        onClick: () => handleNodeClick(n),
      },
    }));

    const validEdges = roadmap.edges.filter(
      (e) => nodeIds.has(e.source) && nodeIds.has(e.target) && e.source !== e.target,
    );

    const initialEdges: Edge[] = validEdges.map((e) => {
      const sourceStatus = progressMap.get(e.source) || 'locked';
      return {
        id: e.id || `${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        type: 'dependency',
        animated: sourceStatus === 'in_progress',
        data: { status: sourceStatus },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color:
            sourceStatus === 'completed'
              ? '#00c9a7'
              : sourceStatus === 'in_progress'
                ? '#6c63ff'
                : 'var(--border-light)',
        },
      };
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges,
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

    // Fit once after first layout (not on every progress update)
    requestAnimationFrame(() => {
      if (!didFitRef.current && rfRef.current) {
        rfRef.current.fitView({ padding: 0.15 });
        didFitRef.current = true;
      }
    });
  }, [roadmap, progressMap, handleNodeClick, setNodes, setEdges]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => {
        let hidden = false;
        const title = String(n.data.label || n.data.title || '').toLowerCase();
        if (searchQuery) {
          hidden = !title.includes(searchQuery.toLowerCase());
        }
        if (!hidden && activeFilter !== 'All') {
          if (activeFilter === 'Skills' && n.type !== 'skill' && n.type !== 'topic') hidden = true;
          else if (activeFilter === 'Projects' && n.type !== 'project') hidden = true;
          else if (
            activeFilter === 'Milestones' &&
            n.type !== 'milestone' &&
            n.type !== 'checkpoint'
          )
            hidden = true;
          else if (activeFilter === 'Completed' && n.data.status !== 'completed') hidden = true;
          else if (activeFilter === 'In Progress' && n.data.status !== 'in_progress')
            hidden = true;
          else if (activeFilter === 'Locked' && n.data.status !== 'locked') hidden = true;
        }
        return { ...n, hidden };
      }),
    );
  }, [searchQuery, activeFilter, setNodes]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: isFullscreen && !document.fullscreenElement ? 'fixed' : 'relative',
        top: isFullscreen && !document.fullscreenElement ? 0 : undefined,
        left: isFullscreen && !document.fullscreenElement ? 0 : undefined,
        right: isFullscreen && !document.fullscreenElement ? 0 : undefined,
        bottom: isFullscreen && !document.fullscreenElement ? 0 : undefined,
        zIndex: isFullscreen && !document.fullscreenElement ? 9999 : 'auto',
        background: 'var(--bg-main, #ffffff)',
      }}
    >
      <RoadmapOverview nodes={roadmap.nodes} progress={progressMap} />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={(instance) => {
          rfRef.current = instance;
          if (!didFitRef.current) {
            instance.fitView({ padding: 0.15 });
            didFitRef.current = true;
          }
        }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.2}
        maxZoom={1.5}
      >
        <Background color="var(--border-strong)" gap={24} size={2} />
        {showMinimap && (
          <MiniMap
            position="bottom-right"
            pannable
            zoomable
            nodeBorderRadius={4}
            nodeStrokeWidth={1.5}
            nodeStrokeColor={(n: any) => {
              const status = n.data?.status;
              if (status === 'completed') return '#00a386';
              if (status === 'in_progress') return '#584ee4';
              if (n.type === 'goal' || n.type === 'career') return '#d97706';
              if (n.type === 'milestone' || n.type === 'checkpoint') return '#9333ea';
              if (n.type === 'project') return '#db2777';
              return 'rgba(148, 163, 184, 0.4)';
            }}
            nodeColor={(n: any) => {
              const status = n.data?.status;
              if (status === 'completed') return '#00c9a7';
              if (status === 'in_progress') return '#6c63ff';
              if (status === 'available') return '#3b82f6';
              if (n.type === 'goal' || n.type === 'career') return '#f7971e';
              if (n.type === 'milestone' || n.type === 'checkpoint') return '#a855f7';
              if (n.type === 'project') return '#ec4899';
              return '#94a3b8';
            }}
            maskColor="rgba(108, 99, 255, 0.12)"
            maskStrokeColor="#6c63ff"
            maskStrokeWidth={1.5}
            style={{
              background: 'rgba(var(--bg-card-rgb, 255, 255, 255), 0.9)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1.5px solid var(--border-light)',
              borderRadius: 16,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              marginBottom: 24,
              marginRight: selectedNode ? 424 : 24,
              transition: 'margin-right 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              overflow: 'hidden',
              width: 190,
              height: 130,
            }}
          />
        )}
      </ReactFlow>

      <RoadmapToolbar
        onSearch={setSearchQuery}
        onFilter={setActiveFilter}
        onRegenerate={onRegenerate}
        activeFilter={activeFilter}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        showMinimap={showMinimap}
        onToggleMinimap={() => setShowMinimap((prev) => !prev)}
      />

      {statusError && (
        <div
          role="alert"
          style={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 30,
            background: '#c0392b',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: 10,
            fontFamily: 'Outfit',
            fontSize: 13,
            maxWidth: 420,
            textAlign: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}
        >
          {statusError}
        </div>
      )}

      <RoadmapDetailPanel
        node={selectedNode}
        allNodes={roadmap.nodes}
        onStatusChange={async (id, status) => {
          await onStatusChange(id, status);
        }}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
}

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
import NodeAssessmentModal from './assessment/NodeAssessmentModal';
import { isAssessableNode } from '@/lib/roadmap/assessment';
import { Focus } from 'lucide-react';
import { Alert, IconButton } from '@/components/ui';
import { RoadmapSpinner } from './RoadmapSpinner';

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
  onRefresh,
  onCreateNew,
  statusError,
  initialFocusNodeId,
}: {
  roadmap: Roadmap;
  progress: RoadmapNodeProgress[];
  onStatusChange: (nodeId: string, status: string) => void | Promise<void>;
  onRegenerate: () => void;
  onRefresh?: () => void | Promise<void>;
  onCreateNew?: () => void;
  statusError?: string | null;
  initialFocusNodeId?: string;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<RTNode | null>(null);
  const [panelExpanded, setPanelExpanded] = useState(false);
  const [assessmentNodeId, setAssessmentNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const rfRef = useRef<any>(null);
  const didFitRef = useRef(false);
  const lastFocusedLearningIdRef = useRef<string | null>(null);
  const deepLinkAppliedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMinimap, setShowMinimap] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [switching, setSwitching] = useState(false);

  const isNarrowViewport = () =>
    typeof window !== "undefined" && window.innerWidth < 1024;

  const focusNode = useCallback((nodeId: string, opts?: { zoom?: number; duration?: number; lift?: boolean }) => {
    const instance = rfRef.current;
    if (!instance || !nodeId) return;

    const narrow = isNarrowViewport();
    const zoom = opts?.zoom ?? (narrow ? 0.92 : 1.05);
    const duration = opts?.duration ?? 500;
    const lift = Boolean(opts?.lift && narrow);

    requestAnimationFrame(() => {
      const n = instance.getNode?.(nodeId);
      if (!n) {
        try {
          instance.fitView({
            nodes: [{ id: nodeId }],
            padding: narrow ? 0.28 : 0.45,
            duration,
            maxZoom: zoom,
            minZoom: zoom,
          });
        } catch {
          // node not mounted yet
        }
        return;
      }
      const w = n.measured?.width ?? n.width ?? 200;
      const h = n.measured?.height ?? n.height ?? 80;
      // Keep the node in the upper half when the mobile sheet is open.
      const yNudge = lift ? 110 : 0;
      instance.setCenter(n.position.x + w / 2, n.position.y + h / 2 + yNudge, {
        zoom,
        duration,
      });
    });
  }, []);

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
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      setIsDesktop(mq.matches);
      setShowMinimap(mq.matches);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
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
    // Active roadmap node statuses (already merged from DB on GET) win first
    roadmap.nodes.forEach((n) => {
      if (n.status) m.set(n.id, n.status);
    });
    // Fill any gaps from progress rows for this roadmap
    progress.forEach((p) => {
      if (p.nodeId && p.status) m.set(p.nodeId, p.status);
    });
    return m;
  }, [progress, roadmap.nodes, roadmap.id]);

  /** Current learning target: last unlocked node in learning phase (in_progress, else available). */
  const currentLearningNodeId = useMemo(() => {
    const learningTypes = new Set([
      'skill',
      'topic',
      'project',
      'checkpoint',
      'milestone',
      'resource',
    ]);

    const withStatus = roadmap.nodes
      .filter((n) => learningTypes.has(n.type))
      .map((n) => ({
        node: n,
        status: progressMap.get(n.id) || n.status || 'locked',
      }))
      .filter((x) => x.status === 'in_progress' || x.status === 'available');

    if (!withStatus.length) return null;

    // Prefer actively in-progress
    const inProgress = withStatus.filter((x) => x.status === 'in_progress');
    const pool = inProgress.length ? inProgress : withStatus;

    // "Last" = deepest unlocked in the graph (furthest along the path)
    const depth = new Map<string, number>();
    const visit = (id: string, d: number) => {
      const prev = depth.get(id) ?? -1;
      if (d <= prev) return;
      depth.set(id, d);
      for (const e of roadmap.edges) {
        if (e.source === id) visit(e.target, d + 1);
      }
    };
    for (const n of roadmap.nodes) {
      const hasIncoming = roadmap.edges.some((e) => e.target === n.id);
      if (!hasIncoming) visit(n.id, 0);
    }

    pool.sort((a, b) => {
      const da = depth.get(a.node.id) ?? 0;
      const db = depth.get(b.node.id) ?? 0;
      if (db !== da) return db - da;
      const ya = a.node.position?.y ?? 0;
      const yb = b.node.position?.y ?? 0;
      return yb - ya;
    });

    return pool[0]?.node.id ?? null;
  }, [roadmap.nodes, roadmap.edges, progressMap]);

  const applyInitialCamera = useCallback(
    (instance?: {
      fitView: (opts: Record<string, unknown>) => void;
      getNodes?: () => { id: string }[];
    }) => {
      const rf = instance ?? rfRef.current;
      if (!rf || didFitRef.current) return;
      const mounted = rf.getNodes?.() ?? [];
      if (!mounted.length) return;

      const narrow = isNarrowViewport();
      const targetId = initialFocusNodeId || currentLearningNodeId;

      if (narrow && targetId) {
        lastFocusedLearningIdRef.current = targetId;
        try {
          rf.fitView({
            nodes: [{ id: targetId }],
            padding: 0.28,
            maxZoom: 0.92,
            minZoom: 0.78,
          });
        } catch {
          rf.fitView({ padding: 0.4, maxZoom: 0.9, minZoom: 0.7 });
        }
      } else if (narrow) {
        rf.fitView({ padding: 0.4, maxZoom: 0.9, minZoom: 0.7 });
      } else {
        rf.fitView({ padding: 0.15 });
      }
      didFitRef.current = true;
    },
    [initialFocusNodeId, currentLearningNodeId],
  );

  const handleNodeClick = useCallback(
    (node: RTNode) => {
      const status = (progressMap.get(node.id) || node.status || 'locked') as RTNode['status'];
      setSelectedNode({
        ...node,
        status,
      });
      // Always center — including goal / locked nodes
      focusNode(node.id, {
        zoom:
          node.type === 'goal' || node.type === 'career'
            ? isNarrowViewport()
              ? 0.95
              : 1.1
            : isNarrowViewport()
              ? 0.92
              : 1.05,
        duration: 600,
        lift: true,
      });
    },
    [progressMap, focusNode],
  );

  // Deep-link from Challenges (?node=id)
  useEffect(() => {
    if (!initialFocusNodeId || deepLinkAppliedRef.current) return;
    const node = roadmap.nodes.find((n) => n.id === initialFocusNodeId);
    if (!node) return;
    deepLinkAppliedRef.current = true;
    lastFocusedLearningIdRef.current = initialFocusNodeId;
    setSelectedNode({
      ...node,
      status: (progressMap.get(node.id) || node.status || "available") as RTNode["status"],
    });
    const t = setTimeout(
      () => focusNode(initialFocusNodeId, { zoom: 1.1, duration: 700 }),
      didFitRef.current ? 150 : 400,
    );
    return () => clearTimeout(t);
  }, [initialFocusNodeId, roadmap.nodes, progressMap, focusNode]);

  // Zoom to active / selected learning node
  useEffect(() => {
    const activeId = assessmentNodeId || selectedNode?.id;
    if (!activeId) return;
    const t = setTimeout(() => focusNode(activeId), 80);
    return () => clearTimeout(t);
  }, [assessmentNodeId, selectedNode?.id, focusNode]);

  // Auto-zoom to the last unlocked node currently in learning phase
  useEffect(() => {
    if (!currentLearningNodeId || !rfRef.current) return;
    if (assessmentNodeId) return; // assessment modal owns focus while open
    if (lastFocusedLearningIdRef.current === currentLearningNodeId) return;
    lastFocusedLearningIdRef.current = currentLearningNodeId;

    // Keep the canvas visible on phones — opening the sheet would cover it.
    if (!isNarrowViewport()) {
      const node = roadmap.nodes.find((n) => n.id === currentLearningNodeId);
      if (node) {
        setSelectedNode({
          ...node,
          status: (progressMap.get(node.id) || node.status || 'available') as RTNode['status'],
        });
      }
    }

    const t = setTimeout(
      () =>
        focusNode(currentLearningNodeId, {
          zoom: isNarrowViewport() ? 0.92 : 1.05,
          duration: 650,
        }),
      didFitRef.current ? 120 : 350,
    );
    return () => clearTimeout(t);
  }, [
    currentLearningNodeId,
    assessmentNodeId,
    focusNode,
    roadmap.nodes,
    progressMap,
  ]);

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
              ? 'var(--success)'
              : sourceStatus === 'in_progress'
                ? 'var(--primary)'
                : 'var(--roadmap-edge)',
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
      applyInitialCamera();
    });
  }, [roadmap, progressMap, handleNodeClick, setNodes, setEdges, applyInitialCamera]);

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
      className="h-full w-full overflow-hidden overscroll-none bg-canvas"
      style={{
        position: isFullscreen && !document.fullscreenElement ? 'fixed' : 'relative',
        top: isFullscreen && !document.fullscreenElement ? 0 : undefined,
        left: isFullscreen && !document.fullscreenElement ? 0 : undefined,
        right: isFullscreen && !document.fullscreenElement ? 0 : undefined,
        bottom: isFullscreen && !document.fullscreenElement ? 0 : undefined,
        zIndex: isFullscreen && !document.fullscreenElement ? 9999 : 'auto',
      }}
    >
      <RoadmapOverview
        key={roadmap.id}
        roadmapId={roadmap.id}
        roadmapTitle={roadmap.title}
        targetCompany={roadmap.targetCompany}
        nodes={roadmap.nodes}
        progress={progressMap}
        onSwitched={async () => {
          didFitRef.current = false;
          await onRefresh?.();
        }}
        onBusyChange={setSwitching}
        onCreateNew={() => onCreateNew?.()}
      />

      {switching ? <RoadmapSpinner overlay label="Switching roadmap…" /> : null}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={(instance) => {
          rfRef.current = instance;
          applyInitialCamera(instance);
        }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.45}
        maxZoom={1.75}
        preventScrolling
        zoomOnPinch
        zoomOnScroll
        panOnScroll={false}
        panOnDrag
        // Disable Space-to-pan so coding assessments can type spaces
        panActivationKeyCode={assessmentNodeId ? null : "Space"}
        deleteKeyCode={assessmentNodeId ? null : "Backspace"}
        defaultEdgeOptions={{
          type: "dependency",
          interactionWidth: 24,
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <Background color="var(--border-strong)" gap={24} size={2} />
        {showMinimap ? (
          <MiniMap
            position="bottom-right"
            pannable
            zoomable
            nodeBorderRadius={4}
            nodeStrokeWidth={1.5}
            nodeStrokeColor={(n: any) => {
              const status = n.data?.status;
              if (status === 'completed') return 'var(--success)';
              if (status === 'in_progress') return 'var(--primary)';
              if (n.type === 'goal' || n.type === 'career') return 'var(--warning)';
              if (n.type === 'milestone' || n.type === 'checkpoint') return 'var(--info)';
              if (n.type === 'project') return 'var(--accent)';
              return 'var(--border-strong)';
            }}
            nodeColor={(n: any) => {
              const status = n.data?.status;
              if (status === 'completed') return 'var(--success)';
              if (status === 'in_progress') return 'var(--primary)';
              if (status === 'available') return 'var(--info)';
              if (n.type === 'goal' || n.type === 'career') return 'var(--warning)';
              if (n.type === 'milestone' || n.type === 'checkpoint') return 'var(--info)';
              if (n.type === 'project') return 'var(--accent)';
              return 'var(--text-muted)';
            }}
            maskColor="var(--primary-soft)"
            maskStrokeColor="var(--primary)"
            maskStrokeWidth={1.5}
            style={{
              background: 'color-mix(in srgb, var(--bg-card) 90%, transparent)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1.5px solid var(--border-light)',
              borderRadius: 16,
              boxShadow: 'var(--shadow-lg)',
              marginBottom: 24,
              marginRight: selectedNode && !panelExpanded ? 424 : 24,
              transition: 'margin-right 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              overflow: 'hidden',
            width: 190,
            height: 130,
            }}
          />
        ) : null}
      </ReactFlow>

      <div className="hidden lg:contents">
        <RoadmapToolbar
          onSearch={setSearchQuery}
          onFilter={setActiveFilter}
          onRegenerate={onRegenerate}
          activeFilter={activeFilter}
          isFullscreen={isFullscreen}
          onToggleFullscreen={isDesktop ? toggleFullscreen : undefined}
          showMinimap={showMinimap}
          onToggleMinimap={() => setShowMinimap((prev) => !prev)}
          onFocusGoal={() => {
            const goal =
              roadmap.nodes.find((n) => n.type === 'goal') ||
              roadmap.nodes.find((n) => n.type === 'career');
            if (!goal) return;
            setSelectedNode({
              ...goal,
              status: (progressMap.get(goal.id) || goal.status || 'available') as RTNode['status'],
            });
            focusNode(goal.id, { zoom: 1.1, duration: 700 });
          }}
        />
      </div>

      {!selectedNode ? (
        <div className="absolute right-3 bottom-3 z-10 lg:hidden">
          <IconButton
            label="Fit view"
            className="rounded-full border border-line bg-surface/94 shadow-[var(--shadow-md)] backdrop-blur-md"
            onClick={() =>
              rfRef.current?.fitView({
                duration: 600,
                padding: 0.4,
                maxZoom: 0.95,
              })
            }
          >
            <Focus size={18} />
          </IconButton>
        </div>
      ) : null}

      {statusError && (
        <div className="absolute bottom-6 left-1/2 z-30 w-[min(420px,calc(100%-32px))] -translate-x-1/2">
          <Alert tone="error">{statusError}</Alert>
        </div>
      )}

      <RoadmapDetailPanel
        node={selectedNode}
        allNodes={roadmap.nodes}
        onStatusChange={async (id, status) => {
          await onStatusChange(id, status);
        }}
        onTakeAssessment={(id) => setAssessmentNodeId(id)}
        onClose={() => {
          setSelectedNode(null);
          setPanelExpanded(false);
        }}
        onExpandedChange={setPanelExpanded}
      />

      {assessmentNodeId && (
        <NodeAssessmentModal
          key={assessmentNodeId}
          nodeId={assessmentNodeId}
          onClose={() => setAssessmentNodeId(null)}
          onCompleted={async ({ unlockedNodeIds }) => {
            await onRefresh?.();
            setAssessmentNodeId(null);

            const nextId =
              (unlockedNodeIds || []).find((id) => {
                const n = roadmap.nodes.find((x) => x.id === id);
                return n ? isAssessableNode(n) : false;
              }) ||
              (unlockedNodeIds || []).find((id) =>
                roadmap.nodes.some((x) => x.id === id),
              );

            if (nextId) {
              const n = roadmap.nodes.find((x) => x.id === nextId)!;
              lastFocusedLearningIdRef.current = nextId;
              setSelectedNode({ ...n, status: "available" });
              focusNode(nextId);
            } else {
              setSelectedNode(null);
            }
          }}
        />
      )}
    </div>
  );
}

"use client";

import { routes } from "@/lib/routes";
import { useRouter, useSearchParams } from "next/navigation";
import {
  type FormEvent,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  Check,
  Download,
  FileText,
  Maximize2,
  MessageSquare,
  Play,
  Send,
  Settings,
  Sparkles,
  Users,
  Volume2,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Dialog,
  IconButton,
  Input,
  PageHeader,
  TabPanel,
  Tabs,
  useToast,
} from "@/components/ui";
import { cn } from "@/lib/cn";

type ClassInfo = {
  topic: string;
  desc: string;
  notes: string;
  outline: string[];
  videoUrl: string;
};

type ClassId = "m1" | "m2" | "m7";

type Participant = {
  name: string;
  path: string;
  status: "Active" | "Idle";
  avatar: string;
};

type ChatMessage = {
  user: string;
  text: string;
  time: string;
  self: boolean;
};

type AiMessage = {
  role: "assistant" | "user";
  text: string;
  time: string;
};

type PanelTab = "comments" | "participants";

const PARTICIPANTS: Participant[] = [
  {
    name: "Rahul Kushwaha",
    path: "AI & Machine Learning",
    status: "Active",
    avatar: "🎓",
  },
  {
    name: "Anjali Sharma",
    path: "Core Software Engineering (SDE)",
    status: "Active",
    avatar: "👩‍💻",
  },
  {
    name: "Rohan Das",
    path: "Database & Cloud Architecture",
    status: "Active",
    avatar: "👨‍💻",
  },
  {
    name: "Sneha Iyer",
    path: "AI & Machine Learning",
    status: "Active",
    avatar: "👩‍🎓",
  },
  {
    name: "Vikram Bose",
    path: "Core Software Engineering (SDE)",
    status: "Idle",
    avatar: "👨‍💻",
  },
  {
    name: "Priya Nair",
    path: "Database & Cloud Architecture",
    status: "Active",
    avatar: "👩‍💻",
  },
];

const CLASS_INFO: Record<ClassId, ClassInfo> = {
  m1: {
    topic: "ML Systems Design & Hyper-parameter Triage",
    desc: "In this session, we cover the end-to-end lifecycle of deploying Machine Learning systems in production. We address data drift, concept drift, feature store scaling, validation strategies, and hyper-parameter optimization loops (Bayesian Search vs Grid Search).",
    notes: "ML_Optimization_Notes.pdf",
    outline: [
      "1. Data validation and validation pipelines (TFDV)",
      "2. Feature engineering pipelines and online/offline alignment",
      "3. Distributed model training with Pytorch Lightning",
      "4. Performance tuning: quantization, pruning, and model distillation",
    ],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  m2: {
    topic: "Preparing for Google STEP interviews",
    desc: "This lecture outlines the algorithmic expectations for Google STEP candidates. We analyze recursive structures, backtracking recursion trees, space complexity, and how to successfully pitch optimizations verbally during technical interview windows.",
    notes: "Google_STEP_Preparation.pdf",
    outline: [
      "1. Array manipulation and dynamic sliding window thresholds",
      "2. Stack matching algorithms & parentheses balanced sequences",
      "3. Tree traversal recursion and space-complexity validation",
      "4. Interviewer communication: edge case listing and optimization pitches",
    ],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  m7: {
    topic: "Thinking like an Engineer: DSA Traverses",
    desc: "A hands-on coding walkthrough on data structure traversals. We analyze DFS, BFS, pre-order/post-order traversals, and look at the mathematical properties of graph cycle detection and topological sorting.",
    notes: "DSA_Traversals_Handout.pdf",
    outline: [
      "1. Graph representation: Adjacency list memory optimization",
      "2. Depth-First Search (DFS) recursion stack modeling",
      "3. Breadth-First Search (BFS) queue mechanics & shortest path properties",
      "4. Topological sort algorithm with cycle verification",
    ],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
};

function isClassId(value: string): value is ClassId {
  return value === "m1" || value === "m2" || value === "m7";
}

function SessionPanel({
  panelTab,
  onPanelTab,
  messages,
  inputVal,
  onInputVal,
  onSend,
  chatEndRef,
}: {
  panelTab: PanelTab;
  onPanelTab: (next: PanelTab) => void;
  messages: ChatMessage[];
  inputVal: string;
  onInputVal: (next: string) => void;
  onSend: (e: FormEvent<HTMLFormElement>) => void;
  chatEndRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <Card padded={false} className="flex min-h-[28rem] flex-col overflow-hidden lg:min-h-[36rem]">
      <Tabs<PanelTab>
        items={[
          {
            id: "comments",
            label: "Comments",
            icon: <MessageSquare size={16} aria-hidden />,
            badge: messages.length,
          },
          {
            id: "participants",
            label: "Participants",
            icon: <Users size={16} aria-hidden />,
            badge: PARTICIPANTS.length,
          },
        ]}
        value={panelTab}
        onChange={onPanelTab}
        ariaLabel="Live class side panel"
        className="px-3"
      />

      <TabPanel active={panelTab === "comments"} className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
          {messages.map((msg, i) => (
            <div
              key={`${msg.user}-${msg.time}-${i}`}
              className={cn(
                "flex max-w-[88%] flex-col gap-1",
                msg.self ? "self-end" : "self-start",
              )}
            >
              <span className="type-caption text-faint">
                {msg.user} · {msg.time}
              </span>
              <div
                className={cn(
                  "rounded-[var(--radius-md)] px-3 py-2",
                  msg.self
                    ? "bg-primary text-[var(--text-on-primary)]"
                    : "border border-line bg-sunken text-ink",
                )}
              >
                <p className="type-small m-0">{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <form
          onSubmit={onSend}
          className="flex gap-2 border-t border-line p-3"
        >
          <Input
            value={inputVal}
            onChange={(e) => onInputVal(e.target.value)}
            placeholder="Ask the instructor a question…"
            aria-label="Chat message"
            className="min-h-11"
          />
          <IconButton label="Send comment" type="submit" variant="primary">
            <Send size={16} aria-hidden />
          </IconButton>
        </form>
      </TabPanel>

      <TabPanel active={panelTab === "participants"} className="flex-1 overflow-y-auto p-4">
        <p className="type-caption mb-3 text-faint">Active attendees</p>
        <ul className="flex list-none flex-col gap-2 p-0">
          {PARTICIPANTS.map((part) => (
            <li
              key={part.name}
              className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-line bg-sunken px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <Avatar name={part.name} size="sm" />
                <div className="min-w-0">
                  <p className="type-small m-0 truncate font-semibold text-ink">
                    {part.name}
                  </p>
                  <p className="type-caption m-0 truncate text-muted">
                    {part.path}
                  </p>
                </div>
              </div>
              <Badge tone={part.status === "Active" ? "success" : "warning"}>
                {part.status}
              </Badge>
            </li>
          ))}
        </ul>
      </TabPanel>
    </Card>
  );
}

export default function PlatformLiveClass() {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const teacherId = searchParams.get("teacher") || "m7";
  const classTopic = searchParams.get("topic") || "DSA Traverses";

  const classData = isClassId(teacherId) ? CLASS_INFO[teacherId] : CLASS_INFO.m7;

  const [panelTab, setPanelTab] = useState<PanelTab>("comments");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      user: "Anjali Sharma",
      text: "Is the latency of the Redis caching layers dependent on partition sizes?",
      time: "4:02 PM",
      self: false,
    },
    {
      user: "Rohan Das",
      text: "Yes, larger hash rings require additional lookup segments.",
      time: "4:03 PM",
      self: false,
    },
    {
      user: "Dr. Arpan Mukherjee",
      text: "Welcome everyone! We will start the system designs discussion now. Feel free to type comments.",
      time: "4:04 PM",
      self: false,
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const aiEndRef = useRef<HTMLDivElement | null>(null);

  const getInitialAiMessage = () => {
    if (teacherId === "m1") {
      return "Hello Rahul! The instructor is presenting Machine Learning System Design and Hyper-parameter grids. I can help explain Bayesian Search heuristics, online validation strategies, or offline pipeline aligners.";
    }
    if (teacherId === "m2") {
      return "Hello Rahul! The instructor is covering Google STEP recruitment preparation, arrays, sliding windows, and recursion tree complexity. Ask me to analyze recursion space matching or draft slide index codes.";
    }
    return "Hello Rahul! The instructor is demonstrating Graph Traversals (DFS/BFS) and adjacency list optimizations. I can explain queue mechanics, shortest path bounds, or standard cycle checking models.";
  };

  const [aiMessages, setAiMessages] = useState<AiMessage[]>([
    { role: "assistant", text: getInitialAiMessage(), time: "4:05 PM" },
  ]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (aiEndRef.current) {
      aiEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [aiMessages, showAiPanel]);

  const handleSend = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        user: "Rahul Kushwaha (You)",
        text: inputVal,
        time: "4:05 PM",
        self: true,
      },
    ]);
    setInputVal("");
  };

  const handleAiSend = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    const userText = aiInput;
    setAiMessages((prev) => [
      ...prev,
      { role: "user", text: userText, time: "4:06 PM" },
    ]);
    setAiInput("");

    setTimeout(() => {
      let reply =
        "That is a great question. Let me break that concept down for you. In production environments, we prioritize modularity and low space complexity. Let me know if you would like a code snippet of this traversal implementation!";
      if (
        userText.toLowerCase().includes("dfs") ||
        userText.toLowerCase().includes("traverse")
      ) {
        reply =
          "Depth-First Search (DFS) traverses down recursion branches until they terminate, pushing nodes onto the system stack. It has O(V + E) time complexity and O(V) space complexity due to recursion depth. In comparison, BFS uses queue structures to traverse level-by-level.";
      } else if (
        userText.toLowerCase().includes("ml") ||
        userText.toLowerCase().includes("hyperparameter")
      ) {
        reply =
          "Hyper-parameter optimization calibrates training parameters (like learning rate or batch size) outside the model loop. Bayesian search uses prior trials to build a probability model of the objective function, targeting optimal values much faster than grid search.";
      } else if (
        userText.toLowerCase().includes("step") ||
        userText.toLowerCase().includes("google")
      ) {
        reply =
          "For Google STEP interviews, focus on clean recursive formulations and sliding windows. Practice expressing recursion trees clearly with verbal walkthroughs and write test cases covering empty arrays and duplicates.";
      }
      setAiMessages((prev) => [
        ...prev,
        { role: "assistant", text: reply, time: "4:06 PM" },
      ]);
    }, 1000);
  };

  const watching = PARTICIPANTS.length + 18;

  return (
    <>
      <PageHeader
        eyebrow="Mentorship"
        title={classData.topic}
        description={`${classTopic} · Live session with ${watching} watching.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              className="min-h-11"
              onClick={() => router.push(routes.app.mentorship)}
            >
              <ArrowLeft size={16} aria-hidden />
              Back to mentorship
            </Button>
            <Button className="min-h-11" onClick={() => setShowAiPanel(true)}>
              <Sparkles size={16} aria-hidden />
              AI assistance
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge tone="error">Live</Badge>
        <Badge tone="neutral">{watching} watching</Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(18rem,22rem)] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line bg-sunken">
            <div className="relative aspect-video w-full bg-[var(--bg-inverse)]">
              <iframe
                className="absolute inset-0 h-full w-full border-0"
                src={classData.videoUrl}
                title="Live stream video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-line bg-surface px-3 py-2">
              <div className="flex items-center gap-1">
                <IconButton label="Play" variant="ghost" size="sm">
                  <Play size={16} aria-hidden />
                </IconButton>
                <IconButton label="Volume" variant="ghost" size="sm">
                  <Volume2 size={16} aria-hidden />
                </IconButton>
                <span className="type-caption text-muted">04:12 / Live class</span>
              </div>
              <div className="flex items-center gap-1">
                <IconButton label="Settings" variant="ghost" size="sm">
                  <Settings size={16} aria-hidden />
                </IconButton>
                <IconButton
                  label="Fullscreen"
                  variant="ghost"
                  size="sm"
                  className="hidden lg:inline-flex"
                >
                  <Maximize2 size={16} aria-hidden />
                </IconButton>
              </div>
            </div>
          </div>

          <Card className="flex flex-col gap-4">
            <div>
              <p className="type-caption m-0 text-primary">Lecture highlights</p>
              <h2 className="type-h2 mt-1 mb-0 text-ink">{classData.topic}</h2>
            </div>
            <p className="type-body m-0 text-muted">{classData.desc}</p>

            <div className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-line bg-sunken p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <FileText size={18} className="mt-0.5 shrink-0 text-muted" aria-hidden />
                <div className="min-w-0">
                  <p className="type-small m-0 font-semibold text-ink">
                    {classData.notes}
                  </p>
                  <p className="type-caption m-0 text-muted">
                    Syllabus notes, diagrams, and code snippets
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                className="min-h-11 shrink-0"
                onClick={() =>
                  toast.success({
                    title: "Download started",
                    description: classData.notes,
                  })
                }
              >
                <Download size={16} aria-hidden />
                Download
              </Button>
            </div>

            <div>
              <p className="type-caption mb-2 text-faint">Syllabus path</p>
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {classData.outline.map((out) => (
                  <li key={out} className="flex gap-2 text-ink">
                    <Check size={16} className="mt-0.5 shrink-0 text-success" aria-hidden />
                    <span className="type-small">{out}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>

        <div className="min-w-0">
          <SessionPanel
            panelTab={panelTab}
            onPanelTab={setPanelTab}
            messages={messages}
            inputVal={inputVal}
            onInputVal={setInputVal}
            onSend={handleSend}
            chatEndRef={chatEndRef}
          />
        </div>
      </div>

      <Dialog
        open={showAiPanel}
        onClose={() => setShowAiPanel(false)}
        title="PathED AI tutor"
        description="Active stream analyst"
        size="md"
      >
        <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto">
          {aiMessages.map((msg, i) => (
            <div
              key={`${msg.role}-${i}`}
              className={cn(
                "flex max-w-[88%] flex-col gap-1",
                msg.role === "user" ? "self-end" : "self-start",
              )}
            >
              <span className="type-caption text-faint">
                {msg.role === "user" ? "You" : "PathED AI tutor"} · {msg.time}
              </span>
              <div
                className={cn(
                  "rounded-[var(--radius-md)] px-3 py-2",
                  msg.role === "user"
                    ? "bg-primary text-[var(--text-on-primary)]"
                    : "border border-line bg-sunken text-ink",
                )}
              >
                <p className="type-small m-0">{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={aiEndRef} />
        </div>
        <form
          onSubmit={handleAiSend}
          className="mt-4 flex gap-2 border-t border-line pt-3"
        >
          <Input
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            placeholder="Ask the AI tutor anything…"
            aria-label="AI tutor message"
            className="min-h-11"
          />
          <IconButton label="Send to AI tutor" type="submit" variant="primary">
            <Send size={16} aria-hidden />
          </IconButton>
        </form>
      </Dialog>
    </>
  );
}

import type { BrowseProject, Collaborator, MyProject } from "./types";

import { palette } from "@/lib/theme/palette";

export const COLS = {
  primary: palette.primary,
  success: palette.success,
  warning: palette.warning,
  danger: palette.error,
  info: palette.info,
};

export const COLLABORATORS_POOL: readonly Collaborator[] = [
  {
    name: "Anjali Sharma",
    role: "React Developer",
    avatar: "👩‍💻",
    col: COLS.primary,
    spec: "React + Firebase",
    college: "IIT Delhi",
  },
  {
    name: "Rohan Das",
    role: "Backend Developer",
    avatar: "👨‍💻",
    col: COLS.success,
    spec: "Node.js + Redis",
    college: "IIT Kanpur",
  },
  {
    name: "Sneha Iyer",
    role: "UI Designer",
    avatar: "👩‍🎨",
    col: COLS.danger,
    spec: "Figma + UI/UX Design",
    college: "BITS Pilani",
  },
];

export const INITIAL_MY_PROJECTS: readonly MyProject[] = [
  {
    id: "p1",
    name: "PathED Frontend Refactor",
    type: "original",
    owner: "You",
    progress: 68,
    status: "In Progress",
    tech: ["React.js", "Vanilla CSS", "Framer Motion"],
    slots: "1 UI Designer needed",
    timeline: "Ending in 2 weeks",
    members: ["Rahul Kushwaha", "Sneha Iyer"],
    chat: [
      {
        user: "Sneha Iyer",
        text: "I finished the Glassmorphism card templates. Can you hook up the state?",
        time: "2:10 PM",
      },
      {
        user: "Rahul Kushwaha (You)",
        text: "Awesome! I am writing the replacement logic right now.",
        time: "2:15 PM",
      },
    ],
    tasks: [
      { id: "t1", title: "Build responsive layout grid", status: "completed" },
      { id: "t2", title: "Refactor Dashboard widgets", status: "progress" },
      { id: "t3", title: "Integrate Github deployment hook", status: "todo" },
    ],
    notes:
      "Sprint 3 Goals:\n- Finalize pixel-perfect card layouts\n- Eliminate layout shift on mobile widths\n- Complete dev testing triggers",
    gitCommits: [
      {
        msg: "Merge pull request #14 from sneha/glassmorphic-cards",
        date: "Today, 1:12 PM",
      },
      {
        msg: "fix flex justifyContent layout wrapping",
        date: "Yesterday, 4:40 PM",
      },
    ],
  },
  {
    id: "p2",
    name: "Distributed ML Train Pipeline",
    type: "participating",
    owner: "IIT KGP ML Team",
    progress: 42,
    status: "Active",
    tech: ["PyTorch", "gRPC", "Docker"],
    slots: "1 Backend SDE open",
    timeline: "Ending in 1 month",
    members: ["Dr. Amit Sen", "Anjali Sharma", "Rahul Kushwaha"],
    chat: [
      {
        user: "Dr. Amit Sen",
        text: "We need to optimize the epoch synchronization. Training overhead is high.",
        time: "Yesterday",
      },
    ],
    tasks: [
      { id: "t4", title: "Setup Docker clusters", status: "completed" },
      { id: "t5", title: "Implement gRPC transport layers", status: "progress" },
    ],
    notes:
      "ML Pipeline Spec:\n- Standardize on PyTorch Lightning backend\n- Target <= 50ms gRPC latency overhead",
    gitCommits: [{ msg: "feat: add gRPC compression flags", date: "3 days ago" }],
  },
];

export const INITIAL_BROWSE_PROJECTS: readonly BrowseProject[] = [
  {
    id: "bp1",
    name: "Quant trading Backtest Engine",
    owner: "Finance Research Club",
    desc: "An event-driven backtesting platform for high-frequency volatility models using C++ and Python.",
    type: "participate",
    tech: ["C++", "Pandas", "Statsmodels"],
    teamSize: 4,
    slots: "Looking for 1 C++ Developer",
    difficulty: "Hard",
    col: COLS.primary,
    image:
      "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "bp2",
    name: "Glassmorphic Component Library",
    owner: "PathED Design Lab",
    desc: "Open source CSS UI library containing highly customizable components built for React and Tailwind.",
    type: "collaborators",
    tech: ["React.js", "Tailwind CSS", "Storybook"],
    teamSize: 5,
    slots: "Need 2 CSS experts",
    difficulty: "Medium",
    col: COLS.success,
    image:
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "bp3",
    name: "Autonomous Drone Mapping",
    owner: "Robotics Research Group",
    desc: "Simulating collision-avoidance trajectory grids using ROS and LiDAR data clusters in Gazebo.",
    type: "recruit",
    tech: ["ROS", "C++", "Gazebo"],
    teamSize: 6,
    slots: "Recruiting a Robotics QA Tester",
    difficulty: "Expert",
    col: COLS.warning,
    image:
      "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "bp4",
    name: "AI Copresenter Avatar",
    owner: "Generative Systems Corp",
    desc: "Generating real-time speech-to-video speaker syncing models using audio-driven NeRF arrays.",
    type: "collaborators",
    tech: ["Python", "NeRF", "TensorFlow"],
    teamSize: 3,
    slots: "Looking for 1 ML Intern",
    difficulty: "Hard",
    col: COLS.danger,
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
  },
];

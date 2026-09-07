"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Users } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardGridSkeleton,
  EmptyState,
  ErrorState,
  PageHeader,
  SearchInput,
  Segmented,
  Select,
  TabPanel,
  Tabs,
  useToast,
} from "@/components/ui";
import { usePlan } from "@/hooks/useStudentData";
import { routes } from "@/lib/routes";
import { useMockResource } from "@/views/Platform/shared/useMockResource";
import {
  AlumniCard,
  AlumniProfilePane,
  canRequestReferral,
  isReferralOnCooldown,
} from "./alumni/AlumniCard";
import { AlumniChat } from "./alumni/AlumniChat";
import {
  ALUMNI_POOL,
  INITIAL_CHAT_HISTORIES,
  INITIAL_CONNECTED_IDS,
} from "./alumni/data";
import { ReferralDialog } from "./alumni/ReferralDialog";
import type {
  AlumniChatMessage,
  AlumniProfile,
  AlumniTab,
  ChatHistories,
} from "./alumni/types";

function cloneHistories(source: ChatHistories): ChatHistories {
  return Object.fromEntries(
    Object.entries(source).map(([id, messages]) => [id, [...messages]]),
  );
}

/** Alumni network — `/dashboard/alumni-network` */
export default function PlatformAlumniNetwork() {
  const router = useRouter();
  const toast = useToast();
  const { plan: devPlan, setPlan } = usePlan();
  const resource = useMockResource();

  const alumni = ALUMNI_POOL;
  const [alumniSubTab, setAlumniSubTab] = useState<AlumniTab>("connections");
  const [connectedIds, setConnectedIds] = useState<string[]>([...INITIAL_CONNECTED_IDS]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCollege, setFilterCollege] = useState("all");
  const [filterCompany, setFilterCompany] = useState("all");
  const [filterAvailable, setFilterAvailable] = useState("all");
  const [activeChatAlumnus, setActiveChatAlumnus] = useState<AlumniProfile | null>(null);
  const [chatHistories, setChatHistories] = useState<ChatHistories>(() =>
    cloneHistories(INITIAL_CHAT_HISTORIES),
  );
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [referralAlumnus, setReferralAlumnus] = useState<AlumniProfile | null>(null);
  const [referralStep, setReferralStep] = useState(1);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [referralPitch, setReferralPitch] = useState("");
  const [referralCooldowns, setReferralCooldowns] = useState<Record<string, number>>({});

  const chatMessages = activeChatAlumnus
    ? chatHistories[activeChatAlumnus.id] || []
    : [];
  const isPremium = devPlan === "premium";

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistories, activeChatAlumnus]);

  const handleConnect = (alumnusId: string) => {
    if (connectedIds.includes(alumnusId)) return;
    setConnectedIds((prev) => [...prev, alumnusId]);
    toast.success("Connection request accepted! Alumnus successfully added to your connections network.");
  };

  const filteredAlumni = useMemo(
    () =>
      alumni.filter((alumnus) => {
        if (alumniSubTab === "connections" && !connectedIds.includes(alumnus.id)) {
          return false;
        }
        if (filterCollege !== "all" && alumnus.college !== filterCollege) return false;
        if (filterCompany !== "all" && alumnus.company !== filterCompany) return false;
        if (filterAvailable !== "all" && !alumnus.availableFor.includes(filterAvailable)) {
          return false;
        }
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (
            alumnus.name.toLowerCase().includes(q) ||
            alumnus.role.toLowerCase().includes(q) ||
            alumnus.skills.some((skill) => skill.toLowerCase().includes(q))
          );
        }
        return true;
      }),
    [alumni, alumniSubTab, connectedIds, filterCollege, filterCompany, filterAvailable, searchQuery],
  );

  const handleSendChat = (event: FormEvent) => {
    event.preventDefault();
    if (!chatInput.trim() || !activeChatAlumnus) return;

    const newMsg: AlumniChatMessage = {
      sender: "student",
      text: chatInput,
      time: "Just now",
    };
    setChatHistories((prev) => ({
      ...prev,
      [activeChatAlumnus.id]: [...(prev[activeChatAlumnus.id] || []), newMsg],
    }));
    setChatInput("");

    setTimeout(() => {
      const reply: AlumniChatMessage = {
        sender: "alumnus",
        text: "Got it Rahul! Let me review this detail. I'll get back to you shortly.",
        time: "Just now",
      };
      setChatHistories((prev) => ({
        ...prev,
        [activeChatAlumnus.id]: [...(prev[activeChatAlumnus.id] || []), reply],
      }));
    }, 1500);
  };

  const openReferral = (alumnus: AlumniProfile) => {
    setReferralAlumnus(alumnus);
    setReferralStep(1);
    setResumeUploaded(false);
    setReferralPitch("");
  };

  const handleDispatchReferral = () => {
    if (!referralAlumnus) return;
    setReferralStep(4);
    setTimeout(() => {
      setReferralCooldowns((prev) => ({
        ...prev,
        [referralAlumnus.id]: Date.now(),
      }));
      const referralMsg: AlumniChatMessage = {
        sender: "system",
        text: `Referral Request Submitted: SDE Resume and CRI Verification (785/1000) successfully completed. Dispatched to engineering teams at ${referralAlumnus.company}.`,
        time: "Just now",
      };
      setChatHistories((prev) => ({
        ...prev,
        [referralAlumnus.id]: [...(prev[referralAlumnus.id] || []), referralMsg],
      }));
      toast.success({
        title: "Referral application submitted",
        description: `Referral pipeline created at ${referralAlumnus.company}. Button locked for 30 days.`,
      });
      setReferralAlumnus(null);
      setReferralStep(1);
      setResumeUploaded(false);
      setReferralPitch("");
    }, 1200);
  };

  const handleResetCooldowns = () => {
    setReferralCooldowns({});
    toast.info("All SDE referral cooldown locks successfully cleared for testing!");
  };

  return (
    <>
      <PageHeader
        eyebrow="Collaboration & communities"
        title="Alumni connections & referrals"
        description="Reach back to seniors placed across tier-1 global MNCs. Request referrals, review resumes, and align roadmap pipelines."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="type-caption text-faint">Preview plan</span>
            <Segmented
              items={[
                { id: "free", label: "Free" },
                { id: "premium", label: "Premium" },
              ]}
              value={isPremium ? "premium" : "free"}
              onChange={(next) => void setPlan(next)}
              ariaLabel="Preview plan"
            />
            <Button variant="ghost" className="min-h-11" onClick={handleResetCooldowns}>
              Reset cooldowns
            </Button>
          </div>
        }
      />

      <Tabs<AlumniTab>
        items={[
          { id: "connections", label: "My connections", badge: connectedIds.length },
          { id: "directory", label: "Search directory", badge: alumni.length },
        ]}
        value={alumniSubTab}
        onChange={setAlumniSubTab}
        ariaLabel="Alumni sections"
        className="mb-6"
      />

      <Card className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles size={16} className="text-primary" aria-hidden />
          <h2 className="type-h4 m-0 text-ink">AI smart placement recommendations</h2>
        </div>
        <p className="type-small m-0 max-w-prose text-muted">
          Based on your current Software Engineer roadmap track and SDE Core specialty milestones, these alumni followed a similar pipeline and have open referral slots inside their respective squads.
        </p>
        <ul className="mt-4 mb-0 flex list-none gap-3 overflow-x-auto p-0">
          {ALUMNI_POOL.slice(0, 2).map((alumnus) => (
            <li
              key={alumnus.id}
              className="flex w-[260px] shrink-0 items-center gap-3 rounded-[var(--radius-md)] border border-line bg-sunken p-3"
            >
              <Avatar src={alumnus.image} name={alumnus.name} size="md" />
              <div className="min-w-0">
                <p className="type-small m-0 font-semibold text-ink">{alumnus.name}</p>
                <p className="type-caption m-0 truncate text-muted">
                  {alumnus.role} @ {alumnus.company}
                </p>
                <Badge tone="success" className="mt-1">
                  98% path match
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {resource.state === "error" ? (
        <ErrorState
          title="Couldn't load alumni"
          description="The alumni directory didn't come back. Retry, and if it keeps failing the network is temporarily unavailable."
          action={
            <Button variant="secondary" onClick={resource.reload}>
              Try again
            </Button>
          }
        />
      ) : activeChatAlumnus ? (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
            <AlumniProfilePane
              alumnus={activeChatAlumnus}
              connected={connectedIds.includes(activeChatAlumnus.id)}
              canRefer={canRequestReferral(activeChatAlumnus, referralCooldowns)}
              onCooldown={isReferralOnCooldown(activeChatAlumnus.id, referralCooldowns)}
              onConnect={() => handleConnect(activeChatAlumnus.id)}
              onReferral={() => openReferral(activeChatAlumnus)}
            />
            <AlumniChat
              alumnus={activeChatAlumnus}
              messages={chatMessages}
              isPremium={isPremium}
              input={chatInput}
              chatEndRef={chatEndRef}
              onInputChange={setChatInput}
              onSend={handleSendChat}
              onClose={() => setActiveChatAlumnus(null)}
              onUpgrade={() => router.push(routes.app.store)}
            />
          </div>
          <div>
            <h3 className="type-h4 mb-3 text-ink">Switch chat workspace partner</h3>
            <ul className="m-0 flex list-none gap-3 overflow-x-auto p-0">
              {alumni
                .filter(
                  (alumnus) =>
                    alumnus.id !== activeChatAlumnus.id &&
                    (alumniSubTab === "directory" || connectedIds.includes(alumnus.id)),
                )
                .map((alumnus) => (
                  <li key={alumnus.id} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveChatAlumnus(alumnus)}
                      className="flex w-[250px] items-center gap-3 rounded-[var(--radius-md)] border border-line bg-surface p-3 text-left hover:border-line-strong"
                    >
                      <Avatar src={alumnus.image} name={alumnus.name} size="sm" />
                      <span className="min-w-0">
                        <span className="type-small block truncate font-semibold text-ink">
                          {alumnus.name}
                        </span>
                        <span className="type-caption block truncate text-muted">
                          {alumnus.role} @ {alumnus.company}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      ) : (
        <>
          <TabPanel active>
            {resource.state === "loading" ? (
              <CardGridSkeleton count={6} withMedia />
            ) : (
              <div className="flex flex-col gap-5">
                <Card className="flex flex-col gap-3 lg:flex-row lg:items-center">
                  <SearchInput
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    placeholder="Search alumni names, job titles, SDE skills..."
                    aria-label="Search alumni"
                    className="flex-1"
                  />
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <Select
                      value={filterCollege}
                      aria-label="College"
                      onChange={(event) => setFilterCollege(event.target.value)}
                    >
                      <option value="all">All colleges</option>
                      <option value="IIT Delhi">IIT Delhi</option>
                      <option value="IIT Kanpur">IIT Kanpur</option>
                      <option value="IIT Bombay">IIT Bombay</option>
                      <option value="BITS Pilani">BITS Pilani</option>
                    </Select>
                    <Select
                      value={filterCompany}
                      aria-label="Company"
                      onChange={(event) => setFilterCompany(event.target.value)}
                    >
                      <option value="all">All companies</option>
                      <option value="Google">Google</option>
                      <option value="Microsoft">Microsoft</option>
                      <option value="Meta">Meta</option>
                      <option value="TechCorp">TechCorp</option>
                    </Select>
                    <Select
                      value={filterAvailable}
                      aria-label="Availability"
                      onChange={(event) => setFilterAvailable(event.target.value)}
                    >
                      <option value="all">Availability type</option>
                      <option value="Referral">Referral Referral</option>
                      <option value="Mentorship">Guidance Mentorship</option>
                      <option value="Career Guidance">Career Syncs</option>
                    </Select>
                  </div>
                </Card>

                {filteredAlumni.length === 0 ? (
                  <EmptyState
                    icon={<Users size={20} aria-hidden />}
                    title="No alumni match these filters"
                    description="Widen the college, company, or availability filters, or search a different name."
                  />
                ) : (
                  <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredAlumni.map((alumnus) => (
                      <AlumniCard
                        key={alumnus.id}
                        alumnus={alumnus}
                        connected={connectedIds.includes(alumnus.id)}
                        canRefer={canRequestReferral(alumnus, referralCooldowns)}
                        onCooldown={isReferralOnCooldown(alumnus.id, referralCooldowns)}
                        onConnect={() => handleConnect(alumnus.id)}
                        onMessage={() => setActiveChatAlumnus(alumnus)}
                        onReferral={() => openReferral(alumnus)}
                      />
                    ))}
                  </ul>
                )}
              </div>
            )}
          </TabPanel>
        </>
      )}

      <ReferralDialog
        alumnus={referralAlumnus}
        isPremium={isPremium}
        step={referralStep}
        resumeUploaded={resumeUploaded}
        pitch={referralPitch}
        onClose={() => setReferralAlumnus(null)}
        onUpgrade={() => {
          setReferralAlumnus(null);
          router.push(routes.app.store);
        }}
        onStep={setReferralStep}
        onUpload={() => setResumeUploaded(true)}
        onPitchChange={setReferralPitch}
        onSubmit={handleDispatchReferral}
      />
    </>
  );
}

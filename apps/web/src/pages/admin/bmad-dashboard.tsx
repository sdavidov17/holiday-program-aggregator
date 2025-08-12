import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AdminLayout } from "~/components/AdminLayout";

interface AgentStatus {
  name: string;
  role: string;
  status: "active" | "idle" | "error";
  lastActivity: string;
  currentTask?: string;
  icon: string;
  color: string;
}

interface SquadMetrics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  velocity: number;
  healthScore: number;
}

const BMADDashboard: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [metrics, setMetrics] = useState<SquadMetrics>({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    blockedTasks: 0,
    velocity: 0,
    healthScore: 100,
  });
  const [subagentTasks, setSubagentTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "ADMIN") {
      void router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    // Initialize agent statuses
    const initialAgents: AgentStatus[] = [
      {
        name: "BMAD Master",
        role: "Project orchestrator and knowledge base manager",
        status: "active",
        lastActivity: new Date().toISOString(),
        currentTask: "Coordinating Epic 1 implementation",
        icon: "🧠",
        color: "text-green-600",
      },
      {
        name: "Orchestrator",
        role: "Workflow coordinator and task distributor",
        status: "active",
        lastActivity: new Date().toISOString(),
        currentTask: "Managing sprint backlog",
        icon: "🎯",
        color: "text-blue-600",
      },
      {
        name: "Product Manager",
        role: "Product strategy and roadmap management",
        status: "active",
        lastActivity: new Date().toISOString(),
        currentTask: "Refining Epic 2 requirements",
        icon: "📊",
        color: "text-purple-600",
      },
      {
        name: "Business Analyst",
        role: "Requirements analysis and business logic design",
        status: "idle",
        lastActivity: new Date().toISOString(),
        icon: "🔍",
        color: "text-yellow-600",
      },
      {
        name: "Solution Architect",
        role: "System design and technical architecture",
        status: "active",
        lastActivity: new Date().toISOString(),
        currentTask: "Reviewing PostgreSQL migration",
        icon: "🏗️",
        color: "text-cyan-600",
      },
      {
        name: "Product Owner",
        role: "Feature prioritization and acceptance criteria",
        status: "idle",
        lastActivity: new Date().toISOString(),
        icon: "👤",
        color: "text-orange-600",
      },
      {
        name: "Scrum Master",
        role: "Agile process facilitation",
        status: "active",
        lastActivity: new Date().toISOString(),
        currentTask: "Planning next sprint",
        icon: "🏃",
        color: "text-pink-600",
      },
      {
        name: "Developer",
        role: "Implementation and coding",
        status: "active",
        lastActivity: new Date().toISOString(),
        currentTask: "Implementing subscription features",
        icon: "💻",
        color: "text-green-600",
      },
      {
        name: "QA Engineer",
        role: "Quality assurance and testing",
        status: "active",
        lastActivity: new Date().toISOString(),
        currentTask: "Running E2E test suite",
        icon: "🧪",
        color: "text-red-600",
      },
      {
        name: "UX Expert",
        role: "User experience design",
        status: "idle",
        lastActivity: new Date().toISOString(),
        icon: "🎨",
        color: "text-purple-600",
      },
      {
        name: "DevOps Engineer",
        role: "Infrastructure and CI/CD",
        status: "active",
        lastActivity: new Date().toISOString(),
        currentTask: "Monitoring Vercel deployments",
        icon: "🔧",
        color: "text-orange-600",
      },
    ];

    setAgents(initialAgents);

    // Set initial metrics
    setMetrics({
      totalTasks: 47,
      completedTasks: 12,
      inProgressTasks: 8,
      blockedTasks: 2,
      velocity: 3.5,
      healthScore: 92,
    });

    setIsLoading(false);

    // Initialize subagent tasks (simulated for now)
    const tasks = [
      {
        id: "task-1",
        agent: "general-purpose",
        description: "Research Epic 2 requirements",
        status: "completed",
        startTime: new Date(Date.now() - 3600000).toISOString(),
        endTime: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: "task-2",
        agent: "general-purpose",
        description: "Analyze subscription lifecycle",
        status: "in_progress",
        startTime: new Date(Date.now() - 900000).toISOString(),
      },
      {
        id: "task-3",
        agent: "general-purpose",
        description: "Review security headers implementation",
        status: "pending",
      },
    ];
    setSubagentTasks(tasks);
  }, []);

  const refreshStatus = () => {
    // Refresh the dashboard data
    window.location.reload();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "idle":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  if (status === "loading" || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading BMAD Squad Dashboard...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!session || session.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">BMAD Squad Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Breakthrough Method of Agile AI-Driven Development
          </p>
          <p className="text-sm text-gray-500">
            Foundations in Agentic Agile Driven Development - Autonomous Squad Status
          </p>
        </div>

        {/* Squad Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Health Score</p>
                <p className={`text-3xl font-bold ${getHealthScoreColor(metrics.healthScore)}`}>
                  {metrics.healthScore}%
                </p>
              </div>
              <div className="text-4xl">❤️</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Agents</p>
                <p className="text-3xl font-bold text-gray-900">
                  {agents.filter(a => a.status === "active").length}/{agents.length}
                </p>
              </div>
              <div className="text-4xl">🤖</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasks in Progress</p>
                <p className="text-3xl font-bold text-blue-600">{metrics.inProgressTasks}</p>
              </div>
              <div className="text-4xl">⚡</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sprint Velocity</p>
                <p className="text-3xl font-bold text-green-600">{metrics.velocity}</p>
              </div>
              <div className="text-4xl">📈</div>
            </div>
          </div>
        </div>

        {/* Task Progress */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Task Progress</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Overall Progress</span>
                <span>{metrics.completedTasks}/{metrics.totalTasks} tasks</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${(metrics.completedTasks / metrics.totalTasks) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{metrics.totalTasks}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{metrics.completedTasks}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{metrics.inProgressTasks}</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{metrics.blockedTasks}</p>
                <p className="text-sm text-gray-600">Blocked</p>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Status Grid */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Squad Members</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <div key={agent.name} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{agent.icon}</span>
                    <div>
                      <h3 className={`font-semibold ${agent.color}`}>{agent.name}</h3>
                      <p className="text-xs text-gray-500">{agent.role}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                      agent.status
                    )}`}
                  >
                    {agent.status}
                  </span>
                </div>
                {agent.currentTask && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                    <p className="text-gray-700">{agent.currentTask}</p>
                  </div>
                )}
                <div className="mt-2 text-xs text-gray-500">
                  Last active: {new Date(agent.lastActivity).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Claude Code Subagent Tasks */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Claude Code Subagent Tasks</h2>
          <div className="space-y-3">
            {subagentTasks.map((task) => (
              <div key={task.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{task.description}</p>
                    <p className="text-sm text-gray-500 mt-1">Agent: {task.agent}</p>
                    {task.startTime && (
                      <p className="text-xs text-gray-400 mt-1">
                        Started: {new Date(task.startTime).toLocaleTimeString()}
                        {task.endTime && ` • Completed: ${new Date(task.endTime).toLocaleTimeString()}`}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      task.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : task.status === "in_progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {task.status === "in_progress" ? "In Progress" : task.status}
                  </span>
                </div>
              </div>
            ))}
            {subagentTasks.length === 0 && (
              <p className="text-gray-500 text-center py-4">No active subagent tasks</p>
            )}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 Tip: Use Claude Code's Task tool to delegate work to subagents for research, analysis, and complex tasks.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => window.location.href = "/api/admin/squad-report"}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Generate Squad Report
          </button>
          <button
            onClick={refreshStatus}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Refresh Status
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default BMADDashboard;
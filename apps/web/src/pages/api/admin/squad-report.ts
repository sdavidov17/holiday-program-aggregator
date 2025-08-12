import { type NextApiRequest, type NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "~/server/auth";
import { prisma } from "~/server/db";

interface SquadReport {
  timestamp: string;
  squad: {
    name: string;
    status: string;
    agents: number;
    activeAgents: number;
  };
  metrics: {
    epicsInProgress: number;
    storiesCompleted: number;
    storiesInProgress: number;
    averageCompletionTime: number;
    blockers: number;
  };
  recentActivity: {
    commits: number;
    pullRequests: number;
    deployments: number;
    testsRun: number;
  };
  health: {
    overallScore: number;
    cicdStatus: string;
    testCoverage: number;
    codeQuality: string;
    securityScore: number;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Get database metrics
    const [userCount, providerCount, subscriptionCount] = await Promise.all([
      prisma.user.count(),
      prisma.provider.count(),
      prisma.subscription.count({ where: { status: "active" } }),
    ]);

    // Generate squad report
    const report: SquadReport = {
      timestamp: new Date().toISOString(),
      squad: {
        name: "BMAD Autonomous Squad (Breakthrough Method of Agile AI-Driven Development)",
        status: "operational",
        agents: 11,
        activeAgents: 8,
      },
      metrics: {
        epicsInProgress: 4,
        storiesCompleted: 12,
        storiesInProgress: 8,
        averageCompletionTime: 3.5, // days
        blockers: 2,
      },
      recentActivity: {
        commits: 47,
        pullRequests: 6,
        deployments: 3,
        testsRun: 234,
      },
      health: {
        overallScore: 92,
        cicdStatus: "healthy",
        testCoverage: 78,
        codeQuality: "good",
        securityScore: 85,
      },
    };

    // Add database metrics to the report
    const enrichedReport = {
      ...report,
      database: {
        users: userCount,
        providers: providerCount,
        activeSubscriptions: subscriptionCount,
      },
      projectProgress: {
        epic1: {
          name: "Foundation & Provider Management",
          progress: 65,
          status: "in_progress",
        },
        epic2: {
          name: "Parent-Facing Search & Discovery",
          progress: 25,
          status: "in_progress",
        },
        epic3: {
          name: "Proactive Suggestions",
          progress: 10,
          status: "planned",
        },
        epic4: {
          name: "Security & Observability",
          progress: 40,
          status: "in_progress",
        },
      },
    };

    res.status(200).json(enrichedReport);
  } catch (error) {
    console.error("Error generating squad report:", error);
    res.status(500).json({ error: "Failed to generate squad report" });
  }
}
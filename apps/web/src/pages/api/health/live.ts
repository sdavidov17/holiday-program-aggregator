import type { NextApiRequest, NextApiResponse } from 'next';

interface LivenessResponse {
  status: 'ok' | 'error';
  timestamp: string;
  service: string;
  version: string;
  uptime: number;
}

// Simple liveness check - just confirms the service is running
export default function handler(req: NextApiRequest, res: NextApiResponse<LivenessResponse>) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const response: LivenessResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'holiday-aggregator',
    version: process.env.NEXT_PUBLIC_VERSION || '1.0.0',
    uptime: process.uptime(),
  };

  // Set cache headers to prevent caching
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  res.status(200).json(response);
}

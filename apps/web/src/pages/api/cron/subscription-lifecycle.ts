import { NextApiRequest, NextApiResponse } from 'next';
import { processSubscriptionLifecycle } from '~/services/subscription-lifecycle';
import { env } from '~/env.mjs';
import { logger } from '~/utils/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify cron secret
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await processSubscriptionLifecycle();
    
    // Log the results
    logger.info('Cron job completed', { result });
    
    return res.status(200).json({ 
      success: true, 
      processed: result 
    });
  } catch (error) {
    logger.error('Subscription lifecycle cron error', { error });
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
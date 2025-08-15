import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    message: 'API is working',
    method: req.method,
    url: req.url,
    headers: {
      'content-type': req.headers['content-type'],
      'x-correlation-id': req.headers['x-correlation-id'],
    },
  });
}

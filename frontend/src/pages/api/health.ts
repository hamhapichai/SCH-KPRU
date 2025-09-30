import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Simple health check
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'sch-kpru-frontend',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NEXT_PUBLIC_APP_ENV || 'production',
      uptime: process.uptime()
    };

    res.status(200).json(healthCheck);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
}
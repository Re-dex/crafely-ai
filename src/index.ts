import express, { Express, Request, Response } from 'express';

const app: Express = express();
const port = process.env.PORT || 3000;
const startTime = new Date();

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Crafely AI Express Server');
});

app.get('/health', (req: Request, res: Response) => {
  const uptime = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: `${uptime} seconds`,
    serverInfo: {
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsage: process.memoryUsage().heapUsed
    }
  });
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

export default app
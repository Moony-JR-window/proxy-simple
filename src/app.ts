import express, { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import Access from './middleware/autoAccess';

dotenv.config({ path: '.env.development' });

const app = express();

app.use(Access);

declare module 'express' {
  interface Request {
    clientId?: string;
  }
}

// Define API_SERVICE_URL from environment variables
const API_SERVICE_URL = process.env.API || 'http://localhost:3000';



const proxyConfig: { [key: string]: Options } = {
  "/v1/users": {
    target: `${API_SERVICE_URL}`,
    changeOrigin: true,
    pathRewrite:{ "^/v1/users": `/v1/users/`}
  },
  "/v1/users/register": {
    target: `${API_SERVICE_URL}`,
    changeOrigin: true,
    pathRewrite: { "^/v1/users/register": "/v3/users/register" },
  },
  "/v1/users/confirm": {
    target: `${API_SERVICE_URL}/v3/users/register/confirm`,
    changeOrigin: true,
    pathRewrite: { "^/v1/users/confirm": "" },
  },
  "/v1/users/login": {
    target: `${API_SERVICE_URL}/v3/users/register/login`,
    changeOrigin: true,
    pathRewrite: { "^/v1/users/login": "" },
  },
  "/v2/users/facebook": {
    target: `${API_SERVICE_URL}`,
    changeOrigin: true,
    pathRewrite: { "^/v2/users/facebook": "/v5/users/facebook" },
  },
  "/v1/doc": {
    target: `${API_SERVICE_URL}`,
    changeOrigin: true,
    pathRewrite: { "^/v1/doc": "v1/doc" },
  },
};

// Middleware to handle unmatched routes and methods
app.use((req: Request, res: Response, next: NextFunction) => {
  const matchedRoute = Object.keys(proxyConfig).find(context => {
    const regex = new RegExp(`^${context}`);
    return regex.test(req.path) && proxyConfig[context].target;
  });

  if (!matchedRoute) {
    return res.status(404).json({ message: 'No matching route or method found for your request' });
  }

  next();
});

// Apply the proxy middlewares dynamically based on the configuration
Object.keys(proxyConfig).forEach((context) => {
  app.use(context, createProxyMiddleware(proxyConfig[context]));
});
Object.keys(proxyConfig).forEach((context) => {
  app.post(context, createProxyMiddleware(proxyConfig[context]));
});

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Proxy server is running');
});

export default app;

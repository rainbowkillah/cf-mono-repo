// packages/core/src/router.ts
import { errorResponse } from './responses';
import Env from './env';

type RouteHandler = (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response> | Response;

interface Route {
  method: string;
  path: RegExp;
  handler: RouteHandler;
}

export class Router {
  private routes: Route[] = [];

  private addRoute(method: string, path: string, handler: RouteHandler) {
    // Simple path to regex conversion
    const regexPath = new RegExp(`^${path.replace(/:\w+/g, '([^/]+)')}$`);
    this.routes.push({ method, path: regexPath, handler });
    return this;
  }

  get(path: string, handler: RouteHandler) {
    return this.addRoute('GET', path, handler);
  }

  post(path: string, handler: RouteHandler) {
    return this.addRoute('POST', path, handler);
  }

  // ... add other methods like PUT, DELETE as needed

  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    for (const route of this.routes) {
      if (request.method.toUpperCase() === route.method.toUpperCase()) {
        const match = path.match(route.path);
        if (match) {
          // Note: This simple router doesn't handle path parameters yet.
          return route.handler(request, env, ctx);
        }
      }
    }

    return errorResponse('Not Found', 404);
  }
}

export const createRouter = () => new Router();
import { NextFunction, Request, Response } from 'express';

/**
 * API version detection middleware
 * Supports versioning via:
 * 1. URL path prefix (e.g., /api/v1/users)
 * 2. Accept header (e.g., Accept: application/vnd.api.v1+json)
 * 3. Custom header (e.g., X-API-Version: 1)
 */
export const apiVersionMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  let apiVersion = 'v1'; // Default version

  // 1. Check URL path for version (e.g., /api/v2/users)
  const urlVersionMatch = req.path.match(/^\/api\/v(\d+)\//);
  if (urlVersionMatch) {
    apiVersion = `v${urlVersionMatch[1]}`;
  }
  // 2. Check Accept header (e.g., Accept: application/vnd.api.v2+json)
  else if (req.headers.accept) {
    const acceptVersionMatch = req.headers.accept.match(/application\/vnd\.api\.v(\d+)\+json/);
    if (acceptVersionMatch) {
      apiVersion = `v${acceptVersionMatch[1]}`;
    }
  }
  // 3. Check custom X-API-Version header
  else if (req.headers['x-api-version']) {
    const headerVersion = req.headers['x-api-version'] as string;
    // Normalize to v1, v2, etc.
    apiVersion = headerVersion.startsWith('v') ? headerVersion : `v${headerVersion}`;
  }

  // Store version in request for use by route handlers
  req.apiVersion = apiVersion;

  // Add version to response headers for transparency
  res.setHeader('X-API-Version', apiVersion);

  next();
};

/**
 * Middleware to enforce a specific API version
 * Usage: enforceApiVersion('v2')
 */
export const enforceApiVersion = (requiredVersion: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const requestVersion = req.apiVersion || 'v1';

    if (requestVersion !== requiredVersion) {
      res.status(400).json({
        error: 'API version mismatch',
        message: `This endpoint requires API version ${requiredVersion}, but received ${requestVersion}`,
        receivedVersion: requestVersion,
        requiredVersion,
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to deprecate an API version
 * Sends a deprecation warning header but still allows the request
 */
export const deprecateApiVersion = (deprecatedVersion: string, sunsetDate?: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const requestVersion = req.apiVersion || 'v1';

    if (requestVersion === deprecatedVersion) {
      // Set deprecation headers
      res.setHeader('Deprecation', 'true');
      if (sunsetDate) {
        res.setHeader('Sunset', sunsetDate);
      }
      res.setHeader(
        'Link',
        '</api/latest>; rel="latest-version", </api/migration-guide>; rel="migration-guide"'
      );

      // Log deprecation warning
      console.warn(
        `[${new Date().toISOString()}] Deprecated API version ${deprecatedVersion} used for ${req.method} ${req.path}`
      );
    }

    next();
  };
};



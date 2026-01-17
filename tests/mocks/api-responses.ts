/**
 * Mock API responses for testing
 */

/**
 * Successful quota response
 */
export const mockSuccessResponse = {
  code: 200,
  msg: 'success',
  success: true,
  data: {
    session_used: 75,
    session_total: 100,
    session_percent: 25,
    mcp_used: 150,
    mcp_total: 200,
    mcp_percent: 25,
    mcp_time_limit_used: 14400,
    mcp_time_limit_total: 28800,
    mcp_time_limit_percent: 50,
  },
};

/**
 * Low quota response
 */
export const mockLowQuotaResponse = {
  code: 200,
  msg: 'success',
  success: true,
  data: {
    session_used: 95,
    session_total: 100,
    session_percent: 5,
    mcp_used: 190,
    mcp_total: 200,
    mcp_percent: 5,
    mcp_time_limit_used: 27000,
    mcp_time_limit_total: 28800,
    mcp_time_limit_percent: 6,
  },
};

/**
 * Authentication error response
 */
export const mockAuthErrorResponse = {
  code: 1001,
  msg: 'Authorization Token Missing',
  success: false,
  data: null,
};

/**
 * Rate limit error response
 */
export const mockRateLimitResponse = {
  code: 429,
  msg: 'Too many requests',
  success: false,
  data: null,
};

/**
 * Unknown error response
 */
export const mockUnknownErrorResponse = {
  code: 500,
  msg: 'Internal server error',
  success: false,
  data: null,
};

/**
 * Mock HTTP response with status
 */
export function mockAxiosResponse<T>(data: T, status: number = 200) {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {},
    request: {},
  };
}

/**
 * Mock Axios error
 */
export function mockAxiosError(
  status: number,
  message: string,
  data?: unknown
) {
  const error = new Error(message) as any;
  error.response = {
    status,
    data,
    statusText: 'Error',
    headers: {},
    config: {},
  };
  error.isAxiosError = true;
  return error;
}

/**
 * Mock network error (no response)
 */
export function mockNetworkError(message: string = 'Network error') {
  const error = new Error(message) as any;
  error.request = {};
  error.response = undefined;
  error.isAxiosError = true;
  return error;
}

/**
 * Mock timeout error
 */
export function mockTimeoutError() {
  const error = new Error('timeout of 10000ms exceeded') as any;
  error.code = 'ECONNABORTED';
  error.isAxiosError = true;
  return error;
}

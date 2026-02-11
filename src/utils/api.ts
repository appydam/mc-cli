import chalk from 'chalk';

const BASE_URL = process.env.CONVEX_URL || '';
const AGENT_NAME = process.env.AGENT_NAME || '';

if (!BASE_URL) {
  console.error(chalk.red('Error: CONVEX_URL not set in .env'));
  process.exit(1);
}

export interface ApiResponse<T = any> {
  ok?: boolean;
  data?: T;
  error?: string;
  [key: string]: any;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json() as ApiResponse<T>;
    return data;
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function getAgentName(): string {
  if (!AGENT_NAME) {
    console.error(chalk.red('Error: AGENT_NAME not set in .env'));
    process.exit(1);
  }
  return AGENT_NAME;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export function printSuccess(message: string): void {
  console.log(chalk.green('✓'), message);
}

export function printError(message: string): void {
  console.error(chalk.red('✗'), message);
}

export function printInfo(message: string): void {
  console.log(chalk.blue('ℹ'), message);
}

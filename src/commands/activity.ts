import chalk from 'chalk';
import { apiRequest, getAgentName, printSuccess, printError, formatDate } from '../utils/api';

interface ListOptions {
  agent?: string;
  limit?: string;
}

interface LogOptions {
  task?: string;
}

async function list(options: ListOptions) {
  const params = new URLSearchParams();
  
  if (options.agent) params.append('agentName', options.agent);
  if (options.limit) params.append('limit', options.limit);

  const queryString = params.toString();
  const endpoint = `/api/activity${queryString ? `?${queryString}` : ''}`;
  
  const result = await apiRequest(endpoint);

  if (Array.isArray(result)) {
    if (result.length === 0) {
      console.log(chalk.gray('No activity found'));
      return;
    }

    console.log(chalk.bold(`\nActivity log (${result.length} entries):\n`));
    
    result.forEach((activity: any) => {
      console.log(`${chalk.bold(activity.agentName)} ${chalk.gray('→')} ${activity.action}`);
      if (activity.details) {
        console.log(`  ${chalk.gray(activity.details)}`);
      }
      console.log(`  ${chalk.gray(formatDate(activity.timestamp))}`);
      console.log('');
    });
  } else {
    printError('Failed to fetch activity log');
  }
}

async function log(action: string, details: string, options: LogOptions) {
  const agentName = getAgentName();
  
  const payload: any = {
    agentName,
    action,
    details,
  };

  if (options.task) {
    payload.taskId = options.task;
  }

  const result = await apiRequest('/api/activity', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (result.id || result.ok) {
    printSuccess('Activity logged');
  } else {
    printError(`Failed to log activity: ${result.error || 'Unknown error'}`);
  }
}

export const activityCommand = {
  list,
  log,
};

import chalk from 'chalk';
import { apiRequest, getAgentName, printSuccess, printError, printInfo } from '../utils/api';

interface HeartbeatOptions {
  task?: string;
}

export async function heartbeatCommand(status: string, options: HeartbeatOptions) {
  const validStatuses = ['online', 'working', 'idle', 'offline'];
  
  if (!validStatuses.includes(status)) {
    printError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    return;
  }

  const agentName = getAgentName();
  
  const payload: any = {
    agentName,
    status,
  };

  if (options.task) {
    payload.currentTaskId = options.task;
  }

  const result = await apiRequest('/api/heartbeat', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (result.ok) {
    printSuccess(`Heartbeat sent: ${chalk.bold(agentName)} is ${chalk.bold(status)}`);
    
    if (result.assignedTasks && result.assignedTasks.length > 0) {
      console.log('\n' + chalk.bold('Assigned Tasks:'));
      result.assignedTasks.forEach((task: any) => {
        const statusColor = task.status === 'done' ? 'green' : 
                           task.status === 'in_progress' ? 'yellow' : 'blue';
        console.log(`  ${chalk[statusColor]('●')} ${task.title} ${chalk.gray(`(${task.status})`)}`);
        console.log(`    ${chalk.gray(task._id)}`);
      });
    } else {
      printInfo('No assigned tasks');
    }
  } else {
    printError(`Failed to send heartbeat: ${result.error || 'Unknown error'}`);
  }
}

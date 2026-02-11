import chalk from 'chalk';
import { apiRequest, getAgentName, printSuccess, printError, formatDate } from '../utils/api';

interface ListOptions {
  unreadOnly?: boolean;
}

async function list(options: ListOptions) {
  const agentName = getAgentName();
  const params = new URLSearchParams({ agentName });
  
  if (options.unreadOnly) {
    params.append('unreadOnly', 'true');
  }

  const result = await apiRequest(`/api/notifications?${params.toString()}`);

  if (Array.isArray(result)) {
    if (result.length === 0) {
      console.log(chalk.gray('No notifications'));
      return;
    }

    console.log(chalk.bold(`\n${result.length} notification(s):\n`));
    
    result.forEach((notification: any) => {
      const icon = notification.read ? '📭' : '📬';
      console.log(`${icon} ${notification.type}`);
      console.log(`  ${chalk.gray('ID:')} ${notification._id}`);
      console.log(`  ${chalk.gray('Content:')} ${notification.content}`);
      console.log(`  ${chalk.gray('Created:')} ${formatDate(notification.createdAt)}`);
      console.log('');
    });
  } else {
    printError('Failed to fetch notifications');
  }
}

async function read(id: string) {
  const result = await apiRequest('/api/notifications/read', {
    method: 'POST',
    body: JSON.stringify({ id }),
  });

  if (result.ok) {
    printSuccess(`Notification ${id} marked as read`);
  } else {
    printError(`Failed to mark as read: ${result.error || 'Unknown error'}`);
  }
}

async function readAll() {
  const agentName = getAgentName();
  
  const result = await apiRequest('/api/notifications/read-all', {
    method: 'POST',
    body: JSON.stringify({ agentName }),
  });

  if (result.ok) {
    printSuccess('All notifications marked as read');
  } else {
    printError(`Failed to mark all as read: ${result.error || 'Unknown error'}`);
  }
}

export const notificationsCommand = {
  list,
  read,
  readAll,
};

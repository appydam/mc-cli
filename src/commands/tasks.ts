import chalk from 'chalk';
import { apiRequest, getAgentName, printSuccess, printError, formatDate } from '../utils/api';

interface ListOptions {
  assignee?: string;
  status?: string;
  priority?: string;
}

interface CreateOptions {
  title: string;
  description: string;
  priority: string;
  assignee?: string;
  tags?: string;
}

interface UpdateOptions {
  status?: string;
  priority?: string;
  assignee?: string;
}

async function list(options: ListOptions) {
  const params = new URLSearchParams();
  
  if (options.assignee) params.append('assignee', options.assignee);
  if (options.status) params.append('status', options.status);
  if (options.priority) params.append('priority', options.priority);

  const queryString = params.toString();
  const endpoint = `/api/tasks${queryString ? `?${queryString}` : ''}`;
  
  const result = await apiRequest(endpoint);

  if (Array.isArray(result)) {
    if (result.length === 0) {
      console.log(chalk.gray('No tasks found'));
      return;
    }

    console.log(chalk.bold(`\nFound ${result.length} task(s):\n`));
    
    result.forEach((task: any) => {
      const statusColor = task.status === 'done' ? 'green' : 
                         task.status === 'in_progress' ? 'yellow' : 
                         task.status === 'in_review' ? 'cyan' : 'blue';
      
      const priorityIcon = task.priority === 'urgent' ? '🔴' :
                          task.priority === 'high' ? '🟠' :
                          task.priority === 'medium' ? '🟡' : '⚪';
      
      console.log(`${priorityIcon} ${chalk.bold(task.title)}`);
      console.log(`  ${chalk.gray('ID:')} ${task._id}`);
      console.log(`  ${chalk.gray('Status:')} ${chalk[statusColor](task.status)}`);
      console.log(`  ${chalk.gray('Priority:')} ${task.priority}`);
      console.log(`  ${chalk.gray('Assignee:')} ${task.assignee || 'Unassigned'}`);
      console.log(`  ${chalk.gray('Created:')} ${formatDate(task.createdAt)}`);
      if (task.tags && task.tags.length > 0) {
        console.log(`  ${chalk.gray('Tags:')} ${task.tags.join(', ')}`);
      }
      console.log('');
    });
  } else {
    printError('Failed to fetch tasks');
  }
}

async function get(id: string) {
  const result = await apiRequest(`/api/tasks/${id}`);

  if (result && result._id) {
    console.log('\n' + chalk.bold(result.title));
    console.log(chalk.gray('─'.repeat(result.title.length)));
    console.log(`${chalk.gray('ID:')} ${result._id}`);
    console.log(`${chalk.gray('Status:')} ${result.status}`);
    console.log(`${chalk.gray('Priority:')} ${result.priority}`);
    console.log(`${chalk.gray('Assignee:')} ${result.assignee || 'Unassigned'}`);
    console.log(`${chalk.gray('Creator:')} ${result.creator}`);
    console.log(`${chalk.gray('Created:')} ${formatDate(result.createdAt)}`);
    if (result.tags && result.tags.length > 0) {
      console.log(`${chalk.gray('Tags:')} ${result.tags.join(', ')}`);
    }
    console.log(`\n${chalk.bold('Description:')}`);
    console.log(result.description);
    console.log('');
  } else {
    printError('Task not found');
  }
}

async function create(options: CreateOptions) {
  const agentName = getAgentName();
  
  const payload: any = {
    title: options.title,
    description: options.description,
    priority: options.priority,
    creator: agentName,
  };

  if (options.assignee) {
    payload.assignee = options.assignee;
  }

  if (options.tags) {
    payload.tags = options.tags.split(',').map(t => t.trim());
  }

  const result = await apiRequest('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (result.id) {
    printSuccess(`Task created: ${result.id}`);
  } else {
    printError(`Failed to create task: ${result.error || 'Unknown error'}`);
  }
}

async function claim(id: string) {
  const agentName = getAgentName();
  
  const result = await apiRequest('/api/tasks/claim', {
    method: 'POST',
    body: JSON.stringify({ id, agentName }),
  });

  if (result.ok) {
    printSuccess(`Task ${id} claimed`);
  } else {
    printError(`Failed to claim task: ${result.error || 'Unknown error'}`);
  }
}

async function update(id: string, options: UpdateOptions) {
  const payload: any = { id };
  
  if (options.status) payload.status = options.status;
  if (options.priority) payload.priority = options.priority;
  if (options.assignee) payload.assignee = options.assignee;

  const result = await apiRequest('/api/tasks/update', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (result.ok) {
    printSuccess(`Task ${id} updated`);
  } else {
    printError(`Failed to update task: ${result.error || 'Unknown error'}`);
  }
}

export const tasksCommand = {
  list,
  get,
  create,
  claim,
  update,
};

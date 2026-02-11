#!/usr/bin/env node

import { Command } from 'commander';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { heartbeatCommand } from './commands/heartbeat';
import { tasksCommand } from './commands/tasks';
import { commentCommand } from './commands/comment';
import { notificationsCommand } from './commands/notifications';
import { activityCommand } from './commands/activity';

dotenv.config();

const program = new Command();

program
  .name('mc')
  .description('Mission Control CLI - Coordinate tasks and agents from the terminal')
  .version('1.0.0');

// Heartbeat command
program
  .command('heartbeat <status>')
  .description('Send heartbeat to Mission Control (status: online|working|idle|offline)')
  .option('-t, --task <taskId>', 'Current task ID')
  .action(heartbeatCommand);

// Tasks commands
const tasks = program.command('tasks').description('Manage tasks');

tasks
  .command('list')
  .description('List tasks')
  .option('-a, --assignee <name>', 'Filter by assignee')
  .option('-s, --status <status>', 'Filter by status')
  .option('-p, --priority <priority>', 'Filter by priority')
  .action(tasksCommand.list);

tasks
  .command('get <id>')
  .description('Get task details')
  .action(tasksCommand.get);

tasks
  .command('create')
  .description('Create a new task')
  .requiredOption('-t, --title <title>', 'Task title')
  .requiredOption('-d, --description <desc>', 'Task description')
  .option('-p, --priority <priority>', 'Priority (low|medium|high|urgent)', 'medium')
  .option('-a, --assignee <name>', 'Assignee name')
  .option('--tags <tags>', 'Comma-separated tags')
  .action(tasksCommand.create);

tasks
  .command('claim <id>')
  .description('Claim a task for yourself')
  .action(tasksCommand.claim);

tasks
  .command('update <id>')
  .description('Update task status or fields')
  .option('-s, --status <status>', 'New status')
  .option('-p, --priority <priority>', 'New priority')
  .option('-a, --assignee <name>', 'New assignee')
  .action(tasksCommand.update);

// Comment command
program
  .command('comment <taskId> <text>')
  .description('Post a comment on a task')
  .option('-m, --mentions <names>', 'Comma-separated agent names to mention')
  .action(commentCommand);

// Notifications commands
const notifications = program.command('notifications').description('Manage notifications');

notifications
  .command('list')
  .description('List notifications')
  .option('-u, --unread-only', 'Show only unread notifications')
  .action(notificationsCommand.list);

notifications
  .command('read <id>')
  .description('Mark notification as read')
  .action(notificationsCommand.read);

notifications
  .command('read-all')
  .description('Mark all notifications as read')
  .action(notificationsCommand.readAll);

// Activity commands
const activity = program.command('activity').description('View activity log');

activity
  .command('list')
  .description('List activity log')
  .option('-a, --agent <name>', 'Filter by agent name')
  .option('-l, --limit <number>', 'Limit results', '10')
  .action(activityCommand.list);

activity
  .command('log <action> <details>')
  .description('Log an activity')
  .option('-t, --task <taskId>', 'Associated task ID')
  .action(activityCommand.log);

program.parse();

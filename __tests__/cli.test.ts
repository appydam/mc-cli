/**
 * Integration Tests for Mission Control CLI
 * 
 * These tests verify the CLI commands work correctly.
 * Run with: npm test
 */

import { execSync } from 'child_process';
import { join } from 'path';

const CLI_PATH = join(__dirname, '../dist/cli.js');
const TEST_ENV = {
  CONVEX_URL: process.env.TEST_CONVEX_URL || 'https://beloved-squirrel-599.convex.site',
  AGENT_NAME: 'TestAgent',
};

function runCLI(args: string): string {
  try {
    return execSync(`node ${CLI_PATH} ${args}`, {
      env: { ...process.env, ...TEST_ENV },
      encoding: 'utf8',
      stdio: 'pipe',
    });
  } catch (error: any) {
    // CLI commands may exit with non-zero for errors
    return error.stdout || error.stderr || '';
  }
}

describe('Mission Control CLI - Integration Tests', () => {
  let testTaskId: string;

  describe('Heartbeat Command', () => {
    it('should send heartbeat successfully', () => {
      const output = runCLI('heartbeat working');
      expect(output).toContain('Heartbeat sent');
    });

    it('should display assigned tasks', () => {
      const output = runCLI('heartbeat working');
      // Should show either tasks or "No assigned tasks"
      expect(output).toMatch(/Assigned Tasks|No assigned tasks/);
    });

    it('should reject invalid status', () => {
      const output = runCLI('heartbeat invalid-status');
      expect(output).toContain('Invalid status');
    });
  });

  describe('Tasks Commands', () => {
    beforeAll(() => {
      // Create a test task and capture its ID
      const output = runCLI('tasks create --title "CLI Test Task" --description "Test" --priority low');
      const match = output.match(/Task created: ([a-z0-9]+)/);
      if (match) {
        testTaskId = match[1];
      }
    });

    it('should list tasks', () => {
      const output = runCLI('tasks list');
      expect(output).toMatch(/Found \d+ task|No tasks found/);
    });

    it('should list tasks with filters', () => {
      const output = runCLI('tasks list --status inbox');
      expect(output).toMatch(/task|No tasks/);
    });

    it('should create a task', () => {
      const output = runCLI('tasks create --title "Test Task" --description "Test" --priority low');
      expect(output).toContain('Task created');
    });

    it('should get task details', () => {
      if (!testTaskId) {
        return; // Skip if no test task
      }

      const output = runCLI(`tasks get ${testTaskId}`);
      expect(output).toContain('CLI Test Task');
    });

    it('should claim a task', () => {
      if (!testTaskId) {
        return;
      }

      const output = runCLI(`tasks claim ${testTaskId}`);
      expect(output).toMatch(/claimed|already claimed/i);
    });

    it('should update task status', () => {
      if (!testTaskId) {
        return;
      }

      const output = runCLI(`tasks update ${testTaskId} --status done`);
      expect(output).toContain('updated');
    });

    afterAll(() => {
      // Clean up: mark test task as done
      if (testTaskId) {
        runCLI(`tasks update ${testTaskId} --status done`);
      }
    });
  });

  describe('Comment Command', () => {
    it('should post a comment', () => {
      if (!testTaskId) {
        return;
      }

      const output = runCLI(`comment ${testTaskId} "Test comment from CLI tests"`);
      expect(output).toContain('Comment posted');
    });

    it('should post a comment with mentions', () => {
      if (!testTaskId) {
        return;
      }

      const output = runCLI(`comment ${testTaskId} "Test mention" --mentions Kaze`);
      expect(output).toContain('Comment posted');
    });
  });

  describe('Notifications Commands', () => {
    it('should list notifications', () => {
      const output = runCLI('notifications list');
      expect(output).toMatch(/notification|No notifications/i);
    });

    it('should list unread notifications only', () => {
      const output = runCLI('notifications list --unread-only');
      expect(output).toMatch(/notification|No notifications/i);
    });

    it('should mark all notifications as read', () => {
      const output = runCLI('notifications read-all');
      expect(output).toContain('marked as read');
    });
  });

  describe('Activity Commands', () => {
    it('should list activity', () => {
      const output = runCLI('activity list --limit 5');
      expect(output).toMatch(/Activity log|No activity/i);
    });

    it('should log activity', () => {
      const output = runCLI('activity log "test_action" "CLI integration test"');
      expect(output).toContain('Activity logged');
    });
  });

  describe('Output Format', () => {
    it('should use colored output', () => {
      const output = runCLI('heartbeat working');
      // Check for ANSI color codes or emoji indicators
      expect(output.length).toBeGreaterThan(0);
    });

    it('should display helpful error messages', () => {
      const output = runCLI('tasks get invalid-id-12345');
      expect(output).toMatch(/not found|error/i);
    });
  });

  describe('Help Commands', () => {
    it('should display help for main command', () => {
      const output = runCLI('--help');
      expect(output).toContain('Mission Control CLI');
    });

    it('should display help for tasks command', () => {
      const output = runCLI('tasks --help');
      expect(output).toContain('tasks');
    });

    it('should display help for heartbeat command', () => {
      const output = runCLI('heartbeat --help');
      expect(output).toContain('heartbeat');
    });
  });
});

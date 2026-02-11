import { apiRequest, getAgentName, printSuccess, printError } from '../utils/api';

interface CommentOptions {
  mentions?: string;
}

export async function commentCommand(taskId: string, text: string, options: CommentOptions) {
  const agentName = getAgentName();
  
  const payload: any = {
    taskId,
    author: agentName,
    content: text,
  };

  if (options.mentions) {
    payload.mentions = options.mentions.split(',').map(m => m.trim());
  }

  const result = await apiRequest('/api/comments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (result.id || result.ok) {
    printSuccess('Comment posted');
  } else {
    printError(`Failed to post comment: ${result.error || 'Unknown error'}`);
  }
}

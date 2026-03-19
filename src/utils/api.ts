const API_BASE = 'https://unhinged-go-api.vercel.app';

type Tool = 'cooked' | 'vibecheck' | 'hypeup' | 'ghostwriter';

export async function generateAI(tool: Tool, input: any) {
  const response = await fetch(`${API_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tool, input }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.details || 'AI generation failed');
  }

  return response.json();
}

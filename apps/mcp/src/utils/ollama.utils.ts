import { Ollama } from 'ollama';

const ollama = new Ollama(); // connects to http://localhost:11434 by default

/**
 * The custom model you created from the Modelfile.
 * Has num_ctx 8192, temperature 0.1, top_p 0.9 baked in.
 */
const MODEL = 'deepseek-coder:6.7b';

/**
 * Calls beggy-coder (DeepSeek 6.7B) via Ollama.
 * Returns raw text output — stripping and validation happen upstream.
 *
 * @throws Error if Ollama is not running
 */
export async function callDeepSeek(prompt: string): Promise<string> {
	try {
		const response = await ollama.chat({
			model: MODEL,
			options: {
				temperature: 0.1,
				top_p: 0.9,
				num_ctx: 8192,
			},
			messages: [
				{
					role: 'system',
					content: `You are a TypeScript code generator for the Beggy project.
Your ONLY job is to output raw TypeScript file content.
You MUST follow the exact patterns shown in the reference files.
You MUST follow all Beggy project constraints provided.
NEVER output explanations, markdown, code fences, or any text that is not TypeScript.
If you are unsure about a value, copy it from the reference file.`,
				},
				{
					role: 'user',
					content: prompt,
				},
			],
			// Note: temperature/top_p/num_ctx are already set in the Modelfile
			// No need to override here
		});

		return response.message.content.trim();
	} catch (error) {
		throw new Error(
			`❌ Ollama is not reachable.\n\n` +
				`Make sure Ollama is running:\n` +
				`   ollama serve\n\n` +
				`And verify beggy-coder exists:\n` +
				`   ollama list\n\n` +
				`Original error: ${error instanceof Error ? error.message : String(error)}`
		);
	}
}

import { readFile } from 'fs/promises';
import promptSync from 'prompt-sync';

export const getBody = async (promptString: string, prompt: promptSync.Prompt) => {
	let filePath = prompt(promptString);
	let file = '';
	let hasError = false;

	do {
		if (hasError) {
			filePath = prompt('Bad file path :( Try again: ');
		}

		try {
			file = await readFile(filePath, 'utf8');
			hasError = false;
		} catch (err) {
			hasError = true;
		}
	} while (hasError);

	return { file, filePath };
};

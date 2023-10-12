import { readFile } from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';
import { ApplicationStatus, UserData } from '../types/database';

/**
 * Gets an HTML template given the file name
 * @param template The name of the HTML template file
 * @returns The string version of the HTML template file
 */
const getHtmlTemplate = (template: string) => {
	// assume directory is currently in /pages/api/, need to go to /email/html/...
	// console.log('directory: ', path.join(process.cwd(), `/email/html/${template}.html`));
	return readFile(path.join(process.cwd(), `/email/html/${template}.html`), 'utf8');
};

/**
 * Fills out an HTML template with variables
 * @param template The name of the HTML template file
 * @param variables Object with key-value pairs for each variable
 * @returns The string version of the HTML template file with substituted variables
 */
export const fillHtmlTemplate = async (template: string, variables: Record<string, string>) => {
	// get html template
	let result = await getHtmlTemplate(template);

	// substitute in variables
	Object.entries(variables).forEach(([key, value]) => {
		result = result.split(`{{${key}}}`).join(value);
	});

	return result;
};

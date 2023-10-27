const { SLACK_LOGGING_WEBHOOK } = process.env;

export default async function log(user: any, data: any) {
	if (!SLACK_LOGGING_WEBHOOK) return;

	await fetch(SLACK_LOGGING_WEBHOOK as string, {
		method: 'POST',
		body: JSON.stringify({
			user,
			data,
		}),
	});
}

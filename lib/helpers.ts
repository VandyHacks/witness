import { notification } from 'antd';

export function handleRequestFailure(message: string) {
	notification['error']({
		message,
		description: 'Please try again or contact an organizer if the problem persists.',
		placement: 'bottomRight',
	});
}

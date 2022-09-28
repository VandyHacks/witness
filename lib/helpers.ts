import { notification } from 'antd';

export function handleSubmitSuccess(msg: string = 'Successfully updated!') {
	notification['success']({
		message: msg,
		placement: 'bottomRight',
	});
}

export function handleSubmitFailure(msg: string) {
	notification['error']({
		message: 'Oops, something went wrong.',
		description: msg || 'Please try again or contact an organizer if the problem persists.',
		placement: 'bottomRight',
	});
}

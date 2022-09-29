import { Button, Input, InputRef, Modal, notification, Table } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { EventData } from '../types/database';

interface EventDisplay extends EventData {
	setCurEvent: (open: EventDisplay) => void;
}

const columns = [
	{
		title: 'Name',
		dataIndex: 'name',
	},
	{
		title: 'Check In',
		render: (_: any, record: EventDisplay) => {
			return <Button onClick={() => record.setCurEvent(record)}>Check In</Button>;
		},
	},
];

const Events = () => {
	const [curEvent, setCurEvent] = useState<EventDisplay | null>(null);
	const [events, setEvents] = useState<EventDisplay[]>([]);
	const [nfcId, setNfcId] = useState<string>('');
	const [loading, setLoading] = useState(false);
	
	const input = useRef<InputRef>(null);

	useEffect(() => {
		// wait for modal to open then focus input
		if (curEvent) {
			setTimeout(() => input.current?.focus());
		}
	}, [curEvent]);

	const getData = () => {
		return fetch('/api/events')
			.then(res => res.json())
			.then(data => {
				setEvents(
					data.map((obj: EventData) => {
						return {
							key: obj._id,
							setCurEvent,
							...obj,
						};
					})
				);
			});
	};

	const handleCheckIn = async () => {
		const response = await fetch('/api/event-checkin', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				nfcId,
				eventId: curEvent?._id,
			}),
		});
		if (response.ok) {
			notification['success']({
				message: `Successfully checked in!`,
				placement: 'bottomRight',
			});
		} else {
			notification['error']({
				message: 'Failed to check-in hacker',
				description: await response.text(),
				placement: 'bottomRight',
			});
		}
		setNfcId('');
	};

	const handleCancel = () => {
		setCurEvent(null);
		setNfcId('');
	};

	const syncCalendar = async () => {
		setLoading(true);
		await fetch('/api/sync-calendar');
		getData().then(() => setLoading(false));
	};

	useEffect(() => {
		getData();
	}, []);

	return (
		<>
			<Button loading={loading} onClick={syncCalendar}>
				Sync Calendar Events
			</Button>
			<br />
			<br />
			<Table sticky bordered dataSource={events} columns={columns} />
			<Modal
				title={`${curEvent?.name} Check-in`}
				open={!!curEvent}
				onOk={handleCheckIn}
				onCancel={handleCancel}
				footer={[
					<Button key="submit" type="primary" loading={loading} onClick={handleCheckIn}>
						Check in
					</Button>,
				]}>
				<Input
					ref={input}
					placeholder="NFC ID"
					value={nfcId}
					onChange={e => setNfcId(e.target.value)}
					onPressEnter={handleCheckIn}
				/>
			</Modal>
		</>
	);
};

export default Events;

import { Button, Input, InputRef, Modal, notification, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useEffect, useRef, useState } from 'react';
import { EventData } from '../types/database';

interface EventDisplay extends EventData {
	setCurEvent: (open: EventDisplay) => void;
}

const columns: ColumnsType<EventDisplay> = [
	{
		title: 'Day',
		dataIndex: 'startTime',
		key: 'day',
		render: (startTime: string) => {
			let date = new Date(startTime).toDateString();
			// TODO use a date format string instead for clarity
			date = date.substring(0, date.length - 5);
			return date;
		},
		width: '15%',
	},
	{
		title: 'Time',
		dataIndex: 'startTime',
		key: 'time',
		render: (startTime: string, record: EventDisplay) => {
			// TODO use a date format string instead for clarity
			const start = new Date(startTime);
			const end = new Date(record.endTime.toString());
			const startHours = start.getHours() % 12 || 12;
			const startMinutes = start.getMinutes();
			const endHours = end.getHours() % 12 || 12;
			const endMinutes = end.getMinutes();
			const startAmPm = start.getHours() >= 12 ? 'PM' : 'AM';
			const endAmPm = end.getHours() >= 12 ? 'PM' : 'AM';
			return (
				<span>
					{startHours}:{startMinutes < 10 ? `0${startMinutes}` : startMinutes} {startAmPm} - {endHours}:
					{endMinutes < 10 ? `0${endMinutes}` : endMinutes} {endAmPm}
				</span>
			);
		},
		sorter: (a: EventDisplay, b: EventDisplay) => {
			const aStart = new Date(a.startTime.toString());
			const bStart = new Date(b.startTime.toString());
			return aStart.getTime() - bStart.getTime();
		},
		sortOrder: 'ascend',
		width: '15%',
	},
	{
		title: 'Name',
		dataIndex: 'name',
		key: 'name',
		width: '40%',
	},
	{
		title: 'Count',
		dataIndex: 'count',
		key: 'count',
		width: '10%',
		render: (count: number) => {
			return <span>{count ? count : 0}</span>;
		},
	},
	{
		title: 'Check In',
		dataIndex: 'checkIn',
		key: 'checkIn',
		render: (_: any, record: EventDisplay) => {
			return <Button onClick={() => record.setCurEvent(record)}>Check In</Button>;
		},
		width: '20%',
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
		// TODO: rethink this function: is it better to combine /events-count and /events api?
		const result = fetch('/api/events-count')
			.then(res => res.json())
			.then(eventCount => {
				return fetch('/api/events')
					.then(res => res.json())
					.then(events => {
						setEvents(
							events.map((event: EventData) => {
								// TODO convert startTime and endTime here so we don't have to do it in the render function
								const count = eventCount.find((e: any) => e._id === event._id);
								return {
									key: event._id,
									...event,
									setCurEvent,
									count: count ? count.count : 0,
								};
							})
						);
					});
			});

		return result;
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
		// TODO: use useSWR and mutate to update data for good practice
		getData();
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

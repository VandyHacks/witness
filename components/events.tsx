import { ConsoleSqlOutlined } from '@ant-design/icons';
import { Button, Modal, Table } from 'antd';
import { useEffect, useState } from 'react';
import { EventData } from '../types/database';

interface EventDisplay extends EventData {
	setCurEvent: (open: String) => void;
}

const columns = [
	{
		title: 'Name',
		dataIndex: 'name',
	},
	{
		title: 'Check In',
		render: (_: any, record: EventDisplay) => {
			return <Button onClick={() => record.setCurEvent(record.name)}>Check In</Button>;
		},
	},
];

const Events = () => {
	const [curEvent, setCurEvent] = useState(undefined);
	const [events, setEvents] = useState<EventDisplay[]>([]);
	const [loading, setLoading] = useState(false);

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
			<Modal title={`${curEvent} Check-in`} open={curEvent}></Modal>
		</>
	);
};

export default Events;

import { Button, Input, InputRef, Modal, notification, Table, InputNumber } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useEffect, useRef, useState } from 'react';
import { EventCountData, EventData } from '../../../types/database';
import { RequestType, useCustomSWR } from '../../../utils/request-utils';
import { mutate } from 'swr';
import { ObjectId } from 'mongoose';

interface EventDisplay extends EventData {
	setCurEvent: (open: EventDisplay) => void;
}

export default function Events() {
	const [curEvent, setCurEvent] = useState<EventDisplay | null>(null);
	const [events, setEvents] = useState<EventDisplay[]>([]);
	const [nfcId, setNfcId] = useState<string>('');
	const [loading, setLoading] = useState(false);
	const [showSaveButton, setShowSaveButton] = useState(false);

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
			width: '30%',
		},
		{
			title: 'NFC Points',
			dataIndex: 'nfcPoints',
			key: 'nfcPoints',
			width: '10%',
			render: (nfcPoints: number, record: EventDisplay, index: number) => {
				return (
					<>
						<InputNumber
							defaultValue={nfcPoints ? nfcPoints : 0}
							onChange={(newNfcPoints: number | null) =>
								handleNFCPointChanges(record._id, newNfcPoints || 0)
							}
						/>
					</>
				);
			},
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

	const input = useRef<InputRef>(null);

	// get events count
	const { data: eventsCountData, error: eventsCountError } = useCustomSWR<EventCountData>({
		url: '/api/events-count',
		method: RequestType.GET,
		errorMessage: 'Failed to get count of events.',
	});

	// get events data
	const { data: eventsData, error: eventsError } = useCustomSWR<EventData>({
		url: '/api/events',
		method: RequestType.GET,
		errorMessage: 'Failed to get list of events.',
	});

	useEffect(() => {
		if (eventsCountData && eventsCountData.length > 0 && eventsData && eventsData.length > 0) {
			console.log(eventsCountData);
			setEvents(
				eventsData.map((event: EventData) => {
					// TODO convert startTime and endTime here so we don't have to do it in the render function
					const count = eventsCountData.find((e: any) => e._id === event._id);
					return {
						key: event._id,
						...event,
						setCurEvent,
						count: count ? count.count : 0,
					};
				})
			);
		}
	}, [eventsData, eventsCountData]);

	useEffect(() => {
		// wait for modal to open then focus input
		if (curEvent) {
			setTimeout(() => input.current?.focus());
		}
	}, [curEvent]);

	const refreshData = async () => {
		setLoading(true);
		mutate('/api/events-count', true)
			.then(() => mutate('/api/events', true))
			.finally(() => setLoading(false));
	};

	const handleNFCPointChanges = (eventId: ObjectId, nfcPoints: number) => {
		// Deep copy and update array
		const newEvents = JSON.parse(JSON.stringify(events));
		newEvents.map((event: EventDisplay) => {
			if (event._id === eventId) event.nfcPoints = nfcPoints;
			return event;
		});
		setEvents(newEvents);

		// Show the save button
		setShowSaveButton(true);
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
		refreshData();
	};

	const handleSaveChanges = async () => {
		// Send POST request
		const response = await fetch('/api/event-save-changes', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(events),
		});

		// Display the success/failure messages
		if (response.ok) {
			notification['success']({
				message: `Successfully Saved Changes!`,
				placement: 'bottomRight',
			});
		} else {
			notification['error']({
				message: 'Failed to save changes',
				description: await response.text(),
				placement: 'bottomRight',
			});
		}
	};

	const handleCancel = () => {
		setCurEvent(null);
		setNfcId('');
	};

	const syncCalendar = async () => {
		setLoading(true);
		await fetch('/api/sync-calendar');
		refreshData();
	};

	const ButtonBoxStyle = {
		display: 'flex',
		justifyContent: 'space-between',
	};
	return (
		<>
			<div style={ButtonBoxStyle}>
				<Button loading={loading} onClick={syncCalendar}>
					Sync Calendar Events
				</Button>
				{showSaveButton && (
					<Button loading={loading} onClick={handleSaveChanges}>
						Save Changes
					</Button>
				)}
			</div>

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
}

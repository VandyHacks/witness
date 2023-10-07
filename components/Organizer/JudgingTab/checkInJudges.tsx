import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Space, Table } from 'antd';
import React from 'react';
import { mutate } from 'swr';
import { handleSubmitFailure, handleSubmitSuccess } from '../../../lib/helpers';
import { UserData } from '../../../types/database';

const CheckInJudges = ({ judgeData }: { judgeData: UserData[] }) => {
	// handle check in/out judges
	const handleJudgeCheckInOut = async (judgeId: string, newCheckIn: boolean) => {
		const res = await fetch('/api/judge-checkin', {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				judgeId,
				isJudgeCheckedIn: newCheckIn,
			}),
		});

		if (res.ok) {
			mutate('/api/users?usertype=JUDGE');
			handleSubmitSuccess(await res.text());
		} else handleSubmitFailure(await res.text());
	};

	// columns for the check in judges table
	const newCols = [
		{
			title: 'Judge',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Email',
			dataIndex: 'email',
			key: 'email',
		},
		{
			title: 'Checked In',
			dataIndex: 'isJudgeCheckedIn',
			key: 'isJudgeCheckedIn',
			render: (isCheckedIn: boolean, judge: UserData) => {
				return (
					<Space>
						<Button
							type={isCheckedIn === true ? 'primary' : 'default'}
							shape="circle"
							icon={<CheckOutlined />}
							onClick={() => {
								handleJudgeCheckInOut(judge._id.toString(), true);
							}}
						/>
						<Button
							type={isCheckedIn === false ? 'primary' : 'default'}
							shape="circle"
							icon={<CloseOutlined />}
							onClick={() => {
								handleJudgeCheckInOut(judge._id.toString(), false);
							}}
						/>
					</Space>
				);
			},
		},
	];

	return (
		<>
			<h2>Check in Judges ({judgeData.length ?? 0})</h2>
			<Table dataSource={judgeData} columns={newCols} />
		</>
	);
};

export default CheckInJudges;

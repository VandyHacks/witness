import { ScheduleData } from '../pages/api/schedule';
import { AllDone, Current, UpNext } from '../components/scheduleItem';
import React from 'react';
import { Row, Col } from 'antd';

interface CardsProps {
	current: ScheduleData | undefined;
	next: ScheduleData | undefined;
}

export default function Cards({ current, next }: CardsProps) {
	if (current === undefined && next === undefined) {
		return <AllDone />;
	} else {
		return (
			<Row gutter={16}>
				{current && (
					<Col className="gutter-row" flex={1}>
						<Current {...current} />
					</Col>
				)}
				{next && (
					<Col className="gutter-row" flex={1}>
						<UpNext {...next} />
					</Col>
				)}
			</Row>
		);
	}
}

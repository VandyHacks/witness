import { Slider, InputNumber, Row, Col } from 'antd';
import React, { useState } from 'react';
interface ScoreInputProps {
	value: number;
	onChange: (value: number) => void;
}

export default function ScoreInput(props: ScoreInputProps) {
	const { value, onChange } = props;
	// const [value, setValue] = useState(1);
	const [min, max] = [0, 7];
	// const onChange = (val: number) => {
	// 	// console.log("Val:", val)
	// 	if (val !== null) {
	// 		setValue(val);
	// 	}
	// };
	return (
		<Row>
			<Col span={20}>
				<Slider min={min} max={max} onChange={onChange} value={value} />
			</Col>
			<Col span={4}>
				<InputNumber
					min={min}
					max={max}
					value={value}
					onChange={onChange}
					style={{ marginLeft: '16px', maxWidth: '100%' }}
				/>
			</Col>
		</Row>
	);
}

import { Slider, Radio , InputNumber, Row, Col } from 'antd';
import { RadioChangeEvent } from 'antd/lib';
import { IntegerType } from 'mongodb';
import React from 'react';
interface ScoreInputProps {
	value: number;
	onChange: (value: number | null) => void;
}

export default function ScoreInput(props: ScoreInputProps) {
	const { value, onChange } = props;
	const [min, max] = [0, 7];
	const onRadioChange = (e: RadioChangeEvent) => {
        onChange(e.target.value);
    };
	
	return (
		<Row>
			<Col span={20}>
				<Radio.Group onChange={onRadioChange} value={value}>
					<Radio style={{marginRight: '20px'}} value={1}>1</Radio>
      				<Radio style={{marginRight: '20px'}} value={2}>2</Radio>
      				<Radio style={{marginRight: '20px'}} value={3}>3</Radio>
      				<Radio style={{marginRight: '20px'}} value={4}>4</Radio>
					<Radio style={{marginRight: '20px'}} value={5}>5</Radio>
      				<Radio style={{marginRight: '20px'}} value={6}>6</Radio>
      				<Radio value={7}>7</Radio>
				</Radio.Group>
				
			</Col>
			<Col span={4}>
				<InputNumber
					required
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

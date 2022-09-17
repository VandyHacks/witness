import { Form, Button, Select, Row, Col, message } from 'antd';
import Text from 'antd/lib/typography/Text';
import { useState } from 'react';

const { Option } = Select;

export interface ManageFormFields2 {
    _id: string;
    name: string;
    email: string;
    applicationStatus: string; //Enum for status needed (Submitted, Accepted, Declined)
}

export interface ManageFormProps2 {
    applicationData: ManageFormFields2[];
    onSubmit: (value: ManageFormFields2) => Promise<void>;
}

export default function ManageRoleForm(props: ManageFormProps2) {
    const { onSubmit } = props;
    const layout = {
        labelCol: { span: 8 },
        wrapperCol: { span: 6 },
        labelAlign: 'left',
    };

    const [modified, setModified] = useState<string[]>([]);

    // TODO: probably add search
    const [form] = Form.useForm();

    return (
        <Form {...layout} labelAlign="left" form={form} onFinish={onSubmit}>
            {
            props.applicationData.map(config => (
                <Form.Item
                    name={config._id}
                    // display name and email
                    label={
                        <Text style={{ height: '50px' }}>
                            {config.name}
                            <br />
                            <Text type="secondary">{config.email}</Text>
                        </Text>
                    }
                    colon={false}
                    key={config._id}
                    initialValue={config.applicationStatus}
                >
                    <Select
                        placeholder="Select Status"
                        status={modified.includes(config._id) ? 'warning' : ''}
                        // not really a warning just good visually
                        // make box glow if role has been changed
                        onSelect={(role: string) => {
                            if (role !== props.applicationData.find(user => user._id === config._id)?.applicationStatus) {
                                setModified([...modified, config._id]);
                            } else {
                                setModified([...modified.filter(user => user !== config._id)]);
                            }
                        }}
                    >
                        <Option value="SUBMITTED">Submitted</Option>
                        <Option value="REJECTED">Rejected</Option>
                        <Option value="ACCEPTED">Accepted</Option>
                    </Select>
                </Form.Item>
            ))}
            <Row gutter={16}>
                <Col offset={10}>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Col>
                <Col>
                    <Button
                        htmlType="reset"
                        onClick={() => {
                            form.resetFields();
                            message.success('Successfuly reset form!');
                            setModified([]);
                        }}
                    >
                        Clear
                    </Button>
                </Col>
            </Row>
        </Form>
    );
}

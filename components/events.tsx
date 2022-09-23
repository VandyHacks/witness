import { ConsoleSqlOutlined } from "@ant-design/icons";
import { Button, Modal, Table } from "antd";
import { useEffect, useState } from "react";
import { EventData } from "../types/database";

interface EventDisplay extends EventData {
	setIsModalOpen: (open: boolean) => void;
}

const columns = [
    {
        title: 'Name',
        dataIndex: 'description',
    },
    {
        title: 'Check-in',
    }
];

const Events = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [events, setEvents] = useState<EventDisplay[]>([]);

    useEffect(() => {
        fetch("/api/events")
            .then((res) => res.json())
            .then((data) => {
                setEvents(data.map((obj: EventDisplay) => {
                    return {
                        key: obj._id,
                        ...obj
                    }
                }));
            });
    }, []);

    return (
        <>
            <Table sticky bordered dataSource={events} columns={columns} />
            {/* <Modal title="Basic Modal" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <p>Some contents...</p>
                <p>Some contents...</p>
                <p>Some contents...</p>
            </Modal> */}
        </>
    );
};

export default Events;
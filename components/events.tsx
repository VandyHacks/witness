import { Table } from "antd";
import { useEffect, useState } from "react";
import { EventData } from "../types/database";

const columns = [{
    title: 'Name',
    dataIndex: 'description',
}];

const Events = () => {
    const [events, setEvents] = useState<EventData[]>([]);
    useEffect(() => {
        fetch("/api/events")
            .then((res) => res.json())
            .then((data) => {
                setEvents(data.map((obj: EventData) => {
                    return {
                        key: obj._id,
                        ...obj     
                    }
                }));
            });
    }, []);
    
    return (
        <Table dataSource={events} columns={columns} />
    );
};

export default Events;
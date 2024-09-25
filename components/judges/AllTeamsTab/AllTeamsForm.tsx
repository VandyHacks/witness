import { FilterConfirmProps, FilterValue, SorterResult } from 'antd/es/table/interface';
import { useContext, useRef, useState } from 'react';
import { TeamData } from '../../../types/database';
import { Button, Input, InputRef, Table } from 'antd';
import { getAccentColor, ThemeContext } from '../../../theme/themeProvider';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import Link from 'next/link';

interface AllTeamsProps {
	teamsData: TeamData[];
	teamId: string;
	handleTeamChange: (teamId: string) => void;
}

export const AllTeamsForm = ({ teamsData, teamId, handleTeamChange }: AllTeamsProps) => {
	const [filteredInfo, setFilteredInfo] = useState<Record<string, FilterValue | null>>({});
	const [sortedInfo, setSortedInfo] = useState<SorterResult<TeamData>>({});
	const [searchedColumn, setSearchedColumn] = useState('');
	const [searchText, setSearchText] = useState('');
	const searchInput = useRef<InputRef>(null);
	const { accentColor, baseTheme } = useContext(ThemeContext);

	const handleChange = (pagination: any, filters: any, sorter: any) => {
		setSortedInfo(sorter as SorterResult<TeamData>);
		setFilteredInfo(filters);
	};

	const handleReset = (clearFilters: () => void) => {
		clearFilters();
		setSearchText('');
	};

	const getColumnSearchProps = (dataIndex: string) => ({
		filterDropdown: ({
			setSelectedKeys,
			selectedKeys,
			confirm,
			clearFilters,
		}: {
			setSelectedKeys: (selectedKeys: React.Key[]) => void;
			selectedKeys: React.Key[];
			confirm: (param?: FilterConfirmProps) => void;
			clearFilters: () => void;
		}) => (
			<div style={{ padding: 8 }}>
				<Input
					ref={searchInput}
					placeholder={`Search ${dataIndex}`}
					value={selectedKeys[0]}
					onChange={e => {
						setSelectedKeys(e.target.value ? [e.target.value] : []);
						confirm({ closeDropdown: false });
						setSearchText(e.target.value);
						setSearchedColumn(dataIndex);
					}}
					onPressEnter={() => confirm({ closeDropdown: true })}
					style={{ marginBottom: 8, display: 'block' }}
				/>
				<Button
					onClick={() => {
						clearFilters && handleReset(clearFilters);
						confirm({ closeDropdown: false });
					}}
					style={{ width: '100%' }}>
					Reset
				</Button>
			</div>
		),
		filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
		onFilter: (value: string | number | boolean, record: any): boolean => {
			const recordValue = dataIndex in record ? record[dataIndex] : record.application?.[dataIndex];
			if (recordValue === undefined || recordValue === null) {
				return false;
			}
			return recordValue.toString().toLowerCase().includes(value.toString().toLowerCase());
		},
		filteredValue:
			(dataIndex in filteredInfo ? filteredInfo[dataIndex] : filteredInfo['application.' + dataIndex]) || null,
		onFilterDropdownOpenChange: (open: boolean) => {
			if (open) {
				setTimeout(() => searchInput.current?.select(), 100);
			}
		},
		render: (text: string) =>
			searchedColumn === dataIndex ? (
				<Highlighter
					highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
					searchWords={[searchText]}
					autoEscape
					textToHighlight={text?.toString() ?? ''}
				/>
			) : (
				text
			),
	});

	const columns = [
		{
			title: 'Table',
			dataIndex: 'locationNum',
			key: 'locationNum',
			width: '20%',
			sorter: (a: any, b: any) => a.locationNum - b.locationNum,
			sortOrder: sortedInfo.columnKey === 'locationNum' ? sortedInfo.order : null,
		},
		{
			title: 'Team',
			dataIndex: 'name',
			key: 'name',
			width: '40%',
			...getColumnSearchProps('name'),
		},
		{
			title: 'Devpost',
			dataIndex: 'devpost',
			key: 'devpost',
			width: '40%',
			render: (link: URL) => {
				return (
					<>
						<Link href={link} passHref>
							<a
								style={{ color: getAccentColor(accentColor, baseTheme), textDecoration: 'underline' }}
								target="_blank">
								{link}
							</a>
						</Link>
					</>
				);
			},
		},
	];

	return (
		<>
			<Table
				dataSource={teamsData}
				columns={columns}
				onChange={handleChange}
				sortDirections={['descend', 'ascend']}
				onRow={record => ({
					onClick: () => handleTeamChange(teamId !== String(record._id) ? String(record._id) : ''),
				})}
			/>
		</>
	);
};

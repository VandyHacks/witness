import useSWR from 'swr';
import { ResponseError, TeamData } from '../../../types/database';
import { Button, Input, InputRef, Table } from 'antd';
import Link from 'next/link';
import { getAccentColor, ThemeContext } from '../../../theme/themeProvider';
import { useContext, useRef, useState } from 'react';
import { FilterConfirmProps, FilterValue, SorterResult } from 'antd/es/table/interface';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';

export const AllTeamsTab = () => {
	// Get data for all teams
	const { data: teamsData, error: teamsError } = useSWR('/api/teams-all', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get list of teams.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as TeamData[];
	});

	const [filteredInfo, setFilteredInfo] = useState<Record<string, FilterValue | null>>({});
	const [sortedInfo, setSortedInfo] = useState<SorterResult<TeamData>>({});
	const [searchedColumn, setSearchedColumn] = useState('');
	const [searchText, setSearchText] = useState('');
	const searchInput = useRef<InputRef>(null);
	const { accentColor, baseTheme } = useContext(ThemeContext);

	const teams = teamsData?.map(x => ({ ...x, key: x._id })) || ([] as TeamData[]);

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
			{teamsError ? (
				<div>{teamsError ? (teamsError as ResponseError).message : 'Failed to get data.'}</div>
			) : (
				<Table
					dataSource={teams}
					columns={columns}
					onChange={handleChange}
					sortDirections={['descend', 'ascend']}
				/>
			)}
		</>
	);
};

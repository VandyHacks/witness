import { Table, Tag, Button, Input, InputRef, Space, TableProps } from 'antd';
import React, { useRef, useState } from 'react';

import { TeamData, ScoreData, UserData } from '../../../types/database';
import { ExportToCsv } from 'export-to-csv';
import { FilterConfirmProps, FilterValue, SorterResult } from 'antd/lib/table/interface';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';

export interface AllScoresProps {
	scoreData: ScoreData[];
	teamData: TeamData[];
	judgeData: UserData[]; // TODO: No need to have all users if you only use the judges anyway
}

export default function AllScores(props: AllScoresProps) {
	const [filteredInfo, setFilteredInfo] = useState<Record<string, FilterValue | null>>({});
	const [sortedInfo, setSortedInfo] = useState<SorterResult<TeamData>>({});
	const [searchedColumn, setSearchedColumn] = useState('');
	const [searchText, setSearchText] = useState('');
	const searchInput = useRef<InputRef>(null);

	let data = props;
	let scoreData = data.scoreData;

	let work = scoreData.map(score => {
		let tempTeam = data.teamData[data.teamData.findIndex(p => p._id == score.team)];
		let tempJudge = data.judgeData[data.judgeData.findIndex(p => p._id == score.judge)];

		let teamName;
		let judgeName;
		if (typeof tempTeam !== 'undefined') {
			teamName = tempTeam.name;
		}
		if (typeof tempJudge !== 'undefined') {
			judgeName = tempJudge.name;
		}

		return {
			...score,
			team: teamName,
			judge: judgeName,
			key: score._id,
			total: score.technicalAbility + score.creativity + score.utility + score.presentation + score.wowFactor,
		};
	});

	const handleChange = (pagination: any, filters: any, sorter: any) => {
		setSortedInfo(sorter as SorterResult<TeamData>);
		setFilteredInfo(filters);
	};

	const clearFilters = () => {
		setFilteredInfo({});
		setSortedInfo({});
		setSearchText('');
	};

	const handleSearch = (
		selectedKeys: string[],
		confirm: (param?: FilterConfirmProps) => void,
		dataIndex: string,
		closeDropDown: boolean
	) => {
		confirm({ closeDropdown: closeDropDown });
		setSearchText(selectedKeys[0]);
		setSearchedColumn(dataIndex);
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
						handleSearch(selectedKeys as string[], confirm, dataIndex, false);
					}}
					onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex, true)}
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

	const newCols = [
		{
			title: 'Team',
			dataIndex: 'team',
			key: 'team',
			...getColumnSearchProps('team'),
		},
		{
			title: 'Judge',
			dataIndex: 'judge',
			key: 'judge',
			...getColumnSearchProps('judge'),
			render: (tag: any) => <Tag>{tag}</Tag>,
		},
		{
			title: 'Total',
			dataIndex: 'total',
			key: 'total',
			sorter: (a: any, b: any) => a.total - b.total,
			sortOrder: sortedInfo.columnKey === 'total' ? sortedInfo.order : null,
		},
		{
			title: 'Technical Ability',
			dataIndex: 'technicalAbility',
			key: 'technicalAbility',
			sorter: (a: any, b: any) => a.technicalAbility - b.technicalAbility,
			sortOrder: sortedInfo.columnKey === 'technicalAbility' ? sortedInfo.order : null,
		},
		{
			title: 'Creativity',
			dataIndex: 'creativity',
			key: 'creativity',
			sorter: (a: any, b: any) => a.creativity - b.creativity,
			sortOrder: sortedInfo.columnKey === 'creativity' ? sortedInfo.order : null,
		},
		{
			title: 'Utility',
			dataIndex: 'utility',
			key: 'utility',
			sorter: (a: any, b: any) => a.utility - b.utility,
			sortOrder: sortedInfo.columnKey === 'utility' ? sortedInfo.order : null,
		},
		{
			title: 'Presentation',
			dataIndex: 'presentation',
			key: 'presentation',
			sorter: (a: any, b: any) => a.presentation - b.presentation,
			sortOrder: sortedInfo.columnKey === 'presentation' ? sortedInfo.order : null,
		},
		{
			title: 'Wow Factor',
			dataIndex: 'wowFactor',
			key: 'wowFactor',
			sorter: (a: any, b: any) => a.wowFactor - b.wowFactor,
			sortOrder: sortedInfo.columnKey === 'wowFactor' ? sortedInfo.order : null,
		},
		{
			title: 'Comments',
			dataIndex: 'comments',
			key: 'comments',
		},
		{
			title: 'Feedback',
			dataIndex: 'feedback',
			key: 'feedback',
		},
	];

	const exportCSV: any = (work: any) => {
		const csvExporter = new ExportToCsv({
			filename: 'judging-data',
			showLabels: true,
			headers: newCols.map((col: any) => col.title),
		});
		csvExporter.generateCsv(work);
	};

	return (
		<>
			<Space
				style={{
					marginBottom: 16,
					width: '100%',
					justifyContent: 'space-between',
				}}>
				<h2>Judges Comments ({work.length ?? 0})</h2>
				<Button type="primary" onClick={clearFilters}>
					Clear filters
				</Button>
			</Space>
			<Table
				dataSource={work}
				columns={newCols}
				onChange={handleChange}
				sortDirections={['descend', 'ascend']}></Table>
			<Button
				onClick={() => {
					exportCSV(work);
				}}>
				Export
			</Button>
		</>
	);
}

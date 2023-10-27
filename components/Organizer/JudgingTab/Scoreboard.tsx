import { Table, Button, Input, InputRef, Space } from 'antd';
import React, { useRef, useState } from 'react';

import { ScoreData, TeamData } from '../../../types/database';
import { ExportToCsv } from 'export-to-csv';
import { FilterConfirmProps, FilterValue, SorterResult } from 'antd/lib/table/interface';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { AllScoresProps } from './allScores';

export default function Scoreboard(props: AllScoresProps) {
	const [filteredInfo, setFilteredInfo] = useState<Record<string, FilterValue | null>>({});
	const [sortedInfo, setSortedInfo] = useState<SorterResult<TeamData>>({});
	const [searchedColumn, setSearchedColumn] = useState('');
	const [searchText, setSearchText] = useState('');
	const searchInput = useRef<InputRef>(null);

	let data = props;
	let { scoreData, teamData } = data;

	// fancy algorithm to compute scoreboard data
	const teamScoreboardData = computeScoreboard(scoreData, teamData);

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
			title: 'Rank',
			dataIndex: 'rank',
			key: 'rank',
			sorter: (a: any, b: any) => a.rank - b.rank,
			sortOrder: sortedInfo.columnKey === 'rank' ? sortedInfo.order : null,
		},
		{
			title: 'Average Score',
			dataIndex: 'score',
			key: 'score',
			sorter: (a: any, b: any) => a.score - b.score,
			sortOrder: sortedInfo.columnKey === 'score' ? sortedInfo.order : null,
		},
		{
			title: 'Normalized Rank',
			dataIndex: 'norm_rank',
			key: 'norm_rank',
			sorter: (a: any, b: any) => a.norm_rank - b.norm_rank,
			sortOrder: sortedInfo.columnKey === 'norm_rank' ? sortedInfo.order : null,
		},
		{
			title: 'Normalized Average Score',
			dataIndex: 'norm_score',
			key: 'norm_score',
			sorter: (a: any, b: any) => a.norm_score - b.norm_score,
			sortOrder: sortedInfo.columnKey === 'norm_score' ? sortedInfo.order : null,
		},
		{
			title: 'Judge Count',
			dataIndex: 'count',
			key: 'count',
			sorter: (a: any, b: any) => a.count - b.count,
			sortOrder: sortedInfo.columnKey === 'count' ? sortedInfo.order : null,
		},
		{
			title: 'Devpost',
			dataIndex: 'devpost',
			key: 'devpost',
			render: (devpost: string) => {
				if (!devpost) return <span>N/A</span>;

				return (
					<a href={devpost} target="_blank" rel="noreferrer">
						{devpost}
					</a>
				);
			},
		},
	];

	const exportCSV: any = (teamScoreboardData: any) => {
		const csvExporter = new ExportToCsv({
			filename: 'judging-data',
			showLabels: true,
			headers: newCols.map((col: any) => col.title),
		});
		csvExporter.generateCsv(teamScoreboardData);
	};

	return (
		<>
			<Space
				style={{
					marginBottom: 16,
					width: '100%',
					justifyContent: 'space-between',
				}}>
				<h2>Scoreboard ({teamScoreboardData.length ?? 0})</h2>
				<Button type="primary" onClick={clearFilters}>
					Clear filters
				</Button>
			</Space>
			<Table
				dataSource={teamScoreboardData}
				columns={newCols}
				onChange={handleChange}
				sortDirections={['descend', 'ascend']}></Table>
			<Button
				onClick={() => {
					exportCSV(teamScoreboardData);
				}}>
				Export
			</Button>
		</>
	);
}

/**
 * Computes the scoreboard data from the score data and team data
 */
const computeScoreboard = (scoreData: ScoreData[], teamData: TeamData[]) => {
	let scoresByJudge: Record<string, number[]> = {};
	let judgeStats: Record<string, { avg: number; stdev: number }> = {};

	scoreData.forEach(score => {
		let judge = score.judge.toString();
		let total = score.technicalAbility + score.creativity + score.utility + score.presentation + score.wowFactor;
		if (judge in scoresByJudge) {
			scoresByJudge[judge].push(total);
		} else {
			scoresByJudge[judge] = [total];
		}
	});

	for (let judge in scoresByJudge) {
		let avg = scoresByJudge[judge].reduce((a, b) => a + b, 0) / scoresByJudge[judge].length;
		let stdev = Math.sqrt(
			scoresByJudge[judge].reduce((a, b) => a + (b - avg) ** 2, 0) / scoresByJudge[judge].length
		);

		judgeStats[judge] = {
			avg: avg,
			stdev: stdev,
		};
	}

	let teamScoreboardData = teamData.map(team => {
		let currScores = scoreData.filter(score => score.team === team._id);
		let count = currScores.length;

		let total = 0;
		let norm_total = 0;
		currScores.forEach(score => {
			const tmpTotal =
				score.technicalAbility + score.creativity + score.utility + score.presentation + score.wowFactor;
			total += tmpTotal;

			norm_total +=
				(tmpTotal - judgeStats[score.judge.toString()].avg) / judgeStats[score.judge.toString()].stdev;
		});

		let avg = count > 0 ? total / count : -1;
		let norm_avg = count > 0 ? norm_total / count : -1;

		return {
			team: team.name,
			key: team._id,
			score: avg,
			norm_score: norm_avg,
			count: count,
			rank: 0,
			norm_rank: 0,
			devpost: team.devpost,
		};
	});

	teamScoreboardData = teamScoreboardData.filter(team => team.count > 0);

	teamScoreboardData.sort((a, b) => b.norm_score - a.norm_score);
	let diff = 0;
	teamScoreboardData.forEach((team, index) => {
		if (index > 0 && team.norm_score === teamScoreboardData[index - 1].norm_score) {
			diff++;
		}
		team.norm_rank = index + 1;
	});

	teamScoreboardData.sort((a, b) => b.score - a.score);
	diff = 0;
	teamScoreboardData.forEach((team, index) => {
		if (index > 0 && team.score === teamScoreboardData[index - 1].score) {
			diff++;
		}
		team.rank = index + 1 - diff;
	});

	return teamScoreboardData;
};

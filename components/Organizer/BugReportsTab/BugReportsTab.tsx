import { Button, Input, InputRef, Skeleton, Space, Table, Tag } from 'antd';
import { RequestType, useCustomSWR } from '../../../utils/request-utils';
import { GitHubIssueStatus, Report } from '../../../types/client';
import { ColumnsType } from 'antd/lib/table';
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { FilterConfirmProps } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';
import { useEffect, useRef, useState } from 'react';
import { FilterValue } from 'antd/lib/table/interface';
import styles from '../../../styles/Report.module.css';
import { Octokit } from 'octokit';

const BugReportsTab = () => {
	const searchInput = useRef<InputRef>(null);
	const [searchText, setSearchText] = useState('');
	const [searchedColumn, setSearchedColumn] = useState('');
	const [filteredInfo, setFilteredInfo] = useState<Record<string, FilterValue | null>>({
		status: [],
	});
	const [githubIssues, setGithubIssues] = useState<GitHubIssueStatus[] | null>(null);
	const [githubIssueLoading, setGithubIssueLoading] = useState<boolean>(false);

	const { data: bugReports, error: bugReportsError } = useCustomSWR<Report[]>({
		url: '/api/report',
		method: RequestType.GET,
		errorMessage: 'Failed to get bug reports.',
	});

	useEffect(() => {
		setGithubIssueLoading(true);
		const fetchGithubIssue = async () => {
			const octokit = new Octokit({
				auth: process.env.GITHUB_TOKEN,
			});

			await octokit
				.request('GET /repos/VandyHacks/witness/issues?state=all', {
					owner: 'VandyHacks',
					repo: 'witness',
					headers: {
						'X-GitHub-Api-Version': '2022-11-28',
					},
				})
				.then(res => {
					// parse through issues and match the issue number and status

					const issues = res.data.map((issue: any) => {
						return {
							issueNumber: issue.number,
							status: issue.state,
						};
					});
					setGithubIssues(issues);
					setGithubIssueLoading(false);
				})
				.catch(err => {
					console.error(err);
					setGithubIssueLoading(false);
				});
		};

		fetchGithubIssue();
	}, []);

	const handleDeleteIssue = async (id: string | undefined) => {
		if (!id) return;

		if (confirm('Are you sure you want to delete this issue?\nThis will NOT delete the issue in GitHub!')) {
			// delete the issue
			const res = await fetch('/api/report', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ id }),
			});
			if (res.status === 200) {
				window.location.reload();
			} else {
				alert('Failed to delete issue!');
			}
		}
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
			(dataIndex in filteredInfo ? filteredInfo[dataIndex] : filteredInfo['report.' + dataIndex]) || null,
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

	const clearFilters = () => {
		setFilteredInfo({});
		setSearchText('');
	};

	const handleChange = (pagination: any, filters: any, sorter: any) => {
		setFilteredInfo(filters);
	};

	const newCols: ColumnsType<Report> = [
		{
			title: 'Name',
			dataIndex: 'name',
			key: 'name',
			width: '10%',
			...getColumnSearchProps('name'),
		},
		{
			title: 'Email',
			dataIndex: 'email',
			key: 'email',
			width: '15%',
			...getColumnSearchProps('email'),
		},
		{
			title: 'Description',
			dataIndex: 'description',
			key: 'description',
			width: '25%',
			...getColumnSearchProps('description'),
		},
		{
			title: 'Date',
			dataIndex: 'date',
			key: 'date',
			render: (date: string) => {
				return <div>{new Date(date).toLocaleString()}</div>;
			},
			width: '10%',
			sorter: (a: Report, b: Report) => {
				const aStart = new Date(a.date.toString());
				const bStart = new Date(b.date.toString());
				return aStart.getTime() - bStart.getTime();
			},
		},
		{
			title: 'Role',
			dataIndex: 'role',
			key: 'role',
			width: '10%',
			filters: [
				{ text: 'Hacker', value: 'HACKER' },
				{ text: 'Judge', value: 'JUDGE' },
			],
			filteredValue: filteredInfo['role'] || null,
			onFilter: (value: string | number | boolean, record: any): boolean => record.role === value,
			render: (role?: string) => {
				return role !== undefined ? (
					<Tag color={role === 'HACKER' ? 'pink' : role === 'JUDGE' ? 'orange' : 'yellow'}>
						{role === 'HACKER' ? 'Hacker' : role === 'JUDGE' ? 'Judge' : 'Organizer'}
					</Tag>
				) : (
					''
				);
			},
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			width: '10%',
			defaultSortOrder: 'ascend',
			filters: [
				{ text: 'Open', value: 'OPEN' },
				{ text: 'Closed', value: 'CLOSED' },
			],
			filteredValue: filteredInfo['status'] || null,
			onFilter: (value: string | number | boolean, record: any): boolean => record.status === value,
			render: (_: string, record: Report) => {
				return (
					<Tag
						color={
							githubIssues?.find((issue: any) => issue.issueNumber === record.ghIssueNumber)?.status ===
							'open'
								? 'red'
								: 'green'
						}>
						{githubIssues?.find((issue: any) => issue.issueNumber === record.ghIssueNumber)?.status ===
						'open'
							? 'Open'
							: 'Closed'}
					</Tag>
				);
			},
		},
		{
			title: 'Issue #',
			dataIndex: 'ghIssueNumber',
			key: 'issueNumber',
			width: '5%',
			render: (issueNumber: number) => {
				return issueNumber;
			},
		},
		{
			// github link
			title: 'GitHub',
			key: 'github',
			width: '10%',
			render: (text: string, record: Report) =>
				record.ghUrl && (
					<a
						href={record.ghUrl}
						target="_blank"
						rel="noreferrer"
						style={{ color: 'inherit', textDecoration: 'none' }}>
						<Button>View on GitHub</Button>
					</a>
				),
		},
		{
			// delete button
			title: 'Actions',
			key: 'action',
			width: '5%',
			render: (text: string, record: Report) => (
				<Button className={styles.deleteButton} onClick={() => handleDeleteIssue(record._id)}>
					<DeleteOutlined />
				</Button>
			),
		},
	];

	if (bugReportsError) return <div>Failed to get bug reports!</div>;

	if (!bugReports || githubIssueLoading) return <Skeleton />;

	const bugReportsForTable = bugReports?.map(x => ({ ...x, key: x._id })) || ([] as Report[]);

	return (
		<div>
			<Space style={{ marginBottom: 16, float: 'right' }}>
				<Button type="primary" onClick={clearFilters}>
					Clear filters
				</Button>
			</Space>
			<Table columns={newCols} dataSource={bugReportsForTable} pagination={false} onChange={handleChange} />
		</div>
	);
};

export default BugReportsTab;

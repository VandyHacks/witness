import { Button, Empty, Skeleton, Space, Tabs } from 'antd';
import useSWR, { useSWRConfig } from 'swr';
import AllScores from '../../components/allScores';
import ManageRoleForm, { ManageFormFields } from '../../components/manageRoleForm';
import PreAddForm from '../../components/preAddForm';
import { ResponseError, ScoreData, TeamData, UserData, PreAddData } from '../../types/database';
import PreAddDisplay from '../../components/preAddDisplay';
import ApplicantsDisplay from '../../components/applicantsDisplay';
import Events from '../../components/events';
import { signOut, useSession } from 'next-auth/react';
import { handleManageFormSubmit, handlePreAddDelete } from '../../utils/organizer-utils';
import ScheduleTab from '../../components/Organizer/JudgingTab/ScheduleTab';
import { RequestType, useCustomSWR } from '../../utils/request-utils';

export default function OrganizerDash() {
	const { mutate } = useSWRConfig();

	// Teams data
	const { data: teamsData, error: teamsError } = useCustomSWR<TeamData>({
		url: '/api/teams',
		method: RequestType.GET,
		errorMessage: 'Failed to get list of teams.',
	});

	// Scores data
	const { data: scoresData, error: scoresError } = useCustomSWR<ScoreData>({
		url: '/api/scores',
		method: RequestType.GET,
		errorMessage: 'Failed to get list of scores.',
	});

	// Judge data
	const { data: judgeData, error: judgeError } = useCustomSWR<UserData>({
		url: '/api/users?usertype=JUDGE',
		method: RequestType.GET,
		errorMessage: 'Failed to get list of judges.',
	});

	// Hacker data
	const { data: hackers, error: hackersError } = useCustomSWR<UserData>({
		url: '/api/users?usertype=HACKER',
		method: RequestType.GET,
		errorMessage: 'Failed to get list of hackers.',
	});

	// Preadd data
	const { data: preAddData, error: preAddError } = useCustomSWR<PreAddData>({
		url: '/api/preadd',
		method: RequestType.GET,
		errorMessage: 'Failed to get list of preadded users.',
	});

	// User data
	const { data: userData, error } = useCustomSWR<ManageFormFields>({
		url: '/api/manage-role',
		method: RequestType.GET,
		errorMessage: 'Failed to get list of all users.',
	});

	// Get session data
	const { data: session, status } = useSession();

	return (
		<>
			<div style={{ display: 'flex' }}>
				<Button size="small" type="default" onClick={() => signOut()}>
					Sign out
				</Button>
				<div style={{ paddingLeft: '10px' }}>Signed in as {session?.user?.email}</div>
			</div>
			<Space direction="vertical">
				<Tabs
					defaultActiveKey="1"
					items={[
						{
							label: `Schedule`,
							key: '1',
							children: <ScheduleTab />,
						},
						{
							label: `Judging`,
							key: '2',
							children: (
								<>
									{!teamsData && <Skeleton />}
									{teamsData && (
										<>
											{/* Add dropdown here w/ functionality */}
											{judgeData && scoresData && (
												<AllScores
													teamData={teamsData}
													scoreData={scoresData}
													userData={judgeData}
												/>
											)}
										</>
									)}
								</>
							),
						},
						{
							label: `Manage Users`,
							key: '3',
							children: (
								<>
									{!userData && <Skeleton />}
									{userData && userData.length == 0 && (
										<Empty
											image={Empty.PRESENTED_IMAGE_SIMPLE}
											description={<span>No users lmao</span>}
										/>
									)}
									{userData && userData.length > 0 && (
										<ManageRoleForm
											formData={userData}
											onSubmit={formData => handleManageFormSubmit(formData, mutate)}
										/>
									)}
								</>
							),
						},
						{
							label: `Pre-Add Users`,
							key: '4',
							children: (
								<>
									{preAddData && preAddData.length == 0 && (
										<Empty
											image={Empty.PRESENTED_IMAGE_SIMPLE}
											description={<span>No preadded users lmao</span>}
										/>
									)}
									{preAddData && preAddData.length > 0 && (
										<PreAddDisplay
											data={preAddData!}
											onDelete={user => handlePreAddDelete(user, mutate)}
										/>
									)}
									<PreAddForm />
								</>
							),
						},
						{
							label: `Manage Applications`,
							key: '5',
							children: <>{hackers && <ApplicantsDisplay hackers={hackers} />}</>,
						},
						{
							label: `Events`,
							key: '6',
							children: <Events />,
						},
					]}
				/>
			</Space>
		</>
	);
}

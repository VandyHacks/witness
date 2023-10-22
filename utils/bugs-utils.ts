/**
 * Get the color of the tag based on the role of the user
 *
 * @param githubIssues The list of issues from github
 * @param record The record of the bug from the table
 * @returns The color of the tag
 */
export const getTagColorFromRole = (githubIssues: any, record: any) => {
	const status = githubIssues?.find((issue: any) => issue.issueNumber === record.ghIssueNumber)?.status;
	switch (status) {
		case 'open':
			return 'red';
		case 'closed':
			return 'green';
		default:
			return 'purple';
	}
};

/**
 * Get the text of the tag based on the role of the user
 *
 * @param githubIssues The list of issues from github
 * @param record The record of the bug from the table
 * @returns The text of the tag
 */
export const getTagTextFromRole = (githubIssues: any, record: any) => {
	const status = githubIssues?.find((issue: any) => issue.issueNumber === record.ghIssueNumber)?.status;
	switch (status) {
		case 'open':
			return 'Open';
		case 'closed':
			return 'Closed';
		default:
			return 'Deleted';
	}
};

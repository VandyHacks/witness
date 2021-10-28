# Witness

Witness is VandyHacks's in-house judging platform. On this platform, hackers can manage their team and submit their project, judges can see a dynamically updating schedule of all their assigned projects and submit feedback for them, and organizers can manage the whole process at a high level and optimally match judges with teams.

-   [Witness](#witness)
    -   [Tooling](#tooling)
    -   [Project-Judge Matching Process](#project-judge-matching-process)
    -   [Usage](#usage)
        -   [Organizers](#organizers)
            -   [Manage Schedule](#manage-schedule)
            -   [Assign Roles](#assign-roles)
            -   [Export Scores](#export-scores)
            -   [Export Teams](#export-teams)
        -   [Judges](#judges)
            -   [View Schedule](#view-schedule)
            -   [Submit Feedback](#submit-feedback)
        -   [Hackers](#hackers)
            -   [See Presentation Time](#see-presentation-time)
            -   [Join Team](#join-team)
    -   [Setup and Deployment](#setup-and-deployment)
    -   [Contributing](#contributing)
    -   [Thanks](#thanks)
        -   [Setup and Deployment](#setup-and-deployment)
        -   [Contributing](#contributing)
        -   [Thanks](#thanks)

## Tooling

-   TypeScript
-   Next.js
-   SWR
-   NextAuth.js
-   Ant Design
-   MongoDB + Mongoose

## Project-Judge Matching Process

During judging, each team presents their project once to a panel of 3 judges in one of our preallocated Zoom rooms. To make sure this process is fair, our automated matching process ensures that as few teams as possible share the same set of judges. However, to decrease the overhead of multiple parties leaving and joining Zooms between judging sessions, the process also minimizes room changes for judges. This way, the judging period can proceed smoothly, avoiding delays while minimizing bias for each project.

## Usage

Witness has distinct view for all parties involved (organizers, judges and hackers) to interface with the platform.

### Organizers

Hackathon organizers can use Witness to manage the judging schedule, assign roles to event participants, and export relevant information to CSV at any point in the judging process.

#### Manage Schedule

![Update Schedule Demo](images/update-schedule.gif?raw=true)

-   The Dashboard page allows organizers to set the initial judging schedule (with [this script](scripts/createJudgeSchedules.py)) and make any necessary modifications by uploading a CSV. In the above example we add a new team to the 10:20 slot in room 3.

#### Assign Roles

![Assign Roles](images/assign-roles.gif?raw=true)

-   In the Assign Roles page, organizers can assign a role of Hacker, Judge or Organizer to any new users who log in (note: Witness is currently designed to connect with [Vaken](https://github.com/vandyhacks/vaken) so that hackers who have applied to the event are automatically marked as hackers).

#### Export Scores

![Export Scores Demo](images/export-scores.gif?raw=true)

-   The Judgment page allows organizers to view all judge feedback and export to CSV.

#### Export Teams

<img src="images/export-teams.png?raw=true" alt="Export Teams Image" width="600"/>

-   Similarly, the Team page allows organizers to keep track of all created hacker teams.

### Judges

Witness allows hackathon judges to see their live-updating schedule and easily submit feedback for their assigned teams.

#### View Schedule

<img src="images/judge-dashboard.gif?raw=true" alt="Judge Dashboard" width="600"/>

-   Judges can see all the information for the team they are currently judging, as well as the team that is up next. They can find the team's feedback page, Devpost link and assigned Zoom room from here. The schedule automatically updates as time passes. Past judging sessions are hidden by default but can be revealed.

#### Submit Feedback

![Judgment Page](images/judging-page.gif?raw=true)

-   Judges can submit and update their feedback for any team that is participating in the hackathon. Teams assigned to the judge are shown above the list of all teams. Once a judge submits feedback for a team, a green checkmark will show next to that team's name in the menu.

### Hackers

Hackers can use Witness to see when they are scheduled to present and also manage their team and project information.

#### See Presentation Time

<img src="images/hacker-dashboard.png?raw=true" alt="Hacker Dashboard" width="600"/>

-   Hackers can see when they are scheduled to present, as well as all the information that judges see about them. They can also access their assigned Zoom room from here.

#### Join Team

<img src="images/join-team.gif?raw=true" alt="Join Team" width="600"/>

-   Hackers can create a team with a name and DevPost link. Once that team is made, Witness generates a join code for that team that can be shared with others. Once in a team, hackers can change their team name, DevPost link or leave.

## Setup and Deployment

This project uses Next.js and Yarn. Run the following to set the project up and run a development server.

```bash
yarn install
yarn dev
```

## Contributing

This is an open source project, and we welcome contributions! See our [Notion page](https://vandyhacks.notion.site/Witness-c1f3395eb60547779f96d5057f56f3d2) for documentation and open issues, and check out our [Contribution guidelines](https://github.com/VandyHacks/witness/blob/main/.github/CONTRIBUTING.md).

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Thanks

Thanks to Vercel for providing us with an open source sponsorship!

[<img src="public/Sponsorship.png">](https://vercel.com?utm_source=vandyhacks-witness&utm_campaign=oss)

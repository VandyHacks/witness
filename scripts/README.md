# CLI Tool README

## Overview

This is a command-line interface (CLI) tool built for managing and interacting with a database. The tool offers a range of actions to simplify common development tasks, providing developers with a convenient way to interact with the database. This README provides an overview of the tool and its functionalities.

## Prerequisites

Before using this CLI tool, make sure you have the following prerequisites installed:

-   Node.js: Ensure that Node.js is installed on your system.
-   TypeScript (ts-node): This tool is written in TypeScript and requires ts-node for execution.
-   Dependencies: Make sure to install the necessary dependencies using npm or yarn. You can do this by running `npm install` or `yarn install` in the project directory.

## Getting Started

To use this CLI tool, follow these steps:

1. Clone the repository to your local machine.
2. Install the dependencies by running:

```bash
npm install
# or
yarn install
```

## Configuration

To set up the environment variables:

1. Create a `.env` file in the project directory.

2. Define the required environment variables within the `.env` file. Specifically, make sure to set the `DATABASE_URL` variable.

    ```plaintext
    DATABASE_URL=your_database_url_here
    # You may need to add other environment variables required by your project
    ```

## Using the CLI Tool

To run the CLI tool, execute the following command in your terminal:

```bash
ts-node scripts/dev-cli.ts
```

## Actions and Usage

### Available Actions

The CLI tool provides a range of actions for interacting with the database:

-   **GET a hacker:** Retrieve information about a hacker, with sub-actions for viewing their events, team details, application, or obtaining the full JSON document of the hacker.

-   **GET a team:** Retrieve information about a team, including sub-actions like viewing their schedule, members, or accessing the complete JSON document of the team.

-   **MODIFY a hacker:** Modify a hacker's information or perform actions such as changing their application status, deleting their application, joining or leaving a team, or checking in.

-   **MODIFY a team:** Update a team's information, which includes changing the team name, managing team members, modifying the team invite code, or updating the devpost link.

-   **CLEAR all collections ⛔️:** Exercise caution when using this action, as it clears all collections in the database, including Users (Hackers), Teams, Scores, Schedule, and Judging Sessions.

-   **POPULATE a collection 🏗️:** Use this action to populate a collection with dummy data, which is particularly useful for testing and development.

-   **Quit:** This action allows you to exit the CLI tool.

### Usage

When you execute the CLI tool, follow these steps:

1. Select a database to perform actions on. Currently, only the "Development Database" is available.

2. Choose an action from the list of available actions to perform.

3. Depending on the selected action, you may be prompted for additional information or sub-actions.

4. The CLI tool will execute the selected action and provide the relevant information or perform the requested task.

### Error Handling

If an error occurs during the execution of an action, the CLI tool will display an error message, and you will be encouraged to address the issue as a developer.

### Important Note

This CLI tool is designed for developers and is intended for use in a development or testing environment. Please exercise caution when using actions that modify or clear collections, as they can have a significant impact on your data.

Feel free to extend the tool with additional actions or features as needed for your project.

Happy coding!

import fetch from "node-fetch";
const { SLACK_LOGGING_WEBHOOK } = process.env;

export default async function log(id: any, data: any) {
    await fetch(SLACK_LOGGING_WEBHOOK as string, {
        method: "POST",
        body: JSON.stringify({
            id,
            data
        })
    });
}
import fetch from "node-fetch";

export default async function log(id: any, data: any) {
    await fetch("https://hooks.slack.com/workflows/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", {
        method: "POST",
        body: JSON.stringify({
            id,
            data
        })
    });
}
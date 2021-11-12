
import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { EOL                                 } from "os";
import { QueueClient, QueueServiceClient     } from "@azure/storage-queue";
import { DefaultAzureCredential              } from "@azure/identity";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const storageAccountName = "<<fill_in>>";
    const url = `https://${storageAccountName}.queue.core.windows.net`;
    const credential = new DefaultAzureCredential();

    const queueServiceClient = new QueueServiceClient(url, credential);

    const queues = queueServiceClient.listQueues();

    let markdown = `|name|approximateMessagesCount|${EOL}`;
    markdown += `|-|-|${EOL}`;
    
    for await (const queue of queues) {
        const queueClient = new QueueClient(`${url}/${queue.name}`, credential);

        const queueProperties = await queueClient.getProperties();

        markdown += `|${queue.name}|${queueProperties.approximateMessagesCount}|${EOL}`;
    }

    context.res = {
        status: 200,
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "max-age=0"
        },
        body: markdown
    };
};

export default httpTrigger;

import { Logger } from "..";

export function useBlockingQueue(
  handler: (item: any) => Promise<void>,
  initialData: any[] = []
) {
  const data = [...initialData];

  const start = async () => {
    /* for (let item of data) {
      await handler(item);
    } */

    while (data.length > 0) {
      // const item = data.shift();

      await handler(data[0]);

      data.shift();
    }
  };

  const push = (item: any) => {
    data.push(item);

    if (data.length == 1) start().catch((err) => Logger.logger.error(err));
  };

  return push;
}

export function useBlockingQueue(
  handler: (item: any) => Promise<void>,
  initialData: any[] = []
) {
  const data = [...initialData];

  const start = async () => {
    /* for (let item of data) {
      await handler(item);
    } */

    // console.log("do start");
    while (data.length > 0) {
      // const item = data.shift();

      await handler(data[0]);

      data.shift();
    }
  };

  const push = (item: any) => {
    data.push(item);

    if (data.length == 1) start().catch((err) => console.log(err));
  };

  return push;
}

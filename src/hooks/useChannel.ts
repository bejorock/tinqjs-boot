import EventEmitter from "events";

export function useChannel<T>(
  initialData: T[] = []
): [() => AsyncGenerator<T, never, unknown>, (item: T) => void] {
  const data = [...initialData];
  const mainEvent = new EventEmitter();

  const queue = async function* () {
    while (true) {
      await new Promise((resolve, reject) => {
        mainEvent.once("push", () => resolve(true));
      });

      // console.log("receive push");
      while (data.length > 0) {
        // console.log("pull data");
        yield data[0];

        data.shift();
      }
    }
  };

  const push = (item: any) => {
    data.push(item);

    mainEvent.emit("push", item);
  };

  return [queue, push];
}

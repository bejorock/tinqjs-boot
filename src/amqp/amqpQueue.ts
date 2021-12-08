import amqplib from "amqplib/callback_api";

export async function amqpQueue(
  channel: amqplib.Channel,
  queue: string,
  exchange: string,
  key: string
): Promise<amqplib.Replies.AssertQueue> {
  const q: amqplib.Replies.AssertQueue = await new Promise(
    (resolve, reject) => {
      channel.assertQueue(
        queue,
        {
          exclusive: false,
        },
        function (error2, q) {
          if (error2) {
            reject(error2);
            return;
          }

          resolve(q);
        }
      );
    }
  );

  await new Promise((resolve, reject) => {
    channel.bindQueue(q.queue, exchange, key, null, (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(true);
    });
  });

  return q;
}

import amqplib from "amqplib/callback_api";

export function amqpExchange(
  channel: amqplib.Channel,
  topic: string,
  options?: amqplib.Options.AssertExchange
): Promise<amqplib.Replies.AssertExchange> {
  return new Promise((resolve, reject) => {
    channel.assertExchange(
      topic,
      "topic",
      { durable: false, ...options },
      (err, exchange) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(exchange);
      }
    );
  });
}

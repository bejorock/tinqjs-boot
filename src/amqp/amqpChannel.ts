import amqplib from "amqplib/callback_api";

export function amqpChannel(
  conn: amqplib.Connection
): Promise<amqplib.Channel> {
  return new Promise((resolve, reject) => {
    conn.createChannel(function (error1, channel) {
      if (error1) {
        reject(error1);
        return;
      }

      resolve(channel);
    });
  });
}

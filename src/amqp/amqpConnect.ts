import amqp from "amqplib/callback_api";

export function amqpConnect(amqpHost: string): Promise<amqp.Connection> {
  return new Promise((resolve, reject) => {
    amqp.connect(amqpHost, function (error0, connection) {
      if (error0) {
        reject(error0);
        return;
      }

      resolve(connection);
    });
  });
}

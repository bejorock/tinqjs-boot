import amqplib from "amqplib/callback_api";
import { amqpChannel } from "./amqp/amqpChannel";
import { amqpConnect } from "./amqp/amqpConnect";
import { amqpEvent } from "./context";

export default async function createAmqpService(host: string) {
  const conn = await amqpConnect(host);
  const channel = await amqpChannel(conn);

  const close = () => {
    console.log("shutdown amqp listeners");

    channel.close((err) => {
      if (err) console.log(err);
    });

    conn.close((err) => {
      if (err) console.log(err);
    });
  };

  amqpEvent.on("publish", (envelope) => {
    // console.log(envelope);
    channel.publish(
      envelope.topic,
      envelope.key,
      Buffer.from(JSON.stringify(envelope)),
      {
        persistent: true,
      }
    );
  });

  return { channel, conn, close };
}

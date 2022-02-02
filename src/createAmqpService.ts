import amqplib from "amqplib/callback_api";
import EventEmitter from "events";
import { Logger } from ".";
import { amqpChannel } from "./amqp/amqpChannel";
import { amqpConnect } from "./amqp/amqpConnect";
import { amqpEvent } from "./context";
import { useChannel } from "./hooks/useChannel";
import { useState } from "./hooks/useState";

function createConnection(
  host: string,
  onReconnect: (conn: amqplib.Connection) => Promise<void>,
  delay: number = 100
) {
  return amqpConnect(host)
    .then((conn) => {
      // reset delay
      delay = 100;
      Logger.logger.info("amqp connection ready!");

      conn.on("close", () => {
        Logger.logger.info("amqp connection to amqp server lost");
        Logger.logger.info("amqp retry connecting...");

        setTimeout(() => createConnection(host, onReconnect, delay), delay);
      });

      return onReconnect(conn).catch((err) => Logger.logger.error(err));
    })
    .catch((err) => {
      Logger.logger.error(err.message);
      Logger.logger.error("amqp fail to connect, retry connecting...");
      setTimeout(() => createConnection(host, onReconnect, delay * 2), delay);
    });
}

export default async function createAmqpService(host: string) {
  // const conn = await amqpConnect(host);
  const [channel, setChannel] = useState({} as amqplib.Channel);
  const [queue, push] = useChannel<amqplib.Channel>();

  createConnection(host, async (conn) => {
    setChannel(await amqpChannel(conn));

    push(channel);
  });

  amqpEvent.on("publish", (envelope) => {
    try {
      channel.publish(
        envelope.topic,
        envelope.key,
        Buffer.from(JSON.stringify(envelope)),
        {
          persistent: true,
        }
      );
    } catch (e) {
      Logger.logger.error(e);
    }
  });

  return queue;
}

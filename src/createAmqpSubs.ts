import amqp from "amqplib/callback_api";
import path from "path";
import { amqpExchange } from "./amqp/amqpExchange";
import { amqpQueue } from "./amqp/amqpQueue";
import { useBlockingQueue } from "./hooks/useBlockingQueue";
import { useChannel } from "./hooks/useChannel";
import { logger } from "./logger";

export default async function createAmqpSubs(
  channel: amqp.Channel,
  descriptors: any,
  topic: string
) {
  const exchange = await amqpExchange(channel, topic);

  const { default: modules, filenames } = descriptors;
  const paramsPattern = new RegExp(/(.*)\[(.+)\](.*)/, "g");

  for (let i = 0; i < modules.length; i++) {
    const module = modules[i];
    const filePath = filenames[i];
    const name = path.basename(filePath);

    const basePath = filePath.substr(1, filePath.length - name.length - 2);
    let key = [...basePath.split("/"), name]
      .filter((v) => v !== "")
      .reverse()
      .join(".");
    let alias = key;

    let params: string[] = [];
    while (paramsPattern.test(key)) {
      params.unshift(key.replace(paramsPattern, "$2"));
      key = key.replace(paramsPattern, "$1*$3");
      alias = alias.replace(paramsPattern, "$1$2$3");
    }

    for (let queueName in module) {
      // queueName = `${queueName.toLowerCase()}.${alias}`;

      const queue = await amqpQueue(
        channel,
        `${queueName.toLowerCase()}.${alias}`,
        exchange.exchange,
        key
      );

      // create queue stream
      /* const push = useBlockingQueue(async (item) => {
        await module[queueName](item);
      }); */
      const [messages, pushMessage] = useChannel();

      (async () => {
        for await (let message of messages()) {
          await module[queueName](message);
        }
      })().catch((err) => logger.error(err));

      channel.consume(
        queue.queue,
        function (msg) {
          logger.info(`Receive message for key ${msg.fields.routingKey}`);

          let routingKeyTokens = msg.fields.routingKey.split(".");
          let keyTokens = key.split(".");

          let counter = 0;
          const paramValues: any = {};
          for (let i = 0; i < keyTokens.length; i++) {
            if (keyTokens[i] === "*") {
              paramValues[params[counter++]] = routingKeyTokens[i];
            }
          }

          let envelope: any = msg.content.toString("utf-8");
          try {
            envelope = JSON.parse(envelope);
          } catch (e) {
            logger.error(`Not a json message`);
          }

          pushMessage({ body: envelope.content, params: paramValues });

          // module[queueName]({ body, params: paramValues });
        },
        {
          noAck: true,
        }
      );

      logger.info(
        `Ready queue ${queueName.toLowerCase()}.${alias} of topic ${topic}`
      );
    }
  }
}

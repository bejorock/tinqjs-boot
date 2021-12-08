import amqp from "amqplib/callback_api";
import path from "path";
import { amqpExchange } from "./amqp/amqpExchange";
import { amqpQueue } from "./amqp/amqpQueue";

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
    let key = [basePath, name]
      .filter((v) => v !== "")
      .reverse()
      .join(".");

    // console.log(routePath, module);
    for (let queueName in module) {
      // console.log(queueName, module[queueName]);
      const queue = await amqpQueue(channel, queueName, exchange.exchange, key);
    }
  }
}

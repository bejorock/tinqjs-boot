import { amqpEvent } from "../context";

export async function amqpPublish(key: string, topic: string, msg: any) {
  const envelope = { key, topic, content: msg };

  amqpEvent.emit("publish", envelope);
}

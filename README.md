# TIN JS BOOT PLUGIN

## IMPORTANT!!! BREAKING CHANGES IS WORK IN PROGRESS

A complementary plugin for [@tinqjs-cli](https://github.com/bejorock/tinqjs-cli) to enable http in a service

## Installation

```sh
npm install @tinqjs/tinjs-boot
```

## Usage

Boot a service

```js
// bootstrap service here
import main, {
  createHttpService,
  createHttpRoutes,
  createAmqpService,
  createAmqpSubs,
  amqpPublish,
} from "@tinqjs/tinqjs-boot";
import express from "express";

// @ts-ignore
import * as routes from "./routes/**/*"; // import express routes
// @ts-ignore
import * as mq from "./mq/**/*"; // import mq routes

function httpRoutes() {
  const HTTP_PREFIX_LEN = "./routes".length;
  const filenames = routes.filenames.map((name) =>
    name.substr(HTTP_PREFIX_LEN, name.length - HTTP_PREFIX_LEN - 3)
  );

  return createHttpRoutes({ ...routes, filenames });
}

async function amqpSubs(channel) {
  const HTTP_PREFIX_LEN = "./mq".length;
  const filenames = mq.filenames.map((name) =>
    name.substr(HTTP_PREFIX_LEN, name.length - HTTP_PREFIX_LEN - 3)
  );

  await createAmqpSubs(channel, { ...mq, filenames }, "topic_example");
}

main(async function (config) {
  const app = express();
  app.use(config.http.basePath, httpRoutes());

  const listen = createHttpService(app);

  listen(3001, () => {
    console.log(`Service greet ready`);
  });

  // create amqp listeners

  const channel = await createAmqpService(
    process.env.AMQP_HOST || "amqp://localhost/?heartbeat=45"
  );

  (async () => {
    for await (const c of channel()) {
      await amqpSubs(c);
    }
  })().catch((err) => console.log(err));

  /* setInterval(() => {
    amqpPublish("data.rana.10.user", "topic_example", "hello world");
  }, 10000); */
});
```

## Examples

Checkout project https://github.com/bejorock/tinqjs-example for samples how to use it.

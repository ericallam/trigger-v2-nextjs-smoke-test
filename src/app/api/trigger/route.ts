import { createAppRoute } from "@trigger.dev/nextjs";
import {
  Job,
  TriggerClient,
  eventTrigger,
  intervalTrigger,
} from "@trigger.dev/sdk";
import { z } from "zod";

const client = new TriggerClient({
  id: "trigger-v2-example",
  url: process.env.VERCEL_URL,
  apiKey: process.env.TRIGGER_API_KEY,
  apiUrl: process.env.TRIGGER_API_URL,
  logLevel: "debug",
});

new Job(client, {
  id: "schedule-1",
  name: "Run something every 10 minutes",
  version: "0.0.1",
  enabled: true,
  trigger: intervalTrigger({
    seconds: 60 * 10,
  }),
  run: async (payload, io, ctx) => {
    await io.wait("wait-1", 60);

    return {
      payload,
    };
  },
});

new Job(client, {
  id: "schedule-1",
  name: "Run something every 10 minutes",
  version: "0.0.1",
  enabled: true,
  trigger: intervalTrigger({
    seconds: 60 * 10,
  }),
  run: async (payload, io, ctx) => {
    await io.runTask("task-1", { name: "task-1" }, async (task) => {
      throw new Error("Task failed");
    });

    await io.wait("wait-1", 60);

    return {
      payload,
    };
  },
});

new Job(client, {
  id: "event-1",
  name: "Run when the foo.bar event happens",
  version: "0.0.1",
  enabled: true,
  trigger: eventTrigger({
    name: "foo.bar",
  }),
  run: async (payload, io, ctx) => {
    await io.runTask("task-1", { name: "task-1" }, async (task) => {
      throw new Error("Task failed");
    });

    return {
      payload,
    };
  },
});

new Job(client, {
  id: "timeout-1",
  name: "Cause a serverless function timeout",
  version: "0.0.1",
  enabled: true,
  trigger: eventTrigger({
    name: "do.timeout",
    schema: z.object({
      iterations: z.number(),
    }),
  }),
  run: async (payload, io, ctx) => {
    for (let i = 0; i < payload.iterations; i++) {
      await io.runTask(`task-${i}`, { name: `task-${i}` }, async (task) => {
        return new Promise<{ task: number }>((resolve) => {
          setTimeout(() => resolve({ task: i }), 1000);
        });
      });
    }

    return {
      payload,
    };
  },
});

new Job(client, {
  id: "event-2",
  name: "Run when the foo.bar.baz event happens",
  version: "0.0.1",
  enabled: true,
  trigger: eventTrigger({
    name: "foo.bar.baz",
  }),
  run: async (payload, io, ctx) => {
    await io.runTask("task-1", { name: "task-1" }, async (task) => {
      return { task };
    });

    return {
      payload,
    };
  },
});

export const { POST, dynamic } = createAppRoute(client, {
  path: "/api/trigger",
});

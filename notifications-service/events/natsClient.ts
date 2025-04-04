import {
  connect,
  NatsConnection,
  StringCodec,
  JetStreamClient,
  JetStreamManager,
  AckPolicy,
} from "nats";

let natsConnection: NatsConnection | null = null;

export const getNatsConnection = async (): Promise<NatsConnection> => {
  if (!natsConnection) {
    natsConnection = await connect({ servers: "nats://nats:4222" });
    console.log("✅ Notifications service is connected to NATS");
  }
  return natsConnection;
};

export const stringCodec = StringCodec();

export const getJetStreamConsumer = async (
  streamName: string,
  subject: string,
  durableConsumerName: string
) => {
  const nc = await getNatsConnection();
  const jsm: JetStreamManager = await nc.jetstreamManager();

  try {
    await jsm.streams.add({
      name: streamName,
      subjects: [subject],
    });
    console.log(`✅ Stream '${streamName}' created`);
  } catch (err: any) {
    if (err.message.includes("already in use")) {
      console.log(`ℹ️ Stream '${streamName}' already exists`);
    } else {
      console.error("❌ Stream creation failed:", err);
    }
  }

  try {
    await jsm.consumers.add(streamName, {
      durable_name: durableConsumerName,
      ack_policy: AckPolicy.Explicit,
      filter_subject: subject,
    });
    console.log(`✅ Consumer '${durableConsumerName}' created`);
  } catch (err: any) {
    if (err.message.includes("consumer already exists")) {
      console.log(`ℹ️ Consumer '${durableConsumerName}' already exists`);
    } else {
      console.error("❌ Consumer creation failed:", err);
    }
  }

  const js = nc.jetstream();
  const consumer = await js.consumers.get(streamName, durableConsumerName);
  return consumer;
};

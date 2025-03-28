import { connect, NatsConnection, StringCodec } from "nats";

let natsConnection: NatsConnection | null = null;

export const getNatsConnection = async (): Promise<NatsConnection> => {
  if (!natsConnection) {
    natsConnection = await connect({ servers: "nats://nats:4222" });
    console.log("✅ Connected to NATS");
  }
  return natsConnection;
};

export const stringCodec = StringCodec();

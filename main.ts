import { serve } from "https://deno.land/std@0.159.0/http/server.ts";
import ElizaBot from "https://esm.sh/elizabot@0.0.3";
import { EventSource } from "https://raw.githubusercontent.com/zaach/EventSource/main/mod.ts";
import { config } from "https://deno.land/std@0.160.0/dotenv/mod.ts";
import {
  ChatContext,
  ChatEvent,
  ChatEventType,
  MessageType,
} from "https://raw.githubusercontent.com/zaach/5edm/main/app/client/mod.ts";

config({ export: true });

// deno-lint-ignore no-explicit-any
(globalThis as any).EventSource = EventSource;

async function handler(req: Request): Promise<Response> {
  if (req.body) {
    const body = await req.json();
    const { invite } = body;
    runChat(invite);
  } else if (req.method.toLowerCase() === "post") {
    return new Response("not ok", { status: 400 });
  }
  return new Response("ok");
}
serve(handler, { port: 8080 });

function runChat(url: string) {
  const { eventTarget, chatContext } = ChatContext.createEncryptedChatContext({
    baseApiUrl: Deno.env.get("BASE_API_URL"),
  });

  const eliza = new ElizaBot();

  chatContext.setUsername("ELIZA🤖");

  ChatEvent.addTypedListener(
    eventTarget,
    ChatEventType.initiated,
    async () => {
      const msg = eliza.getInitial();
      await chatContext.send({ msg });
      // End the chat after 3 minutes
      setTimeout(async () => {
        const msg = eliza.getFinal();
        await chatContext.send({ msg });
        await chatContext.disconnect();
      }, 180_000);
    },
  );
  ChatEvent.addTypedListener(
    eventTarget,
    ChatEventType.idle,
    async () => {
      const msg = eliza.getFinal();
      await chatContext.send({ msg });
      await chatContext.disconnect();
    },
  );
  ChatEvent.addTypedListener(
    eventTarget,
    ChatEventType.message,
    async (e) => {
      switch (e.detail.type) {
        case MessageType.message: {
          let msg;
          if (e.detail.msg === "/ryu") {
            msg = "/ken";
          } else if (e.detail.msg === "/ken") {
            msg = "/ryu";
          } else if (e.detail.msg === "/nyan") {
            msg = "/nyan";
          } else {
            msg = eliza.transform(e.detail.msg);
          }
          if (eliza.quit) {
            // last user input was a quit phrase
            await chatContext.send({ msg });
            await chatContext.disconnect();
          } else {
            await chatContext.send({ msg });
          }
          break;
        }
        default:
      }
    },
  );

  const inviteCode = new URL(url).hash.slice(1);
  if (inviteCode) {
    chatContext.joinWithInvite(inviteCode);
  }
}

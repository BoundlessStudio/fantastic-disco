import ChatClient from "./chat-client";
import { auth0 } from "@/lib/auth0";

const Page = () => (
  <section className="h-full w-full p-2">
    <ChatClient />
  </section>
);

export default auth0.withPageAuthRequired(Page, {
  returnTo: "/chat",
});

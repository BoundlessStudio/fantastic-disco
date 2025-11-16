import ChatClient from "@/app/chat/chat-client";
import { withAuth } from "@/lib/with-auth";

async function Page() {
  return (
    <section className="h-[calc(100%-75px)] w-full p-2 max-w-6xl mx-auto ">
      <ChatClient />
    </section>
  );
}

export default withAuth(Page, { returnTo: "/chat" });

// app/chat/page.tsx
import ChatClient from "./chat-client";
import { withAuth } from "@/lib/with-auth";

async function Page() {
  return (
    <section className="h-full w-full p-2 max-w-7xl mx-auto">
      <ChatClient />
    </section>
  );
}

export default withAuth(Page, { returnTo: "/chat" });

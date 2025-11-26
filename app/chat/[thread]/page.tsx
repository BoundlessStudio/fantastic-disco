import ChatClient from "@/app/chat/chat-client";
import { withAuth } from "@/lib/auth0";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ thread?: string }>;
};

async function Page({ params }: PageProps) {
  const { thread } = await params;

  if (!thread) {
    redirect(`/chat`);
  }

  return (
    <section className="h-[calc(100%-75px)] w-full p-2 max-w-6xl mx-auto">
      <ChatClient thread={thread}  />
    </section>
  );
}

export default withAuth(Page, { returnTo: "/chat" });

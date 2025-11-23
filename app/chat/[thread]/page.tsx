import ChatClient from "@/app/chat/chat-client";
import { withAuth } from "@/lib/with-auth";
import { nanoid } from "nanoid";
import { redirect } from "next/navigation";
import { OpenRouter } from "@openrouter/sdk";

type PageProps = {
  params: Promise<{ thread?: string }>;
};

const openRouter = new OpenRouter();

async function Page({ params }: PageProps) {
  const { thread } = await params;

  // If user hits `/chat` without param, generate a nanoID
  if (!thread) {
    const id = nanoid();
    redirect(`/chat/${id}`);
  }

  const {data} = await openRouter.models.list();

  return (
    <section className="h-[calc(100%-75px)] w-full p-2 max-w-6xl mx-auto">
      <ChatClient thread={thread} models={data} />
    </section>
  );
}

export default withAuth(Page, { returnTo: "/chat" });

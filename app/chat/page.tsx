import { generateThreadId } from "@/lib/threads";
import { redirect } from "next/navigation";

export default function ChatIndex() {
  const id = generateThreadId();
  redirect(`/chat/${id}`);
}

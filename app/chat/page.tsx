import { generateId } from "@/lib/threads";
import { redirect } from "next/navigation";

export default function ChatIndex() {
  const id = generateId();
  redirect(`/chat/${id}`);
}

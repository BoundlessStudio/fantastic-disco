import { nanoid } from "nanoid";
import { redirect } from "next/navigation";

export default function ChatIndex() {
  const id = nanoid();
  redirect(`/chat/${id}`);
}

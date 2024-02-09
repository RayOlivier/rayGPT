export interface TChatMessage {
  _id: string;
  role: "user" | "assistant";
  content: string;
}

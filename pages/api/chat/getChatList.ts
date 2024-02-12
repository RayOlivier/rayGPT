import { getSession } from "@auth0/nextjs-auth0";
import clientPromise from "../../../lib/mongodb";

export default async function handler(req, res) {
  try {
    const { user } = await getSession(req, res);
    const client = await clientPromise;
    const db = client.db("NextChat");

    const chats = await db
      .collection("chats")
      .find({ userId: user.sub }, { projection: { userId: 0, messages: 0 } }) // exclude userId and messages
      .sort({ _id: -1 }) // sorts by most recent chat first
      .toArray();

    res.status(200).json({ chats });
  } catch (error) {
    res.status(500).json({ message: "Error getting chat list." });
  }
}

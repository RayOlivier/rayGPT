import { getSession } from "@auth0/nextjs-auth0";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  try {
    const { user } = await getSession(req, res);
    const client = await clientPromise;
    const db = client.db("NextChat");

    const { chatId, role, content } = req.body;

    let objectId;

    try {
      objectId = new ObjectId(chatId);
    } catch (e) {
      res.status(422).json({ message: "ChatId is not valid." });
      return;
    }

    //validate req content
    if (
      !content ||
      (role === "user" && content.length > 2000) ||
      (role === "assistant" && content.length > 100000)
    ) {
      return res.status(422).json({
        message: "Content is required and must be less than 2000 characters.",
      });
    }

    // validate role
    if (role !== "user" && role !== "assistant") {
      return res.status(422).json({
        message: "Role must be 'user' or 'assistant'.",
      });
    }

    const chat = await db.collection("chats").findOneAndUpdate(
      { _id: objectId, userId: user.sub },
      {
        $push: { messages: { role, content } },
      },
      { returnDocument: "after" }
    );

    res
      .status(200)
      .json({ chat: { ...chat.value, _id: chat.value._id.toString() } });
  } catch (error) {
    res.status(500).json({ message: "Error adding message to chat." });
  }
}

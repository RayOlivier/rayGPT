import { getSession } from "@auth0/nextjs-auth0";
import clientPromise from "../../../lib/mongodb";

export default async function handler(req, res) {
  try {
    const { user } = await getSession(req, res);
    const { message } = req.body;

    //validate message data
    if (!message || message.length > 2000) {
      return res
        .status(422)
        .json({
          message: "Message is required and must be less than 2000 characters.",
        });
    }

    const newUserMessage = {
      role: "user",
      content: message,
    };

    const client = await clientPromise;
    const db = client.db("NextChat");
    const chat = await db.collection("chats").insertOne({
      userId: user.sub,
      messages: [newUserMessage],
      title: message,
    });

    res.status(200).json({
      _id: chat.insertedId.toString(),
      messages: [newUserMessage],
      title: message,
    });
  } catch (err) {
    res.status(500).json({ message: "Error creating new chat." });
    console.log("createNewChat error: ", err);
  }
}

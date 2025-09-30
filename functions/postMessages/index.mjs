import { PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { client } from "../../services/db.mjs";
import { nanoid } from "nanoid";

export const handler = async (event) => {
  try {
    const messages = JSON.parse(event.body);
    const createdAt = new Date();
    const messageId = nanoid(5);

    const command = new PutItemCommand({
      TableName: "messages",
      Item: {
        pk: { S: `MESSAGES#${messageId}` },
        sk: { S: `PROFILE#${messageId}` },
        messages: { S: "MESSAGES" },
        username: { S: messages.username },
        text: { S: messages.text },
        createdAt: { S: createdAt.toISOString() },
      },
    });

    await client.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({
        id: messageId,
        username: messages.username,
        text: messages.text,
        createdAt: createdAt.toISOString(),
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Something went wrong while reading the messages",
        error: error.message || "Unknown error",
      }),
    };
  }
};

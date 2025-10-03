import { client } from "../../services/db.mjs";
import { QueryCommand } from "@aws-sdk/client-dynamodb";

function formatDate(date) {
  const dayPart = date.toLocaleDateString("sv-SE", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  const timePart = date.toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${dayPart}, ${timePart}`;
}

function formatMessage(item) {
  return {
    id: item.pk.S.replace("MESSAGES#", ""),
    username: item.username.S,
    text: item.text.S,
    createdAt: item.createdAt.S,
    createdAtFormatted: formatDate(new Date(item.createdAt.S)),
  };
}

export const handler = async (event) => {
  try {
    const command = new QueryCommand({
      TableName: "messages",
      IndexName: "messageIndex",
      KeyConditionExpression: "messages = :messages AND begins_with(pk, :pk)",
      ExpressionAttributeValues: {
        ":messages": { S: "MESSAGES" },
        ":pk": { S: "MESSAGES#" },
      },
    });

    const result = await client.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        messages: (result.Items || []).map(formatMessage),
      }),
    };
  } catch (error) {
    console.log(error);
    console.error("Lambda error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "Couldn't get your messages",
      }),
    };
  }
};

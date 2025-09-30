import { DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { client } from "../../services/db.mjs";

export const handler = async (event) => {
  try {
    const messageId = event.pathParameters.id;

    if (!messageId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing messageId in path",
        }),
      };
    }

    const command = new DeleteItemCommand({
      TableName: "messages",
      Key: {
        pk: { S: `MESSAGES#${messageId}` },
        sk: { S: `PROFILE#${messageId}` },
      },
      ReturnValues: "ALL_OLD",
    });

    const result = await client.send(command);

    if (!result.Attributes) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: `Message with id ${messageId} not found`,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Message deleted successfully",
        messageId: messageId,
      }),
    };
  } catch (error) {
    console.error("Delete failed:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Something went wrong while deleting the message",
        error: error.message || "Unknown error",
      }),
    };
  }
};

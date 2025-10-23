import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { client } from "../../services/db.mjs";

export const handler = async (event) => {
  try {
    const messageId = event.pathParameters.id;
    const body = JSON.parse(event.body);
    console.log("event.body:", event.body);

    if (!messageId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing messageId in path",
        }),
      };
    }

    const command = new UpdateItemCommand({
      TableName: "messages",
      Key: {
        pk: { S: `MESSAGES#${messageId}` },
        sk: { S: `PROFILE#${messageId}` },
      },
      UpdateExpression: "SET #text = :text",
      ExpressionAttributeNames: {
        "#text": "text",
      },
      ExpressionAttributeValues: {
        ":text": { S: body.text },
      },
      ReturnValues: "ALL_NEW",
    });

    const result = await client.send(command);
    console.log(result);

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
        message: "Message changed successfully",
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

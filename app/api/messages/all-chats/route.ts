import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get all users who have either sent messages to or received messages from the current user
    const usersWithMessages = await db.user.findMany({
      where: {
        OR: [
          {
            // Users who have sent messages to current user
            sentMessages: {
              some: {
                receiverId: currentUser.id,
              },
            },
          },
          {
            // Users who have received messages from current user
            receivedMessages: {
              some: {
                senderId: currentUser.id,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        receivedMessages: {
          where: {
            senderId: currentUser.id,
          },
          orderBy: {
            sentAt: "desc",
          },
          take: 1,
          select: {
            id: true,
            content: true,
            senderId: true,
            receiverId: true,
            sentAt: true,
            isRead: true,
          },
        },
        sentMessages: {
          where: {
            receiverId: currentUser.id,
          },
          orderBy: {
            sentAt: "desc",
          },
          take: 1,
          select: {
            id: true,
            content: true,
            senderId: true,
            receiverId: true,
            sentAt: true,
            isRead: true,
          },
        },
      },
    });

    // Format the response (same formatting as messages/users route)
    const formattedUsers = usersWithMessages.map((user) => {
      const lastSentMessage = user.receivedMessages[0];
      const lastReceivedMessage = user.sentMessages[0];
      const lastMessage =
        lastSentMessage && lastReceivedMessage
          ? new Date(lastSentMessage.sentAt) > new Date(lastReceivedMessage.sentAt)
            ? lastSentMessage
            : lastReceivedMessage
          : lastSentMessage || lastReceivedMessage;

      return {
        id: user.id,
        email: user.email,
        profile: {
          firstName: user.firstName,
          lastName: user.lastName,
        },
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              senderId: lastMessage.senderId,
              receiverId: lastMessage.receiverId,
              sentAt: lastMessage.sentAt,
              read: lastMessage.isRead,
            }
          : null,
      };
    });

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Error in GET /api/messages/all-chats:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

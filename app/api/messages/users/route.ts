import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get all users except the current user
    const allUsers = await db.user.findMany({
      where: {
        NOT: {
          id: currentUser.id,
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        expertise: true,
        researchInterests: true,
        imageURL: true,
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
        followedBy: {
          where: {
            followerId: currentUser.id,
          },
          select: {
            followerId: true,
          },
        },
      },
    });

    // Format the response
    const formattedUsers = allUsers.map((user) => {
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
        imageURL: user.imageURL,
        profile: {
          firstName: user.firstName,
          lastName: user.lastName,
          expertise: user.expertise,
          researchInterests: user.researchInterests,
        },
        isFollowing: user.followedBy.length > 0,
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

    // Sort users: users with messages first, then alphabetically
    const sortedUsers = formattedUsers.sort((a, b) => {
      // First sort by whether there's a message
      if (a.lastMessage && !b.lastMessage) {
        return -1;
      }
      if (!a.lastMessage && b.lastMessage) {
        return 1;
      }

      // If both have messages, sort by message time
      if (a.lastMessage && b.lastMessage) {
        return new Date(b.lastMessage.sentAt).getTime() - new Date(a.lastMessage.sentAt).getTime();
      }

      // If neither have messages, sort alphabetically
      return a.profile.firstName.localeCompare(b.profile.firstName);
    });

    return NextResponse.json(sortedUsers);
  } catch (error) {
    console.error("Error in GET /api/messages/users:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

import { hashPassword } from "@/lib/server/misc";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.chat.deleteMany();
  await prisma.investment.deleteMany();
  await prisma.investmentOpportunity.deleteMany();
  await prisma.fundingOpportunity.deleteMany();
  await prisma.grantApplication.deleteMany();
  await prisma.projectProposalReview.deleteMany();
  await prisma.projectProposal.deleteMany();
  await prisma.academicEventRegistration.deleteMany();
  await prisma.academicEventSession.deleteMany();
  await prisma.academicEvent.deleteMany();
  await prisma.postMessage.deleteMany();
  await prisma.post.deleteMany();
  await prisma.forum.deleteMany();
  await prisma.files.deleteMany();
  await prisma.followersFollowings.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      firstName: "Admin",
      lastName: "User",
      email: "admin@app.com",
      password: await hashPassword("password"),
      role: UserRole.ADMIN,
      researchInterests: "System Administration, Security",
      expertise: "IT Administration",
      phone: "1234567890",
      street: "123 Admin Street",
      apt: "A1",
      city: "San Francisco",
      state: "CA",
      zipcode: "94105",
      dob: new Date("1980-01-01"),
      imageUrl:
        "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fFVzZXIlMjBhdmF0YXJ8ZW58MHx8MHx8fDA%3D",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const organizer = await prisma.user.create({
    data: {
      firstName: "Event",
      lastName: "Organizer",
      email: "organizer@app.com",
      password: await hashPassword("password"),
      role: UserRole.ORGANIZER,
      researchInterests: "Event Management, Community Building",
      expertise: "Event Planning",
      phone: "0987654321",
      street: "456 Event Ave",
      apt: "B2",
      city: "Los Angeles",
      state: "CA",
      zipcode: "90001",
      dob: new Date("1985-02-15"),
      imageUrl:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fFVzZXIlMjBhdmF0YXJ8ZW58MHx8MHx8fDA%3D",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  await prisma.user.create({
    data: {
      firstName: "John",
      lastName: "Investor",
      email: "investor@app.com",
      password: await hashPassword("password"),
      role: UserRole.INVESTOR,
      researchInterests: "Startups, Technology",
      expertise: "Angel Investment",
      phone: "1234509876",
      street: "789 Investor Blvd",
      apt: "PH3",
      city: "New York",
      state: "NY",
      zipcode: "10001",
      dob: new Date("1975-03-20"),
      linkedInUrl: "http://linkedin.com",
      twitterUrl: "http://twitter.com",
      githubUrl: "http://github.com",
      papers: "https://example.com/papers",
      imageUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fFVzZXIlMjBhdmF0YXJ8ZW58MHx8MHx8fDA%3D",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  await prisma.user.create({
    data: {
      firstName: "Regular",
      lastName: "User",
      email: "user@app.com",
      password: await hashPassword("password"),
      role: UserRole.USER,
      researchInterests: "Technology, Innovation",
      expertise: "Software Development",
      phone: "1092837465",
      street: "321 User Lane",
      apt: "C4",
      city: "Seattle",
      state: "WA",
      zipcode: "98101",
      dob: new Date("1990-04-10"),
      linkedInUrl: "http://linkedin.com",
      twitterUrl: "http://twitter.com",
      githubUrl: "http://github.com",
      papers: "https://example.com/papers",
      imageUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8VXNlciUyMGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  await prisma.user.create({
    data: {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah@app.com",
      password: await hashPassword("password"),
      role: UserRole.USER,
      researchInterests: "AI, Machine Learning",
      expertise: "Data Science",
      phone: "5556667777",
      street: "567 Pine Street",
      apt: "D5",
      city: "Boston",
      state: "MA",
      zipcode: "02108",
      dob: new Date("1988-07-15"),
      linkedInUrl: "http://linkedin.com",
      twitterUrl: "http://twitter.com",
      githubUrl: "http://github.com",
      papers: "https://example.com/papers",
      imageUrl:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  await prisma.user.create({
    data: {
      firstName: "Michael",
      lastName: "Chen",
      email: "michael@app.com",
      password: await hashPassword("password"),
      role: UserRole.USER,
      researchInterests: "Blockchain, Cybersecurity",
      expertise: "Network Security",
      phone: "8889990000",
      street: "789 Tech Boulevard",
      apt: "E12",
      city: "Austin",
      state: "TX",
      zipcode: "78701",
      dob: new Date("1992-03-25"),
      linkedInUrl: "http://linkedin.com",
      twitterUrl: "http://twitter.com",
      githubUrl: "http://github.com",
      papers: "https://example.com/papers",
      imageUrl:
        "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Add sample events
  await prisma.academicEvent.create({
    data: {
      title: "Tech Innovation Summit 2024",
      description: "Annual gathering of tech innovators and investors",
      startDate: new Date("2024-11-15T09:00:00Z"),
      endDate: new Date("2024-11-16T17:00:00Z"),
      location: "San Francisco Convention Center",
      isVirtual: false,
      maxAttendees: 500,
      registrationDeadline: new Date("2024-11-10T23:59:59Z"),
      status: "UPCOMING",
      userId: organizer.id,
      sessions: {
        create: [
          {
            title: "Opening Keynote",
            description: "Welcome address and future tech trends",
            startTime: new Date("2024-11-15T09:30:00Z"),
            endTime: new Date("2024-11-15T11:00:00Z"),
            location: "Main Hall",
            maxAttendees: 500,
          },
          {
            title: "Investor Panel",
            description: "Investment opportunities in emerging tech",
            startTime: new Date("2024-11-15T13:00:00Z"),
            endTime: new Date("2024-11-15T14:30:00Z"),
            location: "Conference Room A",
            maxAttendees: 200,
          },
        ],
      },
    },
  });

  await prisma.academicEvent.create({
    data: {
      title: "AI Research Symposium",
      description: "Latest developments in artificial intelligence",
      startDate: new Date("2024-11-20T10:00:00Z"),
      endDate: new Date("2024-11-20T18:00:00Z"),
      location: "Virtual",
      isVirtual: true,
      maxAttendees: 1000,
      registrationDeadline: new Date("2024-11-18T23:59:59Z"),
      status: "UPCOMING",
      userId: organizer.id,
      sessions: {
        create: [
          {
            title: "Machine Learning Workshop",
            description: "Hands-on ML implementation session",
            startTime: new Date("2024-11-20T10:30:00Z"),
            endTime: new Date("2024-11-20T12:30:00Z"),
            location: "Virtual Room 1",
            maxAttendees: 300,
          },
        ],
      },
    },
  });

  await prisma.academicEvent.create({
    data: {
      title: "Startup Pitch Night",
      description: "Evening of startup presentations and networking",
      startDate: new Date("2024-11-05T18:00:00Z"),
      endDate: new Date("2024-11-05T22:00:00Z"),
      location: "Innovation Hub, New York",
      isVirtual: false,
      maxAttendees: 150,
      registrationDeadline: new Date("2024-11-03T23:59:59Z"),
      status: "UPCOMING",
      userId: organizer.id,
      sessions: {
        create: [
          {
            title: "Pitch Session A",
            description: "Early-stage startups presentations",
            startTime: new Date("2024-11-05T18:30:00Z"),
            endTime: new Date("2024-11-05T20:00:00Z"),
            location: "Main Stage",
            maxAttendees: 150,
          },
        ],
      },
    },
  });

  await prisma.academicEvent.create({
    data: {
      title: "Blockchain Technology Forum",
      description: "Deep dive into blockchain innovations and applications",
      startDate: new Date("2024-11-25T09:00:00Z"),
      endDate: new Date("2024-11-26T17:00:00Z"),
      location: "Virtual",
      isVirtual: true,
      maxAttendees: 800,
      registrationDeadline: new Date("2024-11-23T23:59:59Z"),
      status: "UPCOMING",
      userId: organizer.id,
      sessions: {
        create: [
          {
            title: "Web3 Fundamentals",
            description: "Introduction to blockchain and Web3",
            startTime: new Date("2024-11-25T09:30:00Z"),
            endTime: new Date("2024-11-25T11:30:00Z"),
            location: "Virtual Room A",
            maxAttendees: 400,
          },
          {
            title: "DeFi Workshop",
            description: "Practical applications in decentralized finance",
            startTime: new Date("2024-11-25T13:00:00Z"),
            endTime: new Date("2024-11-25T15:00:00Z"),
            location: "Virtual Room B",
            maxAttendees: 300,
          },
        ],
      },
    },
  });

  await prisma.academicEvent.create({
    data: {
      title: "Healthcare Innovation Conference",
      description: "Exploring the future of healthcare technology",
      startDate: new Date("2024-11-28T08:00:00Z"),
      endDate: new Date("2024-11-29T16:00:00Z"),
      location: "Boston Medical Center",
      isVirtual: false,
      maxAttendees: 300,
      registrationDeadline: new Date("2024-11-25T23:59:59Z"),
      status: "UPCOMING",
      userId: organizer.id,
      sessions: {
        create: [
          {
            title: "Digital Health Transformation",
            description: "Impact of technology on healthcare delivery",
            startTime: new Date("2024-11-28T09:00:00Z"),
            endTime: new Date("2024-11-28T11:00:00Z"),
            location: "Auditorium A",
            maxAttendees: 300,
          },
          {
            title: "AI in Medical Diagnosis",
            description: "Machine learning applications in healthcare",
            startTime: new Date("2024-11-28T13:00:00Z"),
            endTime: new Date("2024-11-28T15:00:00Z"),
            location: "Auditorium B",
            maxAttendees: 250,
          },
        ],
      },
    },
  });

  // add sample forums
  await prisma.forum.create({
    data: {
      name: "AI Research Discussion",
      description:
        "A place to discuss artificial intelligence research, methodologies, and breakthroughs",
      createdById: admin.id,
    },
  });

  await prisma.forum.create({
    data: {
      name: "Startup Ecosystem",
      description: "Connect with founders, investors, and discuss startup opportunities",
      createdById: organizer.id,
    },
  });

  await prisma.forum.create({
    data: {
      name: "Blockchain Technology",
      description: "Discussions about blockchain, cryptocurrencies, and decentralized systems",
      createdById: organizer.id,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

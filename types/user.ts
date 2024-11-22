import type { UserRole } from "@prisma/client";

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  researchInterests: string;
  expertise: string;
  phone: string;
  city: string;
  state: string;
  street: string;
  aptNo: string;
  zipcode: string;
  dob: string;
  imageURL: string;
  linkedInURL?: string;
  twitterURL?: string;
  githubURL?: string;
  papers?: string;
};

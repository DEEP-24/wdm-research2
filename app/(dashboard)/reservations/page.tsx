"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon, ClockIcon, MapPinIcon } from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@/types/user";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { UserRole } from "@prisma/client";

interface EventRegistration {
  id: number;
  eventId: number;
  sessionId: number;
  userId: number;
  bookingDate: Date;
  event: Event;
  session: EventSession;
  user: {
    name: string;
    email: string;
  };
}

interface Event {
  id: number;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  isVirtual: boolean;
  maxAttendees: number;
  registrationDeadline: Date;
  status: string;
  sessions: EventSession[];
}

interface EventSession {
  id: number;
  eventId: number;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
  maxAttendees: number;
}

export default function ReservationsPage() {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/user");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        router.push("/login");
      }
    };

    fetchUser();
  }, [router]);

  // Fetch reservations
  useEffect(() => {
    const fetchReservations = async () => {
      if (!user) {
        return;
      }

      try {
        const endpoint =
          user.role === UserRole.ORGANIZER ? "/api/reservations/all" : "/api/reservations";
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error("Failed to fetch reservations");
        }
        const data = await response.json();
        setRegistrations(data);
      } catch (error) {
        console.error("Error fetching reservations:", error);
        toast.error("Failed to fetch reservations");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchReservations();
    }
  }, [user]);

  const handleBackToEvents = () => {
    router.push("/events");
  };

  const handleCancelReservation = async (registrationId: number) => {
    try {
      const response = await fetch("/api/reservations", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ registrationId }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel reservation");
      }

      // Update the local state to remove the cancelled registration
      setRegistrations((prev) => prev.filter((registration) => registration.id !== registrationId));

      toast.success("Reservation cancelled successfully");
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      toast.error("Failed to cancel reservation");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Loading reservations...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 text-center sm:text-left">
          {user?.role === UserRole.ORGANIZER ? "All Reservations" : "My Reservations"}
        </h1>
        <Button onClick={handleBackToEvents}>Back to Events</Button>
      </div>

      {registrations.length > 0 ? (
        <ScrollArea className="h-[calc(100vh-200px)] pr-4">
          {registrations.map((registration) => (
            <Card key={registration.id} className="mb-4 bg-white shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl font-semibold text-blue-700">
                      {registration.event.title} - {registration.session.title}
                    </CardTitle>
                    {user?.role === UserRole.ORGANIZER && (
                      <p className="text-sm text-gray-600 mt-1">
                        Reserved by: {registration.user.name} ({registration.user.email})
                      </p>
                    )}
                  </div>
                  {user?.role !== UserRole.ORGANIZER && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          Cancel Reservation
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Reservation</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel this reservation? This action cannot be
                            undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>No, keep it</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleCancelReservation(registration.id)}
                          >
                            Yes, cancel it
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">{registration.event.description}</p>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {moment(registration.session.startTime).format("MMM D, YYYY")}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="w-4 h-4 mr-2" />
                    {moment(registration.session.startTime).format("HH:mm")} -{" "}
                    {moment(registration.session.endTime).format("HH:mm")}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPinIcon className="w-4 h-4 mr-2" />
                    {registration.session.location}
                  </div>
                  <p className="text-sm font-semibold text-blue-700">
                    Booked on: {moment(registration.bookingDate).format("MMM D, YYYY HH:mm")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </ScrollArea>
      ) : (
        <Card className="bg-white shadow-lg p-6 text-center">
          <p className="text-lg mb-4">
            {user?.role === UserRole.ORGANIZER
              ? "There are no reservations yet."
              : "You haven't made any reservations yet."}
          </p>
          <Link href="/events" className="text-blue-600 hover:underline">
            Browse available events
          </Link>
        </Card>
      )}
    </div>
  );
}

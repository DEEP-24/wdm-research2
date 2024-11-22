"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type EventFormValues, eventSchema } from "@/lib/schema";
import { cn } from "@/lib/utils";
import type { Event, EventRegistration } from "@/types/event";
import type { User } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRole } from "@prisma/client";
import {
  AlertCircle,
  ClockIcon,
  MapPinIcon,
  Pencil,
  PlusIcon,
  TrashIcon,
  UsersIcon,
} from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, type View, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

const localizer = momentLocalizer(moment);

type ViewType = "month" | "week" | "day";

// Add this new component at the top of the file, after the imports
const EditEventButton = ({
  event,
  onEventUpdated,
}: { event: Event; onEventUpdated: (event: Event) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingSessions, setEditingSessions] = useState<{ [key: number]: boolean }>({});
  const [savedSessions, setSavedSessions] = useState<{ [key: number]: boolean }>({});
  const [savedSessionData, setSavedSessionData] = useState<{
    [key: number]: { startTime: Date | null; endTime: Date | null };
  }>({});
  const [sessionTimeErrors, setSessionTimeErrors] = useState<{
    [key: number]: { type: "conflict" | "timeRange"; message: string } | null;
  }>({});

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event.title,
      description: event.description || "",
      startDate: event.startDate
        ? (new Date(event.startDate).toISOString().split("T")[0] as unknown as Date)
        : undefined,
      endDate: event.endDate
        ? (new Date(event.endDate).toISOString().split("T")[0] as unknown as Date)
        : undefined,
      location: event.isVirtual ? "" : event.location || "",
      isVirtual: event.isVirtual,
      maxAttendees: event.maxAttendees || 0,
      registrationDeadline: event.registrationDeadline
        ? (new Date(event.registrationDeadline).toISOString().split("T")[0] as unknown as Date)
        : undefined,
      status: event.status || "Upcoming",
      sessions: event.sessions.map((session) => ({
        title: session.title,
        description: session.description || "",
        startTime: session.startTime as unknown as Date,
        endTime: session.endTime as unknown as Date,
        location: event.isVirtual ? "" : session.location || event.location || "",
        maxAttendees: session.maxAttendees || 0,
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sessions",
  });

  const formatDateForInput = (date: Date | string | null): string => {
    if (!date) {
      return "";
    }
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      if (Number.isNaN(dateObj.getTime())) {
        return "";
      }
      return moment(dateObj).format('YYYY-MM-DDTHH:mm');
    } catch {
      return "";
    }
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const selectedDate = moment(e.target.value).toDate();
    const sessions = watch("sessions");
    const endTime = savedSessionData[index]?.endTime;

    if (endTime && selectedDate >= endTime) {
      setSessionTimeErrors((prev) => ({
        ...prev,
        [index]: {
          type: "timeRange",
          message: "Start time must be before end time",
        },
      }));
      return;
    }

    // Check for conflicts
    for (let i = 0; i < sessions.length; i++) {
      if (i === index) {
        continue;
      }

      const otherStartTime = savedSessionData[i]?.startTime;
      const otherEndTime = savedSessionData[i]?.endTime;

      if (!otherStartTime || !otherEndTime) {
        continue;
      }

      if (selectedDate >= otherStartTime && selectedDate < otherEndTime) {
        setSessionTimeErrors((prev) => ({
          ...prev,
          [index]: {
            type: "conflict",
            message: `Conflicts with Session ${i + 1}`,
          },
        }));
        return;
      }
    }

    setSessionTimeErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });

    setSavedSessionData((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        startTime: selectedDate,
      },
    }));

    setValue(`sessions.${index}.startTime`, selectedDate as unknown as Date);
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const selectedDate = moment(e.target.value).toDate();
    const startTime = savedSessionData[index]?.startTime;

    if (startTime && selectedDate <= startTime) {
      setSessionTimeErrors((prev) => ({
        ...prev,
        [index]: {
          type: "timeRange",
          message: "End time must be after start time",
        },
      }));
      return;
    }

    // Check for conflicts
    const sessions = watch("sessions");
    for (let i = 0; i < sessions.length; i++) {
      if (i === index) {
        continue;
      }

      const otherStartTime = savedSessionData[i]?.startTime;
      const otherEndTime = savedSessionData[i]?.endTime;

      if (!otherStartTime || !otherEndTime) {
        continue;
      }

      if (
        startTime &&
        ((startTime < otherEndTime && selectedDate > otherStartTime) ||
          (startTime >= otherStartTime && startTime < otherEndTime) ||
          (selectedDate > otherStartTime && selectedDate <= otherEndTime) ||
          (startTime <= otherStartTime && selectedDate >= otherEndTime))
      ) {
        setSessionTimeErrors((prev) => ({
          ...prev,
          [index]: {
            type: "conflict",
            message: `Conflicts with Session ${i + 1}`,
          },
        }));
        return;
      }
    }

    setSessionTimeErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });

    setSavedSessionData((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        endTime: selectedDate,
      },
    }));

    setValue(`sessions.${index}.endTime`, selectedDate as unknown as Date);
  };

  const handleSaveSession = (index: number) => {
    const sessionData = watch(`sessions.${index}`);

    if (
      sessionData.title &&
      sessionData.description &&
      savedSessionData[index]?.startTime &&
      savedSessionData[index]?.endTime &&
      sessionData.maxAttendees > 0
    ) {
      if (sessionTimeErrors[index]) {
        toast.error(sessionTimeErrors[index]?.message || "Please fix time validation errors");
        return;
      }

      setSavedSessions((prev) => ({
        ...prev,
        [index]: true,
      }));

      setEditingSessions((prev) => ({
        ...prev,
        [index]: false,
      }));

      toast.success(`Session ${index + 1} saved`);
    } else {
      toast.error("Please fill all required fields");
    }
  };

  const handleEditSession = (index: number) => {
    setEditingSessions((prev) => ({
      ...prev,
      [index]: true,
    }));
    setSavedSessions((prev) => ({
      ...prev,
      [index]: false,
    }));
  };

  const handleEditSubmit = async (data: EventFormValues) => {
    try {
      const formattedData = {
        id: event.id,
        title: data.title,
        description: data.description,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        location: data.isVirtual ? null : data.location,
        isVirtual: data.isVirtual,
        maxAttendees: Number(data.maxAttendees),
        registrationDeadline: new Date(data.registrationDeadline).toISOString(),
        status: data.status,
        sessions: fields.map((_, index) => ({
          id: event.sessions[index]?.id,
          title: data.sessions[index].title,
          description: data.sessions[index].description,
          startTime: savedSessionData[index]?.startTime 
            ? moment(savedSessionData[index].startTime).utc().toISOString()
            : null,
          endTime: savedSessionData[index]?.endTime 
            ? moment(savedSessionData[index].endTime).utc().toISOString()
            : null,
          location: data.isVirtual ? null : data.location,
          maxAttendees: Number(data.sessions[index].maxAttendees),
        })),
      };

      const response = await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update event");
      }

      const updatedEvent = await response.json();
      onEventUpdated(updatedEvent);
      setIsOpen(false);
      toast.success("Event updated successfully");
    } catch (error) {
      console.error("Failed to update event:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update event");
    }
  };

  useEffect(() => {
    if (isOpen && event.sessions.length > 0) {
      const initialSessionData: {
        [key: number]: { startTime: Date | null; endTime: Date | null };
      } = {};

      event.sessions.forEach((session, index) => {
        const startTime = session.startTime 
          ? moment.utc(session.startTime).local().toDate()
          : null;
        const endTime = session.endTime 
          ? moment.utc(session.endTime).local().toDate()
          : null;

        initialSessionData[index] = {
          startTime,
          endTime,
        };

        if (startTime) {
          setValue(`sessions.${index}.startTime`, startTime as unknown as Date);
        }
        if (endTime) {
          setValue(`sessions.${index}.endTime`, endTime as unknown as Date);
        }
      });

      setSavedSessionData(initialSessionData);

      const initialSavedState: { [key: number]: boolean } = {};
      event.sessions.forEach((_, index) => {
        initialSavedState[index] = true;
      });
      setSavedSessions(initialSavedState);
    }
  }, [isOpen, event.sessions, setValue]);

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline" size="sm">
        <Pencil className="w-4 h-4 mr-2" /> Edit Event
      </Button>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            reset();
            setSavedSessionData({});
            setSavedSessions({});
            setEditingSessions({});
            setSessionTimeErrors({});
          }
          setIsOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[700px] bg-white max-h-[80vh] overflow-y-auto">
          <DialogHeader className="bg-white pb-4 border-b">
            <DialogTitle className="text-2xl font-bold text-blue-700">Edit Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleEditSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-blue-600">
                    Event Title
                  </Label>
                  <Input
                    id="title"
                    {...register("title")}
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-blue-600">
                    Description
                  </Label>
                  <Input
                    id="description"
                    {...register("description")}
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>
                <div>
                  <Label htmlFor="startDate" className="text-blue-600">
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    {...register("startDate")}
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-blue-600">
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    {...register("endDate")}
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="location" className="text-blue-600">
                    Location
                  </Label>
                  <Input
                    id="location"
                    {...register("location")}
                    className="border-blue-200 focus:border-blue-400"
                    disabled={watch("isVirtual")}
                    placeholder={watch("isVirtual") ? "Virtual Event" : "Enter location"}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isVirtual"
                    checked={watch("isVirtual")}
                    onCheckedChange={(checked) => {
                      setValue("isVirtual", checked as boolean);
                      if (checked) {
                        setValue("location", "");
                        fields.forEach((_, index) => {
                          setValue(`sessions.${index}.location`, "");
                        });
                      }
                    }}
                    className="border-blue-400 text-blue-600"
                  />
                  <Label htmlFor="isVirtual" className="text-blue-600">
                    Virtual Event
                  </Label>
                </div>
                <div>
                  <Label htmlFor="maxAttendees" className="text-blue-600">
                    Max Attendees
                  </Label>
                  <Input
                    id="maxAttendees"
                    type="number"
                    {...register("maxAttendees", { valueAsNumber: true })}
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>
                <div>
                  <Label htmlFor="registrationDeadline" className="text-blue-600">
                    Registration Deadline
                  </Label>
                  <Input
                    id="registrationDeadline"
                    type="date"
                    {...register("registrationDeadline")}
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-blue-200 pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-2 text-blue-700">Event Sessions</h3>
              <Accordion type="single" collapsible className="w-full">
                {fields.map((field, index) => (
                  <AccordionItem
                    value={`session-${index}`}
                    key={field.id}
                    className="border-blue-200"
                  >
                    <AccordionTrigger className="text-blue-600 hover:text-blue-800">
                      Session {index + 1}
                    </AccordionTrigger>
                    <AccordionContent className="bg-blue-50 p-4 rounded-lg">
                      {sessionTimeErrors[index] && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          <AlertTitle>
                            {sessionTimeErrors[index]?.type === "conflict"
                              ? "Session Conflict"
                              : "Time Range Error"}
                          </AlertTitle>
                          <AlertDescription>{sessionTimeErrors[index]?.message}</AlertDescription>
                        </Alert>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`sessions.${index}.title`} className="text-blue-600">
                            Session Title
                          </Label>
                          <Input
                            id={`sessions.${index}.title`}
                            {...register(`sessions.${index}.title`)}
                            className="border-blue-200 focus:border-blue-400"
                            disabled={savedSessions[index] && !editingSessions[index]}
                          />
                          {errors.sessions?.[index]?.title && (
                            <span className="text-red-500 text-sm">
                              {errors.sessions[index]?.title?.message}
                            </span>
                          )}
                        </div>
                        <div>
                          <Label
                            htmlFor={`sessions.${index}.description`}
                            className="text-blue-600"
                          >
                            Session Description
                          </Label>
                          <Input
                            id={`sessions.${index}.description`}
                            {...register(`sessions.${index}.description`)}
                            className="border-blue-200 focus:border-blue-400"
                            disabled={savedSessions[index] && !editingSessions[index]}
                          />
                          {errors.sessions?.[index]?.description && (
                            <span className="text-red-500 text-sm">
                              {errors.sessions[index]?.description?.message}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <Label htmlFor={`sessions.${index}.startTime`} className="text-blue-600">
                            Start Time
                          </Label>
                          <Input
                            type="datetime-local"
                            value={formatDateForInput(savedSessionData[index]?.startTime)}
                            onChange={(e) => handleStartTimeChange(e, index)}
                            min={watch("startDate") 
                              ? `${new Date(watch("startDate")).toISOString().split("T")[0]}T00:00`
                              : undefined}
                            max={watch("endDate")
                              ? `${new Date(watch("endDate")).toISOString().split("T")[0]}T23:59`
                              : undefined}
                            className="border-blue-200 focus:border-blue-400"
                            disabled={savedSessions[index] && !editingSessions[index]}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`sessions.${index}.endTime`} className="text-blue-600">
                            End Time
                          </Label>
                          <Input
                            type="datetime-local"
                            value={formatDateForInput(savedSessionData[index]?.endTime)}
                            onChange={(e) => handleEndTimeChange(e, index)}
                            min={watch("startDate")
                              ? `${new Date(watch("startDate")).toISOString().split("T")[0]}T00:00`
                              : undefined}
                            max={watch("endDate")
                              ? `${new Date(watch("endDate")).toISOString().split("T")[0]}T23:59`
                              : undefined}
                            className="border-blue-200 focus:border-blue-400"
                            disabled={savedSessions[index] && !editingSessions[index]}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <Label htmlFor={`sessions.${index}.location`} className="text-blue-600">
                            Session Location
                          </Label>
                          <Input
                            id={`sessions.${index}.location`}
                            {...register(`sessions.${index}.location`)}
                            className="border-blue-200 focus:border-blue-400"
                            disabled={
                              (watch("isVirtual") || savedSessions[index]) &&
                              !editingSessions[index]
                            }
                            placeholder={
                              watch("isVirtual") ? "Virtual Session" : "Enter session location"
                            }
                          />
                          {errors.sessions?.[index]?.location && (
                            <span className="text-red-500 text-sm">
                              {errors.sessions[index]?.location?.message}
                            </span>
                          )}
                        </div>
                        <div>
                          <Label
                            htmlFor={`sessions.${index}.maxAttendees`}
                            className="text-blue-600"
                          >
                            Max Attendees
                          </Label>
                          <Input
                            id={`sessions.${index}.maxAttendees`}
                            {...register(`sessions.${index}.maxAttendees`, {
                              valueAsNumber: true,
                            })}
                            type="number"
                            className="border-blue-200 focus:border-blue-400"
                            disabled={savedSessions[index] && !editingSessions[index]}
                          />
                          {errors.sessions?.[index]?.maxAttendees && (
                            <span className="text-red-500 text-sm">
                              {errors.sessions[index]?.maxAttendees?.message}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between mt-4">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            <TrashIcon className="w-4 h-4 mr-2" /> Remove Session
                          </Button>
                          {!editingSessions[index] && savedSessions[index] && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditSession(index)}
                              className="border-blue-500 text-blue-500 hover:bg-blue-50"
                            >
                              <Pencil className="w-4 h-4 mr-2" /> Edit Session
                            </Button>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleSaveSession(index)}
                          disabled={
                            (!editingSessions[index] && savedSessions[index]) ||
                            !watch(`sessions.${index}.title`) ||
                            !watch(`sessions.${index}.description`) ||
                            !watch(`sessions.${index}.startTime`) ||
                            !watch(`sessions.${index}.endTime`) ||
                            !watch(`sessions.${index}.maxAttendees`) ||
                            Number(watch(`sessions.${index}.maxAttendees`)) <= 0 ||
                            !!sessionTimeErrors[index]
                          }
                          className={cn(
                            "border-blue-600 text-blue-600 hover:bg-blue-50",
                            savedSessions[index] &&
                              !editingSessions[index] &&
                              "bg-green-50 border-green-500 text-green-500",
                          )}
                        >
                          {savedSessions[index] && !editingSessions[index]
                            ? "Session Saved"
                            : "Save Session"}
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <Button
                type="button"
                onClick={() =>
                  append({
                    title: "",
                    description: "",
                    startTime: null as unknown as Date,
                    endTime: null as unknown as Date,
                    location: watch("location") || "",
                    maxAttendees: 0,
                  })
                }
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <PlusIcon className="w-4 h-4 mr-2" /> Add Another Session
              </Button>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Update Event
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    // setError,
    // clearErrors,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: null as unknown as Date,
      endDate: null as unknown as Date,
      location: "",
      isVirtual: false,
      maxAttendees: 0,
      registrationDeadline: null as unknown as Date,
      status: "Upcoming",
      sessions: [
        {
          title: "",
          description: "",
          startTime: null as unknown as Date,
          endTime: null as unknown as Date,
          location: "",
          maxAttendees: 0,
        },
      ],
    },
    mode: "onChange",
    context: { parseDate: true },
  });

  const eventLocation = watch("location");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sessions",
  });

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "location" && !value.isVirtual) {
        fields.forEach((_, index) => {
          setValue(`sessions.${index}.location`, value.location || "");
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue, fields]);

  const [savedSessions, setSavedSessions] = useState<{ [key: number]: boolean }>({});
  const [savedSessionData, setSavedSessionData] = useState<{
    [key: number]: { startTime: Date | null; endTime: Date | null };
  }>({});
  const [sessionTimeErrors, setSessionTimeErrors] = useState<{
    [key: number]: { type: "conflict" | "timeRange"; message: string } | null;
  }>({});
  const [editingSessions, setEditingSessions] = useState<{ [key: number]: boolean }>({});

  const formatDateForInput = (date: Date | string | null): string => {
    if (!date) {
      return "";
    }
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      if (Number.isNaN(dateObj.getTime())) {
        return "";
      }
      return moment(dateObj).format('YYYY-MM-DDTHH:mm');
    } catch {
      return "";
    }
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const selectedDate = new Date(e.target.value);
    const sessions = watch("sessions");
    const endTime = savedSessionData[index]?.endTime;

    if (endTime && selectedDate >= endTime) {
      setSessionTimeErrors((prev) => ({
        ...prev,
        [index]: {
          type: "timeRange",
          message: "Start time must be before end time",
        },
      }));
      return;
    }

    // Check for conflicts
    for (let i = 0; i < sessions.length; i++) {
      if (i === index) {
        continue;
      }

      const otherStartTime = savedSessionData[i]?.startTime;
      const otherEndTime = savedSessionData[i]?.endTime;

      if (!otherStartTime || !otherEndTime) {
        continue;
      }

      if (selectedDate >= otherStartTime && selectedDate < otherEndTime) {
        setSessionTimeErrors((prev) => ({
          ...prev,
          [index]: {
            type: "conflict",
            message: `Conflicts with Session ${i + 1}`,
          },
        }));
        return;
      }
    }

    setSessionTimeErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });

    setSavedSessionData((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        startTime: selectedDate,
      },
    }));

    setValue(`sessions.${index}.startTime`, selectedDate as unknown as Date);
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const selectedDate = new Date(e.target.value);
    const startTime = savedSessionData[index]?.startTime;

    if (startTime && selectedDate <= startTime) {
      setSessionTimeErrors((prev) => ({
        ...prev,
        [index]: {
          type: "timeRange",
          message: "End time must be after start time",
        },
      }));
      return;
    }

    // Check for conflicts
    const sessions = watch("sessions");
    for (let i = 0; i < sessions.length; i++) {
      if (i === index) {
        continue;
      }

      const otherStartTime = savedSessionData[i]?.startTime;
      const otherEndTime = savedSessionData[i]?.endTime;

      if (!otherStartTime || !otherEndTime) {
        continue;
      }

      if (
        startTime &&
        ((startTime < otherEndTime && selectedDate > otherStartTime) ||
          (startTime >= otherStartTime && startTime < otherEndTime) ||
          (selectedDate > otherStartTime && selectedDate <= otherEndTime) ||
          (startTime <= otherStartTime && selectedDate >= otherEndTime))
      ) {
        setSessionTimeErrors((prev) => ({
          ...prev,
          [index]: {
            type: "conflict",
            message: `Conflicts with Session ${i + 1}`,
          },
        }));
        return;
      }
    }

    setSessionTimeErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });

    setSavedSessionData((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        endTime: selectedDate,
      },
    }));

    setValue(`sessions.${index}.endTime`, selectedDate as unknown as Date);
  };

  const handleSaveSession = (index: number) => {
    const sessionData = watch(`sessions.${index}`);

    if (
      sessionData.title &&
      sessionData.description &&
      savedSessionData[index]?.startTime &&
      savedSessionData[index]?.endTime &&
      sessionData.maxAttendees > 0
    ) {
      if (sessionTimeErrors[index]) {
        toast.error(sessionTimeErrors[index]?.message || "Please fix time validation errors");
        return;
      }

      setSavedSessions((prev) => ({
        ...prev,
        [index]: true,
      }));

      setEditingSessions((prev) => ({
        ...prev,
        [index]: false,
      }));

      toast.success(`Session ${index + 1} saved`);
    } else {
      toast.error("Please fill all required fields");
    }
  };

  const handleEditSession = (index: number) => {
    setEditingSessions((prev) => ({
      ...prev,
      [index]: true,
    }));
    setSavedSessions((prev) => ({
      ...prev,
      [index]: false,
    }));
  };

  const addSession = () => {
    append({
      title: "",
      description: "",
      startTime: null as unknown as Date,
      endTime: null as unknown as Date,
      location: eventLocation || "",
      maxAttendees: 0,
    });

    const newIndex = fields.length;
    setSavedSessions((prev) => ({
      ...prev,
      [newIndex]: false,
    }));

    setSavedSessionData((prev) => ({
      ...prev,
      [newIndex]: {
        startTime: null,
        endTime: null,
      },
    }));
  };

  const [view, setView] = useState<ViewType>("month");
  const [date, setDate] = useState(new Date());
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, []);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
        toast.error("Failed to fetch events");
      }
    };

    fetchEvents();
  }, []);

  // Fetch registrations for current user
  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!user) {
        return;
      }

      try {
        const response = await fetch(`/api/reservations`);
        if (!response.ok) {
          throw new Error("Failed to fetch registrations");
        }
        const data = await response.json();
        console.log('Fetched registrations:', data);
        setRegistrations(data);
      } catch (error) {
        console.error("Failed to fetch registrations:", error);
      }
    };

    if (user) {
      fetchRegistrations();
    }
  }, [user]);

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
  };

  const onSubmit = async (data: EventFormValues) => {
    try {
      // Check if all sessions are saved
      const allSessionsSaved = fields.every((_, index) => savedSessions[index]);
      if (!allSessionsSaved) {
        toast.error("Please save all sessions before creating the event");
        return;
      }

      // Check for any session time errors
      const hasTimeErrors = Object.values(sessionTimeErrors).some((error) => error !== null);
      if (hasTimeErrors) {
        toast.error("Please fix all session time conflicts before creating the event");
        return;
      }

      // Format the data
      const formattedData = {
        title: data.title,
        description: data.description,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(new Date(data.endDate).setHours(23, 59, 59, 999)).toISOString(),
        location: data.isVirtual ? null : data.location,
        isVirtual: data.isVirtual,
        maxAttendees: Number(data.maxAttendees),
        registrationDeadline: new Date(data.registrationDeadline).toISOString(),
        status: data.status,
        sessions: fields.map((_, index) => {
          const sessionStartTime = savedSessionData[index]?.startTime;
          const sessionEndTime = savedSessionData[index]?.endTime;

          return {
            title: data.sessions[index].title,
            description: data.sessions[index].description,
            startTime: sessionStartTime ? new Date(sessionStartTime).toISOString() : null,
            endTime: sessionEndTime ? new Date(sessionEndTime).toISOString() : null,
            location: data.isVirtual ? null : data.location,
            maxAttendees: Number(data.sessions[index].maxAttendees),
          };
        }),
      };

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create event");
      }

      const createdEvent = await response.json();
      setEvents((prev) => [...prev, createdEvent]);
      setIsCreateEventOpen(false);
      toast.success("Event created successfully");

      // Reset form and states
      reset();
      setSavedSessions({});
      setSavedSessionData({});
    } catch (error) {
      console.error("Failed to create event:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create event");
    }
  };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const handleViewChange = (newView: ViewType) => {
    setView(newView);
  };

  const handleRegister = async (eventId: string, sessionId: string) => {
    try {
      const response = await fetch("/api/events/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId, sessionId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to register for event");
      }

      const registration = await response.json();
      setRegistrations([...registrations, registration]);
      toast.success("Successfully registered for the session");
      router.push("/reservations");
    } catch (error) {
      console.error("Failed to register:", error);
      toast.error(error instanceof Error ? error.message : "Failed to register for session");
    }
  };

  const isSessionRegistered = (eventId: number | string, sessionId: number | string) => {
    return registrations.some(
      (reg) => {
        return reg.eventId === (eventId) && reg.sessionId === (sessionId);
      }
    );
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      setEvents(events.filter((event) => event.id !== eventId));
      toast.success("Event deleted successfully");
      setSelectedEvent(null);
    } catch (error) {
      console.error("Failed to delete event:", error);
      toast.error("Failed to delete event");
    }
  };

  const handleDeleteSession = async (eventId: string, sessionId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete session");
      }

      const updatedEvents = events.map((event) => {
        if (event.id === eventId) {
          return {
            ...event,
            sessions: event.sessions.filter((session) => session.id !== sessionId),
          };
        }
        return event;
      });

      setEvents(updatedEvents);
      toast.success("Session deleted successfully");
      setSelectedEvent(updatedEvents.find((event) => event.id === eventId) || null);
    } catch (error) {
      console.error("Failed to delete session:", error);
      toast.error("Failed to delete session");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700">Events</h1>
        <div className="w-full sm:w-auto">
          {user?.role === UserRole.ORGANIZER && (
            <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">Create New Event</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] bg-white max-h-[80vh] overflow-y-auto">
                <DialogHeader className="bg-white pb-4 border-b">
                  <DialogTitle className="text-2xl font-bold text-blue-700">
                    Create New Event
                  </DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handleSubmit((data) => {
                    onSubmit(data);
                  })}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title" className="text-blue-600">
                          Event Title
                        </Label>
                        <Input
                          id="title"
                          {...register("title")}
                          className="border-blue-200 focus:border-blue-400"
                        />
                        {errors.title && (
                          <span className="text-red-500 text-sm">{errors.title.message}</span>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="description" className="text-blue-600">
                          Description
                        </Label>
                        <Input
                          id="description"
                          {...register("description")}
                          className="border-blue-200 focus:border-blue-400"
                        />
                        {errors.description && (
                          <span className="text-red-500 text-sm">{errors.description.message}</span>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="startDate" className="text-blue-600">
                          Start Date
                        </Label>
                        <Input
                          id="startDate"
                          type="date"
                          {...register("startDate")}
                          min={new Date().toISOString().split("T")[0]}
                          className={cn(
                            "border-blue-200 focus:border-blue-400",
                            errors.startDate && "border-red-500",
                          )}
                        />
                        {errors.startDate && (
                          <span className="text-red-500 text-sm">{errors.startDate.message}</span>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="endDate" className="text-blue-600">
                          End Date
                        </Label>
                        <Input
                          id="endDate"
                          type="date"
                          {...register("endDate")}
                          min={
                            watch("startDate")?.toString() || new Date().toISOString().split("T")[0]
                          }
                          className={cn(
                            "border-blue-200 focus:border-blue-400",
                            errors.endDate && "border-red-500",
                          )}
                        />
                        {errors.endDate && (
                          <span className="text-red-500 text-sm">{errors.endDate.message}</span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="location" className="text-blue-600">
                          Location
                        </Label>
                        <Input
                          id="location"
                          {...register("location")}
                          className="border-blue-200 focus:border-blue-400"
                          disabled={watch("isVirtual")}
                          placeholder={watch("isVirtual") ? "Virtual Event" : "Enter location"}
                        />
                        {errors.location && (
                          <span className="text-red-500 text-sm">{errors.location.message}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isVirtual"
                          {...register("isVirtual")}
                          className="border-blue-400 text-blue-600"
                          onCheckedChange={(checked) => {
                            setValue("isVirtual", checked as boolean);
                            if (checked) {
                              setValue("location", "");
                              // Clear location for all sessions
                              fields.forEach((_, index) => {
                                setValue(`sessions.${index}.location`, "");
                              });
                            }
                          }}
                        />
                        <Label htmlFor="isVirtual" className="text-blue-600">
                          Virtual Event
                        </Label>
                      </div>
                      <div>
                        <Label htmlFor="maxAttendees" className="text-blue-600">
                          Max Attendees
                        </Label>
                        <Input
                          id="maxAttendees"
                          type="number"
                          {...register("maxAttendees", { valueAsNumber: true })}
                          className="border-blue-200 focus:border-blue-400"
                        />
                        {errors.maxAttendees && (
                          <span className="text-red-500 text-sm">
                            {errors.maxAttendees.message}
                          </span>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="registrationDeadline" className="text-blue-600">
                          Registration Deadline
                        </Label>
                        <Input
                          id="registrationDeadline"
                          type="date"
                          {...register("registrationDeadline")}
                          max={watch("startDate")?.toString()}
                          className={cn(
                            "border-blue-200 focus:border-blue-400",
                            errors.registrationDeadline && "border-red-500",
                          )}
                        />
                        {errors.registrationDeadline && (
                          <span className="text-red-500 text-sm">
                            {errors.registrationDeadline.message}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-blue-200 pt-4 mt-4">
                    <h3 className="text-lg font-semibold mb-2 text-blue-700">Event Sessions</h3>
                    <Accordion type="single" collapsible className="w-full">
                      {fields.map((field, index) => (
                        <AccordionItem
                          value={`session-${index}`}
                          key={field.id}
                          className="border-blue-200"
                        >
                          <AccordionTrigger className="text-blue-600 hover:text-blue-800">
                            Session {index + 1}
                          </AccordionTrigger>
                          <AccordionContent className="bg-blue-50 p-4 rounded-lg">
                            {sessionTimeErrors[index] && (
                              <Alert variant="destructive" className="mb-4">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                <AlertTitle>
                                  {sessionTimeErrors[index]?.type === "conflict"
                                    ? "Session Conflict"
                                    : "Time Range Error"}
                                </AlertTitle>
                                <AlertDescription>
                                  {sessionTimeErrors[index]?.message}
                                </AlertDescription>
                              </Alert>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label
                                  htmlFor={`sessions.${index}.title`}
                                  className="text-blue-600"
                                >
                                  Session Title
                                </Label>
                                <Input
                                  id={`sessions.${index}.title`}
                                  {...register(`sessions.${index}.title`)}
                                  className="border-blue-200 focus:border-blue-400"
                                  disabled={savedSessions[index] && !editingSessions[index]}
                                />
                                {errors.sessions?.[index]?.title && (
                                  <span className="text-red-500 text-sm">
                                    {errors.sessions[index]?.title?.message}
                                  </span>
                                )}
                              </div>
                              <div>
                                <Label
                                  htmlFor={`sessions.${index}.description`}
                                  className="text-blue-600"
                                >
                                  Session Description
                                </Label>
                                <Input
                                  id={`sessions.${index}.description`}
                                  {...register(`sessions.${index}.description`)}
                                  className="border-blue-200 focus:border-blue-400"
                                  disabled={savedSessions[index] && !editingSessions[index]}
                                />
                                {errors.sessions?.[index]?.description && (
                                  <span className="text-red-500 text-sm">
                                    {errors.sessions[index]?.description?.message}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                              <div>
                                <Label
                                  htmlFor={`sessions.${index}.startTime`}
                                  className="text-blue-600"
                                >
                                  Start Time
                                </Label>
                                <Input
                                  type="datetime-local"
                                  value={formatDateForInput(savedSessionData[index]?.startTime)}
                                  onChange={(e) => handleStartTimeChange(e, index)}
                                  min={watch("startDate") 
                                    ? `${new Date(watch("startDate")).toISOString().split("T")[0]}T00:00`
                                    : undefined}
                                  max={watch("endDate")
                                    ? `${new Date(watch("endDate")).toISOString().split("T")[0]}T23:59`
                                    : undefined}
                                  className="border-blue-200 focus:border-blue-400"
                                  disabled={savedSessions[index] && !editingSessions[index]}
                                />
                              </div>
                              <div>
                                <Label
                                  htmlFor={`sessions.${index}.endTime`}
                                  className="text-blue-600"
                                >
                                  End Time
                                </Label>
                                <Input
                                  type="datetime-local"
                                  value={formatDateForInput(savedSessionData[index]?.endTime)}
                                  onChange={(e) => handleEndTimeChange(e, index)}
                                  min={watch("startDate")
                                    ? `${new Date(watch("startDate")).toISOString().split("T")[0]}T00:00`
                                    : undefined}
                                  max={watch("endDate")
                                    ? `${new Date(watch("endDate")).toISOString().split("T")[0]}T23:59`
                                    : undefined}
                                  className="border-blue-200 focus:border-blue-400"
                                  disabled={savedSessions[index] && !editingSessions[index]}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                              <div>
                                <Label
                                  htmlFor={`sessions.${index}.location`}
                                  className="text-blue-600"
                                >
                                  Session Location
                                </Label>
                                <Input
                                  id={`sessions.${index}.location`}
                                  {...register(`sessions.${index}.location`)}
                                  className="border-blue-200 focus:border-blue-400"
                                  disabled={
                                    (watch("isVirtual") || savedSessions[index]) &&
                                    !editingSessions[index]
                                  }
                                  placeholder={
                                    watch("isVirtual")
                                      ? "Virtual Session"
                                      : "Enter session location"
                                  }
                                />
                                {errors.sessions?.[index]?.location && (
                                  <span className="text-red-500 text-sm">
                                    {errors.sessions[index]?.location?.message}
                                  </span>
                                )}
                              </div>
                              <div>
                                <Label
                                  htmlFor={`sessions.${index}.maxAttendees`}
                                  className="text-blue-600"
                                >
                                  Max Attendees
                                </Label>
                                <Input
                                  id={`sessions.${index}.maxAttendees`}
                                  {...register(`sessions.${index}.maxAttendees`, {
                                    valueAsNumber: true,
                                  })}
                                  type="number"
                                  className="border-blue-200 focus:border-blue-400"
                                  disabled={savedSessions[index] && !editingSessions[index]}
                                />
                                {errors.sessions?.[index]?.maxAttendees && (
                                  <span className="text-red-500 text-sm">
                                    {errors.sessions[index]?.maxAttendees?.message}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex justify-between mt-4">
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => remove(index)}
                                  disabled={fields.length === 1}
                                  className="bg-red-500 hover:bg-red-600 text-white"
                                >
                                  <TrashIcon className="w-4 h-4 mr-2" /> Remove Session
                                </Button>
                                {!editingSessions[index] && savedSessions[index] && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditSession(index)}
                                    className="border-blue-500 text-blue-500 hover:bg-blue-50"
                                  >
                                    <Pencil className="w-4 h-4 mr-2" /> Edit Session
                                  </Button>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleSaveSession(index)}
                                disabled={
                                  (!editingSessions[index] && savedSessions[index]) ||
                                  !watch(`sessions.${index}.title`) ||
                                  !watch(`sessions.${index}.description`) ||
                                  !watch(`sessions.${index}.startTime`) ||
                                  !watch(`sessions.${index}.endTime`) ||
                                  !watch(`sessions.${index}.maxAttendees`) ||
                                  Number(watch(`sessions.${index}.maxAttendees`)) <= 0 ||
                                  !!sessionTimeErrors[index]
                                }
                                className={cn(
                                  "border-blue-600 text-blue-600 hover:bg-blue-50",
                                  savedSessions[index] &&
                                    !editingSessions[index] &&
                                    "bg-green-50 border-green-500 text-green-500",
                                )}
                              >
                                {savedSessions[index] && !editingSessions[index]
                                  ? "Session Saved"
                                  : "Save Session"}
                              </Button>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                    <Button
                      type="button"
                      onClick={addSession}
                      className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" /> Add Another Session
                    </Button>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={
                      !watch("title") ||
                      !watch("description") ||
                      !watch("startDate") ||
                      !watch("endDate") ||
                      !watch("registrationDeadline") ||
                      (!watch("isVirtual") && !watch("location")) ||
                      !watch("maxAttendees") ||
                      Object.values(sessionTimeErrors).some((error) => error !== null)
                    }
                  >
                    Create Event
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Card className="bg-white shadow-lg mb-6">
        <CardContent className="p-0">
          <Calendar
            localizer={localizer}
            events={events.map((event) => ({
              ...event,
              start: event.startDate
                ? new Date(
                    new Date(event.startDate).getTime() + new Date().getTimezoneOffset() * 60000,
                  )
                : new Date(),
              end: event.endDate
                ? new Date(
                    new Date(event.endDate).getTime() + new Date().getTimezoneOffset() * 60000
                  )
                : new Date(),
            }))}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            onSelectEvent={handleSelectEvent}
            view={view}
            onView={(newView: View) => handleViewChange(newView as ViewType)}
            date={date}
            onNavigate={handleNavigate}
            views={["month", "week", "day"]}
          />
        </CardContent>
      </Card>

      {selectedEvent && (
        <Card className="bg-white shadow-lg mt-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
              <CardTitle className="text-xl font-semibold text-blue-700 mb-2 sm:mb-0">
                {selectedEvent.title}
              </CardTitle>
              {user?.role === UserRole.ORGANIZER && (
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                  <EditEventButton
                    event={selectedEvent}
                    onEventUpdated={(updatedEvent) => {
                      setEvents((prev) =>
                        prev.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)),
                      );
                      setSelectedEvent(updatedEvent);
                    }}
                  />
                  <Button
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    variant="destructive"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <TrashIcon className="w-4 h-4 mr-2" /> Delete Event
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>{selectedEvent.description}</p>
              <div className="flex items-center text-sm text-gray-600">
                <ClockIcon className="w-4 h-4 mr-2" />
                {moment.utc(selectedEvent.startDate).format("MMM D, YYYY")} -{" "}
                {moment.utc(selectedEvent.endDate).format("MMM D, YYYY")}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPinIcon className="w-4 h-4 mr-2" />
                {selectedEvent.isVirtual && "Virtual Event"}
                {selectedEvent.location && !selectedEvent.isVirtual && selectedEvent.location}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <UsersIcon className="w-4 h-4 mr-2" />
                Max Attendees: {selectedEvent.maxAttendees}
              </div>
              <Badge variant={selectedEvent.isVirtual ? "secondary" : "default"}>
                {selectedEvent.isVirtual ? "Virtual" : "In-person"}
              </Badge>
              <div className="text-sm text-gray-600">
                Registration Deadline:{" "}
                {moment(selectedEvent.registrationDeadline).format("MMM D, YYYY")}
              </div>
              <div className="text-sm font-semibold text-blue-700">
                Status: {selectedEvent.status}
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="sessions">
                  <AccordionTrigger>Event Sessions</AccordionTrigger>
                  <AccordionContent>
                    {selectedEvent.sessions && selectedEvent.sessions.length > 0 ? (
                      selectedEvent.sessions.map((session) => (
                        <div key={session.id} className="mb-4 p-3 bg-gray-100 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{session.title}</h4>
                              <p className="text-sm text-gray-600">{session.description}</p>
                              <div className="flex items-center text-sm text-gray-600 mt-1">
                                <ClockIcon className="w-4 h-4 mr-1" />
                                {session.startTime
                                  ? new Date(session.startTime).toLocaleString()
                                  : ""}{" "}
                                -{" "}
                                {session.endTime ? new Date(session.endTime).toLocaleString() : ""}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPinIcon className="w-4 h-4 mr-1" />
                                {selectedEvent.isVirtual && "Virtual Event"}
                                {session.location && !selectedEvent.isVirtual && session.location}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <UsersIcon className="w-4 h-4 mr-1" />
                                Max Attendees: {session.maxAttendees}
                              </div>
                              {isSessionRegistered(selectedEvent.id, session.id) ? (
                                <Badge className="mt-2" variant="secondary">
                                  Already Reserved
                                </Badge>
                              ) : user?.role === UserRole.USER ? (
                                <Button
                                  onClick={() => handleRegister(selectedEvent.id, session.id)}
                                  className="mt-2"
                                >
                                  Register for Session
                                </Button>
                              ) : null}
                            </div>
                            {user?.role === UserRole.ORGANIZER && (
                              <Button
                                onClick={() => handleDeleteSession(selectedEvent.id, session.id)}
                                variant="destructive"
                                size="sm"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No sessions available for this event.</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

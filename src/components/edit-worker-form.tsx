
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import type { Worker } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { daysOfWeek, DayOfWeek, shiftOptions } from "@/lib/types";
import { getWorkers } from "@/lib/firestore";

// Validation schema
const scheduleSchema = z.object(
  daysOfWeek.reduce((acc, day) => {
    acc[day] = z.enum(["Morning", "Afternoon", "Evening", "Off Day"], { required_error: `Please select a shift for ${day}.` });
    return acc;
  }, {} as Record<DayOfWeek, z.ZodEnum<["Morning", "Afternoon", "Evening", "Off Day"]>>)
);

const workerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50),
  role: z.enum(["Carer", "Cook", "Cleaner", "Executive", "Volunteer"], {
    required_error: "Please select a role.",
  }),
  pin: z.string().length(4, "PIN must be exactly 4 digits.").regex(/^\d{4}$/, "PIN must be numeric."),
  schedule: scheduleSchema,
});

type WorkerFormData = z.infer<typeof workerSchema>;

export default function EditWorkerForm({
  worker,
  onSubmit,
  onCancel,
}: {
  worker: Worker;
  onSubmit: (data: Worker) => void;
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const form = useForm<WorkerFormData>({
    resolver: zodResolver(workerSchema),
    defaultValues: {
      name: worker.name,
      role: worker.role,
      pin: worker.pin,
      schedule: worker.schedule,
    },
  });

  const handleSubmit = async (data: WorkerFormData) => {
     const workers = await getWorkers();
    const isPinTaken = workers.some((w) => w.id !== worker.id && w.pin === data.pin);
    if (isPinTaken) {
      form.setError("pin", {
        type: "manual",
        message: "This PIN is already taken. Please choose another one.",
      });
      toast({
        variant: "destructive",
        title: "PIN Already Exists",
        description: "Another worker is already using this PIN.",
      });
      return;
    }
    onSubmit({
        ...worker,
        ...data,
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col h-full overflow-hidden"
      >
        <ScrollArea className="flex-grow pr-4 -mr-4">
          <div className="space-y-6 py-2 pr-2">
            {/* Worker Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Worker Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter worker name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select worker role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Carer">Carer</SelectItem>
                      <SelectItem value="Cook">Cook</SelectItem>
                      <SelectItem value="Cleaner">Cleaner</SelectItem>
                      <SelectItem value="Executive">Executive</SelectItem>
                      <SelectItem value="Volunteer">Volunteer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>4-Digit PIN</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="e.g. 1234"
                      maxLength={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Weekly Shift Schedule
                </CardTitle>
                <CardDescription>
                  Assign a shift for each day of the week.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {daysOfWeek.map((day) => (
                  <FormField
                    key={day}
                    control={form.control}
                    name={`schedule.${day}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{day}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select shift" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {shiftOptions.map((shift) => (
                              <SelectItem key={shift} value={shift}>
                                {shift}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <div className="flex-shrink-0 pt-4 flex gap-4 justify-end border-t bg-background mt-auto">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  );
}

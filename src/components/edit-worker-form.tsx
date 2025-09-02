
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form as ShadcnForm,
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
import { daysOfWeek, DayOfWeek } from "@/lib/types";
import { getWorkers } from "@/lib/firestore";

// Validation schema
const scheduleSchema = z.object(
  daysOfWeek.reduce((acc, day) => {
    acc[day] = z.enum(["Morning", "Afternoon", "Night", "Off Day"], { required_error: `Please select a shift for ${day}.` });
    return acc;
  }, {} as Record<DayOfWeek, z.ZodEnum<["Morning", "Afternoon", "Night", "Off Day"]>>)
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
    <ShadcnForm {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col h-full"
      >
        <ScrollArea className="flex-grow pr-6 -mr-6">
          <div className="space-y-6 pb-20">
             <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Worker Details</CardTitle>
                        <CardDescription>Enter the worker's personal and security information.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. John Smith" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                    <Input type="password" placeholder="e.g. 1234" maxLength={4} {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Weekly Schedule</CardTitle>
                        <CardDescription>Assign a shift for each day of the week.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                        {daysOfWeek.map(day => (
                            <FormField
                                key={day}
                                control={form.control}
                                name={`schedule.${day}`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{day}</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select shift" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Morning">Morning</SelectItem>
                                                <SelectItem value="Afternoon">Afternoon</SelectItem>
                                                <SelectItem value="Night">Night</SelectItem>
                                                <SelectItem value="Off Day">Off Day</SelectItem>
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

        <div className="sticky bottom-0 bg-card p-4 border-t flex gap-4">
          <Button type="button" variant="outline" onClick={onCancel} className="w-full">Cancel</Button>
          <Button type="submit" className="w-full">
            Save Changes
          </Button>
        </div>
      </form>
    </ShadcnForm>
  );
}

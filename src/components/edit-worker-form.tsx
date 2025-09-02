
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
import type { Worker } from "@/lib/types";

const WorkerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  role: z.string().min(2, "Role is required"),
});

type WorkerFormData = z.infer<typeof WorkerSchema>;

export default function EditWorkerForm({
    worker,
    onSubmit,
    onCancel
}: {
    worker: Worker;
    onSubmit: (data: Worker) => void;
    onCancel: () => void;
}) {
  const form = useForm<WorkerFormData>({
    resolver: zodResolver(WorkerSchema),
    defaultValues: {
      name: worker.name,
      email: (worker as any).email || "",
      role: worker.role,
    },
  });

  const handleSubmit = (data: WorkerFormData) => {
    onSubmit({
        ...worker,
        ...data,
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col h-full"
      >
        {/* Scrollable fields */}
        <ScrollArea className="flex-grow pr-6 -mr-6">
          <div className="space-y-6 pb-20">
            {/* Name */}
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

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter worker email" {...field} />
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
                  <FormControl>
                    <Input placeholder="Enter worker role" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </ScrollArea>

        {/* Action Buttons - Sticks at bottom */}
        <div className="sticky bottom-0 bg-background p-4 border-t flex gap-4">
          <Button type="button" variant="outline" onClick={onCancel} className="w-full">Cancel</Button>
          <Button type="submit" className="w-full">
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}

    
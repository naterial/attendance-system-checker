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
import type { Worker } from "@/lib/types";

// Validation schema
const WorkerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  role: z.enum(["Carer", "Cook", "Cleaner", "Executive", "Volunteer"]),
});

type WorkerFormData = z.infer<typeof WorkerSchema>;

export default function AddWorkerForm({
  onSubmit,
}: {
  onSubmit: (data: Omit<Worker, 'id' | 'pin' | 'schedule'>) => void;
}) {
  const form = useForm<WorkerFormData>({
    resolver: zodResolver(WorkerSchema),
    defaultValues: {
      name: "",
      role: "Carer",
    },
  });

  return (
    <ShadcnForm {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full relative"
      >
        {/* Scrollable area */}
        <ScrollArea className="flex-grow pr-6 -mr-6">
          <div className="space-y-6 pb-20">
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
                   <FormControl>
                    <Input placeholder="e.g. Carer, Cook" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </ScrollArea>

        {/* Sticky Add Worker Button */}
        <div className="sticky bottom-0 bg-card p-4 border-t">
          <Button type="submit" className="w-full">
            Add Worker
          </Button>
        </div>
      </form>
    </ShadcnForm>
  );
}

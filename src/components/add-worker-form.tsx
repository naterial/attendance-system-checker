
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Validation schema
const WorkerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  role: z.enum(["Carer", "Cook", "Cleaner", "Executive", "Volunteer"]),
});

type WorkerFormData = z.infer<typeof WorkerSchema>;

export default function AddWorkerForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: Omit<Worker, 'id' | 'pin' | 'schedule'>) => void;
  onCancel: () => void;
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
          </div>
        </ScrollArea>

        {/* Sticky Buttons */}
        <div className="sticky bottom-0 bg-card p-4 border-t flex gap-4">
            <Button type="button" variant="outline" onClick={onCancel} className="w-full">Cancel</Button>
            <Button type="submit" className="w-full">
                Add Worker
            </Button>
        </div>
      </form>
    </ShadcnForm>
  );
}

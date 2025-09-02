
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

interface AddWorkerFormProps {
  onSubmit: (data: Omit<Worker, 'id' | 'pin' | 'schedule'>) => void;
  onCancel: () => void;
}

export default function AddWorkerForm({ onSubmit, onCancel }: AddWorkerFormProps) {
  const form = useForm<WorkerFormData>({
    resolver: zodResolver(WorkerSchema),
    defaultValues: {
      name: "",
      role: "Carer",
    },
  });

  const handleFormSubmit = (data: WorkerFormData) => {
    onSubmit(data);
    form.reset();
  };


  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="flex flex-col h-full overflow-hidden"
      >
        <div className="flex-grow min-h-0">
            <ScrollArea className="h-full p-1 pr-6">
            <div className="space-y-6 py-2">
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
        </div>
        

        {/* Sticky Buttons */}
        <div className="flex-shrink-0 pt-4 flex gap-4 justify-end border-t bg-background">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">
                Add Worker
            </Button>
        </div>
      </form>
    </Form>
  );
}

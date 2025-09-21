
"use client";

import { useState, type ReactNode, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import type { Client, ClientStatus } from "@/lib/types";
import { cn } from "@/lib/utils";


const clientServices = [
  { value: 'custom-website-design', label: 'Custom Website Design' },
  { value: 'wordpress-development', label: 'WordPress Development' },
  { value: 'mobile-responsive-design', label: 'Mobile-Responsive Design' },
  { value: 'ecommerce-website', label: 'E-Commerce Website' },
  { value: 'landing-pages', label: 'Landing Pages' },
  { value: 'erp-software', label: '(ERP) software' },
  { value: 'mobile-app-development', label: 'Mobile App Development' },
  { value: 'web-design-development', label: 'Web Design & Development' },
  { value: 'content-creation', label: 'Content Creation' },
  { value: 'social-media-advertising', label: 'Social Media Advertising' },
  { value: 'influencer-marketing', label: 'Influencer Marketing' },
  { value: 'leads-360', label: 'Leads 360' },
  { value: 'smm-services', label: 'SMM Services' },
  { value: 'content-marketing', label: 'Content Marketing' },
  { value: 'keyword-research', label: 'Keyword Research' },
  { value: 'on-page-seo', label: 'On-Page SEO' },
  { value: 'off-page-seo', label: 'Off-Page SEO' },
  { value: 'technical-seo', label: 'Technical SEO' },
  { value: 'seo-optimization', label: 'SEO Optimization' },
  { value: 'local-keyword-research', label: 'Local Keyword Research' },
  { value: 'map-citation-pages', label: 'Map & Citation Pages' },
  { value: 'ad-creation-testing', label: 'Ad Creation & Testing' },
  { value: 'campaign-setup', label: 'Campaign Setup' },
  { value: 'nemt-call-center-services', label: 'NEMT Call Center Services' },
];

const clientStatuses: ClientStatus[] = ["Lead", "Active", "On Hold", "Completed", "Cancelled"];

const formSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  logoUrl: z.string().url("Please enter a valid URL for the logo").optional().or(z.literal('')),
  services: z.array(z.string()).min(1, "Please select at least one service"),
  status: z.enum(clientStatuses),
});

type ClientFormValues = z.infer<typeof formSchema>;

interface ClientDialogProps {
  children?: ReactNode;
  client?: Client;
  onSave: (client: Omit<Client, 'id' | 'project' | 'progress' | 'assignees'> | Client) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClientDialog({ children, client, onSave, isOpen, onOpenChange }: ClientDialogProps) {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: client?.name || "",
        logoUrl: client?.logoUrl || "",
        services: client?.services || [],
        status: client?.status || "Lead",
      });
    }
  }, [client, form, isOpen]);

  function onSubmit(values: ClientFormValues) {
    const newClient = {
      name: values.name,
      logoUrl: values.logoUrl || "https://picsum.photos/seed/newclient/40/40",
      logoHint: "company logo",
      status: values.status,
      services: values.services,
    };
    onSave(client ? { ...client, ...newClient } : newClient);
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{client ? "Edit Client" : "Add New Client"}</DialogTitle>
          <DialogDescription>
            {client ? "Update the details for this client." : "Fill in the details for the new client."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Innovate Corp" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/logo.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clientStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
              control={form.control}
              name="services"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Services Interested In</FormLabel>
                  <MultiSelect
                    options={clientServices}
                    selected={field.value}
                    onChange={field.onChange}
                    placeholder="Select services..."
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">{client ? "Save Changes" : "Create Client"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

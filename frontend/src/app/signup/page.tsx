"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import { useToast } from "@/hooks/use-toast";
import { api, API_ENDPOINTS } from "@/lib/api-config";
import { InvitationValidation } from "@/components/auth/invitation-validation";

import { Role } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  businessId: z.string().optional(),
  role: z.enum([Role.Admin, Role.Member]).default(Role.Member),
  invitationToken: z.string().optional(),
});

import { Suspense, useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";

function SignupPageInner() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const { signup, isLoading, error, clearError } = useAuthStore();
  const [isFirstUser, setIsFirstUser] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      businessId: "",
      role: Role.Member,
      invitationToken: searchParams.get("token") || searchParams.get("invitation") || "",
    },
  });

  // Check if this is the first user registration
  useEffect(() => {
    const checkFirstUser = async () => {
      try {
        const response = await api.get('/auth/check-first-user');
        setIsFirstUser(response.data.isFirstUser);
        if (response.data.isFirstUser) {
          form.setValue("role", Role.Admin); // First user becomes admin
        }
      } catch (error) {
        console.error('Error checking first user:', error);
      }
    };

    if (!searchParams.get("token") && !searchParams.get("invitation")) {
      checkFirstUser();
    }
  }, [form, searchParams]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleValidInvitation = (businessId: string, email: string, role: Role) => {
    form.setValue("businessId", businessId);
    form.setValue("email", email);
    // Only set valid signup roles (Admin or Member)
    const validRole = (role === Role.Admin || role === Role.Member) ? role : Role.Member;
    form.setValue("role", validRole);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const formData = {
        name: values.name,
        email: values.email,
        password: values.password,
        businessId: values.businessId || undefined,
        role: values.role || Role.Member,
        invitationToken: values.invitationToken
      };

      await signup(formData);

      // Success handling
      if (isFirstUser) {
        toast({
          title: "Welcome to SynergyHub!",
          description: "Your admin account has been created successfully. You can now log in.",
        });
      } else {
        toast({
          title: "Account Created",
          description: values.businessId
            ? `Your account has been created! Welcome to the team as ${values.role || 'a member'}!`
            : "Your account has been created! Please log in to continue.",
        });
      }

      router.push('/');
    } catch (error: any) {
      console.error('Signup error:', error);
      // Error is already handled in the store and will be displayed
    }
  }

  return (
    <div className="w-full lg:grid lg:min-h-[100vh] lg:grid-cols-2 xl:min-h-[100vh]">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-4 text-center">
            <Logo />
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Create an Account</h1>
              <p className="text-balance text-muted-foreground">
                Join SynergyHub and start collaborating with your team.
              </p>
            </div>
          </div>
          <Card>
            <InvitationValidation onValidInvitation={handleValidInvitation} />
            <CardHeader>
              <CardTitle className="text-2xl">Sign Up</CardTitle>
              <CardDescription>
                {isFirstUser
                  ? "Create the first admin account for SynergyHub"
                  : form.getValues("businessId")
                    ? "Complete your account setup to join the team"
                    : "Fill in the details below to create your account"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="m@example.com"
                            {...field}
                            disabled={form.getValues("businessId") !== ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {!form.getValues("businessId") && !isFirstUser && (
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Join as</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={Role.Admin}>Administrator (Limited to 20 total)</SelectItem>
                              <SelectItem value={Role.Member}>Employee (Unlimited)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  {isFirstUser && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium">
                        🎉 You're creating the first admin account for SynergyHub!
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        As the first user, you'll have super admin privileges to manage the entire system.
                      </p>
                    </div>
                  )}
                  {error && (
                    <div className="text-sm text-destructive text-center p-2 bg-red-50 border border-red-200 rounded">
                      {error}
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : isFirstUser ? "Create Admin Account" : "Create Account"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/" className="underline">
              Login
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://picsum.photos/seed/signup/1200/1800"
          alt="Abstract art representing collaboration"
          data-ai-hint="abstract collaboration"
          width="1200"
          height="1800"
          className="h-full w-full object-cover dark:brightness-[0.4]"
        />
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupPageInner />
    </Suspense>
  );
}
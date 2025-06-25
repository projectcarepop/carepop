"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { useToast } from "@/hooks/use-toast";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export default function Page() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isOauthLoading, setIsOauthLoading] = React.useState(false);
  const [signInError, setSignInError] = React.useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleOauthSignIn = async (provider: 'google') => {
    setIsOauthLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
    if (error) {
      toast({
        variant: "destructive",
        title: "Error signing in with Google",
        description: error.message,
      });
    }
    setIsOauthLoading(false);
  }

  const onSignInPress = async (values: z.infer<typeof formSchema>) => {
    setSignInError(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setSignInError(error.message);
    } else {
      router.push("/main-dashboard");
      router.refresh();
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md border border-gray-200">
        <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Welcome back
            </h1>
            <p className="mt-2 text-sm text-gray-600">
                Sign in to continue to your account.
            </p>
        </div>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSignInPress)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
            <Input
                type="email"
                placeholder="Enter your email address"
                            {...field}
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
                <div className="relative mt-1">
                            <FormControl>
                    <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                                    {...field}
                    />
                            </FormControl>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute bottom-1 right-1 h-7 w-7"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <Icons.eyeOff className="h-4 w-4" />
                        ) : (
                            <Icons.eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                        </span>
                    </Button>
                </div>
                        <FormMessage />
                 <div className="flex items-center justify-end mt-2">
                    <Link href="/forgot-password"
                        className="text-sm font-medium text-primary hover:text-primary/90 underline underline-offset-4"
                    >
                        Forgot password?
                    </Link>
                </div>
                    </FormItem>
                  )}
                />
                {signInError && (
                  <p className="text-sm font-medium text-destructive text-center">{signInError}</p>
                )}
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Signing in..." : "Continue"}
              </Button>
          </form>
        </Form>
        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                OR CONTINUE WITH
                </span>
            </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
            <Button variant="outline" type="button" onClick={() => handleOauthSignIn('google')} disabled={isOauthLoading || form.formState.isSubmitting}>
                <GoogleIcon className="mr-2 h-4 w-4" /> Google
            </Button>
        </div>
        <p className="px-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
            href="/sign-up"
            className="underline underline-offset-4 text-primary hover:text-primary/90"
            >
            Sign up
            </Link>
        </p>
      </div>
    </div>
  );
} 
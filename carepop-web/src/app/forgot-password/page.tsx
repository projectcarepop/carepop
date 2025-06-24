"use client";

import { useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Icons } from '@/components/icons'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
})

export default function ForgotPasswordPage() {
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${location.origin}/auth/callback?next=/update-password`,
      })

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: error.message,
        })
      } else {
        setIsSuccess(true);
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'An unexpected error occurred. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md border border-gray-200 text-center">
            <Icons.mail className="mx-auto h-12 w-12 text-primary" />
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>Check your email</h1>
            <p className="text-muted-foreground">
              We&apos;ve sent a password reset link to your email address. Please check your inbox.
            </p>
            <Button asChild>
                <Link href="/sign-in">Back to Sign In</Link>
            </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 my-8 space-y-6 bg-white rounded-lg shadow-md border border-gray-200">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Forgot Password
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>
        </Form>
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link
            href="/sign-in"
            className="underline underline-offset-4 text-primary hover:text-primary/90"
          >
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  )
} 
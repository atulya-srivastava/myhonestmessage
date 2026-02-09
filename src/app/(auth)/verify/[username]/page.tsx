"use client"

import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { verifySchema } from '@/schemas/verifySchemas'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'

import { toast } from 'sonner'
import * as z  from "zod"

const VerifyAccount = () => {
    const router = useRouter()
    const param = useParams<{username:string}>()

  //zod implementation
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof verifySchema>) =>{
    try {
     const response =   await axios.post('/api/verify-code',{
            username:param.username,
            code: data.code
        })

        toast("Success", {
            description: response.data.message
        })

        router.replace('/sign-in')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    }
  }

    return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-card border border-border rounded-xl shadow-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            Verify Your Account
          </h1>
          <p className="text-muted-foreground">Enter the verification code sent to your email</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <Input placeholder="Enter code" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">Verify</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default VerifyAccount
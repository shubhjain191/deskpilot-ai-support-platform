'use client'

import { useMutation, useQuery, Authenticated, Unauthenticated } from "convex/react"
import { SignInButton, UserButton } from "@clerk/nextjs";
import { api } from "@workspace/backend/_generated/api"


export default function Page() {
    const users = useQuery(api.users.getMany)
  return (
    <>
    <Authenticated>
      <div className="flex flex-col items-center justify-center min-h-svh">
        <p>apps/web</p>
        <UserButton />
        <div className="flex flex-col">
           {JSON.stringify(users, null, 2)}
        </div>
      </div>
    </Authenticated>
    
    <Unauthenticated> 
      <p>Must be signed in to view this page</p>
      <SignInButton>Sign In</SignInButton>
    </Unauthenticated>
    </>
  )
}

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useSession,signOut } from 'next-auth/react'
import {User} from 'next-auth'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'

const Navbar = () => {
    const {data:session} = useSession()
    const[isLoading,setIsLoading] = useState(false);

    const user: User = session?.user as User

    const Logout = () => {
        setIsLoading(true);
        signOut();
    }

  return (
    <nav className='relative z-20 p-4 md:p-6 bg-background border-b border-border/40'>
        <div className='container mx-auto flex flex-col md:flex-row justify-between items-center relative z-10'>
            <Link href="/" className='text-2xl font-bold mb-4 md:mb-0 hover:opacity-80 transition-opacity duration-300'>
                MyHonestMessage
            </Link>
            
            <div className="flex justify-center items-center gap-4">
                {
                    session ? (
                        <div className="flex items-center md:gap-6 gap-4">
                            <span className='text-muted-foreground text-sm md:text-base font-medium'>
                                Welcome <span className="text-foreground">@{user?.username || user?.email}</span>
                            </span>
                            { 
                                isLoading ? (
                                    <Button disabled variant="outline"> 
                                        <Loader2 className='animate-spin w-4 h-4 mr-2'/> 
                                        Loading
                                    </Button>
                                ) : (
                                    <Button 
                                        variant="destructive"
                                        onClick={Logout}
                                    >
                                        Logout
                                    </Button>
                                )
                            }
                        </div>
                    ) : (
                        <Link href='/sign-in'>
                            <Button className="font-medium">
                                Login
                            </Button>
                        </Link>
                    )
                }
            </div>
        </div>
    </nav>
  )
}

export default Navbar

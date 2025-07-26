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
    <nav className='relative z-20 p-4 md:p-6 bg-transparent backdrop-blur-sm border-b border-white/10'>
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        
        <div className='container mx-auto flex flex-col md:flex-row justify-between items-center relative z-10'>
            <Link href="/" className='text-2xl md:text-2xl font-bold mb-4 md:mb-0 bg-gradient-primary bg-clip-text text-transparent hover:opacity-80 transition-opacity duration-300'>
                MySecretMessage
            </Link>
            
            <div className="flex justify-center items-center gap-4">
                {
                    session ? (
                        <div className="flex items-center md:gap-10">
                            <span className='text-white/80 text-sm md:text-base font-medium'>
                                Welcome <span className="text-white">@{user?.username || user?.email}</span>
                            </span>
                            { 
                                isLoading ? (
                                    <Button disabled className="bg-white/10 border border-white/20 text-white/70 hover:bg-white/15"> 
                                        <Loader2 className='animate-spin w-4 h-4 mr-2'/> 
                                        Loading
                                    </Button>
                                ) : (
                                    <Button 
                                        className='bg-gradient-to-r from-pink-600 to-red-500 hover:from-red-600/90 hover:to-red-700/90 text-white border border-red-400/30 shadow-lg hover:shadow-red-500/20 transition-all duration-300' 
                                        onClick={Logout}
                                    >
                                        Logout
                                    </Button>
                                )
                            }
                        </div>
                    ) : (
                        <Link href='/sign-in'>
                            <Button className="bg-gradient-primary hover:opacity-90 text-primary-foreground font-medium shadow-glow hover:shadow-glow/80 transition-all duration-300">
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
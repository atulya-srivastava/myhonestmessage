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
    <nav className='p-4 md:p-6 shadow-md'>
        <div className='container mx-auto flex flex-col md:flex-row justify-between items-center'>
                <a className='text-3xl md:text-xl font-bold mb-4 md:mb-0' href="#">Mystery Message</a>
                <div className="flex justify-around  items-center gap-4">
                {
                    session ? (<>
                        <span className='mr-4'>Welcome, {user?.username || user?.email} </span>
                      { isLoading ? <Button> <Loader2 className='animate-spin w-4 h-4'/> Loading</Button>: <Button className='w-auto' onClick={Logout}>Logout</Button>}
                    </>
                    ) : (<Link href='/sign-in'>
                        <Button>Login</Button>
                    </Link>)
                }
                </div>
        </div>
    </nav>
  )
}

export default Navbar
'use client'

import { useAuth } from "@/contexts/AuthContext"
import { use } from "react"

export default function Dashboard() {
    const {user} = useAuth()
    return (
        <h1>Hello {user?.username} from the dashboard!</h1>
    )
}
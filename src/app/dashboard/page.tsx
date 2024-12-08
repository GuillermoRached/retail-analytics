'use client'

import { useAuth } from "@/contexts/AuthContext"

export default function Dashboard() {
    const {user} = useAuth()
    return (
        <h1>Hello {user?.username} from the dashboard!</h1>
    )
}
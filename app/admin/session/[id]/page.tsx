"use client"

export const dynamic = 'force-dynamic'

export default function AdminSessionPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Session {params.id}</h1>
      <p>Session management page - Coming soon</p>
    </div>
  )
}
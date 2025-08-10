"use client"

export const dynamic = 'force-dynamic'

export default function VotePage({ params }: { params: { sessionId: string } }) {
  return (
    <div>
      <h1>Vote for Session {params.sessionId}</h1>
      <p>Voting page - Coming soon</p>
    </div>
  )
}
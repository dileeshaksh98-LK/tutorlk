'use client'
import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function MessagesPage() {
  const { data: session } = useSession()
  const [conversations, setConversations] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/conversations').then(r => r.json()).then(d => {
      if (d.conversations) { setConversations(d.conversations); if (d.conversations[0]) setSelected(d.conversations[0]) }
    })
  }, [])

  useEffect(() => {
    if (!selected) return
    fetch(`/api/messages?bookingId=${selected.id}`).then(r => r.json()).then(d => {
      if (d.messages) { setMessages(d.messages); setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100) }
    })
  }, [selected])

  async function sendMessage() {
    if (!text.trim() || !selected) return
    setLoading(true)
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: selected.id, content: text }),
    })
    const d = await res.json()
    if (d.message) { setMessages(m => [...m, d.message]); setText(''); setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100) }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden" style={{ height: '65vh', display: 'flex' }}>

        {/* Conversation list */}
        <div className="w-64 border-r border-gray-100 flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wide">Conversations</div>
          <div className="overflow-y-auto flex-1">
            {conversations.length === 0 && (
              <div className="p-4 text-sm text-gray-400 text-center">No messages yet</div>
            )}
            {conversations.map(c => (
              <button key={c.id} onClick={() => setSelected(c)}
                className={`w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 border-b border-gray-50 ${selected?.id === c.id ? 'bg-brand-50' : ''}`}>
                <Avatar name={c.otherName ?? 'U'} image={c.otherImage} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{c.otherName}</div>
                  <div className="text-xs text-gray-400 truncate">{c.lastMessage}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col">
          {selected ? (
            <>
              <div className="p-4 border-b border-gray-100">
                <div className="font-medium text-sm">{selected.otherName}</div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(m => {
                  const isMe = m.sender.email === session?.user?.email
                  return (
                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      {!isMe && <Avatar name={m.sender.name ?? 'U'} image={m.sender.image} size="sm" className="mr-2 self-end" />}
                      <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-brand-400 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                        {m.content}
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>
              <div className="p-3 border-t border-gray-100 flex gap-2">
                <Input value={text} onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  placeholder="Type a message…" className="flex-1" />
                <Button onClick={sendMessage} disabled={loading || !text.trim()} size="sm">Send</Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Select a conversation</div>
          )}
        </div>
      </div>
    </div>
  )
}

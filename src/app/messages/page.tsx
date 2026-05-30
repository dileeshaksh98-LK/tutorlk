'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

interface Conversation {
  id:string; studentId:string; tutorId:string
  lastMessage?:string; lastAt?:string
  student:{id:string;name:string;image?:string}
  tutor:{id:string;name:string;image?:string}
}
interface Message {
  id:string; senderId:string; content:string
  fileUrl?:string; fileName?:string; fileSize?:number; mimeType?:string
  createdAt:string
  sender:{id:string;name:string;image?:string}
}

function getInitials(name:string) {
  return name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || '?'
}
function formatTime(d:string) {
  return new Date(d).toLocaleTimeString('en-LK',{hour:'2-digit',minute:'2-digit',hour12:true})
}
function formatDate(d:string) {
  const date = new Date(d)
  const today = new Date()
  if (date.toDateString()===today.toDateString()) return 'Today'
  const yesterday = new Date(today); yesterday.setDate(today.getDate()-1)
  if (date.toDateString()===yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('en-LK',{day:'numeric',month:'short'})
}

function MessagesContent() {
  const { data:session } = useSession()
  const sp = useSearchParams()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConv,    setActiveConv]    = useState<Conversation|null>(null)
  const [messages,      setMessages]      = useState<Message[]>([])
  const [userId,        setUserId]        = useState('')
  const [input,         setInput]         = useState('')
  const [sending,       setSending]       = useState(false)
  const [uploading,     setUploading]     = useState(false)
  const [loading,       setLoading]       = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const pollRef   = useRef<ReturnType<typeof setInterval>>()
  const fileRef   = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/chat').then(r=>r.json()).then(d => {
      setConversations(d.conversations ?? [])
      setUserId(d.userId ?? '')
      setLoading(false)
      // Auto-open if tutorId param
      const tid = sp.get('tutorId')
      if (tid) startConversation(tid)
    })
  }, [])

  const loadMessages = useCallback(async (convId:string) => {
    const res  = await fetch(`/api/chat/${convId}`)
    const data = await res.json()
    setMessages(data.messages ?? [])
    if (data.userId) setUserId(data.userId)
    setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:'smooth'}),80)
  },[])

  async function startConversation(tutorId:string) {
    const res  = await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tutorId})})
    const data = await res.json()
    if (data.conversation) {
      setConversations(prev => {
        const exists = prev.find(c=>c.id===data.conversation.id)
        if (!exists) return [data.conversation,...prev]
        return prev
      })
      openConversation(data.conversation)
    }
  }

  function openConversation(conv:Conversation) {
    setActiveConv(conv)
    loadMessages(conv.id)
    clearInterval(pollRef.current)
    pollRef.current = setInterval(()=>loadMessages(conv.id), 2500)
  }

  useEffect(()=>()=>clearInterval(pollRef.current),[])

  async function sendMessage() {
    if (!input.trim()||!activeConv||sending) return
    const text = input.trim()
    setSending(true); setInput('')
    // Optimistic add
    const temp:Message = {
      id:`tmp_${Date.now()}`, senderId:userId, content:text,
      createdAt:new Date().toISOString(), sender:{id:userId,name:'You'}
    }
    setMessages(m=>[...m,temp])
    setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:'smooth'}),50)

    await fetch(`/api/chat/${activeConv.id}`,{
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({content:text})
    })
    setSending(false)
    loadMessages(activeConv.id)
  }

  async function handleFileUpload(file:File) {
    if (!activeConv) return
    if (file.size > 20*1024*1024) { alert('Max file size is 20MB'); return }
    setUploading(true)
    const fd = new FormData()
    fd.append('file',file)
    fd.append('conversationId',activeConv.id)
    try {
      const res  = await fetch('/api/chat/upload',{method:'POST',body:fd})
      const data = await res.json()
      if (data.fileUrl) {
        await fetch(`/api/chat/${activeConv.id}`,{
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({content:'',fileUrl:data.fileUrl,fileName:file.name,fileSize:file.size,mimeType:file.type})
        })
        loadMessages(activeConv.id)
      }
    } catch(e) { console.error(e) }
    setUploading(false)
  }

  const other = (conv:Conversation) => conv.studentId===userId ? conv.tutor : conv.student

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">

      {/* LEFT: Conversations list */}
      <div className={`w-full sm:w-80 bg-white border-r border-gray-100 flex flex-col flex-shrink-0 ${activeConv?'hidden sm:flex':'flex'}`}>
        <div className="px-4 py-4 border-b border-gray-100">
          <h1 className="font-bold text-xl text-gray-900">Messages</h1>
          <p className="text-xs text-gray-400 mt-0.5">{conversations.length} conversation{conversations.length!==1?'s':''}</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-2 p-3">
              {[1,2,3].map(i=>(
                <div key={i} className="flex gap-3 p-3 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse flex-shrink-0"/>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 animate-pulse rounded w-2/3"/>
                    <div className="h-2.5 bg-gray-100 animate-pulse rounded w-1/2"/>
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length===0 ? (
            <div className="text-center py-16 px-4">
              <div className="text-5xl mb-3">💬</div>
              <p className="font-medium text-gray-600 mb-1">No conversations yet</p>
              <p className="text-xs text-gray-400">Book a session with a tutor to start chatting</p>
            </div>
          ) : conversations.map(conv=>{
            const o = other(conv)
            const isActive = activeConv?.id===conv.id
            return (
              <button key={conv.id} onClick={()=>openConversation(conv)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${isActive?'bg-brand-50 border-l-4 border-l-brand-400':''}`}>
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                    {o.image ? <img src={o.image} alt={o.name} className="w-full h-full object-cover"/> : getInitials(o.name)}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-900 truncate">{o.name}</span>
                    {conv.lastAt && <span className="text-xs text-gray-400 flex-shrink-0 ml-1">{formatTime(conv.lastAt)}</span>}
                  </div>
                  <div className="text-xs text-gray-400 truncate mt-0.5">{conv.lastMessage||'Start the conversation'}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* RIGHT: Chat area */}
      {activeConv ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm">
            <button onClick={()=>setActiveConv(null)} className="sm:hidden p-1 text-gray-400 hover:text-gray-600 mr-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
              {other(activeConv).image ? <img src={other(activeConv).image} alt="" className="w-full h-full object-cover"/> : getInitials(other(activeConv).name)}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{other(activeConv).name}</div>
              <div className="flex items-center gap-1.5 text-xs text-green-500">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"/>Online
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all" title="Share file" onClick={()=>fileRef.current?.click()}>
                📎
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
            {messages.length===0 && (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">👋</div>
                <p className="text-gray-500 font-medium">Say hello!</p>
                <p className="text-xs text-gray-400 mt-1">Start the conversation with {other(activeConv).name}</p>
              </div>
            )}
            {messages.map((msg,i)=>{
              const isMe = msg.senderId===userId
              const prev = messages[i-1]
              const showDate = !prev || new Date(msg.createdAt).toDateString()!==new Date(prev.createdAt).toDateString()
              const showAvatar = !isMe && (!messages[i+1] || messages[i+1].senderId!==msg.senderId)
              const isImage = msg.mimeType?.startsWith('image/')
              const isPDF   = msg.mimeType==='application/pdf'

              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="text-center my-4">
                      <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{formatDate(msg.createdAt)}</span>
                    </div>
                  )}
                  <div className={`flex gap-2 ${isMe?'flex-row-reverse':'flex-row'} ${!showDate&&prev&&prev.senderId===msg.senderId?'mt-0.5':'mt-2'}`}>
                    <div className={`w-7 flex-shrink-0 ${showAvatar?'':'invisible'}`}>
                      {!isMe && (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                          {msg.sender.image ? <img src={msg.sender.image} alt="" className="w-full h-full object-cover"/> : getInitials(msg.sender.name)}
                        </div>
                      )}
                    </div>
                    <div className={`max-w-xs lg:max-w-md xl:max-w-lg flex flex-col ${isMe?'items-end':'items-start'}`}>
                      {msg.fileUrl ? (
                        <div className={`rounded-2xl overflow-hidden border ${isMe?'border-brand-300':'border-gray-200'} ${isMe?'rounded-br-sm':'rounded-bl-sm'}`}>
                          {isImage ? (
                            <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                              <img src={msg.fileUrl} alt={msg.fileName} className="max-w-64 max-h-48 object-cover"/>
                            </a>
                          ) : (
                            <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer"
                              className={`flex items-center gap-3 px-4 py-3 hover:opacity-80 transition-opacity ${isMe?'bg-brand-400 text-white':'bg-white text-gray-700'}`}>
                              <span className="text-2xl">{isPDF?'📄':'📎'}</span>
                              <div className="min-w-0">
                                <div className="text-sm font-medium truncate max-w-36">{msg.fileName}</div>
                                {msg.fileSize && <div className="text-xs opacity-70">{(msg.fileSize/1024).toFixed(0)} KB</div>}
                              </div>
                              <span className="text-xs opacity-70">↓</span>
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                          isMe ? 'bg-brand-400 text-white rounded-br-sm' : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-bl-sm'
                        } ${msg.id.startsWith('tmp_')?'opacity-70':''}`}>
                          {msg.content}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 px-1 mt-0.5">{formatTime(msg.createdAt)}</div>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef}/>
          </div>

          {/* Input bar */}
          <div className="bg-white border-t border-gray-100 px-4 py-3">
            {uploading && (
              <div className="text-xs text-brand-600 mb-2 flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-brand-400 border-t-transparent rounded-full animate-spin"/>
                Uploading file…
              </div>
            )}
            <div className="flex items-end gap-2">
              <button onClick={()=>fileRef.current?.click()} disabled={uploading}
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0 transition-colors text-lg disabled:opacity-50">
                📎
              </button>
              <input ref={fileRef} type="file" className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
                onChange={e=>e.target.files?.[0]&&handleFileUpload(e.target.files[0])}/>
              <div className="flex-1">
                <textarea value={input}
                  onChange={e=>{ setInput(e.target.value); e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight,120)+'px' }}
                  onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage()} }}
                  placeholder="Type a message… (Shift+Enter for new line)"
                  rows={1}
                  className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-2xl resize-none focus:outline-none focus:border-brand-400 min-h-10 max-h-32 overflow-y-auto"/>
              </div>
              <button onClick={sendMessage} disabled={!input.trim()||sending}
                className="w-10 h-10 rounded-xl bg-brand-400 hover:bg-brand-500 flex items-center justify-center text-white flex-shrink-0 transition-all disabled:opacity-50 shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden sm:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="text-7xl mb-4">💬</div>
            <h2 className="font-bold text-xl text-gray-700 mb-2">Your messages</h2>
            <p className="text-sm text-gray-400 max-w-xs">Select a conversation to chat with a tutor or student. Share files and PDFs directly.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MessagesPage() {
  return <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-400 border-t-transparent rounded-full animate-spin"/></div>}><MessagesContent/></Suspense>
}

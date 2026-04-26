'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

type Post = {
  id: string
  content: string
  created_at: string
  user_id: string
  user_email: string
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return `${diff}秒`
  if (diff < 3600) return `${Math.floor(diff / 60)}分`
  if (diff < 86400) return `${Math.floor(diff / 3600)}時間`
  return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}

export default function PostCard({
  post,
  currentUserId,
  onDeleted,
}: {
  post: Post
  currentUserId: string
  onDeleted: () => void
}) {
  const [deleting, setDeleting] = useState(false)
  const isOwner = post.user_id === currentUserId

  async function handleDelete() {
    if (!confirm('この投稿を削除しますか？')) return
    setDeleting(true)
    await supabase.from('posts').delete().eq('id', post.id)
    onDeleted()
  }

  return (
    <article className="px-4 py-4 border-b border-gray-800 hover:bg-gray-950 transition-colors">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">
          {post.user_email?.[0].toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="font-bold truncate">{post.user_email?.split('@')[0]}</span>
            <span className="text-gray-500 text-sm truncate">@{post.user_email}</span>
            <span className="text-gray-500 text-sm">·</span>
            <span className="text-gray-500 text-sm">{formatDate(post.created_at)}</span>

            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="ml-auto text-gray-500 hover:text-red-500 text-sm transition-colors"
                title="削除"
              >
                ✕
              </button>
            )}
          </div>
          <p className="mt-1 text-white whitespace-pre-wrap break-words">{post.content}</p>
        </div>
      </div>
    </article>
  )
}

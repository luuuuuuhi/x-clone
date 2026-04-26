'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const MAX_LENGTH = 280

export default function PostForm({ user, onPosted }: { user: User; onPosted: () => void }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || content.length > MAX_LENGTH) return

    setLoading(true)
    const { error } = await supabase.from('posts').insert({
      content: content.trim(),
      user_id: user.id,
      user_email: user.email,
    })

    if (!error) {
      setContent('')
      onPosted()
    }
    setLoading(false)
  }

  const remaining = MAX_LENGTH - content.length
  const isOverLimit = remaining < 0
  const isNearLimit = remaining <= 20

  return (
    <form onSubmit={handleSubmit} className="px-4 py-4 border-b border-gray-800">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0 text-sm font-bold">
          {user.email?.[0].toUpperCase()}
        </div>

        <div className="flex-1">
          <textarea
            placeholder="いまどうしてる？"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full bg-transparent text-white text-xl placeholder-gray-500 resize-none focus:outline-none"
          />

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-800">
            <span
              className={`text-sm ${isOverLimit ? 'text-red-500' : isNearLimit ? 'text-yellow-500' : 'text-gray-500'}`}
            >
              {remaining}
            </span>
            <button
              type="submit"
              disabled={loading || !content.trim() || isOverLimit}
              className="bg-sky-500 text-white font-bold px-5 py-2 rounded-full hover:bg-sky-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '投稿中...' : 'ポスト'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

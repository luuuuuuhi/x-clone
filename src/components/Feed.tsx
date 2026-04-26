'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import PostCard from './PostCard'
import PostForm from './PostForm'

type Post = {
  id: string
  content: string
  created_at: string
  user_id: string
  user_email: string
}

export default function Feed({ user }: { user: User }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error && data) setPosts(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPosts()

    // リアルタイム購読
    const channel = supabase
      .channel('posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
        setPosts((prev) => [payload.new as Post, ...prev])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchPosts])

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <div className="max-w-xl mx-auto min-h-screen border-x border-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.636L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
          </svg>
          <span className="font-bold text-lg">ホーム</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm hidden sm:block">{user.email}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white border border-gray-600 hover:border-gray-400 px-3 py-1 rounded-full transition-colors"
          >
            ログアウト
          </button>
        </div>
      </header>

      {/* Post form */}
      <PostForm user={user} onPosted={fetchPosts} />

      {/* Divider */}
      <div className="border-b border-gray-800" />

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-500 py-12">まだ投稿がありません。最初のつぶやきを投稿してみましょう！</p>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} currentUserId={user.id} onDeleted={fetchPosts} />)
      )}
    </div>
  )
}

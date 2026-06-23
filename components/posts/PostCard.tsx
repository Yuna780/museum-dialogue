'use client'

import { useState } from 'react'
import { Post, Exhibition } from '@/lib/types'
import { timeAgo } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import PostForm from './PostForm'
import CommentSection from '@/components/comments/CommentSection'
import AfterNotes from './AfterNotes'

interface PostCardProps {
  post: Post
  exhibition?: Exhibition
  currentUserId?: string
  onDeleted: (id: string) => void
  onUpdated: (post: Post) => void
}

function toHashtag(str: string): string {
  return str.replace(/[\s\t\n\r　]/g, '')
}

// Xの文字数カウント: CJK・絵文字=2、Latin等=1、URL=23
const X_WEIGHT1_RANGES: [number, number][] = [
  [0, 4351], [8192, 8205], [8208, 8223], [8242, 8247],
]
function xCharCount(text: string): number {
  let count = 0
  for (const char of text) {
    const cp = char.codePointAt(0)!
    count += X_WEIGHT1_RANGES.some(([s, e]) => cp >= s && cp <= e) ? 1 : 2
  }
  return count
}
function truncateToXBudget(text: string, budget: number): string {
  let count = 0
  let i = 0
  for (const char of text) {
    const cp = char.codePointAt(0)!
    const w = X_WEIGHT1_RANGES.some(([s, e]) => cp >= s && cp <= e) ? 1 : 2
    if (count + w > budget - 3) return text.slice(0, i) + '...'
    count += w
    i += char.length
  }
  return text
}

function buildHashtags(exhibitionTitle?: string, location?: string | null): string[] {
  const tags: string[] = ['#MuseumDialogue', '#展覧会記録']
  if (exhibitionTitle) {
    const tag = toHashtag(exhibitionTitle)
    tags.push(`#${tag}`)
    if (tag.length > 20) tags.push(`#${tag.slice(0, 10)}`)
  }
  if (location) {
    const loc = toHashtag(location)
    if (loc) tags.push(`#${loc}`)
  }
  return [...new Set(tags)]
}

export default function PostCard({ post, exhibition, currentUserId, onDeleted, onUpdated }: PostCardProps) {
  const [liked, setLiked] = useState(post.user_has_liked ?? false)
  const [likesCount, setLikesCount] = useState(post.likes_count ?? 0)
  const [editing, setEditing] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const supabase = createClient()

  const handleLike = async () => {
    if (!currentUserId) return
    if (liked) {
      await supabase.from('likes').delete().match({ post_id: post.id, user_id: currentUserId })
      setLiked(false)
      setLikesCount(c => c - 1)
    } else {
      await supabase.from('likes').insert({ post_id: post.id, user_id: currentUserId })
      setLiked(true)
      setLikesCount(c => c + 1)
    }
  }

  const handleDelete = async () => {
    if (!confirm('この投稿を削除しますか？')) return
    await supabase.from('posts').delete().eq('id', post.id)
    onDeleted(post.id)
  }

  const PROMPT_LABELS = [
    '一番印象に残った作品は？',
    'それはなぜですか？',
    '他の来場者の意見で、見方が変わりましたか？',
    'この展覧会に自分なりのタイトルをつけるとしたら？',
  ]
  const promptAnswers = [post.prompt1, post.prompt2, post.prompt3, post.prompt4]

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  const buildSharePreview = (): string => {
    const raw = [
      post.prompt4 ? `「${post.prompt4}」` : '',
      post.content || '',
    ].filter(Boolean).join('\n')
    if (raw.length <= 100) return raw
    return raw.slice(0, 100) + '...'
  }

  const handleShareX = () => {
    const exhibitionLine = exhibition?.title ? `【${exhibition.title}】\n` : ''
    const suffixWithoutUrl = '\n\n続きはこちら👇\n'
    const budget = 280 - xCharCount(exhibitionLine) - xCharCount(suffixWithoutUrl) - 23
    const raw = [
      post.prompt4 ? `「${post.prompt4}」` : '',
      post.content || '',
    ].filter(Boolean).join('\n')
    const preview = truncateToXBudget(raw, budget)
    const text = `${exhibitionLine}${preview}${suffixWithoutUrl}${shareUrl}`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
  }

  const handleShareInstagram = async () => {
    const preview = buildSharePreview()
    const hashtags = buildHashtags(exhibition?.title, exhibition?.location).join('\n')
    const text = `${preview}\n\n続きはこちら👇\n${shareUrl}\n\n${hashtags}`
    if (navigator.share) {
      await navigator.share({ text })
    } else {
      await navigator.clipboard.writeText(text)
      alert('テキストをコピーしました。Instagramに貼り付けてください。')
    }
  }

  if (editing) {
    return (
      <PostForm
        exhibitionId={post.exhibition_id}
        initialContent={post.content}
        initialPrompt1={post.prompt1 ?? ''}
        initialPrompt2={post.prompt2 ?? ''}
        initialPrompt3={post.prompt3 ?? ''}
        initialPrompt4={post.prompt4 ?? ''}
        postId={post.id}
        onSaved={updated => { onUpdated(updated); setEditing(false) }}
        onCancel={() => setEditing(false)}
      />
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
            {post.profile?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{post.profile?.username ?? '匿名'}</p>
            <p className="text-xs text-gray-400">{timeAgo(post.created_at)}</p>
          </div>
        </div>
        {currentUserId === post.user_id && (
          <div className="flex gap-2">
            <button onClick={() => setEditing(true)} className="text-xs text-gray-400 hover:text-gray-600">編集</button>
            <button onClick={handleDelete} className="text-xs text-red-400 hover:text-red-600">削除</button>
          </div>
        )}
      </div>

      {/* 振り返りプロンプト回答 */}
      {promptAnswers.some(a => a) && (
        <div className="space-y-2 mb-3">
          {promptAnswers.map((answer, i) =>
            answer ? (
              <div key={i} className="bg-gray-50 rounded-xl px-3 py-2">
                <p className="text-xs font-medium text-gray-400 mb-0.5">Q{i + 1}. {PROMPT_LABELS[i]}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{answer}</p>
              </div>
            ) : null
          )}
        </div>
      )}

      {/* 自由感想 */}
      {post.content && (
        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
      )}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 text-sm transition-colors ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'} ${!currentUserId ? 'cursor-default' : ''}`}
        >
          {liked ? '♥' : '♡'} <span>{likesCount}</span>
        </button>
        <button
          onClick={() => setShowComments(v => !v)}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          💬 <span>{post.comments_count ?? 0}</span>
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleShareX}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
            title="Xでシェア"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            シェア
          </button>
          <button
            onClick={handleShareInstagram}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-pink-500 transition-colors"
            title="Instagramでシェア"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
            </svg>
            シェア
          </button>
        </div>
      </div>
      {showComments && (
        <div className="mt-4">
          <CommentSection postId={post.id} currentUserId={currentUserId} />
        </div>
      )}

      {/* After Notes */}
      <div className="mt-4 pt-4 border-t border-gray-50">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">After Notes</p>
        <AfterNotes
          postId={post.id}
          postCreatedAt={post.created_at}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  )
}

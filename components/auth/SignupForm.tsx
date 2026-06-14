'use client'

import Link from 'next/link'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'

export default function SignupForm() {
  return (
    <div className="space-y-4">
      <GoogleSignInButton />
      <p className="text-center text-sm text-gray-500">
        すでにアカウントをお持ちの方は{' '}
        <Link href="/login" className="text-gray-900 font-medium hover:underline">
          ログイン
        </Link>
      </p>
    </div>
  )
}

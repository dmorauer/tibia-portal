'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Build } from '@/lib/types'

export default function BuildsPage() {
  const [builds, setBuilds] = useState<Build[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBuilds() {
      const { data, error } = await supabase
        .from('builds')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setBuilds(data as Build[])
      }
      setLoading(false)
    }

    fetchBuilds()
  }, [])

  if (loading) return <p className="p-8">Carregando builds...</p>
  if (error) return <p className="p-8 text-red-500">Erro: {error}</p>

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Builds públicas</h1>

      {builds.length === 0 && (
        <p className="text-gray-500">Nenhuma build pública ainda.</p>
      )}

      <div className="space-y-4">
        {builds.map((build) => (
          <div key={build.id} className="border rounded-lg p-4">
            <h2 className="font-semibold">
              {build.name} — Level {build.level}
            </h2>
            <pre className="text-sm text-gray-600 mt-2">
              {JSON.stringify(build.skills, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </main>
  )
}
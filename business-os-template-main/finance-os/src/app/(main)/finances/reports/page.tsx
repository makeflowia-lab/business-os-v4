'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  FileText,
} from 'lucide-react'

interface MesData {
  anio: number
  mes: number
  nombreMes: string
  totalTransacciones: number
  totalIngresos: number
  totalGastos: number
  balance: number
}

export default function ReportesPage() {
  const [meses, setMeses] = useState<MesData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMeses()
  }, [])

  const fetchMeses = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/reportes/meses')
      const json = await res.json()
      setMeses(json.meses || [])
    } catch (error) {
      console.error('Error fetching meses:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 pb-24 md:p-8 lg:pb-8">
      <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/"
              className="p-2 rounded-xl bg-neu-bg shadow-neu hover:shadow-neu-sm transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-8 h-8 text-emerald-500" />
                Reportes Mensuales
              </h1>
              <p className="text-gray-500 mt-1">
                Historial de finanzas mes a mes
              </p>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <p className="mt-4 text-gray-500">Cargando reportes...</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && meses.length === 0 && (
            <div className="text-center py-12 bg-neu-bg shadow-neu rounded-2xl">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay reportes disponibles</p>
              <p className="text-sm text-gray-400 mt-2">
                Registra transacciones para generar reportes
              </p>
            </div>
          )}

          {/* Grid of months */}
          {!loading && meses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {meses.map((mes) => (
                <div
                  key={`${mes.anio}-${mes.mes}`}
                  className="bg-neu-bg shadow-neu rounded-2xl p-6 hover:shadow-neu-sm transition-all"
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-emerald-100">
                      <Calendar className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 capitalize">
                        {mes.nombreMes}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {mes.totalTransacciones} transacciones
                      </p>
                    </div>
                  </div>

                  {/* KPIs */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm text-gray-600">Ingresos</span>
                      </div>
                      <span className="font-semibold text-emerald-600">
                        ${mes.totalIngresos.toLocaleString('es-MX')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-gray-600">Gastos</span>
                      </div>
                      <span className="font-semibold text-red-600">
                        ${mes.totalGastos.toLocaleString('es-MX')}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          Balance
                        </span>
                        <span
                          className={`font-bold text-lg ${
                            mes.balance >= 0 ? 'text-emerald-600' : 'text-red-600'
                          }`}
                        >
                          {mes.balance >= 0 ? '+' : ''}$
                          {mes.balance.toLocaleString('es-MX')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}

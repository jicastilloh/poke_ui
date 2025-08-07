"use client"

import { useState, useEffect } from "react"
import { Download, RefreshCw, ArrowUpDown, Trash, X, Trash2, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Modal } from "@/components/ui/modal"

export default function ReportsTable({ reports, loading, pokemonTypeSetter, sampleSizeSetter, onRefresh, onDownload, onDelete }) {
  const [showModal, setShowModal] = useState(false)
  const [selectedReportId, setSelectedReportId] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [sortedReports, setSortedReports] = useState([])
  const [sortDirection, setSortDirection] = useState("desc") // "desc" para descendente (más reciente primero)

  // Ordenar los reportes cuando cambian o cuando cambia la dirección de ordenamiento
  useEffect(() => {
    if (!reports || reports.length === 0) {
      setSortedReports([])
      return
    }

    // Crear una copia para no modificar el array original
    const reportsCopy = [...reports]

    // Ordenar por el campo "updated"
    const sorted = reportsCopy.sort((a, b) => {
      const dateA = new Date(getPropertyValue(a, "updated"))
      const dateB = new Date(getPropertyValue(b, "updated"))

      // Verificar si las fechas son válidas
      const isValidDateA = !isNaN(dateA.getTime())
      const isValidDateB = !isNaN(dateB.getTime())

      // Si ambas fechas son válidas, compararlas
      if (isValidDateA && isValidDateB) {
        return sortDirection === "desc" ? dateB - dateA : dateA - dateB
      }

      // Si solo una fecha es válida, ponerla primero
      if (isValidDateA) return sortDirection === "desc" ? -1 : 1
      if (isValidDateB) return sortDirection === "desc" ? 1 : -1

      // Si ninguna fecha es válida, mantener el orden original
      return 0
    })

    setSortedReports(sorted)
  }, [reports, sortDirection])

  // Función para cambiar la dirección de ordenamiento
  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"))
  }

  // Función para obtener el valor de una propiedad, manejando diferentes estructuras de datos
  const getPropertyValue = (obj, prop) => {
    // Si la propiedad existe directamente
    if (obj[prop] !== undefined) {
      return obj[prop]
    }

    // Si la propiedad está en camelCase o en formato diferente
    const propLower = prop.toLowerCase()
    const keys = Object.keys(obj)

    // Buscar una propiedad que coincida ignorando mayúsculas/minúsculas
    for (const key of keys) {
      if (key.toLowerCase() === propLower) {
        return obj[key]
      }
    }

    // Si no se encuentra, devolver un valor por defecto
    return "N/A"
  }

  // Verificar si el status es "completed"
  const isStatusCompleted = (report) => {
    const status = getPropertyValue(report, "status")
    return status && status.toLowerCase() === "completed"
  }

  // Manejar la descarga del CSV
  const handleDownload = (report) => {
    const url = getPropertyValue(report, "url")
    if (!url || url === "N/A") {
      toast.error("URL de descarga no disponible")
      return
    }
    onDownload(url)
  }

  // Manejar la eliminación del reporte
  const deleteReport = (ReportId) => {
    onDelete(ReportId)
    closeModal()
  }

  // Abrir el modal de confirmación para eliminar
  const openConfirmModal = (ReportId) => {
    setSelectedReportId(ReportId)
    setShowModal(true)
  }

  // Cerrar el modal
  const closeModal = () => {
    setShowModal(false)
    setSelectedReportId(null)
  }

  // Manejar limpiar inputs
  const handleClear = async () => {
    try {
      pokemonTypeSetter("")
      sampleSizeSetter(null)
      toast.success("Se limpiaron los campos")
    } catch (error) {
      toast.error("No se pudieron limpiar los campos. Por favor, intenta de nuevo.")
    } finally {
      setRefreshing(false)
    }
  }

  // Manejar el refresco de la tabla
  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      await onRefresh()
      toast.success("Los reportes han sido actualizados correctamente")
    } catch (error) {
      toast.error("No se pudieron actualizar los reportes. Por favor, intenta de nuevo.")
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <>
      {showModal && (
        <Modal>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900">¿Eliminar reporte?</h3>
            <div className="mt-2 px-7 py-3">
              <p className="text-lg text-gray-500">¿Estás seguro que deseas eliminar el reporte <span className="font-bold">{selectedReportId}</span>?</p>
            </div>
            <div className="flex justify-center mt-4 gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  deleteReport(selectedReportId);
                  toast.success('Reporte eliminado');
                }}
                className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                Eliminar
              </button>
            </div>
          </div>
        </Modal>
      )}
      <div className="overflow-x-auto">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Reports</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSortDirection}
            className="flex items-center gap-1"
            title={
              sortDirection === "desc"
                ? "Ordenado de más reciente a más antiguo"
                : "Ordenado de más antiguo a más reciente"
            }
          >
            <ArrowUpDown className="h-4 w-4" />
            <span>{sortDirection === "desc" ? "Más antiguo primero" : "Más reciente primero"}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={loading}
            className="flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            <span>Clear</span>
          </Button>
        </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : (
        <Table>
          <TableCaption>List of Pokémon reports available for download</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ReportId</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[150px]">PokemonType</TableHead>
              <TableHead className="w-[150px]">Sample Size</TableHead>
              <TableHead className="w-[200px]">Created</TableHead>
              <TableHead className="w-[200px]">
                <div className="flex items-center">Updated</div>
              </TableHead>
              <TableHead className="w-[80px] text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedReports.length > 0 ? (
              sortedReports.map((report, index) => (
                <TableRow key={getPropertyValue(report, "reportId") || index}>
                  <TableCell>{getPropertyValue(report, "reportId")}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isStatusCompleted(report) ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {getPropertyValue(report, "status")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">{getPropertyValue(report, "pokemonType")}</span>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">{getPropertyValue(report, "sample_size") ?? 'Sin Especificar'}</span>
                  </TableCell>
                  <TableCell>{getPropertyValue(report, "created")}</TableCell>
                  <TableCell>{getPropertyValue(report, "updated")}</TableCell>
                  <TableCell className="text-center">
                    {isStatusCompleted(report) && (
                      <Button variant="ghost" size="icon" onClick={() => handleDownload(report)} title="Download CSV">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    {isStatusCompleted(report) && (
                      <Button variant="ghost" size="icon" onClick={() => openConfirmModal(report.ReportId)} title="Delete Report">
                        <Trash className="h-4 w-4 text-red-800" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No reports available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </>
  )
}

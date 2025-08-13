import React, { useEffect, useMemo, useState } from 'react'
import { api, PSGC_API_URL } from '@/services/api'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Search, MapPin, Filter, Trash2, Edit, MessageSquare, Eye } from 'lucide-react'
import CustomInput from '@/components/CustomInput'
import LeaderProfileDialog from './LeaderProfileDialog'

const LeaderTable = () => {
  const navigate = useNavigate()
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  // PSGC lists for filters (optional)
  const [barangays, setBarangays] = useState([])
  const [municipalities, setMunicipalities] = useState([])
  const [provinces, setProvinces] = useState([])

  const [filterProvince, setFilterProvince] = useState('')
  const [filterMunicipality, setFilterMunicipality] = useState('')
  const [filterBarangay, setFilterBarangay] = useState('')

  // Delete confirmation state
  const [leaderToDelete, setLeaderToDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Notify dialog state
  const [notifyDialog, setNotifyDialog] = useState({ open: false, leader: null })
  const [notifyLoading, setNotifyLoading] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')

  // View profile dialog state
  const [viewProfileDialog, setViewProfileDialog] = useState({ open: false, leader: null })

  // Pagination
  const PAGE_SIZE = 15
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchLeaders()
    fetchProvinces()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchLeaders = async () => {
    try {
      setLoading(true)
      const res = await api.leaders.list({ search })
      setLeaders(res.data || [])
    } catch (e) {
      console.error('Failed to load leaders', e)
      setError(e.message || 'Failed to load leaders')
    } finally {
      setLoading(false)
    }
  }

  const fetchProvinces = async () => {
    try {
      const resp = await axios.get(`${PSGC_API_URL}/provinces/`)
      setProvinces(resp.data)
    } catch (e) {
      // ignore
      setBarangays([])
      setMunicipalities([])
      console.error('Failed to load provinces', e)
    }
  }

  const fetchMunicipalities = async (provinceCode) => {
    if (!provinceCode) return
    try {
      const resp = await axios.get(`${PSGC_API_URL}/provinces/${provinceCode}/municipalities/`)
      setMunicipalities(resp.data)
    } catch {
        setBarangays([])
    }
  }

  const fetchBarangays = async (municipalityCode) => {
    if (!municipalityCode) return
    try {
      const resp = await axios.get(`${PSGC_API_URL}/municipalities/${municipalityCode}/barangays/`)
      setBarangays(resp.data)
    } catch {
      setBarangays([])
    }
  }

  const filtered = useMemo(() => {
    return leaders.filter((l) => {
      const name = `${l.firstName || ''} ${l.lastName || ''}`.toLowerCase()
      const matchesSearch = !search || name.includes(search.toLowerCase()) || (l.email || '').toLowerCase().includes(search.toLowerCase())
      const addr = l.address || {}
      const matchesProvince = !filterProvince || addr.province === (provinces.find(p => p.code === filterProvince)?.name)
      const matchesMunicipality = !filterMunicipality || addr.municipalityCity === (municipalities.find(m => m.code === filterMunicipality)?.name)
      const matchesBarangay = !filterBarangay || addr.districtBarangayVillage === (barangays.find(b => b.code === filterBarangay)?.name)
      return matchesSearch && matchesProvince && matchesMunicipality && matchesBarangay
    })
  }, [leaders, search, filterProvince, filterMunicipality, filterBarangay, provinces, municipalities, barangays])

  const clearFilters = () => {
    setSearch('')
    setFilterProvince('')
    setFilterMunicipality('')
    setFilterBarangay('')
  }

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, filterProvince, filterMunicipality, filterBarangay])

  const totalPages = useMemo(() => {
    const pages = Math.ceil((filtered?.length || 0) / PAGE_SIZE)
    return pages > 0 ? pages : 1
  }, [filtered?.length])

  // Clamp current page when results shrink
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedFilteredLeaders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, currentPage])

  const deleteLeader = async (id) => {
    try {
      setDeleteLoading(true)
      await api.leaders.delete(id)
      toast.success('Leader deleted')
      // Update state instead of refetching
      setLeaders(prevLeaders => prevLeaders.filter(leader => leader._id !== id))
      setLeaderToDelete(null)
    } catch (e) {
      toast.error(e.message || 'Failed to delete leader')
    } finally {
      setDeleteLoading(false)
    }
  }

  const openNotifyDialog = (leader) => {
    setNotifyDialog({ open: true, leader })
    setNotificationMessage('')
  }

  const handleNotify = async () => {
    if (!notifyDialog.leader || !notificationMessage.trim()) {
      toast.error('Please enter a message to send')
      return
    }

    try {
      setNotifyLoading(true)
      const response = await api.leaders.notify(
        notifyDialog.leader._id,
        { message: notificationMessage.trim() }
      )

      if (response.success) {
        toast.success('Notification sent successfully!')
        setNotifyDialog({ open: false, leader: null })
        setNotificationMessage('')
      } else {
        toast.error('Failed to send notification: ' + response.message)
      }
    } catch (err) {
      console.error('Error sending notification:', err)
      toast.error('Failed to send notification: ' + err.message)
    } finally {
      setNotifyLoading(false)
    }
  }

  const openViewProfileDialog = (leader) => {
    setViewProfileDialog({ open: true, leader })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading leaders...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <div className="text-red-600 text-lg font-medium mb-2">Error Loading Data</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchLeaders}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg overflow-hidden">
      {/* Search and Filters */}
      <div className="mb-6 bg-cyan-50 rounded-lg p-4 border border-cyan-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Search className="w-4 h-4 inline mr-1" />
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              Province
            </label>
            <select
              value={filterProvince}
              onChange={(e) => { setFilterProvince(e.target.value); setFilterMunicipality(''); setFilterBarangay(''); setMunicipalities([]); setBarangays([]); fetchMunicipalities(e.target.value); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">All Provinces</option>
              {provinces.map(p => (
                <option key={p.code} value={p.code}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              Municipality
            </label>
            <select
              value={filterMunicipality}
              onChange={(e) => { setFilterMunicipality(e.target.value); setFilterBarangay(''); setBarangays([]); fetchBarangays(e.target.value); }}
              disabled={!filterProvince}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">All Municipalities</option>
              {municipalities.map(m => (
                <option key={m.code} value={m.code}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              Barangay
            </label>
            <select
              value={filterBarangay}
              onChange={(e) => setFilterBarangay(e.target.value)}
              disabled={!filterMunicipality}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">All Barangays</option>
              {barangays.map(b => (
                <option key={b.code} value={b.code}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={fetchLeaders} className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md text-sm">Search</Button>
            <Button onClick={clearFilters} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm">Clear</Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-cyan-500 text-white px-6 py-4">
          <div className="grid grid-cols-7 gap-4 font-medium text-sm">
            <div>Name</div>
            <div>Email</div>
            <div>Contact</div>
            <div>Address</div>
            <div>Actions</div>
          </div>
        </div>
                 <div className="divide-y divide-gray-200">
           {filtered.length === 0 ? (
             <div className="px-6 py-8 text-center text-gray-500">No leaders found</div>
           ) : (
             paginatedFilteredLeaders.map((l) => (
               <div key={l._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                 <div className="grid grid-cols-7 gap-4 text-sm items-center">
                   <div className="font-medium text-gray-900">{`${l.firstName} ${l.middleName ? l.middleName + ' ' : ''}${l.lastName}`}</div>
                   <div className="truncate text-gray-600" title={l.email}>{l.email}</div>
                   <div className="text-gray-600">{l.contactNumber || '-'}</div>
                   <div className="text-gray-600">{l.address?.districtBarangayVillage || '-'}, {l.address?.municipalityCity || '-'}</div>
                                       <div className="flex gap-2">
                      <Button
                        onClick={() => openViewProfileDialog(l)}
                        disabled={notifyLoading || deleteLoading}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button
                        onClick={() => navigate(`/admin/leaders/edit/${l._id}`)}
                        disabled={notifyLoading || deleteLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => openNotifyDialog(l)}
                        disabled={notifyLoading || deleteLoading}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Notify
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            onClick={() => setLeaderToDelete(l)}
                            disabled={notifyLoading || deleteLoading}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                       <AlertDialogContent>
                         <AlertDialogHeader>
                           <AlertDialogTitle>Delete Leader</AlertDialogTitle>
                           <AlertDialogDescription>
                             Are you sure you want to delete {leaderToDelete ? `${leaderToDelete.firstName} ${leaderToDelete.lastName}` : 'this leader'}?
                             This action cannot be undone.
                           </AlertDialogDescription>
                         </AlertDialogHeader>
                         <AlertDialogFooter>
                           <AlertDialogCancel onClick={() => setLeaderToDelete(null)}>
                             Cancel
                           </AlertDialogCancel>
                           <AlertDialogAction
                             onClick={() => deleteLeader(leaderToDelete?._id)}
                             disabled={deleteLoading}
                             className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                             {deleteLoading ? (
                               <div className="flex items-center justify-center">
                                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                 Deleting...
                               </div>
                             ) : (
                               'Delete'
                             )}
                           </AlertDialogAction>
                         </AlertDialogFooter>
                       </AlertDialogContent>
                     </AlertDialog>
                   </div>
                 </div>
               </div>
             ))
           )}
         </div>

         {/* Pagination */}
         {filtered.length > PAGE_SIZE && (
           <div className="px-6 py-4 flex items-center justify-between border-t bg-white">
             <div className="text-sm text-gray-600">
               Showing {(currentPage - 1) * PAGE_SIZE + 1}
               {' '}to {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
             </div>
             <div className="flex items-center gap-2">
               <button
                 className="px-3 py-1 text-sm rounded border disabled:opacity-50"
                 onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                 disabled={currentPage === 1}
               >
                 Previous
               </button>
               {Array.from({ length: totalPages }).map((_, i) => (
                 <button
                   key={i}
                   className={`px-3 py-1 text-sm rounded border ${currentPage === i + 1 ? 'bg-cyan-600 text-white border-cyan-600' : ''}`}
                   onClick={() => setCurrentPage(i + 1)}
                 >
                   {i + 1}
                 </button>
               ))}
               <button
                 className="px-3 py-1 text-sm rounded border disabled:opacity-50"
                 onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                 disabled={currentPage === totalPages}
               >
                 Next
               </button>
             </div>
           </div>
         )}

        {/* Summary Footer */}
        {!loading && filtered.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 border-t text-sm text-gray-700 flex justify-between">
            <span>Total Leaders: {filtered.length}</span>
            <div className="flex gap-4">
              <span>Municipalities: {[...new Set(filtered.map(l => l.address?.municipalityCity).filter(Boolean))].length}</span>
              <span>Barangays: {[...new Set(filtered.map(l => l.address?.districtBarangayVillage).filter(Boolean))].length}</span>
            </div>
          </div>
        )}
      </div>

      {/* Notify Dialog */}
      <AlertDialog open={notifyDialog.open} onOpenChange={(open) => {
        if (!open && !notifyLoading) {
          setNotifyDialog({ open: false, leader: null })
          setNotificationMessage('')
        }
      }}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-gray-900">
              Send Notification to Leader
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600 mt-2">
              Send a notification to {notifyDialog.leader ? `${notifyDialog.leader.firstName} ${notifyDialog.leader.lastName}` : 'this leader'}.
              The message will be sent via email and WhatsApp (if available).
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="mt-4">
            <CustomInput
              label="Message"
              name="message"
              type="textarea"
              placeholder="Enter your message here..."
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              required
              rows={4}
            />
          </div>

          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
            <AlertDialogCancel
              disabled={notifyLoading}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleNotify}
              disabled={notifyLoading}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {notifyLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                'Send Notification'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leader Profile Dialog */}
      <LeaderProfileDialog
        open={viewProfileDialog.open}
        leader={viewProfileDialog.leader}
        onClose={() => setViewProfileDialog({ open: false, leader: null })}
      />
    </div>
  )
}

export default LeaderTable



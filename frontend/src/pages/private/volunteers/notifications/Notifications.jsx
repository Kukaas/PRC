import PrivateLayout from '@/layout/PrivateLayout'
import React, { useEffect, useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { api } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [markingAll, setMarkingAll] = useState(false)
  const [marking, setMarking] = useState({})

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await api.notifications.getAll()
      // Defensive: ensure notifications is always an array
      const notifs = Array.isArray(res?.data?.notifications)
        ? res.data.notifications
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : []
      setNotifications(notifs)
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    setMarking((prev) => ({ ...prev, [id]: true }))
    try {
      await api.notifications.markAsRead(id)
      setNotifications((prev) => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    } finally {
      setMarking((prev) => ({ ...prev, [id]: false }))
    }
  }

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true)
    try {
      await api.notifications.markAllAsRead()
      setNotifications((prev) => prev.map(n => ({ ...n, isRead: true })))
    } finally {
      setMarkingAll(false)
    }
  }

  const filtered = {
    all: notifications,
    unread: notifications.filter(n => !n.isRead),
    read: notifications.filter(n => n.isRead),
  }

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-blue-50 w-full">
        <div className="p-2 sm:p-6 w-full">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
            <p className="text-gray-600 mt-1">View and manage your notifications</p>
          </div>

          {/* Tabs Section */}
          <Card className="w-full mt-4">
            <CardHeader>
              <CardTitle>Notification Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 bg-transparent h-auto p-0 gap-1">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-cyan-300 data-[state=active]:text-black py-2 px-3 text-xs sm:text-sm font-medium rounded-xl transition-all hover:bg-cyan-50 hover:text-cyan-700"
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value="unread"
                    className="data-[state=active]:bg-cyan-300 data-[state=active]:text-black py-2 px-3 text-xs sm:text-sm font-medium rounded-xl transition-all hover:bg-cyan-50 hover:text-cyan-700"
                  >
                    Unread
                  </TabsTrigger>
                  <TabsTrigger
                    value="read"
                    className="data-[state=active]:bg-cyan-300 data-[state=active]:text-black py-2 px-3 text-xs sm:text-sm font-medium rounded-xl transition-all hover:bg-cyan-50 hover:text-cyan-700"
                  >
                    Read
                  </TabsTrigger>
                </TabsList>

                <div className="flex justify-end mb-2 px-2 sm:px-4 pt-4">
                  {activeTab === 'unread' && filtered.unread.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-cyan-600 text-cyan-700 hover:bg-cyan-50 hover:text-cyan-900 rounded-lg px-4 py-2 transition-colors"
                      onClick={handleMarkAllAsRead}
                      disabled={markingAll}
                    >
                      {markingAll ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                          Marking...
                        </>
                      ) : (
                        "Mark all as read"
                      )}
                    </Button>
                  )}
                </div>

                {['all', 'unread', 'read'].map(tab => (
                  <TabsContent key={tab} value={tab} className="px-0 sm:px-4 pb-6 pt-0">
                    {loading ? (
                      <div className='flex items-center justify-center p-10'>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    </div>
                    ) : filtered[tab].length === 0 ? (
                      <div className='text-center py-8 text-gray-400'>No notifications.</div>
                    ) : (
                      <div className="space-y-4">
                        {filtered[tab].map(n => (
                          <Card
                            key={n._id}
                            className={`border w-full ${n.isRead ? 'bg-gray-50' : 'bg-cyan-50 border-cyan-200'}`}
                          >
                            <CardHeader className="pb-2 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                              <CardTitle className={`text-base font-semibold ${n.isRead ? 'text-gray-700' : 'text-cyan-800'} break-words`}>
                                {n.title}
                              </CardTitle>
                              {!n.isRead && (
                                <span className='ml-0 sm:ml-2 px-2 py-0.5 rounded-full text-xs bg-cyan-600 text-white'>
                                  Unread
                                </span>
                              )}
                            </CardHeader>
                            <CardContent className="space-y-1">
                              <div className="text-xs sm:text-sm text-gray-700 mb-1 break-words">{n.message}</div>
                              <div className="text-xs text-gray-400 mb-1">
                                {formatDate(n.createdAt)}
                                {" • "}
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              {!n.isRead && (
                                <Button
                                  size="sm"
                                  className="w-full sm:w-auto mt-2 bg-cyan-600 text-white hover:bg-cyan-700 rounded-lg transition-colors"
                                  onClick={() => handleMarkAsRead(n._id)}
                                  disabled={marking[n._id]}
                                >
                                  {marking[n._id] ? (
                                    <>
                                      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                      Marking...
                                    </>
                                  ) : (
                                    "Mark as read"
                                  )}
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </PrivateLayout>
  )
}

export default Notifications

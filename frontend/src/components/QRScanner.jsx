import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react'
import jsQR from 'jsqr'
import { useIsMobile } from '@/hooks/use-mobile'

const QRScanner = ({ onScan, onClose, scanningAction = 'timeIn' }) => {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [availableCameras, setAvailableCameras] = useState([])
  const [selectedCamera, setSelectedCamera] = useState('')
  const [scanAttempts, setScanAttempts] = useState(0)
  const isMobile = useIsMobile()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const animationFrameRef = useRef(null)
  const scanningRef = useRef(false)
  const initializedRef = useRef(false)

  const getAvailableCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      setAvailableCameras(videoDevices)

      if (videoDevices.length > 0) {
        let preferredCamera = videoDevices[0]

        if (isMobile) {
          // On mobile, prefer back camera
          const backCamera = videoDevices.find(device =>
            device.label.toLowerCase().includes('back') ||
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('environment') ||
            device.label.toLowerCase().includes('main') ||
            device.label.toLowerCase().includes('wide')
          )
          if (backCamera) {
            preferredCamera = backCamera
          } else if (videoDevices.length > 1) {
            // Use the last camera (often the back camera on mobile)
            preferredCamera = videoDevices[videoDevices.length - 1]
          }
        } else {
          // On laptop/desktop, prefer front camera
          const frontCamera = videoDevices.find(device =>
            device.label.toLowerCase().includes('front') ||
            device.label.toLowerCase().includes('user') ||
            device.label.toLowerCase().includes('selfie')
          )
          if (frontCamera) {
            preferredCamera = frontCamera
          }
        }

        setSelectedCamera(preferredCamera.deviceId)
        return preferredCamera
      }
      return null
    } catch (error) {
      console.error('Error getting cameras:', error)
      return null
    }
  }, [isMobile])

  const startCamera = useCallback(async (cameraId = null) => {
    try {
      setError('')
      setSuccess('')
      setScanAttempts(0)

      // Stop any existing camera first
      if (streamRef.current) {
        stopCamera()
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      let stream
      const targetCameraId = cameraId || selectedCamera

      if (isMobile) {
        // For mobile, prioritize back camera
        try {
          if (targetCameraId) {
            stream = await navigator.mediaDevices.getUserMedia({
              video: {
                deviceId: { exact: targetCameraId },
                width: { ideal: 1280 },
                height: { ideal: 720 }
              }
            })
          } else {
            // Try environment (back camera) directly
            stream = await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
              }
            })
          }
        } catch (error) {
          // Fallback to environment facing mode
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          })
        }
      } else {
        // For desktop, use front camera
        try {
          if (targetCameraId) {
            stream = await navigator.mediaDevices.getUserMedia({
              video: {
                deviceId: { exact: targetCameraId },
                width: { ideal: 1280 },
                height: { ideal: 720 }
              }
            })
          } else {
            stream = await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
              }
            })
          }
        } catch (error) {
          // Fallback to user facing mode
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          })
        }
      }

      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream
        streamRef.current = stream

        videoRef.current.onloadedmetadata = () => {
          setIsScanning(true)
          scanningRef.current = true
          scanQRCode()
        }

        videoRef.current.onerror = () => {
          setError('Video stream error. Please try again.')
          setIsScanning(false)
        }
      }
    } catch (err) {
      console.error('Camera error:', err)
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permissions and try again.')
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please check your camera connection.')
      } else {
        setError(`Unable to access camera: ${err.message}`)
      }
    }
  }, [isMobile, selectedCamera])

  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
    scanningRef.current = false
  }, [])

  const forceRefreshCamera = useCallback(async () => {
    stopCamera()
    await new Promise(resolve => setTimeout(resolve, 200))
    const preferredCamera = await getAvailableCameras()
    if (preferredCamera) {
      await startCamera(preferredCamera.deviceId)
    }
  }, [stopCamera, getAvailableCameras, startCamera])

  const handleCameraChange = useCallback(async (newCameraId) => {
    setSelectedCamera(newCameraId)
    if (isScanning) {
      await startCamera(newCameraId)
    }
  }, [isScanning, startCamera])

  const scanQRCode = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !scanningRef.current) {
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(scanQRCode)
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    setScanAttempts(prev => prev + 1)
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    })

    if (code) {
      handleQRCodeDetected(code.data)
      return
    }

    if (scanningRef.current) {
      animationFrameRef.current = requestAnimationFrame(scanQRCode)
    }
  }, [])

  const handleQRCodeDetected = useCallback(async (qrData) => {
    try {
      setIsProcessing(true)
      setError('')
      scanningRef.current = false

      let parsedData
      try {
        parsedData = JSON.parse(qrData)
      } catch (parseError) {
        setError('Invalid QR code format. Please try again.')
        return
      }

      if (!parsedData.userId || !parsedData.name) {
        setError('QR code is missing required information.')
        return
      }

      setSuccess(`QR Code detected for ${parsedData.name}`)
      stopCamera()

      setTimeout(() => {
        onScan(qrData)
      }, 1000)

    } catch (error) {
      setError('Error processing QR code. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }, [onScan, stopCamera])

  // Initialize camera on mount
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true
      const initCamera = async () => {
        await getAvailableCameras()
        await startCamera()
      }
      initCamera()
    }
  }, [getAvailableCameras, startCamera])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          Scan QR Code for {scanningAction === 'timeIn' ? 'Time In' : 'Time Out'}
        </h3>
        <Button onClick={onClose} variant="ghost" size="sm">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Device Type Indicator */}
      <div className="mb-4 p-2 bg-gray-100 rounded-md text-sm text-gray-600">
        <strong>Device:</strong> {isMobile ? 'Mobile (Back Camera)' : 'Laptop/Desktop (Front Camera)'}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      <div className="relative bg-black rounded-lg overflow-hidden mb-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-64 object-cover"
        />
        <canvas
          ref={canvasRef}
          className="hidden"
        />
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="border-2 border-white rounded-lg p-2">
              <div className="w-48 h-48 border-2 border-white rounded-lg relative">
                <div className="absolute inset-0 border-2 border-green-400 animate-pulse"></div>
                <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-green-400"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-green-400"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-green-400"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-green-400"></div>
              </div>
            </div>
          </div>
        )}
        {isProcessing && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-700">Processing QR Code...</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {/* Camera Selection */}
        {availableCameras.length > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Camera:
            </label>
            <select
              value={selectedCamera}
              onChange={(e) => handleCameraChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              disabled={isScanning}
            >
              {availableCameras.map((camera) => (
                <option key={camera.deviceId} value={camera.deviceId}>
                  {camera.label || `Camera ${camera.deviceId.slice(0, 8)}...`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Helpful tips based on device type */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-700">
            {isMobile ? (
              <>
                <strong>📱 Mobile Tip:</strong> Hold the QR code about 6-12 inches away from your back camera.
                Make sure the QR code is well-lit and clearly visible. The back camera provides better focus for scanning.
              </>
            ) : (
              <>
                <strong>💻 Laptop Tip:</strong> Hold the QR code close to your front camera (about 6-12 inches away).
                Make sure the QR code is well-lit and clearly visible. The front camera is ideal for close-up scanning.
              </>
            )}
          </p>
        </div>

        {/* Automatic Time Adjustment Info */}
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
          <p className="text-sm text-amber-700">
            <strong>⏰ Automatic Time Adjustment:</strong>
            <br />
            • <strong>Time In:</strong> If scanned before event starts, will automatically record event start time
            <br />
            • <strong>Time Out:</strong> If scanned more than 3 minutes after event ends, will automatically record event end time
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => startCamera()}
            className="flex-1"
            disabled={isScanning || isProcessing}
          >
            <Camera className="w-4 h-4 mr-2" />
            Start Camera
          </Button>
          <Button
            onClick={stopCamera}
            variant="outline"
            className="flex-1"
            disabled={!isScanning || isProcessing}
          >
            Stop Camera
          </Button>
        </div>

        {/* Refresh Camera Button - More Visible Location */}
        <div className="flex gap-2">
          <Button
            onClick={forceRefreshCamera}
            variant="outline"
            className="flex-1"
            disabled={isProcessing}
          >
            🔄 Refresh Camera
          </Button>
        </div>
      </div>
    </div>
  )
}

export default QRScanner

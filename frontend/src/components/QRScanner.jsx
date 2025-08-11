import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react'
import jsQR from 'jsqr'

const QRScanner = ({ onScan, onClose, scanningAction = 'timeIn' }) => {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [availableCameras, setAvailableCameras] = useState([])
  const [selectedCamera, setSelectedCamera] = useState('')
  const [scanAttempts, setScanAttempts] = useState(0)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const animationFrameRef = useRef(null)
  const scanningRef = useRef(false) // Use ref to track scanning state

  const getAvailableCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      setAvailableCameras(videoDevices)

      // Auto-select first camera
      if (videoDevices.length > 0) {
        setSelectedCamera(videoDevices[0].deviceId)
      }

      return videoDevices
    } catch (error) {
      return []
    }
  }

  const startCamera = async () => {
    try {
      setError('')
      setSuccess('')
      setScanAttempts(0) // Reset scan attempts

      // Get available cameras first
      const cameras = await getAvailableCameras()
      if (cameras.length === 0) {
        setError('No cameras found')
        return
      }

      // Use selected camera or default to first one
      const cameraId = selectedCamera || cameras[0].deviceId

      let stream
      try {
        // Try to use specific camera if selected
        if (cameraId) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: cameraId },
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          })
        } else {
          // Fallback to user-facing camera (better for laptop scanning)
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          })
        }
      } catch (specificCameraError) {
        // Fallback to user-facing camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        })
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream

        // Start scanning when video is loaded
        videoRef.current.onloadedmetadata = () => {
          // Set scanning state AFTER video is ready
          setIsScanning(true)
          scanningRef.current = true // Set ref as well
          // Start scanning immediately
          scanQRCode()
        }

        // Add error handling for video
        videoRef.current.onerror = (error) => {
          setError('Video stream error. Please try again.')
          setIsScanning(false)
        }
      }
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permissions and try again.')
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please check your camera connection.')
      } else {
        setError(`Unable to access camera: ${err.message}`)
      }
    }
  }

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
    scanningRef.current = false // Update ref as well
  }

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) {
      return
    }

    if (!scanningRef.current) {
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    // Check if video is ready
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(scanQRCode)
      return
    }

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Increment scan attempts for debugging
    setScanAttempts(prev => prev + 1)

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Get image data for QR detection
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

    // Scan for QR code
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    })

    if (code) {
      handleQRCodeDetected(code.data)
      return
    }

    // Continue scanning only if still scanning
    if (scanningRef.current) {
      animationFrameRef.current = requestAnimationFrame(scanQRCode)
    }
  }

  const handleQRCodeDetected = async (qrData) => {
    try {
      setIsProcessing(true)
      setError('')
      scanningRef.current = false // Stop scanning immediately

      // Validate QR data format
      let parsedData
      try {
        parsedData = JSON.parse(qrData)
      } catch (parseError) {
        setError('Invalid QR code format. Please try again.')
        return
      }

      // Basic validation
      if (!parsedData.userId || !parsedData.name) {
        setError('QR code is missing required information.')
        return
      }

      // Show success message
      setSuccess(`QR Code detected for ${parsedData.name}`)

      // Stop camera
      stopCamera()

      // Wait a moment to show success message, then process
      setTimeout(() => {
        onScan(qrData)
      }, 1000)

    } catch (error) {
      setError('Error processing QR code. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleManualInput = (e) => {
    const value = e.target.value.trim()
    if (value) {
      try {
        // Validate JSON format
        JSON.parse(value)
        onScan(value)
      } catch (error) {
        setError('Invalid JSON format. Please check your input.')
      }
    }
  }

  const handleCameraChange = async (newCameraId) => {
    setSelectedCamera(newCameraId)
    if (isScanning) {
      // Restart camera with new selection
      stopCamera()
      setTimeout(() => {
        startCamera()
      }, 100)
    }
  }

  useEffect(() => {
    getAvailableCameras()
    startCamera()
    return () => stopCamera()
  }, [])

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
                {/* Scanning animation */}
                <div className="absolute inset-0 border-2 border-green-400 animate-pulse"></div>
                {/* Corner indicators */}
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

        {/* Helpful tips for laptop users */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-700">
            <strong>💡 Tip:</strong> For laptop users, hold the QR code close to your camera (about 6-12 inches away).
            Make sure the QR code is well-lit and clearly visible.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Or enter QR data manually:
          </label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-md text-sm"
            placeholder="Paste QR code data here (JSON format)..."
            rows={3}
            onChange={handleManualInput}
            disabled={isProcessing}
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={startCamera}
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

        {/* Manual Test Button */}
        <div className="text-center">
          <Button
            onClick={() => {
              const testQRData = JSON.stringify({
                userId: 'test123',
                activityId: 'test456',
                name: 'Test User',
                contactNumber: '1234567890',
                email: 'test@example.com',
                activityTitle: 'Test Activity',
                activityDate: '2024-01-01',
                version: 1
              })
              onScan(testQRData)
            }}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Test with Sample QR Data
          </Button>
        </div>
      </div>
    </div>
  )
}

export default QRScanner

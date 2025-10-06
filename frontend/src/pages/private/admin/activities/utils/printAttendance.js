import logo from '../../../../../assets/logo.png'

const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return String(dateString)
  }
}

const formatTime = (timeString) => {
  if (!timeString) return ''
  try {
    const [hours, minutes] = String(timeString).split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    const displayMinutes = Number.isNaN(minutes) ? '00' : String(minutes).padStart(2, '0')
    return `${displayHours}:${displayMinutes} ${period}`
  } catch {
    return String(timeString)
  }
}

export const printAttendanceReport = (activity, attendanceData = []) => {
  if (!activity) return
  const title = activity.title || 'Event'
  const dateText = formatDate(activity.date)
  const timeText = [formatTime(activity.timeFrom), formatTime(activity.timeTo)].filter(Boolean).join(' - ')
  const resolvedLogo = typeof logo === 'string'
    ? (logo.startsWith('http') || logo.startsWith('/') ? logo : `${window.location.origin}${logo}`)
    : ''

  const locationText = (() => {
    const loc = activity?.location || {}
    const parts = [loc.exactLocation, loc.barangay, loc.municipality, loc.province].filter(Boolean)
    if (parts.length === 0) return ''
    return parts.join(', ')
  })()

  const rowsHtml = attendanceData.map((p, index) => {
    const timeIn = p.timeIn ? new Date(p.timeIn).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }) : ''
    const timeOut = p.timeOut ? new Date(p.timeOut).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }) : ''
    return `
      <tr>
        <td>${index + 1}</td>
        <td>${p.name || ''}</td>
        <td>${p.contactNumber || ''}</td>
        <td>${timeIn}</td>
        <td>${timeOut}</td>
        <td>${p.status || ''}</td>
      </tr>
    `
  }).join('')

  const styles = `
    <style>
      * { box-sizing: border-box; }
      body { font-family: Arial, Helvetica, sans-serif; padding: 24px; color: #111827; }
      .letterhead { display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 12px; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 12px; text-align: center; }
      .logo { height: 80px; width: 80px; object-fit: contain; display: block; }
      .org-lines { line-height: 1.25; text-align: center; }
      .org-name { font-size: 20px; font-weight: 800; color: #0b2e59; letter-spacing: 0.5px; }
      .chapter { font-size: 15px; font-weight: 700; margin-top: 2px; }
      .contact { font-size: 11px; color: #374151; margin-top: 2px; }
      .event-header { text-align: center; margin: 10px 0 16px; }
      .event-header .att { font-size: 18px; font-weight: 800; text-decoration: underline; }
      .event-header .evt-title { font-size: 16px; font-weight: 700; margin-top: 4px; }
      .event-header .evt-meta { font-size: 12px; color: #374151; margin-top: 2px; }
      .event-header .evt-where { font-size: 12px; color: #111827; margin-top: 2px; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 12px; }
      th { background: #f3f4f6; text-align: left; }
      tfoot td { border: none; padding-top: 12px; font-size: 12px; color: #6b7280; }
      @media print {
        .no-print { display: none !important; }
        body { padding: 0; }
      }
    </style>
  `

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <base href="${window.location.origin}">
        <title>${title} - Attendance Report</title>
        ${styles}
      </head>
      <body>
        <div class="letterhead">
          <img class="logo" src="${resolvedLogo}" alt="PRC Logo" />
          <div class="org-lines">
            <div class="org-name">PHILIPPINE RED CROSS</div>
            <div class="chapter">MARINDUQUE CHAPTER</div>
            <div class="contact">Kasilag St., Brgy. Isok I, Boac, Marinduque</div>
            <div class="contact">Telefax: (042) 332-0733</div>
            <div class="contact">Cell. No. +639506131305</div>
            <div class="contact">Email: marinduque@redcross.org.ph</div>
          </div>
        </div>

        <div class="event-header">
          <div class="att">ATTENDANCE</div>
          <div class="evt-title">${title}</div>
          <div class="evt-meta">${dateText}${timeText ? ' • ' + timeText : ''}</div>
          ${locationText ? `<div class="evt-where">${locationText}</div>` : ''}
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 48px;">#</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || '<tr><td colspan="6" style="text-align:center; color:#6b7280;">No attendance records</td></tr>'}
          </tbody>
        </table>
        <div class="no-print" style="margin-top:16px;">
          <button onclick="window.print()" style="padding:8px 12px; background:#0891b2; color:white; border:none; border-radius:4px;">Print</button>
        </div>
        <script>
          (function(){
            function imagesLoaded() {
              var imgs = Array.from(document.images || []);
              if (imgs.length === 0) return Promise.resolve();
              return Promise.all(imgs.map(function(img){
                return img.complete ? Promise.resolve() : new Promise(function(res){ img.onload = img.onerror = res; });
              }));
            }
            window.addEventListener('load', function(){
              imagesLoaded().then(function(){
                setTimeout(function(){ window.focus(); window.print(); }, 200);
              });
            });
          })();
        </script>
      </body>
    </html>
  `

  // Prefer opening a blank tab immediately (more reliable under popup blockers)
  const opened = window.open('', '_blank')
  if (opened) {
    opened.document.open()
    opened.document.write(html)
    opened.document.close()
    opened.focus();
    setTimeout(() => { opened.print(); }, 150)
    return
  }
  // Fallback: try blob URL
  try {
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const openedBlob = window.open(url, '_blank')
    if (!openedBlob) return
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } catch (err) {
    // Final fallback: hidden iframe (bypasses popup blockers)
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    document.body.appendChild(iframe)
    const doc = iframe.contentWindow?.document || iframe.contentDocument
    if (!doc) return
    doc.open()
    doc.write(html)
    doc.close()
    setTimeout(() => {
      iframe.contentWindow?.focus(); iframe.contentWindow?.print(); { /* ignore */ }
      document.body.removeChild(iframe)
    }, 200)
  }
}

export default printAttendanceReport



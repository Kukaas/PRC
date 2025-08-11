import logo from '../../../../../assets/logo.png'

const resolveLogo = () => {
  try {
    if (typeof logo === 'string') {
      return (logo.startsWith('http') || logo.startsWith('/')) ? logo : `${window.location.origin}${logo}`
    }
    return ''
  } catch {
    return ''
  }
}

const escapeHtml = (str) => String(str || '').replace(/[&<>]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[s]))

export const printVolunteerHoursReport = ({ year, rows = [], filters = {} }) => {
  const resolvedLogo = resolveLogo()
  const generatedOn = new Date().toLocaleString()

  const filterChips = (() => {
    const chips = []
    if (filters.search) chips.push(`Search: ${escapeHtml(filters.search)}`)
    if (filters.barangay) chips.push(`Barangay: ${escapeHtml(filters.barangay)}`)
    if (filters.municipality) chips.push(`Municipality: ${escapeHtml(filters.municipality)}`)
    if (filters.service) chips.push(`Service: ${escapeHtml(filters.service)}`)
    if (filters.status) chips.push(`Status: ${escapeHtml(filters.status)}`)
    chips.push(`Year: ${year}`)
    return chips.join(' • ')
  })()

  const rowsHtml = rows.map((r, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${escapeHtml(r.name)}</td>
      <td>${escapeHtml([r.address?.barangay, r.address?.municipality].filter(Boolean).join(', '))}</td>
      <td>${escapeHtml((Array.isArray(r.services) ? r.services : []).join(', '))}</td>
      <td style="text-align:right;">${Math.round(Number(r.hours || 0))}</td>
      <td>${escapeHtml(r.contactNumber || '')}</td>
      <td>${escapeHtml(r.status || '')}</td>
    </tr>
  `).join('')

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
      .title { text-align: center; margin: 14px 0; font-size: 18px; font-weight: 800; text-decoration: underline; }
      .meta { text-align: center; font-size: 12px; color: #374151; margin-top: 4px; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 12px; }
      th { background: #f3f4f6; text-align: left; }
      tfoot td { border: none; padding-top: 12px; font-size: 12px; color: #6b7280; }
      @media print { .no-print { display: none !important; } body { padding: 0; } }
    </style>
  `

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <base href="${window.location.origin}">
        <title>Volunteer Hours Report - ${year}</title>
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
        <div class="title">VOLUNTEER HOURS REPORT (${year})</div>
        <div class="meta">${escapeHtml(filterChips)} • Generated: ${escapeHtml(generatedOn)}</div>
        <table>
          <thead>
            <tr>
              <th style="width: 48px;">#</th>
              <th>Name</th>
              <th>Address</th>
              <th>Services</th>
              <th style="width: 100px; text-align:right;">Hours</th>
              <th>Contact</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || '<tr><td colspan="7" style="text-align:center; color:#6b7280;">No records</td></tr>'}
          </tbody>
        </table>
        <div class="no-print" style="margin-top:16px;">
          <button onclick="window.print()" style="padding:8px 12px; background:#0891b2; color:white; border:none; border-radius:4px;">Print</button>
        </div>
        <script>
          (function(){
            function imagesLoaded(){
              var imgs = Array.from(document.images || []);
              if(imgs.length === 0) return Promise.resolve();
              return Promise.all(imgs.map(function(img){return img.complete?Promise.resolve():new Promise(function(res){img.onload=img.onerror=res;});}));
            }
            window.addEventListener('load', function(){ imagesLoaded().then(function(){ setTimeout(function(){ window.focus(); window.print(); }, 200); }); });
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
    opened.focus()
    setTimeout(() => {  opened.print() }, 150)
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
       iframe.contentWindow?.focus(); iframe.contentWindow?.print();
       document.body.removeChild(iframe);
      }, 200)
  }
}

export default printVolunteerHoursReport



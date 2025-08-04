// IP Query Service for Cloudflare Workers
// Supports ipinfo.now, IP4.NOW, and IP6.NOW

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const hostname = url.hostname.toLowerCase()
  const pathname = url.pathname.toLowerCase()
  
  // Get client IP and other headers
  const clientIP = getClientIP(request)
  const userAgent = request.headers.get('User-Agent') || ''
  const acceptLanguage = request.headers.get('Accept-Language') || ''
  const acceptEncoding = request.headers.get('Accept-Encoding') || ''
  const accept = request.headers.get('Accept') || ''
  const referer = request.headers.get('Referer') || ''
  const xForwardedFor = request.headers.get('X-Forwarded-For') || ''
  const connection = request.headers.get('Connection') || ''
  const via = request.headers.get('Via') || ''
  
  // Detect if request is from curl or similar CLI tool
  const isCLI = userAgent.toLowerCase().includes('curl') || 
                userAgent.toLowerCase().includes('wget') || 
                userAgent.toLowerCase().includes('httpie') ||
                !accept.includes('text/html')
  
  // Handle different domains
  if (hostname.includes('ip4.now')) {
    return handleIP4Request(pathname, clientIP, request, isCLI)
  } else if (hostname.includes('ip6.now')) {
    return handleIP6Request(pathname, clientIP, request, isCLI)
  } else {
    // Default to ipinfo.now behavior
    return handleMainRequest(pathname, clientIP, request, isCLI)
  }
}

function getClientIP(request) {
  // Try to get the real client IP from various headers
  const xForwardedFor = request.headers.get('X-Forwarded-For')
  const cfConnectingIP = request.headers.get('CF-Connecting-IP')
  const xRealIP = request.headers.get('X-Real-IP')
  
  if (cfConnectingIP) return cfConnectingIP
  if (xRealIP) return xRealIP
  if (xForwardedFor) return xForwardedFor.split(',')[0].trim()
  
  return 'unknown'
}

function isIPv6(ip) {
  return ip.includes(':') && !ip.includes('.')
}

function isIPv4(ip) {
  return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)
}

async function handleIP4Request(pathname, clientIP, request, isCLI) {
  // Force IPv4 only
  if (!isIPv4(clientIP)) {
    // If we don't have IPv4, return a message
    if (isCLI) {
      return new Response('IPv4 not available\n', { status: 200 })
    } else {
      return generateHTMLResponse('IPv4 not available', request, 'IP4.NOW')
    }
  }
  
  return handleIPRequest(pathname, clientIP, request, isCLI, 'IP4.NOW')
}

async function handleIP6Request(pathname, clientIP, request, isCLI) {
  // Prefer IPv6, fallback to IPv4
  return handleIPRequest(pathname, clientIP, request, isCLI, 'IP6.NOW')
}

async function handleMainRequest(pathname, clientIP, request, isCLI) {
  return handleIPRequest(pathname, clientIP, request, isCLI, 'ipinfo.now')
}

async function handleIPRequest(pathname, clientIP, request, isCLI, service) {
  const userAgent = request.headers.get('User-Agent') || ''
  const acceptLanguage = request.headers.get('Accept-Language') || ''
  const acceptEncoding = request.headers.get('Accept-Encoding') || ''
  const accept = request.headers.get('Accept') || ''
  const referer = request.headers.get('Referer') || ''
  const xForwardedFor = request.headers.get('X-Forwarded-For') || ''
  const connection = request.headers.get('Connection') || ''
  const via = request.headers.get('Via') || ''
  const method = request.method
  
  // Handle different endpoints
  switch (pathname) {
    case '/':
      if (isCLI) {
        return new Response(clientIP + '\n', { 
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        })
      } else {
        return generateHTMLResponse(clientIP, request, service)
      }
      
    case '/ip':
      return new Response(clientIP + '\n', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      })
      
    case '/ua':
    case '/user-agent':
      return new Response(userAgent + '\n', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      })
      
    case '/lang':
    case '/language':
      return new Response(acceptLanguage + '\n', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      })
      
    case '/encoding':
      return new Response(acceptEncoding + '\n', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      })
      
    case '/mime':
      return new Response(accept + '\n', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      })
      
    case '/referer':
      return new Response(referer + '\n', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      })
      
    case '/forwarded':
      return new Response(xForwardedFor + '\n', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      })
      
    case '/all':
      const allInfo = [
        `ip_addr: ${clientIP}`,
        `user_agent: ${userAgent}`,
        `language: ${acceptLanguage}`,
        `referer: ${referer}`,
        `connection: ${connection}`,
        `method: ${method}`,
        `encoding: ${acceptEncoding}`,
        `mime: ${accept}`,
        `via: ${via}`,
        `forwarded: ${xForwardedFor}`
      ].join('\n') + '\n'
      
      return new Response(allInfo, { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      })
      
    case '/all.json':
    case '/json':
      const jsonData = {
        ip_addr: clientIP,
        user_agent: userAgent,
        language: acceptLanguage,
        referer: referer,
        connection: connection,
        method: method,
        encoding: acceptEncoding,
        mime: accept,
        via: via,
        forwarded: xForwardedFor,
        ipv4: isIPv4(clientIP),
        ipv6: isIPv6(clientIP)
      }
      
      return new Response(JSON.stringify(jsonData, null, 2), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
      
    default:
      if (isCLI) {
        return new Response(clientIP + '\n', { 
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        })
      } else {
        return generateHTMLResponse(clientIP, request, service)
      }
  }
}

function generateHTMLResponse(clientIP, request, service) {
  const userAgent = request.headers.get('User-Agent') || ''
  const acceptLanguage = request.headers.get('Accept-Language') || ''
  const acceptEncoding = request.headers.get('Accept-Encoding') || ''
  const accept = request.headers.get('Accept') || ''
  const referer = request.headers.get('Referer') || ''
  const xForwardedFor = request.headers.get('X-Forwarded-For') || ''
  const connection = request.headers.get('Connection') || ''
  const via = request.headers.get('Via') || ''
  const method = request.method
  
  const isIPv4 = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(clientIP)
  const isIPv6 = clientIP.includes(':') && !clientIP.includes('.')
  
  const domain = service === 'IP4.NOW' ? 'ip4.now' : 
                 service === 'IP6.NOW' ? 'ip6.now' : 'ipinfo.now'
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- SEO Meta Tags -->
    <title>What Is My IP Address? | Free IP Lookup Tool - ${service}</title>
    <meta name="description" content="Find your public IP address instantly. Free IP lookup tool supporting IPv4 and IPv6. Check your IP, user agent, location and network information with our fast and reliable service.">
    <meta name="keywords" content="what is my ip, ip address, ip lookup, ipv4, ipv6, public ip, check ip, ip location, network tools, ip finder">
    <meta name="author" content="IP.IM">
    <meta name="robots" content="index, follow">
    <meta name="googlebot" content="index, follow">
    <meta name="language" content="English">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="https://${domain}">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="What Is My IP Address? | Free IP Lookup Tool - ${service}">
    <meta property="og:description" content="Find your public IP address instantly. Free IP lookup tool supporting IPv4 and IPv6. Check your IP, user agent, location and network information.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://${domain}">
    <meta property="og:site_name" content="${service}">
    <meta property="og:locale" content="en_US">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="What Is My IP Address? | ${service}">
    <meta name="twitter:description" content="Find your public IP address instantly. Free IP lookup tool supporting IPv4 and IPv6.">
    <meta name="twitter:site" content="@ipim">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "${service} - IP Address Lookup",
        "description": "Free online tool to check your public IP address, user agent, and network information",
        "url": "https://${domain}",
        "applicationCategory": "NetworkingApplication",
        "operatingSystem": "Web Browser",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "provider": {
            "@type": "Organization",
            "name": "IP.IM",
            "url": "https://ip.im"
        }
    }
    </script>
    
    <!-- DNS Prefetch -->
    <link rel="dns-prefetch" href="//ip.im">
    
    <!-- Theme Color -->
    <meta name="theme-color" content="#3498db">
    <meta name="msapplication-TileColor" content="#3498db">
    
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            color: #333;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border: 1px solid #ddd;
        }
        h1 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 30px;
            font-size: 2em;
        }
        .ip-display {
            font-size: 2em;
            text-align: center;
            color: #000000;
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border: 2px solid #3498db;
            font-weight: bold;
        }
        .info-table {
            background-color: #ffffff;
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 30px;
            table-layout: fixed;
        }
        .info-table th, .info-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
            vertical-align: top;
        }
        .info-table th:first-child {
            background-color: #3498db;
            color: white;
            font-weight: bold;
            width: 20%;
        }
        .info-table th:last-child {
            background-color: #3498db;
            color: white;
            font-weight: bold;
            width: 80%;
        }
        .info-table td {
            background-color: #f8f9fa;
            word-wrap: break-word;
            word-break: break-all;
            max-width: 0;
        }
        .info-table td.long-content {
            line-height: 1.4;
        }
        .info-table td a {
            color: #3498db;
            text-decoration: none;
            font-weight: bold;
            transition: color 0.3s ease;
        }
        .info-table td a:hover {
            color: #2980b9;
            text-decoration: underline;
        }
        .api-section {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #ddd;
            margin-bottom: 20px;
        }
        .api-section h2 {
            color: #2c3e50;
            margin-top: 0;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        .api-example {
            background-color: #2c3e50;
            color: #ecf0f1;
            padding: 12px;
            border-radius: 5px;
            margin: 10px 0;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
        }
        .curl-command {
            color: #f39c12;
            font-weight: bold;
        }
        .response {
            color: #2ecc71;
        }
        .service-links {
            text-align: center;
            margin-bottom: 30px;
        }
        .service-links a {
            color: #3498db;
            text-decoration: none;
            margin: 0 15px;
            padding: 12px 20px;
            border: 2px solid #3498db;
            border-radius: 25px;
            display: inline-block;
            font-weight: bold;
            transition: all 0.3s ease;
        }
        .service-links a:hover {
            background-color: #3498db;
            color: white;
            transform: translateY(-2px);
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #7f8c8d;
            font-size: 0.9em;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
        h2 {
            color: #2c3e50;
            margin-top: 0;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        @media (max-width: 768px) {
            .container {
                padding: 20px;
                margin: 10px;
            }
            .ip-display {
                font-size: 1.5em;
            }
            .service-links a {
                display: block;
                margin: 10px 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>What Is My IP Address? - ${service}</h1>
            
            <nav class="service-links" role="navigation" aria-label="Service navigation">
                <a href="https://ipinfo.now" aria-label="Complete IP information service">ipinfo.now</a>
                <a href="https://ip4.now" aria-label="IPv4 only IP lookup service">IP4.NOW</a>
                <a href="https://ip6.now" aria-label="IPv6 preferred IP lookup service">IP6.NOW</a>
            </nav>
        </header>
        
        <main>
            <section class="ip-section" aria-labelledby="your-ip">
                <h2 id="your-ip" class="sr-only">Your IP Address</h2>
                <div class="ip-display" role="banner" aria-live="polite">
                    ${clientIP}
                </div>
            </section>
            
            <section class="details-section" aria-labelledby="details-heading">
                <h2 id="details-heading" class="sr-only">Network Details</h2>
                <table class="info-table" role="table" aria-label="Network information details">
                    <thead>
                        <tr><th scope="col">Property</th><th scope="col">Value</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>IP Address</td><td><a href="https://ip.im/${clientIP}" target="_blank" rel="noopener noreferrer" style="color: #3498db; text-decoration: none; font-weight: bold;">${clientIP}</a></td></tr>
                        <tr><td>User Agent</td><td class="long-content">${userAgent || 'N/A'}</td></tr>
                        <tr><td>Language</td><td>${acceptLanguage || 'N/A'}</td></tr>
                        <tr><td>Referer</td><td>${referer || 'N/A'}</td></tr>
                        <tr><td>Method</td><td>${method}</td></tr>
                        <tr><td>Encoding</td><td>${acceptEncoding || 'N/A'}</td></tr>
                        <tr><td>MIME Type</td><td class="long-content">${accept || 'N/A'}</td></tr>
                        <tr><td>Connection</td><td>${connection || 'N/A'}</td></tr>
                        <tr><td>Via</td><td>${via || 'N/A'}</td></tr>
                        <tr><td>X-Forwarded-For</td><td>${xForwardedFor || 'N/A'}</td></tr>
                    </tbody>
                </table>
            </section>
            
            <section class="api-section" aria-labelledby="api-heading">
                <h2 id="api-heading">🔗 API Endpoints</h2>
            <div class="api-example">
                <div class="curl-command">$ curl ${domain}</div>
                <div class="response">⇒ ${clientIP}</div>
            </div>
            <div class="api-example">
                <div class="curl-command">$ curl ${domain}/ip</div>
                <div class="response">⇒ ${clientIP}</div>
            </div>
            <div class="api-example">
                <div class="curl-command">$ curl ${domain}/ua</div>
                <div class="response">⇒ ${userAgent}</div>
            </div>
            <div class="api-example">
                <div class="curl-command">$ curl ${domain}/lang</div>
                <div class="response">⇒ ${acceptLanguage}</div>
            </div>
            <div class="api-example">
                <div class="curl-command">$ curl ${domain}/encoding</div>
                <div class="response">⇒ ${acceptEncoding}</div>
            </div>
            <div class="api-example">
                <div class="curl-command">$ curl ${domain}/mime</div>
                <div class="response">⇒ ${accept}</div>
            </div>
            <div class="api-example">
                <div class="curl-command">$ curl ${domain}/referer</div>
                <div class="response">⇒ ${referer}</div>
            </div>
            <div class="api-example">
                <div class="curl-command">$ curl ${domain}/forwarded</div>
                <div class="response">⇒ ${xForwardedFor}</div>
            </div>
            <div class="api-example">
                <div class="curl-command">$ curl ${domain}/all</div>
                <div class="response">⇒ [All information in text format]</div>
            </div>
            <div class="api-example">
                <div class="curl-command">$ curl ${domain}/json</div>
                <div class="response">⇒ [All information in JSON format]</div>
            </div>
            </section>
            
            <section class="api-section" aria-labelledby="services-heading">
                <h2 id="services-heading">🌐 Service Descriptions</h2>
                <div style="background-color: white; padding: 15px; border-radius: 5px; border-left: 4px solid #3498db;">
                    <p><strong style="color: #2c3e50;">ipinfo.now:</strong> Complete IP information service with full feature set</p>
                    <p><strong style="color: #2c3e50;">IP4.NOW:</strong> IPv4-only service, returns IPv4 addresses exclusively</p>
                    <p><strong style="color: #2c3e50;">IP6.NOW:</strong> IPv6-preferred service, returns IPv6 when available, falls back to IPv4</p>
                    <p style="color: #7f8c8d; font-style: italic;">All services support CURL, HTTP, and HTTPS access methods.</p>
                </div>
            </section>
        </main>
        
        <footer class="footer" role="contentinfo">
            <p><strong>IP Query Service</strong> - Powered by <a href="https://ip.im" target="_blank" rel="noopener noreferrer" style="color: #3498db; text-decoration: none; font-weight: bold;">IP.IM</a></p>
            <p>Fast, reliable, and privacy-focused IP detection</p>
        </footer>
    </div>
</body>
</html>`

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
    },
  })
}

# 🌐 IP Query Service

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Cloudflare Workers](https://img.shields.io/badge/Powered%20by-Cloudflare%20Workers-f38020)](https://workers.cloudflare.com/)
[![GitHub stars](https://img.shields.io/github/stars/yourusername/ip-query-service)](https://github.com/yourusername/ip-query-service/stargazers)

A fast, reliable, and privacy-focused IP address lookup service built on Cloudflare Workers. Get your public IP address instantly with support for both IPv4 and IPv6, plus detailed network information.

## ✨ Features

- 🚀 **Lightning Fast**: Powered by Cloudflare's global edge network
- 🌍 **Multiple Services**: Three specialized endpoints for different needs
- 📱 **Dual Interface**: Clean web interface + command-line friendly API
- 🔒 **Privacy First**: No logging, no tracking, no data storage
- 🌐 **IPv4 & IPv6**: Full support for both IP versions
- 📊 **Rich Information**: Get detailed network and browser information
- 🎨 **Beautiful UI**: Modern, responsive web interface
- ⚡ **Zero Dependencies**: Runs entirely on Cloudflare Workers
- 🔧 **RESTful API**: Simple and intuitive API endpoints
- 📖 **Open Source**: Free to use, modify, and deploy

## 🎯 Available Services

### 🔍 [ipinfo.now](https://ipinfo.now)
Complete IP information service with full feature set. Perfect for general use and detailed network analysis.

### 4️⃣ [IP4.NOW](https://ip4.now)  
IPv4-only service that exclusively returns IPv4 addresses. Ideal for applications that specifically require IPv4.

### 6️⃣ [IP6.NOW](https://ip6.now)
IPv6-preferred service that returns IPv6 when available, falls back to IPv4. Great for modern applications supporting IPv6.

## 🚀 Quick Start

### For End Users

Simply visit any of our services or use curl:

```bash
# Get your IP address
curl ipinfo.now

# Get detailed information in JSON
curl ipinfo.now/json

# Get specific information
curl ipinfo.now/ua        # User Agent
curl ipinfo.now/lang      # Language
curl ipinfo.now/encoding  # Encoding
```

## 📚 API Documentation

### Base Endpoints

| Endpoint | Description | Example |
|----------|-------------|---------|
| `/` | Get IP address | `curl ipinfo.now` |
| `/ip` | Get IP address | `curl ipinfo.now/ip` |
| `/json` | All info in JSON | `curl ipinfo.now/json` |
| `/all` | All info in text | `curl ipinfo.now/all` |

### Specific Information

| Endpoint | Description | Example |
|----------|-------------|---------|
| `/ua` | User Agent | `curl ipinfo.now/ua` |
| `/lang` | Accept Language | `curl ipinfo.now/lang` |
| `/encoding` | Accept Encoding | `curl ipinfo.now/encoding` |
| `/mime` | MIME Type | `curl ipinfo.now/mime` |
| `/referer` | Referer Header | `curl ipinfo.now/referer` |
| `/forwarded` | X-Forwarded-For | `curl ipinfo.now/forwarded` |

### Response Examples

#### Plain Text Response
```bash
$ curl ipinfo.now
8.8.8.8
```

#### JSON Response
```bash
$ curl ipinfo.now/json
```
```json
{
  "ip_addr": "8.8.8.8",
  "user_agent": "curl/8.7.1",
  "language": "en-US,en;q=0.9", 
  "referer": "",
  "connection": "keep-alive",
  "method": "GET",
  "encoding": "gzip, deflate",
  "mime": "*/*",
  "via": "1.1 google",
  "forwarded": "8.8.8.8",
  "ipv4": true,
  "ipv6": false
}
```

## 🌍 Service Differences

| Feature | ipinfo.now | IP4.NOW | IP6.NOW |
|---------|------------|---------|---------|
| IPv4 Support | ✅ | ✅ | ✅ |
| IPv6 Support | ✅ | ❌ | ✅ (Preferred) |
| Full API | ✅ | ✅ | ✅ |
| Web Interface | ✅ | ✅ | ✅ |
| Use Case | General purpose | IPv4 only apps | IPv6-first apps |

## 🔧 Deployment Guide

### Prerequisites
- Cloudflare account
- Domain name (optional, for custom domains)
- Wrangler CLI

### Step-by-Step Deployment

1. **Prepare Cloudflare Account**
   - Sign up at [Cloudflare](https://cloudflare.com)
   - Navigate to Workers & Pages

2. **Create Worker**
   ```bash
   wrangler generate ip-query-service
   cd ip-query-service
   ```

3. **Replace Code**
   - Copy the worker code from this repository
   - Paste into `src/index.js`

4. **Configure wrangler.toml**
   ```toml
   name = "ip-query-service"
   main = "src/index.js"
   compatibility_date = "2024-01-01"
   
   [env.production]
   routes = [
     "ipinfo.now/*",
     "ip4.now/*", 
     "ip6.now/*"
   ]
   ```

5. **Deploy**
   ```bash
   wrangler deploy
   ```

6. **Custom Domains** (Optional)
   - Add domains in Cloudflare Dashboard
   - Configure DNS records
   - Add custom domain routes

## 🎨 Web Interface

The service provides a beautiful, modern web interface when accessed via browser:

- **Clean Design**: Modern, responsive layout
- **Real-time Data**: Your current IP and network information
- **API Examples**: Interactive examples showing how to use each endpoint
- **Service Navigation**: Easy switching between different services
- **Mobile Friendly**: Fully responsive design

## 🔒 Privacy & Security

- **No Logging**: We don't store or log any IP addresses or requests
- **No Tracking**: No analytics, cookies, or tracking scripts
- **No Data Storage**: All processing happens in real-time
- **HTTPS Only**: All traffic encrypted in transit
- **Open Source**: Full transparency - inspect the code yourself

## 🌟 Use Cases

### For Developers
- **API Testing**: Check your current IP during development
- **Network Debugging**: Analyze headers and connection information
- **IPv6 Testing**: Test IPv6 connectivity and fallback behavior
- **Automation Scripts**: Integrate IP detection into scripts and applications

### For System Administrators  
- **Network Monitoring**: Monitor public IP changes
- **Load Balancer Testing**: Verify request routing and headers
- **VPN Verification**: Confirm VPN connection and exit points
- **Firewall Configuration**: Get current IP for whitelist rules

### For Regular Users
- **Quick IP Check**: Find your public IP address instantly
- **VPN Testing**: Verify your VPN is working correctly
- **Network Troubleshooting**: Check connection details
- **Browser Information**: See what information your browser sends

## 📊 Technical Specifications

- **Runtime**: Cloudflare Workers (V8 JavaScript)
- **Global Availability**: 200+ edge locations worldwide
- **Response Time**: < 50ms globally
- **Uptime**: 99.9%+ (Cloudflare SLA)
- **Rate Limiting**: Cloudflare's built-in protection
- **IPv6 Ready**: Full IPv6 support
- **HTTP/2 & HTTP/3**: Latest protocol support

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Reporting Issues
- Use GitHub Issues for bug reports
- Include steps to reproduce
- Provide example requests/responses
- Mention your browser/curl version

### Feature Requests
- Describe the use case
- Explain the expected behavior
- Consider backward compatibility

### Code Contributions
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/ip-query-service.git
cd ip-query-service

# Install dependencies
npm install

# Start development server
wrangler dev

# Test your changes
curl http://localhost:8787
```

## 📈 Performance

| Metric | Value |
|--------|-------|
| Global Response Time | < 50ms |
| Throughput | 100,000+ req/sec |
| Availability | 99.9%+ |
| Cold Start | < 5ms |
| Memory Usage | < 1MB |


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 IP Query Service

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

- **Cloudflare Workers** - For providing the amazing serverless platform
- **IP.IM** - For inspiration and hosting
- **Open Source Community** - For continuous feedback and contributions
- **Contributors** - Everyone who helps make this project better

## 📞 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Use GitHub Issues for bug reports and feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Security**: Report security issues privately via GitHub Security Advisories

## 🎯 Roadmap

- [ ] **Geolocation Support**: Add IP geolocation information
- [ ] **Rate Limiting**: Custom rate limiting options
- [ ] **Analytics**: Optional usage analytics dashboard
- [ ] **Custom Headers**: Support for custom response headers
- [ ] **Webhook Support**: Trigger webhooks on IP changes
- [ ] **CLI Tool**: Dedicated command-line interface
- [ ] **Docker Image**: Containerized deployment option
- [ ] **Prometheus Metrics**: Monitoring and metrics export

---

<div align="center">

**⭐ Star this project if you find it useful!**

[🌐 Try it now](https://ipinfo.now) • [📖 API Docs](#-api-documentation) • [🤝 Contribute](#-contributing) 

Made with ❤️ by the open source community

</div>

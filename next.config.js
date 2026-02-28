/** @type {import('next').NextConfig} */
const dns = require('dns')
// Force IPv4 DNS resolution — fixes ConnectTimeoutError on ISPs/hotspots with broken IPv6
dns.setDefaultResultOrder('ipv4first')

const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig

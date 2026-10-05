/**
 * SSRF (Server-Side Request Forgery) protection for URL imports.
 *
 * Strategy:
 * 1. Allow only http: and https: schemes
 * 2. Parse hostname and resolve DNS
 * 3. Block private, loopback, link-local, and metadata IPs
 * 4. Validate redirect targets (each hop re-checked)
 * 5. Enforce timeouts and response size limits
 */

import { Injectable, Logger } from '@nestjs/common';
import * as dns from 'dns/promises';
import * as net from 'net';

export interface SsrfValidationResult {
  safe: boolean;
  reason?: string;
}

/** Private/reserved IPv4 ranges to block. */
const BLOCKED_IPV4_RANGES = [
  { prefix: '127.', description: 'loopback' },
  { prefix: '10.', description: 'private (10.x)' },
  { prefix: '0.', description: 'reserved (0.x)' },
  { prefix: '169.254.', description: 'link-local' },
] as const;

/** Check 172.16.0.0/12 */
function isPrivate172(ip: string): boolean {
  const parts = ip.split('.');
  if (parts[0] !== '172') return false;
  const second = parseInt(parts[1], 10);
  return second >= 16 && second <= 31;
}

/** Check 192.168.0.0/16 */
function isPrivate192(ip: string): boolean {
  return ip.startsWith('192.168.');
}

/** Known cloud metadata endpoints */
const CLOUD_METADATA_IPS = ['169.254.169.254', '169.254.170.2', 'fd00:ec2::254'];

/** Blocked IPv6 addresses/prefixes */
const BLOCKED_IPV6 = ['::1', '::ffff:127.0.0.1', 'fe80:', 'fc00:', 'fd00:', 'ff00:'];

@Injectable()
export class SsrfGuard {
  private readonly logger = new Logger(SsrfGuard.name);

  /**
   * Validate a URL is safe to fetch.
   */
  async validateUrl(urlString: string): Promise<SsrfValidationResult> {
    let parsed: URL;
    try {
      parsed = new URL(urlString);
    } catch {
      return { safe: false, reason: 'Invalid URL' };
    }

    // 1. Scheme check
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { safe: false, reason: `Blocked scheme: ${parsed.protocol}` };
    }

    // 2. Hostname checks
    const hostname = parsed.hostname;

    if (!hostname) {
      return { safe: false, reason: 'No hostname' };
    }

    // Block localhost variants
    if (hostname === 'localhost' || hostname === 'localhost.localdomain') {
      return { safe: false, reason: 'Blocked: localhost' };
    }

    // If hostname is an IP literal, validate directly
    if (net.isIPv4(hostname)) {
      return this.validateIpv4(hostname);
    }

    // Handle IPv6 in brackets (URL parser strips brackets)
    if (net.isIPv6(hostname)) {
      return this.validateIpv6(hostname);
    }

    // 3. DNS resolution — resolve the hostname and check all IPs
    try {
      const addresses = await dns.resolve(hostname);
      for (const addr of addresses) {
        const ipResult = net.isIPv4(addr)
          ? this.validateIpv4(addr)
          : this.validateIpv6(addr);

        if (!ipResult.safe) {
          this.logger.warn(`DNS resolution for ${hostname} resolved to blocked IP: ${addr}`);
          return { safe: false, reason: `DNS resolved to blocked address: ${ipResult.reason}` };
        }
      }
    } catch {
      // DNS resolution failed — could be a non-existent domain
      return { safe: false, reason: 'DNS resolution failed' };
    }

    return { safe: true };
  }

  /**
   * Validate a redirect target URL.
   * Called for each redirect hop to prevent redirect-to-private attacks.
   */
  async validateRedirect(redirectUrl: string): Promise<SsrfValidationResult> {
    return this.validateUrl(redirectUrl);
  }

  private validateIpv4(ip: string): SsrfValidationResult {
    // Check blocked ranges
    for (const range of BLOCKED_IPV4_RANGES) {
      if (ip.startsWith(range.prefix)) {
        return { safe: false, reason: `Blocked: ${range.description} (${ip})` };
      }
    }

    if (isPrivate172(ip)) {
      return { safe: false, reason: `Blocked: private 172.16/12 (${ip})` };
    }

    if (isPrivate192(ip)) {
      return { safe: false, reason: `Blocked: private 192.168/16 (${ip})` };
    }

    // Cloud metadata
    if (CLOUD_METADATA_IPS.includes(ip)) {
      return { safe: false, reason: `Blocked: cloud metadata endpoint (${ip})` };
    }

    return { safe: true };
  }

  private validateIpv6(ip: string): SsrfValidationResult {
    const normalized = ip.toLowerCase();

    for (const prefix of BLOCKED_IPV6) {
      if (normalized === prefix || normalized.startsWith(prefix)) {
        return { safe: false, reason: `Blocked: IPv6 ${prefix} (${ip})` };
      }
    }

    if (CLOUD_METADATA_IPS.includes(normalized)) {
      return { safe: false, reason: `Blocked: cloud metadata endpoint (${ip})` };
    }

    return { safe: true };
  }
}

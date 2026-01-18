/**
 * Get device information
 */
export interface DeviceInfo {
  device_id: string;
  device_name: string;
  device_type: string;
  browser: string;
  browser_version: string;
  os: string;
  os_version: string;
}

/**
 * Generate a unique device ID
 */
export const getDeviceId = (): string => {
  if (typeof window === 'undefined') return '';

  let deviceId = localStorage.getItem('device_id');
  
  if (!deviceId) {
    // Generate a unique device ID
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px "Arial"';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Device ID', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Device ID', 4, 17);
      
      const fingerprint = canvas.toDataURL();
      deviceId = 'device_' + btoa(fingerprint).substring(0, 32) + '_' + Date.now();
    } else {
      // Fallback if canvas is not available
      deviceId = 'device_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
    }
    
    localStorage.setItem('device_id', deviceId);
  }
  
  return deviceId;
};

/**
 * Get browser information
 */
export const getBrowserInfo = (): { name: string; version: string } => {
  if (typeof window === 'undefined') return { name: 'Unknown', version: 'Unknown' };

  const ua = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';

  if (ua.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
    browserVersion = ua.match(/Firefox\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) {
    browserName = 'Chrome';
    browserVersion = ua.match(/Chrome\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
    browserName = 'Safari';
    browserVersion = ua.match(/Version\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Edg') > -1) {
    browserName = 'Edge';
    browserVersion = ua.match(/Edg\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) {
    browserName = 'Opera';
    browserVersion = ua.match(/(?:Opera|OPR)\/([0-9.]+)/)?.[1] || 'Unknown';
  }

  return { name: browserName, version: browserVersion };
};

/**
 * Get OS information
 */
export const getOSInfo = (): { name: string; version: string } => {
  if (typeof window === 'undefined') return { name: 'Unknown', version: 'Unknown' };

  const ua = navigator.userAgent;
  let osName = 'Unknown';
  let osVersion = 'Unknown';

  if (ua.indexOf('Windows NT 10.0') > -1) {
    osName = 'Windows';
    osVersion = '10';
  } else if (ua.indexOf('Windows NT 6.3') > -1) {
    osName = 'Windows';
    osVersion = '8.1';
  } else if (ua.indexOf('Windows NT 6.2') > -1) {
    osName = 'Windows';
    osVersion = '8';
  } else if (ua.indexOf('Windows NT 6.1') > -1) {
    osName = 'Windows';
    osVersion = '7';
  } else if (ua.indexOf('Mac OS X') > -1) {
    osName = 'macOS';
    osVersion = ua.match(/Mac OS X ([0-9_]+)/)?.[1]?.replace(/_/g, '.') || 'Unknown';
  } else if (ua.indexOf('Linux') > -1) {
    osName = 'Linux';
    osVersion = 'Unknown';
  } else if (ua.indexOf('Android') > -1) {
    osName = 'Android';
    osVersion = ua.match(/Android ([0-9.]+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) {
    osName = 'iOS';
    osVersion = ua.match(/OS ([0-9_]+)/)?.[1]?.replace(/_/g, '.') || 'Unknown';
  }

  return { name: osName, version: osVersion };
};

/**
 * Get device type
 */
export const getDeviceType = (): string => {
  if (typeof window === 'undefined') return 'desktop';

  const ua = navigator.userAgent;
  
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  
  return 'desktop';
};

/**
 * Get complete device information
 */
export const getDeviceInfo = (): DeviceInfo => {
  const deviceId = getDeviceId();
  const browser = getBrowserInfo();
  const os = getOSInfo();
  const deviceType = getDeviceType();
  
  const deviceName = `${browser.name} on ${os.name}${os.version !== 'Unknown' ? ' ' + os.version : ''}`;

  return {
    device_id: deviceId,
    device_name: deviceName,
    device_type: deviceType,
    browser: browser.name,
    browser_version: browser.version,
    os: os.name,
    os_version: os.version,
  };
};


import { safeRemoveElement } from "@/utils/safeDOM";

function forceDownload(blobUrl: string, filename: string) {
  if (typeof document === 'undefined' || !document.body) {
    return;
  }
  
  let a: any = document.createElement("a");
  a.download = filename;
  a.href = blobUrl;
  
  try {
    document.body.appendChild(a);
    a.click();
    
    // Use safe DOM utility to remove element
    // Add small delay to ensure click event completes
    setTimeout(() => {
      safeRemoveElement(a);
    }, 100);
  } catch (e) {
    console.error('Error in forceDownload:', e);
    // Try to clean up even if there was an error
    try {
      safeRemoveElement(a);
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
  }
}

export default function downloadPhoto(url: string, filename: string) {
  if (typeof window === 'undefined') {
    console.warn('downloadPhoto: window is not available');
    return;
  }

  if (!filename) {
    filename = url.split("\\").pop()?.split("/").pop() || "";
  }
  
  fetch(url, {
    headers: new Headers({
      Origin: typeof window !== 'undefined' ? window.location.origin : '',
    }),
    mode: "cors",
  })
    .then((response) => response.blob())
    .then((blob) => {
      if (typeof window !== 'undefined' && window.URL) {
        let blobUrl = window.URL.createObjectURL(blob);
        forceDownload(blobUrl, filename);
      }
    })
    .catch((e) => console.error('Error downloading photo:', e));
}

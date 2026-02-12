chrome.webNavigation.onCompleted.addListener((details) => {
  // Only run on main frame (the actual tab, not ads/iframes)
  if (details.frameId === 0) {
    const url = new URL(details.url);
    const params = new URLSearchParams(url.search);
    
    // List of parameters to kill
    const targets = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
    let removed = false;

    targets.forEach(param => {
      if (params.has(param)) {
        params.delete(param);
        removed = true;
      }
    });

    if (removed) {
      const cleanURL = url.origin + url.pathname + (params.toString() ? '?' + params.toString() : '');
      
      // Update the URL in the address bar without a full page refresh
      chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        func: (newUrl) => {
          window.history.replaceState({}, '', newUrl);
        },
        args: [cleanURL]
      });
    }
  }
}, { url: [{ queryContains: 'utm_' }] });

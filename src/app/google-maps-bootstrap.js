/**
 * Official Google Maps JavaScript API Bootstrap
 * Source: https://developers.google.com/maps/documentation/javascript/loading-the-maps-api
 * https://developers.google.com/maps/documentation/javascript/place-get-started?_gl=1*jg9az5*_up*MQ..*_ga*MzY3OTc2NjMzLjE3NTg4NTI1Njc.*_ga_SM8HXJ53K2*czE3NTg4NTI1NjYkbzEkZzAkdDE3NTg4NTI1NjYkajYwJGwwJGgw*_ga_NRWSTWS78N*czE3NTg4NTI1NjYkbzEkZzEkdDE3NTg4NTQyMTYkajIkbDAkaDA.#load-places-library
 * This is the exact bootstrap code from Google's documentation.
 * Only the config object is parameterized to accept API key and version.
 */

export function initializeGoogleMaps(apiKey, version = 'weekly') {
  // Official Google Maps JavaScript API bootstrap - EXACT copy from Google's docs
  (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
    key: apiKey,
    v: version,
    // Use the 'v' parameter to indicate the version to use (weekly, beta, alpha, etc.).
    // Add other bootstrap parameters as needed, using camel case.
  });
}

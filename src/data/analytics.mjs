export const measurementId = 'G-LG3G89SH2V';
export const analyticsSrc = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
export const analyticsInit = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${measurementId}', {allow_google_signals: false, allow_ad_personalization_signals: false});`;
export function validAnalyticsScript(attrs, text) {
  if(attrs.id === 'ga4-loader') return Object.keys(attrs).sort().join(',') === 'async,id,src' && attrs.src === analyticsSrc && attrs.async === '' && !text.trim();
  return attrs.id === 'ga4-init' && Object.keys(attrs).join(',') === 'id' && text === analyticsInit;
}

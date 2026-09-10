const url='https://hirokiu.github.io/robots.txt';
const response=await fetch(url,{signal:AbortSignal.timeout(15000),redirect:'error'});
if(!response.ok) throw Error(`Host robots.txt unavailable: ${response.status}`);
const text=await response.text();
// Require a deliberately simple, auditable policy; specific-agent overrides are not accepted.
const lines=text.split(/\r?\n/).map(s=>s.replace(/#.*/,'').trim()).filter(Boolean);
if(lines.length!==2 || !/^User-agent:\s*\*$/i.test(lines[0]) || !/^Disallow:\s*\/(?:alchembright_web\/)?$/i.test(lines[1])) throw Error('Host-level robots.txt must prohibit preview crawling without overrides');
console.log('Host-level preview crawl exclusion confirmed');

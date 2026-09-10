export function legacyTarget(pathname: string, search: string, hash: string, map: Record<string,string>): string | null {
  if (pathname !== '/' && pathname !== '/index.php') return null;
  const params = new URLSearchParams(search);
  const ids = [...params.getAll('p'), ...params.getAll('page_id')];
  if (ids.length) {
    if (ids.length !== 1 || !/^[1-9]\d*$/.test(ids[0]) || !Object.hasOwn(map, ids[0])) return null;
    const target = map[ids[0]];
    if (!target.startsWith('/') || target.startsWith('//') || /[\\?#]/.test(target)) return null;
    return target + hash;
  }
  if (params.getAll('feed').length === 1 && ['rss','rss2'].includes(params.get('feed')!)) return '/feed.xml';
  return null;
}

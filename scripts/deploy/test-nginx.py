"""Validate the static vhost in an isolated local Nginx container, not on the VPS."""
import argparse, csv, datetime, http.client, json, pathlib, shutil, ssl, subprocess, tempfile, time
from urllib.parse import quote
parser=argparse.ArgumentParser()
parser.add_argument('--public-dir',default='dist')
parser.add_argument('--image',default='nginx@sha256:dc5069ad14f19660b141b21236140b91656bf89bbc3e2417c70ae650cd66104c')
args=parser.parse_args()
repo=pathlib.Path(__file__).resolve().parents[2]
def command(*argv):
    result=subprocess.run(argv,text=True,capture_output=True)
    if result.returncode: raise RuntimeError(result.stderr or result.stdout)
    return result.stdout.strip()
container=None
with tempfile.TemporaryDirectory(prefix='alchembright-nginx-') as temp:
    temp=pathlib.Path(temp);site=temp/'public';shutil.copytree(pathlib.Path(args.public_dir).resolve(),site)
    (site/'.env').write_text('test-only-secret')
    (site/'.env.css').write_text('test-only-secret')
    (site/'danger.PHP').write_text('test-only-php-source')
    command('openssl','req','-x509','-newkey','rsa:2048','-nodes','-days','1','-subj','/CN=www.alchembright.com','-keyout',str(temp/'key.pem'),'-out',str(temp/'cert.pem'))
    conf=(repo/'deploy/nginx/alchembright.conf').read_text()
    conf=conf.replace('/data/www/130_note.ab/static/current/public','/site')
    conf=conf.replace('/data/www/130_note.ab/static/current/nginx/wp-id-maps.conf','/etc/nginx/ab-test/wp-id-maps.conf')
    conf=conf.replace('/data/log/nginx/130_note.ab/access.log','/var/log/nginx/access.log').replace('/data/log/nginx/130_note.ab/error.log','/var/log/nginx/error.log')
    conf=conf.replace('/etc/letsencrypt/live/www.alchembright.com/fullchain.pem','/etc/nginx/ab-test/cert.pem').replace('/etc/letsencrypt/live/www.alchembright.com/privkey.pem','/etc/nginx/ab-test/key.pem')
    conf='\n'.join(line for line in conf.splitlines() if 'include /etc/letsencrypt/' not in line and 'ssl_dhparam ' not in line)+'\n'
    (temp/'default.conf').write_text(conf)
    shutil.copyfile(repo/'deploy/nginx/wp-id-maps.conf',temp/'wp-id-maps.conf')
    volumes=['-v',f'{site}:/site:ro','-v',f'{temp}:/etc/nginx/ab-test:ro','-v',f'{temp}/default.conf:/etc/nginx/conf.d/default.conf:ro']
    command('docker','run','--rm',*volumes,args.image,'nginx','-t')
    try:
        container=command('docker','run','--rm','-d','-p','127.0.0.1::443','-p','127.0.0.1::80',*volumes,args.image)
        ports=json.loads(command('docker','inspect','--format','{{json .NetworkSettings.Ports}}',container))
        tls_port=int(ports['443/tcp'][0]['HostPort']);http_port=int(ports['80/tcp'][0]['HostPort'])
        # The only unverified TLS connection is to our disposable self-signed local container.
        client=http.client.HTTPSConnection('127.0.0.1',tls_port,context=ssl._create_unverified_context(),timeout=10)
        checks=0
        def request(url,status,location=None):
            global checks
            client.request('GET',url,headers={'Host':'www.alchembright.com'})
            response=client.getresponse();body=response.read();headers=dict(response.getheaders())
            assert response.status==status,(url,response.status,status,body[:100])
            if location: assert response.getheader('Location')==location,(url,response.getheader('Location'),location)
            assert response.getheader('X-Frame-Options')=='SAMEORIGIN',url
            checks+=1
            return response,body
        for _ in range(30):
            try:request('/',200);break
            except (ConnectionError,OSError):time.sleep(.2)
        else:raise RuntimeError('Nginx did not start')
        rows=list(csv.DictReader((repo/'migration/mappings/url-map.csv').open()))
        for row in rows:
            if row['source_kind'] not in ['post','page']:continue
            target=quote(row['target_path'],safe='/%')
            request(target,200)
            arg='p' if row['source_kind']=='post' else 'page_id'
            request(f'/?{arg}={row["source_id"].split(":")[1]}',301,'https://www.alchembright.com'+target)
        request('/index.php?p=50&utm_source=test',301,'https://www.alchembright.com/blog/days/movabletype/')
        request('/index.php',301,'https://www.alchembright.com/')
        for url in ['/feed','/feed/']:request(url,301,'https://www.alchembright.com/feed.xml')
        response,_=request('/feed.xml',200);assert response.getheader('Content-Type').startswith('application/rss+xml')
        for url in ['/?p=999999','/?page_id=999999','/?p=50&page_id=466','/index.php?p=999999','/?s=search','/.env','/.env.css','/.git/config','/danger.PHP','/wp-login.php','/does-not-exist/']:
            request(url,404)
        request('/?utm_source=test',200)
        request('/category/blog/page/42/',200)
        plain=http.client.HTTPConnection('127.0.0.1',http_port,timeout=10)
        plain.request('GET','/about/?utm_source=test',headers={'Host':'www.alchembright.com'})
        res=plain.getresponse();res.read();assert res.status==301 and res.getheader('Location')=='https://www.alchembright.com/about/?utm_source=test';checks+=1
        result={'verified_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'nginx_version':command('docker','exec',container,'sh','-c','nginx -v 2>&1'),'image_id':command('docker','inspect','--format','{{.Image}}',container),'checks':checks,'result':'passed','scope':'Local container: nginx -t, 422 static content URLs, 422 ID redirects, RSS, HTTP-to-HTTPS, unknown IDs, hidden/PHP files and missing URLs. Test certificates substituted; real Certbot options, VPS global config, permissions and SELinux still require nginx -t on the VPS.'}
        (repo/'migration/reports/nginx-verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
        print(json.dumps(result,ensure_ascii=False))
    finally:
        if container:command('docker','rm','-f',container)

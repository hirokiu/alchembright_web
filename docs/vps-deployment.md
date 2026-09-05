# さくらのVPS / Nginxへの配置・切替

利用者提示の `www.alchembright.com` 設定を元に、同じVPSで静的サイトを配信する構成です。サーバーへの接続・設定変更はまだ行っていません。

## ディレクトリ構成

```text
/data/www/130_note.ab/
├── wp_htdocs/                       既存WordPress。削除・上書きしない
├── alchembright_web/                GitHubのclone（配信しない）
└── static/
    ├── releases/
    │   └── <日時>-<commit>-<mode>/
    │       ├── public/              検証済みの静的配信ファイル
    │       ├── nginx/               対応する記事IDマップ・設定のコピー
    │       ├── verification.json
    │       └── release.json
    └── current -> releases/<...>    Nginxが参照するリリース
```

Nginxのrootは `/data/www/130_note.ab/static/current/public`。cloneしたディレクトリそのものを公開しません。ビルドは新しいリリースへ直接出力するため、次のビルドが公開中のファイルを消すことはありません。

[設定ファイル](../deploy/nginx/alchembright.conf) は、既存の証明書・鍵・Certbot設定・ログのパスを引き継ぎます。PHP-FPM、WordPressへのフォールバック、携帯端末判定、FastCGIキャッシュをこのサイトの設定から外します。同じVPSの他サイトが使うPHP-FPMやグローバルキャッシュ設定は停止・削除しません。

## 1. 現在の配置を確認して保存する

VPS上で実際に読み込まれているconfのパスと、Nginxの版を確認します。

```sh
sudo nginx -v
sudo nginx -T
```

`nginx -T` に出る `# configuration file ...` を見て、提示したserverブロックが入っているファイルを特定してください。以下の `active_conf` は**例なので、実際のパスへ変更**します。複数サイトが一つのconfに書かれている場合は、ファイル全体を置き換えずAlchembrightの2つのserverブロックだけを置き換えます。

```sh
active_conf=/etc/nginx/conf.d/130_note.ab.conf
active_conf=$(readlink -f "$active_conf")
sudo test -f "$active_conf"
backup_dir=/data/www/130_note.ab/nginx-backup-$(date +%Y%m%d-%H%M%S)
sudo install -d -m 700 "$backup_dir"
sudo cp -a "$active_conf" "$backup_dir/wordpress.conf"
```

設定へのシンボリックリンクは `readlink -f` で実体のパスに解決してからバックアップします。バックアップは `conf.d/*.conf` の読み込み対象に追加しません。旧confと新confを同時に有効にしないでください。DB・uploads・WXRの保管とWordPressへの復旧方法も維持します。

## 2. ソースをcloneする

VPSの作業ユーザーでNode.js 24系を使えるようにしてください（最低22.12）。OSや既存のNode導入方法は未確認のため、OSを決め打ちしたインストールコマンドは含めていません。リポジトリはprivateなので、VPSからGitHubへ読み取りできるSSHキー等が必要です。

```sh
node --version
npm --version
sudo install -d -m 755 -o "$(id -un)" -g "$(id -gn)" \
  /data/www/130_note.ab/alchembright_web \
  /data/www/130_note.ab/static \
  /data/www/130_note.ab/static/releases

git clone --branch docs/wordpress-migration-audit \
  git@github.com:hirokiu/alchembright_web.git \
  /data/www/130_note.ab/alchembright_web
cd /data/www/130_note.ab/alchembright_web
npm ci
```

現時点の実装は下書きPRの `docs/wordpress-migration-audit` にあります。mainへマージした後の新規cloneでは `--branch main` を使います。ビルド・検証にdevDependenciesも使うため `npm ci --omit=dev` にはしません。Nodeはビルド時だけ必要で、配信にNode常駐プロセスは不要です。

## 3. 新しいリリースを準備する

最初は確認用として準備できます。この操作はcurrentやNginxを変更しません。

```sh
npm run release:prepare -- \
  --dest /data/www/130_note.ab/static/releases \
  --mode preview
```

テスト・型検査・静的生成・全件照合を実行し、最後に作成先の絶対パスを表示します。失敗したディレクトリには `.incomplete` が残り、切替スクリプトは拒否します。手編集がある作業ツリーからも準備を拒否します。先に変更をレビュー・コミットしてください。

本番用は次の指定です。

```sh
npm run release:prepare -- \
  --dest /data/www/130_note.ab/static/releases \
  --mode production
```

現在は127メディアURLが回収待ちのため、上の本番用コマンドはそのままでは停止します。**画像未収録表示のまま先行公開することを選ぶ場合**は、同じコマンドに `--allow-pending-media` を追加してください。この選択はrelease.jsonにも記録されます。画像URLの変更許可と、画像未収録での公開判断は別です。

productionではnoindexを外し、robots.txtを公開向けにします。previewのまま公開すると検索対象外の設定が残ります。`release.json` のmodeを確認してから切り替えてください。noindexは認証・アクセス制限ではありません。

## 4. 初回の切替

以下の `release_dir` は手順3の最後に出た**実際のパス**を指定します。初回にcurrentを作っても、旧Nginx設定はまだwp_htdocsを見ているため、この時点ではWordPressが配信されます。

```sh
release_dir=/data/www/130_note.ab/static/releases/実際のリリース名
node scripts/deploy/switch-release.mjs \
  /data/www/130_note.ab/static/current "$release_dir"

# 専用confであることを手順1で確認した場合
sudo cp deploy/nginx/alchembright.conf "$active_conf"
sudo nginx -t
```

`map` はhttpコンテキストのディレクティブです。新confは通常の `http { include /etc/nginx/conf.d/*.conf; }` のような場所で読み込ませます。serverブロックの中にファイル全体をincludeしてはいけません。記事IDマップは新confの先頭でcurrent配下から読み込みます。

`nginx -t` が失敗した場合はreloadせず、原因を修正するか保存したconfへ戻します。Nginxの実行ユーザーが `/data/www/130_note.ab/static/current/public` までの全親ディレクトリを辿れ、ファイルを読めることも確認してください。SELinuxが有効なら現行の公開領域と同様の配信許可が必要です。`chmod 777` やSELinuxの無効化で対処しません。

成功した場合のみreloadします。

```sh
sudo systemctl reload nginx
curl -I https://www.alchembright.com/
curl -I 'https://www.alchembright.com/?p=50'
curl -I 'https://www.alchembright.com/?page_id=466'
curl -I https://www.alchembright.com/blog/days/movabletype/
curl -I https://www.alchembright.com/kirokun-support/
curl -I https://www.alchembright.com/feed/
curl -I https://www.alchembright.com/feed.xml
curl -I https://www.alchembright.com/does-not-exist/
```

期待値は通常ページ200、既知IDと旧feedは正しい宛先へ301、存在しないURLは404です。サーバー内から名前解決を介さず確認する場合は、必要に応じて `curl --resolve www.alchembright.com:443:127.0.0.1 ...` を使用します。全IDの対応は [wp-id-maps.conf](../deploy/nginx/wp-id-maps.conf) で確認できます。

最後に実際の画面で画像・日本語URL・スマートフォン表示も確認し、アクセスログ/エラーログを確認してください。

## 5. 次回更新と静的リリースの切戻し

```sh
cd /data/www/130_note.ab/alchembright_web
git pull --ff-only
npm ci
# 手順3と同じ方法で新しいリリースを準備する
```

配信中のcurrent内でビルドしたり、直接同期・削除したりしません。リリースができたら、現在の参照先を控えて切り替えます。

```sh
previous_release=$(readlink -f /data/www/130_note.ab/static/current)
release_dir=/data/www/130_note.ab/static/releases/新しいリリース名
node scripts/deploy/switch-release.mjs \
  /data/www/130_note.ab/static/current "$release_dir"
sudo nginx -t && sudo systemctl reload nginx
```

currentは同一ディレクトリ内の一時シンボリックリンクからrenameして置き換えます。実ディレクトリのcurrentは上書きせず停止します。**リンクを変えた時点で配信ファイルは新しくなりますが、NginxのIDマップはreloadまで旧設定です。** 複数の操作を一つのトランザクションにするものではありません。構文確認や表示確認で問題があれば、すぐに以前のリンクへ戻して再確認します。

```sh
node scripts/deploy/switch-release.mjs \
  /data/www/130_note.ab/static/current "$previous_release"
sudo nginx -t && sudo systemctl reload nginx
```

## 6. WordPressへ戻す

```sh
sudo cp -a "$backup_dir/wordpress.conf" "$active_conf"
sudo nginx -t && sudo systemctl reload nginx
```

これで旧rootの `wp_htdocs` とPHP-FPMの設定へ戻ります。旧WordPress・DB・PHP-FPMを保持していることが前提です。複数サイトを含むconfを部分更新した場合は、そのAlchembright部分だけ戻してください。保管期間と復旧確認が済むまで旧WordPressも静的リリースも削除しません。

## 証明書更新と既存URLの範囲

証明書パスは変更していませんが、Certbotの更新方式はserverブロックだけでは分かりません。`/etc/letsencrypt/renewal/www.alchembright.com.conf` のnginx/webroot等の設定を確認し、切替後に `sudo certbot renew --dry-run` で更新経路を確認します。webroot方式なら旧wp_htdocsに置くチャレンジを新rootへ移すか、対応する `/.well-known/acme-challenge/` の専用配信を別途設定する必要があります。方式未確認のため新confにはチャレンジ用rootを推測して入れていません。

- 既知の投稿は `/?p=ID`、固定ページは `/?page_id=ID`、同じパラメータを持つ `/index.php` から301。余分なクエリは転送先に引き継ぎません。
- pとpage_idを同時指定した場合や未知IDは404。ID転送の対象は `/` と `/index.php` のみです。
- `/index.php` 単体はトップへ301。`/feed` と `/feed/` は `/feed.xml` へ301。
- WordPress検索・query形式のfeed・コメントfeed・添付ページ・旧MT記事URLの網羅的転送は未対応です。無関係な記事やトップへ一律転送しません。
- `www` なしのホストや別ドメインは今回の提示設定にないため追加していません。
- メディア旧URLの転送は必須にせず、新URLとの台帳を維持する方針です。

## 検証した範囲

ローカルの隔離したNginx 1.30.4コンテナで、`nginx -t`、422コンテンツURL、422 ID転送、RSS、HTTP→HTTPS、未知ID、PHP・隠しファイルの遮断など864項目に成功しました。[検証記録](../migration/reports/nginx-verification.json)

テスト用証明書とログ/配信パスを使用し、実際のCertbotオプションとDH設定は置き換えています。VPSのNginx版・全体設定・証明書・ファイル権限・SELinuxまで検証したものではないため、VPS上の `nginx -t` は必須です。

再検証はDockerとOpenSSLがある環境で `python3 scripts/deploy/test-nginx.py`。GitHub Actionsにも同じ検証を追加しています。

参考: [Nginx try_files](https://nginx.org/en/docs/http/ngx_http_core_module.html#try_files)、[mapのコンテキスト](https://nginx.org/en/docs/http/ngx_http_map_module.html)、[returnによる転送](https://nginx.org/en/docs/http/ngx_http_rewrite_module.html#return)。

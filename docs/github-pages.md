# GitHub Pagesへの移行とDNSの切替

> 2026-09-09：独自ドメイン切替前に、[noindex付き確認用公開](pages-preview.md) を先行する。

2026-09-05調査。公開先は **https://www.alchembright.com/**、生成はAstro、公開はGitHub Actionsとする。VPS向け設定は代替手段として保持する。DNS・本番WordPress・リポジトリの公開範囲は今回変更していない。

## DNSと既存サービスへの影響

公開DNS（1.1.1.1経由）の調査結果。ゾーン設定画面そのものは未確認。記録は `migration/inventory/pages-dns.json` と `pages-host-http.json`、`pages-dependencies-http.json` に保存した。

| 名前 | 現在の応答 | 今回の方針 |
| --- | --- | --- |
| www.alchembright.com | A 160.16.239.27、HTTPS 200 | この名前だけPagesへ変更 |
| note.alchembright.com | A 160.16.239.27、HTTPSトップがwwwへ301 | DNSは維持。転送・画像・他のパスの利用状況を確認 |
| dev.alchembright.com | A 160.16.122.89、HTTP 200、HTTPS接続拒否 | 稼働中として維持 |
| dev.alchembrigt.com（記載の綴り） | NXDOMAIN | 別ドメイン。正しい綴りは利用者へ確認中 |
| alchembright.com（wwwなし） | A 160.16.239.27 | 初回は維持。HTTPSはホスト名不一致で検証失敗 |
| 調査用の任意サブドメイン | A 160.16.239.27 | ワイルドカードの存在が示唆される。既存値を維持 |

NSは `ns1.value-domain.com` / `ns2.value-domain.com`。MXはGoogle系7レコード。上記主要ホストではAAAA・CNAME・CAAの回答はなかった。TTLはAレコードで1200秒だった。これらは調査時点の観測で、切替直前にも確認する。

**変更するのはwwwだけ**。noteやdev、ワイルドカード、wwwなしのA、NS、MX、TXT（SPF/DKIM/DMARC等）を変更しない。ワイルドカードをGitHubへ向けない。公開DNSだけではnote等が個別レコードかワイルドカードからの応答かは判別できないため、管理画面でも確認する。

DNS上の独立性とアプリの依存関係は別問題。noteのトップは既にwwwへ転送されるため、切替後は新サイトに到達する。記事429にはnote上の旧画像への参照がある。同じパスのwww側画像は現在HTTP 200で取得可能だった。媒体台帳の「pending」は未回収を意味し、消失の判定ではない。**www移行だけで、noteを提供しているVPSを廃止しない。**

## www配下に置くもの／追加調査が必要なもの

DNSはホスト名単位で切り替わる。`www/別アプリ/` だけをVPSに残す振り分けはDNSではできない。必要な動的機能は、切替前に別サブドメイン等へ移す必要がある。

| パス・種類 | Pagesでの扱い |
| --- | --- |
| 公開記事419件・固定ページ3件 | 現在のパスを維持。トップ、about、KIROKUNプライバシーポリシーを含む |
| カテゴリ・タグ・年/月別・ページ送り | 静的な一覧を生成 |
| `/media/` | 回収したメディアの新URL。元URLと対応を台帳に保存 |
| `/feed.xml`、`/sitemap.xml`、`/robots.txt` | 静的生成 |
| `/feed/` | RSSの新URL案内ページ。既存購読者は登録更新が必要 |
| `/?p=ID`、`/?page_id=ID` | 422件の対応表からブラウザで移動。HTTP 301ではない |
| `/index.php?p=ID` 等 | Pagesの404ページ上でブラウザ移動。最初の応答は404 |
| `/?feed=rss` / `rss2` | ブラウザではfeed.xmlへ移動。RSSリーダー互換は保証しない |
| `/wp-admin/`、`/wp-json/`、PHP、投稿・検索・コメント等の動的機能 | WordPress相当のサーバー処理は提供しない。外部利用の有無を確認 |
| `/wp-content/uploads/`、MT時代のファイル、PDF・検証ファイル・`.well-known/` 等 | 実ファイルを棚卸しし、必要な公開物だけ配置を決定 |
| 未把握のアプリ・API・ファイル置き場 | VPSの実ファイル、Nginx設定と利用者確認が必要 |

提供されたNginx設定は、実在ファイル／ディレクトリをWordPressより先に配信する。公開REST APIの422件だけでは別アプリの不存在を証明できない。`alias`、別のlocation、includeされた設定、サーバー外のデータも公開調査からは未確認。

VPSでは、リポジトリの `scripts/deploy/audit-vps-paths.py` を配置し、次の読み取り専用調査を実行できる。出力は公開ディレクトリ外へ置く。

```sh
python3 scripts/deploy/audit-vps-paths.py /data/www/130_note.ab/wp_htdocs > "$HOME/alchembright-path-audit.json"
```

ファイル名・種別・サイズのみ収集し、内容は読まず、シンボリックリンクを辿らない。権限エラーがあれば報告して非ゼロ終了する。レポートには非公開のファイル名が含まれ得るため、Gitへ入れる前に確認する。Nginx側はwwwのserverブロック・include・alias・proxy_pass・リダイレクトを管理者が確認する。アクセスログは既存パスの利用判断に使えるが、生ログはGitに入れない。

## GitHub Pages版の実装

- `.github/workflows/pages.yml`：mainの更新／手動実行からビルドしてPagesへ配置。
- リポジトリ変数 `PAGES_DEPLOY_ENABLED=true` のときだけ動作する。現状は未設定なので公開しない。
- PagesのCustom domainが `www.alchembright.com`、SourceがGitHub Actionsであることを先に検証する。
- 本番ビルドはnoindexを外し、記事本文・内部リンクを検証する。未回収メディアが残る間は本番検証で停止する。現状127 URLの回収・除外判断が残る。
- 旧記事ID対応は毎回URL台帳から生成する。未知のIDや重複したID指定からは移動せず、一覧を案内する。記事本文のスクリプトは引き続き実行させない。
- `404.html` と `/feed/` を加え、677 HTMLページ。公開原本・DB・認証情報はビルド成果物に含めない。
- Astroのsiteは独自ドメイン、baseはルート。`/alchembright_web/` を付けない。独自ドメイン設定前のgithub.ioリポジトリパスで、そのまま完全動作する構成ではない。

2026-09-05調査時のリポジトリはprivateだったが、2026-09-09に利用者がpublicへ変更した。以下の契約制約は解消済み。GitHub Freeではprivate repoのPagesを使えないため、Pro等の対応プランか確認する。APIから契約プランは確認できず、Pages設定取得は404だった。リポジトリを自動でpublicにはしない。private repoから公開しても、PagesのWebコンテンツ自体は公開される。

## 切替手順

1. 原本バックアップと実ファイル棚卸しを終え、www配下の別用途、note依存、回収メディア、旧URLとRSS互換の扱いを確定する。動的機能が残るなら先に別の公開先へ移す。
2. GitHubの対応プランを確認し、PRをレビュー・mainへ反映する。まだ公開変数は有効にしない。
3. Value Domainで現在のDNS全体を控える。GitHubアカウントSettings → Pagesで `alchembright.com` の所有確認を開始し、GitHubが表示するTXTの**名前と値をそのまま**追加してVerifyする。TXTは確認後も残す。これはwwwの配信先を変更しない。
4. リポジトリSettings → PagesでSourceを **GitHub Actions**、Custom domainを **www.alchembright.com** として保存する。カスタムActions方式ではCNAMEファイルは不要（GitHub側の設定を使う）。
5. 全公開条件を満たしてから `PAGES_DEPLOY_ENABLED=true` を設定し、mainのDeploy GitHub Pagesを手動実行する。ビルド・公開成功を確認する。DNSを変える前にドメインをGitHubへ登録する順序を守る。
6. Value Domainの対象ドメインのDNS設定で、**wwwの既存Aだけを置換**し、次のCNAMEを設定する。wwwにAAAAなどがあれば競合を除く。他のレコードへ一括上書きしない。

   | 種類 | 名前 | 値 |
   | --- | --- | --- |
   | CNAME | www | hirokiu.github.io. |

   UIが完全名を要求する場合、名前は `www.alchembright.com`。値にhttpsやリポジトリ名を含めない。ネームサーバーをGitHubへ変更する操作は不要。

7. DNSのCNAME応答、GitHubのDNSチェック、HTTPS証明書を確認してEnforce HTTPSを有効にする。伝播・証明書発行には最大24時間程度かかる場合がある。旧VPSは維持する。
8. 独自ドメインでトップ・日本語記事URL・KIROKUNページ・画像・内部リンク・RSS・404・旧ID移動を確認する。同時にnote、dev、メールの継続を確認する。

```sh
dig @1.1.1.1 www.alchembright.com CNAME +short
dig @1.1.1.1 note.alchembright.com A +short
dig @1.1.1.1 dev.alchembright.com A +short
dig @1.1.1.1 alchembright.com MX +short
```

問題があれば、公開変数をfalseにし、wwwのCNAMEを削除して控えたA（調査時160.16.239.27）へ戻す。DNS伝播中は両方に到達し得る。GitHubのカスタムドメイン設定を先に削除しない。WordPress・DB・旧Nginx設定は検収まで保持する。

wwwなしもPagesへ移したい場合は別工程で、現在の利用用途とTLSを確認してからapexのA/AAAAを設定する。今回のwwwだけの変更では、wwwなしの証明書問題は解消しない。

## 参照資料

- [GitHub：独自ドメインの設定](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [GitHub：ドメイン所有確認](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)
- [Value Domain：DNS設定](https://manual.value-domain.com/manual/domain/dns)
- [Astro：GitHub Pagesへの配置](https://docs.astro.build/en/guides/deploy/github/)

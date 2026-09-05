# 現状調査（2026-09-05）

## リポジトリ

- 対象: https://github.com/hirokiu/alchembright_web （調査時はprivate）
- 既定ブランチ: `main`
- 調査基点: `12c6ab51f5f9be1189fc8d734e7be3aaaa22b123` / `Initial commit`
- 追跡ファイル: README.mdのみ。内容はリポジトリ名と「Web site for Alchembright」。
- Astro、package.json、ロックファイル、CI/CD、既存ソース、AGENTS.md、Sitesのhosting.jsonはありませんでした。

## 公開サイトから確認した内容

公開GETのみで調査しました。WordPress管理画面・DB・旧サーバーにはアクセスしていません。以下は無認証REST APIで見える範囲で、バックアップ全体の件数ではありません。

| 対象 | 確認値 | 根拠・注意 |
| --- | ---: | --- |
| 投稿 | 419件 | posts APIを100件ずつ5ページ取得。ID重複なし、X-WP-Total=419と一致 |
| 固定ページ | 3件 | home、about、KIROKUN(キロクン) プライバシーポリシー |
| カテゴリ | 12件 | 空カテゴリ・親子関係も含む |
| タグ | 3件 | cassandra、mysql、perl |
| メディア登録 | 7件 | APIの添付レコード数。実画像の全数ではない |
| 本文中の画像等の参照 | 74種類 | 投稿419件＋固定ページ3件のrendered HTMLから抽出。取得成功数ではない |
| 本文中のリンク | 195出現 | a[href]の出現数。重複を含む |

投稿日範囲は2003-04-24〜2025-04-18。最古は [MovableType稼動](https://www.alchembright.com/blog/days/movabletype/)、最新投稿は「料理とそのゴール」です。[WordPressへ移行](https://www.alchembright.com/blog/switch-to-wordpress/) は2021-09-18付。投稿日と更新日が異なる記事があるため、移行時刻を投稿日に上書きしてはいけません。

| 年 | 投稿件数 |
| --- | ---: |
| 2003 | 144 |
| 2004 | 199 |
| 2005 | 10 |
| 2008 | 34 |
| 2009 | 16 |
| 2010 | 13 |
| 2011 | 1 |
| 2021 | 1 |
| 2025 | 1 |

表にない年の記事は今回のAPI結果にありません。過去に投稿がなかった、または過去の移行が完全だった、という証明にはなりません。

## ページと分類

トップのメニューは home / news / works / blog / about。news・works・blogのリンク先は固定ページではなくカテゴリです。news・worksはAPI上の件数0で、公開画面は「何も見つかりませんでした」（HTTP 200）でした。

固定ページは `/`（ID 461）、`/about/`（466）、`/kirokun-support/`（531）。最後のページはトップメニューに見えないため、メニューだけの棚卸しでは漏れます。プライバシーポリシーの本文・URLは移行対象とし、プロフィール内容を含め事実更新はこの移行とは別に確認します。

カテゴリblogの子にdays、photo、tech、YNU、バイリーン、場log、未分類、4行日記、LoveSongsがあります。子カテゴリを含む一覧とカテゴリへの直接所属件数は同じではありません。カテゴリ件数の合算で記事総数を検証しません。`/category/blog/page/42/` が応答することも確認しました。

## URLとMovable Type由来の痕跡

実際の現行投稿URLは日付型ではなく、例えば `/blog/days/movabletype/`、`/blog/uncategorized/post_309/`。日本語をパーセントエンコードしたslugもあります。年別のファイル配置から公開URLを作り直さず、取得したURLを基準とします。

本文には以下の旧URLが残っています。所有・移行元であることや現在の到達性は未確認です。

- `http://www.balog.jp/~hiro/mt/archives/000144.html`
- `http://www.balog.jp/~hiro/mt/archives/000332.html`
- `http://www.balog.jp/~hiro/mt/archives/000339.html`
- `http://www.balog.jp/~hiro/mt/archives/000061.html`
- `http://hrk-up.net/mt/balog_images/photo-1082012231.14-0.jpg`

WordPress IDをMovable Typeのentry IDと同一視しません。本文中のMovable Type、CGI、archives等を検索した候補は台帳に残しましたが、第三者への外部リンクも混ざるため、移行元の確定一覧ではありません。

## 画像・外部依存

本文の74参照URLのホスト内訳:

| ホスト | URL数 |
| --- | ---: |
| hrk-up.net | 63 |
| www.balog.jp | 7 |
| www.alchembright.com | 2 |
| note.alchembright.com | 1 |
| dev.balog.jp | 1 |

WordPressメディア登録7件をコピーするだけでは保存が完了しません。画像ファイル自体は今回は取得・検証していません。旧ホストの所有確認とバックアップを優先し、未回収画像を欠損台帳で管理します。

本文抽出は img/source/video/audio/iframe/embed のsrc等とsrcsetが対象。テーマ画像、CSS背景、スクリプト生成、添付ファイルへの通常リンク、未参照ファイルは別途照合が必要です。トップHTMLにもヘッダー画像と複数サイズのsrcset、faviconが存在します。

## 配信・補助機能

トップHTMLにTwenty SeventeenのCSS参照、WordPress REST API、投稿/コメントRSSが存在します。`/robots.txt` は `/sitemap.xml` と `/sitemap.rss` を案内し、`/wp-sitemap.xml` の応答にはAll in One SEOの生成コメントとpost/page/attachment/category/post_tagの子サイトマップがありました。プラグインの完全な一覧や設定は未取得です。

## 未確認事項

下書き・非公開・予約投稿・パスワード保護、コメント/トラックバック、カスタム投稿、原本文、ショートコード、プラグイン設定、SEOメタ、リダイレクト設定、MTエクスポート・DB・旧ファイル群、実ファイル容量・欠損・画像権利、旧ドメインの管理権限、DNS/サーバー方式。

wwwなしのURLは今回のWeb閲覧ツールでは取得できませんでした。公開本文のリンク切れ、HTTP/HTTPS・www正規化、サイトマップ子ページとAPIの完全突合も未実施です。取得エラーはサイトの不存在と同義ではありません。

## 根拠と再調査

調査方法・取得時刻・生データのSHA-256は [provenance.json](../migration/inventory/provenance.json)。本文はGitに取り込まず、公開メタデータと参照台帳を保存しています。生レスポンスのハッシュは同じ取得時点の照合用で、現在のAPI内容の不変性を保証しません。

- https://www.alchembright.com/wp-json/wp/v2/posts?per_page=1&orderby=date&order=asc
- https://www.alchembright.com/wp-json/wp/v2/pages?per_page=100
- https://www.alchembright.com/wp-json/wp/v2/categories?per_page=100
- https://www.alchembright.com/wp-json/wp/v2/tags?per_page=100
- https://www.alchembright.com/wp-json/wp/v2/media?per_page=100
- https://www.alchembright.com/robots.txt
- https://www.alchembright.com/wp-sitemap.xml

# alchembright_web

Web site for Alchembright

2003年頃からのMovable Type由来Blogを保存し、WordPressからAstro + Markdownへ移行するためのリポジトリです。

## 現在の状態

公開投稿419件・固定ページ3件を取り込んだ**確認用の静的サイト**です。記事と固定ページの旧URLを維持し、カテゴリ・タグ・年/月別一覧とページ送りを含む675 HTMLページを生成します。337件はMarkdown中心、85件は構造保存のためHTMLを残しています。

メディアは新URLへ変更してよい方針です。回収待ち127 URLを台帳で管理し、画像未収録表示を使用しています。WordPress/旧MTの原本突合・画像回収・サーバー設定は残っており、本番切替は行っていません。

- [今回の結果・制限・残作業](docs/phase2-results.md)
- [起動・再変換・画像登録の手順](docs/migration-workflow.md)
- [初回の現状調査](docs/current-state.md)
- [全体の移行計画](docs/migration-plan.md)
- [データモデル](docs/content-model.md)
- [原本受領チェックリスト](docs/source-data-checklist.md)
- [棚卸し台帳](migration/README.md)

## 起動と検証

Node.js 24系推奨（最低22.12）。

```sh
npm ci
npm run dev
```

ローカルの `/category/blog/` から記事を確認できます。

```sh
npm test
npm run check
npm run build
npm run migration:verify
```

GitHub Actionsも同じ検証を実施し、確認用生成物を保存します。自動公開は設定していません。既定の確認用出力にはnoindexを付けています。

## 構成

```text
src/content/blog/<年>/wp-<ID>.md   公開記事
src/content/pages/wp-<ID>.md       公開固定ページ
src/data/                         カテゴリ・タグ
src/pages/                        記事・アーカイブ・RSS等のルート
public/media/                     画像未収録表示・回収後の配信用コピー
migration/inventory/              初回棚卸し（その時点の記録）
migration/mappings/               記事URLと新旧メディアの対応
migration/reports/                変換・生成物の検証結果
scripts/migration/                取得・変換・反映・回収・検証
```

原本スナップショット・WXR・DB・下書き・認証情報はGit外に保存し、`public/` に入れません。初回調査時の基点は `12c6ab51f5f9be1189fc8d734e7be3aaaa22b123`（READMEのみ）です。最終配信先は利用者が用意するWebサーバーを予定しています。

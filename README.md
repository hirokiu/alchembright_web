# alchembright_web

Web site for Alchembright

WordPressからAstro + Markdownによる静的サイトへ移行するための準備リポジトリです。2003年頃からのMovable Type由来Blogを含め、記事・固定ページ・カテゴリ・タグ・画像・旧URL・内部リンク・移行の痕跡を保存します。

## 現在の状態

2026-09-05調査。開始時は `main` の初回コミット `12c6ab51f5f9be1189fc8d734e7be3aaaa22b123` にREADMEだけがありました。この変更は調査文書・台帳・空の初期ディレクトリの追加です。Astroアプリ、依存パッケージ、変換処理、GitHub Actions、デプロイ設定はまだありません。現段階でビルド・起動はできません。

- [現状調査と調査範囲](docs/current-state.md)
- [移行計画・保存方針・完了条件](docs/migration-plan.md)
- [データ項目とURL対応表の仕様](docs/content-model.md)
- [次工程で必要なデータ](docs/source-data-checklist.md)
- [調査台帳の読み方](migration/README.md)

## 初期ディレクトリ

```text
src/
  content/blog/       # 将来の公開記事Markdown（年別に配置）
  content/pages/      # 将来の公開固定ページMarkdown
  data/               # 将来のカテゴリ・タグ等の構造化データ
  pages/              # 将来のAstroルート
  layouts/            # 将来のページ共通レイアウト
public/
  wp-content/uploads/ # 将来のWordPress画像（旧パス維持）
  legacy/             # 将来の旧ホスト別資産（URL台帳で対応）
migration/
  inventory/          # 公開情報から抽出した棚卸し
  mappings/           # URL・メディア対応表の空テンプレート
scripts/migration/    # 将来の読み取り・変換・検証処理
```

`public/` は将来そのまま配信される領域です。バックアップ、WXR、DB、ログ、下書き、認証情報は入れません。生データはGit管理外のアクセス制限された保管先へ保存してください。

## 予定する更新方式

Markdown等をGitHubで管理し、GitHub Actionsで静的ファイルを生成し、利用者が用意するWebサーバーへ配置する方針です。GitHub Pagesへの移行は前提にしていません。サーバー種別と旧URL対応を確定してから実装します。

# 移行台帳

> 第2段階: `inventory/` は初回調査の記録をそのまま保存。`mappings/` は現在422コンテンツURLと127メディアURLの対応表です。以下の空テンプレートという記述は初回時点の状態です。新しいレポートは `reports/`、操作説明は [作業手順](../docs/migration-workflow.md) を参照してください。

`inventory/` は2026-09-05に無認証で取得できた公開情報から作成した初回棚卸しです。移行済みデータでも完全バックアップでもありません。

- `content.csv`: 公開投稿419件＋固定ページ3件。日時はAPIのlocal値でタイムゾーン未確定。
- `categories.json` / `tags.json`: 公開分類のID・slug・親子・件数。カテゴリcountは直接所属数で記事総数として合算しない。
- `media-records.json`: APIで取得した添付7レコードのURL・画像情報。実ファイル未回収。
- `asset-references.csv`: 本文中の画像等74参照。すべて `pending`。テーマやCSS等は対象外。
- `link-references.csv`: 本文中のa[href]195出現。到達性・内部/外部の所有判定は未実施。
- `legacy-trace-candidates.json`: 本文内のMovable Type/mt-/CGI/archives文字列から拾った候補。第三者サイトも含み、網羅的なMT来歴ではない。
- `provenance.json`: 取得方法、範囲、時刻、照合ハッシュ。

`mappings/` のCSVは対応確定時に使うヘッダーだけのテンプレートです。未確定の301を生成しないため、推測した転送先は入れていません。

生のHTML/APIレスポンス・WXR・DBはGitに格納していません。台帳には本文から発見した原URLを残すので、将来このリポジトリを公開する前にも内容を確認してください。

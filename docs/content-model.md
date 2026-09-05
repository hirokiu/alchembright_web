# コンテンツ・対応表の設計案

この仕様は変換実装前の案です。実データのサンプル検証後にスキーマを固定します。WordPress標準のIDやslugをAstro側の暗黙のURL規則と混同しません。

## 記事と固定ページ

次は架空の説明用例で、公開用データには置いていません。

```yaml
---
source_system: wordpress
source_id: 123
content_type: post
status: publish
title: "例示タイトル"
slug_original: "example"
canonical_path: "/blog/days/example/"
original_url: "https://www.alchembright.com/blog/days/example/"
legacy_urls: []
published_at_local: "2003-04-24T15:16:55"
published_at_gmt: null
modified_at_local: "2003-04-24T15:16:55"
source_timezone: null
category_ids: [4]
tag_ids: []
parent_id: 0
menu_order: 0
excerpt: ""
featured_media_id: 0
mt_entry_id: null
mt_basename: null
source_record_sha256: "原本レコードのハッシュ"
conversion_version: "変換ツールの版"
conversion_warnings: []
---
本文。必要なら通常のHTMLを保持する。
```

日付は元のlocal/GMT値・タイムゾーンを保持する。タイムゾーン未確認でJSTやUTCを付け足さない。unknown/nullと空文字を区別する。タイトルの文字参照デコードやUnicode正規化を行う場合は原文も原本に保持する。

記事の保存ファイル名は `wp-<ID>.md` を基準に重複を避ける。ソースIDは移行上の識別子、公開URLは `canonical_path` という別の情報。下書き等の原本は公開用contentディレクトリに置かない。

## 分類

カテゴリは `id, name, slug, description, parent_id, original_url`、タグは親なしの同等項目。記事はIDの配列を参照し、表示名の変更で所属関係が変わらないようにする。全カテゴリID/タグIDが解決し、カテゴリ循環がないことを検証する。

## URL対応表

`migration/mappings/url-map.csv` はヘッダーだけのテンプレートで、まだ転送指示ではありません。

- `source_url`: scheme/host/path/queryを含む原URL。fragmentも発見時の値を保持する。
- `source_kind`: post/page/category/tag/archive/feed/attachment/legacy等。
- `source_id`: WP/MT等の名前空間付きID（例: wp:123）。不明なら空。
- `target_path`: 新しい配信先。未確定なら空。
- `action`: preserve/redirect/review。確認前はreview。
- `http_status`: 検証後の期待200/301等。未確定は空。
- `evidence`: 対応する根拠。単なるslug類似で同一記事としない。
- `verified_at`, `notes`: 照合日時と残課題。

同一sourceに異なるtargetがある競合、予約パス衝突、転送循環、多段転送、エンコード差を検出する。分類の再整理を旧投稿URLの再生成に反映させない。

## メディア対応表

`migration/mappings/media-map.csv` の列は `source_url, source_record_id, target_path, sha256, bytes, mime_type, recovery_status, evidence, notes`。

`recovery_status` は pending/recovered/missing/needs_rights_review 等。本文中URLだけの存在をrecoveredとしない。原寸と派生物は別ファイルとして記録する。複数ホストの同名画像を上書きせず、ハッシュによる重複排除後もURL別名を失わないようにする。

# 新しいブログ記事の追加

公開ブランチ `docs/wordpress-migration-audit` に記事を追加してpushすると、GitHub Actionsがサイト全体を再生成・検証してGitHub Pagesへ公開します。別ブランチの変更は、この公開ブランチへ取り込んだ時点で反映されます。現在のプレビューURLとnoindex設定は継続します。

自動更新対象：記事ページ、ブログ一覧、カテゴリー別（親カテゴリーも含む）、タグ別、タグ一覧の件数、年別・月別、ページ送り、RSS、サイトマップ、サムネイル。これらのHTMLを手動で作る必要はありません。

## Markdownの例

`src/content/blog/2026/my-new-post.md` のようにファイルを作成します。以下はテンプレートであり、そのまま公開する記事ではありません。

```markdown
---
source_system: markdown
source_id: 1000001
content_type: post
status: publish
title: 新しい記事のタイトル
canonical_path: /blog/days/my-new-post/
original_url: null
published_at_local: "2026-09-10T12:00:00"
published_at_gmt: "2026-09-10T03:00:00"
modified_at_local: "2026-09-10T12:00:00"
category_ids: [4]
tag_ids: [-10]
excerpt: 一覧に表示する短い紹介文。
conversion_format: markdown
---

ここに記事本文を書きます。

![写真の説明](/img/blog/2026/09/my-photo.jpg)
```

- source_idは既存記事と重複しない整数。新規記事は1000001以降の未使用番号を使用します。
- canonical_pathは既存URLと重複しない、末尾 `/` の記事URL。
- 日時はローカル欄を日本時間、GMT欄をUTCで記入。年・月ページはpublished_at_localから生成されます。
- category_idsとtag_idsは別物。`src/data/categories.json`・`src/data/tags.json`のIDを指定します。上の例はdaysカテゴリー（4）とphotoタグ（-10）。複数指定できます。
- 新しいカテゴリーやタグは、対応するJSONに一意のid・name・slug・linkを登録します。カテゴリーにはparent（親なしは0）も指定。linkは既存形式の `https://www.alchembright.com/category/.../` または `/tag/.../` のURLです。新しい分類ページも次回ビルドで生成されます。
- 写真はpublic/img/blog/YYYY/MM/に置き、Markdownではpublicを除いたパスで参照します。最初のローカル画像から一覧用サムネイルが自動生成されます。新規Markdown記事のphotoタグはtag_idsに明記してください。

## 検証と公開

GitHub上でファイルを追加・更新した場合も、公開ブランチへのコミットで同じ処理が動きます。未知の分類ID、記事IDやURLの重複などは公開前の検証で止まります。Actionsの成功後、公開サイトを確認してください。

ローカルで確認する場合は `npm run build` を実行します。WordPressからの再取り込みは新規記事追加には不要です。既存の移行記事は自動生成元と照合されるため、元データの再取り込みとは分けて扱ってください。

`src/content`配下は公開記事専用です。下書きや私的な原文は置かず、Git管理外に保存し、公開する内容が確定してから追加してください。

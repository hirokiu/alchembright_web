# 記事の追加・更新手順

公開ブランチ `docs/wordpress-migration-audit` に記事を追加してpushすると、GitHub Actionsがサイト全体を再生成・検証してGitHub Pagesへ公開します。別ブランチの変更は、この公開ブランチへ取り込んだ時点で反映されます。公開URLは https://www.alchembright.com/ です。検索掲載・クロールを許可しています。

自動更新対象：記事ページ、ブログ一覧、カテゴリー別（親カテゴリーも含む）、タグ別、タグ一覧の件数、年別・月別、ページ送り、RSS、サイトマップ、サムネイル。これらのHTMLを手動で作る必要はありません。

## Markdownの例

`src/content/blog/2026/my-new-post.md` のようにファイルを作成します。以下はテンプレートであり、そのまま公開する記事ではありません。

```markdown
---
source_system: markdown
source_id: 1000003
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


## 掲載先とタグを選ぶ

カテゴリーは掲載先、タグは記事の話題を表します。ファイルの保存場所や記事URLだけでは掲載先は決まりません。

| 掲載先・用途 | category_ids | 表示される一覧 |
| --- | --- | --- |
| お知らせをnewsとblogの両方へ | `[14, 9]` | news、blog |
| 技術記事 | `[13]` | tech、親カテゴリーのblog |
| 日常の記事 | `[4]` | days、親カテゴリーのblog |
| blog全般 | `[9]` | blog |

news（14）はblog（9）の子カテゴリーではないため、両方に載せる記事は必ず `[14, 9]` を指定します。同じ記事ファイルを2つ作る必要はありません。なお、全投稿を集める `/blog/` と、ナビゲーションから開く `/category/blog/` は別の一覧です。

タグは複数設定できます。今回の技術記事は `tag_ids: [-5, -11, -12, -13]` とし、tech、Astro、GitHub Pages、Webサイト移行の各タグに掲載しています。写真を含む記事にはphoto（-10）も指定します。カテゴリーのtech（13）とタグのtech（-5）は別のIDです。

## GitHubで新しい記事を公開する

1. リポジトリで公開ブランチ `docs/wordpress-migration-audit` を選びます。
2. `src/content/blog/YYYY/` に、内容が分かる英数字の名前でMarkdownファイルを追加します。
3. 上記テンプレートを基に、未使用のsource_id、記事URL、タイトル、日時、紹介文、カテゴリー、タグを設定し、本文を書きます。1000001と1000002は使用済みです。例の1000003も、使用前に既存記事との重複を確認してください。
4. 画像があれば `public/img/blog/YYYY/MM/` に追加し、記事から参照します。画像も含めて公開してよい内容か確認します。
5. 変更をコミットします。公開ブランチへの変更は自動公開につながるため、下書きの保存先としては使いません。
6. Actionsの「Deploy custom-domain Pages」が成功したことを確認します。
7. 公開された記事の本文・画像・リンクと、指定したカテゴリー・タグ・年月の一覧を確認します。newsとblogの両方に掲載する場合は、両方の一覧を開いて確認します。

## 公開済みの記事を修正する

該当するMarkdownファイルを編集し、`modified_at_local` を修正日時に更新します。`source_id`、`canonical_path`、公開日時は通常そのままにします。カテゴリーやタグだけの変更でも、次の公開時に一覧へ反映されます。変更をコミットしたら、上記と同様にActionsと公開ページを確認します。

記事を分割する場合は、元記事のURLを維持し、分けた記事には新しいsource_idとURLを割り当てます。今回のお知らせは `website-renewal.md`（news・blog）、技術記事は `website-migration.md`（tech・blog）です。

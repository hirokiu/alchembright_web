# 記事の追加・更新手順

記事は `drafts`、サイトの開発は `develop` で編集します。mainは公開用とし、直接編集せず、内容を確認した変更をマージしてpushします。GitHub上でPull Requestをマージした場合、push操作は不要です。mainの更新を受けてGitHub Actionsがサイト全体を検証・公開します。公開URLは https://www.alchembright.com/ です。

**このリポジトリはpublicです。下書きブランチもGitHub上では公開されます。** ブランチに置く下書きは「サイトには未掲載」ですが、非公開ではありません。私的な原文や匿名化前の文章は、引き続きGit管理外で保管してください。

下書き・開発ブランチへのpushでは検証だけが動き、GitHub Pagesは更新されません。公開環境はmainだけを許可しています。


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

GitHub上でも作業ブランチに変更を保存し、検証後にmainへマージします。未知の分類ID、記事IDやURLの重複などは公開前の検証で止まります。Actionsの成功後、公開サイトを確認してください。

ローカルで確認する場合は `npm run build` を実行します。WordPressからの再取り込みは新規記事追加には不要です。既存の移行記事は自動生成元と照合されるため、元データの再取り込みとは分けて扱ってください。

下書きブランチでも記事は `src/content/blog/` に置き、`status: publish` を使います。現行の仕組みは記事のdraft状態を扱わず、ブランチでサイトへの掲載前後を分けます。mainへマージされた記事はすべて公開対象になります。


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

1. `drafts` に最新のmainを取り込んでから、そのブランチを選びます。サイトの機能やデザインの変更は `develop` を使います。
2. `src/content/blog/YYYY/` に、内容が分かる英数字の名前でMarkdownファイルを追加します。
3. 上記テンプレートを基に、未使用のsource_id、記事URL、タイトル、日時、紹介文、カテゴリー、タグを設定し、本文を書きます。1000001と1000002は使用済みです。例の1000003も、使用前に既存記事との重複を確認してください。
4. 画像があれば `public/img/blog/YYYY/MM/` に追加し、記事から参照します。画像も含めて公開してよい内容か確認します。
5. 作業ブランチへコミット・pushし、「Validate site changes」が成功することを確認します。
6. 差分を確認し、公開日時も確認してからmainへマージします。Pull Requestを使う場合はbaseをmainにします。その後「Deploy custom-domain Pages」の成功を確認します。
7. 公開された記事の本文・画像・リンクと、指定したカテゴリー・タグ・年月の一覧を確認します。newsとblogの両方に掲載する場合は、両方の一覧を開いて確認します。

## 公開済みの記事を修正する

`drafts` で該当するMarkdownファイルを編集し、`modified_at_local` を修正日時に更新します。`source_id`、`canonical_path`、公開日時は通常そのままにします。カテゴリーやタグだけの変更でも、次の公開時に一覧へ反映されます。作業ブランチへコミットしたら、上記と同様に検証・mainへのマージ・公開確認を行います。

記事を分割する場合は、元記事のURLを維持し、分けた記事には新しいsource_idとURLを割り当てます。今回のお知らせは `website-renewal.md`（news・blog）、技術記事は `website-migration.md`（tech・blog）です。


## ブランチを継続して使う

mainは公開履歴、draftsは記事の作業、developはサイトの開発に使用します。作業開始時は最新のmainを作業ブランチへ取り込み、公開後もmainを取り込んで差分を揃えます。複数の未完成記事を別々に公開したい場合は、最新のmainから記事ごとの `draft/記事名` ブランチを作ります。開発も必要に応じて `feature/変更名` に分けられます。ブランチ全体をマージすると、その中の変更がまとめて公開されるためです。

Pull Requestの受付を無効化している場合は、ローカルでマージできます。以下は記事ブランチを公開する例です。main上で記事を直接編集する操作は含みません。

```sh
git fetch origin
git switch drafts
git merge origin/main
# 記事を編集し、コミットしてからpush
git push origin drafts
# 検証と内容確認後に実行
git switch main
git pull --ff-only origin main
git merge --no-ff drafts
git push origin main
git switch drafts
git merge main
```

公開判断は本人が行います。今後の作業依頼が下書き・開発に限られる場合、mainへのマージは行わず、公開を依頼された時点でマージします。mainの直接pushを禁止する保護設定は追加していません。上記のローカルマージ方式も利用できます。

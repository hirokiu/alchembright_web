# 開発・再取り込み・画像回収の手順

Node.js 24系推奨（最低22.12）、npmを使用します。依存関係はpackage-lock.jsonで固定しています。

## 確認用サイト

```sh
npm ci
npm run dev
```

案内されたローカルURLから `/category/blog/`、最古記事 `/blog/days/movabletype/`、`/about/`、`/kirokun-support/` などを確認します。本番サイトへの接続は取得スクリプトを明示実行した時だけ必要で、ビルド時にWordPressへ接続しません。

```sh
npm test
npm run check
npm run build
npm run migration:verify
npm run preview
```

確認用HTMLは `dist/`。`PUBLIC_SITE_MODE=production` でnoindexを外せますが、現在は本番用ではありません。`npm run migration:verify -- --release` は未回収メディアがある間は失敗します。このチェックが通るだけで本番移行の全条件を満たすわけでもありません。

## 原本を再取得する

```sh
npm run migration:fetch -- migration/raw/capture-002
```

引数はまだ存在しない保存先を指定します。公開APIだけを読み取り、途中失敗や件数不一致では完了manifestを作りません。途中フォルダを原本として使わず、新しい名前で再取得します。WXRやDBの入力形式にはまだ対応していません。

## 新しいステージへ変換する

```sh
npm run migration:import -- migration/raw/capture-002 migration/staging/import-002
```

公開・非保護のpost/pageだけを受け付けます。原本ハッシュと件数を検証し、既存ステージへの再書き込みは拒否します。`src/` 本体にはまだ反映しません。

ステージ内の `conversion-report.json`、Markdown、URL・画像対応表の差分を確認してください。同一入力と対応表では同じ記事ファイルを生成します。本文の変換警告や新たなメディアを確認してから次に進みます。

```sh
node scripts/migration/promote.mjs migration/staging/import-002
npm test
npm run check
npm run build
npm run migration:verify
```

前回生成時のチェックサムを使い、記事や分類データへの手編集、予期しない削除、ステージ後に変更されたメディア対応表を検出すると反映を止めます。チェックサムを安易に更新して回避せず、原本・生成結果・手編集内容を比較して取り込んでください。対象を事前検証してからコピーしますが、複数ファイルをまとめたトランザクションではありません。途中でファイル書込みに失敗したらGit差分とステージを照合してください。

## バックアップ画像が見つかったら

元URLとの対応が判明したファイルを、1件ずつ次の形式で登録できます。ファイル名の似ているものを自動確定する処理は行いません。

```sh
node scripts/migration/recover-media.mjs 'http://old.example/photos/example.jpg' '/path/to/recovered-image.jpg'
```

元URLは `migration/mappings/media-map.csv` にある実際のURLを指定します。ローカル元ファイルを変更せず、PNG/JPEG/GIF/WebP/PDFの形式を確認して配信用コピーを作り、SHA-256・サイズ・MIMEと新URLを記録します。未対応形式や既登録内容と異なるファイルは確認のため停止します。別サイズが必要な場合は、その元URLについても対応を確認します。

その後、同じ原本でも新しいステージ名で再変換し、確認してpromoteします。原本の再取得は必須ではありません。

```sh
npm run migration:import -- migration/raw/phase2-public-snapshot migration/staging/media-001
node scripts/migration/promote.mjs migration/staging/media-001
npm run build
npm run migration:verify
```

Gitから新しく作業環境を取得した場合、Git外の原本スナップショットを別途配置するか新しく取得してください。元URLは来歴として残し、記事内の画像srcと、同じ回収済み画像を指すリンクは新URLに更新されます。

## 原本の保管と今後の記事

`migration/raw/` と `migration/staging/` はGit管理外です。WXR/DB/旧MT原本を `public/` に入れないでください。生データは別途バックアップします。

現スキーマはWordPress移行記事向けです。今後の新規Markdown記事については、移行元IDを不要にした独立した作成スキーマを次工程で追加します。現段階で架空のWP IDを採番して投稿する必要はありません。

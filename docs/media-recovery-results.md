# 画像回収結果（2026-09-09）

127URLのうち47件を元URLから取得し、画像デコーダーで寸法を検査した。旧URLから取得できない80件は未回収。47件にはブログ画像だけでなく、WordPressの背景・ロゴとその派生サイズを含む。

配信用ファイルは public/img/blog/YYYY/MM/ に配置し、公開URLは /img/blog/YYYY/MM/。年月は元URLの年月を利用。ファイル名にハッシュを含め、同名衝突を避ける。画像の元バイトは維持。取得原本はGit管理外に保持する。

未回収一覧は migration/reports/missing-blog-images.csv。元ファイル名・元URL・利用記事の日付・URL・タイトルを記載。hrk-up.net由来63件、www.balog.jp由来16件、dev.balog.jp由来1件。元URLから返るHTML等を画像として採用していない。

ファイルが見つかったら、recover-media.mjsに元URL、ローカルファイル、確認した年月（YYYY/MM）を渡す。年月は元URLから判断できる場合は省略可能。

```
node scripts/migration/recover-media.mjs '元URL' '/path/to/file.jpg' '2004/04'
```

登録後は新しいステージに再取り込み・promoteする。承認済みMT記事も import-reviewed-mt.mjs で再生成し、buildとmigration:verifyで画像参照を確認する。

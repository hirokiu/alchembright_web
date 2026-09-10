# 背景・SNSアイコン・KIROKUN

2026-09-09。元サイトを参照して背景ヘッダーとSNSフッターを復元。

- 背景： https://www.alchembright.com/wp-content/uploads/2022/12/cropped-IMG_1952-scaled-1.jpg
  - public/media/site/yokohama-night.jpg に元バイトのまま保存。2000×1500。表示時に画面幅に合わせてトリミングする。
- SNS：元サイトのTwitter、Facebook、Instagram、LinkedInのURLと順番を保持。
  - 既存WordPress Twenty SeventeenのFont Awesome由来SVGパスを利用。Copyright Dave Gandy。テーマ公式readmeのライセンス表記はSIL Open Font License 1.1。出典を licenses/twentyseventeen-readme.txt に保存。
  - 公式出典：https://github.com/WordPress/WordPress/tree/master/wp-content/themes/twentyseventeen
  - ライセンス：https://openfontlicense.org/open-font-license-official-text/
  - Google Material Iconsは汎用UI向け。元のSNSブランド図柄と同じ表示にするため既存の公開アイコンを採用。
  - インラインSVG、リンクのaria-label、装飾SVGのaria-hidden、キーボードフォーカス表示を使用。外部アイコンフォント・追跡スクリプトは追加しない。W3C認証取得を意味しない。
- KIROKUN： /works/kirokun/ に紹介ページを追加。Worksの一覧とナビゲーションから誘導。
  - 紹介内容の根拠は既存プライバシーポリシーと利用者のiOS/Android向けという説明。ストアURL・画面写真・追加機能は未提供のため掲載していない。
  - /kirokun-support/ の既存URLと本文を保持し、アプリ紹介ページからリンク。フッターの直接リンクはアプリ紹介内へ整理。

アクセシビリティ参考：https://www.w3.org/WAI/tutorials/images/decorative/

検証：Astro型検査、678 HTML生成、既存422件の本文・内部リンク照合が成功。トップとKIROKUN紹介をW3C Nuで検査しmessagesは両方空（2026-09-09）。全記事へのW3C検査やWCAG適合認証ではない。

背景画像SHA-256：`511e9ac8b257673acf09cdb9636d941162dd5ba79513e08f1b863590cd0450e5`

2026-09-09 追加調整：homeの背景写真は画面に固定し、本文とフッターを白背景で重ねてスクロールする。下層ページは固定高（通常320px、狭い画面240px）のヘッダーに、元サイトの別写真 IMG_1778-scaled.jpg を public/media/site/page-header.jpg として元バイトのまま保存・使用（1920×2560）。出典：https://www.alchembright.com/wp-content/uploads/2022/12/IMG_1778-scaled.jpg 。写真の取得・再利用は撮影者である利用者の明示許可に基づく。全ページのタイトル下に「夢じゃない どれもすべて 二度とない 「日々のうた」」を追加。

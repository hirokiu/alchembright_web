# Person構造化データ監査（2026-10-20）

## 対象と変更

基点mainは1ce5a98。mainにはPersonのJSON-LDがなく、過去の実装は未マージの別ブランチにあった。本変更は現行のabout本文・学位・著書・Humanitext紹介を保持して追加する。

aboutだけにschema.org/ProfilePageとmainEntityのPersonを出力する。本人の識別子は `https://www.alchembright.com/about/#person`。データと可視プロフィールの公式リンクは `src/data/person.mjs` を共用する。氏名、別表記、所属、学位、研究領域は公開済み資料に限定。生年月日、私的連絡先、ロゴを本人写真として扱う情報は追加しない。

## 本人との対応を確認した公開資料

|資料|確認内容|JSON-LDでの扱い|
|---|---|---|
|[researchmap](https://researchmap.jp/hiroki_u)|上松大輝／Hiroki UEMATSU、NII・東京経済大学、博士（情報学）、下記ORCIDへの直接リンク|sameAs|
|[ORCID](https://orcid.org/0000-0003-4215-3112)|公開APIの氏名Hiroki UEMATSU、researchmapとGitHubから同一IDへのリンク|sameAs・identifier|
|[Google Scholar](https://scholar.google.com/citations?user=0b03ZwEAAAAJ)|NII所属・nii.ac.jp認証済みメール、本人サイトへのリンク、地震・場log・Wikibase等の論文が一致|sameAs|
|[NII特任教員一覧](https://www.nii.ac.jp/faculty/list/project-profs/)|情報学プリンシプル研究系の上松大輝から同じresearchmapへリンク|subjectOf。複数人の一覧なのでsameAsにはしない|
|[NII研究センター](https://www.kmcs.nii.ac.jp/about/member.html)|特任研究員として掲載|可視の参考リンクを維持|
|[東京経済大学](https://www.tku.ac.jp/department/teacher/) → [個別プロフィール](https://gyoseki.acoffice.jp/tkeihp/KgApp/k03/resid/S000258)|上松大輝／UEMATSU Hiroki、特別招聘教授、研究分野が一致|個人ページをsameAs。セッションIDは除去|
|[GitHub](https://github.com/hirokiu)|本人指定のリポジトリ所有者、同じORCIDへのリンク|sameAs|

researchmapはブラウザーで確認（自動取得では403）。ORCID公開APIの名前だけで所属まで推定していない。氏名検索だけでは本人確認としない。

バスケットボール選手の上松大輝（Daiki Uematsu、daiki-uematsu.com）を除外した。また、英字名が一致する経済学分野の別研究者（Scholar ID GT6LhVYAAAAJ）も除外した。本人の研究領域、所属、相互リンクで照合した。これら別人の情報はJSON-LDにもプロフィールにも追加しない。

## 検証と更新

`npm test` は正しい識別子、別人の除外、JSON文字列のHTMLエスケープ、他ページ・実行可能スクリプト・不正なJSONの拒否を確認する。`npm run migration:verify` は生成HTMLのaboutに正確なJSON-LDが1件、他ページには0件であることを検証し、従来のアーカイブ本文照合とスクリプト禁止を維持する。

これはローカルの構文・内容・出力検証であり、Googleによるインデックス登録や検索表示の保証ではない。PR公開前の外部リッチリザルトテストは未実施。マージ後に[Rich Results Test](https://search.google.com/test/rich-results)とSearch ConsoleのURL検査で公開URLを確認する。所属変更時には可視プロフィールとデータを同時に変更し、証拠URLと確認日も更新する。

仕様参考：[schema.org/Person](https://schema.org/Person)、[Google ProfilePage](https://developers.google.com/search/docs/appearance/structured-data/profile-page)。

### このPRのローカル検証結果

2026-10-20実施：ユニットテスト22件成功、Astroの49ファイルでエラー・警告0、本番モードで738ページ生成。生成HTML738ページと移行本文432件の検証は失敗0、未解決メディア0。VPSパス監査テストも成功した。JSON-LDはaboutの1件だけに存在し、共有データとの完全一致を確認した。外部検証サービスでの判定、公開後のGoogleによる取得状況はこの結果に含まない。

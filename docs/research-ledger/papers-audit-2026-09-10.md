# 論文追加・外部DB照合（2026-09-10）

ORCID公開works 26件、Google Scholar本人プロフィールの取得可能な先頭20件、出版社・学会・Web検索を照合。論文・予稿等25件を追加し、マスター38件（publications 33件、研究3件、所属1件、研究費1件）とした。33件にはエラータ・プレプリント・予稿を含むため「査読論文33本」と表現しない。

[確認用スプレッドシート](https://docs.google.com/spreadsheets/d/1uXB0lO2c1hohgacnckK-7YlRXDA2-EIBSWRkpjlkwdo/edit)の「Researchmap分類」で、日本語の本人選択と分類メモを編集できる。提案は論文17件・MISC8件。選択は本人判断としてJSONに保存し、最終カテゴリ変更は種別・出典との整合性をWorkが確認して反映する。論文と発表行為は別レコードにする。

シートに先行して入力されていた確認済み6件を保存。本人確認だけを根拠にverificationや公開方針を変更していない。今回追加25件は未確認・needs_review・withheld。

## 追加一覧

| 年月日 | 題名 | 提案 | 根拠 |
|---|---|---|---|
| 2004-07-02 | 場log：Weblog環境における位置情報利用の提案 | 論文 | [原典](https://www.jstage.jst.go.jp/article/jsaisigtwo/2004/SWO-006/2004_07/_article/-char/ja/) |
| 2005 | タグ付けされた場所に基づいたコミュニケーション支援 | 論文 | [原典](https://www.jstage.jst.go.jp/article/pjsai/JSAI05/0/JSAI05_0_35/_article/-char/ja/) |
| 2005 | ActionLog：移動履歴に基づく位置情報付きWeblogの自動生成 | 論文 | [原典](https://www.jstage.jst.go.jp/article/pjsai/JSAI05/0/JSAI05_0_37/_article/-char/ja/) |
| 2005 | 2004年度人工知能学会全国大会スケジューリング支援システムの開発と運用 | 論文 | [原典](https://www.jstage.jst.go.jp/article/pjsai/JSAI05/0/JSAI05_0_8/_article/-char/ja/) |
| 2006 | ActionLog：行動に着目した実世界コンテクストに基づく情報共有 | 論文 | [原典](https://www.jstage.jst.go.jp/article/pjsai/JSAI06/0/JSAI06_0_223/_article/-char/ja/) |
| 2020 | ソーシャルメディアを用いたSpatial Knowledge Graphの構築 | 論文 | [原典](https://www.jstage.jst.go.jp/article/pjsai/JSAI2020/0/JSAI2020_1O4GS404/_article/-char/ja/) |
| 2023 | 地震語彙の構築と地震LOD | 論文 | [原典](https://www.jstage.jst.go.jp/article/pjsai/JSAI2023/0/JSAI2023_2B6GS301/_article/-char/ja/) |
| 2024 | 地震LODの拡張と利活用 | 論文 | [原典](https://www.jstage.jst.go.jp/article/pjsai/JSAI2024/0/JSAI2024_3L1OS3a05/_article/-char/ja/) |
| 2025 | 地震および災害事例のLOD化と相互運用性の向上 | 論文 | [原典](https://www.jstage.jst.go.jp/article/pjsai/JSAI2025/0/JSAI2025_2K1OS602/_article/-char/ja/) |
| 2020 | [A14] 「夕暮れ映像祭2019」とコミュニティ実践：地域アーカイブ連携を支えるショーケースとシステムの構想 | MISC | [原典](https://www.jstage.jst.go.jp/article/jsda/4/2/4_97/_article/-char/ja/) |
| 2020 | [25] コミュニティアーカイブ連携のためのメタデータスキーマについて | MISC | [原典](https://www.jstage.jst.go.jp/article/jsda/4/s1/4_s27/_article/-char/ja/) |
| 2023-05-16 | Development of a high-performance seismic phase picker using deep learning in the Hakone volcanic area | 論文 | [原典](https://doi.org/10.1186/s40623-023-01840-5) |
| 2022-11-29 | Development of High-Performance Seismic Phase Picker Using Deep Learning in Hakone Volcanic Area | MISC | [原典](https://doi.org/10.21203/rs.3.rs-2253946/v1) |
| 2005 | Communication support with location-based information | 論文 | [原典](https://doi.org/10.1109/AMT.2005.1505344) |
| 2022-12-17 | Design for Data Structures: Data Unification and Federation with Wikibase | 論文 | [原典](https://pub.orcid.org/v3.0/0000-0003-4215-3112/work/129380274) |
| 2023 | Earthquake Ontology and LOD | MISC | [原典](https://ceur-ws.org/Vol-3632/ISWC2023_paper_475.pdf) |
| 2023 | Earthquake LOD: Seismic Dataset Construction with Ontology Oriented Design Patterns | 論文 | [原典](https://ijckg2023.knowledge-graph.jp/pages/proc/paper_17.pdf) |
| 2025 | Exploring LLM To Extract Knowledge Graph From Academic Abstracts | MISC | [原典](https://ceur-ws.org/Vol-4085/paper49.pdf) |
| 2025-03 | 古事類苑の知識グラフ化と言語リソースとしての活用 | 論文 | [原典](https://anlp.jp/proceedings/annual_meeting/2025/pdf_dir/E4-3.pdf) |
| 2024-07-19 | 引用・参考関係を考慮した和歌集の知識グラフ構築 | 論文 | [原典](https://ipsj.ixsq.nii.ac.jp/records/237419) |
| 2014-03-11 | ミックスダウンの視覚化による支援システムの開発 | 論文 | [原典](https://ipsj.ixsq.nii.ac.jp/records/104715) |
| 2015-03-05 | MEMS加速度センサーユニットを用いた市民参加型地震波計測ネットワークの構築 | MISC | [原典](https://www.interaction-ipsj.org/proceedings/2015/data/20150226/A36.pdf) |
| 2005 | ActionLog：実世界指向コンテンツ記述支援システム | MISC | [原典](https://www.interaction-ipsj.org/archives/paper2005/pdf2005/interactive/B227.pdf) |
| 2006 | A Weblog Grounded to the Real World | 論文 | [原典](https://m.aaai.org/Library/Symposia/Spring/ss06-03.php) |
| 2004 | Balog: Location-based information aggregation system | MISC | [原典](https://citeseerx.ist.psu.edu/document?doi=2213f45740b0fa646ba61343ace6d378bafee6ee&repid=rep1&type=pdf) |

## 判定と未確定事項

- 学術誌論文、会議論文・研究会論文、ポスター・インタラクティブ発表予稿、プレプリントをsubtypeで区別。査読の有無と掲載カテゴリーは独立し、原典で未確認の査読はunknown。既存分類方針を参照。
- 地震波検測論文（2023）は出版版、Research Square（2022）はプレプリントとして関連付けた。独立した査読論文2本に数えない。
- IEEE Big Data 2022は同一DOIにORCID put-code 129380274 / 160050928がある。ORCIDは複数登録元をまとめることがあるため、台帳は1成果として全put-codeを出典に保持した。単純な削除対象とは断定しない。
- AMT 2005はDOI登録が282-282。フルペーパーか要旨かを本人確認。著者のイニシャルを推測で展開しない。
- IJCKG 2023の公式公開PDFはDOI・ISBNが仮文字列。DOIを作らず、原典URLと開催年を保存。最終書誌・査読範囲を本人確認。
- ISWC 2023/2025はポスター論文としてMISC案。査読範囲は未確定。論文として掲載する方針も本人選択で記録可能。
- Scholarの「2004年度人工知能学会全国大会スケジューリング支援システムの開発と運用」は、表示された2004年・4著者に本人名がなく、J-STAGEの2005年・6著者と食い違う。出版社版を登録しScholar誤結合候補をSCHOLAR-001として保持。
- Google ScholarはNIIメール認証・Alchembrightへのリンクで本人を確認。Webツールの取得結果は約1.7年前のクロール表示、先頭20件のみ。現在の全件取得や欠落判定はしていない。syncedとは扱わない。
- ORCIDで照合できたレコードにはput-codeとURLを追加したが、書誌全項目の一致は未確認のためneeds_review。検索で見つからないことを未登録と断定しない。
- ORCIDのMetadata Schema for Community Archive Cooperation（資料DOI・版DOI）、Scholarの場logシステムと同名近似候補、インタラクション2006の発表は観測・候補として保存。今回の論文一覧への無条件追加はしない。
- 経済学の同名Hiroki Uematsu、物理学の同名著者、Daiki Uematsuは対象外。2026年のMulti-Stage Agent論文は上松が著者に含まれず除外した。

## 本人が更新する項目

1. 「Researchmap分類」の本人選択と分類メモ、活動台帳の本人確認を入力する。
2. 原典を確認した後、Researchmapへ必要な追加・分類変更・著者修正を手動で行い、掲載先状況に個別URL/IDを記録する。
3. ORCIDの同一DOIの複数登録元と著者表記、Scholarの誤結合・年・著者を確認する。

Researchmap・ORCID・Scholarへの書込みは行っていない。Web UIの担当範囲と既存公開用APIは維持する。

## 検証

全41テスト合格、Astro check 54ファイルでエラー・警告0、734ページbuild成功。最終台帳38件でスキーマ検証エラー・警告0。実シート9データタブの読み戻しから候補JSONを生成し、ledger・review-queue・review-decisionsの完全一致を確認。表範囲と日本語ドロップダウンを確認済み。

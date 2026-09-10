# Research Activity Ledger v1

**現在の編集フロー**: [Googleスプレッドシートで確認・管理する運用](sheets-workflow.md)に対応。本人はシートで編集し、Workが検証・差分確認してGitHubのJSONへ反映する。JSONの直接編集も継続でき、競合は取り込み時に検出する。

**更新版（本人確認反映）**: 現在のマスターは13件（研究3・論文等8・所属1・研究費1）。下記の初期5件の説明は初回監査時点の記録です。[確認用データ一覧](review-data-2026-09-10.md)、[分類方針](classification-policy.md)、[本人確認事項](owner-decisions-2026-09-10.md)を参照してください。今回更新・追加した9件は本人レビュー待ちで、公開供給は所属1件のままです。

重複候補は `research-ledger/review-queue.json` に保存。公開観測の33レコードはそのまま保持し、自動統合・削除していません。

2026-09-10。対象は研究者 **上松大輝 / Hiroki UEMATSU**。研究者番号00897423、researchmap R000018545、ORCID 0000-0003-4215-3112を公開プロフィールで確認。Daiki UEMATSUおよび同英字名の別分野研究者を氏名だけで取り込まない。

## 1. 現状監査

調査基準は main `e8eb8fb`。Astro 7.3.1 / TypeScript / Node 24、JSONのWorks、Markdownの旧記事。`src/data/works.json` は研究3件・匿名事業3件。`ResearchProfile.astro` は研究者紹介とResearchmapリンクを持つ。業績マスター・同期処理は未実装。根拠文書は `docs/works-sources.md`、`docs/profile-and-navigation.md`。

remote main/develop/drafts/docs/wordpress-migration-auditを確認。developにmainとの差分なし。PR #1は移行済み・merged、調査時点で他のPR/Issueなし。この変更は `feature/research-ledger` に隔離し、mainへのマージや本番公開は行わない。

既存Work「Astro移行計画を整理」(01a07056-8192-7a72-94ee-01779fa9416b) を確認。状態はidle。履歴取得では直近ターン本文が返らなかったため、最新repoを実装状態の根拠とする。

Web検索のキャッシュは旧WordPressを表示したが、2026-09-10の直接HTTP取得はAstro資産を返した。旧キャッシュを現行サイトと判断しない。

Researchmap公開ポータルを直接HTTP取得し、論文13 / MISC17 / 経歴1 / Works1 / 研究課題1、計33リンクを観測。`research-ledger/observations/researchmap-2026-09-10.json` にURL、外部ID、原表示、取得日、取得HTMLのSHA-256を記録。ログイン情報・非公開レコードは取得していない。これはポータル表示範囲の棚卸しであり、非公開情報や個別詳細まで含めた全件照合ではない。

初期マスターは既存Worksの研究3件、出版社照合済みの研究会資料1件、公開Researchmapに明記された所属1件の計5件。前4件は未確定事項がありneeds_review・withheld。所属1件のみ公開供給可能。33観測と5マスターを混同しない。英語題名、査読、プロジェクト日付、担当役割を推測して補わない。

## 2. 台帳データモデル

正本は `research-ledger/ledger.json`、実行可能スキーマは `scripts/research-ledger/schema.mjs`。JSONは既存Worksと同じ形式で差分レビューしやすい。Zodを固定依存に追加。`ledger.schema.json` はエディタ補助用の生成物で、相互参照やrefinementは表現しきれないため、必ずローカル検証を実行する。

| 属性 | 意味 |
|---|---|
| id | `ral-<UUID v4>`、登録時に発行して不変。初期投入5件は固定値を割当済み。外部IDや題名から再生成しない |
| kind / subtype | publications, presentations, projects, grants, awards, career, education, academic_service, events, datasets, software, memberships。細分類でaffiliation/reviewing/workshop/role等を表す |
| title / contributors.name | ja/en、少なくとも一方必須。未確認言語はnull。翻訳は原題と同一視せず確認後に登録 |
| date / end_date / ongoing | YYYY / YYYY-MM / YYYY-MM-DD。精度を保持。不明はnull。ongoing=falseだけで終了済みとは断定しない |
| contributors | 著者順を保持した配列、人物IDと役割。本人のperson_id必須、共著者英字名の推測をしない |
| peer_reviewed | yes/no/unknown/not_applicable。掲載区分と独立 |
| peer_review_scope | 任意追加属性。full_text / abstract / none / unknown / not_applicable。省略時は範囲未確認。Astro供給APIにも含む。じんもんこん2024はabstractで全文査読と区別 |
| doi / urls | DOI本体、HTTP(S) URL。構文検証のみで到達性・実在性を保証しない |
| project_ids / related_ids | project参照と関連成果。発表と論文は別レコードとして関連付け |
| bibliographic | venue/volume/issue/pages。公開日と会議実施日は別レコードで管理 |
| organization / funding | 所属・機関、資金配分機関/制度/課題番号。金額等は将来の明示的スキーマ拡張で追加 |
| researchmap_category / sync | 外部区分、外部ID、ORCID put-code（sync.orcid.external_id）と6系統の状態 |
| evidence | URL、取得日、supports（どの項目の根拠か）、確認範囲。公開できる根拠のみ |
| last_verified_at | 出典を最後に確認した日。全項目解決済みという意味ではない |
| verification / review_notes | verified / needs_reviewと未確定事項 |
| publication_status | public / withheld。後者もpublic GitHub内では誰でも読める。秘密情報保存の手段ではない |
| web_work_slug | 既存Worksとの接続キー。台帳IDと公開URLを分離 |

査読依頼原文、匿名化前の業務データ、未公開研究費情報はこのpublicリポジトリに入れない。非公開情報が必要になった時は別の非公開保管庫を設け、公開可能な要約のみ本台帳に渡す。

## 3. Researchmapマッピング

以下は台帳の対応方針。自動投稿APIの実装ではない。実際の登録欄・選択肢は手動更新時に再確認する。

| 台帳kind | Researchmap区分キー / 表示欄 | 判断 |
|---|---|---|
| publications | published_papers / 論文、misc / MISC | 原著・研究論文と、短報・要旨・解説等を区別。研究会論文は本人判断を保持 |
| presentations | presentations / 講演・口頭発表等 | 実際の発表。要旨の掲載とは別成果 |
| projects | works / Works、research_projects / 研究課題、others / その他 | プロジェクトだから研究費欄へ入れるという推論はしない |
| grants | research_projects / 共同研究・競争的資金等の研究課題 | 課題番号・役割・期間を照合 |
| awards | awards / 受賞 | 受賞者・授与機関・日付 |
| career | research_experience / 経歴 | 所属・職位・期間 |
| education | education / 学歴 | 学位情報はプロフィール基本情報でも本人が更新。取得予定と取得済みを分ける |
| academic_service | committee_memberships / 委員歴、academic_contribution / 学術貢献活動 | 委員と査読をsubtypeで区別 |
| events | academic_contribution / 学術貢献活動、social_contribution / 社会貢献活動、presentations / 講演 | 主催・運営と講演者の役割を区別 |
| datasets, software | works / Works、others / その他 | DOIがあっても論文扱いしない。説明論文は別登録 |
| memberships | association_memberships / 所属学協会、committee_memberships / 委員歴 | 所属と役職を区別 |

公式FAQは「査読なし=MISC」という旧来の分類を要求しておらず、研究者自身の判断を案内している。既存カテゴリを根拠なく一括移動しない。参照: https://researchmap.jp/public/FAQ-1 、 https://researchmap.jp/outline/rmapv2/rmapV2_all.pdf 。

## 4. 外部DB同期状態

researchmap / orcid / google_scholar / university_db / alchembright / cvを各レコードで管理。

- tracked: 管理対象。存在や内容の一致は未確認。checked_at付きでもsyncedとは限らない。
- synced: URL・外部ID・比較日・その時点のcontent_hashを必須とする。実際に掲載先と照合した担当者だけが設定する。
- needs_review: 相違、未確定、同期後の台帳変更。理由をnoteで記録。
- not_applicable: 適用外。理由必須。不明を適用外としない。

`contentHash(record)` は同期状態・監査情報を除いた正規化JSONのSHA-256。`syncStatus` はハッシュが変わると保存値がsyncedでもneeds_reviewを返す。完全一致を厳密に確認できる範囲でのみsyncedを宣言する。初期データにsyncedはない。将来、外部DB固有のフィールド変換を実装するときはtarget別projectionを版管理する。

ResearchmapとORCIDは公開レコードとして照合、Google Scholarは監査対象であり正本の上書き元にしない。Scholarの自動スクレイピング・自動書込みは実装しない。大学DBとCVのURL・版は本人確認後に設定。外部データの取得→観測保存→差分レビュー→マスター修正→本人の手動反映→再照合の順。自動上書き・削除・双方向同期なし。

## 5. Astro統合仕様

ビルド時に `src/lib/research-ledger/index.ts` から `getResearchActivities(kind?)` / `getProjectActivities(projectId)` を呼ぶ。v1 APIは同期関数。Astroのfrontmatterで利用する。CLI `npm run ledger:export --silent` も同じ `{schema_version:1, records:[...]}` を標準出力に返す。

スキーマ違反は例外としてビルドを停止。publicかつverifiedだけを返し、sync/evidence/review_notes等を除いた許可属性だけを射影。除外レコードへの参照も落とす。日付降順・同日ID順。日時未詳は末尾。ローカライズ表示はja/enの存在する方を選び、nullから英訳を生成しない。マスターをclient scriptやpublic/へ丸ごとコピーしない。

Publicationsはkind=publicationsで取得しresearchmap_category別に論文/MISCを表示。Projectsはkind=projects、CVはcareer/education/grants/awards等を選ぶ。現在は確認済み所属1件だけが返るため、空のカテゴリはUI担当が空状態または非表示を扱う。既存Worksは存続し、接続時にはweb_work_slugを用いて同一プロジェクトの二重表示を避ける。研究3件の確認後にデータの所有権を台帳へ移す。URL・既存記事は変更しない。

## 6. Work間の責任分界

| 領域 | このWork | Astro移行計画を整理 |
|---|---|---|
| マスター・ID・出典・品質検証 | 主担当 | API利用、修正要望 |
| 外部DB観測・同期状態・分類 | 主担当 | 公開導線の設計 |
| src/lib/research-ledger、CLI、schema | 主担当 | 利用例の検証 |
| ページ・ナビ・デザイン・Astro表示・SEO | データ仕様の支援 | 主担当 |
| Works要約・画像・説明文 | 根拠とIDを供給 | 主担当 |
| Researchmap編集 | 差分提案まで | 上松本人が実施 |

連携文書は本ディレクトリを正規窓口とする。共通package.jsonは台帳用コマンド・Zod追加、build冒頭の検証、既存testへの台帳テスト追加のみ。src/data/works.json、既存Astroページ、公開workflowは編集していない。UI側はこの機能PRを取り込んだ後にAPIを使う。破壊的なAPI変更はschema_versionを上げて別PRにする。

## 7. 実装ロードマップと運用

1. 本PR: 観測33件、マスター5件、Zod検証、重複検出、CLI、供給API、テスト。公開表示切替はしない。
2. データ整備PR: DOI・著者順・正式英語題名・査読有無を出版社と照合。13論文・17MISCの同一成果候補を整理し、安定IDへ外部IDを対応付ける。残りの分野も根拠ごとに小さく追加。
3. UI担当PR: Publications/Projects/CVをAPIへ接続、旧Worksとの接続・空状態・日英表示・構造化データを検証。
4. 本人: Researchmap手動更新、ORCID/大学DB/CVの照合。更新した外部IDと日付を台帳へ記録。
5. 毎月・成果公開時: ledger:reportで未解決/変更差分を確認。自動定期実行は本PRの対象外。

新規登録は `node -e "console.log('ral-'+require('node:crypto').randomUUID())"` でIDを発行し、出典と未確定点を記入。項目を確認するまではneeds_review/withheldで保存。関連IDは既存IDを使う。

```sh
npm ci
npm run ledger:validate
npm run ledger:test
npm run ledger:report
npm run ledger:export --silent
npm run check
npm run build
```

既存CIのnpm test/buildに組み込んで検証する。DOI重複・外部ID重複・参照不整合はエラー。同じkind/題名/年の候補は警告（自動統合しない）。論文と発表の同題名は意図した別成果として扱う。日付・URL構文は検証するが、出典の真正性や著者全件確認は人のレビューを要する。

## 初期実装の検証結果

Node 24.19.0、ASTRO_TELEMETRY_DISABLED=1で検証。npm test: 29件（台帳10件を含む）合格。Astro check: 52ファイル、エラー/警告/ヒント0。build: 734ページ。migration:verify: failures=0、pending_media=0、legacy_links=11（既存の旧リンク報告）。VPSパス監査1件合格。ledger:validate: 5件、警告0。台帳を既存ページへ表示する結合UIはUI担当の次PRで検証する。

### 本人確認反映後の検証

2026-09-10更新版: 13レコード、スキーマ検証エラー/警告0。全31テスト（台帳12）合格、Astro checkエラー/警告0、734ページbuild成功。任意属性peer_review_scopeを追加し、概要査読と全文査読の混同を防止。重複警告は同じ2レコードが日英両題名で一致しても1件にまとめる。

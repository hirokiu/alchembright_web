# Googleスプレッドシートで確認・管理する運用

2026-09-10。GitHub側は既存のJSON形式を採用する。スプレッドシートは本人の編集・確認画面、GitHubのJSONは差分確認を経た確定版。Astroへの供給APIは変更しない。

[研究活動台帳・確認と管理](https://docs.google.com/spreadsheets/d/1uXB0lO2c1hohgacnckK-7YlRXDA2-EIBSWRkpjlkwdo/edit)をMy DriveのChatGPTフォルダに作成。初期投入は活動13件、著者・役割33行、出典30行、掲載先状況78行、重複確認11件。Researchmapの公開観測33件は従来どおりrepoに保存する。

## 上松本人の操作

1. 「使い方」を読み、「活動台帳」の題名・日付・分類案を確認する。
2. 「本人確認」を未確認／確認済み／要修正から選び、「修正メモ」に判断や修正依頼を書く。値が確定していれば題名等を直接編集してよい。
3. 著者順は「著者・役割」、掲載誌・頁・研究費は「書誌・研究費」、根拠は「出典」、重複候補は「重複確認」で確認する。判断に迷う場合は修正メモだけでよい。
4. このWorkに「研究台帳のスプレッドシートを読み取り、変更を確認してGitHubへ反映してください」と依頼する。

ID・見出し・管理情報は変更しない。レコードを除外したい場合は行を消さず、修正メモに理由を書く。日付は文字列のYYYY／YYYY-MM／YYYY-MM-DDで入力する。セルに数式を入れない。複数の著者・URL・出典は別行で、順序列を1から連続させる。新規業績はWorkに根拠を渡してIDを発行・初期行を用意する方法が簡単。

本人確認は公開・検証完了・外部DB反映とは独立。「確認済み」だけでは公開方針やverification、syncedへ自動変更しない。修正メモの内容をWorkが根拠と照合し、実データの修正として差分にする。Researchmapへの入力は引き続き本人が行い、反映後のURL・ID・照合日を掲載先状況へ記録する。

重複確認の判断はneeds_review（未確認）、confirmed_duplicate（重複と確認）、not_duplicate（別成果と確認）、resolved（対応完了）。判断履歴を残し、統合・削除は別の明示的変更として扱う。

## JSONを直接編集する場合

`research-ledger/ledger.json`を編集し、`npm run ledger:validate`を実行してGitHubへ保存する。本人確認は`review-decisions.json`、重複判断は`review-queue.json`に保存する。JSONエディタでは既存の`ledger.schema.json`を利用できる。

その後Workにシート更新を依頼する。Workは先にシートの未反映編集を確認し、GitHubとシートの差分を統合してから再出力する。古いシートをそのまま取り込むとbase_hash不一致で停止する。JSONとシートを同時に編集した場合も、片方を無条件に上書きしない。

## Work向け変換手順

実装は`scripts/research-ledger/sheets.mjs`。認証・Sheets API呼び出しはWorkのGoogle Driveコネクタを使用し、CLIに認証情報を保存しない。CLI単独ではGoogleやGitHubへ通信しない。

### GitHubからシートへ

```sh
npm run ledger:sheets -- export /tmp/ledger-workbook.json HEAD_COMMIT
```

`HEAD_COMMIT`は実際の参照コミットに置き換える。出力は`{format_version:1,tabs:{シート名:[[見出し],[データ行],...]}}`。使い方タブ以外の9タブ（Researchmap分類を含む）を含み、日付や課題番号等は文字列。空欄はnull、継続中はTRUE/FALSEに対応する。順序列により配列順を保存する。

シートへ書く前に未反映の本人編集を読み取り、今回反映対象に含めるかを確認する。更新時はデータを一括で書き、古い末尾行が残らないようにする。TEXT形式＋stringValue、継続中だけboolValueを使い、USER_ENTEREDによる日付・数値変換を避ける。表・入力候補・固定行・列幅を維持し、行追加に合わせてテーブル範囲を拡張する。

### シートからGitHubへ

1. 対象ブランチの最新状態を取得し、シートの管理情報・全9データタブを読む。初期13件の範囲に固定せず、現在のグリッド・表の範囲を確認して分割取得する。取得前後のDrive更新日時を比較し、読取り中に編集された場合は全体を再取得する。
2. セルの`userEnteredValue`を取得する。stringValueはそのまま、boolValueは真偽値で保持する。numberValueやformulaValueを表示文字列へ変換して隠さず、エラーとして本人へ修正箇所を示す。未設定セルは空文字列、末尾空行は省略可能。見出し配列も含め上記JSON形式にまとめる。
3. 次のコマンドで、新しい候補ディレクトリへ変換する。

```sh
npm run ledger:sheets -- import /tmp/ledger-workbook-from-sheets.json /tmp/ledger-candidate-NEW
```

4. 候補3ファイルとrepoの差分を確認する。本人確認・メモと実データ修正を区別し、出典が必要な変更は照合してから反映する。既存の未確定点を無条件に解消しない。候補をrepoへ反映し、`npm run ledger:validate`、`npm run ledger:test`を実行、影響に応じてcheck/buildも実行して小さいコミット・PRとして保存する。
5. GitHubへ反映した確定版を再出力し、シートの管理情報も含めて更新する。書く直前に更新日時を再確認し、読取り後の本人編集があれば再取得・統合する。読み戻して値が一致することを確認する。

変換は必須項目、日付・DOI・URL、Researchmap分類、参照先、著者順、掲載先6系統を既存スキーマで検証。列名変更、数式、数値への自動変換、重複ID、管理情報の不整合も検出する。台帳レコード・重複確認行の削除は停止する。著者や根拠など子行の削除は差分レビューで妥当性を確認する。

`base_hash`は出力時のledger＋review-queue＋review-decisions全体のハッシュ。現在のGitHub側データと違えば取り込み停止。`base_commit`は参照用で、競合判定にはハッシュを用いる。これによりJSON直接編集との取り合いを検出する。CLIはマスターへの直接上書きを行わず、存在しない候補ディレクトリにのみ書き出す。

## 責任分界と検証

このWorkはシートとJSONの変換・データ品質・差分レビュー・GitHub登録を担当する。「Astro移行計画を整理」は従来の公開用APIを使い、Sheetsへのアクセスや本人確認のUIをWebに実装する必要はない。公開用APIにシートURLや本人確認メモを追加しない。

初回は実シート8タブを読み戻し、候補3ファイルの全項目が元の台帳と一致することを確認済み。自動テストでは往復変換、順序保持、競合停止、削除防止、数式・型変換検出、本人確認と公開状態の独立を検証する。将来の毎回自動同期は設定していない。Workへの依頼時に反映する。

検証結果: Node 24.19.0、全39テスト合格（台帳20）、台帳13件エラー・警告0、Astro check 54ファイルでエラー・警告0、734ページbuild成功。

## Researchmap分類タブ（追加）

ID・題名・提案分類・提案理由は参照欄。「本人選択」は未決定／論文／MISC／講演・口頭発表等の日本語選択肢で、「分類メモ」は自由記述。review-decisions.jsonのresearchmap_category / classification_noteへ保存する。活動台帳のresearchmap_categoryはWorkによる整合性確認後に変更するため、選択のみで公開・外部DBの状態を変更しない。講演・口頭発表を選んだ論文は、発表レコードを別に作るか本人の意図を確認する。

旧8タブ形式は分類判断のない状態に限り取り込み可能。分類判断を保存した後のタブ欠落はエラー。追加後は9データタブを読み戻して確認する。初期13件に対して論文等25件を追加し、現在は38件。

## 共著者分類照合タブ（参照資料）

[共著者分類照合](https://docs.google.com/spreadsheets/d/1uXB0lO2c1hohgacnckK-7YlRXDA2-EIBSWRkpjlkwdo/edit#gid=1327922629)は33件の比較資料。共著者側の分類、根拠URL、今回の追加提案、未確認の範囲を示す。2026-09-10の10件は検索保存情報・Researchmap由来のJ-GLOBALで確認、23件は未確認。

本タブは9データタブの往復変換対象に含めず、取り込み時の判断根拠として読む。生成元はresearch-ledger/observations/coauthor-classifications-2026-09-10.json。確定分類を二重入力させず、既存「Researchmap分類」の本人選択・分類メモを唯一の判断入力欄として使う。今回の推奨と従来の提案分類が異なる5件は、本人の選択を確認後にWorkがマスターと根拠を更新する。データ3ファイルは変更していないため、既存base_hashは有効なまま。

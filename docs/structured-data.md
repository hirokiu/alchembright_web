# 研究者と研究プロジェクトの構造化データ

schema.orgのJSON-LDをHTMLのheadへ埋め込みます。見た目は変更しません。

- 各ページ：WebSiteとWebPage。
- about：ProfilePageのmainEntityとしてPerson。本人を `https://www.alchembright.com/about/#person` で識別。
- 研究3件のWorks詳細：ResearchProjectをmainEntityとして関連付け。

本人の氏名・別名・Researchmap・研究領域は `src/data/researcher.json` で管理し、プロフィール表示とJSON-LDで共用します。研究名・説明は既存 `src/data/works.json` の表示内容を使用します。匿名業務の会社名や場所、未確認の職歴・識別子・著者情報は追加しません。

研究管理台帳PR #2はまだ取り込んでいません。今後は公開・確認済みデータの供給APIに接続し、画面に表示する内容とJSON-LDを同じデータから生成します。台帳のレビュー用属性や未確認データを直接埋め込まないでください。論文リンクにはポータル等も含まれるため、リンクを一律にScholarlyArticleとして出力しません。正式書誌データの表示を実装した段階で対応します。

実装は `src/lib/structured-data.mjs`。安全なJSONシリアライズ、公開項目の限定、ページと型の対応をnpm testで確認します。プレビューでも識別URIは本番の固定URIを使い、プレビュー自体のnoindexは既存設定を維持します。

仕様： https://schema.org/Person 、 https://schema.org/ProfilePage 、 https://schema.org/ResearchProject 。構造化データは検索結果での特別な表示を保証するものではありません。

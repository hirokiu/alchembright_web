# 独自ドメイン切替前の確認用公開

現在は移行完了済みで、`main` から https://www.alchembright.com/ へ公開しています。以下は仮公開時の記録です。日常の操作は [記事の追加・更新手順](adding-posts.md) を参照してください。

2026-09-09。利用者が元リポジトリをpublicに変更し、同リポジトリからGitHub Pagesを利用する方針。Pagesは独自ドメインなしで有効化済み。サイトは `https://hirokiu.github.io/alchembright_web/` で確認し、wwwのDNS・独自ドメイン設定は変更しない。

## 公開前に必要なこと

- 契約の制約はリポジトリのpublic化で解消した。
- `https://hirokiu.github.io/robots.txt` の配置。プロジェクト配下の `/alchembright_web/robots.txt` はクロール制御として無効。ホスト直下で次を配信する必要がある。

```text
User-agent: *
Disallow: /alchembright_web/
```

利用者の指定に従い、元リポジトリ直下に `robots.txt` を追加した。ビルドの `/robots.txt` は `src/pages/robots.txt.ts` が生成し、確認用は同じ全拒否の内容になる。ただしプロジェクトURLではクローラーの制御に効かないため、その限界を説明し、利用者がnoindexのみでの先行公開を許可した。ホスト直下用リポジトリは作成していない。ホスト直下のrobots.txtは他のプロジェクトを禁止せず、この確認用パスだけを対象とする。

robots.txtはアクセス制限ではなく、対応するクローラーへの拒否指示。全HTMLにはnoindex,nofollowも付けるが、巡回を拒否したクローラーはこのタグを読めない。確認用サイトには公開済み記事の変換物だけを置く。

## 構成

`.github/workflows/pages-preview.yml` は作業ブランチ `docs/wordpress-migration-audit` の更新で動作する。リポジトリ変数 `PAGES_PREVIEW_ENABLED=true`、Pages Source=GitHub Actions、Custom domainなし、ホスト直下のrobots.txtを事前条件とする。満たさなければ公開しない。利用者の明示許可に基づき、変数 `PAGES_PREVIEW_ALLOW_NOINDEX_ONLY=true` でホスト直下のrobots.txt検証を省略する（有効化済み）。noindexの全ページ検証は省略しない。

```sh
ALCHEMBRIGHT_SITE=https://hirokiu.github.io \
ALCHEMBRIGHT_BASE=/alchembright_web \
PUBLIC_SITE_MODE=preview npm run build
ALCHEMBRIGHT_BASE=/alchembright_web npm run migration:verify
```

環境変数によりAstroの配信元とパスを切り替え、ビルド後に記事本文を含むリンク・画像・RSS・サイトマップをプロジェクト配下へ揃える。原本Markdown・元URL台帳・RSSのGUIDは保持する。全677 HTMLにnoindexを付け、回収待ち画像127 URLは表示確認中として許容する。

本番ワークフローの公開条件は変更していない。確認後の独自ドメイン切替では、プレビューの自動公開を無効にしてから、本番ビルド、Pagesドメイン登録、DNS変更の順に進める。`PAGES_PREVIEW_ENABLED=false` とし、本番用変数の有効化は別途行う。

## 検証対象

全422記事・固定ページの本文主要構造、677 HTMLのnoindex、内部リンクと画像のプロジェクトパス、旧ID移動、canonical・RSS・サイトマップの仮URLを確認する。本番ルート配信のビルドも別途確認する。

参考：[robots.txtの配置場所](https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec#file-location)

## 公開時の確認

2026-09-09：PAGES_PREVIEW_ENABLEDとPAGES_PREVIEW_ALLOW_NOINDEX_ONLYをtrueに設定。公開先は https://hirokiu.github.io/alchembright_web/ 。wwwのDNSとカスタムドメインには変更を加えていない。

# リポジトリの管理・開発ガイド

## 記事の更新と公開

[記事の追加・更新手順](adding-posts.md)を参照してください。記事は `drafts`、開発は `develop` で編集し、確認後にmainへマージします。作業ブランチでは検証のみ、mainでは検証後にGitHub Pagesへ自動公開します。

公開URLは https://www.alchembright.com/ です。移行・独自ドメインへの切り替えは完了し、公開サイトでは検索掲載とクロールを許可しています。

publicリポジトリのため、作業ブランチも閲覧可能です。私的な原文、匿名化前の文章、原本バックアップ、認証情報はGit管理外に保管してください。

## ローカルでの表示と検証

Node.jsのバージョンは `.nvmrc` を使用します。

```sh
npm ci
npm run dev
```

ローカルの `/category/blog/` から記事を確認できます。

```sh
npm test
npm run check
npm run build
npm run migration:verify
```

通常のローカルビルドは確認用でnoindexが付きます。本番公開時はワークフローがproductionモード、独自ドメイン、ルートパスを指定し、`npm run migration:verify -- --release` で検証します。

## 主な構成

```text
src/content/           記事・固定ページ
src/data/              カテゴリー・タグ・Worksなどのデータ
src/pages/             記事・一覧・RSSなどのページ
public/img/blog/       年月ごとのブログ画像
public/img/works/      Worksの画像
public/media/          既存サイトから引き継いだ画像など
migration/inventory/   移行時の棚卸し記録
migration/mappings/    URLやメディアの対応
migration/reports/     移行の検証記録
scripts/migration/     取得・変換・検証処理
```

## 関連文書

- [記事の追加・更新手順](adding-posts.md)
- [独自ドメイン・記事更新・画像保管](domain-and-publishing.md)
- [起動・再変換・画像登録](migration-workflow.md)
- [データモデル](content-model.md)
- [棚卸し台帳](../migration/README.md)

以下は移行時の計画・調査記録です。記載された件数や未完了事項は当時の状態を示します。

- [初回の現状調査](current-state.md)
- [移行計画](migration-plan.md)
- [原本受領チェックリスト](source-data-checklist.md)
- [移行第2段階の結果](phase2-results.md)
- [仮公開時の記録](pages-preview.md)
- [GitHub Pages・DNSの調査](github-pages.md)
- [代替案として検討したVPSへの配置](vps-deployment.md)

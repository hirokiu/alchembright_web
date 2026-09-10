# 独自ドメインへの切り替え・記事更新・画像保管

2026-09-10更新：利用者によるDNS・Custom domain設定後、証明書approvedとHTTPS強制を確認。公開処理をwww.alchembright.comのルート配下へ変更した。その後、利用者の指示でnoindexとrobotsのクロール拒否を解除済み。以下の切り替え手順は作業記録・参照用。

## wwwの切り替え

CNAMEの向き先は `hirokiu.github.io` で正しいが、DNSだけでは完了しない。

1. 現在のDNS設定とWordPressをバックアップし、旧VPSを切り戻し用に残す。note/dev等がwwwへの別名参照になっていないかDNS管理画面で確認する。今回のDNS照会では応答情報を得られなかったため、他ホストへの影響は実測で確定していない。
2. リポジトリの公開処理を独自ドメイン用に準備する。現在 `.github/workflows/pages-preview.yml` はCustom domainが設定されると失敗するガードがある。想定ドメイン `www.alchembright.com` と workflow方式を確認するガードへ変更する。
3. 本番用ビルド値は `ALCHEMBRIGHT_SITE=https://www.alchembright.com`、`ALCHEMBRIGHT_BASE=/`。この設定で記事・画像・内部リンク・RSS・サイトマップを生成して検証する。noindexを継続するかはURL切り替えとは別に決める。現在はpreviewでnoindex,nofollowとrobotsのDisallow。productionにするとそれらを解除するため、公開方針確定時に切り替える。productionでは検証も `npm run migration:verify -- --release` に合わせる。
4. GitHubのアカウントSettings → Pagesでドメイン所有確認を行うことが推奨される。表示されたTXT値を使用し、値を推測しない。
5. リポジトリSettings → Pages → Custom domainに `www.alchembright.com` を設定する。DNSより先にGitHub側へ登録する。今回のActions方式ではリポジトリ内のCNAMEファイルは不要。
6. DNSでwwwの既存A/AAAA等、CNAMEと競合するレコードを置き換え、`www CNAME hirokiu.github.io.` を設定する。httpsやリポジトリ名、パスは含めない。他のホストやMX、ルートドメインの設定は変更しない。
7. 準備済みの独自ドメイン用ビルドを公開し、DNS確認・証明書発行後にEnforce HTTPSを有効にする。DNSや証明書の反映待ちを考慮し切り替え時間を確保する。
8. wwwでトップ、過去記事、画像、分類一覧、RSS、サイトマップとリンク先を確認する。旧URL中のクエリ形式や特殊な転送はGitHub Pagesで別途対応が必要な場合がある。ドメインなしのalchembright.comもwwwへ寄せるなら別のDNS/転送作業として実施する。

2026-09-10に移行ブランチをmainへマージ。現在の公開元ブランチは `main`。mainへのpushで本番サイトを自動更新する。

## 日々の記事更新

1. [記事追加テンプレート](adding-posts.md)を使い、新しいMarkdownをsrc/content/blog/YYYY/に作成。
2. タイトル、重複しないID/URL、日時、カテゴリーID、タグID、抜粋を記入。新しい分類は対応するJSONにも登録。
3. 画像をWeb用に縮小・圧縮してpublic/img/blog/YYYY/MM/へ置き、本文から `/img/blog/YYYY/MM/...` を参照。撮影原本は別のバックアップに保存。photoタグを付ける場合はtag_idsに-10を含める。
4. ローカル表示を確認し、公開ブランチへコミット・push。GitHub上での編集・コミットでも同じ。
5. Actionsが検証、サムネイル生成、記事とカテゴリー/タグ/年月一覧、RSS・サイトマップ生成、Pages公開を実行する。
6. Actionsの成功と公開ページを確認。失敗した場合は修正して再push。通常、以前の成功したサイトが残る。

## 容量と外部画像

ローカル計測：public/imgは15,169,344バイト、公開生成物は約23MB。GitHub Pages公開サイトの上限1GBに比べ現在は小さい。Gitの履歴は画像削除後も残るので、将来の原本・大画像を最初からGitへ入れない運用が望ましい。

GitHub公式：Pagesソースリポジトリの推奨上限1GB、公開サイト上限1GB、月間転送量のソフト上限100GB。独自Actionsでは毎時10ビルドのソフト上限は適用されない。Actions利用枠やGitリポジトリ容量と公開サイト容量は別に考える。

画像を分離する場合のドメイン候補は `img.alchembright.com`。会話中の `img.alchembrithg.com` は綴りが異なるので、そのまま設定しない。

- www.alchembright.com：GitHub Pagesで記事・一覧を配信。
- img.alchembright.com：画像用ストレージとHTTPS配信先へ接続。DNSだけで保存領域ができるわけではない。管理負担を減らすには、画像を保管できるマネージドストレージと配信サービスを選ぶ。VPSでも実現できるが管理は残る。
- 原画像のアーカイブ：Dropbox等、公開用とは別に保管。

外部化後は画像を配信先へアップロードしてHTTP 200を確認し、Markdownから次のように参照して記事を公開する。

```markdown
![写真の説明](https://img.alchembright.com/blog/2026/09/example.webp)
```

現状の本文表示は外部HTTPS画像を扱える。一方、現行サムネイル生成はリポジトリ内の `/img/blog/` のみが対象なので、外部化前にサムネイルURLの指定または信頼する画像ホストからの生成処理を追加する必要がある。外部画像の存在検証も現在は未実装。大画像とサムネイルを一緒に外部保存する方式なら、GitとPagesの容量を継続的に抑えやすい。

既存画像は当面そのまま、新規画像から外部化できる。将来保管先を替えてもimgドメインと画像パスを維持すれば、記事の書き換えを抑えられる。

## 公式資料（2026-09-10確認）

- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits

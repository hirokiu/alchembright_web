# 採用中のロゴ

元画像の左右の構図・文字・太陽と月・色をそのまま残す方式へ変更しました。

- `original-trace/alchembright-original-traced.svg`：元画像の各色をパスに変換した編集用SVG。画像の埋め込みや外部フォントはありません。Affinity等で開き、`original-left` / `original-right` グループを個別に編集できます。
- `original-trace/alchembright-original-upscaled.png`：元画像を1056×1056に補間拡大したPNG。
- `public/favicon.svg`：編集用SVGと同じ内容を採用。
- `public/favicon-32.png`：元画像から縮小した互換用favicon。

原画像は132×132です。輪郭の自動平滑化では細線や文字が崩れたため、色と形の保持を優先し、画素の輪郭をパスにしています。拡大時には画素状の段差が残ります。失われた細部を復元したものではありません。文字はテキストではなく図形なので、文字列を変更する際は該当箇所を描き直します。Affinityでの実機確認は未実施です。

再生成：PillowのあるPythonで `python design/original-trace/trace.py 元画像.jpg`。faviconへの反映は生成SVGをコピーします。

## 不採用の描き直し案（参照用）

以下は採用していません。`build-logo.py`も公開faviconを上書きしないよう変更しました。

# Alchembright 魔法陣ロゴ案

元ロゴの円環・六芒星・太陽・月と桃色～金色を参考に描き直した案。アニメ作品の文字を抽出・トレースせず、独自の幾何学記号フォントを制作。文字列は ALCHEMBRIGHT / SEMANTICS / SEMIOSYS / ALCHEMY / BRIGHT。「Semiosys」は利用者の指定綴りを保持。

- alchembright-logo-outlined.svg：フォント不要のパス版。Affinity等でグループ・個々の図形を編集可能。
- alchembright-logo-editable.svg：文字をテキストとして保持した版。AlchembrightSeal-Regular.ttfを利用者がインストールしてから開く。Affinityでの実機確認は未実施。
- AlchembrightSeal-Regular.ttf：独自の記号文字フォント。英字A～Z（小文字も対応）を入力すると記号になる。OSへの自動インストールは行っていない。
- build-logo.py：WORDSの文字列を編集して再生成。PythonとfontToolsが必要。SVGは通常のサイトビルドで再生成しない。
- public/favicon.svg / favicon-32.png：小サイズ用に文字環や細線を省いた版。

レイヤーはrings / star / moon / sun / lettering / central-rune。各文字の意味はdata-letter属性と生成元WORDSに残す。全体に単語を再配置するには生成スクリプトを使う。中央の記号はAを表す。

これは更新案であり、元ロゴの完全なベクトル化ではない。文字フォントの条件を変えて検討可能。FONT-LICENSE.txtに利用条件を記載。

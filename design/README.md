# Alchembright 魔法陣ロゴ案

元ロゴの円環・六芒星・太陽・月と桃色～金色を参考に描き直した案。アニメ作品の文字を抽出・トレースせず、独自の幾何学記号フォントを制作。文字列は ALCHEMBRIGHT / SEMANTICS / SEMIOSYS / ALCHEMY / BRIGHT。「Semiosys」は利用者の指定綴りを保持。

- alchembright-logo-outlined.svg：フォント不要のパス版。Affinity等でグループ・個々の図形を編集可能。
- alchembright-logo-editable.svg：文字をテキストとして保持した版。AlchembrightSeal-Regular.ttfを利用者がインストールしてから開く。Affinityでの実機確認は未実施。
- AlchembrightSeal-Regular.ttf：独自の記号文字フォント。英字A～Z（小文字も対応）を入力すると記号になる。OSへの自動インストールは行っていない。
- build-logo.py：WORDSの文字列を編集して再生成。PythonとfontToolsが必要。SVGは通常のサイトビルドで再生成しない。
- public/favicon.svg / favicon-32.png：小サイズ用に文字環や細線を省いた版。

レイヤーはrings / star / moon / sun / lettering / central-rune。各文字の意味はdata-letter属性と生成元WORDSに残す。全体に単語を再配置するには生成スクリプトを使う。中央の記号はAを表す。

これは更新案であり、元ロゴの完全なベクトル化ではない。文字フォントの条件を変えて検討可能。FONT-LICENSE.txtに利用条件を記載。

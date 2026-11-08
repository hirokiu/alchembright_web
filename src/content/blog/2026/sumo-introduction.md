---
source_system: markdown
source_id: 1000006
content_type: post
status: publish
title: 交通流シミュレータSUMO入門：インストールから最初のシミュレーションまで
canonical_path: /blog/tech/sumo-introduction/
original_url: null
published_at_local: "2026-11-08T15:52:00"
published_at_gmt: "2026-11-08T06:52:00"
modified_at_local: "2026-11-08T15:52:00"
category_ids: [13]
tag_ids: [-5, -7]
excerpt: Eclipse SUMOのインストール方法と、道路と車両を用意して最初のシミュレーションを実行する流れを紹介します。
conversion_format: markdown
---

交通流シミュレーションを手元で試したいときに便利なのが、Eclipse SUMO（Simulation of Urban MObility）です。オープンソースの交通流シミュレータで、道路ネットワークや車両の移動、信号制御などを扱えます。

私も交通関係の検討で使っているので、今回はインストールから、車両を走らせるまでの基本的な流れをまとめます。

> この記事のインストール情報は2026年11月8日に確認したものです。公式ダウンロードページに掲載されている安定版は **SUMO 1.28.0** です。配布ファイルや対応環境は更新されるため、導入時には[公式ダウンロードページ](https://eclipse.dev/sumo/docs/Downloads.html)も確認してください。

## インストール

### Windows

[公式ダウンロードページ](https://eclipse.dev/sumo/docs/Downloads.html)のWindows欄から、64ビット版のインストーラ `sumo-win64-1.28.0.msi` をダウンロードし、実行します。通常版には、シミュレータ本体のほか、画面上で動きを確認する `sumo-gui` やネットワークを編集する `netedit` が含まれています。

インストール先の `bin` フォルダに実行ファイルがあります。管理者権限を使わずに配置したい場合は、同ページにあるZIP版も利用できます。追加機能を含む「extra」版もありますが、ライセンスや同梱機能が通常版と異なります。

### macOS

[公式ダウンロードページ](https://eclipse.dev/sumo/docs/Downloads.html)のmacOS欄から `sumo-1.28.0.pkg` を取得し、インストーラを実行します。公式案内では、PythonとXQuartzをあらかじめインストールするよう案内されています。特に `sumo-gui` や `netedit` のような画面付きツールにはXQuartzが必要です。

XQuartzの導入後、環境によってはログアウト・ログイン、または再起動が必要になる場合があります。詳しくは[公式のインストール手順](https://eclipse.dev/sumo/docs/Installing/index.html)を参照してください。

### Linux（Ubuntuの例）

Ubuntuでは、公式ダウンロードページに案内されている安定版向けのPPAを追加してインストールできます。端末で次を実行します。

~~~bash
sudo add-apt-repository ppa:sumo/stable
sudo apt-get update
sudo apt-get install sumo sumo-tools sumo-doc
~~~

Linuxの配布形態はディストリビューションによって異なります。Ubuntu以外の環境では、[公式ダウンロードページ](https://eclipse.dev/sumo/docs/Downloads.html)にある各ディストリビューション向けの案内を確認してください。リポジトリによっては開発版も提供されているので、選ぶパッケージとバージョンにも注意します。

### 起動の確認と環境変数

インストール後、端末で `sumo --version` を実行すると、SUMOのバージョンを確認できます。コマンドが見つからない場合は、インストール先の `bin` フォルダにパスが通っているか確認してください。Windowsではインストール先にある `start-commandline.bat` から、環境を設定したコマンドラインを開く方法もあります。

環境変数 `SUMO_HOME` は、SUMOのインストール先を示します。すべての基本操作で手動設定が必須というわけではありませんが、Pythonツールや一部の起動方法では必要になります。必要な場合は、利用している配布形態に合わせてSUMOのインストール先を指定してください。

## 最小のシミュレーションを作る

SUMOで基本的なシミュレーションを動かすには、次の3種類のファイルを用意します。

1. **ネットワーク**：道路や交差点の形を表すファイル（.net.xml）
2. **需要**：車両と、その車両が通るルートを定義するファイル（.rou.xml）
3. **設定**：読み込むネットワークや需要などを指定するファイル（.sumocfg）

まずは、直線道路に車を1台走らせてみましょう。ここでは画面操作で作成できる netedit を使います。詳しい画面と操作は、[公式のHello Worldチュートリアル](https://eclipse.dev/sumo/docs/Tutorials/Hello_World.html)も参照してください。

### 1. 道路ネットワークを作る

neteditを起動し、「File」→「New Network」で新しいネットワークを作成します。NetworkモードでEdgeモードを選び、画面上の異なる位置をクリックして、つながった道路を作ります。

作成できたら「File」→「Save Network」で、たとえば helloWorld.net.xml という名前で保存します。

### 2. ルートと車両を用意する

neteditでDemandモードに切り替え、Routeモードを選びます。車両が通る道路を順に選択して、ルートの作成を完了します。

次にVehicleモードで「vehicle (over route)」を選び、作成したルートの始点をクリックして車両を配置します。「File」→「Demand elements」から需要データを helloWorld.rou.xml などの名前で保存します。ネットワークと需要のファイルは同じフォルダに置いておくと分かりやすいでしょう。

### 3. sumo-guiで実行する

neteditの「Edit」→「Open in sumo-gui」を選ぶと、作成したネットワークと需要を読み込んだ状態でsumo-guiが開きます。ここで「File」→「Save Configuration」を選び、設定を helloWorld.sumocfg として同じフォルダに保存します。

画面のDelayを80 ms程度に設定し、Runボタンを押してみてください。道路上を車両が移動する様子を確認できます。Delayが小さすぎると短いシミュレーションはすぐに終わるため、動きが見えにくい場合があります。

次回からは、保存した .sumocfg ファイルをsumo-guiで開けば、同じシナリオを実行できます。

## 次の一歩

最初は小さな道路と車両だけの構成で十分です。「ネットワーク」「需要」「設定」という3点の関係が分かると、より複雑なシナリオにも進みやすくなります。

道路網はneteditで描くだけでなく、OpenStreetMapのデータを取得してnetconvertで変換することもできます。その先には、信号制御や検出器の設定、PythonからSUMOを操作するTraCIなど、さまざまな拡張が待っています。カスタマイズについては、別の機会にまとめたいと思います。

---
source_system: markdown
source_id: 1000007
content_type: post
status: publish
title: SUMOをPythonから操る：TraCIによるカスタマイズ入門
canonical_path: /blog/tech/sumo-traci-introduction/
original_url: null
published_at_local: "2026-11-08T15:58:00"
published_at_gmt: "2026-11-08T06:58:00"
modified_at_local: "2026-11-08T15:58:00"
category_ids: [13]
tag_ids: [-5, -7]
excerpt: SUMOのTraCIをPythonから使い、シミュレーションを進めながら車両の位置と速度を取得する基本を紹介します。
conversion_format: markdown
---

SUMOのシミュレーションを、実行中にプログラムから操作したいときの入口がTraCI（Traffic Control Interface）です。Pythonなどの外部プログラムからSUMOに接続し、車両や信号の状態を読み取ったり、動的に変更したりできます。

前回の[SUMO入門](/blog/tech/sumo-introduction/)では、道路ネットワークと車両を用意し、sumo-guiで動かすところまでを紹介しました。今回はその続きとして、Pythonからシミュレーションを進め、走行中の車両を調べてみます。

> この記事の導入方法は2026年11月8日に[SUMOの公式ドキュメント](https://eclipse.dev/sumo/docs/TraCI/Interfacing_TraCI_from_Python.html)で確認しました。

## TraCIでできること

TraCIでは、たとえば次のような操作ができます。

- 実行中の車両の追加・削除や、速度・経路の変更
- 信号の状態の切り替え
- 検出器の値や車両の位置・速度の取得
- 渋滞や事故を想定した条件の再現

外部プログラムがSUMOと通信し、シミュレーションを1ステップ進めるたびに値を取得したり、指示を送ったりする仕組みです。SUMO側の信号やルートなどのIDは、使用するシナリオに合わせて指定します。

## Pythonライブラリを導入する

まず、前回の記事を参考にSUMO本体をインストールしてください。Python 3と、車両を含むSUMOの設定ファイルも用意します。以下では前回の例と同じく、設定ファイルを helloWorld.sumocfg とします。

Pythonで使うTraCIライブラリは、端末からpipで導入できます。仮想環境を使っている場合は、実行するPythonと同じ環境にインストールしてください。

~~~bash
python -m pip install traci
~~~

WindowsなどでPython 3のコマンドが `python3` の場合は、上の `python` を `python3` に読み替えます。導入後は次のコマンドで読み込みを確認できます。

~~~bash
python -c "import traci; print(traci.__file__)"
~~~

表示されるのは、読み込まれたライブラリの場所です。**pipのtraciは接続用ライブラリであり、この操作だけでSUMO本体が入るわけではありません。** SUMOの実行ファイルが別途必要です。公式には、SUMOアプリケーションをPythonパッケージとして導入する `eclipse-sumo` も案内されています。[公式ダウンロードページ](https://eclipse.dev/sumo/docs/Downloads.html)

### SUMO付属のtoolsを使う方法

SUMOの配布物に含まれる `tools` ディレクトリにも、Python用のtraciがあります。pip版の代わりにこちらを使う場合は、環境変数 `SUMO_HOME` をSUMOのインストール先に設定し、Pythonの検索パスに `SUMO_HOME/tools` を追加できます。

~~~python
import os
import sys

sys.path.append(os.path.join(os.environ["SUMO_HOME"], "tools"))
import traci
~~~

この例は、実行前に `SUMO_HOME` が設定されていることを前提とします。Linuxではツールが別のパッケージに分かれている場合もあるため、使用する配布形態を確認してください。

pip版と付属版が両方ある場合、Pythonの検索順によって読み込まれる方が決まります。意図したバージョンが使われているか迷ったら、先ほどの `traci.__file__` の表示を確認し、SUMO本体とライブラリの組み合わせを揃えましょう。

## Pythonから接続して車両を読む

次の例では、前回作った helloWorld.sumocfg と同じフォルダに `run_traci.py` を保存します。端末でもそのフォルダに移動してから実行してください。設定ファイルに別の名前を付けた場合は、コード内の名前を変更します。

~~~python
import traci

traci.start(["sumo", "-c", "helloWorld.sumocfg"])
try:
    while traci.simulation.getMinExpectedNumber() > 0:
        traci.simulationStep()
        time = traci.simulation.getTime()
        for vehicle_id in traci.vehicle.getIDList():
            x, y = traci.vehicle.getPosition(vehicle_id)
            speed = traci.vehicle.getSpeed(vehicle_id)
            print(f"時刻={time:.0f}秒 車両={vehicle_id} "
                  f"位置=({x:.1f}, {y:.1f}) 速度={speed:.1f} m/s")
finally:
    traci.close()
~~~

次のように実行します。

~~~bash
python run_traci.py
~~~

`traci.start()` はSUMOを起動して接続します。`simulationStep()` でシミュレーションを1ステップ進め、その時点でネットワーク内にいる車両のID、位置、速度を取得しています。車両が走行中のステップでは、時刻とともに値が端末に表示されます。

`getMinExpectedNumber()` が0になると、走行中および出発を待つ車両がなくなったと判断してループを終えます。最後に `traci.close()` で接続を閉じます。エラーが起きた場合にも閉じられるよう、接続後の処理を `try...finally` で囲んでいます。

この例は画面を表示しない `sumo` を使います。動きを見たい場合は、起動コマンドの `"sumo"` を `"sumo-gui"` に変更し、必要に応じてGUIのRunボタンを押してください。SUMOの実行ファイルが見つからない場合は、インストール先のbinにパスを通すか、実行ファイルのフルパスを指定します。

## 条件を変えて試す

値の取得に慣れたら、車両の速度や経路を変える処理、信号を切り替える処理を追加できます。対象の車両や信号がその時点で存在するか、またシナリオ内のIDが合っているかを確認しながら、少しずつ試すのがおすすめです。使える関数は[TraCIのPython API](https://eclipse.dev/sumo/pydoc/traci/)で調べられます。

私の用途でも、交通量やセンサー配置を検討するときは、条件を少しずつ変えて結果を比べることが多くあります。TraCIを使って操作をスクリプトに残しておくと、同じ条件を繰り返し試しやすくなります。再現性を高めるには、乱数シードやSUMOのバージョン、入力データも合わせて記録しておくとよいでしょう。

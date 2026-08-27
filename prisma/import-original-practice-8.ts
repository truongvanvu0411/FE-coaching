/**
 * Original practice questions, batch 8 — freshly authored, not derived from any
 * official IPA exam or third-party question bank. Continues IDs from batches 1-7.
 */
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const KEY_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;

type Q = {
  id: string;
  section: "A" | "B";
  topic: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  body: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
};

const QUESTIONS: Q[] = [
  // ===== 基礎理論 =====
  {
    id: "FE-A-PRACTICE-0307", section: "A", topic: "基礎理論", difficulty: "MEDIUM",
    body: "1バイトは何ビットで構成されるか。",
    choices: ["4ビット", "8ビット", "16ビット", "32ビット"], correctIndex: 1,
    explanation: "1バイトは8ビットで構成される。",
  },
  {
    id: "FE-A-PRACTICE-0308", section: "A", topic: "基礎理論", difficulty: "EASY",
    body: "行列やテーブルのように、行と列で構成される2次元のデータ構造を何と呼ぶか。",
    choices: ["1次元配列", "2次元配列", "連結リスト", "スタック"], correctIndex: 1,
    explanation: "2次元配列は、行と列のインデックスで要素を指定する、表形式のデータ構造である。",
  },
  {
    id: "FE-A-PRACTICE-0309", section: "A", topic: "基礎理論", difficulty: "HARD",
    body: "ある事象Aが起きた条件のもとで、事象Bが起きる確率を何と呼ぶか。",
    choices: ["同時確率", "条件付き確率", "周辺確率", "余事象の確率"], correctIndex: 1,
    explanation: "条件付き確率は、ある事象Aが起きたという条件のもとで、別の事象Bが起きる確率を指す。",
  },
  {
    id: "FE-A-PRACTICE-0310", section: "A", topic: "基礎理論", difficulty: "MEDIUM",
    body: "2進数 01111111 に1を加算した結果を2進数（8ビット）で表したものはどれか。",
    choices: ["00000000", "10000000", "01111110", "11111111"], correctIndex: 1,
    explanation: "01111111(2)=127。127+1=128=10000000(2)。",
  },
  {
    id: "FE-A-PRACTICE-0311", section: "A", topic: "基礎理論", difficulty: "EASY",
    body: "木構造において、根から最も遠い葉までの深さを、その木の何と呼ぶか。",
    choices: ["幅", "高さ", "次数", "重み"], correctIndex: 1,
    explanation: "木の高さは、根から最も遠い葉までの深さ（辺の数）で表される。",
  },

  // ===== アルゴリズムとプログラミング =====
  {
    id: "FE-A-PRACTICE-0312", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "MEDIUM",
    body: "計算量を表すO記法（オーダ記法）のうち、入力サイズnが大きくなるにつれて処理時間が最も緩やかに増加するものはどれか。",
    choices: ["O(n^2)", "O(n log n)", "O(log n)", "O(2^n)"], correctIndex: 2,
    explanation: "選択肢の中では、O(log n)が入力サイズnの増加に対して処理時間の増加が最も緩やかである。",
  },
  {
    id: "FE-A-PRACTICE-0313", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "HARD",
    body: "幅優先探索（BFS）の説明として、適切なものはどれか。",
    choices: [
      "開始ノードから近い順に、階層ごとに探索を進める手法であり、一般にキューを用いて実装される。",
      "常に最も深いノードまで先に探索を進めてから戻る手法である。", "探索順序をランダムに決定する手法である。",
      "既に訪問したノードを何度も訪問し直す手法である。",
    ], correctIndex: 0,
    explanation: "幅優先探索（BFS）は、開始ノードから近い順（階層ごと）に探索を進める手法であり、一般にキューを用いて実装される（深く先に進むのは深さ優先探索）。",
  },
  {
    id: "FE-A-PRACTICE-0314", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "EASY",
    body: "プログラムの実行結果を確認しながら1行ずつ処理を追跡し、不具合の原因を特定するために使うツールを何と呼ぶか。",
    choices: ["デバッガ", "コンパイラ", "リンカ", "エディタ"], correctIndex: 0,
    explanation: "デバッガは、プログラムの実行を1行ずつ（またはブレークポイントごとに）追跡し、変数の値などを確認しながら不具合の原因を特定するためのツールである。",
  },
  {
    id: "FE-A-PRACTICE-0315", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "MEDIUM",
    body: "抽象クラスの説明として、適切なものはどれか。",
    choices: [
      "全てのメソッドが実装済みであり、直接インスタンス化して使うことを想定したクラスである。",
      "一部または全部のメソッドの実装をもたず、直接インスタンス化できず、サブクラスでの実装を前提とするクラスである。",
      "変数を1つももたないクラスである。", "必ず1つのメソッドしかもてないクラスである。",
    ], correctIndex: 1,
    explanation: "抽象クラスは、一部または全部のメソッドの実装をもたず（抽象メソッド）、直接インスタンス化できないクラスであり、サブクラスでの具体的な実装を前提とする。",
  },

  // ===== コンピュータ構成要素 =====
  {
    id: "FE-A-PRACTICE-0316", section: "A", topic: "コンピュータ構成要素", difficulty: "MEDIUM",
    body: "CPUが同時に処理できるビット数（例えば32ビットや64ビット）のことを何と呼ぶか。",
    choices: ["ワード長", "クロック周波数", "バス幅", "ヒット率"], correctIndex: 0,
    explanation: "ワード長は、CPUが一度に処理できるデータの単位（ビット数）を指す用語であり、32ビットCPU、64ビットCPUなどと表現される。",
  },
  {
    id: "FE-A-PRACTICE-0317", section: "A", topic: "コンピュータ構成要素", difficulty: "EASY",
    body: "コンピュータの各装置を結び、データや制御信号をやり取りするための共通の伝送路を何と呼ぶか。",
    choices: ["バス", "レジスタ", "ポート", "スロット"], correctIndex: 0,
    explanation: "バスは、CPU・主記憶・入出力装置などを結び、データや制御信号をやり取りするための共通の伝送路である。",
  },
  {
    id: "FE-A-PRACTICE-0318", section: "A", topic: "コンピュータ構成要素", difficulty: "HARD",
    body: "複数の命令を同時に発行し、複数の実行ユニットで並列に実行することで性能を高めるCPUのアーキテクチャを何と呼ぶか。",
    choices: ["スーパースカラ", "シングルスカラ", "逐次実行方式", "マイクロコード方式"], correctIndex: 0,
    explanation: "スーパースカラは、1クロックサイクル内に複数の命令を同時に発行し、複数の実行ユニットで並列に処理することで性能を高めるCPUアーキテクチャである。",
  },

  // ===== システム構成要素 =====
  {
    id: "FE-A-PRACTICE-0319", section: "A", topic: "システム構成要素", difficulty: "MEDIUM",
    body: "システムの利用者数やデータ量の増加に応じて、柔軟にリソースを拡張できる性質を何と呼ぶか。",
    choices: ["スケーラビリティ", "ポータビリティ", "ユーザビリティ", "アクセシビリティ"], correctIndex: 0,
    explanation: "スケーラビリティは、システムの利用者数やデータ量の増加に応じて、性能や容量を柔軟に拡張できる性質を指す。",
  },
  {
    id: "FE-A-PRACTICE-0320", section: "A", topic: "システム構成要素", difficulty: "EASY",
    body: "システムを構成する装置やソフトウェアなどを一元的に管理するための番号や名称を何と呼ぶか。",
    choices: ["構成管理番号（資産番号）", "電話番号", "郵便番号", "従業員番号"], correctIndex: 0,
    explanation: "構成管理番号（資産番号）は、システムを構成する装置やソフトウェアなどを一元的に識別・管理するために付与される番号や名称である。",
  },
  {
    id: "FE-A-PRACTICE-0321", section: "A", topic: "システム構成要素", difficulty: "HARD",
    body: "三つの装置が並列に接続され、いずれか一つでも稼働していればシステム全体が稼働しているとみなせるシステムがある。各装置の稼働率が0.7であるとき、システム全体の稼働率はおよそどれか。",
    choices: ["0.657", "0.7", "0.973", "0.343"], correctIndex: 2,
    explanation: "並列システムの稼働率＝1－(1－0.7)^3＝1－0.027＝0.973。",
  },

  // ===== ソフトウェア =====
  {
    id: "FE-A-PRACTICE-0322", section: "A", topic: "ソフトウェア", difficulty: "MEDIUM",
    body: "コンピュータウイルスなどのマルウェアを、その動作を安全に観察するために隔離された環境で実行する仕組みを何と呼ぶか。",
    choices: ["サンドボックス", "ファイアウォール", "デバイスドライバ", "ブートローダ"], correctIndex: 0,
    explanation: "サンドボックスは、プログラム（マルウェアなど）を、実際のシステムに影響を与えないよう隔離された安全な環境で実行し、その挙動を観察するための仕組みである。",
  },
  {
    id: "FE-A-PRACTICE-0323", section: "A", topic: "ソフトウェア", difficulty: "EASY",
    body: "ソフトウェアの動作条件や設定内容などを記録しておくファイルを一般に何と呼ぶか。",
    choices: ["設定ファイル（コンフィグファイル）", "実行ファイル", "圧縮ファイル", "画像ファイル"], correctIndex: 0,
    explanation: "設定ファイル（コンフィグファイル）は、ソフトウェアの動作条件やパラメータなどの設定内容を記録しておくファイルである。",
  },
  {
    id: "FE-A-PRACTICE-0324", section: "A", topic: "ソフトウェア", difficulty: "HARD",
    body: "複数のOSを1台の物理マシン上で同時に動作させ、それぞれのOSにハードウェア資源を割り当てて管理するソフトウェアを何と呼ぶか。",
    choices: ["ハイパーバイザー", "デバイスドライバ", "ブラウザ", "コンパイラ"], correctIndex: 0,
    explanation: "ハイパーバイザーは、1台の物理マシン上で複数の仮想マシン（OS）を同時に動作させ、それぞれにCPUやメモリなどのハードウェア資源を割り当てて管理するソフトウェアである。",
  },

  // ===== データベース =====
  {
    id: "FE-A-PRACTICE-0325", section: "A", topic: "データベース", difficulty: "MEDIUM",
    body: "関係データベースの表において、他の表の主キーを参照する列を何と呼ぶか。",
    choices: ["主キー", "外部キー", "候補キー", "複合キー"], correctIndex: 1,
    explanation: "外部キーは、ある表の列が、別の表の主キー（またはそれに準ずる一意な列）を参照するために設定される列である。",
  },
  {
    id: "FE-A-PRACTICE-0326", section: "A", topic: "データベース", difficulty: "EASY",
    body: "データベース管理システムを表す略語はどれか。",
    choices: ["DBMS", "OS", "GUI", "API"], correctIndex: 0,
    explanation: "DBMS（Database Management System）は、データベースの作成・操作・管理を行うためのソフトウェアである。",
  },
  {
    id: "FE-A-PRACTICE-0327", section: "A", topic: "データベース", difficulty: "HARD",
    body: "複数のサーバにデータを分散して格納し、大量データの処理性能と可用性を高める技術を何と呼ぶか。",
    choices: ["シャーディング（水平分割）", "正規化", "ビューの作成", "トリガの設定"], correctIndex: 0,
    explanation: "シャーディング（水平分割）は、1つの表のデータを複数のサーバに分散して格納することで、大量データの処理性能や可用性を高める技術である。",
  },

  // ===== ネットワーク =====
  {
    id: "FE-A-PRACTICE-0328", section: "A", topic: "ネットワーク", difficulty: "MEDIUM",
    body: "ネットワーク機器のうち、受信したフレームの宛先MACアドレスを見て、該当するポートにだけ転送する機器はどれか。",
    choices: ["リピータハブ", "スイッチングハブ（レイヤ2スイッチ）", "モデム", "光ケーブル"], correctIndex: 1,
    explanation: "スイッチングハブ（レイヤ2スイッチ）は、受信したフレームの宛先MACアドレスを見て、該当するポートにだけ転送することで、不要なトラフィックを削減する。",
  },
  {
    id: "FE-A-PRACTICE-0329", section: "A", topic: "ネットワーク", difficulty: "EASY",
    body: "インターネットにおいて、Webサイトの住所を表す文字列を何と呼ぶか。",
    choices: ["URL", "IPマスク", "サブネット", "ポート"], correctIndex: 0,
    explanation: "URL（Uniform Resource Locator）は、インターネット上のリソース（Webサイトなど）の場所を示す文字列である。",
  },
  {
    id: "FE-A-PRACTICE-0330", section: "A", topic: "ネットワーク", difficulty: "HARD",
    body: "サーバへのアクセスを、地理的に分散した複数のサーバに振り分けることで、応答速度の向上や負荷分散を図る仕組み・サービスを何と呼ぶか。",
    choices: ["CDN（コンテンツデリバリネットワーク）", "VPN", "NAT", "DNSラウンドロビンだけがこれに該当する"], correctIndex: 0,
    explanation: "CDN（Content Delivery Network）は、地理的に分散配置した複数のサーバにコンテンツを配信・キャッシュし、利用者に近いサーバから応答することで応答速度の向上や負荷分散を図る仕組みである。",
  },

  // ===== セキュリティ =====
  {
    id: "FE-A-PRACTICE-0331", section: "A", topic: "セキュリティ", difficulty: "MEDIUM",
    body: "利用者になりすまして、正規のWebサイトに似せた偽サイトへ誘導し、IDやパスワードを入力させて盗み取る攻撃はどれか。",
    choices: ["フィッシング詐欺", "総当たり攻撃", "DDoS攻撃", "ゼロデイ攻撃"], correctIndex: 0,
    explanation: "フィッシング詐欺は、正規のWebサイトに似せた偽サイトへ利用者を誘導し、IDやパスワードなどの機密情報を入力させて盗み取る攻撃手法である。",
  },
  {
    id: "FE-A-PRACTICE-0332", section: "A", topic: "セキュリティ", difficulty: "EASY",
    body: "重要な情報資産に対して、誰が、いつ、何を行ったかを記録し、後から追跡できるようにすることを何と呼ぶか。",
    choices: ["アカウンタビリティ（責任追跡性）", "可用性", "機密性", "完全性"], correctIndex: 0,
    explanation: "アカウンタビリティ（責任追跡性）は、誰が、いつ、何を行ったかを記録し、後から追跡できるようにする情報セキュリティの特性である。",
  },
  {
    id: "FE-A-PRACTICE-0333", section: "A", topic: "セキュリティ", difficulty: "HARD",
    body: "内部ネットワークへの侵入を許してしまった前提に立ち、内部のあらゆる通信も信頼せず、都度検証を行うというセキュリティの考え方を何と呼ぶか。",
    choices: ["ゼロトラスト", "多層防御", "境界防御", "性善説モデル"], correctIndex: 0,
    explanation: "ゼロトラストは、内部・外部を問わずあらゆる通信やアクセスを信頼せず、都度検証を行うという情報セキュリティの考え方である。",
  },

  // ===== システム開発技術 =====
  {
    id: "FE-A-PRACTICE-0334", section: "A", topic: "システム開発技術", difficulty: "MEDIUM",
    body: "システム開発において、テストの実行結果を記録し、不具合（バグ）を管理・追跡するための表や仕組みを何と呼ぶか。",
    choices: ["バグ管理表（課題管理表）", "WBS", "ER図", "アローダイアグラム"], correctIndex: 0,
    explanation: "バグ管理表（課題管理表）は、テストで検出された不具合の内容、対応状況、修正結果などを記録・追跡するための表・仕組みである。",
  },
  {
    id: "FE-A-PRACTICE-0335", section: "A", topic: "システム開発技術", difficulty: "EASY",
    body: "システムの機能を、利用者の視点から図示するために用いられるUML図の一つで、利用者（アクター）とシステムの機能（ユースケース）の関係を表す図はどれか。",
    choices: ["ユースケース図", "クラス図", "シーケンス図", "状態遷移図"], correctIndex: 0,
    explanation: "ユースケース図は、利用者（アクター）とシステムが提供する機能（ユースケース）の関係を図示するUML図であり、要件定義工程などで用いられる。",
  },
  {
    id: "FE-A-PRACTICE-0336", section: "A", topic: "システム開発技術", difficulty: "HARD",
    body: "システム開発の見積り手法のうち、プログラムの入出力データ数やファイル数など、機能の複雑さを定量的に計測して規模を見積もる手法はどれか。",
    choices: ["ファンクションポイント法", "類推見積法", "デルファイ法", "積み上げ法"], correctIndex: 0,
    explanation: "ファンクションポイント法は、プログラムの入出力データ数やファイル数などの機能を定量的に計測し、複雑さによる調整を行ってソフトウェアの規模を見積もる手法である。",
  },

  // ===== マネジメント系 =====
  {
    id: "FE-A-PRACTICE-0337", section: "A", topic: "マネジメント系", difficulty: "MEDIUM",
    body: "プロジェクトマネジメントの知識体系を国際的にまとめたガイドとして広く知られるものはどれか。",
    choices: ["PMBOK", "ITIL", "COBIT", "CMMI"], correctIndex: 0,
    explanation: "PMBOK（Project Management Body of Knowledge）は、プロジェクトマネジメントに関する知識を体系的にまとめた国際的なガイドである。",
  },
  {
    id: "FE-A-PRACTICE-0338", section: "A", topic: "マネジメント系", difficulty: "EASY",
    body: "ITサービスマネジメントのベストプラクティスをまとめたガイドラインとして広く知られるものはどれか。",
    choices: ["ITIL", "PMBOK", "UML", "SQL"], correctIndex: 0,
    explanation: "ITIL（Information Technology Infrastructure Library）は、ITサービスマネジメントに関するベストプラクティスをまとめたガイドラインである。",
  },
  {
    id: "FE-A-PRACTICE-0339", section: "A", topic: "マネジメント系", difficulty: "HARD",
    body: "プロジェクトのリスク対応戦略のうち、あえてリスクの高い作業自体を計画から外し、その作業を行わないことにする対応を何と呼ぶか。",
    choices: ["リスク回避", "リスク軽減", "リスク受容", "リスク転嫁"], correctIndex: 0,
    explanation: "リスク回避は、リスクの原因となる作業や計画自体を取りやめることで、リスクが発生する可能性そのものをなくす対応である。",
  },

  // ===== ストラテジ系 =====
  {
    id: "FE-A-PRACTICE-0340", section: "A", topic: "ストラテジ系", difficulty: "MEDIUM",
    body: "経営者が、ITを経営戦略の実現に活用するために策定する、中長期的な計画を何と呼ぶか。",
    choices: ["情報戦略（IT戦略）", "商品戦略", "人事戦略", "財務戦略のみ"], correctIndex: 0,
    explanation: "情報戦略（IT戦略）は、経営戦略の実現に向けて、ITをどのように活用していくかを定めた中長期的な計画である。",
  },
  {
    id: "FE-A-PRACTICE-0341", section: "A", topic: "ストラテジ系", difficulty: "EASY",
    body: "企業の目標達成度合いを定量的に評価するための重要な指標を何と呼ぶか。",
    choices: ["KPI（重要業績評価指標）", "SLA", "RFP", "NDA"], correctIndex: 0,
    explanation: "KPI（Key Performance Indicator、重要業績評価指標）は、企業や組織の目標達成度合いを定量的に評価するための指標である。",
  },
  {
    id: "FE-A-PRACTICE-0342", section: "A", topic: "ストラテジ系", difficulty: "HARD",
    body: "ある製品の販売数量が1,000個から1,100個へ10％増加したとき、売上高が900,000円から1,000,000円へ増加した。この製品の需要の価格弾力性とは異なる概念であるが、売上の増加率はおよそ何％か。",
    choices: ["約9.1％", "約10％", "約11％", "約20％"], correctIndex: 1,
    explanation: "増加率＝(1,000,000－900,000)÷900,000＝100,000÷900,000＝約11.1%であり、選択肢の中で最も近いのは「約11％」である。",
  },

  // ===== B: アルゴリズム（擬似言語） =====
  {
    id: "FE-B-PRACTICE-0059", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "MEDIUM",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 allPositive は，引数で与えられた整数型配列 data の全要素が正の数（0より大きい）であればtrueを，そうでなければfalseを返す。\n〔プログラム〕\n○論理型: allPositive(整数型の配列: data)\n　整数型: i\n　for (i を 1 から dataの要素数 まで 1 ずつ増やす)\n　　if (data[i] ≦ 0)\n　　　return ［　　］\n　　endif\n　endfor\n　return true",
    choices: ["true", "false", "data[i]", "0"],
    correctIndex: 1,
    explanation: "0以下の要素が1つでも見つかれば、全要素が正であるとは言えないため、falseを返す。",
  },
  {
    id: "FE-B-PRACTICE-0060", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    body: "次のプログラム中の［ a ］と［ b ］に入れる正しい答えの組合せを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 swapAdjacent は，引数で与えられた整数型配列 data の要素番号 i と i＋1 の値を入れ替える（戻り値はなく、dataを直接書き換える）。\n〔プログラム〕\n○swapAdjacent(整数型の配列: data, 整数型: i)\n　整数型: temp ← data[i]\n　data[i] ← ［ a ］\n　data[i ＋ 1] ← ［ b ］",
    choices: [
      "a: data[i ＋ 1]／b: temp", "a: temp／b: data[i ＋ 1]",
      "a: data[i ＋ 1]／b: data[i]", "a: temp／b: temp",
    ],
    correctIndex: 0,
    explanation: "data[i]の元の値はtempに保存済みなので、data[i]にはdata[i+1]の値を代入し（a）、data[i+1]には保存しておいたtempの値を代入する（b）ことで、2つの要素が正しく入れ替わる。",
  },
  {
    id: "FE-B-PRACTICE-0061", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "MEDIUM",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 lastElement は，要素数1以上の整数型配列 data の最後の要素の値を返す。\n〔プログラム〕\n○整数型: lastElement(整数型の配列: data)\n　return data[［　　］]",
    choices: ["1", "dataの要素数", "dataの要素数 － 1", "0"],
    correctIndex: 1,
    explanation: "配列の最後の要素の番号は、要素数と一致する（要素番号が1から始まる場合）。したがってdata[dataの要素数]で最後の要素の値が得られる。",
  },

  // ===== B: 情報セキュリティ =====
  {
    id: "FE-B-PRACTICE-0062", section: "B", topic: "情報セキュリティ", difficulty: "MEDIUM",
    body: "W社は，社内の共有フォルダに，人事評価データや給与データなど機密度の異なる様々なファイルを，アクセス権限を特に区別せず全従業員が閲覧できる設定で保管していた。この運用によって生じるリスクとして，最も適切なものはどれか。",
    choices: [
      "ファイルの検索に時間が掛かること", "本来アクセス権限をもつべきでない従業員が，人事評価や給与などの機密情報を閲覧できてしまうこと",
      "共有フォルダの容量が不足すること", "ファイルの更新履歴が記録されないこと",
    ], correctIndex: 1,
    explanation: "機密度に応じたアクセス権限の区分（最小権限の原則）を設けずに全従業員に閲覧を許可すると、本来アクセスすべきでない従業員が機密情報を閲覧できてしまうリスクが生じる。",
  },
  {
    id: "FE-B-PRACTICE-0063", section: "B", topic: "情報セキュリティ", difficulty: "HARD",
    body: "X社のWebサイトでは，利用者のログイン状態を維持するためにセッションIDをURLのパラメータとして付与していた。ある利用者が，ログイン中の状態でそのURLをSNSで共有してしまい，リンクをクリックした第三者が同じセッションIDでログイン状態になってしまう事案が発生した。この問題に該当する脆弱性はどれか。",
    choices: [
      "セッションハイジャックにつながるセッションIDの不適切な管理（URLへの埋め込み）", "SQLインジェクション",
      "DNSキャッシュポイズニング", "ブルートフォース攻撃",
    ], correctIndex: 0,
    explanation: "セッションIDをURLに含めると、URLの共有や閲覧履歴、リファラなどを通じて第三者にセッションIDが漏えいし、なりすまし（セッションハイジャック）を許してしまう。セッションIDはCookieに保存し、URLには含めないことが望ましい。",
  },
];

async function main() {
  console.log(`Importing ${QUESTIONS.length} original practice questions (batch 8)...`);
  const topics = await prisma.topic.findMany();
  const topicId = new Map(topics.map((t) => [t.nameJa, t.id]));

  for (const q of QUESTIONS) {
    const tId = topicId.get(q.topic);
    if (!tId) throw new Error(`Unknown topic: ${q.topic}`);

    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: {
        id: q.id,
        section: q.section,
        sourceType: "ORIGINAL_PRACTICE",
        topicId: tId,
        difficulty: q.difficulty,
        bodyJa: q.body,
        correctAnswer: KEY_LETTERS[q.correctIndex],
        explanationJa: q.explanation,
        verified: true,
        reviewStatus: "VERIFIED",
        choices: {
          create: q.choices.map((text, i) => ({
            key: KEY_LETTERS[i],
            textJa: text,
            order: i,
          })),
        },
      },
    });
  }

  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

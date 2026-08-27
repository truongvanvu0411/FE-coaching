/**
 * Imports the officially published FE 令和8年度 (2026) 公開問題 sets — 科目A (20 released
 * of 60) and 科目B (6 released of 20). Source:
 * https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/2026r08.html
 *
 * Excluded: 科目A Q6 (logic circuit diagram + timing chart — both purely graphical,
 * cannot be reconstructed from text extraction).
 * 科目B Q1/Q3 were verified by running the pseudocode in JS rather than hand-tracing
 * (Q3 in particular has a subtle shifted-window update order that's easy to get backwards
 * by hand); Q6's log-management case study was reasoned from the rules in the prompt and
 * cross-checked against the official answer.
 */
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const YEAR = 2026;
const KEY_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"] as const;

type Q = {
  id: string;
  section: "A" | "B";
  topic: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  sourceUrl: string;
  sourcePage: string;
  questionNumber: string;
  body: string;
  choices: string[];
  correctIndex: number;
};

const BASE = "https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att";
const A_URL = `${BASE}/2026r08_fe_kamoku_a_qs.pdf`;
const B_URL = `${BASE}/2026r08_fe_kamoku_b_qs.pdf`;

const QUESTIONS: Q[] = [
  {
    id: "FE-A-IPA-2026-Q01", section: "A", topic: "基礎理論", difficulty: "MEDIUM",
    sourceUrl: A_URL, sourcePage: "4", questionNumber: "問1",
    body: "入力されたビットに対して出力されるビットが0か1のいずれかである確率を遷移確率という。遷移確率を表にしたとき，a，b，c，dの関係はどれか。\n\n| 入力＼出力 | 0 | 1 |\n|---|---|---|\n| 0 | a | b |\n| 1 | c | d |",
    choices: [
      "a ＋ b ＋ c ＋ d ＝ 1", "a ＋ b ＝ 1， c ＋ d ＝ 1",
      "a ＋ c ＝ 1， b ＋ d ＝ 1", "a ＋ d ＝ 1， b ＋ c ＝ 1",
    ], correctIndex: 1,
  },
  {
    id: "FE-A-IPA-2026-Q02", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "4", questionNumber: "問2",
    body: "クイックソートの処理方法を説明したものはどれか。",
    choices: [
      "既に整列済みのデータ列の正しい位置に，データを追加する操作を繰り返していく方法である。",
      "データ中の最小値を求め，次にそれを除いた部分の中から最小値を求める。この操作を繰り返していく方法である。",
      "適当な基準値を選び，それよりも小さな値のグループと大きな値のグループにデータを分割する。同様にして，グループの中で基準値を選び，それぞれのグループを分割する。この操作を繰り返していく方法である。",
      "隣り合ったデータの比較と入替えを繰り返すことによって，小さな値のデータを次第に端の方に移していく方法である。",
    ], correctIndex: 2,
  },
  {
    id: "FE-A-IPA-2026-Q03", section: "A", topic: "コンピュータ構成要素", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "5", questionNumber: "問3",
    body: "プロセッサの一つであるGPUの特徴として，適切なものはどれか。",
    choices: [
      "OS及び他のハードウェアから独立して機能し，暗号キーなどの情報を安全に管理する。",
      "並列に動作する多数の浮動小数点演算ユニットによって，高速な3D演算ができる。",
      "目的に応じて半導体デバイス内部の論理回路を再構成できる。",
      "量子ビットによって0と1を重ね合わせた状態を計算に使うことができる。",
    ], correctIndex: 1,
  },
  {
    id: "FE-A-IPA-2026-Q04", section: "A", topic: "システム構成要素", difficulty: "MEDIUM",
    sourceUrl: A_URL, sourcePage: "5", questionNumber: "問4",
    body: "クラウドコンピューティングのサービスモデルとしてのPaaSの説明はどれか。",
    choices: [
      "OSやアプリケーションを含む任意のソフトウェアを実行可能にするリソースが，利用者に提供される。OSなどのプラットフォームへの限定的な設定や制御を行うことができる。",
      "アプリケーションの開発や運用に必要となるミドルウェアなどが利用者に提供されるので，これらを利用して，アプリケーションを開発して運用することができる。利用者は，プラットフォームを直接変更することはできない。",
      "利用者は，ハードウェア，OSなどのプラットフォームとアプリケーションを自ら準備して，それらの運用を依頼する。利用者は，プラットフォームの構成を決めることができるなど，環境構築の自由度が高い。",
      "利用者は，用意されたアプリケーションをそのまま又はカスタマイズして利用するが，OSなどのプラットフォームからアプリケーションまで全てを自ら準備する必要はない。利用者は，プラットフォームを直接変更することはできない。",
    ], correctIndex: 1,
  },
  {
    id: "FE-A-IPA-2026-Q05", section: "A", topic: "コンピュータ構成要素", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "6", questionNumber: "問5",
    body: "仮想記憶方式のコンピュータシステムにおいて，処理の多重度を増やしたところ，ページイン，ページアウトが多発して，システムの応答速度が急激に遅くなった。このような現象を何というか。",
    choices: ["オーバレイ", "スラッシング", "メモリコンパクション", "ロールアウト"], correctIndex: 1,
  },
  {
    id: "FE-A-IPA-2026-Q06", section: "A", topic: "データベース", difficulty: "MEDIUM",
    sourceUrl: A_URL, sourcePage: "7", questionNumber: "問7",
    body: "次のSQL文によって定義され，値が格納されている「商品」表に対して，制約違反で実行エラーとなるSQL文はどれか。\n〔SQL文〕\nCREATE TABLE 商品 (商品コード CHAR(4) PRIMARY KEY, 商品名 VARCHAR(21), 仕入先コード CHAR(4), 仕入単価 INT, 在庫数 INT)\n\n商品\n商品コード｜商品名｜仕入先コード｜仕入単価｜在庫数\nA111｜テレビ｜S001｜75,000｜0\nA222｜デジタルカメラ｜S002｜50,000｜50\nA333｜DVDプレーヤ｜NULL｜NULL｜NULL\nA444｜洗濯機｜S004｜45,000｜20",
    choices: [
      "DELETE FROM 商品 WHERE 仕入先コード IS NULL",
      "INSERT INTO 商品 VALUES ('A555', '空気清浄機', 'S005', 60000, 50)",
      "UPDATE 商品 SET 商品コード = 'A666' WHERE 商品コード = 'A444'",
      "UPDATE 商品 SET 商品コード = 'A777' WHERE 在庫数 >= 20",
    ], correctIndex: 3,
  },
  {
    id: "FE-A-IPA-2026-Q07", section: "A", topic: "ネットワーク", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "7", questionNumber: "問8",
    body: "無線LANでは，複数の端末から送信された同じ周波数の電波が衝突した場合，電波が干渉するのでそれらを受信すると信号を復調できないことがある。この問題を回避するためのものはどれか。",
    choices: ["CSMA/CA", "SSID", "キャリアアグリゲーション", "テザリング"], correctIndex: 0,
  },
  {
    id: "FE-A-IPA-2026-Q08", section: "A", topic: "セキュリティ", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "8", questionNumber: "問9",
    body: "2要素認証に該当する組みはどれか。",
    choices: ["クライアント証明書，ハードウェアトークン", "静脈認証，指紋認証", "パスワード認証，静脈認証", "パスワード認証，秘密の質問の答え"],
    correctIndex: 2,
  },
  {
    id: "FE-A-IPA-2026-Q09", section: "A", topic: "セキュリティ", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "8", questionNumber: "問10",
    body: "情報セキュリティに関する専門組織の説明のうち，CSIRTの説明として，最も適切なものはどれか。",
    choices: [
      "自社が顧客に提供する製品又はサービスの脆弱性に起因するリスクに対応する組織",
      "セキュリティインシデント検知のために，システム監視，ログ分析などのセキュリティ運用を担う組織",
      "発生したセキュリティインシデントに対し，インシデント対応を行う組織",
      "標的型サイバー攻撃特別相談窓口をもち，相談をもち込んだ組織の被害の低減と攻撃の連鎖の遮断を支援する組織",
    ], correctIndex: 2,
  },
  {
    id: "FE-A-IPA-2026-Q10", section: "A", topic: "システム開発技術", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "8", questionNumber: "問11",
    body: "あるシステムにおいて，「プログラムの記述方法が統一されていないので保守がしづらい」という問題が発生している。今後の新規開発プロジェクトにおけるこの問題の低減策として，最も適切なものはどれか。",
    choices: [
      "コーディング規約を見直し，教育する。", "セキュアプログラミングを採用する。",
      "単体テストでの命令網羅度を上げる。", "プロジェクト管理レビューに全プログラマーが参加する。",
    ], correctIndex: 0,
  },
  {
    id: "FE-A-IPA-2026-Q11", section: "A", topic: "システム開発技術", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "9", questionNumber: "問12",
    body: "バーンダウンチャートの使い方として，適切なものはどれか。",
    choices: [
      "縦軸を完成した成果物の総量，横軸を時間とし，プロジェクトが進むに従って完成した成果物の総量が増加する様子を確認する。",
      "縦軸を残課題の総数，横軸を時間とし，プロジェクトが進むに従って残課題の総量が増減する様子を確認する。",
      "縦軸を残作業の量，横軸を時間とし，プロジェクトが進むに従って残作業の量が減少する様子を確認する。",
      "縦軸を延べ工数，横軸を時間とし，プロジェクトが進むに従って延べ工数が増加する様子を確認する。",
    ], correctIndex: 2,
  },
  {
    id: "FE-A-IPA-2026-Q12", section: "A", topic: "マネジメント系", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "9", questionNumber: "問13",
    body: "あるシステム開発プロジェクトの進捗が遅延したので，クリティカルパス上の作業への投入工数を増やすことによって遅延の解消を図った。このとき適用した，所要期間を短縮するための手法を何と呼ぶか。",
    choices: ["クラッシング", "コーチング", "ファストトラッキング", "メンタリング"], correctIndex: 0,
  },
  {
    id: "FE-A-IPA-2026-Q13", section: "A", topic: "システム構成要素", difficulty: "HARD",
    sourceUrl: A_URL, sourcePage: "10", questionNumber: "問14",
    body: "A社は，自社のデータセンタでアプリケーションシステムを運用し，顧客にサービスを提供している。現在，アプリケーションシステムの実行環境をクラウドサービスに移行して，サービス可用性を向上させることを検討している。次の条件のとき，サービス可用性は移行後に何パーセントポイント向上するか。ここで，サービス可用性（％）は小数第3位を切り捨てるものとする。\n〔条件〕\n・サービス提供時間は，移行前も移行後も同じで，計画された保守の時間を除き，年間5,000時間である。\n・移行前は，サービス提供時間内の停止時間が，年間100時間である。\n・移行後は，サービス提供時間内の停止時間が，年間30分となる。",
    choices: ["0.01", "0.19", "1.40", "1.99"], correctIndex: 3,
  },
  {
    id: "FE-A-IPA-2026-Q14", section: "A", topic: "マネジメント系", difficulty: "MEDIUM",
    sourceUrl: A_URL, sourcePage: "10", questionNumber: "問15",
    body: "内部監査部門が，情報システム部門に対するシステム監査を経営者から指示されたとき，システム監査人の行為として，適切なものはどれか。",
    choices: [
      "監査報告書に記載した改善提案に対して改善計画を策定した上で，実行する。",
      "基幹システムを開発し，保守を行っている外部事業者に，当該システム監査を委託する。",
      "経営者がどのようなニーズを有しているかを十分に把握した上で，システム監査の目的と対象範囲を決定する。",
      "情報システム部門の在籍者を監査メンバとして選定する。",
    ], correctIndex: 2,
  },
  {
    id: "FE-A-IPA-2026-Q15", section: "A", topic: "ストラテジ系", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "11", questionNumber: "問16",
    body: "小売事業者が，オムニチャネル戦略を実現するためのIT活用事例はどれか。",
    choices: [
      "実店舗，オンライン店舗，コールセンタなど複数の顧客接点で，顧客情報や在庫情報などを一元的に管理・共有して接客することによって，顧客の利便性を高める。",
      "複数店舗からネットワークを経由して，受発注，出荷，請求，支払などの取引情報を電子的に交換することによって，卸売業者とメーカとの間の受発注業務の効率を高める。",
      "複数店舗に設置した監視カメラの画像データを本部に集め，本部が各店舗の状況をリアルタイムに把握することによって，店舗運営業務の効率を高める。",
      "複数店舗のPOSデータを本部に集め，本部が日次で売れ筋商品の抽出，複数の商品の併売率の分析を行うことによって，商品計画や棚割計画を最適化する。",
    ], correctIndex: 0,
  },
  {
    id: "FE-A-IPA-2026-Q16", section: "A", topic: "ストラテジ系", difficulty: "HARD",
    sourceUrl: A_URL, sourcePage: "11", questionNumber: "問17",
    body: "サービスA～Dの中で会員のリテンション率が最も高いものはどれか。なお，リテンションの対象は前月末から当月末まで継続して在籍した会員とし，当月新規会員は月末までの退会はないものとする。\n\n| サービス | 前月末会員数 | 当月新規会員数 | 当月末会員数 |\n|---|---|---|---|\n| A | 1,000 | 500 | 800 |\n| B | 1,000 | 200 | 800 |\n| C | 1,500 | 500 | 1,100 |\n| D | 1,500 | 1,000 | 1,800 |",
    choices: ["サービスA", "サービスB", "サービスC", "サービスD"], correctIndex: 1,
  },
  {
    id: "FE-A-IPA-2026-Q17", section: "A", topic: "基礎理論", difficulty: "MEDIUM",
    sourceUrl: A_URL, sourcePage: "12", questionNumber: "問18",
    body: "AIの事例として，適切でないものはどれか。",
    choices: [
      "制御量を目標値側へフィードバックすることによって両者を比較し，その差によって両者を一致させるような修正動作を行うPID制御のモーターコントローラー",
      "部屋の広さや形，家具の位置などを学習し，移動のルートを決めて掃除をするロボット",
      "ヘルプデスク及びコールセンターに代わって，自然言語による質問の意味を推測して返事をするチャットボット",
      "ボードゲームでプロの人間に勝つような，多数の統計データを処理することによって人間に勝るソフトウェア",
    ], correctIndex: 0,
  },
  {
    id: "FE-A-IPA-2026-Q18", section: "A", topic: "マネジメント系", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "12", questionNumber: "問19",
    body: "ブレーンストーミングの説明はどれか。",
    choices: [
      "あるテーマの検討において，複数のメンバーで，各自が思いつくままに自由奔放にできるだけ多くのアイディアを出し合うことによって，創造的思考を喚起し，アイディアを開発しようとする会議方法",
      "研修を始める前に行う簡単なゲームや，商談や面接の本題に入る前に行う雑談など，参加者の緊張をほぐすためのコミュニケーション方法",
      "情報を，決められた枠組みに従って整理・分析するスキルや方法を利用し，複雑なものごとを明快に把握したり，問題に対する解決策を導き出したりするような思考方法",
      "ポイントを繰り返したり，言い換えたりすることによって，お互いの理解する意味合いが一致していることを確認したり，意見・評価を伝えたりする方法",
    ], correctIndex: 0,
  },
  {
    id: "FE-A-IPA-2026-Q19", section: "A", topic: "ストラテジ系", difficulty: "HARD",
    sourceUrl: A_URL, sourcePage: "13", questionNumber: "問20",
    body: "A社は，自社の業務可視化をB社に委託しその成果物として納品された業務フロー図をC社に提示することによって，業務システムの開発をC社に委託することを検討している。A社がこの業務フロー図を使用する上で生じる制約として，適切なものはどれか。\nなお，B社への委託に当たって締結された契約には，著作権は全てA社に譲渡する旨の記述があり，著作者人格権については特段の記述はない。",
    choices: [
      "C社と守秘義務契約を締結したとしても，C社に対して，納品された業務フロー図の電子データを提供することはできない。",
      "納品された業務フロー図の各ページに作成者名として記されているB社の企業名をA社の企業名に変更し，C社に提示することはできない。",
      "納品された業務フロー図を印刷し，社内資料としてA社の社員に配布することはできない。",
      "バックアップの目的で，納品された業務フロー図の電子データを複製し，A社だけがアクセス可能なクラウドストレージに保管することはできない。",
    ], correctIndex: 1,
  },

  // ---- 科目B ----
  {
    id: "FE-B-IPA-2026-Q01", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "MEDIUM",
    sourceUrl: B_URL, sourcePage: "4", questionNumber: "問1",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n次のプログラムは，整数型の配列 data の末尾の要素の値を先頭の要素に移動する。この際，末尾以外の各要素の値は，一つずつ後ろの要素に移動する。\n〔プログラム〕\n整数型の配列: data ← {1, 2, 3, 4, 5, 6, 7, 8, 9}\n整数型: top, i\n整数型: len ← dataの要素数\ntop ← data[len]\nfor (i を ［　　］)\n　data[i] ← data[i － 1]\nendfor\ndata[1] ← top",
    choices: [
      "2 から len － 1 まで 1 ずつ増やす", "2 から len まで 1 ずつ増やす",
      "len － 1 から 2 まで 1 ずつ減らす", "len から 2 まで 1 ずつ減らす",
    ], correctIndex: 3,
  },
  {
    id: "FE-B-IPA-2026-Q02", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "MEDIUM",
    sourceUrl: B_URL, sourcePage: "5", questionNumber: "問2",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。\n関数 complement は，引数として渡された8ビット型の値xについて，xに加算すると00000000になる値を返す。8ビット型の加算は，値を符号なし2進数とみなしたときの加算とし，桁あふれが発生したときのあふれた桁は無視する。演算子∧，∨，▽は，それぞれビット単位の論理積，論理和，排他的論理和を表す。\n〔プログラム〕\n○8ビット型: complement(8ビット型: x)\n　8ビット型: y\n　y ← ［　　］\n　y ← y ＋ 00000001\n　return y",
    choices: ["x ∧ 01111111", "x ∧ 11111111", "x ∨ 01111111", "x ∨ 11111111", "x ▽ 01111111", "x ▽ 11111111"],
    correctIndex: 5,
  },
  {
    id: "FE-B-IPA-2026-Q03", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    sourceUrl: B_URL, sourcePage: "6", questionNumber: "問3",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 func1 に与える引数と，関数 func2 に与える引数とが同じとき，二つの関数は同じ値を返す。プログラムでは，配列の領域外を参照してはならないものとする。\n〔プログラム〕\n○整数型: func1(整数型: n)\n　if (nが2以下)\n　　return 1\n　endif\n　return 2 × func1(n － 2) ＋ func1(n － 1)\n○整数型: func2(整数型: n)\n　整数型の配列: data ← {1, 1, 1}\n　整数型: i\n　/* nが3より小さいときは繰返し処理を実行しない */\n　for (iを3からnまで1ずつ増やす)\n　　data[1] ← data[2]\n　　data[2] ← data[3]\n　　data[3] ← ［　　］\n　endfor\n　return data[3]",
    choices: [
      "2 × data[1] ＋ data[2]", "2 × data[2] ＋ data[1]",
      "2 × data[i － 1] ＋ data[i － 2]", "2 × data[i － 2] ＋ data[i － 1]",
      "data[3] ＋ 2 × data[1] ＋ data[2]", "data[3] ＋ 2 × data[2] ＋ data[1]",
      "data[3] ＋ 2 × data[i － 1] ＋ data[i － 2]", "data[3] ＋ 2 × data[i － 2] ＋ data[i － 1]",
    ], correctIndex: 0,
  },
  {
    id: "FE-B-IPA-2026-Q04", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    sourceUrl: B_URL, sourcePage: "8", questionNumber: "問4",
    body: "次のプログラム中の［ a ］と［ b ］に入れる正しい答えの組合せを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n単方向リストを，配列 dataList と配列 pointerList の二つの配列で表現する。dataList にリストの要素の値を格納し，pointerList にリストの次の要素に対応する dataList の要素番号を格納する。単方向リストの先頭は，dataList[1] 及び pointerList[1] の組みである。単方向リストの末尾に対応する pointerList の要素は未定義である。\ndataList及びpointerListの内容：\n要素番号1～5\ndataList ← {10, 30, 20, 40, 未定義の値}\npointerList ← {3, 4, 2, 未定義の値, 未定義の値}\n（先頭dataList[1]=10。次の要素の要素番号はpointerList[1]=3であり，値はdataList[3]=20。その次はpointerList[3]=2であり，値はdataList[2]=30。）\n関数 orderList は，この単方向リストの値を，先頭からたどって順番に格納した配列 {10, 20, 30, 40} を返す。\n〔プログラム〕\n大域: 整数型の配列: dataList ← {10, 30, 20, 40, 未定義の値}\n大域: 整数型の配列: pointerList ← {3, 4, 2, 未定義の値, 未定義の値}\n○整数型の配列: orderList()\n　整数型: i, p ← 1\n　整数型の配列: linearList ← {} // 要素数0の配列\n　for (i を 1 から dataListの要素数 まで 1 ずつ増やす)\n　　linearListの末尾 に dataList[p]の値 を追加する\n　　if (［ a ］ が 未定義)\n　　　繰返し処理を終了する\n　　endif\n　　p ← ［ b ］\n　endfor\n　return linearList",
    choices: [
      "a: dataList[p]／b: i", "a: dataList[p]／b: pointerList[p]",
      "a: pointerList[p]／b: i", "a: pointerList[p]／b: pointerList[p]",
    ], correctIndex: 3,
  },
  {
    id: "FE-B-IPA-2026-Q05", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    sourceUrl: B_URL, sourcePage: "10", questionNumber: "問5",
    body: "次のプログラム中の［ a ］と［ b ］に入れる正しい答えの組合せを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n一つの要素だけが1で他の要素が0であるような整数型の配列による表現を，本問ではOne-Hot表現という。関数 oneHotEncoding は，色の名前が格納されている要素数1以上の文字列型の配列を引数として受け取り，配列に含まれる色の名前に基づいて，各要素をOne-Hot表現に変換し，整数型配列の配列に格納して返す。\n引数の例：{\"Red\", \"Green\", \"Blue\", \"Red\"}\n↓\n\"Red\"のOne-Hot表現：{1, 0, 0}／\"Green\"のOne-Hot表現：{0, 1, 0}／\"Blue\"のOne-Hot表現：{0, 0, 1}\n↓\n引数の例に対応する戻り値：{{1, 0, 0}, {0, 1, 0}, {0, 0, 1}, {1, 0, 0}}\n〔プログラム〕\n○整数型配列の配列: oneHotEncoding(文字列型の配列: colors)\n　整数型: i, j, k\n　文字列型の配列: colorVector ← {} // 要素数0の配列\n　整数型の配列: tempVector\n　整数型配列の配列: oneHotVector ← {} // 要素数0の配列\n　/* 名前一覧の作成 */\n　for (i を 1 から colorsの要素数 まで 1 ずつ増やす)\n　　if (colorVector の要素のいずれにも colors[i]の値 が格納されていない)\n　　　colorVectorの末尾 に ［ a ］ を追加する\n　　endif\n　endfor\n　/* One-Hot表現への変換 */\n　for (j を 1 から colorsの要素数 まで 1 ずつ増やす)\n　　tempVector ← {} // 要素数0の配列\n　　for (k を 1 から colorVectorの要素数 まで 1 ずつ増やす)\n　　　if (［ b ］)\n　　　　tempVectorの末尾 に 1 を追加する\n　　　else\n　　　　tempVectorの末尾 に 0 を追加する\n　　　endif\n　　endfor\n　　oneHotVectorの末尾 に tempVector を追加する\n　endfor\n　return oneHotVector",
    choices: [
      "a: colors[i]の値／b: colors の要素のいずれかに colorVector[k]の値 が格納されている",
      "a: colors[i]の値／b: colors[j] が colorVector[k] と等しい",
      "a: 未定義の値／b: colors の要素のいずれかに colorVector[k]の値 が格納されている",
      "a: 未定義の値／b: colors[j] が colorVector[k] と等しい",
    ], correctIndex: 1,
  },
  {
    id: "FE-B-IPA-2026-Q06", section: "B", topic: "情報セキュリティ", difficulty: "HARD",
    sourceUrl: B_URL, sourcePage: "12", questionNumber: "問6",
    body: "A社は，従業員1,000名の広告代理店である。A社では，各部署がA社の社内ネットワークに設置したファイルサーバを，設置した部署の運用担当者が管理している。各部署で新たなクラウドサービスを利用する場合，各部署の責任者の承認のもと契約し，各部署の運用担当者が管理している。\n営業部では，営業部がA社の社内ネットワークに設置したファイルサーバ（Yサーバ）及び顧客管理のためのクラウドサービス（Zサービス）を利用している。営業部の各従業員にはYサーバの一般利用者アカウントが割り当てられ，Yサーバ上の全てのファイルが編集可能である。また，営業部の各従業員には，Zサービスの一般利用者アカウントが割り当てられ，営業部の運用担当者には，YサーバとZサービスの管理者アカウントが割り当てられている。\n情報セキュリティ部門では，クラウドサービスに関連した情報セキュリティインシデントの発生に備えて，各部署で利用しているクラウドサービスのログ管理に関するルールを次のとおりに整備した。\n〔ルール〕\n1. ログの取得：ログイン及びログアウトのログ，クラウドサービスでの重要な操作及びその成否に関するログを取得すること。\n2. ログの項目：少なくとも対象のアカウント名，日本標準時での日時，操作内容が記録されること。\n3. ログのアクセス管理：運用担当者だけがログにアクセスできるようにすること。クラウドサービスからログをエクスポートして保管する場合は，社内ネットワークに設置した自部署のファイルサーバにログを保管し，運用担当者だけがアクセスできるようにすること。運用担当者は複数名にすること。クラウドサービスへの運用担当者のログインには，2要素認証を必要とすること。\n4. ログの保存期間：少なくとも過去1年間のログが参照できるようにすること。\n5. 改ざんへの対策：ログは運用担当者でも書込み及び消去ができないようにすること。\n\n営業部の情報セキュリティリーダーであるB課長は，運用担当者のC主任及び情報セキュリティ部門の協力を得て，上記ルールが順守されているかどうかを調査し，Zサービスでの現在の運用の中で，ルールに違反しているものを次のとおりまとめた。\n(一) Zサービスのログは，空き容量が一定値以下になった場合，古いログから上書きされる。\n(二) Zサービスの運用は，営業部のC主任とD主任の2名で担当していたが，D主任が先月退職したので，現在はC主任だけである。\n(三) Zサービスのログの日時は，UTCで記録されている。\n(四) Zサービスのログは，毎月末に全てエクスポートし，Yサーバに保管している。\n\n上記の運用のうち，ルール3に違反しているものの項番だけを全て挙げた組合せを，解答群の中から選べ。",
    choices: [
      "(一)，(二)", "(一)，(二)，(三)", "(一)，(二)，(四)", "(一)，(三)", "(一)，(三)，(四)",
      "(一)，(四)", "(二)，(三)", "(二)，(三)，(四)", "(二)，(四)", "(三)，(四)",
    ], correctIndex: 8,
  },
];

async function main() {
  console.log(`Importing ${QUESTIONS.length} IPA R8(2026) public questions...`);
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
        year: YEAR,
        sourceType: "IPA_PUBLIC",
        sourceUrl: q.sourceUrl,
        sourcePage: q.sourcePage,
        questionNumber: q.questionNumber,
        topicId: tId,
        difficulty: q.difficulty,
        bodyJa: q.body,
        correctAnswer: KEY_LETTERS[q.correctIndex],
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

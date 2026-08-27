/**
 * Imports the officially published FE 令和5年度 (2023) 公開問題 sets — 科目A (20 released
 * of 60) and 科目B (6 released of 20). Source:
 * https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/2023r05.html
 *
 * Excluded (diagram/flowchart structure not reliably recoverable from PDF text):
 * 科目A: Q10 (network diagram), Q11 (flowchart), Q13 (PERT diagram).
 * 科目B pseudocode blanks were reconstructed from the surrounding code + cross-checked
 * against the official answer key by manually tracing each algorithm; see the
 * conversation history for the worked trace of each question.
 */
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const YEAR = 2023;
const KEY_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I"] as const;

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

const BASE = "https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att";
const A_URL = `${BASE}/2023r05_fe_kamoku_a_qs.pdf`;
const B_URL = `${BASE}/2023r05_fe_kamoku_b_qs.pdf`;

const QUESTIONS: Q[] = [
  {
    id: "FE-A-IPA-2023-Q01", section: "A", topic: "基礎理論", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "2", questionNumber: "問1",
    body: "16進小数 0.C を10進小数に変換したものはどれか。",
    choices: ["0.12", "0.55", "0.75", "0.84"], correctIndex: 2,
  },
  {
    id: "FE-A-IPA-2023-Q02", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "HARD",
    sourceUrl: A_URL, sourcePage: "2", questionNumber: "問2",
    body: "双方向のポインタをもつリスト構造のデータを表に示す。この表において新たな社員Gを社員Aと社員Kの間に追加する。追加後の表のポインタa～fの中で追加前と比べて値が変わるポインタだけを全て列記したものはどれか。\n\n元の表：\nアドレス100 社員A 次ポインタ300 前ポインタ0\nアドレス200 社員T 次ポインタ0 前ポインタ300\nアドレス300 社員K 次ポインタ200 前ポインタ100\n\n追加後の表：\nアドレス100 社員A 次ポインタa 前ポインタb\nアドレス200 社員T 次ポインタc 前ポインタd\nアドレス300 社員K 次ポインタe 前ポインタf\nアドレス400 社員G 次ポインタx 前ポインタy",
    choices: ["a，b，e，f", "a，e，f", "a，f", "b，e"], correctIndex: 2,
  },
  {
    id: "FE-A-IPA-2023-Q03", section: "A", topic: "コンピュータ構成要素", difficulty: "MEDIUM",
    sourceUrl: A_URL, sourcePage: "3", questionNumber: "問3",
    body: "コンピュータの高速化技術の一つであるメモリインタリーブに関する記述として，適切なものはどれか。",
    choices: [
      "主記憶と入出力装置，又は主記憶同士のデータの受渡しをCPU経由でなく直接やり取りする方式",
      "主記憶にデータを送り出す際に，データをキャッシュに書き込み，キャッシュがあふれたときに主記憶へ書き込む方式",
      "主記憶のデータの一部をキャッシュにコピーすることによって，レジスタと主記憶とのアクセス速度の差を縮める方式",
      "主記憶を複数の独立して動作するグループに分けて，各グループに並列にアクセスする方式",
    ], correctIndex: 3,
  },
  {
    id: "FE-A-IPA-2023-Q04", section: "A", topic: "システム構成要素", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "3", questionNumber: "問4",
    body: "エッジコンピューティングの説明として，最も適切なものはどれか。",
    choices: [
      "画面生成やデータ処理をクライアント側で実行することによって，Webアプリケーションソフトウェアの操作性や表現力を高めること",
      "データが送信されてきたときだけ必要なサーバを立ち上げて，処理が終わり次第サーバを停止してリソースを解放すること",
      "複数のサーバやPCを仮想化して統合することによって一つの高性能なコンピュータを作り上げ，並列処理によって処理能力を高めること",
      "利用者や機器に取り付けられたセンサなどのデータ発生源に近い場所にあるサーバなどでデータを一次処理し，処理のリアルタイム性を高めること",
    ], correctIndex: 3,
  },
  {
    id: "FE-A-IPA-2023-Q05", section: "A", topic: "基礎理論", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "4", questionNumber: "問5",
    body: "3次元グラフィックス処理におけるクリッピングの説明はどれか。",
    choices: [
      "CG映像作成における最終段階として，物体のデータをディスプレイに描画できるように映像化する処理である。",
      "画像表示領域にウィンドウを定義し，ウィンドウの外側を除去し，内側の見える部分だけを取り出す処理である。",
      "スクリーンの画素数が有限であるために図形の境界近くに生じる，階段状のギザギザを目立たなくする処理である。",
      "立体感を生じさせるために，物体の表面に陰影を付ける処理である。",
    ], correctIndex: 1,
  },
  {
    id: "FE-A-IPA-2023-Q06", section: "A", topic: "データベース", difficulty: "HARD",
    sourceUrl: A_URL, sourcePage: "4", questionNumber: "問6",
    body: "次の関数従属を満足するとき，成立する推移的関数従属はどれか。ここで，「A→B」はBがAに関数従属していることを表し，「A→｛B，C｝」は，「A→B」かつ「A→C」が成立することを表す。\n〔関数従属〕\n｛注文コード，商品コード｝→｛顧客注文数量，注文金額｝\n注文コード→｛注文日，顧客コード，注文担当者コード｝\n商品コード→｛商品名，仕入先コード，商品販売価格｝\n仕入先コード→｛仕入先名，仕入先住所，仕入担当者コード｝\n顧客コード→｛顧客名，顧客住所｝",
    choices: [
      "仕入先コード → 仕入担当者コード → 仕入先住所",
      "商品コード → 仕入先コード → 商品販売価格",
      "注文コード → 顧客コード → 顧客住所",
      "注文コード → 商品コード → 顧客注文数量",
    ], correctIndex: 2,
  },
  {
    id: "FE-A-IPA-2023-Q07", section: "A", topic: "データベース", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "5", questionNumber: "問7",
    body: "トランザクションが，データベースに対する更新処理を完全に行うか，全く処理しなかったかのように取り消すか，のどちらかの結果になることを保証する特性はどれか。",
    choices: ["一貫性（consistency）", "原子性（atomicity）", "耐久性（durability）", "独立性（isolation）"], correctIndex: 1,
  },
  {
    id: "FE-A-IPA-2023-Q08", section: "A", topic: "ネットワーク", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "5", questionNumber: "問8",
    body: "IPv4ネットワークにおいて，ネットワークの疎通確認に使われるものはどれか。",
    choices: ["BOOTP", "DHCP", "MIB", "ping"], correctIndex: 3,
  },
  {
    id: "FE-A-IPA-2023-Q09", section: "A", topic: "セキュリティ", difficulty: "MEDIUM",
    sourceUrl: A_URL, sourcePage: "5", questionNumber: "問9",
    body: "ドライブバイダウンロード攻撃に該当するものはどれか。",
    choices: [
      "PCから物理的にハードディスクドライブを盗み出し，その中のデータをWebサイトで公開し，ダウンロードさせる。",
      "電子メールの添付ファイルを開かせて，マルウェアに感染したPCのハードディスクドライブ内のファイルを暗号化し，元に戻すための鍵を攻撃者のサーバからダウンロードさせることと引換えに金銭を要求する。",
      "利用者が悪意のあるWebサイトにアクセスしたときに，Webブラウザの脆弱性を悪用して利用者のPCをマルウェアに感染させる。",
      "利用者に気付かれないように無償配布のソフトウェアに不正プログラムを混在させておき，利用者の操作によってPCにダウンロードさせ，インストールさせることでハードディスクドライブから個人情報を収集して攻撃者のサーバに送信する。",
    ], correctIndex: 2,
  },
  {
    id: "FE-A-IPA-2023-Q10", section: "A", topic: "システム開発技術", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "7", questionNumber: "問12",
    body: "アジャイル開発手法のスクラムにおいて，開発チームの全員が1人ずつ「昨日やったこと」，「今日やること」，「障害になっていること」などを話し，全員でプロジェクトの状況を共有するイベントはどれか。",
    choices: ["スプリントプランニング", "スプリントレビュー", "デイリースクラム", "レトロスペクティブ"], correctIndex: 2,
  },
  {
    id: "FE-A-IPA-2023-Q11", section: "A", topic: "マネジメント系", difficulty: "MEDIUM",
    sourceUrl: A_URL, sourcePage: "8", questionNumber: "問14",
    body: "A社では，従業員が自宅のPCからインターネット経由で自社のネットワークに接続して仕事を行うテレワーキングの実施を計画している。A社が定めたテレワーキング運用規程について，情報セキュリティ管理基準（平成28年）に従って監査を実施した。判明した事項のうち，監査人が，指摘事項として監査報告書に記載すべきものはどれか。",
    choices: [
      "テレワーキング運用規程に従うことを条件に，全ての従業員が利用できる。",
      "テレワーキングで従業員が使用するPCは，A社から支給されたものに限定する。",
      "テレワーキングで使用するPCへのマルウェア対策ソフト導入の要不要は，従業員それぞれが判断する。",
      "テレワーキングで使用するPCを，従業員の家族に使用させない。",
    ], correctIndex: 2,
  },
  {
    id: "FE-A-IPA-2023-Q12", section: "A", topic: "システム構成要素", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "9", questionNumber: "問15",
    body: "ハイブリッドクラウドの説明はどれか。",
    choices: [
      "クラウドサービスが提供している機能の一部を，自社用にカスタマイズして利用すること",
      "クラウドサービスのサービス内容を，消費者向けと法人向けの両方を対象とするように構成して提供すること",
      "クラウドサービスのサービス内容を，有償サービスと無償サービスとに区分して提供すること",
      "自社専用に使用するクラウドサービスと，汎用のクラウドサービスとの間でデータ及びアプリケーションソフトウェアの連携や相互運用が可能となる環境を提供すること",
    ], correctIndex: 3,
  },
  {
    id: "FE-A-IPA-2023-Q13", section: "A", topic: "ストラテジ系", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "9", questionNumber: "問16",
    body: "ダイバーシティマネジメントの説明はどれか。",
    choices: [
      "従業員が仕事と生活の調和を図り，やりがいをもって業務に取り組み，組織の活力を向上させることである。",
      "性別や年齢，国籍などの面で従業員の多様性を尊重することによって，組織の活力を向上させることである。",
      "自ら設定した目標の達成を目指して従業員が主体的に業務に取り組み，その達成度に応じて評価が行われることである。",
      "労使双方が労働条件についての合意を形成し，協調して収益の増大を目指すことである。",
    ], correctIndex: 1,
  },
  {
    id: "FE-A-IPA-2023-Q14", section: "A", topic: "ストラテジ系", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "10", questionNumber: "問17",
    body: "ERPを説明したものはどれか。",
    choices: [
      "営業活動にITを活用して営業の効率と品質を高め，売上・利益の大幅な増加や，顧客満足度の向上を目指す手法・概念である。",
      "卸売業・メーカが小売店の経営活動を支援することによって，自社との取引量の拡大につなげる手法・概念である。",
      "企業全体の経営資源を有効かつ総合的に計画して管理し，経営の効率向上を図るための手法・概念である。",
      "消費者向けや企業間の商取引を，インターネットなどの電子的なネットワークを活用して行う手法・概念である。",
    ], correctIndex: 2,
  },
  {
    id: "FE-A-IPA-2023-Q15", section: "A", topic: "ストラテジ系", difficulty: "MEDIUM",
    sourceUrl: A_URL, sourcePage: "10", questionNumber: "問18",
    body: "イノベータ理論では，消費者を新製品の購入時期によって，イノベータ，アーリーアダプタ，アーリーマジョリティ，レイトマジョリティ，ラガードの五つに分類する。アーリーアダプタの説明として，適切なものはどれか。",
    choices: [
      "新しい製品及び新技術の採用には懐疑的で，周囲の大多数が採用している場面を見てから採用する層",
      "新商品，サービスなどを，リスクを恐れず最も早い段階で受容する層",
      "新商品，サービスなどを早期に受け入れ，消費者に大きな影響を与える層であり，流行に敏感で，自ら情報収集を行い判断する層",
      "世の中の動きに関心が薄く，流行が一般化してからそれを採用することが多い層であり，場合によっては不採用を貫く，最も保守的な層",
    ], correctIndex: 2,
  },
  {
    id: "FE-A-IPA-2023-Q16", section: "A", topic: "ストラテジ系", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "11", questionNumber: "問19",
    body: "CIOの説明はどれか。",
    choices: [
      "経営戦略の立案及び業務執行を統括する最高責任者",
      "資金調達，財務報告などの財務面での戦略策定及び執行を統括する最高責任者",
      "自社の技術戦略や研究開発計画の立案及び執行を統括する最高責任者",
      "情報管理，情報システムに関する戦略立案及び執行を統括する最高責任者",
    ], correctIndex: 3,
  },
  {
    id: "FE-A-IPA-2023-Q17", section: "A", topic: "ストラテジ系", difficulty: "MEDIUM",
    sourceUrl: A_URL, sourcePage: "11", questionNumber: "問20",
    body: "ボリュームライセンス契約の説明はどれか。",
    choices: [
      "企業などソフトウェアの大量購入者向けに，インストールできる台数をあらかじめ取り決め，ソフトウェアの使用を認める契約",
      "使用場所を限定した契約であり，特定の施設の中であれば台数や人数に制限なく使用が許される契約",
      "ソフトウェアをインターネットからダウンロードしたとき画面に表示される契約内容に同意するを選択することによって，使用が許される契約",
      "標準の使用許諾条件を定め，その範囲で一定量のパッケージの包装を解いたときに，権利者と購入者との間に使用許諾契約が自動的に成立したとみなす契約",
    ], correctIndex: 0,
  },

  // ---- 科目B ----
  {
    id: "FE-B-IPA-2023-Q01", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    sourceUrl: B_URL, sourcePage: "4", questionNumber: "問1",
    body: "次のプログラム中の［ a ］と［ b ］に入れる正しい答えの組合せを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 findPrimeNumbers は，引数で与えられた整数以下の，全ての素数だけを格納した配列を返す関数である。ここで，引数に与える整数は2以上である。\n〔プログラム〕\n○整数型の配列: findPrimeNumbers(整数型: maxNum)\n　整数型の配列: pnList ← {} // 要素数0の配列\n　整数型: i, j\n　論理型: divideFlag\n　for (i を 2 から ［ a ］ まで 1 ずつ増やす)\n　　divideFlag ← true\n　　/* iの正の平方根の整数部分が2未満のときは，繰返し処理を実行しない */\n　　for (j を 2 から iの正の平方根の整数部分 まで 1 ずつ増やす) // α\n　　　if (［ b ］)\n　　　　divideFlag ← false\n　　　　αの行から始まる繰返し処理を終了する\n　　　endif\n　　endfor\n　　if (divideFlag が true と等しい)\n　　　pnListの末尾 に iの値 を追加する\n　　endif\n　endfor\n　return pnList",
    choices: [
      "a: maxNum／b: i÷jの余り が 0 と等しい",
      "a: maxNum／b: i÷jの商 が 1 と等しくない",
      "a: maxNum＋1／b: i÷jの余り が 0 と等しい",
      "a: maxNum＋1／b: i÷jの商 が 1 と等しくない",
    ], correctIndex: 0,
  },
  {
    id: "FE-B-IPA-2023-Q02", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "MEDIUM",
    sourceUrl: B_URL, sourcePage: "5", questionNumber: "問2",
    body: "次の記述中の［　　］に入れる正しい答えを，解答群の中から選べ。\n次のプログラムにおいて，手続 proc2 を呼び出すと，［　　］の順に出力される。\n〔プログラム〕\n○proc1()\n　\"A\" を出力する\n　proc3()\n○proc2()\n　proc3()\n　\"B\" を出力する\n　proc1()\n○proc3()\n　\"C\" を出力する",
    choices: [
      "\"A\"，\"B\"，\"B\"，\"C\"", "\"A\"，\"C\"", "\"A\"，\"C\"，\"B\"，\"C\"", "\"B\"，\"A\"，\"B\"，\"C\"",
      "\"B\"，\"C\"，\"B\"，\"A\"", "\"C\"，\"B\"", "\"C\"，\"B\"，\"A\"", "\"C\"，\"B\"，\"A\"，\"C\"",
    ], correctIndex: 7,
  },
  {
    id: "FE-B-IPA-2023-Q03", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    sourceUrl: B_URL, sourcePage: "6", questionNumber: "問3",
    body: "次の記述中の［　　］に入れる正しい答えを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n次の手続 sort は，大域の整数型の配列 data の，引数 first で与えられた要素番号から引数 last で与えられた要素番号までの要素を昇順に整列する。ここで，first ＜ last とする。手続 sort を sort(1, 5) として呼び出すと，/*** α ***/ の行を最初に実行したときの出力は「　　」となる。\n〔プログラム〕\n大域: 整数型の配列: data ← {2, 1, 3, 5, 4}\n○sort(整数型: first, 整数型: last)\n　整数型: pivot, i, j\n　pivot ← data[(first ＋ last) ÷ 2 の商]\n　i ← first\n　j ← last\n　while (true)\n　　while (data[i] ＜ pivot)\n　　　i ← i ＋ 1\n　　endwhile\n　　while (pivot ＜ data[j])\n　　　j ← j － 1\n　　endwhile\n　　if (i ≧ j)\n　　　繰返し処理を終了する\n　　endif\n　　data[i]とdata[j]の値を入れ替える\n　　i ← i ＋ 1\n　　j ← j － 1\n　endwhile\n　dataの全要素の値を要素番号の順に空白区切りで出力する /*** α ***/\n　if (first ＜ i － 1)\n　　sort(first, i － 1)\n　endif\n　if (j ＋ 1 ＜ last)\n　　sort(j ＋ 1, last)\n　endif",
    choices: ["1 2 3 4 5", "1 2 3 5 4", "2 1 3 4 5", "2 1 3 5 4"], correctIndex: 3,
  },
  {
    id: "FE-B-IPA-2023-Q04", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    sourceUrl: B_URL, sourcePage: "8", questionNumber: "問4",
    body: "次の記述中の［　　］に入れる正しい答えを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 add は，引数で指定された正の整数 value を大域の整数型の配列 hashArray に格納する。格納できた場合は true を返し，格納できなかった場合は false を返す。ここで，整数 value を hashArray のどの要素に格納すべきかを，関数 calcHash1 及び calcHash2 を利用して決める。\n手続 test は，関数 add を呼び出して，hashArray に正の整数を格納する。手続 test の処理が終了した直後の hashArray の内容は，［　　］である。\n〔プログラム〕\n大域: 整数型の配列: hashArray\n○論理型: add(整数型: value)\n　整数型: i ← calcHash1(value)\n　if (hashArray[i] ＝ －1)\n　　hashArray[i] ← value\n　　return true\n　else\n　　i ← calcHash2(value)\n　　if (hashArray[i] ＝ －1)\n　　　hashArray[i] ← value\n　　　return true\n　　endif\n　endif\n　return false\n○整数型: calcHash1(整数型: value)\n　return (value mod hashArrayの要素数) ＋ 1\n○整数型: calcHash2(整数型: value)\n　return ((value ＋ 3) mod hashArrayの要素数) ＋ 1\n○test()\n　hashArray ← {5個の －1}\n　add(3)\n　add(18)\n　add(11)",
    choices: [
      "{－1, 3, －1, 18, 11}", "{－1, 11, －1, 3, －1}", "{－1, 11, －1, 18, －1}",
      "{－1, 18, －1, 3, 11}", "{－1, 18, 11, 3, －1}",
    ], correctIndex: 3,
  },
  {
    id: "FE-B-IPA-2023-Q05", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    sourceUrl: B_URL, sourcePage: "10", questionNumber: "問5",
    body: "次のプログラム中の［ a ］と［ b ］に入れる正しい答えの組合せを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\nコサイン類似度は，二つのベクトルの向きの類似性を測る尺度である。関数 calcCosineSimilarity は，いずれも要素数が n(n≧1) である実数型の配列 vector1 と vector2 を受け取り，二つの配列のコサイン類似度を返す。配列 vector1 と配列 vector2 のいずれも，全ての要素に0が格納されていることはないものとする。\n〔プログラム〕\n○実数型: calcCosineSimilarity(実数型の配列: vector1, 実数型の配列: vector2)\n　実数型: similarity, numerator, denominator, temp ← 0\n　整数型: i\n　numerator ← 0\n　for (i を 1 から vector1の要素数 まで 1 ずつ増やす)\n　　numerator ← numerator ＋ ［ a ］\n　endfor\n　for (i を 1 から vector1の要素数 まで 1 ずつ増やす)\n　　temp ← temp ＋ vector1[i]の2乗\n　endfor\n　denominator ← tempの正の平方根\n　temp ← 0\n　for (i を 1 から vector2の要素数 まで 1 ずつ増やす)\n　　temp ← temp ＋ vector2[i]の2乗\n　endfor\n　denominator ← ［ b ］\n　similarity ← numerator ÷ denominator\n　return similarity",
    choices: [
      "a: (vector1[i] × vector2[i])の正の平方根／b: denominator × (tempの正の平方根)",
      "a: (vector1[i] × vector2[i])の正の平方根／b: denominator ＋ (tempの正の平方根)",
      "a: (vector1[i] × vector2[i])の正の平方根／b: tempの正の平方根",
      "a: vector1[i] × vector2[i]／b: denominator × (tempの正の平方根)",
      "a: vector1[i] × vector2[i]／b: denominator ＋ (tempの正の平方根)",
      "a: vector1[i] × vector2[i]／b: tempの正の平方根",
      "a: vector1[i]の2乗／b: denominator × (tempの正の平方根)",
      "a: vector1[i]の2乗／b: denominator ＋ (tempの正の平方根)",
      "a: vector1[i]の2乗／b: tempの正の平方根",
    ], correctIndex: 3,
  },
  {
    id: "FE-B-IPA-2023-Q06", section: "B", topic: "情報セキュリティ", difficulty: "MEDIUM",
    sourceUrl: B_URL, sourcePage: "12", questionNumber: "問6",
    body: "A社は，放送会社や運輸会社向けに広告制作ビジネスを展開している。A社は，人事業務の効率化を図るべく，人事業務の委託を検討することにした。委託先候補のC社は，B業務（採用予定者の入社時書類をPDF化してファイルサーバに格納する業務）について，次のように提案した。\n・B業務だけに従事する専任の従業員を割り当てる。\n・複合機のスキャン機能を使用し，従業員ごとに付与した利用者IDとパスワードをパネルに入力してスキャンする。\n・スキャンしたデータをPDFファイルに変換し，従業員ごとに異なる鍵で暗号化して電子メールに添付し，スキャンを実行した本人宛てに送信する。\n・PDFファイルが大きい場合は，添付する代わりに社内ネットワーク上のBサーバに自動的に保存し，保存先のURLを電子メールの本文に記載して送信する（Bサーバへのアクセスには従業員ごとの利用者IDとパスワードが必要）。\nA社がC社に質問表を送付し評価した結果，次の発見があった。\n・複合機のスキャン機能では，電子メールの差出人アドレス，件名，本文及び添付ファイル名を初期設定の状態で使用しており，誰がスキャンを実行しても同じである。\n・複合機のスキャン機能の初期設定情報はベンダーのWebサイトで公開されており，誰でも閲覧できる。\nそこでA社は，初期設定の状態のままでは情報セキュリティリスクがあり，初期設定から変更するという対策が必要であると評価した。対策が必要であると評価した情報セキュリティリスクはどれか。",
    choices: [
      "B業務に従事する従業員が，攻撃者からの電子メールを複合機からのものと信じて本文中にあるURLをクリックし，フィッシングサイトに誘導される。その結果，A社の採用予定者の個人情報が漏えいする。",
      "B業務に従事する従業員が，複合機から送信される電子メールをスパムメールと誤認し，電子メールを削除する。その結果，再スキャンが必要となり，B業務が遅延する。",
      "攻撃者が，複合機から送信される電子メールを盗聴し，添付ファイルを暗号化して身代金を要求する。その結果，A社が復号鍵を受け取るために多額の身代金を支払うことになる。",
      "攻撃者が，複合機から送信される電子メールを盗聴し，本文に記載されているURLを使ってBサーバにアクセスする。その結果，A社の採用予定者の個人情報が漏えいする。",
    ], correctIndex: 0,
  },
];

async function main() {
  console.log(`Importing ${QUESTIONS.length} IPA R5(2023) public questions...`);
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

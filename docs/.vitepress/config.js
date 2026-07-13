import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid({
  lang: 'ja-JP',
  title: 'ネギま！麻帆良祭',
  description: '麻帆良祭を題材にしたブラウザゲームの企画・設計文書',
  themeConfig: {
    nav: [
      { text: 'ホーム', link: '/' },
      { text: '文書索引', link: '/README' },
      { text: '開発ルール', link: '/開発ルール' },
      { text: '実装状況', link: '/実装状況' },
      { text: 'ゲーム概要', link: '/ゲーム概要' }
    ],

    sidebar: [
      { text: '文書索引', link: '/README' },
      { text: '開発ルール', link: '/開発ルール' },
      { text: '実装状況', link: '/実装状況' },
      { text: 'ゲーム概要', link: '/ゲーム概要' },
      {
        text: '基本設計',
        link: '/基本設計/README',
        collapsed: false,
        items: [
          { text: 'メインゲーム状態遷移図', link: '/基本設計/メインゲーム状態遷移図' },
          {
            text: '構想整理',
            link: '/基本設計/構想整理/README',
            collapsed: false,
            items: [
              { text: '取扱説明書', link: '/基本設計/構想整理/取扱説明書' },
              { text: 'ゲーム目的', link: '/基本設計/構想整理/ゲーム目的' },
              { text: 'メイン進行', link: '/基本設計/構想整理/メイン進行' },
              { text: '3日目最終局面', link: '/基本設計/構想整理/3日目最終局面' },
              { text: '移動と表現方針', link: '/基本設計/構想整理/移動と表現方針' },
              { text: '実績機能', link: '/基本設計/構想整理/実績機能' },
              { text: 'セーブデータ', link: '/基本設計/構想整理/セーブデータ' },
              { text: '教師仕事', link: '/基本設計/構想整理/教師仕事' },
              { text: 'アイテム', link: '/基本設計/構想整理/アイテム' },
              {
                text: 'イベントモデル',
                link: '/基本設計/構想整理/イベントモデル/README',
                collapsed: false,
                items: [
                  { text: 'イベント発生モデル', link: '/基本設計/構想整理/イベントモデル/イベント発生モデル' },
                  { text: 'イベント体験分類', link: '/基本設計/構想整理/イベントモデル/イベント体験分類' },
                  { text: '祭りイベント活性モデル', link: '/基本設計/構想整理/イベントモデル/祭りイベント活性モデル' },
                  { text: '時間巻き戻しイベント', link: '/基本設計/構想整理/イベントモデル/時間巻き戻しイベント' },
                  { text: '失敗巻き戻しイベント', link: '/基本設計/構想整理/イベントモデル/失敗巻き戻しイベント' },
                ],
              },
              { text: '武道会', link: '/基本設計/構想整理/武道会' },
              { text: 'エヴァの別荘', link: '/基本設計/構想整理/エヴァの別荘' },
              {
                text: 'ダンジョン探索',
                link: '/基本設計/構想整理/ダンジョン探索/README',
                collapsed: false,
                items: [
                  { text: '地下水路探索', link: '/基本設計/構想整理/ダンジョン探索/地下水路探索' },
                  { text: '図書館島ダンジョン', link: '/基本設計/構想整理/ダンジョン探索/図書館島ダンジョン' },
                ],
              },
              { text: 'チュートリアル導入案', link: '/基本設計/構想整理/チュートリアル導入案' },
            ],
          },
          {
            text: 'シーン',
            link: '/基本設計/シーン/README',
            collapsed: false,
            items: [
              { text: 'タイトルシーン', link: '/基本設計/シーン/タイトルシーン' },
              { text: 'メインゲームシーン', link: '/基本設計/シーン/メインゲームシーン' },
              { text: '会話シーン', link: '/基本設計/シーン/会話シーン' }
            ]
          },
          {
            text: 'ゲームシステム',
            collapsed: false,
            items: [
              { text: '三日間システム', link: '/基本設計/ゲームシステム/三日間システム' },
              { text: 'カシオペアシステム', link: '/基本設計/ゲームシステム/カシオペアシステム' },
              { text: 'MahoPayポイント', link: '/基本設計/ゲームシステム/MahoPayポイント' },
              { text: 'MahoPayポイント収支一覧', link: '/基本設計/ゲームシステム/MahoPayポイント収支一覧' },
              { text: 'マップ', link: '/基本設計/ゲームシステム/マップ' },
              { text: '会話', link: '/基本設計/ゲームシステム/会話' }
            ]
          },
          {
            text: 'イベント',
            link: '/基本設計/イベント/README',
            collapsed: false,
            items: [
              { text: '配達イベント', link: '/基本設計/イベント/配達イベント' },
              { text: '同行イベント', link: '/基本設計/イベント/同行イベント' },
              { text: '見回りイベント', link: '/基本設計/イベント/見回りイベント' },
              { text: '連絡掲示イベント', link: '/基本設計/イベント/連絡掲示イベント' },
              { text: '展示トラブル対応イベント', link: '/基本設計/イベント/展示トラブル対応イベント' },
            ],
          },
        ],
      },
      {
        text: '詳細設計',
        link: '/詳細設計/README',
        collapsed: false,
        items: [
          { text: 'フレーム更新スイムレーン', link: '/詳細設計/フレーム更新スイムレーン' },
          { text: 'メインゲーム状態遷移図', link: '/詳細設計/メインゲーム状態遷移図' },
          {
            text: 'ゲームエンジン',
            collapsed: false,
            items: [
              { text: 'Core', link: '/詳細設計/ゲームエンジン/Core' },
              { text: 'GameObject', link: '/詳細設計/ゲームエンジン/GameObject' },
              { text: 'SceneContract', link: '/詳細設計/ゲームエンジン/SceneContract' }
            ]
          },
          {
            text: 'ドメイン',
            collapsed: false,
            items: [
              {
                text: 'シーン',
                link: '/詳細設計/ドメイン/シーン/README',
                collapsed: false,
                items: [
                  { text: 'TitleScene', link: '/詳細設計/ドメイン/シーン/TitleScene' },
                  { text: 'MainGameScene', link: '/詳細設計/ドメイン/シーン/MainGameScene' },
                  { text: 'ConversationScene', link: '/詳細設計/ドメイン/シーン/ConversationScene' }
                ]
              },
              {
                text: '会話',
                collapsed: false,
                items: [
                  {
                    text: 'ConversationSceneSession',
                    link: '/詳細設計/ドメイン/会話/ConversationSceneSession'
                  }
                ]
              },
              {
                text: 'イベント',
                link: '/詳細設計/ドメイン/イベント/README',
                collapsed: false,
                items: [
                  { text: 'EventIdSequence', link: '/詳細設計/ドメイン/イベント/EventIdSequence' },
                  { text: 'PatrolEventManager', link: '/詳細設計/ドメイン/イベント/PatrolEventManager' },
                  { text: 'PatrolEvent', link: '/詳細設計/ドメイン/イベント/PatrolEvent' },
                  { text: 'PatrolTask', link: '/詳細設計/ドメイン/イベント/PatrolTask' },
                  { text: 'BranchEventManager', link: '/詳細設計/ドメイン/イベント/BranchEventManager' },
                  { text: 'BranchEvent', link: '/詳細設計/ドメイン/イベント/BranchEvent' },
                  { text: 'BranchTask', link: '/詳細設計/ドメイン/イベント/BranchTask' },
                  { text: 'NoticeBoardEvent', link: '/詳細設計/ドメイン/イベント/NoticeBoardEvent' },
                  { text: 'ExhibitTroubleEvent', link: '/詳細設計/ドメイン/イベント/ExhibitTroubleEvent' },
                ],
              },
            ],
          },
        ],
      },
      {
        text: 'テスト設計',
        link: '/テスト設計/README',
        collapsed: false,
        items: [
          {
            text: '単体テスト',
            collapsed: false,
            items: [
              {
                text: 'EventIdSequence',
                link: '/テスト設計/単体テスト/ドメイン/イベント/EventIdSequence'
              },
              {
                text: 'PatrolEventManager',
                link: '/テスト設計/単体テスト/ドメイン/イベント/PatrolEventManager'
              },
              {
                text: 'PatrolEvent',
                link: '/テスト設計/単体テスト/ドメイン/イベント/PatrolEvent'
              },
              {
                text: 'PatrolTask',
                link: '/テスト設計/単体テスト/ドメイン/イベント/PatrolTask'
              },
              {
                text: 'BranchEventManager',
                link: '/テスト設計/単体テスト/ドメイン/イベント/BranchEventManager'
              },
              {
                text: 'BranchEvent',
                link: '/テスト設計/単体テスト/ドメイン/イベント/BranchEvent'
              },
              {
                text: 'BranchTask',
                link: '/テスト設計/単体テスト/ドメイン/イベント/BranchTask'
              }
            ]
          }
        ]
      },
      {
        text: '用語集',
        collapsed: true,
        items: [
          { text: 'ユビキタス言語', link: '/用語集/ユビキタス言語' },
          { text: '基本', link: '/用語集/基本' },
          { text: '道具', link: '/用語集/道具' },
          { text: 'キャラクター案内', link: '/用語集/キャラクター' },
          {
            text: '魔法先生ネギま！',
            collapsed: true,
            items: [
              { text: '基本用語', link: '/用語集/魔法先生ネギま/基本用語' },
              {
                text: 'キャラクター',
                link: '/用語集/魔法先生ネギま/キャラクター/README',
                collapsed: true,
                items: [
                  {
                    text: 'ネギ・スプリングフィールド',
                    link: '/用語集/魔法先生ネギま/キャラクター/ネギ・スプリングフィールド'
                  },
                  { text: '相坂さよ', link: '/用語集/魔法先生ネギま/キャラクター/相坂さよ' },
                  { text: '明石裕奈', link: '/用語集/魔法先生ネギま/キャラクター/明石裕奈' },
                  { text: '朝倉和美', link: '/用語集/魔法先生ネギま/キャラクター/朝倉和美' },
                  { text: '綾瀬夕映', link: '/用語集/魔法先生ネギま/キャラクター/綾瀬夕映' },
                  { text: '和泉亜子', link: '/用語集/魔法先生ネギま/キャラクター/和泉亜子' },
                  { text: '大河内アキラ', link: '/用語集/魔法先生ネギま/キャラクター/大河内アキラ' },
                  { text: '柿崎美砂', link: '/用語集/魔法先生ネギま/キャラクター/柿崎美砂' },
                  { text: '神楽坂明日菜', link: '/用語集/魔法先生ネギま/キャラクター/神楽坂明日菜' },
                  { text: '春日美空', link: '/用語集/魔法先生ネギま/キャラクター/春日美空' },
                  { text: '絡繰茶々丸', link: '/用語集/魔法先生ネギま/キャラクター/絡繰茶々丸' },
                  { text: '釘宮円', link: '/用語集/魔法先生ネギま/キャラクター/釘宮円' },
                  { text: '古菲', link: '/用語集/魔法先生ネギま/キャラクター/古菲' },
                  { text: '近衛木乃香', link: '/用語集/魔法先生ネギま/キャラクター/近衛木乃香' },
                  { text: '早乙女ハルナ', link: '/用語集/魔法先生ネギま/キャラクター/早乙女ハルナ' },
                  { text: '桜咲刹那', link: '/用語集/魔法先生ネギま/キャラクター/桜咲刹那' },
                  { text: '佐々木まき絵', link: '/用語集/魔法先生ネギま/キャラクター/佐々木まき絵' },
                  { text: '椎名桜子', link: '/用語集/魔法先生ネギま/キャラクター/椎名桜子' },
                  { text: '龍宮真名', link: '/用語集/魔法先生ネギま/キャラクター/龍宮真名' },
                  { text: '超鈴音', link: '/用語集/魔法先生ネギま/キャラクター/超鈴音' },
                  { text: '長瀬楓', link: '/用語集/魔法先生ネギま/キャラクター/長瀬楓' },
                  { text: '那波千鶴', link: '/用語集/魔法先生ネギま/キャラクター/那波千鶴' },
                  { text: '鳴滝風香', link: '/用語集/魔法先生ネギま/キャラクター/鳴滝風香' },
                  { text: '鳴滝史伽', link: '/用語集/魔法先生ネギま/キャラクター/鳴滝史伽' },
                  { text: '葉加瀬聡美', link: '/用語集/魔法先生ネギま/キャラクター/葉加瀬聡美' },
                  { text: '長谷川千雨', link: '/用語集/魔法先生ネギま/キャラクター/長谷川千雨' },
                  {
                    text: 'エヴァンジェリン・A・K・マクダウェル',
                    link: '/用語集/魔法先生ネギま/キャラクター/エヴァンジェリン・A・K・マクダウェル'
                  },
                  { text: '宮崎のどか', link: '/用語集/魔法先生ネギま/キャラクター/宮崎のどか' },
                  { text: '村上夏美', link: '/用語集/魔法先生ネギま/キャラクター/村上夏美' },
                  { text: '雪広あやか', link: '/用語集/魔法先生ネギま/キャラクター/雪広あやか' },
                  { text: '四葉五月', link: '/用語集/魔法先生ネギま/キャラクター/四葉五月' },
                  { text: 'ザジ・レイニーデイ', link: '/用語集/魔法先生ネギま/キャラクター/ザジ・レイニーデイ' },
                  { text: '高畑・T・タカミチ', link: '/用語集/魔法先生ネギま/キャラクター/高畑・T・タカミチ' },
                  { text: '源しずな', link: '/用語集/魔法先生ネギま/キャラクター/源しずな' }
                ]
              }
            ]
          }
        ]
      },
      { text: 'アイデア', link: '/アイデア' }
    ],

    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '検索',
            buttonAriaLabel: '文書を検索'
          },
          modal: {
            noResultsText: '該当する文書がありません',
            resetButtonTitle: '検索をリセット',
            footer: {
              selectText: '選択',
              navigateText: '移動',
              closeText: '閉じる'
            }
          }
        }
      }
    },

    outline: {
      level: [2, 3],
      label: '目次'
    },
    docFooter: {
      prev: '前のページ',
      next: '次のページ'
    },
    sidebarMenuLabel: 'ページ一覧',
    returnToTopLabel: 'ページ上部へ戻る',
    darkModeSwitchLabel: 'テーマ'
  },
  srcExclude: ['**/AGENTS.md'],
  mermaid: { theme: 'forest' },
  mermaidPlugin: { class: 'mermaid my-class' }
})

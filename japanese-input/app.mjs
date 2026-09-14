import {initialState,transition,reading,preview,displayText} from './src/core.mjs';
import {ROWS,unitText} from './src/mapping.mjs';
import {parseLog,serializeLog,MAX_LOG_EVENTS,MAX_LOG_BYTES,createLogSizeTracker} from './src/replay.mjs';

const $=id=>document.getElementById(id);

const locales={
  'zh-Hans':{
    lang:'zh-CN',numberLocale:'zh-CN',title:'假名工坊 · 日文输入试打 | むしぞる中尉',navAria:'站点导航',home:'← むしぞる中尉 · 首页',privacy:'Privacy Policy',languageLabel:'语言',languageAria:'语言选择',
    eyebrow:'NEW JAPANESE INPUT / WEB LAB',pageTitle:'假名工坊',prototype:'试打原型 0.2',lead:'右手选行，左手选段。每次按键，都能看清发生了什么。',running:'● 在浏览器中运行',
    webHelp:'请在电脑上使用带数字小键盘的实体键盘，并切换到系统英数输入。屏幕上的键位图用于提示，不是触屏键盘。输入与回放在当前浏览器内处理。',
    trial:'试打区',legendCommitted:'黑色：已确定',legendEditing:'蓝色：编辑中',legendPending:'虚线：待定あ段',captureLabel:'点击下方开始输入 · 只在此处捕获按键',captureAria:'试打按键输入',placeholder:'点这里，再按小键盘 6 → F → D，观察「か → き」',
    notice:'浏览器原型请使用系统英数输入；Caps Lock 切换的是原型内部模式。',editHelp:'退格 / 小键盘 .：删除已配对假名；待定行、无效提示或候选中回退一步。Esc / 撤销：恢复上次操作。',
    undo:'撤销',clear:'清空',copy:'复制文字',export:'导出记录',import:'导入回放',candidateLabel:'启用候选规则演示',candidateBadge:'模拟候选，非真实 IME',candidateHelp:'示例读音：か／かな／にほん。小键盘 + 变换，↑↓ 选择，Space 或 Enter 接受。',
    statusTitle:'输入状态',focusBlurred:'未聚焦',focusFocused:'正在捕获',activeRow:'活动行',statusPairing:'配对状态',statusUndo:'撤销记录',statusCandidate:'候选来源',activeRowHeldSuffix:'（按住）',pendingPrefix:'待定 ',paired:'已配对／可继续输入',empty:'尚未输入',editable:'可修改前字',none:'无',candidateSourceDemo:'模拟候选',candidateSourceIme:'真实 IME 未接入',countText:'{events} 个事件 · {bytes} B',
    hintActionsTitle:'按住与松开，是两种动作',hintActions:'按住行键，再按段键：追加假名。<br>行键松开且配对完成：段键修改前字。',hintOrderTitle:'没有时间容差',hintOrder:'行键必须先到。段键先到时，按改字或英文字母规则处理。',
    leftTitle:'左手 · 段与修饰',rightTitle:'右手 · 行',shortcutsTitle:'操作速记',shortcutMode:'<kbd>Caps Lock</kbd> 英数 → 平假名 → 片假名',shortcutKeys:'<kbd>.</kbd> 退格　<kbd>+</kbd> 变换　<kbd>−</kbd> ー',shortcutUndo:'<kbd>Esc</kbd> 撤销前次输入或候选选择',shortcutFocus:'英数模式恢复普通键义。界面失焦后不捕获按键。',
    diagnostics:'事件诊断与回放',footer:'末尾编辑实验 · 无系统级键盘接管 · 候选为模拟演示，尚未接入真实 IME · ',emptyOutput:'从一个假名开始。',
    noticeIme:'检测到系统 IME 正在组字。请先切到系统英数输入，再使用此原型。',noticeMode:'内部模式：{mode}。已有读音和字形保持不变；未控制系统 IME。',noticePaste:'试打区仅支持末尾按键输入；事件日志请通过「导入回放」载入。',noticeCopySuccess:'已复制当前显示文字（包含待定预览）。',noticeCopyFailure:'浏览器未允许复制，请选择显示文字后手动复制。',noticeConvert:'已请求变换，真实 IME 尚未接入。',noticeNoFixture:'这个读音没有模拟词条，可试「か」「かな」「にほん」。',importSuccess:'已回放 {count} 个事件。',importFailure:'导入失败：',exportFailure:'导出失败：',logOver:'日志已超过导出上限（{events} 个事件或 {bytes} B）；仍可继续试打、复制和记录，但不能导出。',logNear:'日志接近导出上限（{events}/{maxEvents} 个事件，{bytes}/{maxBytes} B）。',
    mode:{english:'英数',hiragana:'平假名',katakana:'片假名'},row:{Numpad0:'や行',Numpad1:'ま行',Numpad2:'ら行',Numpad3:'わ・を・ん',Numpad4:'な行',Numpad5:'た行',Numpad6:'か行',Numpad7:'さ行',Numpad8:'あ行',Numpad9:'は行'},segment:{KeyW:'小假名',KeyE:'っ',KeyR:'半浊点',KeyT:'浊点',KeyA:'え',KeyS:'お',KeyD:'い',KeyF:'あ',KeyG:'う',KeyX:'、',KeyC:'。'},backspace:'退格',convert:'变换'
  },
  'zh-Hant':{
    lang:'zh-TW',numberLocale:'zh-TW',title:'假名工坊 · 日文輸入試打 | むしぞる中尉',navAria:'網站導覽',home:'← むしぞる中尉 · 首頁',privacy:'Privacy Policy',languageLabel:'語言',languageAria:'語言選擇',
    eyebrow:'NEW JAPANESE INPUT / WEB LAB',pageTitle:'假名工坊',prototype:'試打原型 0.2',lead:'右手選行，左手選段。每次按鍵，都能看清發生了什麼。',running:'● 在瀏覽器中執行',
    webHelp:'請使用配備數字鍵盤的實體鍵盤，並切換到系統英數輸入。畫面上的鍵位圖僅供提示，不是觸控鍵盤。輸入與回放都在目前瀏覽器內處理。',
    trial:'試打區',legendCommitted:'黑色：已確定',legendEditing:'藍色：編輯中',legendPending:'虛線：待定あ段',captureLabel:'點擊下方開始輸入 · 僅在此處捕獲按鍵',captureAria:'試打按鍵輸入',placeholder:'點這裡，再按小鍵盤 6 → F → D，觀察「か → き」',
    notice:'瀏覽器原型請使用系統英數輸入；Caps Lock 切換的是原型內部模式。',editHelp:'退格 / 小鍵盤 .：刪除已配對假名；待定行、無效提示或候選中退回一步。Esc / 撤銷：恢復上次操作。',
    undo:'撤銷',clear:'清空',copy:'複製文字',export:'匯出記錄',import:'匯入回放',candidateLabel:'啟用候選規則示範',candidateBadge:'模擬候選，非真實 IME',candidateHelp:'範例讀音：か／かな／にほん。小鍵盤 + 變換，↑↓ 選擇，Space 或 Enter 接受。',
    statusTitle:'輸入狀態',focusBlurred:'未聚焦',focusFocused:'正在捕獲',activeRow:'活動行',statusPairing:'配對狀態',statusUndo:'撤銷記錄',statusCandidate:'候選來源',activeRowHeldSuffix:'（按住）',pendingPrefix:'待定 ',paired:'已配對／可繼續輸入',empty:'尚未輸入',editable:'可修改前字',none:'無',candidateSourceDemo:'模擬候選',candidateSourceIme:'真實 IME 未接入',countText:'{events} 個事件 · {bytes} B',
    hintActionsTitle:'按住與鬆開，是兩種動作',hintActions:'按住行鍵，再按段鍵：追加假名。<br>行鍵鬆開且配對完成：段鍵修改前字。',hintOrderTitle:'沒有時間容差',hintOrder:'行鍵必須先到。段鍵先到時，按改字或英文字母規則處理。',
    leftTitle:'左手 · 段與修飾',rightTitle:'右手 · 行',shortcutsTitle:'操作速記',shortcutMode:'<kbd>Caps Lock</kbd> 英數 → 平假名 → 片假名',shortcutKeys:'<kbd>.</kbd> 退格　<kbd>+</kbd> 變換　<kbd>−</kbd> ー',shortcutUndo:'<kbd>Esc</kbd> 撤銷前次輸入或候選選擇',shortcutFocus:'英數模式恢復普通鍵義。介面失焦後不捕獲按鍵。',
    diagnostics:'事件診斷與回放',footer:'末尾編輯實驗 · 無系統級鍵盤接管 · 候選為模擬演示，尚未接入真實 IME · ',emptyOutput:'從一個假名開始。',
    noticeIme:'偵測到系統 IME 正在組字。請先切換到系統英數輸入，再使用此原型。',noticeMode:'內部模式：{mode}。既有讀音和字形保持不變；未控制系統 IME。',noticePaste:'試打區僅支援末尾按鍵輸入；事件記錄請透過「匯入回放」載入。',noticeCopySuccess:'已複製目前顯示文字（包含待定預覽）。',noticeCopyFailure:'瀏覽器未允許複製，請選取顯示文字後手動複製。',noticeConvert:'已請求變換，真實 IME 尚未接入。',noticeNoFixture:'這個讀音沒有模擬詞條，可試「か」「かな」「にほん」。',importSuccess:'已回放 {count} 個事件。',importFailure:'匯入失敗：',exportFailure:'匯出失敗：',logOver:'記錄已超過匯出上限（{events} 個事件或 {bytes} B）；仍可繼續試打、複製和記錄，但不能匯出。',logNear:'記錄接近匯出上限（{events}/{maxEvents} 個事件，{bytes}/{maxBytes} B）。',
    mode:{english:'英數',hiragana:'平假名',katakana:'片假名'},row:{Numpad0:'や行',Numpad1:'ま行',Numpad2:'ら行',Numpad3:'わ・を・ん',Numpad4:'な行',Numpad5:'た行',Numpad6:'か行',Numpad7:'さ行',Numpad8:'あ行',Numpad9:'は行'},segment:{KeyW:'小假名',KeyE:'っ',KeyR:'半濁點',KeyT:'濁點',KeyA:'え',KeyS:'お',KeyD:'い',KeyF:'あ',KeyG:'う',KeyX:'、',KeyC:'。'},backspace:'退格',convert:'變換'
  },
  ja:{
    lang:'ja',numberLocale:'ja-JP',title:'かな工房 · 日本語入力を試す | むしぞる中尉',navAria:'サイトナビゲーション',home:'← むしぞる中尉 · ホーム',privacy:'Privacy Policy',languageLabel:'言語',languageAria:'言語を選択',
    eyebrow:'NEW JAPANESE INPUT / WEB LAB',pageTitle:'かな工房',prototype:'試打プロトタイプ 0.2',lead:'右手で行を、左手で段を選びます。押すたびに何が起きたかを確認できます。',running:'● ブラウザーで実行',
    webHelp:'数字キーパッド付きの実物キーボードを使い、システム入力を英数に切り替えてください。画面のキー配置は案内用で、タッチキーボードではありません。入力と再生はこのブラウザー内で処理します。',
    trial:'試打エリア',legendCommitted:'黒：確定',legendEditing:'青：編集中',legendPending:'破線：未確定のあ段',captureLabel:'クリックして入力を開始 · ここだけでキーを取得',captureAria:'試打キー入力',placeholder:'ここをクリックして、テンキー 6 → F → D を押すと「か → き」',
    notice:'ブラウザー版プロトタイプはシステム入力を英数にしてください。Caps Lock はプロトタイプ内のモードを切り替えます。',editHelp:'Backspace / テンキー .：確定済みのかなを削除。未確定行・無効な指定・候補中は一段階戻します。Esc / 取り消し：直前の操作を元に戻します。',
    undo:'元に戻す',clear:'クリア',copy:'文字をコピー',export:'記録をエクスポート',import:'リプレイをインポート',candidateLabel:'候補ルールを試す',candidateBadge:'模擬候補・実際の IME ではありません',candidateHelp:'例：か／かな／にほん。テンキー + で変換、↑↓で選択、Space または Enter で確定。',
    statusTitle:'入力状態',focusBlurred:'未フォーカス',focusFocused:'入力を取得中',activeRow:'アクティブな行',statusPairing:'配列状態',statusUndo:'取り消し履歴',statusCandidate:'候補の出所',activeRowHeldSuffix:'（押下中）',pendingPrefix:'未確定 ',paired:'配列済み／続けて入力できます',empty:'未入力',editable:'変更できる直前のかな',none:'なし',candidateSourceDemo:'模擬候補',candidateSourceIme:'実際の IME は未接続',countText:'{events} 件のイベント · {bytes} B',
    hintActionsTitle:'押している間と離した後は別の動作です',hintActions:'行キーを押したまま段キー：かなを追加。<br>行キーを離して配列が確定した後：段キーで直前の文字を変更。',hintOrderTitle:'時間の猶予なし',hintOrder:'行キーが先です。段キーが先に押された場合は、変更キーまたは英字入力として扱います。',
    leftTitle:'左手 · 段と修飾',rightTitle:'右手 · 行',shortcutsTitle:'操作早見',shortcutMode:'<kbd>Caps Lock</kbd> 英数 → ひらがな → カタカナ',shortcutKeys:'<kbd>.</kbd> 後退　<kbd>+</kbd> 変換　<kbd>−</kbd> ー',shortcutUndo:'<kbd>Esc</kbd> 直前の入力または候補選択を取り消す',shortcutFocus:'英数モードでは通常のキー動作に戻ります。フォーカスを外すとキーを取得しません。',
    diagnostics:'イベント診断とリプレイ',footer:'末尾編集の実験 · システム全体のキーは乗っ取りません · 候補は模擬デモで、実際の IME には未接続 · ',emptyOutput:'かなを入力してください。',
    noticeIme:'システム IME が文字を組み立てています。プロトタイプを使う前にシステム入力を英数へ切り替えてください。',noticeMode:'内部モード：{mode}。既存の読みと字形はそのままです。システム IME は制御しません。',noticePaste:'試打エリアは末尾のキー入力だけを受け付けます。イベントログは「リプレイをインポート」から読み込んでください。',noticeCopySuccess:'現在の表示文字（未確定プレビューを含む）をコピーしました。',noticeCopyFailure:'ブラウザーがコピーを許可しませんでした。表示文字を選択して手動でコピーしてください。',noticeConvert:'変換を要求しました。実際の IME は接続されていません。',noticeNoFixture:'この読みの模擬候補はありません。「か」「かな」「にほん」を試してください。',importSuccess:'{count} 件のイベントを再生しました。',importFailure:'インポートに失敗：',exportFailure:'エクスポートに失敗：',logOver:'ログがエクスポート上限を超えています（{events} イベントまたは {bytes} B）。試打・コピー・記録は続けられますが、エクスポートはできません。',logNear:'ログがエクスポート上限に近づいています（{events}/{maxEvents} イベント、{bytes}/{maxBytes} B）。',
    mode:{english:'英数',hiragana:'ひらがな',katakana:'カタカナ'},row:{Numpad0:'や行',Numpad1:'ま行',Numpad2:'ら行',Numpad3:'わ・を・ん',Numpad4:'な行',Numpad5:'た行',Numpad6:'か行',Numpad7:'さ行',Numpad8:'あ行',Numpad9:'は行'},segment:{KeyW:'小書き',KeyE:'っ',KeyR:'半濁点',KeyT:'濁点',KeyA:'え',KeyS:'お',KeyD:'い',KeyF:'あ',KeyG:'う',KeyX:'、',KeyC:'。'},backspace:'後退',convert:'変換'
  },
  en:{
    lang:'en',numberLocale:'en-US',title:'Kana Workshop · Japanese Input Trial | むしぞる中尉',navAria:'Site navigation',home:'← むしぞる中尉 · Home',privacy:'Privacy Policy',languageLabel:'Language',languageAria:'Choose language',
    eyebrow:'NEW JAPANESE INPUT / WEB LAB',pageTitle:'Kana Workshop',prototype:'Trial prototype 0.2',lead:'Choose rows with your right hand and columns with your left. See what happens after every key press.',running:'● Runs in your browser',
    webHelp:'Use a physical keyboard with a numeric keypad and switch the system input to English mode. The on-screen layout is a guide, not a touch keyboard. Input and replay are processed in this browser.',
    trial:'Trial area',legendCommitted:'Black: committed',legendEditing:'Blue: editing',legendPending:'Dashed: pending あ-row preview',captureLabel:'Click below to start input · keys are captured here only',captureAria:'Trial key input',placeholder:'Click here, then press Numpad 6 → F → D to watch 「か → き」',
    notice:'Use the system English input for this browser prototype. Caps Lock switches the prototype mode.',editHelp:'Backspace / Numpad .: delete a paired kana; for a pending row, invalid modifier, or candidate, step back once. Esc / Undo: restore the previous action.',
    undo:'Undo',clear:'Clear',copy:'Copy text',export:'Export log',import:'Import replay',candidateLabel:'Try candidate rules',candidateBadge:'Simulated candidates · not a real IME',candidateHelp:'Example readings: か / かな / にほん. Press Numpad + to convert, ↑↓ to choose, Space or Enter to accept.',
    statusTitle:'Input status',focusBlurred:'Not focused',focusFocused:'Capturing input',activeRow:'Active row',statusPairing:'Pairing status',statusUndo:'Undo history',statusCandidate:'Candidate source',activeRowHeldSuffix:' (held)',pendingPrefix:'Pending ',paired:'Paired / ready to continue',empty:'No input yet',editable:'Editable previous kana',none:'None',candidateSourceDemo:'Simulated candidates',candidateSourceIme:'Real IME not connected',countText:'{events} events · {bytes} B',
    hintActionsTitle:'Holding and releasing are different actions',hintActions:'Hold a row key, then press a column key to append kana.<br>Release the row key, then use a column key to modify the previous character.',hintOrderTitle:'No timing tolerance',hintOrder:'The row key must come first. If the column key comes first, it follows the modifier or English-letter rule.',
    leftTitle:'Left hand · columns and modifiers',rightTitle:'Right hand · rows',shortcutsTitle:'Quick reference',shortcutMode:'<kbd>Caps Lock</kbd> English → Hiragana → Katakana',shortcutKeys:'<kbd>.</kbd> Backspace　<kbd>+</kbd> Convert　<kbd>−</kbd> ー',shortcutUndo:'<kbd>Esc</kbd> Undo the previous input or candidate selection',shortcutFocus:'English mode returns normal key behavior. Keys are ignored when the page loses focus.',
    diagnostics:'Event diagnostics and replay',footer:'Tail-editing experiment · No system-wide keyboard takeover · Candidates are a simulated demo, not a real IME · ',emptyOutput:'Start with a kana.',
    noticeIme:'The system IME is composing text. Switch to English input before using this prototype.',noticeMode:'Internal mode: {mode}. Existing readings and glyphs stay unchanged; the system IME is not controlled.',noticePaste:'The trial area accepts end-of-line key input only; use Import replay to load an event log.',noticeCopySuccess:'Copied the displayed text, including the pending preview.',noticeCopyFailure:'The browser did not allow copying. Select the displayed text and copy it manually.',noticeConvert:'Conversion requested; a real IME is not connected.',noticeNoFixture:'No simulated entry for this reading. Try 「か」「かな」「にほん」.',importSuccess:'Replayed {count} events.',importFailure:'Import failed: ',exportFailure:'Export failed: ',logOver:'The log exceeds the export limit ({events} events or {bytes} B). You can keep trying, copying, and recording, but cannot export.',logNear:'The log is close to the export limit ({events}/{maxEvents} events, {bytes}/{maxBytes} B).',
    mode:{english:'English',hiragana:'Hiragana',katakana:'Katakana'},row:{Numpad0:'ya row',Numpad1:'ma row',Numpad2:'ra row',Numpad3:'wa・wo・n row',Numpad4:'na row',Numpad5:'ta row',Numpad6:'ka row',Numpad7:'sa row',Numpad8:'a row',Numpad9:'ha row'},segment:{KeyW:'Small kana',KeyE:'っ',KeyR:'Handakuten',KeyT:'Dakuten',KeyA:'え',KeyS:'お',KeyD:'い',KeyF:'あ',KeyG:'う',KeyX:'、',KeyC:'。'},backspace:'Backspace',convert:'Convert'
  },
  es:{
    lang:'es',numberLocale:'es-ES',title:'Taller de kana · Prueba de entrada japonesa | むしぞる中尉',navAria:'Navegación del sitio',home:'← むしぞる中尉 · Inicio',privacy:'Privacy Policy',languageLabel:'Idioma',languageAria:'Elegir idioma',
    eyebrow:'NEW JAPANESE INPUT / WEB LAB',pageTitle:'Taller de kana',prototype:'Prototipo de prueba 0.2',lead:'Elige las filas con la mano derecha y las columnas con la izquierda. Comprueba qué ocurre con cada tecla.',running:'● Funciona en el navegador',
    webHelp:'Usa un teclado físico con teclado numérico y cambia la entrada del sistema al modo inglés. La disposición en pantalla es una guía, no un teclado táctil. La entrada y la reproducción se procesan en este navegador.',
    trial:'Área de prueba',legendCommitted:'Negro: confirmado',legendEditing:'Azul: en edición',legendPending:'Línea discontinua: vista previa de la fila あ pendiente',captureLabel:'Haz clic abajo para empezar · solo aquí se capturan las teclas',captureAria:'Entrada de prueba',placeholder:'Haz clic aquí y pulsa teclado numérico 6 → F → D para ver «か → き»',
    notice:'Usa la entrada de sistema en inglés para este prototipo. Caps Lock cambia el modo interno.',editHelp:'Retroceso / teclado numérico .: elimina un kana emparejado; con una fila pendiente, modificador no válido o candidato, retrocede un paso. Esc / Deshacer: restaura la acción anterior.',
    undo:'Deshacer',clear:'Limpiar',copy:'Copiar texto',export:'Exportar registro',import:'Importar reproducción',candidateLabel:'Probar reglas de candidatos',candidateBadge:'Candidatos simulados · no es un IME real',candidateHelp:'Lecturas de ejemplo: か / かな / にほん. Pulsa teclado numérico + para convertir, ↑↓ para elegir y Space o Enter para aceptar.',
    statusTitle:'Estado de entrada',focusBlurred:'Sin foco',focusFocused:'Capturando',activeRow:'Fila activa',statusPairing:'Estado de combinación',statusUndo:'Historial de deshacer',statusCandidate:'Origen del candidato',activeRowHeldSuffix:' (pulsada)',pendingPrefix:'Pendiente ',paired:'Emparejado / listo para continuar',empty:'Sin entrada',editable:'Kana anterior editable',none:'Ninguno',candidateSourceDemo:'Candidatos simulados',candidateSourceIme:'IME real no conectado',countText:'{events} eventos · {bytes} B',
    hintActionsTitle:'Mantener pulsada y soltar son acciones distintas',hintActions:'Mantén pulsada una tecla de fila y pulsa una de columna para añadir kana.<br>Suelta la tecla de fila y usa una tecla de columna para modificar el carácter anterior.',hintOrderTitle:'Sin tolerancia temporal',hintOrder:'La tecla de fila debe ir primero. Si la columna va primero, se aplica la regla de modificador o de letra inglesa.',
    leftTitle:'Mano izquierda · columnas y modificadores',rightTitle:'Mano derecha · filas',shortcutsTitle:'Referencia rápida',shortcutMode:'<kbd>Caps Lock</kbd> Inglés → Hiragana → Katakana',shortcutKeys:'<kbd>.</kbd> Retroceso　<kbd>+</kbd> Convertir　<kbd>−</kbd> ー',shortcutUndo:'<kbd>Esc</kbd> Deshacer la entrada anterior o la selección de candidato',shortcutFocus:'El modo inglés recupera el comportamiento normal de las teclas. Al perder el foco, no se capturan teclas.',
    diagnostics:'Diagnóstico de eventos y reproducción',footer:'Experimento de edición final · Sin control del teclado del sistema · Los candidatos son una demostración simulada, no un IME real · ',emptyOutput:'Empieza con un kana.',
    noticeIme:'El IME del sistema está componiendo texto. Cambia la entrada a inglés antes de usar este prototipo.',noticeMode:'Modo interno: {mode}. Las lecturas y grafías existentes no cambian; el IME del sistema no se controla.',noticePaste:'El área de prueba solo acepta teclas al final; usa Importar reproducción para cargar un registro.',noticeCopySuccess:'Se copió el texto mostrado, incluida la vista previa pendiente.',noticeCopyFailure:'El navegador no permitió copiar. Selecciona el texto mostrado y cópialo manualmente.',noticeConvert:'Se solicitó la conversión; no hay un IME real conectado.',noticeNoFixture:'No hay una entrada simulada para esta lectura. Prueba «か», «かな» o «にほん».',importSuccess:'Se reprodujeron {count} eventos.',importFailure:'Error al importar: ',exportFailure:'Error al exportar: ',logOver:'El registro supera el límite de exportación ({events} eventos o {bytes} B). Puedes seguir probando, copiando y registrando, pero no exportar.',logNear:'El registro se acerca al límite de exportación ({events}/{maxEvents} eventos, {bytes}/{maxBytes} B).',
    mode:{english:'Inglés',hiragana:'Hiragana',katakana:'Katakana'},row:{Numpad0:'fila や',Numpad1:'fila ま',Numpad2:'fila ら',Numpad3:'fila わ・を・ん',Numpad4:'fila な',Numpad5:'fila た',Numpad6:'fila か',Numpad7:'fila さ',Numpad8:'fila あ',Numpad9:'fila は'},segment:{KeyW:'Kana pequeño',KeyE:'っ',KeyR:'Handakuten',KeyT:'Dakuten',KeyA:'え',KeyS:'お',KeyD:'い',KeyF:'あ',KeyG:'う',KeyX:'、',KeyC:'。'},backspace:'Retroceso',convert:'Convertir'
  },
  ko:{
    lang:'ko',numberLocale:'ko-KR',title:'가나 작업장 · 일본어 입력 체험 | むしぞる中尉',navAria:'사이트 탐색',home:'← むしぞる中尉 · 홈',privacy:'Privacy Policy',languageLabel:'언어',languageAria:'언어 선택',
    eyebrow:'NEW JAPANESE INPUT / WEB LAB',pageTitle:'가나 작업장',prototype:'체험 프로토타입 0.2',lead:'오른손으로 행을, 왼손으로 단을 선택합니다. 키를 누를 때마다 결과를 확인할 수 있습니다.',running:'● 브라우저에서 실행',
    webHelp:'숫자 키패드가 있는 실제 키보드를 사용하고 시스템 입력을 영문으로 전환하세요. 화면의 키 배치는 안내용이며 터치 키보드가 아닙니다. 입력과 재생은 이 브라우저에서 처리됩니다.',
    trial:'체험 영역',legendCommitted:'검정: 확정',legendEditing:'파랑: 편집 중',legendPending:'점선: 미확정 あ행 미리보기',captureLabel:'아래를 클릭해 입력 시작 · 이곳에서만 키를 캡처합니다',captureAria:'체험 키 입력',placeholder:'여기를 클릭한 뒤 숫자 키패드 6 → F → D를 눌러 「か → き」를 확인하세요',
    notice:'브라우저 프로토타입에서는 시스템 입력을 영문으로 사용하세요. Caps Lock은 프로토타입 모드를 전환합니다.',editHelp:'Backspace / 숫자 키패드 .: 짝지어진 가나를 삭제합니다. 미확정 행, 잘못된 수식, 후보 상태에서는 한 단계 되돌립니다. Esc / 실행 취소: 이전 동작을 복원합니다.',
    undo:'실행 취소',clear:'지우기',copy:'문자 복사',export:'기록 내보내기',import:'재생 가져오기',candidateLabel:'후보 규칙 체험',candidateBadge:'시뮬레이션 후보 · 실제 IME 아님',candidateHelp:'예시 발음: か / かな / にほん. 숫자 키패드 +로 변환하고 ↑↓로 선택한 뒤 Space 또는 Enter로 확정합니다.',
    statusTitle:'입력 상태',focusBlurred:'포커스 없음',focusFocused:'입력 캡처 중',activeRow:'활성 행',statusPairing:'조합 상태',statusUndo:'실행 취소 기록',statusCandidate:'후보 출처',activeRowHeldSuffix:' (누르는 중)',pendingPrefix:'미확정 ',paired:'조합됨 / 계속 입력 가능',empty:'아직 입력 없음',editable:'수정 가능한 앞 가나',none:'없음',candidateSourceDemo:'시뮬레이션 후보',candidateSourceIme:'실제 IME 연결 안 됨',countText:'{events}개 이벤트 · {bytes} B',
    hintActionsTitle:'누르고 놓는 동작은 서로 다릅니다',hintActions:'행 키를 누른 채 단 키를 누르면 가나를 추가합니다.<br>행 키를 놓은 뒤 단 키를 누르면 앞 문자를 수정합니다.',hintOrderTitle:'시간 허용 없음',hintOrder:'행 키가 먼저 와야 합니다. 단 키가 먼저 오면 수정 키 또는 영문자 규칙으로 처리합니다.',
    leftTitle:'왼손 · 단과 수식',rightTitle:'오른손 · 행',shortcutsTitle:'빠른 안내',shortcutMode:'<kbd>Caps Lock</kbd> 영문 → 히라가나 → 가타카나',shortcutKeys:'<kbd>.</kbd> 삭제　<kbd>+</kbd> 변환　<kbd>−</kbd> ー',shortcutUndo:'<kbd>Esc</kbd> 이전 입력 또는 후보 선택 취소',shortcutFocus:'영문 모드에서는 일반 키 동작으로 돌아갑니다. 포커스를 잃으면 키를 캡처하지 않습니다.',
    diagnostics:'이벤트 진단 및 재생',footer:'끝부분 편집 실험 · 시스템 전체 키보드를 가로채지 않음 · 후보는 시뮬레이션이며 실제 IME에 연결되지 않음 · ',emptyOutput:'가나부터 입력해 보세요.',
    noticeIme:'시스템 IME가 문자를 조합 중입니다. 이 프로토타입을 사용하기 전에 시스템 입력을 영문으로 바꾸세요.',noticeMode:'내부 모드: {mode}. 기존 발음과 글자 모양은 유지되며 시스템 IME는 제어하지 않습니다.',noticePaste:'체험 영역은 끝부분 키 입력만 받습니다. 이벤트 기록은 재생 가져오기로 불러오세요.',noticeCopySuccess:'미확정 미리보기를 포함한 현재 표시 문자를 복사했습니다.',noticeCopyFailure:'브라우저가 복사를 허용하지 않았습니다. 표시 문자를 선택해 직접 복사하세요.',noticeConvert:'변환을 요청했지만 실제 IME는 연결되지 않았습니다.',noticeNoFixture:'이 발음에는 시뮬레이션 항목이 없습니다. 「か」, 「かな」, 「にほん」을 사용해 보세요.',importSuccess:'{count}개 이벤트를 재생했습니다.',importFailure:'가져오기 실패: ',exportFailure:'내보내기 실패: ',logOver:'기록이 내보내기 한도를 초과했습니다({events}개 이벤트 또는 {bytes} B). 계속 체험하고 복사하고 기록할 수 있지만 내보낼 수는 없습니다.',logNear:'기록이 내보내기 한도에 가까워졌습니다({events}/{maxEvents}개 이벤트, {bytes}/{maxBytes} B).',
    mode:{english:'영문',hiragana:'히라가나',katakana:'가타카나'},row:{Numpad0:'や행',Numpad1:'ま행',Numpad2:'ら행',Numpad3:'わ・を・ん행',Numpad4:'な행',Numpad5:'た행',Numpad6:'か행',Numpad7:'さ행',Numpad8:'あ행',Numpad9:'は행'},segment:{KeyW:'작은 가나',KeyE:'っ',KeyR:'반탁점',KeyT:'탁점',KeyA:'え',KeyS:'お',KeyD:'い',KeyF:'あ',KeyG:'う',KeyX:'、',KeyC:'。'},backspace:'삭제',convert:'변환'
  }
};

let localeKey=localStorage.getItem('kana-locale');
if(!locales[localeKey]) localeKey='zh-Hans';
let L=locales[localeKey];
let state=initialState(),events=[],records=[],logSize=createLogSizeTracker();
const fixture={'か':['蚊','科','課'],'かな':['仮名','かな'],'にほん':['日本','二本']};

function format(text,values){return Object.entries(values).reduce((result,[key,value])=>result.replaceAll('{'+key+'}',String(value)),text);}
function setText(id,text){const el=$(id);if(el)el.textContent=text;}
function setHtml(id,html){const el=$(id);if(el)el.innerHTML=html;}
function key(parent,code,label,sub){const el=document.createElement('div');el.className='key'+(!code?' spacer':'');el.dataset.code=code;const a=document.createElement('strong'),b=document.createElement('small');a.textContent=label;b.textContent=sub;el.append(a,b);$(parent).append(el);}
function renderKeyboards(){
  $('left-keys').replaceChildren();
  [['KeyW','W'],['KeyE','E'],['KeyR','R'],['KeyT','T'],['',''],['KeyA','A'],['KeyS','S'],['KeyD','D'],['KeyF','F'],['KeyG','G'],['KeyX','X'],['KeyC','C']].forEach(([code,label])=>key('left-keys',code,label,L.segment[code]||''));
  $('num-keys').replaceChildren();
  [7,8,9,4,5,6,1,2,3,0].forEach(n=>key('num-keys','Numpad'+n,String(n),L.row['Numpad'+n]));
  key('num-keys','NumpadDecimal','.',L.backspace);
  key('num-keys','NumpadAdd','+',L.convert);
}
function span(text,cls){const el=document.createElement('span');el.textContent=text;el.className=cls;return el;}
function render(){
  $('mode').textContent=L.mode[state.mode];$('output').dataset.empty=L.emptyOutput;$('output').replaceChildren(span(state.committed,'committed'));
  if(state.candidate) $('output').append(span(state.candidate.items[state.candidate.index],'editing'));
  else for(const u of state.units){const t=unitText(u);$('output').append(span(u.suffix?t.slice(0,-u.suffix.length):t,'editing'));if(u.suffix)$('output').append(span(u.suffix,'suffix'));}
  if(state.pending)$('output').append(span(preview(state),'pending'));
  $('status').replaceChildren();
  const u=state.units.at(-1),active=state.activeRow?L.row[state.activeRow]+L.activeRowHeldSuffix:L.none,pairing=state.pending?L.pendingPrefix+L.row[state.pending.row]:state.units.length?L.paired:L.empty,editable=!state.candidate&&u?.kind==='kana'?unitText(u):L.none,source=state.candidate?L.candidateSourceDemo:L.candidateSourceIme;
  for(const [name,value] of [[L.activeRow,active],[L.statusPairing||'配对状态',pairing],[L.editable,editable],[L.statusUndo||'撤销记录',String(state.history.length)],[L.statusCandidate||'候选来源',source]]){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=name;dd.textContent=value;$('status').append(dt,dd);}
  document.querySelectorAll('.key').forEach(el=>el.classList.toggle('held',state.held.includes(el.dataset.code)));
  $('candidates').replaceChildren();state.candidate?.items.forEach((t,i)=>$('candidates').append(span((i+1)+' '+t,'candidate'+(i===state.candidate.index?' selected':''))));
  $('count').textContent=format(L.countText||'{events} 个事件 · {bytes} B',{events:events.length.toLocaleString(L.numberLocale),bytes:logSize.bytes.toLocaleString(L.numberLocale)});
  const eventNearLimit=events.length>=MAX_LOG_EVENTS*.9,byteNearLimit=logSize.bytes>=MAX_LOG_BYTES*.9;
  $('log-warning').textContent=events.length>MAX_LOG_EVENTS||logSize.bytes>MAX_LOG_BYTES?format(L.logOver,{events:events.length.toLocaleString(L.numberLocale),bytes:logSize.bytes.toLocaleString(L.numberLocale)}):eventNearLimit||byteNearLimit?format(L.logNear,{events:events.length.toLocaleString(L.numberLocale),maxEvents:MAX_LOG_EVENTS.toLocaleString(L.numberLocale),bytes:logSize.bytes.toLocaleString(L.numberLocale),maxBytes:MAX_LOG_BYTES.toLocaleString(L.numberLocale)}):'';
  $('log').textContent=records.slice(-150).map(x=>x.sequence+' '+x.event.type+' '+(x.event.code||'')+(x.event.repeat?' [repeat]':'')+'  '+JSON.stringify(x.before)+' → '+JSON.stringify(x.after)+(x.effects.length?'  '+x.effects.map(e=>e.type).join(', '):'')).join('\n');
}
function applyLocale(next){
  if(!locales[next])return;
  localeKey=next;L=locales[next];localStorage.setItem('kana-locale',next);document.documentElement.lang=L.lang;document.title=L.title;
  $('top-nav').setAttribute('aria-label',L.navAria);$('language-select').setAttribute('aria-label',L.languageAria);$('language-select').value=next;
  setText('site-home',L.home);setText('top-privacy',L.privacy);setText('language-label',L.languageLabel);setText('page-eyebrow',L.eyebrow);setHtml('page-title',L.pageTitle+'<span id="prototype-version">'+L.prototype+'</span>');setText('page-lead',L.lead);setText('local-status',L.running);setText('web-help',L.webHelp);
  setText('trial-title',L.trial);setText('legend-committed',L.legendCommitted);setText('legend-editing',L.legendEditing);setText('legend-pending',L.legendPending);setText('capture-label',L.captureLabel);$('capture').setAttribute('aria-label',L.captureAria);$('capture').placeholder=L.placeholder;setText('notice',L.notice);setText('edit-help',L.editHelp);
  setText('undo',L.undo);setText('clear',L.clear);setText('copy',L.copy);setText('export',L.export);setText('import',L.import);setText('candidate-label',L.candidateLabel);setText('candidate-badge',L.candidateBadge);setText('candidate-help',L.candidateHelp);
  setText('status-title',L.statusTitle);setText('focus',state.held.length?L.focusFocused:L.focusBlurred);setText('hint-actions-title',L.hintActionsTitle);setHtml('hint-actions',L.hintActions);setText('hint-order-title',L.hintOrderTitle);setHtml('hint-order',L.hintOrder);
  setText('left-title',L.leftTitle);setText('right-title',L.rightTitle);setText('shortcuts-title',L.shortcutsTitle);setHtml('shortcut-mode',L.shortcutMode);setHtml('shortcut-keys',L.shortcutKeys);setHtml('shortcut-undo',L.shortcutUndo);setText('shortcut-focus',L.shortcutFocus);setText('diagnostics-title',L.diagnostics);setText('footer-text',L.footer);setText('footer-privacy',L.privacy);
  renderKeyboards();render();
}
function dispatch(event,resolve=true,paint=true){
  const before=displayText(state),result=transition(state,event);state=result.state;events.push(event);logSize.add(event);records.push({sequence:state.sequence,event,before,after:displayText(state),effects:result.effects});
  for(const effect of result.effects)if(effect.type==='convert'&&resolve){if($('demo').checked&&fixture[effect.reading])dispatch({type:'candidates',reading:effect.reading,items:fixture[effect.reading]},false);else $('notice').textContent=$('demo').checked?L.noticeNoFixture:L.noticeConvert;}
  if(paint)render();return result;
}
function normalized(e,type){return {type,code:e.code,key:e.key,repeat:e.repeat,ctrlKey:e.ctrlKey,altKey:e.altKey,metaKey:e.metaKey,shiftKey:e.shiftKey};}
$('language-select').addEventListener('change',e=>applyLocale(e.target.value));
$('capture').addEventListener('keydown',e=>{if(e.isComposing||e.keyCode===229){$('notice').textContent=L.noticeIme;return;}const priorMode=state.mode,r=dispatch(normalized(e,'keydown'));if(!r.effects.some(x=>x.type==='passthrough'))e.preventDefault();if(priorMode!==state.mode)$('notice').textContent=format(L.noticeMode,{mode:L.mode[state.mode]});});
$('capture').addEventListener('keyup',e=>dispatch(normalized(e,'keyup')));
$('capture').addEventListener('beforeinput',e=>{if(e.isComposing)return;e.preventDefault();if(state.mode==='english'&&e.inputType==='insertText'&&e.data)dispatch({type:'text',text:e.data});$('capture').value='';});
$('capture').addEventListener('input',()=>$('capture').value='');
$('capture').addEventListener('paste',e=>{e.preventDefault();$('notice').textContent=L.noticePaste;});
$('capture').addEventListener('focus',()=>{$('focus').textContent=L.focusFocused;});
$('capture').addEventListener('blur',()=>{$('focus').textContent=L.focusBlurred;dispatch({type:'blur'});});
$('undo').onclick=()=>{dispatch({type:'undo'});$('capture').focus();};
$('clear').onclick=()=>{state=initialState();events=[];records=[];logSize=createLogSizeTracker();render();$('capture').focus();};
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(displayText(state));$('notice').textContent=L.noticeCopySuccess;}catch{$('notice').textContent=L.noticeCopyFailure;}};
$('export').onclick=()=>{if(document.activeElement===$('capture'))$('capture').blur();try{const text=serializeLog(events),blob=new Blob([text],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='kana-session.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){$('notice').textContent=L.exportFailure+e.message;}};
$('import').onclick=()=>$('file').click();
$('file').onchange=async()=>{const controls=[...document.querySelectorAll('button,input,textarea')],backup={state,events,records};try{const file=$('file').files[0];if(!file)return;if(file.size>MAX_LOG_BYTES)throw new Error(format(L.logOver,{events:'>',bytes:MAX_LOG_BYTES.toLocaleString(L.numberLocale)}));controls.forEach(el=>el.disabled=true);const data=parseLog(await file.text());state=initialState();events=[];records=[];logSize=createLogSizeTracker();for(let i=0;i<data.length;i++){dispatch(data[i],false,false);if(i%100===0)await new Promise(r=>setTimeout(r,0));}render();$('notice').textContent=format(L.importSuccess,{count:data.length.toLocaleString(L.numberLocale)});}catch(e){({state,events,records}=backup);logSize=createLogSizeTracker();for(const event of events)logSize.add(event);render();$('notice').textContent=L.importFailure+e.message;}finally{controls.forEach(el=>el.disabled=false);$('file').value='';}};

applyLocale(localeKey);

/**
 * 意图→操作映射配置
 * 定义每个意图对应的 taskId、actionId 和预填参数
 * 支持中英文双语
 */

// ========== 中英文意图映射 ==========
export const INTENT_MAP = {
  // 脱敏
  '脱敏': {
    en: 'mask',
    taskId: 'mask',
    actions: ['mask-id', 'mask-phone', 'mask-email', 'mask-name', 'custom-mask'],
    defaultAction: 'mask-id'
  },
  'mask': {
    zh: '脱敏',
    taskId: 'mask',
    actions: ['mask-id', 'mask-phone', 'mask-email', 'mask-name', 'custom-mask'],
    defaultAction: 'mask-id'
  },
  // 去重
  '去重': {
    en: 'dedup',
    taskId: 'dedup',
    actions: ['dedup-exact', 'dedup-key'],
    defaultAction: 'dedup-exact'
  },
  'dedup': {
    zh: '去重',
    taskId: 'dedup',
    actions: ['dedup-exact', 'dedup-key'],
    defaultAction: 'dedup-exact'
  },
  // 合并
  '合并': {
    en: 'merge',
    taskId: 'merge',
    actions: ['merge-append', 'merge-horizontal'],
    defaultAction: 'merge-append'
  },
  'merge': {
    zh: '合并',
    taskId: 'merge',
    actions: ['merge-append', 'merge-horizontal'],
    defaultAction: 'merge-append'
  },
  // 分割
  '分割': {
    en: 'split',
    taskId: 'split',
    actions: ['split-delimiter', 'split-width', 'wage-slip-split'],
    defaultAction: 'split-delimiter'
  },
  'split': {
    zh: '分割',
    taskId: 'split',
    actions: ['split-delimiter', 'split-width', 'wage-slip-split'],
    defaultAction: 'split-delimiter'
  },
  // 清洗
  '清洗': {
    en: 'clean',
    taskId: 'clean',
    actions: ['remove-empty-rows', 'remove-empty-cols', 'trim-whitespace', 'remove-all-spaces', 'remove-special-chars', 'normalize-dates', 'round-numbers', 'convert-width'],
    defaultAction: 'trim-whitespace'
  },
  'clean': {
    zh: '清洗',
    taskId: 'clean',
    actions: ['remove-empty-rows', 'remove-empty-cols', 'trim-whitespace', 'remove-all-spaces', 'remove-special-chars', 'normalize-dates', 'round-numbers', 'convert-width'],
    defaultAction: 'trim-whitespace'
  },
  // 排序
  '排序': {
    en: 'sort',
    taskId: 'sort',
    actions: ['sort-asc', 'sort-desc', 'shuffle'],
    defaultAction: 'sort-asc'
  },
  'sort': {
    zh: '排序',
    taskId: 'sort',
    actions: ['sort-asc', 'sort-desc', 'shuffle'],
    defaultAction: 'sort-asc'
  },
  // 格式转换
  '格式转换': {
    en: 'convert',
    taskId: 'convert',
    actions: ['to-json', 'to-csv', 'to-sql-insert', 'to-sql-inquery', 'transpose', 'to-upper', 'to-lower', 'capitalize'],
    defaultAction: 'to-json'
  },
  'convert': {
    zh: '格式转换',
    taskId: 'convert',
    actions: ['to-json', 'to-csv', 'to-sql-insert', 'to-sql-inquery', 'transpose', 'to-upper', 'to-lower', 'capitalize'],
    defaultAction: 'to-json'
  },
  // 计算
  '计算': {
    en: 'calc',
    taskId: 'calc',
    actions: ['calculate-sum', 'calculate-avg', 'calculate-count', 'calculate-max', 'calculate-min', 'batch-math', 'group-summary'],
    defaultAction: 'calculate-sum'
  },
  'calc': {
    zh: '计算',
    taskId: 'calc',
    actions: ['calculate-sum', 'calculate-avg', 'calculate-count', 'calculate-max', 'calculate-min', 'batch-math', 'group-summary'],
    defaultAction: 'calculate-sum'
  },
  // 提取
  '提取': {
    en: 'extract',
    taskId: 'extract',
    actions: ['column-to-string', 'extract-regex', 'replace-text', 'letter-mapping'],
    defaultAction: 'column-to-string'
  },
  'extract': {
    zh: '提取',
    taskId: 'extract',
    actions: ['column-to-string', 'extract-regex', 'replace-text', 'letter-mapping'],
    defaultAction: 'column-to-string'
  },
  // 查找匹配
  '查找匹配': {
    en: 'lookup',
    taskId: 'lookup',
    actions: ['lookup-match'],
    defaultAction: 'lookup-match'
  },
  'lookup': {
    zh: '查找匹配',
    taskId: 'lookup',
    actions: ['lookup-match'],
    defaultAction: 'lookup-match'
  }
}

// 意图类别候选列表（用于ML分类器）- 中英文双语
export const INTENT_CANDIDATES = [
  '脱敏', 'mask',
  '去重', 'dedup',
  '合并', 'merge',
  '分割', 'split',
  '清洗', 'clean',
  '排序', 'sort',
  '格式转换', 'convert',
  '计算', 'calc',
  '提取', 'extract',
  '查找匹配', 'lookup'
]

// 意图别名映射（用于规范用户输入到标准意图）
export const INTENT_ALIASES = {
  // ========== 脱敏别名 ==========
  '隐藏': '脱敏', '脱敏': '脱敏', 'mask': 'mask', 'masking': 'mask', 'hide': 'mask', 'redact': 'mask',
  'redact': 'mask', 'anonymize': 'mask', '加密': '脱敏', '打码': '脱敏',
  // ========== 去重别名 ==========
  '去重': '去重', '重复': '去重', 'dedup': 'dedup', 'duplicate': 'dedup', 'remove duplicate': 'dedup',
  'remove duplicates': 'dedup', '删重': '去重', '除重': '去重', 'unique': '去重',
  // ========== 合并别名 ==========
  '合并': '合并', 'merge': 'merge', 'combine': 'merge', 'append': 'merge',
  '拼接': '合并', '连结': '合并', '连接': '合并', 'union': 'merge',
  // ========== 分割别名 ==========
  '分割': '分割', 'split': 'split', 'divide': 'split', 'separate': 'split',
  '拆分': '分割', '分拆': '分割', '截取': '分割',
  // ========== 清洗别名 ==========
  '清洗': '清洗', 'clean': 'clean', 'cleanup': 'clean', 'remove empty': 'clean',
  '清理': '清洗', '净化': '清洗', 'trim': '清洗', 'strip': '清洗',
  // ========== 排序别名 ==========
  '排序': '排序', 'sort': 'sort', 'order': 'sort', 'arrange': 'sort',
  '排列': '排序', '整理': '排序', 'ordering': 'sort',
  // ========== 格式转换别名 ==========
  '格式转换': '格式转换', 'convert': 'convert', 'transform': 'convert', 'export': 'convert',
  '转换': '格式转换', '转型': '格式转换', 'export': 'convert', '导出': '格式转换',
  // ========== 计算别名 ==========
  '计算': '计算', 'calc': 'calc', 'calculate': 'calc', 'sum': 'calc', 'compute': 'calc',
  '统计': '计算', '运算': '计算', 'math': '计算', '汇总': '计算',
  // ========== 提取别名 ==========
  '提取': '提取', 'extract': 'extract', 'get': 'extract',
  '获取': '提取', '抽出': '提取', '拉力': '提取',
  // ========== 查找匹配别名 ==========
  '查找匹配': '查找匹配', 'lookup': 'lookup', 'match': 'lookup', 'vlookup': 'lookup', 'find': 'lookup', 'search': 'lookup',
  '匹配': '查找匹配', '查找': '查找匹配', '索引': '查找匹配', '查询': '查找匹配',
}

// 意图→操作映射（兼容）
export const INTENT_OPERATION_MAP = {
  '脱敏': INTENT_MAP['脱敏'],
  'mask': INTENT_MAP['mask'],
  '去重': INTENT_MAP['去重'],
  'dedup': INTENT_MAP['dedup'],
  '合并': INTENT_MAP['合并'],
  'merge': INTENT_MAP['merge'],
  '分割': INTENT_MAP['分割'],
  'split': INTENT_MAP['split'],
  '清洗': INTENT_MAP['清洗'],
  'clean': INTENT_MAP['clean'],
  '排序': INTENT_MAP['排序'],
  'sort': INTENT_MAP['sort'],
  '格式转换': INTENT_MAP['格式转换'],
  'convert': INTENT_MAP['convert'],
  '计算': INTENT_MAP['计算'],
  'calc': INTENT_MAP['calc'],
  '提取': INTENT_MAP['提取'],
  'extract': INTENT_MAP['extract'],
  '查找匹配': INTENT_MAP['查找匹配'],
  'lookup': INTENT_MAP['lookup']
}

// 规则快速匹配配置 - 中英文双语
// 单patterns数组表示"与"关系（所有pattern都匹配才算匹配）
// 规则顺序：先具体后通用，避免重复匹配
export const QUICK_RULES = [
  // ========== 脱敏规则 ==========
  { patterns: [/身份证/], intent: '脱敏', enIntent: 'mask', params: { actionId: 'mask-id', maskType: 'full' } },
  { patterns: [/id.*card|idcard/i], intent: '脱敏', enIntent: 'mask', params: { actionId: 'mask-id', maskType: 'full' } },
  { patterns: [/phone|telephone|手机|电话/i], intent: '脱敏', enIntent: 'mask', params: { actionId: 'mask-phone', maskType: 'full' } },
  { patterns: [/email|e-mail|邮箱|邮件/i], intent: '脱敏', enIntent: 'mask', params: { actionId: 'mask-email', maskType: 'full' } },
  { patterns: [/name|姓名|名字/i], intent: '脱敏', enIntent: 'mask', params: { actionId: 'mask-name', maskType: 'full' } },
  // 纯脱敏关键词（无具体类型）→ 默认 mask-id
  { patterns: [/脱敏|mask|隐藏|hide|redact/i], intent: '脱敏', enIntent: 'mask', params: { actionId: 'mask-id', maskType: 'full' } },
  // 自定义脱敏
  { patterns: [/自定义脱敏|custom.*mask/i], intent: '脱敏', enIntent: 'mask', params: { actionId: 'custom-mask' } },

  // ========== 去重规则 ==========
  { patterns: [/去重|重复|dedup|duplicat/i], intent: '去重', enIntent: 'dedup', params: { actionId: 'dedup-exact' } },
  { patterns: [/按列去重|按字段去重|key.*dedup/i], intent: '去重', enIntent: 'dedup', params: { actionId: 'dedup-key' } },

  // ========== 排序规则 ==========
  { patterns: [/(?=.*(?:排序|sort))(?=.*(?:倒序|降序|desc|从大|递减))/i], intent: '排序', enIntent: 'sort', params: { actionId: 'sort-desc', order: 'desc' } },
  { patterns: [/排序|sort|升序|asc|正序|递增|从小[到大]/i], intent: '排序', enIntent: 'sort', params: { actionId: 'sort-asc', order: 'asc' } },
  { patterns: [/随机排序|shuffle|打乱/i], intent: '排序', enIntent: 'sort', params: { actionId: 'shuffle' } },

  // ========== 合并规则 ==========
  { patterns: [/合并|merge|combine|追加/i], intent: '合并', enIntent: 'merge', params: { actionId: 'merge-append' } },
  { patterns: [/水平合并|横向合并|horizontal.*merge/i], intent: '合并', enIntent: 'merge', params: { actionId: 'merge-horizontal' } },

  // ========== 分割规则 ==========
  { patterns: [/分割|split|拆[分]?/i], intent: '分割', enIntent: 'split', params: { actionId: 'split-delimiter' } },
  { patterns: [/按宽度分割|split.*width|宽度分割/i], intent: '分割', enIntent: 'split', params: { actionId: 'split-width' } },

  // ========== 格式转换规则 ==========
  { patterns: [/json/i], intent: '格式转换', enIntent: 'convert', params: { actionId: 'to-json' } },
  { patterns: [/csv/i], intent: '格式转换', enIntent: 'convert', params: { actionId: 'to-csv' } },
  { patterns: [/sql.*insert|insert.*sql/i], intent: '格式转换', enIntent: 'convert', params: { actionId: 'to-sql-insert' } },
  { patterns: [/sql.*in|in.*sql|sql.*query/i], intent: '格式转换', enIntent: 'convert', params: { actionId: 'to-sql-inquery' } },
  { patterns: [/转置|transpose|行列转换/i], intent: '格式转换', enIntent: 'convert', params: { actionId: 'transpose' } },

  // ========== 大小写转换规则 ==========
  // 更具体的规则放前面，避免被通用规则覆盖
  { patterns: [/首字母大写|capitalize|title.?case/i], intent: '格式转换', enIntent: 'convert', params: { actionId: 'capitalize' } },
  { patterns: [/转大写|to.?upper|uppercase|全大写/i], intent: '格式转换', enIntent: 'convert', params: { actionId: 'to-upper' } },
  { patterns: [/转小写|to.?lower|lowercase|全小写/i], intent: '格式转换', enIntent: 'convert', params: { actionId: 'to-lower' } },

  // ========== 计算规则 ==========
  // 更具体的计算规则放前面，避免被通用规则覆盖
  { patterns: [/分组汇总|group.*summary|分组统计/i], intent: '计算', enIntent: 'calc', params: { actionId: 'group-summary' } },
  { patterns: [/批量运算|batch.*math|批量计算/i], intent: '计算', enIntent: 'calc', params: { actionId: 'batch-math' } },
  { patterns: [/平均值|avg|平均/i], intent: '计算', enIntent: 'calc', params: { actionId: 'calculate-avg' } },
  { patterns: [/最大值|max|最大/i], intent: '计算', enIntent: 'calc', params: { actionId: 'calculate-max' } },
  { patterns: [/最小值|min|最小/i], intent: '计算', enIntent: 'calc', params: { actionId: 'calculate-min' } },
  { patterns: [/计数|count|共.*条|总.*数/i], intent: '计算', enIntent: 'calc', params: { actionId: 'calculate-count' } },
  // 求和放最后，因为"计算"太通用
  { patterns: [/求和|sum|计算|总计|合计/i], intent: '计算', enIntent: 'calc', params: { actionId: 'calculate-sum' } },

  // ========== 清洗规则 ==========
  // 更具体的清洗规则放前面，避免被通用规则覆盖
  { patterns: [/删除空行|remove.*empty.*row/i], intent: '清洗', enIntent: 'clean', params: { actionId: 'remove-empty-rows' } },
  { patterns: [/删除空列|remove.*empty.*col/i], intent: '清洗', enIntent: 'clean', params: { actionId: 'remove-empty-cols' } },
  { patterns: [/去所有空格|remove.*all.*space/i], intent: '清洗', enIntent: 'clean', params: { actionId: 'remove-all-spaces' } },
  { patterns: [/删除特殊字符|remove.*special.*char/i], intent: '清洗', enIntent: 'clean', params: { actionId: 'remove-special-chars' } },
  { patterns: [/日期标准化|normalize.*date|日期整理/i], intent: '清洗', enIntent: 'clean', params: { actionId: 'normalize-dates' } },
  { patterns: [/数字修约|round.*number|四舍五入/i], intent: '清洗', enIntent: 'clean', params: { actionId: 'round-numbers' } },
  { patterns: [/全角转半角|to.*half.*width|半角/i], intent: '清洗', enIntent: 'clean', params: { actionId: 'convert-width' } },
  { patterns: [/半角转全角|to.*full.*width|全角/i], intent: '清洗', enIntent: 'clean', params: { actionId: 'convert-width', type: 'toFullWidth' } },
  // 通用清洗放最后
  { patterns: [/清洗|clean|trim|去空格/i], intent: '清洗', enIntent: 'clean', params: { actionId: 'trim-whitespace' } },

  // ========== 提取规则 ==========
  // 更具体的提取规则放前面
  { patterns: [/正则提取|regex.*extract/i], intent: '提取', enIntent: 'extract', params: { actionId: 'extract-regex' } },
  { patterns: [/文本替换|replace.*text|替换/i], intent: '提取', enIntent: 'extract', params: { actionId: 'replace-text' } },
  { patterns: [/字母映射|letter.*mapping|映射替换/i], intent: '提取', enIntent: 'extract', params: { actionId: 'letter-mapping' } },
  { patterns: [/提取.*列|column.*to.*string|列转字符串/i], intent: '提取', enIntent: 'extract', params: { actionId: 'column-to-string' } },

  // ========== 查找匹配规则 ==========
  // 更具体的匹配规则放前面，避免被通用规则覆盖
  // 注意：需要使用单词边界 \b 避免误匹配其他单词（如 search match 中的 match）
  { patterns: [/查找匹配|匹配查找|vlookup/i], intent: '查找匹配', enIntent: 'lookup', params: { actionId: 'lookup-match' } },
  { patterns: [/^查找$|^匹配$/], intent: '查找匹配', enIntent: 'lookup', params: { actionId: 'lookup-match' } },
  { patterns: [/\bvlookup\b/i], intent: '查找匹配', enIntent: 'lookup', params: { actionId: 'lookup-match' } },
  { patterns: [/\blookup\b/i], intent: '查找匹配', enIntent: 'lookup', params: { actionId: 'lookup-match' } },
  { patterns: [/\bmatch\b/i], intent: '查找匹配', enIntent: 'lookup', params: { actionId: 'lookup-match' } },
  { patterns: [/\bsearch\b/i], intent: '查找匹配', enIntent: 'lookup', params: { actionId: 'lookup-match' } },

  // ========== 特殊场景规则 ==========
  { patterns: [/工资条|split.*wage|wage.*slip/i], intent: '分割', enIntent: 'split', params: { actionId: 'wage-slip-split' } },
]

// ========== 扩展规则（低频/模糊场景） ==========
// 这些规则用于更模糊或更具体的场景，作为 QUICK_RULES 的补充
// 匹配优先级低于 QUICK_RULES，只有在 QUICK_RULES 未命中时尝试匹配
export const EXTENDED_RULES = [
  // 脱敏扩展 - 各种敏感信息类型
  { patterns: [/银行卡|bank.*card|卡号/i], intent: '脱敏', enIntent: 'mask', params: { actionId: 'custom-mask', maskType: 'bankCard' } },
  { patterns: [/地址|address/i], intent: '脱敏', enIntent: 'mask', params: { actionId: 'custom-mask', maskType: 'partial' } },
  { patterns: [/密码|password|passwd/i], intent: '脱敏', enIntent: 'mask', params: { actionId: 'custom-mask', maskType: 'full' } },

  // 去重扩展
  { patterns: [/保留第一条|keep.*first/i], intent: '去重', enIntent: 'dedup', params: { actionId: 'dedup-exact', keepStrategy: 'first' } },
  { patterns: [/保留最后一条|keep.*last/i], intent: '去重', enIntent: 'dedup', params: { actionId: 'dedup-exact', keepStrategy: 'last' } },

  // 排序扩展
  { patterns: [/随机|random/i], intent: '排序', enIntent: 'sort', params: { actionId: 'shuffle' } },

  // 合并扩展
  { patterns: [/追加|append/i], intent: '合并', enIntent: 'merge', params: { actionId: 'merge-append' } },
  { patterns: [/横向|horizontal/i], intent: '合并', enIntent: 'merge', params: { actionId: 'merge-horizontal' } },

  // 格式转换扩展
  { patterns: [/转json|tojson|导出json/i], intent: '格式转换', enIntent: 'convert', params: { actionId: 'to-json' } },
  { patterns: [/转csv|tocsv|导出csv/i], intent: '格式转换', enIntent: 'convert', params: { actionId: 'to-csv' } },
  { patterns: [/sql.*insert/i], intent: '格式转换', enIntent: 'convert', params: { actionId: 'to-sql-insert' } },
  { patterns: [/sql.*in|in.*sql/i], intent: '格式转换', enIntent: 'convert', params: { actionId: 'to-sql-inquery' } },

  // 大小写转换扩展
  { patterns: [/首字母大写|标题式/i], intent: '格式转换', enIntent: 'convert', params: { actionId: 'capitalize' } },
  { patterns: [/全大写|全部大写/i], intent: '格式转换', enIntent: 'convert', params: { actionId: 'to-upper' } },
  { patterns: [/全小写|全部小写/i], intent: '格式转换', enIntent: 'convert', params: { actionId: 'to-lower' } },

  // 计算扩展
  // 更具体的计算放前面
  { patterns: [/分组汇总|group.*summary|分组统计/i], intent: '计算', enIntent: 'calc', params: { actionId: 'group-summary' } },
  { patterns: [/批量运算|batch.*math|批量计算/i], intent: '计算', enIntent: 'calc', params: { actionId: 'batch-math' } },
  { patterns: [/平均值|avg|平均|均值|mean/i], intent: '计算', enIntent: 'calc', params: { actionId: 'calculate-avg' } },
  { patterns: [/最大值|max|最大|最高|peak/i], intent: '计算', enIntent: 'calc', params: { actionId: 'calculate-max' } },
  { patterns: [/最小值|min|最小|最低|lowest/i], intent: '计算', enIntent: 'calc', params: { actionId: 'calculate-min' } },
  { patterns: [/计数|count|共.*条|总.*数|记录数|records/i], intent: '计算', enIntent: 'calc', params: { actionId: 'calculate-count' } },
  // 求和放最后，因为"计算"太通用
  { patterns: [/求和|sum|总计|合计|总和|total/i], intent: '计算', enIntent: 'calc', params: { actionId: 'calculate-sum' } },

  // 清洗扩展
  { patterns: [/去掉空格|strip|去空格/i], intent: '清洗', enIntent: 'clean', params: { actionId: 'trim-whitespace' } },
  { patterns: [/删除空行|remove.*blank.*row/i], intent: '清洗', enIntent: 'clean', params: { actionId: 'remove-empty-rows' } },
  { patterns: [/删除空列|remove.*blank.*col/i], intent: '清洗', enIntent: 'clean', params: { actionId: 'remove-empty-cols' } },
  { patterns: [/去掉所有空格|remove.*space/i], intent: '清洗', enIntent: 'clean', params: { actionId: 'remove-all-spaces' } },
  { patterns: [/清理特殊字符|special.*char/i], intent: '清洗', enIntent: 'clean', params: { actionId: 'remove-special-chars' } },
  { patterns: [/标准化日期|date.*normalize/i], intent: '清洗', enIntent: 'clean', params: { actionId: 'normalize-dates' } },
  { patterns: [/四舍五入|round/i], intent: '清洗', enIntent: 'clean', params: { actionId: 'round-numbers' } },
  { patterns: [/半角|half.*width/i], intent: '清洗', enIntent: 'clean', params: { actionId: 'convert-width', type: 'toHalfWidth' } },
  { patterns: [/全角|full.*width/i], intent: '清洗', enIntent: 'clean', params: { actionId: 'convert-width', type: 'toFullWidth' } },

  // 提取扩展
  { patterns: [/正则|regex/i], intent: '提取', enIntent: 'extract', params: { actionId: 'extract-regex' } },
  { patterns: [/字符串|to.*string|stringify/i], intent: '提取', enIntent: 'extract', params: { actionId: 'column-to-string' } },
  { patterns: [/替换|replace/i], intent: '提取', enIntent: 'extract', params: { actionId: 'replace-text' } },
  { patterns: [/映射|mapping/i], intent: '提取', enIntent: 'extract', params: { actionId: 'letter-mapping' } },

  // 查找匹配扩展
  { patterns: [/模糊匹配/i], intent: '查找匹配', enIntent: 'lookup', params: { actionId: 'lookup-match', fuzzyMatch: true } },
  { patterns: [/精确匹配/i], intent: '查找匹配', enIntent: 'lookup', params: { actionId: 'lookup-match', fuzzyMatch: false } },
  { patterns: [/\bfuzzy\b.*\bmatch\b/i], intent: '查找匹配', enIntent: 'lookup', params: { actionId: 'lookup-match', fuzzyMatch: true } },
  { patterns: [/\bexact\b.*\bmatch\b/i], intent: '查找匹配', enIntent: 'lookup', params: { actionId: 'lookup-match', fuzzyMatch: false } },

  // 分组汇总扩展
  { patterns: [/按.*分组|group.*by/i], intent: '计算', enIntent: 'calc', params: { actionId: 'group-summary' } },
  { patterns: [/分类汇总|category.*sum/i], intent: '计算', enIntent: 'calc', params: { actionId: 'group-summary' } },

  // 批量运算扩展
  { patterns: [/加法|add/i], intent: '计算', enIntent: 'calc', params: { actionId: 'batch-math', operator: '+' } },
  { patterns: [/减法|subtract/i], intent: '计算', enIntent: 'calc', params: { actionId: 'batch-math', operator: '-' } },
  { patterns: [/乘法|multiply/i], intent: '计算', enIntent: 'calc', params: { actionId: 'batch-math', operator: '*' } },
  { patterns: [/除法|divide/i], intent: '计算', enIntent: 'calc', params: { actionId: 'batch-math', operator: '/' } },
]

// 意图执行顺序（用于多意图管道排序）
export const INTENT_ORDER = {
  '合并': 0, 'merge': 0,
  '查找匹配': 0, 'lookup': 0,
  '清洗': 1, 'clean': 1,
  '去重': 2, 'dedup': 2,
  '分割': 3, 'split': 3,
  '脱敏': 4, 'mask': 4,
  '排序': 5, 'sort': 5,
  '计算': 6, 'calc': 6,
  '格式转换': 7, 'convert': 7,
  '提取': 7, 'extract': 7
}

// 操作ID→预填参数映射
export const ACTION_PREFILL_MAP = {
  'mask-id': { maskType: 'partial' },
  'mask-phone': { maskType: 'partial' },
  'mask-email': { maskType: 'partial' },
  'mask-name': { maskType: 'partial' },
  'dedup-exact': { keepStrategy: 'first' },
  'merge-append': {},
  'merge-horizontal': {},
  'split-delimiter': { delimiter: ',' },
  'split-width': {},
  'sort-asc': { order: 'asc' },
  'sort-desc': { order: 'desc' },
  'to-json': { format: 'object' },
  'to-csv': { delimiter: ',' },
  'to-sql-insert': {},
  'calculate-sum': {},
  'calculate-avg': {},
  'calculate-count': {},
  'lookup-match': { fuzzyMatch: false },
  'remove-empty-rows': {},
  'trim-whitespace': {},
  'remove-special-chars': {}
}

/**
 * 根据 actionId 获取对应的 taskId
 */
export function getTaskIdByAction(actionId) {
  // 首先在 INTENT_OPERATION_MAP 中查找
  for (const [intentKey, config] of Object.entries(INTENT_OPERATION_MAP)) {
    if (config.actions.includes(actionId)) {
      return config.taskId
    }
  }
  // 直接映射表：处理一些不在 INTENT_MAP.actions 中的 actionId
  const directMap = {
    // 脱敏
    'custom-mask': 'mask',
    // 分割
    'wage-slip-split': 'split',
    // 格式转换
    'transpose': 'convert',
    'to-upper': 'convert',
    'to-lower': 'convert',
    'capitalize': 'convert',
    // 清洗
    'normalize-dates': 'clean',
    'round-numbers': 'clean',
    'convert-width': 'clean',
    'remove-all-spaces': 'clean',
    'remove-special-chars': 'clean',
    'remove-empty-cols': 'clean',
    // 提取
    'replace-text': 'extract',
    'letter-mapping': 'extract',
    // 其他
    'pipeline': 'custom'
  }
  return directMap[actionId] || null
}

/**
 * 获取意图的中文或英文标准名称
 */
export function getCanonicalIntent(intent) {
  const mapped = INTENT_MAP[intent]
  if (mapped) {
    // 如果传入的是中文，返回英文；如果是英文，返回中文
    if (mapped.en) return mapped.en
    if (mapped.zh) return mapped.zh
  }
  return intent
}

/**
 * 检测输入语言
 */
export function detectLanguage(text) {
  const chineseRegex = /[一-鿿]/
  return chineseRegex.test(text) ? 'zh' : 'en'
}

// ========== 文本列名提取 ==========

/**
 * 常见列名关键词及其匹配正则
 * 用于从用户输入文本中提取列名提示
 */
const COLUMN_NAME_PATTERNS = [
  { regex: /身份证号?|ID\s*Card|idcard/i, label: '身份证' },
  { regex: /手机号?|电话|phone|mobile|telephone/i, label: '手机号' },
  { regex: /邮箱|邮件|email|e-mail/i, label: '邮箱' },
  { regex: /姓名|名字|username|full\s*name/i, label: '姓名' },
  { regex: /编号|ID(?!\s*Card)|序号|code|number/i, label: '编号' },
  { regex: /日期|时间|date|time/i, label: '日期' },
  { regex: /金额|价格|费用|price|amount|money/i, label: '金额' },
  { regex: /数量|个数|count|quantity/i, label: '数量' },
  { regex: /地址|address/i, label: '地址' },
  { regex: /部门|department/i, label: '部门' },
  { regex: /性别|gender/i, label: '性别' },
  { regex: /年龄|age/i, label: '年龄' },
  { regex: /备注|remark|note/i, label: '备注' },
]

/**
 * 操作子类型关键词
 * key: 规范值, value: 匹配关键词
 */
const ACTION_SUBTYPE_KEYWORDS = {
  // 脱敏方式
  maskFull: /全部[隐遮藏]|完全[隐遮藏]|完全脱敏|全部脱敏/,
  maskPartial: /部分[隐遮藏]|部分脱敏|保留.*[位字符]/,
  // 排序方向
  sortAsc: /升序|asc|正序|从小[到大]|递增/,
  sortDesc: /倒序|desc|降序|从大[到小]|递减/,
  // 去重策略
  dedupFirst: /保留[首个第一]|保留首/,
  dedupLast: /保留[末最]后|保留尾/,
  dedupDelete: /删除全部|全部删除|删除重复/,
}

/**
 * 从用户输入文本中提取列名和操作子类型提示
 * @param {string} input - 用户输入
 * @returns {{ suggestedColName: string|null, subTypeParams: Object }}
 */
export function extractColumnHints(input) {
  const result = {
    suggestedColName: null,
    subTypeParams: {}
  }

  // 1. 提取列名
  for (const pattern of COLUMN_NAME_PATTERNS) {
    if (pattern.regex.test(input)) {
      result.suggestedColName = pattern.label
      break // 取第一个匹配的列名
    }
  }

  // 2. 提取操作子类型
  for (const [subTypeKey, regex] of Object.entries(ACTION_SUBTYPE_KEYWORDS)) {
    if (regex.test(input)) {
      if (subTypeKey === 'maskFull') result.subTypeParams.maskType = 'full'
      else if (subTypeKey === 'maskPartial') result.subTypeParams.maskType = 'partial'
      else if (subTypeKey === 'sortAsc') result.subTypeParams.order = 'asc'
      else if (subTypeKey === 'sortDesc') result.subTypeParams.order = 'desc'
      else if (subTypeKey === 'dedupFirst') result.subTypeParams.keepStrategy = 'first'
      else if (subTypeKey === 'dedupLast') result.subTypeParams.keepStrategy = 'last'
      else if (subTypeKey === 'dedupDelete') result.subTypeParams.keepStrategy = 'none'
    }
  }

  return result
}

/**
 * 操作ID → i18n key 映射
 * 用于意图识别结果显示具体操作名称
 * 显示名称通过 t() 函数从 locales 获取
 */
export const ACTION_DISPLAY_KEYS = {
  // 脱敏
  'mask-id': 'operations.mask-id',
  'mask-phone': 'operations.mask-phone',
  'mask-email': 'operations.mask-email',
  'mask-name': 'operations.mask-name',
  'custom-mask': 'operations.custom-mask',
  // 去重
  'dedup-exact': 'operations.dedup-exact',
  'dedup-key': 'operations.dedup-key',
  // 排序
  'sort-asc': 'operations.sort-asc',
  'sort-desc': 'operations.sort-desc',
  'shuffle': 'operations.shuffle',
  // 合并
  'merge-append': 'operations.merge-append',
  'merge-horizontal': 'operations.merge-horizontal',
  // 分割
  'split-delimiter': 'operations.split-delimiter',
  'split-width': 'operations.split-width',
  'wage-slip-split': 'operations.wage-slip-split',
  // 格式转换
  'to-json': 'operations.to-json',
  'to-csv': 'operations.to-csv',
  'to-sql-insert': 'operations.to-sql-insert',
  'to-sql-inquery': 'operations.to-sql-inquery',
  'transpose': 'operations.transpose',
  'to-upper': 'operations.to-upper',
  'to-lower': 'operations.to-lower',
  'capitalize': 'operations.capitalize',
  // 计算
  'calculate-sum': 'operations.calculate-sum',
  'calculate-avg': 'operations.calculate-avg',
  'calculate-count': 'operations.calculate-count',
  'calculate-max': 'operations.calculate-max',
  'calculate-min': 'operations.calculate-min',
  'batch-math': 'operations.batch-math',
  'group-summary': 'operations.group-summary',
  // 清洗
  'remove-empty-rows': 'operations.remove-empty-rows',
  'remove-empty-cols': 'operations.remove-empty-cols',
  'trim-whitespace': 'operations.trim-whitespace',
  'remove-all-spaces': 'operations.remove-all-spaces',
  'remove-special-chars': 'operations.remove-special-chars',
  'normalize-dates': 'operations.normalize-dates',
  'round-numbers': 'operations.round-numbers',
  'convert-width': 'operations.convert-width',
  // 提取
  'column-to-string': 'operations.column-to-string',
  'extract-regex': 'operations.extract-regex',
  'replace-text': 'operations.replace-text',
  'letter-mapping': 'operations.letter-mapping',
  // 查找匹配
  'lookup-match': 'operations.lookup-match',
  // 其他
  'pipeline': 'operations.pipeline'
}

/**
 * 从多意图输入文本中提取每个意图对应的列名提示
 * 分析思路：用连接词切分文本片段，每段对应一个意图，再对各段提取列名
 * @param {string} input - 用户原始输入
 * @param {Array} intents - 已匹配的意图列表
 * @returns {Array} 每个意图对应的列名提示数组（按意图顺序）
 */
export function extractMultiColumnHints(input, intents) {
  // 分割连接词
  const segments = input.split(/[并,，、且和与及然后接着再还也]/).filter(s => s.trim())
  const hints = []

  for (let i = 0; i < intents.length; i++) {
    // 优先用对应位置的文本片段提取
    const segment = segments[i] || input
    const hint = extractColumnHints(segment)
    hints.push(hint)
  }

  return hints
}

/**
 * 根据列名提示匹配实际文件表头列索引
 * @param {string} suggestedColName - 用户提及的列名提示（如"身份证"）
 * @param {string[]} headers - 文件实际表头列表
 * @returns {number|null} 匹配到的列索引，未匹配返回 null
 */
export function matchColumnName(suggestedColName, headers) {
  if (!suggestedColName || !headers || headers.length === 0) return null

  // 精确匹配
  for (let i = 0; i < headers.length; i++) {
    const header = String(headers[i] || '').trim()
    if (header === suggestedColName) return i
  }

  // 模糊匹配（包含关系）
  for (let i = 0; i < headers.length; i++) {
    const header = String(headers[i] || '').trim().toLowerCase()
    const target = suggestedColName.toLowerCase()
    if (header.includes(target) || target.includes(header)) return i
  }

  // 列名模式匹配（针对不同列类型用对应正则）
  const patterns = COLUMN_NAME_PATTERNS.find(p => p.label === suggestedColName)
  if (patterns) {
    for (let i = 0; i < headers.length; i++) {
      const header = String(headers[i] || '').trim()
      if (patterns.regex.test(header)) return i
    }
  }

  return null
}
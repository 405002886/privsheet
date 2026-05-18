/**
 * Utils 层错误码定义
 * 错误信息由 UI 层通过 i18n 进行翻译显示
 */
export const ErrorCodes = {
  // 通用错误
  INVALID_DATA: 'INVALID_DATA',           // 无效数据
  INVALID_DATA_NOT_ARRAY: 'INVALID_DATA_NOT_ARRAY',  // 不是数组
  INVALID_DATA_EMPTY: 'INVALID_DATA_EMPTY',          // 空数组
  INVALID_DATA_NOT_FIRST_ROW_ARRAY: 'INVALID_DATA_NOT_FIRST_ROW_ARRAY',  // 第一行不是数组
  INVALID_PARAMS: 'INVALID_PARAMS',       // 无效参数
  FILE_PARSE_ERROR: 'FILE_PARSE_ERROR',   // 文件解析失败
  OPERATION_FAILED: 'OPERATION_FAILED',   // 操作执行失败

  // 特定操作错误
  REGEX_INVALID: 'REGEX_INVALID',                  // 无效的正则表达式
  COLUMN_NOT_FOUND: 'COLUMN_NOT_FOUND',            // 列未找到
  COLUMN_INDEX_INVALID: 'COLUMN_INDEX_INVALID',    // 列索引无效
  EMPTY_SELECTION: 'EMPTY_SELECTION',              // 选择为空
  LETTER_MAPPING_EMPTY: 'LETTER_MAPPING_EMPTY',   // 字母映射表为空
  LETTER_MAPPING_INVALID: 'LETTER_MAPPING_INVALID', // 字母映射表格式无效
  SELECT_AT_LEAST_ONE_COLUMN: 'SELECT_AT_LEAST_ONE_COLUMN', // 至少选择一个列
  SELECT_AT_LEAST_TWO_COLUMNS: 'SELECT_AT_LEAST_TWO_COLUMNS', // 至少选择两列
  INVALID_MAIN_TABLE: 'INVALID_MAIN_TABLE',        // 无效主表数据
  INVALID_LOOKUP_TABLE: 'INVALID_LOOKUP_TABLE',   // 无效查找表数据
  NEED_AT_LEAST_TWO_FILES: 'NEED_AT_LEAST_TWO_FILES', // 至少需要两个文件
  INVALID_WAGE_DATA: 'INVALID_WAGE_DATA',         // 无效工资表数据
  NAME_COLUMN_NOT_DETECTED: 'NAME_COLUMN_NOT_DETECTED', // 无法自动检测员工姓名列
  NO_VALID_WAGE_RECORDS: 'NO_VALID_WAGE_RECORDS', // 没有找到有效的工资记录
  SEARCH_TEXT_REQUIRED: 'SEARCH_TEXT_REQUIRED',     // 请提供搜索内容
  INVALID_DELIMITER: 'INVALID_DELIMITER',         // 无效的分隔符
  INVALID_WIDTHS: 'INVALID_WIDTHS',               // 无效的宽度数组
  NO_VALID_VALUES: 'NO_VALID_VALUES',             // 没有找到有效值
}

/**
 * 获取错误信息（由 UI 层翻译）
 * @param {string} code - 错误码
 * @returns {string} 错误信息（用于显示的默认英文文本）
 */
export function getErrorInfo(code) {
  const errorMessages = {
    // 通用错误
    [ErrorCodes.INVALID_DATA]: 'Invalid data',
    [ErrorCodes.INVALID_DATA_NOT_ARRAY]: 'Invalid data: not an array',
    [ErrorCodes.INVALID_DATA_EMPTY]: 'Invalid data: empty array',
    [ErrorCodes.INVALID_DATA_NOT_FIRST_ROW_ARRAY]: 'Invalid data: first row is not an array, may be object array',
    [ErrorCodes.INVALID_PARAMS]: 'Invalid parameters',
    [ErrorCodes.FILE_PARSE_ERROR]: 'File parsing failed',
    [ErrorCodes.OPERATION_FAILED]: 'Operation execution failed',

    // 特定操作错误
    [ErrorCodes.REGEX_INVALID]: 'Invalid regular expression',
    [ErrorCodes.COLUMN_NOT_FOUND]: 'Column not found',
    [ErrorCodes.COLUMN_INDEX_INVALID]: 'Invalid column index',
    [ErrorCodes.EMPTY_SELECTION]: 'No selection',
    [ErrorCodes.LETTER_MAPPING_EMPTY]: 'Letter mapping table is required',
    [ErrorCodes.LETTER_MAPPING_INVALID]: 'Invalid letter mapping format, use format like A→X,B→Y',
    [ErrorCodes.SELECT_AT_LEAST_ONE_COLUMN]: 'Please select at least one column',
    [ErrorCodes.SELECT_AT_LEAST_TWO_COLUMNS]: 'Please select at least two columns',
    [ErrorCodes.INVALID_MAIN_TABLE]: 'Invalid main table data',
    [ErrorCodes.INVALID_LOOKUP_TABLE]: 'Invalid lookup table data',
    [ErrorCodes.NEED_AT_LEAST_TWO_FILES]: 'At least two files are required for merge',
    [ErrorCodes.INVALID_WAGE_DATA]: 'Invalid wage table data, ensure data contains header and at least one row',
    [ErrorCodes.NAME_COLUMN_NOT_DETECTED]: 'Cannot auto-detect employee name column, please select manually',
    [ErrorCodes.NO_VALID_WAGE_RECORDS]: 'No valid wage records found',
    [ErrorCodes.SEARCH_TEXT_REQUIRED]: 'Please provide search content',
    [ErrorCodes.INVALID_DELIMITER]: 'Please provide a valid delimiter',
    [ErrorCodes.INVALID_WIDTHS]: 'Please provide width array',
    [ErrorCodes.NO_VALID_VALUES]: 'No valid values found',
  }
  return errorMessages[code] || 'Unknown error'
}

/**
 * 多国身份证格式配置
 * 国家/地区名称使用 i18n key 格式，方便国际化
 * 使用时通过 t('idCardCountries.xxx') 获取翻译后的名称
 */
export const idCardPatterns = [
  // 中国身份证 - 15位和18位
  {
    nameKey: 'idCardCountries.china',
    pattern: /^[1-9]\d{5}(\d{6}|\d{8})\d{3}(\d|x|X)?$/,
    mask: (cell, type) => {
      if (type === 'full') return '*******************'
      if (cell.length === 18) {
        return cell.substring(0, 3) + '***********' + cell.substring(cell.length - 4)
      }
      return cell.substring(0, 3) + '***********' + cell.substring(cell.length - 4)
    }
  },
  // 美国 SSN
  {
    nameKey: 'idCardCountries.usa',
    pattern: /^\d{3}-\d{2}-\d{4}$/,
    mask: (cell, type) => {
      if (type === 'full') return '***-**-****'
      return '***-**-' + cell.substring(cell.length - 4)
    }
  },
  // 英国 NI
  {
    nameKey: 'idCardCountries.uk',
    pattern: /^[A-Z]{2}\d{6}[A-Z]$/i,
    mask: (cell, type) => {
      if (type === 'full') return '*********'
      return cell.substring(0, 2) + '******' + cell.substring(cell.length - 1)
    }
  },
  // 德国身份证
  {
    nameKey: 'idCardCountries.germany',
    pattern: /^[CFGHJKLMNPRTVWXYZ0-9]{9}$/i,
    mask: (cell, type) => {
      if (type === 'full') return '*********'
      return cell.substring(0, 2) + '******' + cell.substring(cell.length - 1)
    }
  },
  // 法国 SSN
  {
    nameKey: 'idCardCountries.france',
    pattern: /^\d{15}$/,
    mask: (cell, type) => {
      if (type === 'full') return '***************'
      return cell.substring(0, 4) + '***********' + cell.substring(cell.length - 2)
    }
  },
  // 日本住民票コード
  {
    nameKey: 'idCardCountries.japan',
    pattern: /^\d{11}$/,
    mask: (cell, type) => {
      if (type === 'full') return '***********'
      return cell.substring(0, 3) + '*******' + cell.substring(cell.length - 1)
    }
  },
  // 韩国居民身份证
  {
    nameKey: 'idCardCountries.korea',
    pattern: /^\d{6}-\d{7}$/,
    mask: (cell, type) => {
      if (type === 'full') return '*****-*******'
      return '******-' + cell.substring(cell.length - 4).padStart(cell.length, '*')
    }
  },
  // 加拿大 SIN
  {
    nameKey: 'idCardCountries.canada',
    pattern: /^\d{3}-\d{3}-\d{4}$/,
    mask: (cell, type) => {
      if (type === 'full') return '***-***-****'
      return '***-***-' + cell.substring(cell.length - 4)
    }
  },
  // 澳大利亚 TFN
  {
    nameKey: 'idCardCountries.australia',
    pattern: /^\d{8,9}$/,
    mask: (cell, type) => {
      if (type === 'full') return '*********'
      return cell.substring(0, 3) + '*****' + cell.substring(cell.length - 1)
    }
  },
  // 西班牙 DNI/NIE
  {
    nameKey: 'idCardCountries.spain',
    pattern: /^[XYZxyz]?\d{7,8}[a-zA-Z]$/,
    mask: (cell, type) => {
      if (type === 'full') return '*********'
      return cell.substring(0, 3) + '*****' + cell.substring(cell.length - 1)
    }
  },
  // 意大利 Codice Fiscale
  {
    nameKey: 'idCardCountries.italy',
    pattern: /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/i,
    mask: (cell, type) => {
      if (type === 'full') return '****************'
      return cell.substring(0, 4) + '********' + cell.substring(cell.length - 4)
    }
  },
  // 荷兰 BSN
  {
    nameKey: 'idCardCountries.netherlands',
    pattern: /^\d{9}$/,
    mask: (cell, type) => {
      if (type === 'full') return '*********'
      return cell.substring(0, 3) + '*****' + cell.substring(cell.length - 1)
    }
  },
  // 比利时 BIS
  {
    nameKey: 'idCardCountries.belgium',
    pattern: /^\d{11}$/,
    mask: (cell, type) => {
      if (type === 'full') return '***********'
      return cell.substring(0, 4) + '*******' + cell.substring(cell.length - 1)
    }
  },
  // 瑞士 AHV
  {
    nameKey: 'idCardCountries.switzerland',
    pattern: /^\d{3}\.\d{4}\.\d{4}\.\d{2}$/,
    mask: (cell, type) => {
      if (type === 'full') return '***.****.****.**'
      return '***.****.****.' + cell.substring(cell.length - 2)
    }
  },
  // 新加坡 NRIC/FIN
  {
    nameKey: 'idCardCountries.singapore',
    pattern: /^[SFGTsfgt]\d{7}[a-zA-Z]$/,
    mask: (cell, type) => {
      if (type === 'full') return '*********'
      return cell.substring(0, 2) + '******' + cell.substring(cell.length - 1)
    }
  },
  // 马来西亚 IC
  {
    nameKey: 'idCardCountries.malaysia',
    pattern: /^\d{6}-\d{7}$/,
    mask: (cell, type) => {
      if (type === 'full') return '******-*******'
      return '******-' + cell.substring(cell.length - 4)
    }
  },
  // 香港身份证
  {
    nameKey: 'idCardCountries.hongKong',
    pattern: /^[A-Z]{1,2}\d{6}\(\d\)$/i,
    mask: (cell, type) => {
      if (type === 'full') return '*******(*)'
      return cell.substring(0, 2) + '*****' + cell.substring(cell.length - 3)
    }
  },
  // 台湾身份证
  {
    nameKey: 'idCardCountries.taiwan',
    pattern: /^[A-Z]\d{9}$/i,
    mask: (cell, type) => {
      if (type === 'full') return '**********'
      return cell.substring(0, 2) + '*******' + cell.substring(cell.length - 2)
    }
  },
  // 澳门身份证
  {
    nameKey: 'idCardCountries.macau',
    pattern: /^[A-Z]\d\/\d{6}$/i,
    mask: (cell, type) => {
      if (type === 'full') return '********'
      return cell.substring(0, 2) + '******' + cell.substring(cell.length - 1)
    }
  },
  // 俄罗斯护照
  {
    nameKey: 'idCardCountries.russia',
    pattern: /^\d{10}$/,
    mask: (cell, type) => {
      if (type === 'full') return '**********'
      return cell.substring(0, 4) + '******' + cell.substring(cell.length - 1)
    }
  },
  // 巴西 CPF
  {
    nameKey: 'idCardCountries.brazil',
    pattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    mask: (cell, type) => {
      if (type === 'full') return '***.***.***-**'
      return '***.***.***-' + cell.substring(cell.length - 2)
    }
  },
  // 墨西哥 CURP
  {
    nameKey: 'idCardCountries.mexico',
    pattern: /^[A-Z]{4}\d{6}[A-Z]{6}\d{2}$/i,
    mask: (cell, type) => {
      if (type === 'full') return '******************'
      return cell.substring(0, 4) + '**************' + cell.substring(cell.length - 2)
    }
  },
  // 印度 Aadhaar
  {
    nameKey: 'idCardCountries.india',
    pattern: /^\d{4}\s?\d{4}\s?\d{4}$/,
    mask: (cell, type) => {
      if (type === 'full') return '**** **** ****'
      return '**** **** ****' + cell.substring(cell.length - 4).trim()
    }
  },
  // 印度尼西亚 NIK/KTP
  {
    nameKey: 'idCardCountries.indonesia',
    pattern: /^\d{16}$/,
    mask: (cell, type) => {
      if (type === 'full') return '****************'
      return cell.substring(0, 5) + '***********' + cell.substring(cell.length - 2)
    }
  },
  // 泰国身份证
  {
    nameKey: 'idCardCountries.thailand',
    pattern: /^\d{13}$/,
    mask: (cell, type) => {
      if (type === 'full') return '*************'
      return cell.substring(0, 4) + '*********' + cell.substring(cell.length - 2)
    }
  },
  // 越南 CMND/CCCD
  {
    nameKey: 'idCardCountries.vietnam',
    pattern: /^\d{9,12}$/,
    mask: (cell, type) => {
      if (type === 'full') return '************'
      return cell.substring(0, 3) + '*****' + cell.substring(cell.length - 2)
    }
  },
  // 菲律宾 SSRS
  {
    nameKey: 'idCardCountries.philippines',
    pattern: /^[A-Z]\d{9}$/i,
    mask: (cell, type) => {
      if (type === 'full') return '**********'
      return cell.substring(0, 2) + '******' + cell.substring(cell.length - 2)
    }
  },
  // 澳大利亚 Medicare
  {
    nameKey: 'idCardCountries.australiaMedicare',
    pattern: /^\d{10}[a-zA-Z]$/,
    mask: (cell, type) => {
      if (type === 'full') return '***********'
      return cell.substring(0, 3) + '*******' + cell.substring(cell.length - 1)
    }
  },
  // 新西兰 IRD
  {
    nameKey: 'idCardCountries.newZealand',
    pattern: /^\d{8,9}[a-zA-Z]$/i,
    mask: (cell, type) => {
      if (type === 'full') return '*********'
      return cell.substring(0, 3) + '*****' + cell.substring(cell.length - 1)
    }
  },
  // 南非 ID
  {
    nameKey: 'idCardCountries.southAfrica',
    pattern: /^\d{13}$/,
    mask: (cell, type) => {
      if (type === 'full') return '*************'
      return cell.substring(0, 5) + '********' + cell.substring(cell.length - 2)
    }
  },
  // 埃及身份证
  {
    nameKey: 'idCardCountries.egypt',
    pattern: /^\d{14}$/,
    mask: (cell, type) => {
      if (type === 'full') return '**************'
      return cell.substring(0, 5) + '*********' + cell.substring(cell.length - 2)
    }
  },
  // 沙特阿拉伯 IQAMA
  {
    nameKey: 'idCardCountries.saudiArabia',
    pattern: /^\d{10}$/,
    mask: (cell, type) => {
      if (type === 'full') return '**********'
      return cell.substring(0, 4) + '******' + cell.substring(cell.length - 2)
    }
  },
  // 阿联酋 Emirates ID
  {
    nameKey: 'idCardCountries.uae',
    pattern: /^\d{15,18}$/,
    mask: (cell, type) => {
      if (type === 'full') return '******************'
      return cell.substring(0, 5) + '*********' + cell.substring(cell.length - 4)
    }
  }
]

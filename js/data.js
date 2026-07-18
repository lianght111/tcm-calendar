/**
 * data.js - 中医日历核心数据定义
 * 包含：天干地支、五行、节气基础数据、穴位信息、五运六气常量等
 */

// =================== 天干地支 ===================
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 六十甲子表 (0-59)
const SEXAGENARY = [];
for (let i = 0; i < 60; i++) {
    SEXAGENARY.push(TIAN_GAN[i % 10] + DI_ZHI[i % 12]);
}

// 天干阴阳: 甲丙戊庚壬=阳, 乙丁己辛癸=阴
const GAN_YIN_YANG = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0]; // 1=阳, 0=阴
// 地支阴阳: 子寅辰午申戌=阳, 丑卯巳未酉亥=阴
const ZHI_YIN_YANG = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0];

// 天干五行: 甲乙=木, 丙丁=火, 戊己=土, 庚辛=金, 壬癸=水
const GAN_WU_XING = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
// 地支五行: 寅卯=木, 巳午=火, 申酉=金, 亥子=水, 辰戌丑未=土
const ZHI_WU_XING = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];

const WU_XING_NAMES = ['木', '火', '土', '金', '水'];
const WU_XING_COLORS = ['wood', 'fire', 'earth', 'metal', 'water'];

// =================== 时辰 ===================
// 十二时辰对应时间和经络
const SHI_CHEN = [
    { name: '子时', start: 23, end: 1,  zhi: 0,  meridian: '胆经', meridianCN: '足少阳胆经' },
    { name: '丑时', start: 1,  end: 3,  zhi: 1,  meridian: '肝经', meridianCN: '足厥阴肝经' },
    { name: '寅时', start: 3,  end: 5,  zhi: 2,  meridian: '肺经', meridianCN: '手太阴肺经' },
    { name: '卯时', start: 5,  end: 7,  zhi: 3,  meridian: '大肠经', meridianCN: '手阳明大肠经' },
    { name: '辰时', start: 7,  end: 9,  zhi: 4,  meridian: '胃经', meridianCN: '足阳明胃经' },
    { name: '巳时', start: 9,  end: 11, zhi: 5,  meridian: '脾经', meridianCN: '足太阴脾经' },
    { name: '午时', start: 11, end: 13, zhi: 6,  meridian: '心经', meridianCN: '手少阴心经' },
    { name: '未时', start: 13, end: 15, zhi: 7,  meridian: '小肠经', meridianCN: '手太阳小肠经' },
    { name: '申时', start: 15, end: 17, zhi: 8,  meridian: '膀胱经', meridianCN: '足太阳膀胱经' },
    { name: '酉时', start: 17, end: 19, zhi: 9,  meridian: '肾经', meridianCN: '足少阴肾经' },
    { name: '戌时', start: 19, end: 21, zhi: 10, meridian: '心包经', meridianCN: '手厥阴心包经' },
    { name: '亥时', start: 21, end: 23, zhi: 11, meridian: '三焦经', meridianCN: '手少阳三焦经' }
];

// =================== 二十四节气基础数据 ===================
// 名称、对应月份（节气月）、太阳黄经
const SOLAR_TERMS = [
    { name: '小寒', month: 0,  angle: 285, type: '节' },
    { name: '大寒', month: 0,  angle: 300, type: '中' },
    { name: '立春', month: 1,  angle: 315, type: '节' },
    { name: '雨水', month: 1,  angle: 330, type: '中' },
    { name: '惊蛰', month: 2,  angle: 345, type: '节' },
    { name: '春分', month: 2,  angle: 0,   type: '中' },
    { name: '清明', month: 3,  angle: 15,  type: '节' },
    { name: '谷雨', month: 3,  angle: 30,  type: '中' },
    { name: '立夏', month: 4,  angle: 45,  type: '节' },
    { name: '小满', month: 4,  angle: 60,  type: '中' },
    { name: '芒种', month: 5,  angle: 75,  type: '节' },
    { name: '夏至', month: 5,  angle: 90,  type: '中' },
    { name: '小暑', month: 6,  angle: 105, type: '节' },
    { name: '大暑', month: 6,  angle: 120, type: '中' },
    { name: '立秋', month: 7,  angle: 135, type: '节' },
    { name: '处暑', month: 7,  angle: 150, type: '中' },
    { name: '白露', month: 8,  angle: 165, type: '节' },
    { name: '秋分', month: 8,  angle: 180, type: '中' },
    { name: '寒露', month: 9,  angle: 195, type: '节' },
    { name: '霜降', month: 9,  angle: 210, type: '中' },
    { name: '立冬', month: 10, angle: 225, type: '节' },
    { name: '小雪', month: 10, angle: 240, type: '中' },
    { name: '大雪', month: 11, angle: 255, type: '节' },
    { name: '冬至', month: 11, angle: 270, type: '中' }
];

// 节气计算C值 (基于通用公式: 日期 = [Y*D+C]-L)
// D=0.2422, 世纪调整不同. 此处为21世纪C值
const SOLAR_TERM_C = [
    6.11,  20.84, // 小寒, 大寒
    4.63,  19.70, // 立春, 雨水
    6.42,  21.41, // 惊蛰, 春分
    5.59,  20.67, // 清明, 谷雨
    6.38,  21.54, // 立夏, 小满
    6.88,  22.55, // 芒种, 夏至
    8.38,  23.77, // 小暑, 大暑
    8.80,  23.97, // 立秋, 处暑
    8.68,  23.71, // 白露, 秋分
    9.00,  24.31, // 寒露, 霜降
    8.18,  23.02, // 立冬, 小雪
    7.93,  22.43  // 大雪, 冬至
];

// =================== 二十四山/方位 ===================
const EIGHT_TRIGRAMS = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'];

// =================== 灵龟八法数据 ===================
// 八脉交会穴
const LINGGUI_ACUPOINTS = {
    1: { name: '申脉', code: 'BL62', meridian: '足太阳膀胱经', trigram: '坎', vessel: '阳跷脉', location: '外踝下缘凹陷处' },
    2: { name: '照海', code: 'KI6',  meridian: '足少阴肾经',   trigram: '坤', vessel: '阴跷脉', location: '内踝下缘凹陷处' },
    3: { name: '外关', code: 'TE5',  meridian: '手少阳三焦经', trigram: '震', vessel: '阳维脉', location: '腕背横纹上2寸' },
    4: { name: '足临泣', code: 'GB41', meridian: '足少阳胆经',  trigram: '巽', vessel: '带脉',   location: '足背第4-5跖骨间' },
    5: { name: '照海', code: 'KI6',  meridian: '足少阴肾经',   trigram: '坤', vessel: '阴跷脉', location: '内踝下缘凹陷处' },
    6: { name: '公孙', code: 'SP4',  meridian: '足太阴脾经',   trigram: '乾', vessel: '冲脉',   location: '足内侧第一跖骨底前下缘' },
    7: { name: '后溪', code: 'SI3',  meridian: '手太阳小肠经', trigram: '兑', vessel: '督脉',   location: '第5掌指关节后尺侧' },
    8: { name: '内关', code: 'PC6',  meridian: '手厥阴心包经', trigram: '艮', vessel: '阴维脉', location: '腕横纹上2寸' },
    9: { name: '列缺', code: 'LU7',  meridian: '手太阴肺经',   trigram: '离', vessel: '任脉',   location: '桡骨茎突上方腕横纹上1.5寸' }
};

// 八法逐日干支数字（天干 -> 基数）
const LINGGUI_DAY_GAN_NUM = {
    '甲': 10, '己': 10,
    '乙': 9,  '庚': 9,
    '丁': 8,  '壬': 8,
    '丙': 7,  '辛': 7,
    '戊': 6,  '癸': 6
};

// 八法逐日地支数字
const LINGGUI_DAY_ZHI_NUM = {
    '子': 9, '午': 9,
    '丑': 8, '未': 8,
    '寅': 7, '申': 7,
    '卯': 6, '酉': 6,
    '辰': 5, '戌': 5,
    '巳': 4, '亥': 4
};

// 八法临时干支数字（时辰天干）
const LINGGUI_HOUR_GAN_NUM = {
    '甲': 9, '己': 9,
    '乙': 8, '庚': 8,
    '丙': 7, '辛': 7,
    '丁': 6, '壬': 6,
    '戊': 5, '癸': 5
};

// 八法临时地支数字（时辰地支）
const LINGGUI_HOUR_ZHI_NUM = {
    '子': 9, '午': 9,
    '丑': 8, '未': 8,
    '寅': 7, '申': 7,
    '卯': 6, '酉': 6,
    '辰': 5, '戌': 5,
    '巳': 4, '亥': 4
};

// =================== 子午流注纳甲法数据 ===================
// 根据日干和时辰确定开穴（简化纳甲法）
// 格式: {日干: {时辰地支索引: 穴位信息}}
const ZIWU_NAJIA_POINTS = {
    '甲': {
        10: { name: '窍阴', code: 'GB44', meridian: '胆经', pointType: '井穴' },
        11: { name: '中渚', code: 'TE3', meridian: '三焦经', pointType: '输穴' },
        0:  { name: '足临泣', code: 'GB41', meridian: '胆经', pointType: '输穴' },
        1:  { name: '太冲', code: 'LR3', meridian: '肝经', pointType: '输穴' },
        2:  { name: '太渊', code: 'LU9', meridian: '肺经', pointType: '输穴' },
        3:  { name: '陷谷', code: 'ST43', meridian: '胃经', pointType: '输穴' },
        4:  { name: '阳溪', code: 'LI5', meridian: '大肠经', pointType: '经穴' },
        5:  { name: '商丘', code: 'SP5', meridian: '脾经', pointType: '经穴' }
    },
    '乙': {
        9:  { name: '大敦', code: 'LR1', meridian: '肝经', pointType: '井穴' },
        10: { name: '足临泣', code: 'GB41', meridian: '胆经', pointType: '输穴' },
        11: { name: '中渚', code: 'TE3', meridian: '三焦经', pointType: '输穴' },
        0:  { name: '侠溪', code: 'GB43', meridian: '胆经', pointType: '荥穴' },
        1:  { name: '行间', code: 'LR2', meridian: '肝经', pointType: '荥穴' },
        2:  { name: '少府', code: 'HT8', meridian: '心经', pointType: '荥穴' },
        3:  { name: '二间', code: 'LI2', meridian: '大肠经', pointType: '荥穴' },
        4:  { name: '解溪', code: 'ST41', meridian: '胃经', pointType: '经穴' }
    },
    '丙': {
        7:  { name: '少泽', code: 'SI1', meridian: '小肠经', pointType: '井穴' },
        8:  { name: '后溪', code: 'SI3', meridian: '小肠经', pointType: '输穴' },
        9:  { name: '太溪', code: 'KI3', meridian: '肾经', pointType: '输穴' },
        10: { name: '阳辅', code: 'GB38', meridian: '胆经', pointType: '经穴' },
        11: { name: '支沟', code: 'TE6', meridian: '三焦经', pointType: '经穴' },
        0:  { name: '足窍阴', code: 'GB44', meridian: '胆经', pointType: '井穴' },
        1:  { name: '曲泉', code: 'LR8', meridian: '肝经', pointType: '合穴' },
        2:  { name: '尺泽', code: 'LU5', meridian: '肺经', pointType: '合穴' }
    },
    '丁': {
        6:  { name: '少冲', code: 'HT9', meridian: '心经', pointType: '井穴' },
        7:  { name: '后溪', code: 'SI3', meridian: '小肠经', pointType: '输穴' },
        8:  { name: '束骨', code: 'BL65', meridian: '膀胱经', pointType: '输穴' },
        9:  { name: '复溜', code: 'KI7', meridian: '肾经', pointType: '经穴' },
        10: { name: '阳陵泉', code: 'GB34', meridian: '胆经', pointType: '合穴' },
        11: { name: '天井', code: 'TE10', meridian: '三焦经', pointType: '合穴' },
        0:  { name: '足临泣', code: 'GB41', meridian: '胆经', pointType: '输穴' },
        1:  { name: '行间', code: 'LR2', meridian: '肝经', pointType: '荥穴' }
    },
    '戊': {
        5:  { name: '厉兑', code: 'ST45', meridian: '胃经', pointType: '井穴' },
        6:  { name: '神门', code: 'HT7', meridian: '心经', pointType: '输穴' },
        7:  { name: '腕骨', code: 'SI4', meridian: '小肠经', pointType: '原穴' },
        8:  { name: '京骨', code: 'BL64', meridian: '膀胱经', pointType: '原穴' },
        9:  { name: '太溪', code: 'KI3', meridian: '肾经', pointType: '输穴' },
        10: { name: '丘墟', code: 'GB40', meridian: '胆经', pointType: '原穴' },
        11: { name: '阳池', code: 'TE4', meridian: '三焦经', pointType: '原穴' },
        0:  { name: '足窍阴', code: 'GB44', meridian: '胆经', pointType: '井穴' }
    },
    '己': {
        4:  { name: '隐白', code: 'SP1', meridian: '脾经', pointType: '井穴' },
        5:  { name: '解溪', code: 'ST41', meridian: '胃经', pointType: '经穴' },
        6:  { name: '神门', code: 'HT7', meridian: '心经', pointType: '输穴' },
        7:  { name: '小海', code: 'SI8', meridian: '小肠经', pointType: '合穴' },
        8:  { name: '委中', code: 'BL40', meridian: '膀胱经', pointType: '合穴' },
        9:  { name: '阴谷', code: 'KI10', meridian: '肾经', pointType: '合穴' },
        10: { name: '阳陵泉', code: 'GB34', meridian: '胆经', pointType: '合穴' },
        11: { name: '天井', code: 'TE10', meridian: '三焦经', pointType: '合穴' }
    },
    '庚': {
        3:  { name: '商阳', code: 'LI1', meridian: '大肠经', pointType: '井穴' },
        4:  { name: '陷谷', code: 'ST43', meridian: '胃经', pointType: '输穴' },
        5:  { name: '阳溪', code: 'LI5', meridian: '大肠经', pointType: '经穴' },
        6:  { name: '少海', code: 'HT3', meridian: '心经', pointType: '合穴' },
        7:  { name: '阳谷', code: 'SI5', meridian: '小肠经', pointType: '经穴' },
        8:  { name: '昆仑', code: 'BL60', meridian: '膀胱经', pointType: '经穴' },
        9:  { name: '复溜', code: 'KI7', meridian: '肾经', pointType: '经穴' },
        10: { name: '阳辅', code: 'GB38', meridian: '胆经', pointType: '经穴' }
    },
    '辛': {
        2:  { name: '少商', code: 'LU11', meridian: '肺经', pointType: '井穴' },
        3:  { name: '二间', code: 'LI2', meridian: '大肠经', pointType: '荥穴' },
        4:  { name: '足三里', code: 'ST36', meridian: '胃经', pointType: '合穴' },
        5:  { name: '商丘', code: 'SP5', meridian: '脾经', pointType: '经穴' },
        6:  { name: '少冲', code: 'HT9', meridian: '心经', pointType: '井穴' },
        7:  { name: '前谷', code: 'SI2', meridian: '小肠经', pointType: '荥穴' },
        8:  { name: '通谷', code: 'BL66', meridian: '膀胱经', pointType: '荥穴' },
        9:  { name: '然谷', code: 'KI2', meridian: '肾经', pointType: '荥穴' }
    },
    '壬': {
        1:  { name: '至阴', code: 'BL67', meridian: '膀胱经', pointType: '井穴' },
        2:  { name: '侠白', code: 'LU4', meridian: '肺经', pointType: '-', note: '肺经原穴太渊也在此时' },
        3:  { name: '合谷', code: 'LI4', meridian: '大肠经', pointType: '原穴' },
        4:  { name: '冲阳', code: 'ST42', meridian: '胃经', pointType: '原穴' },
        5:  { name: '太白', code: 'SP3', meridian: '脾经', pointType: '输穴/原穴' },
        6:  { name: '神门', code: 'HT7', meridian: '心经', pointType: '输穴/原穴' },
        7:  { name: '腕骨', code: 'SI4', meridian: '小肠经', pointType: '原穴' },
        8:  { name: '京骨', code: 'BL64', meridian: '膀胱经', pointType: '原穴' }
    },
    '癸': {
        0:  { name: '涌泉', code: 'KI1', meridian: '肾经', pointType: '井穴' },
        1:  { name: '太冲', code: 'LR3', meridian: '肝经', pointType: '输穴/原穴' },
        2:  { name: '太渊', code: 'LU9', meridian: '肺经', pointType: '输穴/原穴' },
        3:  { name: '合谷', code: 'LI4', meridian: '大肠经', pointType: '原穴' },
        4:  { name: '足三里', code: 'ST36', meridian: '胃经', pointType: '合穴' },
        5:  { name: '太白', code: 'SP3', meridian: '脾经', pointType: '输穴/原穴' },
        6:  { name: '少海', code: 'HT3', meridian: '心经', pointType: '合穴' },
        7:  { name: '阳谷', code: 'SI5', meridian: '小肠经', pointType: '经穴' }
    }
};

// 纳子法: 每个时辰对应的本经五输穴
const ZIWU_NAZI_POINTS = [
    { // 子时 胆经
        meridian: '足少阳胆经',
        well:  { name: '足窍阴',  code: 'GB44', type: '井穴' },
        spring:{ name: '侠溪',    code: 'GB43', type: '荥穴' },
        stream:{ name: '足临泣',  code: 'GB41', type: '输穴' },
        river: { name: '阳辅',    code: 'GB38', type: '经穴' },
        sea:   { name: '阳陵泉',  code: 'GB34', type: '合穴' },
        yuan:  { name: '丘墟',    code: 'GB40', type: '原穴' }
    },
    { // 丑时 肝经
        meridian: '足厥阴肝经',
        well:  { name: '大敦',   code: 'LR1',  type: '井穴' },
        spring:{ name: '行间',   code: 'LR2',  type: '荥穴' },
        stream:{ name: '太冲',   code: 'LR3',  type: '输穴' },
        river: { name: '中封',   code: 'LR4',  type: '经穴' },
        sea:   { name: '曲泉',   code: 'LR8',  type: '合穴' },
        yuan:  { name: '太冲',   code: 'LR3',  type: '原穴（同输穴）' }
    },
    { // 寅时 肺经
        meridian: '手太阴肺经',
        well:  { name: '少商',   code: 'LU11', type: '井穴' },
        spring:{ name: '鱼际',   code: 'LU10', type: '荥穴' },
        stream:{ name: '太渊',   code: 'LU9',  type: '输穴' },
        river: { name: '经渠',   code: 'LU8',  type: '经穴' },
        sea:   { name: '尺泽',   code: 'LU5',  type: '合穴' },
        yuan:  { name: '太渊',   code: 'LU9',  type: '原穴（同输穴）' }
    },
    { // 卯时 大肠经
        meridian: '手阳明大肠经',
        well:  { name: '商阳',   code: 'LI1',  type: '井穴' },
        spring:{ name: '二间',   code: 'LI2',  type: '荥穴' },
        stream:{ name: '三间',   code: 'LI3',  type: '输穴' },
        river: { name: '阳溪',   code: 'LI5',  type: '经穴' },
        sea:   { name: '曲池',   code: 'LI11', type: '合穴' },
        yuan:  { name: '合谷',   code: 'LI4',  type: '原穴' }
    },
    { // 辰时 胃经
        meridian: '足阳明胃经',
        well:  { name: '厉兑',   code: 'ST45', type: '井穴' },
        spring:{ name: '内庭',   code: 'ST44', type: '荥穴' },
        stream:{ name: '陷谷',   code: 'ST43', type: '输穴' },
        river: { name: '解溪',   code: 'ST41', type: '经穴' },
        sea:   { name: '足三里', code: 'ST36', type: '合穴' },
        yuan:  { name: '冲阳',   code: 'ST42', type: '原穴' }
    },
    { // 巳时 脾经
        meridian: '足太阴脾经',
        well:  { name: '隐白',   code: 'SP1',  type: '井穴' },
        spring:{ name: '大都',   code: 'SP2',  type: '荥穴' },
        stream:{ name: '太白',   code: 'SP3',  type: '输穴' },
        river: { name: '商丘',   code: 'SP5',  type: '经穴' },
        sea:   { name: '阴陵泉', code: 'SP9',  type: '合穴' },
        yuan:  { name: '太白',   code: 'SP3',  type: '原穴（同输穴）' }
    },
    { // 午时 心经
        meridian: '手少阴心经',
        well:  { name: '少冲',   code: 'HT9',  type: '井穴' },
        spring:{ name: '少府',   code: 'HT8',  type: '荥穴' },
        stream:{ name: '神门',   code: 'HT7',  type: '输穴' },
        river: { name: '灵道',   code: 'HT4',  type: '经穴' },
        sea:   { name: '少海',   code: 'HT3',  type: '合穴' },
        yuan:  { name: '神门',   code: 'HT7',  type: '原穴（同输穴）' }
    },
    { // 未时 小肠经
        meridian: '手太阳小肠经',
        well:  { name: '少泽',   code: 'SI1',  type: '井穴' },
        spring:{ name: '前谷',   code: 'SI2',  type: '荥穴' },
        stream:{ name: '后溪',   code: 'SI3',  type: '输穴' },
        river: { name: '阳谷',   code: 'SI5',  type: '经穴' },
        sea:   { name: '小海',   code: 'SI8',  type: '合穴' },
        yuan:  { name: '腕骨',   code: 'SI4',  type: '原穴' }
    },
    { // 申时 膀胱经
        meridian: '足太阳膀胱经',
        well:  { name: '至阴',   code: 'BL67', type: '井穴' },
        spring:{ name: '足通谷', code: 'BL66', type: '荥穴' },
        stream:{ name: '束骨',   code: 'BL65', type: '输穴' },
        river: { name: '昆仑',   code: 'BL60', type: '经穴' },
        sea:   { name: '委中',   code: 'BL40', type: '合穴' },
        yuan:  { name: '京骨',   code: 'BL64', type: '原穴' }
    },
    { // 酉时 肾经
        meridian: '足少阴肾经',
        well:  { name: '涌泉',   code: 'KI1',  type: '井穴' },
        spring:{ name: '然谷',   code: 'KI2',  type: '荥穴' },
        stream:{ name: '太溪',   code: 'KI3',  type: '输穴' },
        river: { name: '复溜',   code: 'KI7',  type: '经穴' },
        sea:   { name: '阴谷',   code: 'KI10', type: '合穴' },
        yuan:  { name: '太溪',   code: 'KI3',  type: '原穴（同输穴）' }
    },
    { // 戌时 心包经
        meridian: '手厥阴心包经',
        well:  { name: '中冲',   code: 'PC9',  type: '井穴' },
        spring:{ name: '劳宫',   code: 'PC8',  type: '荥穴' },
        stream:{ name: '大陵',   code: 'PC7',  type: '输穴' },
        river: { name: '间使',   code: 'PC5',  type: '经穴' },
        sea:   { name: '曲泽',   code: 'PC3',  type: '合穴' },
        yuan:  { name: '大陵',   code: 'PC7',  type: '原穴（同输穴）' }
    },
    { // 亥时 三焦经
        meridian: '手少阳三焦经',
        well:  { name: '关冲',   code: 'TE1',  type: '井穴' },
        spring:{ name: '液门',   code: 'TE2',  type: '荥穴' },
        stream:{ name: '中渚',   code: 'TE3',  type: '输穴' },
        river: { name: '支沟',   code: 'TE6',  type: '经穴' },
        sea:   { name: '天井',   code: 'TE10', type: '合穴' },
        yuan:  { name: '阳池',   code: 'TE4',  type: '原穴' }
    }
];

// =================== 五输穴五行属性 ===================
// 阴经：井(木)→荥(火)→输(土)→经(金)→合(水)  五行顺序: 木火土金水
// 阳经：井(金)→荥(水)→输(木)→经(火)→合(土)  五行顺序: 金水木火土
const YIN_WUSHU_WUXING = ['木', '火', '土', '金', '水']; // 井荥输经合
const YANG_WUSHU_WUXING = ['金', '水', '木', '火', '土']; // 井荥输经合

// 各经络按时辰索引对应的五输穴五行 (阴经/阳经)
function getShuPointWuxing(shiChenIdx, pointCategory) {
    const isYang = [0, 3, 4, 7, 8, 11].includes(shiChenIdx);
    const catMap = { well: 0, spring: 1, stream: 2, river: 3, sea: 4 };
    const idx = catMap[pointCategory];
    if (idx === undefined) return null;
    return isYang ? YANG_WUSHU_WUXING[idx] : YIN_WUSHU_WUXING[idx];
}

// =================== 纳子法主配穴（表里经配穴） ===================
// 每个时辰当令经络的输穴为主穴，表里经原穴为配穴
const NAZI_PAIR_POINTS = [
    { // 子时 胆经(阳) ↔ 肝经(阴)
        main: { name: '足临泣', code: 'GB41', reason: '胆经输穴，木' },
        accompany: { name: '太冲', code: 'LR3', reason: '肝经原穴（表里配穴）' },
        supplement: { name: '侠溪', code: 'GB43', reason: '胆经荥穴（水，母穴补法）' },
        drain: { name: '阳辅', code: 'GB38', reason: '胆经经穴（火，子穴泻法）' }
    },
    { // 丑时 肝经(阴) ↔ 胆经(阳)
        main: { name: '太冲', code: 'LR3', reason: '肝经输穴，土（同原穴）' },
        accompany: { name: '足临泣', code: 'GB41', reason: '胆经输穴（表里配穴）' },
        supplement: { name: '曲泉', code: 'LR8', reason: '肝经合穴（水，母穴补法）' },
        drain: { name: '行间', code: 'LR2', reason: '肝经荥穴（火，子穴泻法）' }
    },
    { // 寅时 肺经(阴) ↔ 大肠经(阳)
        main: { name: '太渊', code: 'LU9', reason: '肺经输穴，土（同原穴）' },
        accompany: { name: '合谷', code: 'LI4', reason: '大肠经原穴（表里配穴）' },
        supplement: { name: '太渊', code: 'LU9', reason: '肺经输穴（土，母穴补法）' },
        drain: { name: '尺泽', code: 'LU5', reason: '肺经合穴（水，子穴泻法）' }
    },
    { // 卯时 大肠经(阳) ↔ 肺经(阴)
        main: { name: '三间', code: 'LI3', reason: '大肠经输穴，木' },
        accompany: { name: '太渊', code: 'LU9', reason: '肺经原穴（表里配穴）' },
        supplement: { name: '曲池', code: 'LI11', reason: '大肠经合穴（土，母穴补法）' },
        drain: { name: '二间', code: 'LI2', reason: '大肠经荥穴（水，子穴泻法）' }
    },
    { // 辰时 胃经(阳) ↔ 脾经(阴)
        main: { name: '陷谷', code: 'ST43', reason: '胃经输穴，木' },
        accompany: { name: '太白', code: 'SP3', reason: '脾经原穴（表里配穴）' },
        supplement: { name: '解溪', code: 'ST41', reason: '胃经经穴（火，母穴补法）' },
        drain: { name: '厉兑', code: 'ST45', reason: '胃经井穴（金，子穴泻法）' }
    },
    { // 巳时 脾经(阴) ↔ 胃经(阳)
        main: { name: '太白', code: 'SP3', reason: '脾经输穴，土（同原穴）' },
        accompany: { name: '冲阳', code: 'ST42', reason: '胃经原穴（表里配穴）' },
        supplement: { name: '大都', code: 'SP2', reason: '脾经荥穴（火，母穴补法）' },
        drain: { name: '商丘', code: 'SP5', reason: '脾经经穴（金，子穴泻法）' }
    },
    { // 午时 心经(阴) ↔ 小肠经(阳)
        main: { name: '神门', code: 'HT7', reason: '心经输穴，土（同原穴）' },
        accompany: { name: '腕骨', code: 'SI4', reason: '小肠经原穴（表里配穴）' },
        supplement: { name: '少冲', code: 'HT9', reason: '心经井穴（木，母穴补法）' },
        drain: { name: '神门', code: 'HT7', reason: '心经输穴（土，子穴泻法）' }
    },
    { // 未时 小肠经(阳) ↔ 心经(阴)
        main: { name: '后溪', code: 'SI3', reason: '小肠经输穴，木' },
        accompany: { name: '神门', code: 'HT7', reason: '心经原穴（表里配穴）' },
        supplement: { name: '后溪', code: 'SI3', reason: '小肠经输穴（木，母穴补法）' },
        drain: { name: '小海', code: 'SI8', reason: '小肠经合穴（土，子穴泻法）' }
    },
    { // 申时 膀胱经(阳) ↔ 肾经(阴)
        main: { name: '束骨', code: 'BL65', reason: '膀胱经输穴，木' },
        accompany: { name: '太溪', code: 'KI3', reason: '肾经原穴（表里配穴）' },
        supplement: { name: '至阴', code: 'BL67', reason: '膀胱经井穴（金，母穴补法）' },
        drain: { name: '束骨', code: 'BL65', reason: '膀胱经输穴（木，子穴泻法）' }
    },
    { // 酉时 肾经(阴) ↔ 膀胱经(阳)
        main: { name: '太溪', code: 'KI3', reason: '肾经输穴，土（同原穴）' },
        accompany: { name: '京骨', code: 'BL64', reason: '膀胱经原穴（表里配穴）' },
        supplement: { name: '复溜', code: 'KI7', reason: '肾经经穴（金，母穴补法）' },
        drain: { name: '涌泉', code: 'KI1', reason: '肾经井穴（木，子穴泻法）' }
    },
    { // 戌时 心包经(阴) ↔ 三焦经(阳)
        main: { name: '大陵', code: 'PC7', reason: '心包经输穴，土（同原穴）' },
        accompany: { name: '阳池', code: 'TE4', reason: '三焦经原穴（表里配穴）' },
        supplement: { name: '中冲', code: 'PC9', reason: '心包经井穴（木，母穴补法）' },
        drain: { name: '大陵', code: 'PC7', reason: '心包经输穴（土，子穴泻法）' }
    },
    { // 亥时 三焦经(阳) ↔ 心包经(阴)
        main: { name: '中渚', code: 'TE3', reason: '三焦经输穴，木' },
        accompany: { name: '大陵', code: 'PC7', reason: '心包经原穴（表里配穴）' },
        supplement: { name: '中渚', code: 'TE3', reason: '三焦经输穴（木，母穴补法）' },
        drain: { name: '天井', code: 'TE10', reason: '三焦经合穴（土，子穴泻法）' }
    }
];

// =================== 纳甲法互用穴 ===================
// 根据"合日互用"原理：甲与己合、乙与庚合、丙与辛合、丁与壬合、戊与癸合
// 当某天干日不开某时辰穴位时，可使用合日日干的同一时辰穴位
const NAJIA_HE_PAIRS = {
    '甲': '己', '己': '甲',
    '乙': '庚', '庚': '乙',
    '丙': '辛', '辛': '丙',
    '丁': '壬', '壬': '丁',
    '戊': '癸', '癸': '戊'
};

// 互用穴描述
const NAJIA_HUYONG_INFO = {
    '甲': '甲己合化土，胆经日可与脾经日互用',
    '己': '甲己合化土，脾经日可与胆经日互用',
    '乙': '乙庚合化金，肝经日可配大肠经日互用',
    '庚': '乙庚合化金，大肠经日可配肝经日互用',
    '丙': '丙辛合化水，小肠经日可配肺经日互用',
    '辛': '丙辛合化水，肺经日可配小肠经日互用',
    '丁': '丁壬合化木，心经日可配膀胱经日互用',
    '壬': '丁壬合化木，膀胱经日可配心经日互用',
    '戊': '戊癸合化火，胃经日可配肾经日互用',
    '癸': '戊癸合化火，肾经日可配胃经日互用'
};

// =================== 灵龟八法配穴（夫妇配合） ===================
// 八脉交会穴两两配对
const LINGGUI_COUPLES = [
    { a: 1, b: 2, name: '申脉+照海', vesselA: '阳跷脉', vesselB: '阴跷脉', relation: '阴阳跷脉相配，主目疾、失眠、癫痫' },
    { a: 3, b: 8, name: '外关+内关', vesselA: '阳维脉', vesselB: '阴维脉', relation: '阴阳维脉相配，主寒热、心胸病' },
    { a: 4, b: 6, name: '足临泣+公孙', vesselA: '带脉', vesselB: '冲脉', relation: '带脉冲脉相配，主妇科、脾胃病' },
    { a: 7, b: 9, name: '后溪+列缺', vesselA: '督脉', vesselB: '任脉', relation: '督任二脉相配，主颈项、肺系病' }
];

// 八脉交会穴详细数据（卦性）
const LINGGUI_FULL_INFO = {
    1: { name: '申脉', code: 'BL62', trigram: '坎', trigramName: '坎为水', trigramSymbol: '☵', couple: 2, coupleName: '照海', direction: '西北' },
    2: { name: '照海', code: 'KI6', trigram: '坤', trigramName: '坤为地', trigramSymbol: '☷', couple: 1, coupleName: '申脉', direction: '西南' },
    3: { name: '外关', code: 'TE5', trigram: '震', trigramName: '震为雷', trigramSymbol: '☳', couple: 8, coupleName: '内关', direction: '东' },
    4: { name: '足临泣', code: 'GB41', trigram: '巽', trigramName: '巽为风', trigramSymbol: '☴', couple: 6, coupleName: '公孙', direction: '东南' },
    5: { name: '照海', code: 'KI6', trigram: '坤', trigramName: '坤为地', trigramSymbol: '☷', couple: 1, coupleName: '申脉', direction: '西南' },
    6: { name: '公孙', code: 'SP4', trigram: '乾', trigramName: '乾为天', trigramSymbol: '☰', couple: 4, coupleName: '足临泣', direction: '西北' },
    7: { name: '后溪', code: 'SI3', trigram: '兑', trigramName: '兑为泽', trigramSymbol: '☱', couple: 9, coupleName: '列缺', direction: '西' },
    8: { name: '内关', code: 'PC6', trigram: '艮', trigramName: '艮为山', trigramSymbol: '☶', couple: 3, coupleName: '外关', direction: '东北' },
    9: { name: '列缺', code: 'LU7', trigram: '离', trigramName: '离为火', trigramSymbol: '☲', couple: 7, coupleName: '后溪', direction: '南' }
};

// =================== 五门十变 ===================
// 天干合化五行配经络:
// 甲己合化土 → 胆经(甲)与脾经(己)  土运
// 乙庚合化金 → 肝经(乙)与大肠经(庚) 金运
// 丙辛合化水 → 小肠经(丙)与肺经(辛) 水运
// 丁壬合化木 → 心经(丁)与膀胱经(壬) 木运
// 戊癸合化火 → 胃经(戊)与肾经(癸) 火运
const WUMEN_HE_INFO = {
    '甲': { partnerGan: '己', huaWuxing: '土', meridian1: '足少阳胆经', meridian2: '足太阴脾经', desc: '胆脾合化土，治脾胃肝胆病' },
    '己': { partnerGan: '甲', huaWuxing: '土', meridian1: '足太阴脾经', meridian2: '足少阳胆经', desc: '脾胆合化土，治脾胃肝胆病' },
    '乙': { partnerGan: '庚', huaWuxing: '金', meridian1: '足厥阴肝经', meridian2: '手阳明大肠经', desc: '肝大肠合化金，治肝肠肺病' },
    '庚': { partnerGan: '乙', huaWuxing: '金', meridian1: '手阳明大肠经', meridian2: '足厥阴肝经', desc: '大肠肝合化金，治肝肠肺病' },
    '丙': { partnerGan: '辛', huaWuxing: '水', meridian1: '手太阳小肠经', meridian2: '手太阴肺经', desc: '小肠肺合化水，治心肾肺病' },
    '辛': { partnerGan: '丙', huaWuxing: '水', meridian1: '手太阴肺经', meridian2: '手太阳小肠经', desc: '肺小肠合化水，治心肾肺病' },
    '丁': { partnerGan: '壬', huaWuxing: '木', meridian1: '手少阴心经', meridian2: '足太阳膀胱经', desc: '心膀胱合化木，治心脑肝肾' },
    '壬': { partnerGan: '丁', huaWuxing: '木', meridian1: '足太阳膀胱经', meridian2: '手少阴心经', desc: '膀胱心合化木，治心脑肝肾' },
    '戊': { partnerGan: '癸', huaWuxing: '火', meridian1: '足阳明胃经', meridian2: '足少阴肾经', desc: '胃肾合化火，治脾胃肾命门' },
    '癸': { partnerGan: '戊', huaWuxing: '火', meridian1: '足少阴肾经', meridian2: '足阳明胃经', desc: '肾胃合化火，治脾胃肾命门' }
};

// =================== 辅助函数 ===================
function getWuXingName(idx) {
    return WU_XING_NAMES[idx] || '';
}

function getWuXingColor(idx) {
    return WU_XING_COLORS[idx] || '';
}

function getGanYinYang(ganIdx) {
    return GAN_YIN_YANG[ganIdx] === 1 ? '阳' : '阴';
}

function getZhiYinYang(zhiIdx) {
    return ZHI_YIN_YANG[zhiIdx] === 1 ? '阳' : '阴';
}

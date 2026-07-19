/**
 * acupoint.js - 灵龟八法、子午流注开穴计算
 * 包含：灵龟八法(含配穴/卦性)、纳甲法(含互用穴)、纳子法(含主配穴/补泻)、五门十变
 */

/**
 * 灵龟八法开穴计算（含配穴和卦性）
 */
function getLingGuiBaFa(date, shiChenGanZhi) {
    const dayGZ = getDayGanZhi(date);
    const dayGan = dayGZ.gan;
    const dayZhi = dayGZ.zhi;

    const hourGan = shiChenGanZhi.gan;
    const hourZhi = shiChenGanZhi.zhi;

    // 日干支基数
    const dayGanNum = LINGGUI_DAY_GAN_NUM[dayGan] || 0;
    const dayZhiNum = LINGGUI_DAY_ZHI_NUM[dayZhi] || 0;
    const dayBase = (dayGanNum + dayZhiNum) % 9;
    const dayBaseFinal = dayBase === 0 ? 9 : dayBase;

    // 时干支基数
    const hourGanNum = LINGGUI_HOUR_GAN_NUM[hourGan] || 0;
    const hourZhiNum = LINGGUI_HOUR_ZHI_NUM[hourZhi] || 0;
    const hourBase = (hourGanNum + hourZhiNum) % 9;
    const hourBaseFinal = hourBase === 0 ? 9 : hourBase;

    // 开穴数
    const openNum = (dayBaseFinal + hourBaseFinal) % 9;
    const openNumFinal = openNum === 0 ? 9 : openNum;

    const acupoint = LINGGUI_ACUPOINTS[openNumFinal];
    const fullInfo = LINGGUI_FULL_INFO[openNumFinal];

    // 配穴（夫妇配合）
    let coupleInfo = null;
    if (fullInfo && fullInfo.couple) {
        const coupleData = LINGGUI_ACUPOINTS[fullInfo.couple];
        const coupleFull = LINGGUI_FULL_INFO[fullInfo.couple];
        coupleInfo = {
            num: fullInfo.couple,
            name: coupleData.name,
            code: coupleData.code,
            meridian: coupleData.meridian,
            trigram: coupleFull.trigram,
            trigramSymbol: coupleFull.trigramSymbol,
            vessel: coupleData.vessel,
            relation: `主客配穴：${acupoint.name}(${acupoint.code}) ↔ ${coupleData.name}(${coupleData.code})`
        };
    }

    return {
        openNum: openNumFinal,
        acupoint: acupoint,
        fullInfo: fullInfo,
        dayBase: dayBaseFinal,
        hourBase: hourBaseFinal,
        calculation: `${dayGanNum}+${dayZhiNum}=${dayGanNum + dayZhiNum} → ${dayBaseFinal}; ${hourGanNum}+${hourZhiNum}=${hourGanNum + hourZhiNum} → ${hourBaseFinal}; ${dayBaseFinal}+${hourBaseFinal}=${openNumFinal}`,
        trigram: fullInfo ? fullInfo.trigram : '',
        trigramName: fullInfo ? fullInfo.trigramName : '',
        trigramSymbol: fullInfo ? fullInfo.trigramSymbol : '',
        couple: coupleInfo,
        description: acupoint ? `${acupoint.name}(${acupoint.code}) - ${acupoint.meridian}，通${acupoint.vessel}，位于${acupoint.location}` : ''
    };
}

/**
 * 子午流注纳甲法 - 根据日干和时辰计算开穴（含互用穴）
 * 原理：按日干取对应时辰的井荥输经合等开穴
 * 互用穴：合日日干的同一时辰穴位
 */
function getZiWuLiuZhuNaJia(date, shiChenGanZhi) {
    const dayGZ = getDayGanZhi(date);
    const dayGan = dayGZ.gan;
    const hourZhiIdx = shiChenGanZhi.zhiIdx;

    const dayPoints = ZIWU_NAJIA_POINTS[dayGan];
    const point = dayPoints ? (dayPoints[hourZhiIdx] || null) : null;

    // 互用穴：阳日阴时或阴日阳时无穴，取合日对应时辰穴位
    const dayGanIdx = TIAN_GAN.indexOf(dayGan);
    const isYangDay = [0, 2, 4, 6, 8].includes(dayGanIdx);
    const isYangHour = [0, 2, 4, 6, 8, 10].includes(hourZhiIdx);
    const partnerGan = NAJIA_HE_PAIRS[dayGan];
    let huyongPoint = null;
    if (partnerGan && point === null && ((isYangDay && !isYangHour) || (!isYangDay && isYangHour))) {
        const partnerPoints = ZIWU_NAJIA_POINTS[partnerGan];
        huyongPoint = partnerPoints ? (partnerPoints[hourZhiIdx] || null) : null;
    }

    return {
        mainPoint: point,
        huyongPoint: huyongPoint,
        huyongGan: partnerGan,
        huyongInfo: NAJIA_HUYONG_INFO[dayGan] || '',
        hasHuyong: point === null && huyongPoint !== null
    };
}

/**
 * 子午流注纳子法 - 根据时辰获取本经开穴（含主配穴、五输穴五行、补泻穴）
 */
function getZiWuLiuZhuNaZi(shiChenIdx) {
    if (shiChenIdx < 0 || shiChenIdx >= 12) return null;

    const naziPoint = ZIWU_NAZI_POINTS[shiChenIdx];
    const pairData = NAZI_PAIR_POINTS[shiChenIdx];
    if (!naziPoint || !pairData) return null;

    const isYangMeridian = [0, 3, 4, 7, 8, 11].includes(shiChenIdx);

    // 五输穴五行
    const wellWX = getShuPointWuxing(shiChenIdx, 'well');
    const springWX = getShuPointWuxing(shiChenIdx, 'spring');
    const streamWX = getShuPointWuxing(shiChenIdx, 'stream');
    const riverWX = getShuPointWuxing(shiChenIdx, 'river');
    const seaWX = getShuPointWuxing(shiChenIdx, 'sea');

    return {
        meridian: naziPoint.meridian,
        shiChen: SHI_CHEN[shiChenIdx].name,
        well: { ...naziPoint.well, wuXing: wellWX },
        spring: { ...naziPoint.spring, wuXing: springWX },
        stream: { ...naziPoint.stream, wuXing: streamWX },
        river: { ...naziPoint.river, wuXing: riverWX },
        sea: { ...naziPoint.sea, wuXing: seaWX },
        yuan: naziPoint.yuan,
        isYangMeridian: isYangMeridian,
        mainPoint: pairData.main,
        accompanyPoint: pairData.accompany,
        supplementPoint: pairData.supplement,
        drainPoint: pairData.drain,
        description: `${SHI_CHEN[shiChenIdx].name} ${naziPoint.meridian}当令，主穴${pairData.main.name}(${pairData.main.code})，配穴${pairData.accompany.name}(${pairData.accompany.code})`
    };
}

/**
 * 五门十变 - 根据日干计算合化关系
 * 天干合化 → 对应经络互用
 */
function getWuMenShiBian(date) {
    const dayGZ = getDayGanZhi(date);
    const dayGan = dayGZ.gan;
    const info = WUMEN_HE_INFO[dayGan];
    if (!info) return null;

    // 获取合化干支对应的经络五输穴
    const partnerGan = info.partnerGan;

    return {
        dayGan: dayGan,
        partnerGan: partnerGan,
        huaWuxing: info.huaWuxing,
        meridian1: info.meridian1,
        meridian2: info.meridian2,
        description: info.desc,
        formula: `${dayGan}(${info.meridian1}) + ${partnerGan}(${info.meridian2}) → 合化${info.huaWuxing}`
    };
}

/**
 * 获取某个日期所有时辰的完整穴位信息
 */
function getAllHourAcupointInfo(date) {
    const result = [];

    for (let h = 0; h < 24; h += 2) {
        const calcHour = (h === 0) ? 23 : h - 1;
        const tempDate = new Date(date);
        if (h === 0) {
            tempDate.setHours(23, 0, 0, 0);
        } else {
            tempDate.setHours(calcHour, 0, 0, 0);
        }

        const hgz = getHourGanZhi(tempDate, calcHour);
        const shiChenIdx = hgz.zhiIdx;

        const linggui = getLingGuiBaFa(date, hgz);
        const najia = getZiWuLiuZhuNaJia(date, hgz);
        const nazi = getZiWuLiuZhuNaZi(shiChenIdx);

        // 时间范围
        let timeRange = '';
        switch (shiChenIdx) {
            case 0: timeRange = '23:00-01:00'; break;
            case 1: timeRange = '01:00-03:00'; break;
            case 2: timeRange = '03:00-05:00'; break;
            case 3: timeRange = '05:00-07:00'; break;
            case 4: timeRange = '07:00-09:00'; break;
            case 5: timeRange = '09:00-11:00'; break;
            case 6: timeRange = '11:00-13:00'; break;
            case 7: timeRange = '13:00-15:00'; break;
            case 8: timeRange = '15:00-17:00'; break;
            case 9: timeRange = '17:00-19:00'; break;
            case 10: timeRange = '19:00-21:00'; break;
            case 11: timeRange = '21:00-23:00'; break;
        }

        // 时干属性
        const shiGanWX = getGanWuXing(hgz.ganIdx);
        const shiZhiWX = getZhiWuXing(hgz.zhiIdx);

        result.push({
            shiChenIdx: shiChenIdx,
            shiChenName: SHI_CHEN[shiChenIdx].name,
            timeRange: timeRange,
            ganzhi: hgz.ganzhi,
            shiGan: hgz.gan,
            shiZhi: hgz.zhi,
            shiGanYinYang: shiGanWX.yinYang,
            shiGanWuXing: shiGanWX.wuXing,
            shiZhiWuXing: shiZhiWX.wuXing,
            shiZhiYinYang: shiZhiWX.yinYang,
            meridian: SHI_CHEN[shiChenIdx].meridian,
            meridianCN: SHI_CHEN[shiChenIdx].meridianCN,
            linggui: linggui,
            najia: najia,
            nazi: nazi,
            wuXingGan: shiGanWX,
            wuXingZhi: shiZhiWX
        });
    }

    return result;
}

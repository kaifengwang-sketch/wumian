
  // ---- 结局里交代同伴的去向 ----
  function others(s) {
    const out = [];
    if (w(s, 'qin')) out.push('秦姐坐在你旁边，手里一直攥着那张锡纸地图。车开出镇子的时候，她把地图撕成碎片，从窗口撒了出去。');
    else if (s.f.qinCaught) out.push('三个月后，警察进了石瓮村，在冯家的地窖里找到了秦姐。她瘦得脱了相，见到穿警服的人，说的第一句话是：“我一口都没咽。”');
    if (w(s, 'tang')) out.push('小棠靠着车窗睡着了，脚踝肿得发亮。睡梦里，她一直攥着你的衣角。');
    else if (s.f.tangLeft) out.push('你在派出所说的第一件事，就是鹰嘴崖下面那间守林屋。警察找到小棠的时候，她还绑在床腿上。她说她一直在数日子，数到第十一天，门开了。');
    if (s.f.tied) out.push('警察在后山坟地的一根竹竿上，找到了半截皮带。阿芸不见了。村里人说，村长家从来没有过女儿。');
    else if (s.f.burnBridge) out.push('鹰嘴崖的栈道烧断了，后来一直没修。');
    else if (s.exposed || s.f.know || s.f.pleaded) out.push('警察进村那天，村长家的女儿阿芸不在家。有人说她去县城读书了，有人说她嫁到了山外。');
    return out;
  }
  const E = {
    E1: { num: 1, title: '出山', tag: '好结局',
      text: (s) => P(
        s.f.shout ? '你冲上车，冲司机喊了一嗓子。司机愣了一秒，猛地一拍按钮，车门“嗤”地关上了。冯有贵扑过来拍车门，车上一个卖菜的大爷站起来，用扁担顶住了车窗。车开了。' : '你们上了车。司机看了一眼你们一身的泥，什么也没问。',
        '春妮坐在最后一排，豆子枕在她腿上睡着了。她摸着豆子的头发，一遍一遍地，很小声地唱：“篱笆开花一朵朵，阿妈在河那边坐……”',
        ...others(s),
        '车开出石门镇的时候，太阳刚好翻过山头。',
        '后来你在手机上刷到一条新闻：某县破获一起拐卖妇女案，解救被拐妇女十一人。新闻里没写村子的名字。',
        '你左手腕上那圈红印，过了很久才淡下去。从那以后，陌生人递过来的水，你一口都没再喝过。',
      ) },
    E2: { num: 2, title: '天亮', tag: '好结局',
      text: (s) => P(
        s.f.shout ? '你冲上车，冲司机喊了一嗓子。司机愣了一秒，猛地一拍按钮。冯有贵扑过来拍车门，车上一个卖菜的大爷站起来，用扁担顶住了车窗。' : '你们走到车门口。',
        '豆子一直把你送到车门口，然后松开了手。',
        '“我娘还在里面。”他说。',
        '你想拉住他，他已经转身跑了，瘦瘦的一条影子，往山上跑，越来越小。',
        ...others(s),
        '三个月后，你跟着警察回了石瓮村。祠堂还在，奶奶还坐在那儿。春妮坐在门口剥豆子，冲每个人笑，冲你也笑。',
        '豆子从屋里冲出来，一头撞进你怀里。他长高了一点，还是那么瘦。',
        '他说：“姐姐，我娘的脸，还挂在墙上。”',
      ) },
    E3: { num: 3, title: '第七夜', tag: '坏结局',
      text: (s) => P(
        s.endWhy === 'gate' ? '村口那只最大的铃，在你离它还有十几步的时候就响了。村长从门洞里站起来，手里什么都没拿。他不用拿。他身后的女人们已经围上来了。' : '他们追上了你。没有人打你，也没有人骂你。女人们围上来，一边一个挽住你的胳膊，像挽着一个刚回娘家的姐妹，哼着那支调子，把你领回了村里。',
        '第七天晚上，祠堂里点满了灯。',
        '冯婆用一块湿白布盖住你的脸。布是凉的，贴上来的时候，你闻到了灯油和香灰的味道。你听见有人在念什么，听不懂。你只觉得脸上越来越轻，越来越轻。',
        '第二天下午，你坐在冯家门口剥豆子。太阳很好，你一直在笑，嘴里哼着一支调子，你也不知道是哪里学来的。',
        '一个瘦瘦的小男孩从门口走过去，看了你很久。你冲他笑了笑，跟冲谁都一样。',
        '过了几天，你看见他蹲在柴房后面，往门缝里塞了一把生锈的钥匙。你笑着看着他，不知道他在干什么。',
      ) },
    E4: { num: 4, title: '她', tag: '坏结局',
      text: (s) => P(
        '火把涌上栈道。你们被堵在最窄的那一段，前面是悬崖，后面是人。',
        s.f.pleaded ? '阿芸站在人群最后面，没有再看你。' : '阿芸走在人群最前面，把那只小铜铃揣回了袖子里。',
        '后来你才知道，她是村长的女儿，生在石瓮村，长在石瓮村。每回有新娘想跑，她就去柴房里坐几天，哭几天，等着有人来救她。',
        '第七天晚上，你的脸挂到了祠堂的墙上，挂在最底下那一排。',
        '一个月后，又有一个姑娘被关进了冯家隔壁。半夜，她听见柴房里有人在哭，哭得很伤心。',
        '“带我走，”那个声音说，“求你了，求求你……”',
      ) },
    E5: { num: 5, title: '晚一班', tag: '还算好的结局',
      text: (s) => P(
        s.t > BUS
          ? '头班车已经走了。摩托车的声音从山路上压下来，你站在镇口，不知道该往哪儿跑。\n\n小卖部的卷帘门“哗啦”拉起来一半。一个五十多岁的阿姨探出头，看了你一眼，又看了你手腕上那圈红印一眼，一把把你们拽了进去，“哗啦”又把门拉了下来。'
          : '你转身扎进了车站边上的小卖部。柜台后面的阿姨正要开门做生意，她看了你一眼，又看了你手腕上那圈红印一眼，“哗啦”一声把卷帘门拉到了底。',
        '“别出声。”她说。',
        '你们挤在货架后面，听着摩托车在门外停下，有人拍门，拍了很久，骂了几句，走了。',
        '阿姨拿起柜台上的座机，拨了 110。七点半，警车到了。',
        ...others(s),
        '临走的时候，你问阿姨为什么帮你们。她撸起左手的袖子。手腕上有一圈很淡很淡的红印，跟你的一模一样。',
        '“二十年前，”她说，“我也是从山上跑下来的。”',
      ) },
    E6: { num: 6, title: '灯', tag: '最好的结局',
      text: (s) => P(
        '天亮的时候，从石瓮村走出来的女人有二十三个。',
        '她们光着脚，走在通往石门镇的山路上，有人扶着有人，有人背着有人。有人一边走一边念叨自己老家的门牌号，怕一停下来就又忘了。',
        '春妮一直攥着豆子的手。走一段，她就停下来，捧着豆子的脸看一会儿，再接着走。',
        ...others(s),
        '后来新闻说，石瓮村祠堂失火，牵出一起持续二十多年的拐卖妇女案。',
        '新闻配了一张照片：祠堂烧剩下的半面墙，墙上什么都没有。',
        '你把那张照片存了下来。有时候半夜醒过来，你会摸一摸自己的脸，确认它还在。',
      ) },
  };
  const ENDING_ORDER = ['E1', 'E2', 'E3', 'E4', 'E5', 'E6'];

  // ---- 对外接口 ----
  function enter(s, id) {
    s.from = s.node;
    s.node = id;
    if (!s.seen.includes(id)) s.seen.push(id);
    if (N[id].enter) N[id].enter(s);
  }
  function endGame(s, id) {
    const e = E[id];
    s.ending = { id, num: e.num, title: e.title, tag: e.tag, text: e.text(s), t: s.t };
  }
  const visible = (s, n) => n.choices.filter((c) => !c.when || c.when(s));
  function newGame() {
    const s = {
      v: 1, node: '', from: '', t: 10, alarm: 0, rang: 0, dinged: false, string: 'on',
      f: {}, w: { dou: true }, clues: [], seen: [], note: '', ending: null, endWhy: '', exposed: false, hist: [],
    };
    enter(s, '01');
    return s;
  }
  function view(s) {
    if (s.ending) return { mode: 'ending', ...s.ending };
    const n = N[s.node];
    return {
      mode: 'node', id: n.id, title: n.title, bg: n.bg, note: s.note,
      text: typeof n.text === 'function' ? n.text(s) : n.text,
      choices: visible(s, n).map((c) => c.label),
    };
  }
  function choose(s, i) {
    if (s.ending) return;
    const c = visible(s, N[s.node])[i];
    if (!c) return;
    s.hist.push(JSON.stringify({ ...s, hist: [] }));
    if (s.hist.length > 60) s.hist.shift();
    const rang = s.rang;
    s.note = '';
    const next = c.go(s);
    if (next[0] === 'E') endGame(s, next);
    else enter(s, next);
    s.dinged = s.rang > rang;
  }
  // 退一步：回到上一个选择之前
  function undo(s) {
    if (!s.hist.length) return s;
    const prev = JSON.parse(s.hist[s.hist.length - 1]);
    prev.hist = s.hist.slice(0, -1);
    prev.dinged = false;
    return prev;
  }
  const bgOf = (s) => (s.ending ? endBg(s.ending.id) : N[s.node].bg);
  const endBg = (id) => ({ E1: 'dawn', E2: 'town', E3: 'shrine', E4: 'masks', E5: 'town', E6: 'fire' }[id]);

  return { newGame, view, choose, undo, hhmm, bgOf, BUS, CLUES, ENDINGS: E, ENDING_ORDER, N };
})();
globalThis.Story = Story;
/*CORE-END*/

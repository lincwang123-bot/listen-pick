const exactHints = new Map([
  ["a girl is reading", "一个女孩正在读书。"],
  ["a boy is drinking water", "一个男孩正在喝水。"],
  ["a boy is eating an apple", "一个男孩正在吃苹果。"],
  ["a dog is sleeping", "一只狗正在睡觉。"],
  ["the baby is kicking both feet", "宝宝正在踢动双脚。"],
  ["the baby is holding a sock in one hand", "宝宝一只手里拿着一只袜子。"],
  ["the three babies are triplets", "三个宝宝是三胞胎。"],
  ["the cat is on the chair", "猫在椅子上。"],
  ["the cat is under the table", "猫在桌子下面。"],
  ["the baby is sitting", "宝宝坐着。"],
  ["the baby is sleeping", "宝宝正在睡觉。"],
  ["the baby is laughing", "宝宝正在笑。"],
  ["the teacher is singing", "老师正在唱歌。"],
  ["the teacher is writing", "老师正在写字。"],
  ["the dog is running", "狗正在跑。"],
  ["the dog is sitting", "狗正坐着。"],
  ["the girl is washing her hands", "女孩正在洗手。"],
  ["the girl is brushing her teeth", "女孩正在刷牙。"],
  ["the boy is kicking a ball", "男孩正在踢球。"],
  ["the boy is flying a kite", "男孩正在放风筝。"],
  ["the bird is in the sky", "鸟在天空中。"],
  ["the bird is in the tree", "鸟在树上。"],
  ["the mother is cooking", "妈妈正在做饭。"],
  ["the mother is shopping", "妈妈正在购物。"],
  ["the children are drawing", "孩子们正在画画。"],
  ["the children are dancing", "孩子们正在跳舞。"],
  ["the duck is swimming", "鸭子正在游泳。"],
  ["the duck is jumping", "鸭子正在跳。"],
  ["the boy is closing the window", "男孩正在关窗户。"],
  ["the boy is opening the door", "男孩正在开门。"],
  ["the girl is wearing a red hat", "女孩戴着一顶红帽子。"],
  ["the girl is wearing blue shoes", "女孩穿着蓝色鞋子。"],
  ["the family is watching tv", "一家人正在看电视。"],
  ["the family is having dinner", "一家人正在吃晚饭。"],
  ["she is the baby's mother", "她是宝宝的妈妈。"],
  ["she is the girl's mother", "她是女孩的妈妈。"],
  ["he is the girl's father", "他是女孩的爸爸。"],
  ["he is the baby's father", "他是宝宝的爸爸。"],
  ["she is the girl's sister", "她是女孩的姐姐。"],
  ["she is the boy's sister", "她是男孩的姐姐。"],
  ["he is the baby's brother", "他是宝宝的哥哥。"],
  ["he is the boy's brother", "他是男孩的哥哥。"],
  ["the mother and father are parents", "妈妈和爸爸是父母。"],
  ["the father and father are parents", "两个爸爸是父母。"],
  ["the girl and boy are siblings", "女孩和男孩是兄弟姐妹。"],
  ["the boy and boy are siblings", "两个男孩是兄弟。"],
  ["this is a dining room", "这是一个餐厅。"],
  ["this is a living room", "这是一个客厅。"],
  ["the cook is cooking in a home kitchen", "厨师正在家里的厨房做饭。"],
  ["the cook is cooking in the restaurant kitchen", "厨师正在餐厅厨房做饭。"],
  ["the boy is looking down", "男孩正在向下看。"],
  ["the boy is looking up", "男孩正在向上看。"],
  ["the child is drying feet with a towel", "孩子正在用毛巾擦干脚。"],
  ["the child is drying hands with a towel", "孩子正在用毛巾擦干手。"],
  ["the child likes dancing", "孩子喜欢跳舞。"],
  ["the child likes singing", "孩子喜欢唱歌。"],
  ["the girl likes reading with a friend", "女孩喜欢和朋友一起读书。"],
  ["the girl likes drawing with a friend", "女孩喜欢和朋友一起画画。"],
  ["the boy likes playing blocks with a classmate", "男孩喜欢和同学一起玩积木。"],
  ["the boy likes playing ball with a classmate", "男孩喜欢和同学一起玩球。"],
  ["the boy is carrying a ball with a friend", "男孩正和朋友一起拿着球。"],
  ["the boy is carrying a bag with a friend", "男孩正和朋友一起拿着书包。"],
  ["the plate has fruit on it", "盘子里有水果。"],
  ["the plate has rice on it", "盘子里有米饭。"],
  ["the bowl has noodles in it", "碗里有面条。"],
  ["the bowl has soup in it", "碗里有汤。"],
  ["the girl is brushing hair with a comb", "女孩正在用梳子梳头发。"],
  ["the girl is brushing teeth with a comb", "女孩正在用梳子刷牙。"],
  ["the lunch box has rice inside", "午餐盒里有米饭。"],
  ["the lunch box has socks inside", "午餐盒里有袜子。"],
  ["the toy box has noodles inside", "玩具盒里有面条。"],
  ["the toy box has blocks inside", "玩具盒里有积木。"],
  ["the children are washing hands before lunch", "孩子们正在午饭前洗手。"],
  ["the children are washing hands after lunch", "孩子们正在午饭后洗手。"],
  ["the child is holding a classmate's hand", "孩子正牵着同学的手。"],
  ["the child is holding a parent's hand", "孩子正牵着家长的手。"],
  ["the child is washing shoes after school", "孩子正在放学后洗鞋子。"],
  ["the child is washing hands after school", "孩子正在放学后洗手。"],
  ["the child is carrying shoes to class", "孩子正拿着鞋子去上课。"],
  ["the child is carrying books to class", "孩子正拿着书去上课。"],
  ["the child is making the bed", "孩子正在整理床铺。"],
  ["the girl is making the bed", "女孩正在整理床铺。"],
  ["the child is sleeping in the bed", "孩子正在床上睡觉。"],
  ["the child is sleeping in bed", "孩子正在床上睡觉。"],
  ["the girl is jumping on the bed", "女孩正在床上跳。"],
  ["the boy is putting on a shirt", "男孩正在穿衬衫。"],
  ["the boy is taking off a shirt", "男孩正在脱衬衫。"],
  ["the child is packing a schoolbag", "孩子正在整理书包。"],
  ["the child is emptying a schoolbag", "孩子正在把书包里的东西拿出来。"],
  ["the boy is putting a bottle in the bag", "男孩正在把水瓶放进书包里。"],
  ["the girl is putting a spoon in a bowl", "女孩正在把勺子放进碗里。"],
  ["the girl is putting a bottle in the bag", "女孩正在把水瓶放进书包里。"],
  ["the girl is taking a bottle out of the bag", "女孩正在从书包里拿出水瓶。"],
  ["there is a book on the library table", "图书馆的桌子上有一本书。"],
  ["there is a book on the classroom table", "教室的桌子上有一本书。"],
  ["there are many books on the library shelf", "图书馆书架上有很多书。"],
  ["there are many books on the library table", "图书馆桌子上有很多书。"],
  ["the children like lunch together", "孩子们喜欢一起吃午饭。"],
  ["the children like snacks together", "孩子们喜欢一起吃点心。"],
  ["the boy likes reading animal books", "男孩喜欢读动物书。"],
  ["the boy likes reading vehicle books", "男孩喜欢读交通工具书。"],
  ["the friends like playing together", "朋友们喜欢一起玩。"],
  ["the friends like sitting apart", "朋友们喜欢分开坐。"],
  ["the boy is writing at the back desk", "男孩正在后排课桌写字。"],
  ["the boy is writing at the front desk", "男孩正在前排课桌写字。"],
  ["the child is washing hands before putting on a shirt", "孩子正在穿衬衫前洗手。"],
  ["the child is washing feet before putting on a shirt", "孩子正在穿衬衫前洗脚。"],
  ["the girl is brushing teeth before wearing a dress", "女孩正在穿连衣裙前刷牙。"],
  ["the girl is brushing hair before wearing a dress", "女孩正在穿连衣裙前梳头发。"],
  ["the girl is looking at a toothbrush in the mirror", "女孩正在镜子里看牙刷。"],
  ["the girl is looking at shoes in the mirror", "女孩正在镜子里看鞋子。"],
  ["the boy is raising one hand with a glove", "男孩举起一只戴着手套的手。"],
  ["the boy is raising one foot with a glove", "男孩举起一只戴着手套的脚。"],
  ["the children are eating lunch together", "孩子们正在一起吃午饭。"],
  ["the children are eating breakfast together", "孩子们正在一起吃早餐。"],
  ["the child is washing feet after school", "孩子正在放学后洗脚。"],
  ["the wind is moving the trees", "风正在吹动树。"],
  ["the trees are still", "树没有晃动。"]
]);

const numbers = new Map([
  ["one", "一"],
  ["two", "两"],
  ["three", "三"],
  ["four", "四"],
  ["five", "五"],
  ["six", "六"],
  ["seven", "七"],
  ["eight", "八"],
  ["nine", "九"],
  ["ten", "十"],
  ["both", "两"]
]);

const colors = new Map([
  ["red", "红色"],
  ["blue", "蓝色"],
  ["yellow", "黄色"],
  ["green", "绿色"],
  ["black", "黑色"],
  ["white", "白色"],
  ["brown", "棕色"],
  ["pink", "粉色"],
  ["purple", "紫色"],
  ["orange", "橙色"]
]);

const nouns = new Map([
  ["girl", "女孩"],
  ["boy", "男孩"],
  ["baby", "宝宝"],
  ["child", "孩子"],
  ["children", "孩子们"],
  ["teacher", "老师"],
  ["student", "学生"],
  ["students", "学生们"],
  ["class", "班级"],
  ["classmate", "同学"],
  ["classmates", "同学们"],
  ["friend", "朋友"],
  ["friends", "朋友们"],
  ["man", "男人"],
  ["woman", "女人"],
  ["mother", "妈妈"],
  ["father", "爸爸"],
  ["sister", "姐姐"],
  ["brother", "哥哥"],
  ["grandma", "奶奶"],
  ["grandpa", "爷爷"],
  ["family", "一家人"],
  ["parent", "家长"],
  ["parents", "父母"],
  ["cat", "猫"],
  ["cats", "猫"],
  ["dog", "狗"],
  ["dogs", "狗"],
  ["bird", "鸟"],
  ["birds", "鸟"],
  ["fish", "鱼"],
  ["rabbit", "兔子"],
  ["rabbits", "兔子"],
  ["duck", "鸭子"],
  ["ducks", "鸭子"],
  ["horse", "马"],
  ["cow", "奶牛"],
  ["sheep", "羊"],
  ["lion", "狮子"],
  ["elephant", "大象"],
  ["panda", "熊猫"],
  ["apple", "苹果"],
  ["apples", "苹果"],
  ["banana", "香蕉"],
  ["bananas", "香蕉"],
  ["grapes", "葡萄"],
  ["rice", "米饭"],
  ["noodles", "面条"],
  ["milk", "牛奶"],
  ["bread", "面包"],
  ["jam", "果酱"],
  ["butter", "黄油"],
  ["soup", "汤"],
  ["water", "水"],
  ["breakfast", "早餐"],
  ["lunch", "午餐"],
  ["dinner", "晚餐"],
  ["book", "书"],
  ["books", "书"],
  ["picture book", "图画书"],
  ["bag", "书包"],
  ["schoolbag", "书包"],
  ["chair", "椅子"],
  ["table", "桌子"],
  ["desk", "课桌"],
  ["desks", "课桌"],
  ["ball", "球"],
  ["balls", "球"],
  ["toy", "玩具"],
  ["toys", "玩具"],
  ["toy box", "玩具盒"],
  ["cup", "杯子"],
  ["cups", "杯子"],
  ["box", "盒子"],
  ["boxes", "盒子"],
  ["kite", "风筝"],
  ["kites", "风筝"],
  ["star", "星星"],
  ["stars", "星星"],
  ["circle", "圆形"],
  ["circles", "圆形"],
  ["square", "正方形"],
  ["squares", "正方形"],
  ["triangle", "三角形"],
  ["heart", "爱心"],
  ["hearts", "爱心"],
  ["car", "小汽车"],
  ["bus", "公交车"],
  ["train", "火车"],
  ["bike", "自行车"],
  ["bicycle", "自行车"],
  ["football", "足球"],
  ["basketball", "篮球"],
  ["blocks", "积木"],
  ["shirt", "衬衫"],
  ["trousers", "裤子"],
  ["skirt", "裙子"],
  ["dress", "连衣裙"],
  ["coat", "外套"],
  ["jacket", "夹克"],
  ["sweater", "毛衣"],
  ["hat", "帽子"],
  ["cap", "鸭舌帽"],
  ["shoes", "鞋子"],
  ["shoe", "鞋子"],
  ["socks", "袜子"],
  ["boots", "靴子"],
  ["slippers", "拖鞋"],
  ["pencil", "铅笔"],
  ["pencils", "铅笔"],
  ["ruler", "尺子"],
  ["rulers", "尺子"],
  ["eraser", "橡皮"],
  ["notebook", "笔记本"],
  ["toothbrush", "牙刷"],
  ["comb", "梳子"],
  ["towel", "毛巾"],
  ["soap", "肥皂"],
  ["bottle", "水瓶"],
  ["lunch box", "午餐盒"],
  ["window", "窗户"],
  ["door", "门"],
  ["board", "黑板"],
  ["mirror", "镜子"],
  ["sink", "洗手池"],
  ["bed", "床"],
  ["sofa", "沙发"],
  ["shelf", "书架"],
  ["tree", "树"],
  ["park", "公园"],
  ["zoo", "动物园"],
  ["library", "图书馆"],
  ["playground", "操场"],
  ["slide", "滑梯"],
  ["swing", "秋千"],
  ["sandbox", "沙池"],
  ["seesaw", "跷跷板"],
  ["umbrella", "雨伞"],
  ["raincoat", "雨衣"],
  ["snow", "雪"]
]);

const adjectives = new Map([
  ["big", "大的"],
  ["small", "小的"],
  ["little", "小的"],
  ["long", "长的"],
  ["short", "短的"],
  ["clean", "干净的"],
  ["wet", "湿的"],
  ["dry", "干的"],
  ["open", "打开的"],
  ["closed", "关上的"],
  ["full", "满的"],
  ["empty", "空的"],
  ["soft", "柔软的"],
  ["warm", "温暖的"],
  ["heavy", "重的"],
  ["ready", "准备好的"],
  ["quiet", "安静的"],
  ["sunny", "晴朗的"],
  ["rainy", "下雨的"],
  ["snowy", "下雪的"],
  ["windy", "刮风的"],
  ["happy", "开心的"],
  ["sad", "难过的"],
  ["angry", "生气的"],
  ["surprised", "惊讶的"],
  ["tired", "累的"],
  ["excited", "兴奋的"]
]);

const actions = new Map([
  ["running", "跑"],
  ["walking", "走路"],
  ["jumping", "跳"],
  ["dancing", "跳舞"],
  ["reading", "读书"],
  ["writing", "写字"],
  ["drawing", "画画"],
  ["building", "搭建"],
  ["eating", "吃东西"],
  ["drinking", "喝水"],
  ["sleeping", "睡觉"],
  ["swimming", "游泳"],
  ["sitting", "坐着"],
  ["standing", "站着"],
  ["singing", "唱歌"],
  ["laughing", "笑"],
  ["lowering", "放下"],
  ["washing", "洗"],
  ["brushing", "刷"],
  ["touching", "摸"],
  ["holding", "拿着"],
  ["wearing", "穿着"],
  ["opening", "打开"],
  ["closing", "关上"],
  ["kicking", "踢"],
  ["flying", "放"],
  ["cooking", "做饭"],
  ["shopping", "购物"],
  ["clapping", "拍手"],
  ["pointing", "指"],
  ["raising", "举起"],
  ["covering", "捂住"],
  ["stretching", "伸展"],
  ["bending", "弯曲"],
  ["waving", "挥手"],
  ["putting", "放"],
  ["taking", "拿"],
  ["folding", "叠"],
  ["packing", "收拾"],
  ["choosing", "选择"],
  ["zipping", "拉拉链"],
  ["buttoning", "扣扣子"],
  ["tying", "系"],
  ["hanging", "挂起"],
  ["sharing", "分享"],
  ["helping", "帮助"],
  ["passing", "递"],
  ["cleaning", "清洁"],
  ["waiting", "等待"],
  ["leaving", "离开"],
  ["entering", "进入"],
  ["greeting", "问候"],
  ["erasing", "擦"],
  ["throwing", "扔"],
  ["climbing", "爬"],
  ["playing", "玩"],
  ["looking", "看"],
  ["painting", "画画"],
  ["smiling", "微笑"]
]);

const prepositions = new Map([
  ["on", "在"],
  ["in", "在"],
  ["under", "在下面"],
  ["above", "在上方"],
  ["behind", "在后面"],
  ["beside", "在旁边"],
  ["by", "在旁边"],
  ["near", "在附近"],
  ["between", "在中间"],
  ["next to", "在旁边"],
  ["in front of", "在前面"],
  ["around", "围着"],
  ["with", "和"],
  ["at", "在"],
  ["into", "到里面"],
  ["out of", "从里面出来"]
]);

const locationPrepositions = new Set([
  "on",
  "in",
  "under",
  "above",
  "behind",
  "beside",
  "by",
  "near",
  "between",
  "next to",
  "in front of",
  "inside",
  "outside",
  "into",
  "out of",
  "at"
]);

const grammarWords = new Map([
  ["a", ""],
  ["an", ""],
  ["the", ""],
  ["is", ""],
  ["are", ""],
  ["has", "有"],
  ["have", "有"],
  ["my", "我的"],
  ["his", ""],
  ["her", ""],
  ["its", ""],
  ["their", ""],
  ["he", "他"],
  ["she", "她"],
  ["we", "我们"],
  ["you", "你"],
  ["to", ""],
  ["of", ""],
  ["for", ""],
  ["from", ""],
  ["and", "和"],
  ["with", "和"],
  ["after", "之后"],
  ["before", "之前"],
  ["very", "很"],
  ["together", "一起"],
  ["alone", "独自"],
  ["apart", "分开"],
  ["away", "离开"],
  ["back", "回"],
  ["up", "起来"],
  ["down", "下来"],
  ["out", "出来"],
  ["off", "离开"],
  ["each", "每个"],
  ["both", "两个"],
  ["inside", "在里面"],
  ["outside", "在外面"],
  ["indoors", "在室内"],
  ["home", "在家"],
  ["school", "在学校"],
  ["morning", "早上"],
  ["evening", "晚上"],
  ["night", "晚上"],
  ["today", "今天"]
]);

const locationFirstActions = new Set([
  "drawing",
  "reading",
  "writing",
  "eating",
  "drinking",
  "sleeping",
  "sitting",
  "standing"
]);

const locationFirstWithObjectActions = new Set([
  "drawing",
  "reading",
  "writing",
  "brushing",
  "combing",
  "washing",
  "eating",
  "drinking"
]);

for (const [word, translation] of [
  ["adults", "大人"],
  ["animal", "动物"],
  ["animals", "动物"],
  ["arms", "胳膊"],
  ["babies", "宝宝"],
  ["bags", "书包"],
  ["bandage", "创可贴"],
  ["basket", "篮子"],
  ["bathroom", "浴室"],
  ["bathtub", "浴缸"],
  ["bear", "熊"],
  ["teddy bear", "泰迪熊"],
  ["beard", "胡子"],
  ["bedroom", "卧室"],
  ["beanbag", "豆袋"],
  ["bench", "长椅"],
  ["bin", "垃圾桶"],
  ["boat", "船"],
  ["boiled egg", "水煮蛋"],
  ["bottles", "水瓶"],
  ["bowl", "碗"],
  ["blanket", "毯子"],
  ["brothers", "兄弟"],
  ["brush", "刷子"],
  ["bucket", "桶"],
  ["building", "楼房"],
  ["bunch", "一串"],
  ["butter", "黄油"],
  ["cake", "蛋糕"],
  ["card", "卡片"],
  ["cards", "卡片"],
  ["cars", "小汽车"],
  ["case", "盒子"],
  ["chain", "链条"],
  ["chairs", "椅子"],
  ["chicken", "鸡"],
  ["chickens", "鸡"],
  ["chopsticks", "筷子"],
  ["classroom", "教室"],
  ["clinic", "诊室"],
  ["clock", "钟"],
  ["closet", "衣柜"],
  ["clothes", "衣服"],
  ["cloud", "云"],
  ["clouds", "云"],
  ["comb", "梳子"],
  ["cook", "厨师"],
  ["corn", "玉米"],
  ["cover", "封面"],
  ["crayon", "蜡笔"],
  ["crayons", "蜡笔"],
  ["cream", "奶油"],
  ["cup", "杯子"],
  ["cups", "杯子"],
  ["day", "白天"],
  ["doctor", "医生"],
  ["drawer", "抽屉"],
  ["dumplings", "饺子"],
  ["dining room", "餐厅"],
  ["ear", "耳朵"],
  ["ears", "耳朵"],
  ["egg", "鸡蛋"],
  ["eggs", "鸡蛋"],
  ["erasers", "橡皮"],
  ["eye", "眼睛"],
  ["eyes", "眼睛"],
  ["face", "脸"],
  ["farm", "农场"],
  ["farmer", "农民"],
  ["feather", "羽毛"],
  ["feet", "脚"],
  ["fingers", "手指"],
  ["floor", "地板"],
  ["flower", "花"],
  ["flowers", "花"],
  ["foot", "脚"],
  ["fork", "叉子"],
  ["frog", "青蛙"],
  ["fruit", "水果"],
  ["game", "游戏"],
  ["games", "游戏"],
  ["garden", "花园"],
  ["gate", "门口"],
  ["giraffe", "长颈鹿"],
  ["girls", "女孩们"],
  ["glass", "玻璃杯"],
  ["glasses", "眼镜"],
  ["glove", "手套"],
  ["glue", "胶水"],
  ["goodbye", "再见"],
  ["grandchildren", "孙辈"],
  ["granddaughter", "孙女"],
  ["grandfather", "爷爷"],
  ["grandfathers", "爷爷"],
  ["grandmother", "奶奶"],
  ["grandmothers", "奶奶"],
  ["grandparents", "爷爷奶奶"],
  ["grandson", "孙子"],
  ["grass", "草"],
  ["ground", "地面"],
  ["hair", "头发"],
  ["hamster", "仓鼠"],
  ["hand", "手"],
  ["hand cream", "护手霜"],
  ["hands", "手"],
  ["hats", "帽子"],
  ["head", "头"],
  ["homework", "作业"],
  ["home", "家"],
  ["hook", "挂钩"],
  ["hooks", "挂钩"],
  ["house", "房子"],
  ["houses", "房子"],
  ["jacket", "夹克"],
  ["jackets", "夹克"],
  ["jam", "果酱"],
  ["juice", "果汁"],
  ["kitchen", "厨房"],
  ["knee", "膝盖"],
  ["knees", "膝盖"],
  ["ladder", "梯子"],
  ["lake", "湖"],
  ["lamp", "台灯"],
  ["leaves", "叶子"],
  ["legs", "腿"],
  ["lesson", "课"],
  ["line", "队伍"],
  ["mane", "鬃毛"],
  ["mat", "垫子"],
  ["menu", "菜单"],
  ["mess", "乱糟糟"],
  ["mirror", "镜子"],
  ["monkey", "猴子"],
  ["mouth", "嘴巴"],
  ["neck", "脖子"],
  ["nose", "鼻子"],
  ["note", "便条"],
  ["notebooks", "笔记本"],
  ["oranges", "橙子"],
  ["page", "页面"],
  ["pajamas", "睡衣"],
  ["paper", "纸"],
  ["pen", "围栏"],
  ["pear", "梨"],
  ["pears", "梨"],
  ["paper plane", "纸飞机"],
  ["picture", "图片"],
  ["pictures", "图片"],
  ["piece", "块"],
  ["pig", "猪"],
  ["pigs", "猪"],
  ["pillow", "枕头"],
  ["plane", "飞机"],
  ["plant", "植物"],
  ["plate", "盘子"],
  ["playroom", "游戏房"],
  ["pool", "泳池"],
  ["puddle", "水坑"],
  ["puddles", "水坑"],
  ["puzzle", "拼图"],
  ["race", "比赛"],
  ["racket", "球拍"],
  ["rain", "雨"],
  ["rainbow", "彩虹"],
  ["raindrops", "雨滴"],
  ["restaurant", "餐厅"],
  ["robot", "机器人"],
  ["rock", "石头"],
  ["road", "道路"],
  ["room", "房间"],
  ["rope", "绳子"],
  ["row", "一排"],
  ["rubbish", "垃圾"],
  ["rug", "地毯"],
  ["sand", "沙子"],
  ["sandcastle", "沙堡"],
  ["sandwiches", "三明治"],
  ["scarf", "围巾"],
  ["school", "学校"],
  ["schoolbags", "书包"],
  ["scooter", "滑板车"],
  ["shade", "阴影"],
  ["shoes", "鞋子"],
  ["shop", "商店"],
  ["shorts", "短裤"],
  ["shoulder", "肩膀"],
  ["shoulders", "肩膀"],
  ["shovel", "铲子"],
  ["shower", "淋浴"],
  ["shuttlecock", "羽毛球"],
  ["siblings", "兄弟姐妹"],
  ["sisters", "姐妹"],
  ["sky", "天空"],
  ["slice", "片"],
  ["snack", "点心"],
  ["snacks", "点心"],
  ["snake", "蛇"],
  ["snowflakes", "雪花"],
  ["sock", "袜子"],
  ["socks", "袜子"],
  ["spoon", "勺子"],
  ["spoons", "勺子"],
  ["spots", "斑点"],
  ["story", "故事"],
  ["storybook", "故事书"],
  ["storybooks", "故事书"],
  ["stomach", "肚子"],
  ["stop", "车站"],
  ["sun", "太阳"],
  ["sunglasses", "太阳镜"],
  ["sunshine", "阳光"],
  ["supermarket", "超市"],
  ["swan", "天鹅"],
  ["tail", "尾巴"],
  ["tank", "鱼缸"],
  ["teachers", "老师"],
  ["team", "队伍"],
  ["teeth", "牙齿"],
  ["things", "东西"],
  ["toes", "脚趾"],
  ["toothpaste", "牙膏"],
  ["towels", "毛巾"],
  ["tower", "塔"],
  ["tracks", "轨道"],
  ["tray", "托盘"],
  ["trees", "树"],
  ["trunk", "鼻子"],
  ["turtle", "乌龟"],
  ["twins", "双胞胎"],
  ["uniform", "校服"],
  ["vegetables", "蔬菜"],
  ["vehicle", "交通工具"],
  ["wall", "墙"],
  ["watermelon", "西瓜"],
  ["wind", "风"],
  ["wool", "羊毛"],
  ["word", "单词"],
  ["yard", "院子"]
]) {
  nouns.set(word, translation);
}

for (const [word, translation] of [
  ["bad", "坏的"],
  ["bare", "光着的"],
  ["broken", "坏的"],
  ["cloudy", "多云的"],
  ["cold", "冷的"],
  ["colorful", "彩色的"],
  ["dark", "暗的"],
  ["different", "不同的"],
  ["dirty", "脏的"],
  ["folded", "叠好的"],
  ["hard", "硬的"],
  ["high", "高的"],
  ["hot", "热的"],
  ["left", "左边的"],
  ["light", "轻的"],
  ["lost", "丢失的"],
  ["messy", "乱的"],
  ["many", "许多"],
  ["neatly", "整齐地"],
  ["noisy", "吵闹的"],
  ["older", "年长的"],
  ["other", "另一个"],
  ["quietly", "安静地"],
  ["right", "右边的"],
  ["round", "圆的"],
  ["same", "相同的"],
  ["sharp", "尖的"],
  ["sleepy", "困的"],
  ["stopped", "停下的"],
  ["tall", "高的"],
  ["thick", "厚的"],
  ["tidy", "整齐的"],
  ["warm", "温热的"],
  ["wrapped", "包好的"],
  ["younger", "年幼的"]
]) {
  adjectives.set(word, translation);
}

for (const [phrase, translation] of [
  ["biting", "咬"],
  ["carrying", "背着"],
  ["catching", "接"],
  ["checking", "检查"],
  ["cheering", "欢呼"],
  ["clearing", "清理"],
  ["collecting", "收集"],
  ["combing", "梳"],
  ["coming", "回来"],
  ["covering", "盖住"],
  ["crawling", "爬行"],
  ["crossing", "穿过"],
  ["crying", "哭"],
  ["cutting", "切"],
  ["doing", "做"],
  ["driving", "开车"],
  ["dropping", "掉下"],
  ["drying", "擦干"],
  ["emptying", "倒空"],
  ["falling", "掉下"],
  ["feeding", "喂"],
  ["fighting", "打闹"],
  ["filling", "装满"],
  ["finding", "找到"],
  ["frowning", "皱眉"],
  ["getting", "拿"],
  ["giving", "给"],
  ["going", "去"],
  ["going down", "往下走"],
  ["greeting", "打招呼"],
  ["hiding", "藏"],
  ["hitting", "打"],
  ["keeping", "保持"],
  ["knocking", "敲"],
  ["lending", "借给"],
  ["listening", "听"],
  ["lining", "排队"],
  ["lining up", "排队"],
  ["lying", "躺"],
  ["lying down", "躺下"],
  ["making", "弄"],
  ["moving", "移动"],
  ["peeling", "剥"],
  ["picking", "捡"],
  ["pouring", "倒"],
  ["pulling", "拉"],
  ["pushing", "推"],
  ["raining", "下雨"],
  ["repeating", "重复"],
  ["resting", "休息"],
  ["riding", "骑"],
  ["sailing", "航行"],
  ["setting", "摆放"],
  ["sharpening", "削"],
  ["shining", "照耀"],
  ["showing", "展示"],
  ["skipping", "跳绳"],
  ["snowing", "下雪"],
  ["spraying", "喷"],
  ["spread", "涂"],
  ["spreading", "涂"],
  ["squeezing", "挤"],
  ["sticking", "贴"],
  ["taking out", "拿出"],
  ["talking", "说话"],
  ["tearing", "撕"],
  ["turning", "转"],
  ["turns", "转"],
  ["unbuttoning", "解扣子"],
  ["unpacking", "取出"],
  ["using", "使用"],
  ["waking", "醒来"],
  ["waking up", "起床"],
  ["watching", "看"],
  ["watering", "浇水"],
  ["wiping", "擦"]
]) {
  actions.set(phrase, translation);
}

for (const [phrase, translation] of [
  ["inside", "在里面"],
  ["over", "越过"],
  ["past", "经过"],
  ["through", "穿过"]
]) {
  prepositions.set(phrase, translation);
}

export function toChineseHint(sentence) {
  const normalized = normalizeSentence(sentence);
  if (!normalized) return "";
  if (exactHints.has(normalized)) return exactHints.get(normalized);
  const specialHint = translateSpecialHint(normalized);
  if (specialHint) return specialHint;

  let match = normalized.match(/^this is (?:a|an) (.+)$/);
  if (match) return `这是${translateNounPhrase(match[1], { forceOne: true })}。`;

  match = normalized.match(/^these are (.+)$/);
  if (match) return `这些是${translateNounPhrase(match[1])}。`;

  match = normalized.match(/^i see (.+)$/);
  if (match) return `我看到${translateNounPhrase(match[1])}。`;

  match = normalized.match(/^there is (.+)$/);
  if (match) return translateTherePhrase(match[1], { forceOne: true });

  match = normalized.match(/^there are (.+)$/);
  if (match) return translateTherePhrase(match[1]);

  match = normalized.match(/^(?:the|a|an) (.+?) has (.+)$/);
  if (match) return cleanChineseHint(`${translateSubject(match[1])}有${translateNounPhrase(match[2])}。`);

  match = normalized.match(/^(?:the|a|an) (.+?) likes? (.+)$/);
  if (match) return cleanChineseHint(`${translateSubject(match[1])}喜欢${translateNounPhrase(match[2])}。`);

  match = normalized.match(/^(?:the|a|an) (.+?) (?:is|are) (?:a|an) (.+)$/);
  if (match) return cleanChineseHint(`${translateSubject(match[1])}是${translateNounPhrase(match[2], { forceOne: true })}。`);

  match = normalized.match(/^(?:the|a|an) (.+?) (?:is|are) (.+)$/);
  if (match) return translatePredicate(match[1], match[2]);

  match = normalized.match(/^(.+?) (?:is|are) (.+)$/);
  if (match) return translatePredicate(match[1], match[2]);

  match = normalized.match(/^it is (.+)$/);
  if (match) return `天气是${translateWords(match[1])}。`;

  return cleanChineseHint(`${translateWords(normalized)}。`);
}

function translateSpecialHint(normalized) {
  const familyRoles = {
    mother: "妈妈",
    father: "爸爸",
    sister: "姐姐",
    brother: "哥哥",
    grandma: "奶奶",
    grandpa: "爷爷",
    grandmother: "奶奶",
    grandfather: "爷爷",
    parents: "父母",
    grandparents: "爷爷奶奶",
    granddaughter: "孙女",
    grandson: "孙子",
    children: "孩子们",
    grandchildren: "孙辈"
  };
  const people = { woman: "女人", man: "男人" };
  const subjectNames = {
    baby: "宝宝",
    boy: "男孩",
    girl: "女孩",
    child: "孩子",
    children: "孩子们",
    student: "学生",
    students: "学生们",
    classmates: "同学们",
    family: "一家人",
    mother: "妈妈"
  };

  let match = normalized.match(/^this is my (mother|father|sister|brother|grandma|grandpa|family|class)$/);
  if (match?.[1] === "family") return "这是我的家人。";
  if (match?.[1] === "class") return "这是我的班级。";
  if (match) return `这是我的${familyRoles[match[1]]}。`;

  match = normalized.match(/^this is my (friend|teacher|classmate)$/);
  if (match) return `这是我的${nouns.get(match[1])}。`;

  const weatherHints = new Map([
    ["it is sunny", "天气晴朗。"],
    ["it is raining", "正在下雨。"],
    ["it is snowing", "正在下雪。"],
    ["it is windy", "正在刮风。"],
    ["it is cloudy", "天气多云。"]
  ]);
  if (weatherHints.has(normalized)) return weatherHints.get(normalized);

  if (normalized === "everyone is in the family picture") return "所有人都在全家福里。";
  if (normalized === "everyone is around the table") return "所有人都围在桌子旁。";
  if (normalized === "the table is low") return "桌子很矮。";
  if (normalized === "the chair is far from the desk") return "椅子离课桌很远。";

  match = normalized.match(/^the (toy box|lunch box) has (.+) inside$/);
  if (match) return `${nouns.get(match[1])}里有${translateNounPhrase(match[2])}。`;

  match = normalized.match(/^the (boy|girl|child|woman) has (?:a )?kite (?:in the wind|on the ground)$/);
  if (match) {
    const place = normalized.endsWith("in the wind") ? "风中放风筝" : "把风筝放在地上";
    return `${translateSubject(match[1])}正在${place}。`;
  }

  match = normalized.match(/^the (boy|girl|child|woman) has (?:an )?umbrella (?:in the rain|in the sunshine)$/);
  if (match) {
    const place = normalized.endsWith("in the rain") ? "正在雨中撑着伞" : "在阳光下撑着伞";
    return `${translateSubject(match[1])}${place}。`;
  }

  match = normalized.match(/^the (boy|girl|child|woman) has sunglasses in the (sun|shade)$/);
  if (match) return `${translateSubject(match[1])}在${match[2] === "sun" ? "阳光下" : "阴凉处"}戴着太阳镜。`;

  match = normalized.match(/^the (child|boy|girl) has a bandage on the (knee|hand)$/);
  if (match) return `${translateSubject(match[1])}的${nouns.get(match[2])}上贴着创可贴。`;

  match = normalized.match(/^the (boy|girl|child|baby) has a (cap|scarf) (on|around) (?:his|her|its|their) (head|neck|knee)$/);
  if (match) {
    const subject = translateSubject(match[1]);
    const bodyPart = nouns.get(match[4]);
    const item = match[2] === "cap" ? "一顶帽子" : "围巾";
    const verb = match[2] === "cap" ? (match[4] === "knee" ? "放着" : "戴着") : "围着";
    return `${subject}的${bodyPart}上${verb}${item}。`;
  }

  match = normalized.match(/^the (boy|girl|child|baby) has a (.+?) cap (on (?:his|her|its|their) head|in (?:his|her|its|their) hand)$/);
  if (match) {
    const cap = `${colors.get(match[2]) ?? ""}帽子`;
    return match[3].startsWith("on")
      ? `${translateSubject(match[1])}头上戴着一顶${cap}。`
      : `${translateSubject(match[1])}手里拿着一顶${cap}。`;
  }

  match = normalized.match(/^the (baby|child) has socks on both (feet|hands)$/);
  if (match) return `${translateSubject(match[1])}的双${match[2] === "feet" ? "脚" : "手"}穿着袜子。`;

  match = normalized.match(/^the (father|mother) is filling a bowl with rice$/);
  if (match) return `${translateSubject(match[1])}正在往碗里盛米饭。`;

  match = normalized.match(/^the (.+?) is walking with (?:a )?(.+)$/);
  if (match) return `${translateSubject(match[1])}正和${translateNounPhrase(match[2])}一起走路。`;

  match = normalized.match(/^the (baby|child|friends) (?:is|are) sitting with (bare feet|shoes|a rope)$/);
  if (match) {
    const state = { "bare feet": "光脚", shoes: "穿着鞋", "a rope": "拿着绳子" }[match[2]];
    return `${translateSubject(match[1])}${state}坐着。`;
  }

  match = normalized.match(/^the (child|baby) is smiling with (clean teeth|dirty hands)$/);
  if (match) {
    const state = match[2] === "clean teeth" ? "露出干净的牙齿" : "双手很脏";
    return `${translateSubject(match[1])}微笑时${state}。`;
  }

  match = normalized.match(/^the (baby|child) is playing with toes$/);
  if (match) return `${translateSubject(match[1])}正在玩自己的脚趾。`;

  match = normalized.match(/^the (girl|boy|child) is with (?:her|his|their) (friend|classmate)$/);
  if (match) return `${translateSubject(match[1])}和${translateSubject(match[2])}在一起。`;

  match = normalized.match(/^the (boy|girl|child) is building with (?:a |the )?(friend|classmate)$/);
  if (match) return `${translateSubject(match[1])}正和${translateSubject(match[2])}一起搭东西。`;

  match = normalized.match(/^the (girl|boy|child) is helping with (?:a )?(schoolbag|shoes|towel|homework)$/);
  if (match) {
    const action = { schoolbag: "整理书包", shoes: "穿鞋", towel: "拿毛巾", homework: "做作业" }[match[2]];
    return `${translateSubject(match[1])}正在帮忙${action}。`;
  }

  match = normalized.match(/^the (father|mother) is helping with (shoes|a towel|homework)$/);
  if (match) {
    const action = { shoes: "穿鞋", "a towel": "拿毛巾", homework: "做作业" }[match[2]];
    return `${translateSubject(match[1])}正在帮忙${action}。`;
  }

  match = normalized.match(/^the (girl|boy|child) is helping (?:a )?classmate with (shoes|books|a bag|a cup)$/);
  if (match) {
    const action = { shoes: "穿鞋", books: "拿书", "a bag": "拿书包", "a cup": "拿杯子" }[match[2]];
    return `${translateSubject(match[1])}正在帮助同学${action}。`;
  }

  match = normalized.match(/^the (children|friends) are taking turns with (?:a )?scooter$/);
  if (match) return `${translateSubject(match[1])}正在轮流玩滑板车。`;

  match = normalized.match(/^the (child|girl|boy) is (going|walking) home with (?:a )?(parent|teacher)$/);
  if (match) return `${translateSubject(match[1])}正和${translateSubject(match[3])}一起回家。`;

  match = normalized.match(/^the (child|girl|boy) is (going|walking) home$/);
  if (match) return `${translateSubject(match[1])}正在${match[2] === "walking" ? "步行" : ""}回家。`;

  match = normalized.match(/^the (child|boy|girl) is (happy|sad) with (?:a )?toy$/);
  if (match) return `${translateSubject(match[1])}拿着玩具，感到${match[2] === "happy" ? "开心" : "难过"}。`;

  match = normalized.match(/^the bag is (heavy|light) with (one |many )?books?$/);
  if (match) return `书包里装着${match[2] === "one " ? "一本书" : "很多书"}，所以很${match[1] === "heavy" ? "重" : "轻"}。`;

  match = normalized.match(/^the (girl|boy|child) is sharing (.+) with (?:a )?(friend|classmate)$/);
  if (match) return `${translateSubject(match[1])}正在和${translateSubject(match[3])}分享${translateNounPhrase(match[2], { forceOne: hasSingularArticle(match[2]) })}。`;

  match = normalized.match(/^the mother is cooking with the child$/);
  if (match) return "妈妈正在和孩子一起做饭。";

  match = normalized.match(/^the (family|class) has dinner at the table$/);
  if (match) return `${translateSubject(match[1])}正在桌边吃晚饭。`;

  match = normalized.match(/^the (girl|boy|baby|child) has a (bunch of grapes|slice of watermelon)$/);
  if (match) return `${translateSubject(match[1])}有${match[2] === "bunch of grapes" ? "一串葡萄" : "一片西瓜"}。`;

  match = normalized.match(/^the (girl|boy|child|baby) is (putting on|taking off) (.+?) at home$/);
  if (match) {
    const verb = clothingVerb(match[2], match[3]);
    return `${translateSubject(match[1])}正在家里${verb}${translateNounPhrase(match[3])}。`;
  }

  match = normalized.match(/^the (girl|boy|child|baby) is (putting on|taking off) (.+)$/);
  if (match) {
    const verb = clothingVerb(match[2], match[3]);
    return `${translateSubject(match[1])}正在${verb}${translateNounPhrase(match[3])}。`;
  }

  match = normalized.match(/^the (girl|boy|child|baby) is taking (.+) out of (?:a|the) (bag|bowl|schoolbag)$/);
  if (match) return `${translateSubject(match[1])}正在从${translateNounPhrase(match[3])}里拿出${translateNounPhrase(match[2], { forceOne: hasSingularArticle(match[2]) })}。`;

  match = normalized.match(/^the (student|teacher|child|classmates) (?:is|are) putting away (?:a|the) (schoolbag|books|chairs)$/);
  if (match) return `${translateSubject(match[1])}正在收好${translateNounPhrase(match[2])}。`;

  match = normalized.match(/^the children are taking turns on the (slide|swing)$/);
  if (match) return `孩子们正在轮流玩${nouns.get(match[1])}。`;

  if (normalized === "the classmates are making a paper chain") return "同学们正在制作一条纸链。";

  match = normalized.match(/^(?:two )?(friends|classmates) are making (?:their|the) table messy$/);
  if (match) return `${translateSubject(match[1])}正在把桌子弄乱。`;

  match = normalized.match(/^the classmates are pulling (chairs|books) out$/);
  if (match) return `同学们正在把${translateNounPhrase(match[1])}拿出来。`;

  if (normalized === "the boy is giving a notebook back") return "男孩正在归还一本笔记本。";
  if (normalized === "the family is coming home in the evening") return "一家人晚上正在回家。";
  if (normalized === "the class is making a mess after lunch") return "全班午饭后弄得一团糟。";
  if (normalized === "the class is walking back to the classroom") return "全班正在走回教室。";

  match = normalized.match(/^the (woman|man|child|girl|boy) is getting off the train$/);
  if (match) return `${translateSubject(match[1])}正在下火车。`;

  if (normalized === "the child is ready after washing") return "孩子洗好后准备就绪。";

  match = normalized.match(/^the children are ready in (coats|pajamas)$/);
  if (match) return `孩子们穿好${match[1] === "coats" ? "外套" : "睡衣"}，准备好了。`;

  match = normalized.match(/^the (boy|girl|child) is putting (?:the|a) (bag|schoolbag) (on|under) (?:a|the) (chair|bed|table)$/);
  if (match) {
    const location = `${translateNounPhrase(match[4])}${match[3] === "on" ? "上" : "下面"}`;
    return `${translateSubject(match[1])}正在把书包放在${location}。`;
  }

  match = normalized.match(/^the schoolbag is ready by the door$/);
  if (match) return "书包已经准备好，放在门旁边。";

  match = normalized.match(/^the clothes are ready (on|in) (?:the )?(bed|sink)$/);
  if (match) return `衣服已经准备好，放在${translateNounPhrase(match[2])}${match[1] === "on" ? "上" : "里"}。`;

  match = normalized.match(/^these are my (parents|grandparents|sisters|brothers)$/);
  if (match) {
    const role = { parents: "父母", grandparents: "爷爷奶奶", sisters: "姐妹", brothers: "兄弟" }[match[1]];
    return `这些是我的${role}。`;
  }

  match = normalized.match(/^(she|he) is my (?:(older|younger|little) )?(sister|brother|mother|father|grandma|grandpa|grandmother|grandfather)$/);
  if (match) {
    const pronoun = match[1] === "she" ? "她" : "他";
    return `${pronoun}是我的${naturalFamilyRole(match[3], match[2])}。`;
  }

  match = normalized.match(/^(?:the|this) (older )?(woman|man|girl|boy|baby) is my (?:(little|older|younger) )?(mother|father|sister|brother|grandma|grandpa)$/);
  if (match) {
    const subject = match[1]
      ? `这位年长的${people[match[2]]}`
      : match[2] === "woman" || match[2] === "man"
        ? `这个${people[match[2]]}`
        : subjectNames[match[2]];
    const role = match[2] === "baby" && !match[3]
      ? naturalFamilyRole(match[4], "little")
      : naturalFamilyRole(match[4], match[3]);
    return `${subject}是我的${role}。`;
  }

  match = normalized.match(/^(?:the )?(baby girl|baby boy|girl|boy|baby) is with (?:his|her) (mother|father|grandmother|grandfather)$/);
  if (match) {
    const person = { "baby girl": "女宝宝", "baby boy": "男宝宝", girl: "女孩", boy: "男孩", baby: "宝宝" }[match[1]];
    return `${person}和${familyRoles[match[2]]}在一起。`;
  }

  match = normalized.match(/^(?:the )?(girl|boy|baby) has (?:a )?(baby|older|younger) (sister|brother)$/);
  if (match) return `${subjectNames[match[1]]}有一个${naturalFamilyRole(match[3], match[2] === "baby" ? "little" : match[2])}。`;

  match = normalized.match(/^my (grandma|grandpa) is (beside|above) my (mother|father)$/);
  if (match) return `我的${familyRoles[match[1]]}在我的${familyRoles[match[3]]}${match[2] === "beside" ? "旁边" : "上方"}。`;

  match = normalized.match(/^the (grandparents|parents) are with their (granddaughter|grandson|children|grandchildren)$/);
  if (match) return `${familyRoles[match[1]]}和他们的${familyRoles[match[2]]}在一起。`;

  match = normalized.match(/^the (mother|grandma|girl) and (father|grandpa|boy) are (parents|grandparents|children|siblings|friends)$/);
  if (match) {
    const left = familyRoles[match[1]] ?? subjectNames[match[1]];
    const right = familyRoles[match[2]] ?? subjectNames[match[2]];
    const relation = { parents: "父母", grandparents: "祖父母", children: "孩子", siblings: "兄弟姐妹", friends: "朋友" }[match[3]];
    return `${left}和${right}是${relation}。`;
  }

  match = normalized.match(/^my (mother|father) is (?:a )?(woman|man)$/);
  if (match) return `我的${familyRoles[match[1]]}是${people[match[2]]}。`;

  match = normalized.match(/^i have (one|two|three) (sister|sisters|brother|brothers)$/);
  if (match) {
    const singularRole = naturalFamilyRole(stripPlural(match[2]));
    const pluralRole = match[2].startsWith("sister") ? "姐妹" : "兄弟";
    return `我有${numbers.get(match[1])}个${match[1] === "one" ? singularRole : pluralRole}。`;
  }

  if (normalized === "we are brother and sister") return "我们是兄妹。";
  if (normalized === "we are two brothers") return "我们是两兄弟。";
  if (normalized === "the two babies are twins") return "两个宝宝是双胞胎。";
  if (normalized === "the three babies are triplets") return "三个宝宝是三胞胎。";
  if (normalized === "the grandma and grandpa are grandparents") return "奶奶和爷爷是祖父母。";

  const demonstratives = new Map([
    ["soap", "这是肥皂。"],
    ["toothpaste", "这是牙膏。"],
    ["hand cream", "这是护手霜。"],
    ["an orange", "这是一个橙子。"]
  ]);
  match = normalized.match(/^this is (.+)$/);
  if (match && demonstratives.has(match[1])) return demonstratives.get(match[1]);

  match = normalized.match(/^this is a (bowl|glass|piece) of (.+)$/);
  if (match) {
    const measure = match[1] === "bowl" ? "碗" : match[1] === "glass" ? "杯" : "片";
    return `这是一${measure}${translateNounPhrase(match[2])}。`;
  }

  match = normalized.match(/^(?:the )?(duck|bird|plane) is flying(?: (.+))?$/);
  if (match) {
    const location = match[2] === "in the sky" ? "天空中" : "";
    return `${translateSubject(match[1])}正在${location}飞翔。`;
  }

  match = normalized.match(/^(?:the )?(.+?) (?:is|are) (sitting|sleeping|standing) (together|apart)$/);
  if (match) {
    if (match[2] === "sitting" && match[3] === "together") return `${translateSubject(match[1])}正坐在一起。`;
    if (match[2] === "sleeping" && match[3] === "together") return `${translateSubject(match[1])}正在一起睡觉。`;
    if (match[2] === "standing" && match[3] === "apart") return `${translateSubject(match[1])}分开站着。`;
  }

  match = normalized.match(/^(?:the )?(.+?) is (putting on|taking off) (.+)$/);
  if (match) return `${translateSubject(match[1])}正在${clothingVerb(match[2], match[3])}${translateNounPhrase(match[3])}。`;

  match = normalized.match(/^(?:the )?(.+?) is getting out of bed$/);
  if (match) return `${translateSubject(match[1])}正在下床。`;

  match = normalized.match(/^(?:the )?(.+?) is taking a shower$/);
  if (match) return `${translateSubject(match[1])}正在洗澡。`;

  match = normalized.match(/^(?:the )?(.+?) is (writing|drawing) with (?:a )?(.+)$/);
  if (match) return `${translateSubject(match[1])}正在用${translateNounPhrase(match[3])}${match[2] === "writing" ? "写字" : "画画"}。`;

  match = normalized.match(/^(?:the )?(.+?) (?:is|are) ready for (school|class|the lesson|the next lesson|reading|lunch|bed|sleep)$/);
  if (match) {
    const purpose = { school: "上学", class: "上课", "the lesson": "上课", "the next lesson": "开始下一节课", reading: "读书", lunch: "吃午饭", bed: "睡觉", sleep: "睡觉" }[match[2]];
    return `${translateSubject(match[1])}准备好${purpose}了。`;
  }

  match = normalized.match(/^(?:the )?(.+?) is (resting|running|reading|sleeping) after school$/);
  if (match) return `${translateSubject(match[1])}正在放学后${actions.get(match[2])}。`;

  match = normalized.match(/^the (girl|boy|child) is (walking|jumping) home after school$/);
  if (match) return `${translateSubject(match[1])}放学后正${match[2] === "walking" ? "步行" : "跳着"}回家。`;

  if (normalized === "the family is sitting together after school") return "一家人放学后坐在一起。";

  match = normalized.match(/^the (girl|boy|child|baby) is playing table tennis$/);
  if (match) return `${translateSubject(match[1])}正在打乒乓球。`;

  match = normalized.match(/^the (girl|boy|child|baby) is skipping rope$/);
  if (match) return `${translateSubject(match[1])}正在跳绳。`;

  match = normalized.match(/^the children are (running|walking) a race$/);
  if (match) return `孩子们正在进行${match[1] === "running" ? "赛跑" : "步行比赛"}。`;

  match = normalized.match(/^the (girl|boy|child) is (standing|running) at the finish line$/);
  if (match) return `${translateSubject(match[1])}正${match[2] === "standing" ? "站在" : "跑到"}终点线旁。`;

  match = normalized.match(/^the (girl|boy|child) is (drawing|erasing) a line$/);
  if (match) return `${translateSubject(match[1])}正在${match[2] === "drawing" ? "画" : "擦掉"}一条线。`;

  match = normalized.match(/^the (classmates|children|students|girl) (?:is|are) (walking|waiting|sitting|pushing) in (?:a )?line$/);
  if (match) {
    const action = { walking: "排队走路", waiting: "排队等待", sitting: "排成一排坐着", pushing: "在队伍里推挤" }[match[2]];
    return `${translateSubject(match[1])}正在${action}。`;
  }

  if (normalized === "the classmates are running out of line") return "同学们正在跑出队伍。";
  if (normalized === "there are five children in line") return "有五个孩子在排队。";
  if (normalized === "there are students in a line") return "有学生在排队。";

  match = normalized.match(/^(?:the )?(.+?) (?:is|are) (running|walking|playing) (at home|at school|in the park)$/);
  if (match) {
    const place = { "at home": "家里", "at school": "学校里", "in the park": "公园里" }[match[3]];
    const action = { running: "跑步", walking: "走路", playing: "玩" }[match[2]];
    return `${translateSubject(match[1])}正在${place}${action}。`;
  }

  match = normalized.match(/^(?:the )?(.+?) (?:is|are) (running|walking|playing) (in|on|beside|by|at) (.+)$/);
  if (match) {
    const action = { running: "跑步", walking: "走路", playing: "玩" }[match[2]];
    const object = match[4] === "the finish line" ? "终点线" : translateNounPhrase(match[4]);
    const location = match[3] === "in"
      ? `${object}里`
      : match[3] === "on"
        ? `${object}上`
        : `${object}旁边`;
    return `${translateSubject(match[1])}正在${location}${action}。`;
  }

  match = normalized.match(/^(?:the )?(.+?) is reading with (?:the )?(.+)$/);
  if (match) return `${translateSubject(match[1])}正和${translateSubject(match[2])}一起读书。`;

  match = normalized.match(/^(?:the )?(.+?) is (turning on|turning off) (?:a|the) lamp$/);
  if (match) return `${translateSubject(match[1])}正在${match[2] === "turning on" ? "开灯" : "关灯"}。`;

  if (normalized === "the ruler is sticking out of the bag") return "尺子从书包里露出来。";
  if (normalized === "the classmates are putting books away") return "同学们正在收好书。";
  if (normalized === "the family is leaving home in the morning") return "一家人早上正在离开家。";
  if (normalized === "the child is playing table tennis") return "孩子正在打乒乓球。";
  if (normalized === "the child is skipping rope") return "孩子正在跳绳。";
  if (normalized === "the child is riding in a car") return "孩子正坐在汽车里。";
  if (normalized === "the child is getting off the train") return "孩子正在下火车。";
  if (normalized === "the child is drawing a line") return "孩子正在画一条线。";
  if (normalized === "the girl is cutting the line") return "女孩正在插队。";
  if (normalized === "the classmates are walking in a line") return "同学们正在排队走路。";

  match = normalized.match(/^the (baby|child) has socks on both feet$/);
  if (match) return `${translateSubject(match[1])}的双脚穿着袜子。`;

  match = normalized.match(/^the (boy|girl|child) is raising one hand without a glove$/);
  if (match) return `${translateSubject(match[1])}正举起一只没有戴手套的手。`;

  match = normalized.match(/^(?:the )?(.+?) is giving (.+?) to (?:a |the )?(.+)$/);
  if (match) return `${translateSubject(match[1])}正在给${translateSubject(match[3])}${translateNounPhrase(match[2])}。`;

  match = normalized.match(/^(?:the )?(.+?) is taking (.+?) from (?:a |the )?(.+)$/);
  if (match) {
    const source = translateNounPhrase(match[3]);
    const sourceSlot = /^(?:friend|student|classmate)$/.test(match[3]) ? `${source}那里` : `${source}上`;
    return `${translateSubject(match[1])}正在从${sourceSlot}拿${translateNounPhrase(match[2], { forceOne: hasSingularArticle(match[2]) })}。`;
  }

  match = normalized.match(/^the (boy|girl|child) is (carrying|dropping) books for a classmate$/);
  if (match) return match[2] === "carrying"
    ? `${translateSubject(match[1])}正在帮同学拿书。`
    : `${translateSubject(match[1])}把替同学拿的书掉在了地上。`;

  match = normalized.match(/^(?:the )?(.+?) likes (apple|orange) juice$/);
  if (match) return `${translateSubject(match[1])}喜欢${match[2] === "apple" ? "苹果汁" : "橙汁"}。`;

  match = normalized.match(/^(?:the )?(.+?) likes (drawing|playing|building) (.+)$/);
  if (match) {
    const action = { drawing: "画", playing: "玩", building: "搭" }[match[2]];
    return `${translateSubject(match[1])}喜欢${action}${translateNounPhrase(match[3])}。`;
  }

  if (normalized === "there is bread and milk on the table") return "桌子上有面包和牛奶。";
  if (normalized === "the car is on the road") return "小汽车在路上。";
  if (normalized === "the girl has sunglasses on her face") return "女孩脸上戴着太阳镜。";
  if (normalized === "the child has a bandage on the knee") return "孩子的膝盖上贴着创可贴。";

  return null;
}

function naturalFamilyRole(role, modifier) {
  if (role === "sister") return modifier === "younger" || modifier === "little" ? "妹妹" : "姐姐";
  if (role === "brother") return modifier === "younger" || modifier === "little" ? "弟弟" : "哥哥";
  return {
    mother: "妈妈",
    father: "爸爸",
    grandma: "奶奶",
    grandpa: "爷爷",
    grandmother: "奶奶",
    grandfather: "爷爷"
  }[role] ?? role;
}

function clothingVerb(action, itemText) {
  const item = itemText.replace(/\b(?:his|her|its|their|my)\b/g, "").trim();
  const headwear = /\b(?:hat|cap)\b/.test(item);
  if (action === "putting on") return headwear ? "戴上" : "穿上";
  return headwear ? "摘下" : "脱下";
}

function normalizeSentence(sentence) {
  return String(sentence ?? "")
    .trim()
    .replace(/[.!?]+$/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function translatePredicate(subject, predicate) {
  const subjectZh = translateSubject(subject);

  const readyWithOpen = predicate.match(/^ready with (.+) open$/);
  if (readyWithOpen) {
    return cleanChineseHint(`${subjectZh}准备好了，${translateNounPhrase(readyWithOpen[1])}打开着。`);
  }

  const actionPhrase = findLeadingPhrase(predicate, actions);
  const action = actionPhrase ? actions.get(actionPhrase) : "";

  if (action) {
    return cleanChineseHint(`${subjectZh}${translateActionPredicate(actionPhrase, predicate.slice(actionPhrase.length).trim())}。`);
  }

  const prep = findLeadingPhrase(predicate, prepositions);
  if (prep) {
    return cleanChineseHint(`${subjectZh}${translateLocationPhrase(prep, predicate.slice(prep.length).trim())}。`);
  }

  const words = predicate.split(" ");
  if (colors.has(words[0]) || adjectives.has(words[0])) {
    const description = colors.has(words[0])
      ? `${colors.get(words[0])}的`
      : translateWords(words[0]);
    const rest = words.slice(1).join(" ");
    const restPrep = findLeadingPhrase(rest, prepositions);
    if (restPrep && locationPrepositions.has(restPrep)) {
      return cleanChineseHint(`${subjectZh}是${description}，${translateLocationPhrase(restPrep, rest.slice(restPrep.length).trim())}。`);
    }
    const location = splitNounAndLocation(rest);
    if (location && !location.nounText) {
      return cleanChineseHint(`${subjectZh}是${description}，${translateLocationPhrase(location.prep, location.objectText)}。`);
    }
    return cleanChineseHint(`${subjectZh}是${description}${rest ? translateComplement(rest) : ""}。`);
  }

  return cleanChineseHint(`${subjectZh}${translateWords(predicate)}。`);
}

function translateActionPredicate(actionPhrase, restText) {
  const rest = cleanComplementText(restText);
  const bareAction = bareActionPhrase(actionPhrase);
  const transitiveAction = transitiveActionPhrase(actionPhrase);

  if (!rest) return `正在${bareAction}`;

  if (actionPhrase === "looking") return translateLookingAction(rest);
  if (actionPhrase === "pointing") return translatePointingAction(rest);

  const timeRelation = rest.match(/^(.+?)\s+(before|after)\s+(.+)$/);
  if (timeRelation) {
    return `正在${translateTimePhrase(timeRelation[2], timeRelation[3])}${transitiveAction}${translateActionObject(actionPhrase, timeRelation[1])}`;
  }

  const instrument = rest.match(/^(.+?)\s+with\s+(.+)$/);
  if (instrument) {
    return `正在用${translateNounPhrase(instrument[2])}${transitiveAction}${translateActionObject(actionPhrase, instrument[1])}`;
  }

  const prep = findLeadingPhrase(rest, prepositions);
  if (prep && locationPrepositions.has(prep)) {
    if (actionPhrase === "walking" && prep === "into") {
      return `正在走进${translateNounPhrase(rest.slice(prep.length).trim())}`;
    }
    if (actionPhrase === "walking" && prep === "out of") {
      return `正在走出${translateNounPhrase(rest.slice(prep.length).trim())}`;
    }
    const location = translateActionLocation(prep, rest.slice(prep.length).trim());
    if (actionPhrase === "sitting" || actionPhrase === "standing") {
      return `正${transitiveAction}${naturalLocationSlot(location)}`;
    }
    return locationFirstActions.has(actionPhrase)
      ? `正在${naturalLocationSlot(location)}${bareAction}`
      : `正在${bareAction}${location}`;
  }

  const location = splitNounAndLocation(rest);
  if (location) {
    const nounZh = translateActionObject(actionPhrase, location.nounText);
    const locationZh = translateActionLocation(location.prep, location.objectText);

    if (locationFirstWithObjectActions.has(actionPhrase)) {
      return `正在${naturalLocationSlot(locationZh)}${transitiveAction}${nounZh}`;
    }

    if (actionPhrase === "putting" && ["in", "into", "inside"].includes(location.prep)) {
      return `正在把${nounZh}放进${translateNounPhrase(location.objectText)}里`;
    }

    return `正在${transitiveAction}${nounZh}${locationZh}`;
  }

  return `正在${transitiveAction}${translateActionObject(actionPhrase, rest)}`;
}

function translateActionObject(actionPhrase, objectText) {
  const normalized = objectText
    .replace(/^(?:a|an|the)\s+/, "")
    .replace(/\b(?:his|her|its|their|my)\b/g, "")
    .trim();

  if (actionPhrase === "brushing" && normalized === "teeth") return "牙";
  if (actionPhrase === "combing" && normalized === "hair") return "头发";
  if (actionPhrase === "lowering" && ["both hands", "two hands"].includes(normalized)) return "两只手";
  if (actionPhrase === "watering" && ["plant", "flower"].includes(normalized)) {
    return `${nouns.get(normalized) ?? ""}浇水`;
  }
  if (["washing", "drying"].includes(actionPhrase) && ["hands", "feet", "face", "hair", "shoes"].includes(normalized)) {
    return nouns.get(normalized) ?? "";
  }

  return translateNounPhrase(objectText, { forceOne: hasSingularArticle(objectText) });
}

function translateTimePhrase(relation, text) {
  const cleaned = text.trim();
  const suffix = relation === "before" ? "前" : "后";

  if (cleaned === "lunch") return `午饭${suffix}`;
  if (cleaned === "school") return relation === "after" ? "放学后" : "上学前";
  if (cleaned === "class") return relation === "after" ? "下课后" : "上课前";
  if (cleaned === "sleep") return `睡觉${suffix}`;
  if (cleaned === "putting on a shirt") return `穿衬衫${suffix}`;
  if (cleaned === "wearing a dress") return `穿连衣裙${suffix}`;

  return `${translateWords(cleaned) || translateNounPhrase(cleaned)}${suffix}`;
}

function naturalLocationSlot(locationText) {
  return locationText.replace(/^在/, "");
}

function cleanComplementText(text) {
  return text
    .replace(/\b(?:his|her|its|their|my)\b/g, "")
    .trim();
}

function bareActionPhrase(actionPhrase) {
  const phrases = {
    building: "搭建",
    drawing: "画画",
    reading: "读书",
    writing: "写字",
    eating: "吃东西",
    drinking: "喝水",
    sitting: "坐着",
    sleeping: "睡觉",
    standing: "站着",
    brushing: "刷牙",
    combing: "梳头发",
    washing: "洗手",
    drying: "擦干",
    looking: "看",
    pointing: "指",
    watering: "浇水"
  };

  return phrases[actionPhrase] ?? actions.get(actionPhrase) ?? "";
}

function transitiveActionPhrase(actionPhrase) {
  const phrases = {
    building: "搭建",
    drawing: "画",
    reading: "读",
    writing: "写",
    eating: "吃",
    drinking: "喝",
    sitting: "坐在",
    sleeping: "睡在",
    brushing: "刷",
    combing: "梳",
    washing: "洗",
    drying: "擦干",
    looking: "看",
    pointing: "指着",
    watering: "给"
  };

  return phrases[actionPhrase] ?? actions.get(actionPhrase) ?? "";
}

function translateLookingAction(rest) {
  const prep = findLeadingPhrase(rest, prepositions);
  if (prep === "in" && /\bmirror\b/.test(rest)) return "正在照镜子";
  if (prep === "at") {
    const target = rest.slice(prep.length).trim();
    const location = splitNounAndLocation(target);
    if (location) {
      return `正${translateActionLocation(location.prep, location.objectText)}看${translateNounPhrase(location.nounText, {
        forceOne: hasSingularArticle(location.nounText)
      })}`;
    }
    return `正在看${translateNounPhrase(target, { forceOne: hasSingularArticle(target) })}`;
  }

  if (prep && locationPrepositions.has(prep)) {
    return `正${translateActionLocation(prep, rest.slice(prep.length).trim())}看`;
  }

  return `正在看${translateNounPhrase(rest, { forceOne: hasSingularArticle(rest) })}`;
}

function translatePointingAction(rest) {
  const target = rest.replace(/^(?:at|to)\s+/, "").trim();
  return `正在指着${translateNounPhrase(target, { forceOne: hasSingularArticle(target) })}`;
}

function translateActionLocation(prep, objectText) {
  const objectZh = translateNounPhrase(objectText);
  if (prep === "at") {
    if (/home/.test(objectText)) return "在家";
    if (/desk|desks/.test(objectText)) return `在${objectZh}前`;
    if (/board/.test(objectText)) return `在${objectZh}前`;
    if (/school/.test(objectText)) return "在学校";
    if (/break/.test(objectText)) return "课间";
    return `在${objectZh}旁`;
  }

  if (prep === "on") return `在${objectZh}上`;
  if (prep === "in") {
    if (/class/.test(objectText)) return "在课堂上";
    return `在${objectZh}里`;
  }
  if (prep === "into") return `进${objectZh}`;
  if (prep === "out of") return `出${objectZh}`;
  if (prep === "under") return `在${objectZh}下面`;
  if (prep === "behind") return `在${objectZh}后面`;
  if (prep === "beside" || prep === "by" || prep === "next to") return `在${objectZh}旁边`;
  if (prep === "between") return `在${objectZh}中间`;
  if (prep === "in front of") return `在${objectZh}前面`;
  if (prep === "inside") return `在${objectZh}里面`;
  if (prep === "outside") return `在${objectZh}外面`;
  return translateLocationPhrase(prep, objectText);
}

function translateTherePhrase(text, options = {}) {
  const location = splitNounAndLocation(text);
  if (location) {
    return cleanChineseHint(`${translateLocationPhrase(location.prep, location.objectText)}有${translateNounPhrase(location.nounText, options)}。`);
  }
  return cleanChineseHint(`有${translateNounPhrase(text, options)}。`);
}

function translateComplement(text, options = {}) {
  const cleaned = text
    .replace(/\b(?:his|her|its|their|my)\b/g, "")
    .trim();
  const prep = findLeadingPhrase(cleaned, prepositions);
  if (prep) {
    return translateLocationPhrase(prep, cleaned.slice(prep.length).trim());
  }

  const location = splitNounAndLocation(cleaned);
  if (location) {
    const nounZh = translateNounPhrase(location.nounText, {
      forceOne: hasSingularArticle(location.nounText)
    });
    const locationZh = translateLocationPhrase(location.prep, location.objectText);
    if (options.action === "放" && ["in", "into", "inside"].includes(location.prep)) {
      return `把${nounZh}放进${translateNounPhrase(location.objectText)}里`;
    }
    return `${nounZh}${locationZh}`;
  }
  return translateNounPhrase(cleaned);
}

function translateSubject(text) {
  return translateNounPhrase(text);
}

function translateNounPhrase(text, options = {}) {
  if (/\sand\s/.test(text)) {
    return text
      .split(/\s+and\s+/)
      .map((part) => translateNounPhrase(part, { forceOne: hasSingularArticle(part) }))
      .join("和");
  }

  const pairOf = /\ba pair of\b/.test(text);
  const cleaned = text
    .replace(/^(?:a|an|the)\s+/, "")
    .replace(/\ba pair of\b/g, "")
    .replace(/\bboth\b/g, "two")
    .replace(/\b(?:his|her|its|their|my)\b/g, "")
    .trim();
  const words = cleaned.split(" ").filter(Boolean);
  const countWord = options.forceOne ? "one" : words.find((word) => numbers.has(word));
  const count = countWord ? numbers.get(countWord) : "";
  const color = words.find((word) => colors.has(word));
  const adjective = words.find((word) => adjectives.has(word));
  const noun = findTrailingPhrase(cleaned, nouns) ?? words.at(-1) ?? cleaned;
  const rawNounZh = nouns.get(noun) ?? nouns.get(stripPlural(noun)) ?? "";
  const nounZh = count ? rawNounZh.replace(/们$/, "") : rawNounZh;
  const measure = count ? measureWord(noun, { pairOf }) : "";
  const colorZh = color ? `${colors.get(color)}的` : "";
  const adjectiveZh = adjective && adjective !== color ? adjectives.get(adjective) : "";

  return `${count}${measure}${colorZh}${adjectiveZh}${nounZh}`;
}

function translateWords(text) {
  return text
    .split(" ")
    .filter(Boolean)
    .map((word) =>
      colors.get(word) ??
      adjectives.get(word) ??
      nouns.get(word) ??
      nouns.get(stripPlural(word)) ??
      actions.get(word) ??
      numbers.get(word) ??
      prepositions.get(word) ??
      grammarWords.get(word) ??
      ""
    )
    .join("");
}

function hasSingularArticle(text) {
  return /^(?:a|an)\s+/.test(text.trim());
}

function splitNounAndLocation(text) {
  const cleaned = text.trim();
  if (!cleaned) return null;

  const phrases = [...locationPrepositions].sort((a, b) => b.length - a.length);
  for (const phrase of phrases) {
    const match = cleaned.match(new RegExp(`^(.*?)\\s+${escapeRegExp(phrase)}\\s+(.+)$`));
    if (!match) continue;

    return {
      nounText: match[1].trim(),
      prep: phrase,
      objectText: match[2].trim()
    };
  }

  return null;
}

function translateLocationPhrase(prep, objectText) {
  const objectZh = translateNounPhrase(objectText);
  const locationTemplates = {
    on: `在${objectZh}上`,
    in: `在${objectZh}里`,
    under: `在${objectZh}下面`,
    above: `在${objectZh}上方`,
    behind: `在${objectZh}后面`,
    beside: `在${objectZh}旁边`,
    by: `在${objectZh}旁边`,
    near: `在${objectZh}附近`,
    between: `在${objectZh}中间`,
    "next to": `在${objectZh}旁边`,
    "in front of": `在${objectZh}前面`,
    inside: `在${objectZh}里面`,
    outside: `在${objectZh}外面`,
    at: `在${objectZh}旁边`
  };

  return locationTemplates[prep] ?? `${prepositions.get(prep) ?? ""}${objectZh}`;
}

function findLeadingPhrase(text, map) {
  return [...map.keys()]
    .sort((a, b) => b.length - a.length)
    .find((phrase) => text === phrase || text.startsWith(`${phrase} `));
}

function findTrailingPhrase(text, map) {
  return [...map.keys()]
    .sort((a, b) => b.length - a.length)
    .find((phrase) => text === phrase || text.endsWith(` ${phrase}`));
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripPlural(word) {
  const irregular = {
    children: "child",
    feet: "foot",
    eyes: "eye",
    shoes: "shoe",
    toes: "toe"
  };
  if (irregular[word]) return irregular[word];
  if (word.endsWith("ss")) return word;
  if (word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.endsWith("es")) return word.slice(0, -2);
  if (word.endsWith("s")) return word.slice(0, -1);
  return word;
}

function measureWord(noun, { pairOf = false } = {}) {
  const stripped = stripPlural(noun);
  if (stripped === "horse") return "匹";
  if (["cat", "dog", "bird", "duck", "rabbit", "fish", "cow", "sheep", "lion", "elephant", "panda", "frog", "swan", "pig", "chicken", "monkey", "giraffe", "hamster", "turtle"].includes(stripped)) return "只";
  if (["book", "notebook"].includes(stripped)) return "本";
  if (["shirt", "dress", "coat", "jacket", "sweater", "skirt"].includes(stripped)) return "件";
  if (["short", "trouser"].includes(stripped)) return "条";
  if (["shoe", "sock", "boot", "slipper"].includes(stripped)) return pairOf ? "双" : "只";
  if (["car", "bus", "train", "bike", "bicycle"].includes(stripped)) return "辆";
  if (["plane"].includes(stripped) || noun === "paper plane") return "架";
  if (["hat", "cap"].includes(stripped)) return "顶";
  if (["pencil", "crayon"].includes(stripped)) return "支";
  if (["umbrella", "ruler", "toothbrush", "spoon", "fork"].includes(stripped)) return "把";
  if (["box"].includes(stripped)) return "个";
  if (["picture", "page", "paper", "note", "card"].includes(stripped)) return "张";
  if (["house"].includes(stripped)) return "座";
  if (["blanket"].includes(stripped)) return "条";
  if (["hand", "foot", "eye", "ear", "toe"].includes(stripped)) return "只";
  if (["star"].includes(stripped)) return "颗";
  if (["apple", "banana", "ball", "circle", "square", "triangle", "heart", "cup", "bottle"].includes(stripped)) return "个";
  return "个";
}

function cleanChineseHint(hint) {
  return hint
    .replace(/[A-Za-z]+/g, "")
    .replace(/\s+/g, "")
    .replace(/的是/g, "是")
    .replace(/有长的/g, "有长")
    .replace(/有短的/g, "有短")
    .replace(/长的(头发|耳朵|腿|脖子|尾巴|鼻子)/g, "长$1")
    .replace(/短的(头发|耳朵|腿|脖子|尾巴|鼻子)/g, "短$1")
    .replace(/。+/g, "。");
}

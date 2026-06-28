import { mkdirSync, writeFileSync } from "node:fs";

const outputPath = "docs/curriculum-map-levels-001-300.md";

const units = [
  {
    range: "Level 1-5",
    domain: "人物认知",
    goal: "孩子先建立“画面里有人”的概念，能听懂最基础的人物指认。",
    vocabulary: "girl, boy",
    patterns: "This is a girl. / This is a boy. / I see a girl.",
    newKnowledge: "儿童人物：girl / boy",
    review: "无",
    imageContrast: "只改变人物性别，背景保持一致。"
  },
  {
    range: "Level 6-10",
    domain: "人物认知",
    goal: "扩展人物类别，从孩子过渡到成人和课堂身份。",
    vocabulary: "baby, teacher, student, man, woman",
    patterns: "This is a teacher. / I see a student.",
    newKnowledge: "年龄与身份：baby / teacher / student / man / woman",
    review: "girl, boy",
    imageContrast: "只改变人物年龄或身份。"
  },
  {
    range: "Level 11-15",
    domain: "动作认知",
    goal: "建立“正在运动”的画面理解，动作都能一眼看出。",
    vocabulary: "run, walk, jump",
    patterns: "The girl is running. / The boy is jumping.",
    newKnowledge: "大身体动作：running / walking / jumping",
    review: "girl, boy",
    imageContrast: "同一人物，只改变动作。"
  },
  {
    range: "Level 16-20",
    domain: "动作认知",
    goal: "从运动动作过渡到学习和表达动作。",
    vocabulary: "dance, read, write",
    patterns: "The girl is dancing. / The boy is reading.",
    newKnowledge: "学习与表演动作：dancing / reading / writing",
    review: "running, walking, jumping",
    imageContrast: "同一人物，只改变手部或身体动作。"
  },
  {
    range: "Level 21-25",
    domain: "动作认知",
    goal: "补齐日常身体动作，动作阶段收束复习。",
    vocabulary: "eat, drink, sleep, swim",
    patterns: "The boy is eating. / The girl is sleeping.",
    newKnowledge: "生活动作：eating / drinking / sleeping / swimming",
    review: "Level 11-20 动作",
    imageContrast: "同一人物，只改变正在做的事。"
  },
  {
    range: "Level 26-30",
    domain: "颜色认知",
    goal: "把颜色作为物体属性，而不是孤立颜色词。",
    vocabulary: "red, blue",
    patterns: "The ball is red. / I see a blue car.",
    newKnowledge: "颜色属性：red / blue",
    review: "ball, car 的物体画面认知",
    imageContrast: "同一物体，只改变颜色。"
  },
  {
    range: "Level 31-35",
    domain: "颜色认知",
    goal: "扩展高频明亮颜色，保持物体不变来听辨颜色。",
    vocabulary: "yellow, green",
    patterns: "The car is yellow. / I see a green ball.",
    newKnowledge: "颜色属性：yellow / green",
    review: "red, blue",
    imageContrast: "同一物体，只改变颜色。"
  },
  {
    range: "Level 36-40",
    domain: "颜色认知",
    goal: "补齐基础色，并做颜色混合复习。",
    vocabulary: "black, white",
    patterns: "The bag is black. / I see a white cup.",
    newKnowledge: "颜色属性：black / white",
    review: "red, blue, yellow, green",
    imageContrast: "同一物体，只改变颜色。"
  },
  {
    range: "Level 41-45",
    domain: "数量认知",
    goal: "从单个物体过渡到两个物体，建立数量画面。",
    vocabulary: "one, two, apple, ball",
    patterns: "One apple. / Two balls.",
    newKnowledge: "数量：one / two",
    review: "基础物体和颜色",
    imageContrast: "同一物体，只改变数量。"
  },
  {
    range: "Level 46-50",
    domain: "数量认知",
    goal: "扩展到三和四，开始听懂复数画面。",
    vocabulary: "three, four, cats, dogs",
    patterns: "Three apples. / There are four balls.",
    newKnowledge: "数量：three / four；There are ...",
    review: "one, two",
    imageContrast: "同一物体，只改变数量。"
  },
  {
    range: "Level 51-55",
    domain: "数量认知",
    goal: "补齐 five，并把数量和已学物体做低负荷组合。",
    vocabulary: "five, birds, bananas",
    patterns: "Five birds. / There are five bananas.",
    newKnowledge: "数量：five",
    review: "one to four, color + object",
    imageContrast: "同一物体，只改变数量。"
  },
  {
    range: "Level 56-60",
    domain: "动物认知",
    goal: "认识最常见宠物，并用已学动作帮助形成动物画面。",
    vocabulary: "cat, dog",
    patterns: "The cat is sleeping. / The dog is running.",
    newKnowledge: "宠物：cat / dog",
    review: "sleeping, running",
    imageContrast: "同一动作，只改变动物；或同一动物，只改变动作。"
  },
  {
    range: "Level 61-65",
    domain: "动物认知",
    goal: "认识天空和水里的动物，建立动物与环境的关系。",
    vocabulary: "bird, fish, fly, swim",
    patterns: "The bird is flying. / The fish is swimming.",
    newKnowledge: "动物与典型动作：bird / fish",
    review: "cat, dog",
    imageContrast: "动物不同，但动作和环境要对应。"
  },
  {
    range: "Level 66-70",
    domain: "动物认知",
    goal: "扩展农场和儿童熟悉动物，并复习动物动作。",
    vocabulary: "rabbit, duck, horse, cow",
    patterns: "The rabbit is jumping. / The duck is swimming.",
    newKnowledge: "常见动物：rabbit / duck / horse / cow",
    review: "cat, dog, bird, fish",
    imageContrast: "只改变动物或典型动作。"
  },
  {
    range: "Level 71-75",
    domain: "家庭成员",
    goal: "建立“我的家人”关系，不混入动作学习。",
    vocabulary: "mother, father",
    patterns: "This is my mother. / This is my father.",
    newKnowledge: "家庭关系：mother / father",
    review: "This is ...",
    imageContrast: "只改变家庭成员。"
  },
  {
    range: "Level 76-80",
    domain: "家庭成员",
    goal: "扩展同辈家庭关系，继续只学关系。",
    vocabulary: "sister, brother",
    patterns: "This is my sister. / This is my brother.",
    newKnowledge: "家庭关系：sister / brother",
    review: "mother, father",
    imageContrast: "只改变家庭成员。"
  },
  {
    range: "Level 81-85",
    domain: "家庭成员",
    goal: "扩展祖辈关系，完成核心家庭词。",
    vocabulary: "grandma, grandpa",
    patterns: "This is my grandma. / This is my grandpa.",
    newKnowledge: "家庭关系：grandma / grandpa",
    review: "mother, father, sister, brother",
    imageContrast: "只改变家庭成员年龄和身份。"
  },
  {
    range: "Level 86-90",
    domain: "家庭成员",
    goal: "家庭成员复习关，强化关系归类，不做动作组合。",
    vocabulary: "mother, father, sister, brother, grandma, grandpa",
    patterns: "I see my mother. / This is my brother.",
    newKnowledge: "家庭成员归类复习",
    review: "Level 71-85 家庭关系",
    imageContrast: "家庭成员二选一，场景保持家庭背景。"
  },
  {
    range: "Level 91-95",
    domain: "常见物品",
    goal: "认识学习物品，和学校场景建立联系。",
    vocabulary: "book, bag",
    patterns: "This is a book. / I see a bag.",
    newKnowledge: "学习物品：book / bag",
    review: "student, teacher",
    imageContrast: "只改变物品。"
  },
  {
    range: "Level 96-100",
    domain: "常见物品",
    goal: "认识家具，为位置关系做准备。",
    vocabulary: "chair, table",
    patterns: "This is a chair. / I see a table.",
    newKnowledge: "家具：chair / table",
    review: "book, bag",
    imageContrast: "只改变家具。"
  },
  {
    range: "Level 101-105",
    domain: "常见物品",
    goal: "认识玩具物品，接入儿童熟悉游戏场景。",
    vocabulary: "ball, toy",
    patterns: "This is a ball. / I see a toy.",
    newKnowledge: "玩具：ball / toy",
    review: "color + object",
    imageContrast: "只改变玩具种类或颜色。"
  },
  {
    range: "Level 106-110",
    domain: "常见物品",
    goal: "认识食物类物品，先只做物品识别。",
    vocabulary: "apple, banana",
    patterns: "This is an apple. / I see a banana.",
    newKnowledge: "食物物品：apple / banana",
    review: "one to five",
    imageContrast: "只改变食物种类或数量。"
  },
  {
    range: "Level 111-115",
    domain: "常见物品",
    goal: "认识容器和收纳物，为 in / on 做准备。",
    vocabulary: "cup, box",
    patterns: "This is a cup. / I see a box.",
    newKnowledge: "容器物品：cup / box",
    review: "table, chair, apple, banana",
    imageContrast: "只改变容器。"
  },
  {
    range: "Level 116-120",
    domain: "常见物品",
    goal: "物品综合复习，开始理解物品属于不同生活场景。",
    vocabulary: "book, bag, chair, table, ball, toy, apple, banana, cup, box",
    patterns: "There is a book. / I see a red ball.",
    newKnowledge: "物品场景归类",
    review: "颜色、数量、常见物品",
    imageContrast: "只改变一个物品属性。"
  },
  {
    range: "Level 121-125",
    domain: "位置关系",
    goal: "学习最直观的接触位置 on。",
    vocabulary: "on",
    patterns: "The ball is on the chair.",
    newKnowledge: "空间关系：on",
    review: "ball, chair, table",
    imageContrast: "同一物体，只改变在上面或不在上面。"
  },
  {
    range: "Level 126-130",
    domain: "位置关系",
    goal: "学习容器内部位置 in。",
    vocabulary: "in",
    patterns: "The apple is in the box.",
    newKnowledge: "空间关系：in",
    review: "on, box, cup",
    imageContrast: "同一物体，只改变在里面或外面。"
  },
  {
    range: "Level 131-135",
    domain: "位置关系",
    goal: "学习遮挡和低位关系 under。",
    vocabulary: "under",
    patterns: "The cat is under the table.",
    newKnowledge: "空间关系：under",
    review: "on, in",
    imageContrast: "同一物体，只改变上/下位置。"
  },
  {
    range: "Level 136-140",
    domain: "位置关系",
    goal: "学习前后遮挡关系 behind。",
    vocabulary: "behind",
    patterns: "The dog is behind the chair.",
    newKnowledge: "空间关系：behind",
    review: "on, in, under",
    imageContrast: "同一物体，只改变前后位置。"
  },
  {
    range: "Level 141-145",
    domain: "位置关系",
    goal: "学习相邻关系 next to。",
    vocabulary: "next to",
    patterns: "The bag is next to the chair.",
    newKnowledge: "空间关系：next to",
    review: "behind, under",
    imageContrast: "同一物体，只改变是否相邻。"
  },
  {
    range: "Level 146-150",
    domain: "位置关系",
    goal: "学习两物之间 between。",
    vocabulary: "between",
    patterns: "The ball is between the chair and the table.",
    newKnowledge: "空间关系：between",
    review: "on, in, under, behind, next to",
    imageContrast: "同一物体，只改变是否在两物之间。"
  },
  {
    range: "Level 151-155",
    domain: "位置关系",
    goal: "把动物和空间关系结合，形成更真实的场景画面。",
    vocabulary: "cat, dog, rabbit, on, in, under",
    patterns: "The cat is under the table.",
    newKnowledge: "动物 + 位置",
    review: "动物、on / in / under",
    imageContrast: "同一动物，只改变位置。"
  },
  {
    range: "Level 156-160",
    domain: "位置关系",
    goal: "位置关系综合复习，为日常场景铺垫。",
    vocabulary: "on, in, under, behind, next to, between",
    patterns: "The book is on the table. / The bag is next to the chair.",
    newKnowledge: "空间关系综合应用",
    review: "Level 121-155 位置关系",
    imageContrast: "同一物体，只改变一个空间关系。"
  },
  {
    range: "Level 161-165",
    domain: "日常生活",
    goal: "认识早晨自理动作，建立生活流程第一步。",
    vocabulary: "brush teeth, wash hands",
    patterns: "The boy is brushing his teeth.",
    newKnowledge: "自理动作：brush teeth / wash hands",
    review: "boy, girl, body action",
    imageContrast: "同一人物，只改变自理动作。"
  },
  {
    range: "Level 166-170",
    domain: "日常生活",
    goal: "认识早饭场景，把动作和食物连接。",
    vocabulary: "eat breakfast, drink water",
    patterns: "The girl is eating breakfast.",
    newKnowledge: "早餐动作：eat breakfast / drink water",
    review: "apple, banana, cup",
    imageContrast: "同一人物，只改变吃/喝。"
  },
  {
    range: "Level 171-175",
    domain: "日常生活",
    goal: "认识上学场景，连接家庭和学校。",
    vocabulary: "go to school, carry a bag",
    patterns: "The boy is going to school.",
    newKnowledge: "上学动作：go to school / carry a bag",
    review: "student, bag, school objects",
    imageContrast: "同一人物，只改变去学校或在家。"
  },
  {
    range: "Level 176-180",
    domain: "日常生活",
    goal: "认识课堂活动，回收读写动作。",
    vocabulary: "read a book, write in a book",
    patterns: "The girl is reading a book.",
    newKnowledge: "课堂活动：read a book / write in a book",
    review: "book, teacher, student",
    imageContrast: "同一人物，只改变读/写。"
  },
  {
    range: "Level 181-185",
    domain: "日常生活",
    goal: "认识户外运动，连接动作和场地。",
    vocabulary: "ride a bike, play football",
    patterns: "The boy is riding a bike.",
    newKnowledge: "户外运动：ride a bike / play football",
    review: "running, jumping, ball",
    imageContrast: "同一人物，只改变运动项目。"
  },
  {
    range: "Level 186-190",
    domain: "日常生活",
    goal: "认识公园游戏，建立儿童休闲场景。",
    vocabulary: "fly a kite, play in the park",
    patterns: "The girl is flying a kite.",
    newKnowledge: "公园活动：fly a kite / play in the park",
    review: "park-like outdoor actions",
    imageContrast: "同一人物，只改变户外活动。"
  },
  {
    range: "Level 191-195",
    domain: "日常生活",
    goal: "认识玩具和游戏场景，回收颜色和数量。",
    vocabulary: "play with a toy, hold a ball",
    patterns: "The boy is holding a red ball.",
    newKnowledge: "玩具互动：play with / hold",
    review: "color, number, ball, toy",
    imageContrast: "同一人物，只改变手里物品。"
  },
  {
    range: "Level 196-200",
    domain: "日常生活",
    goal: "认识动物园场景，把动物放入真实场景。",
    vocabulary: "look at, zoo, animal",
    patterns: "The girl is looking at a rabbit.",
    newKnowledge: "观察动物：look at ...",
    review: "animals",
    imageContrast: "同一人物，只改变正在看的动物。"
  },
  {
    range: "Level 201-205",
    domain: "日常生活",
    goal: "认识超市场景，但保持儿童生活物品范围。",
    vocabulary: "buy apples, buy bananas",
    patterns: "The boy is buying apples.",
    newKnowledge: "儿童购物场景：buy apples / buy bananas",
    review: "food, number",
    imageContrast: "同一人物，只改变购买物品。"
  },
  {
    range: "Level 206-210",
    domain: "日常生活",
    goal: "认识整理物品，连接物品和位置。",
    vocabulary: "put, take, box, bag",
    patterns: "The girl is putting a toy in the box.",
    newKnowledge: "整理动作：put / take",
    review: "in, on, toy, box",
    imageContrast: "同一人物，只改变放入/拿出。"
  },
  {
    range: "Level 211-215",
    domain: "日常生活",
    goal: "认识家庭安静活动，形成完整一天中的家庭片段。",
    vocabulary: "read at home, sleep in bed",
    patterns: "The boy is reading at home.",
    newKnowledge: "家庭活动：read at home / sleep in bed",
    review: "family, book, bed, sleep",
    imageContrast: "同一人物，只改变家庭活动。"
  },
  {
    range: "Level 216-220",
    domain: "日常生活",
    goal: "日常生活综合复习，形成从早晨到晚上、从家到学校的生活链条。",
    vocabulary: "daily routine review",
    patterns: "The student is going to school. / The girl is washing her hands.",
    newKnowledge: "生活流程综合",
    review: "Level 161-215 日常生活",
    imageContrast: "同一人物，只改变生活动作或场景。"
  },
  {
    range: "Level 221-225",
    domain: "天气与时间",
    goal: "认识晴雨，天气作为画面背景的关键信息。",
    vocabulary: "sunny, rainy, today",
    patterns: "It is sunny today. / It is rainy today.",
    newKnowledge: "天气：sunny / rainy",
    review: "park, school, outdoor scenes",
    imageContrast: "同一场景，只改变天气。"
  },
  {
    range: "Level 226-230",
    domain: "天气与时间",
    goal: "认识雪天和风天，理解天气影响活动画面。",
    vocabulary: "snowy, windy",
    patterns: "It is snowy. / It is windy.",
    newKnowledge: "天气：snowy / windy",
    review: "sunny, rainy",
    imageContrast: "同一场景，只改变天气。"
  },
  {
    range: "Level 231-235",
    domain: "天气与时间",
    goal: "认识早晨，把时间和日常流程连接。",
    vocabulary: "morning",
    patterns: "It is morning. / The boy is eating breakfast in the morning.",
    newKnowledge: "时间：morning",
    review: "breakfast, brush teeth",
    imageContrast: "同一人物，只改变早晨活动。"
  },
  {
    range: "Level 236-240",
    domain: "天气与时间",
    goal: "认识下午，把时间和学校/公园活动连接。",
    vocabulary: "afternoon",
    patterns: "It is afternoon. / The girl is reading in the afternoon.",
    newKnowledge: "时间：afternoon",
    review: "school, park, read, play",
    imageContrast: "同一人物，只改变下午活动。"
  },
  {
    range: "Level 241-245",
    domain: "天气与时间",
    goal: "认识晚上，把时间和家庭安静活动连接。",
    vocabulary: "evening",
    patterns: "It is evening. / The boy is reading in the evening.",
    newKnowledge: "时间：evening",
    review: "home, read, sleep",
    imageContrast: "同一人物，只改变晚上活动。"
  },
  {
    range: "Level 246-250",
    domain: "天气与时间",
    goal: "理解 today，开始把“现在的天气和活动”放入一句话。",
    vocabulary: "today",
    patterns: "It is sunny today. / The girl is riding a bike today.",
    newKnowledge: "时间指向：today",
    review: "weather, daily actions",
    imageContrast: "同一场景，只改变今天的天气或活动。"
  },
  {
    range: "Level 251-255",
    domain: "天气与时间",
    goal: "天气和时间综合，把背景信息作为理解线索。",
    vocabulary: "sunny, rainy, snowy, windy, morning, afternoon, evening, today",
    patterns: "It is rainy in the afternoon. / It is windy today.",
    newKnowledge: "天气 + 时间",
    review: "Level 221-250 天气与时间",
    imageContrast: "同一活动，只改变天气或时间。"
  },
  {
    range: "Level 256-260",
    domain: "天气与时间",
    goal: "天气影响活动，准备进入综合应用。",
    vocabulary: "umbrella, coat, water, outside",
    patterns: "The girl has an umbrella today. / The boy has a coat.",
    newKnowledge: "天气相关物品",
    review: "rainy, snowy, windy, sunny",
    imageContrast: "同一人物，只改变天气对应物品。"
  },
  {
    range: "Level 261-265",
    domain: "综合应用",
    goal: "组合人物、动作和颜色，让孩子理解一个完整小画面。",
    vocabulary: "hold, red ball, blue bag",
    patterns: "The boy is holding a red ball.",
    newKnowledge: "人物 + 动作 + 颜色物体",
    review: "people, actions, colors, objects",
    imageContrast: "只改变颜色或手里物体。"
  },
  {
    range: "Level 266-270",
    domain: "综合应用",
    goal: "组合动物、动作和数量，形成多主体画面。",
    vocabulary: "birds, cats, dogs, flying, sleeping",
    patterns: "Three birds are flying.",
    newKnowledge: "数量 + 动物 + 动作",
    review: "numbers, animals, actions",
    imageContrast: "只改变数量、动物或动作中的一个。"
  },
  {
    range: "Level 271-275",
    domain: "综合应用",
    goal: "组合空间关系和物体，巩固位置理解。",
    vocabulary: "under, on, in, next to, between",
    patterns: "The cat is under the chair.",
    newKnowledge: "动物/物体 + 位置",
    review: "positions, animals, objects",
    imageContrast: "只改变空间关系。"
  },
  {
    range: "Level 276-280",
    domain: "综合应用",
    goal: "组合场景和动作，孩子能听懂人物在哪里做什么。",
    vocabulary: "park, classroom, home, zoo",
    patterns: "The girl is reading in the park.",
    newKnowledge: "人物 + 动作 + 场景",
    review: "daily life, places, actions",
    imageContrast: "只改变场景或动作中的一个。"
  },
  {
    range: "Level 281-285",
    domain: "综合应用",
    goal: "组合天气和活动，理解背景会改变画面。",
    vocabulary: "sunny, rainy, umbrella, kite",
    patterns: "The boy is flying a kite on a sunny day.",
    newKnowledge: "天气 + 活动",
    review: "weather, daily actions",
    imageContrast: "只改变天气或天气相关物品。"
  },
  {
    range: "Level 286-290",
    domain: "综合应用",
    goal: "组合家庭和物品，但不把家庭成员作为新动作学习点。",
    vocabulary: "mother, father, book, apple, cup",
    patterns: "My mother has a book. / My father has a cup.",
    newKnowledge: "家庭成员 + 持有物",
    review: "family, objects",
    imageContrast: "只改变家庭成员或手里物品。"
  },
  {
    range: "Level 291-295",
    domain: "综合应用",
    goal: "组合一天中的时间和生活场景，形成简单生活叙事。",
    vocabulary: "morning, afternoon, evening, school, home",
    patterns: "The boy goes to school in the morning.",
    newKnowledge: "时间 + 日常活动",
    review: "time, daily routines",
    imageContrast: "只改变时间或活动。"
  },
  {
    range: "Level 296-300",
    domain: "综合应用",
    goal: "综合复习全课程，让孩子能听懂具体、可画、生活化的英语画面。",
    vocabulary: "mixed review",
    patterns: "The girl is reading in the park. / Three birds are flying.",
    newKnowledge: "英语世界模型综合应用",
    review: "people, actions, colors, numbers, animals, family, objects, positions, daily life, weather, time",
    imageContrast: "每题只改变一个关键语义点。"
  }
];

function parseStart(range) {
  return Number(range.match(/Level (\d+)-/)?.[1]);
}

function parseEnd(range) {
  return Number(range.match(/-(\d+)$/)?.[1]);
}

function stageOverview() {
  return [
    ["1-10", "人物认知", "先知道画面里是谁。"],
    ["11-25", "动作认知", "再知道人物或动物正在做什么。"],
    ["26-40", "颜色认知", "把颜色作为物体属性来理解。"],
    ["41-55", "数量认知", "从一个到多个，建立可数画面。"],
    ["56-70", "动物认知", "认识动物及其典型动作。"],
    ["71-90", "家庭成员", "理解家庭关系，不混入动作学习。"],
    ["91-120", "常见物品", "积累家庭、学校、玩具和食物物品。"],
    ["121-160", "位置关系", "理解物体在空间中的关系。"],
    ["161-220", "日常生活", "把动作放入家庭、学校、公园等真实生活场景。"],
    ["221-260", "天气与时间", "理解背景信息如何改变画面。"],
    ["261-300", "综合应用", "组合前面积木，建立完整英语画面理解。"]
  ];
}

function validateUnits() {
  if (units.length !== 60) {
    throw new Error(`Expected 60 five-level units, got ${units.length}`);
  }

  units.forEach((unit, index) => {
    const expectedStart = index * 5 + 1;
    const expectedEnd = expectedStart + 4;
    const start = parseStart(unit.range);
    const end = parseEnd(unit.range);
    if (start !== expectedStart || end !== expectedEnd) {
      throw new Error(`Bad range at unit ${index + 1}: ${unit.range}`);
    }
  });

  for (let index = 0; index <= units.length - 4; index += 1) {
    const window = units.slice(index, index + 4).map((unit) => unit.newKnowledge);
    if (new Set(window).size === 1) {
      throw new Error(`Same new knowledge for 20 levels: ${window[0]}`);
    }
  }
}

function buildMarkdown() {
  validateUnits();

  const lines = [
    "# Level 1-300 Curriculum Map",
    "",
    "> 版本：课程地图重构稿。此文件只定义课程结构，不生成题库，不改动小程序交互、图片或音频。",
    "",
    "## 课程总原则",
    "",
    "- 课程目标：帮助儿童建立英语世界模型，而不是背单词表或刷句子库。",
    "- 推进顺序：认识世界 -> 理解世界 -> 用英语理解世界。",
    "- 每 5 关是一个学习单元；每个单元必须有一个新的清晰认知积木。",
    "- 连续 20 关内不能只反复学习同一个具体知识点；大主题可以延续，但微目标必须推进。",
    "- 复习采用螺旋方式：旧知识约 70%，近期知识约 20%，新知识约 10%。",
    "- 所有核心句型必须能在 5 秒内形成插画画面。",
    "- 干扰图只能改变一个关键语义点，避免无关图片猜答案。",
    "",
    "## 阶段总览",
    "",
    "| Level 范围 | 核心认知 | 世界模型作用 |",
    "| --- | --- | --- |"
  ];

  for (const [range, domain, role] of stageOverview()) {
    lines.push(`| ${range} | ${domain} | ${role} |`);
  }

  lines.push("", "## 5 关学习单元地图");

  units.forEach((unit, index) => {
    lines.push(
      "",
      `### Unit ${String(index + 1).padStart(2, "0")} | ${unit.range} | ${unit.domain}`,
      "",
      `- 学习目标：${unit.goal}`,
      `- 核心词汇：${unit.vocabulary}`,
      `- 核心句型：${unit.patterns}`,
      `- 新知识：${unit.newKnowledge}`,
      `- 复习知识：${unit.review}`,
      `- 画面辨析点：${unit.imageContrast}`
    );
  });

  lines.push(
    "",
    "## 课程自检",
    "",
    "- 儿童认知规律：从人物、动作、颜色、数量这些低抽象认知开始，再进入位置、日常场景、天气时间和综合应用。",
    "- 英语启蒙规律：早期使用短句和高可视化句型；动作阶段使用 be + 动词 ing；后期才组合多个已学积木。",
    "- 国际优秀教材逻辑：采用小步递进、螺旋复习、场景化输入和可视化理解，不把课程做成随机句子集合。",
    "- 中国儿童适配：优先家庭、学校、教室、公园、游乐场、超市、动物园、宠物、玩具、运动等生活场景。",
    "- 题库生成约束：下一步生成题库时，必须严格跟随本地图；每题正确图和干扰图只改变一个语义点。"
  );

  return `${lines.join("\n")}\n`;
}

mkdirSync("docs", { recursive: true });
writeFileSync(outputPath, buildMarkdown());
console.log(`Wrote ${outputPath}`);

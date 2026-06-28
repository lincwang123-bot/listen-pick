import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import { textbookLevels as stageOneLevels } from "../src/course/textbook-levels-001-050.generated.mjs";

const dataPath = "src/course/textbook-levels-001-100.generated.mjs";
const stageTwoDataPath = "src/course/textbook-levels-051-100.generated.mjs";
const promptPath = "docs/textbook-contact-sheet-prompts-051-100.md";
const sourcePath = "docs/child-english-listening-levels-051-100.md";
const manifestRoot = "assets/textbook/contact-sheets";
const imageRoot = "assets/textbook/images";
const audioRoot = "assets/textbook/audio";

function pad(number, size = 3) {
  return String(number).padStart(size, "0");
}

function parseRows(level, rowsText) {
  const rows = rowsText
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (rows.length !== 15) {
    throw new Error(`Level ${level} has ${rows.length} rows`);
  }

  return rows.map((line, index) => {
    const [sentence, wrongSentence] = line.split(" || ").map((part) => part?.trim());
    if (!sentence || !wrongSentence) {
      throw new Error(`Level ${level} row ${index + 1} must use "sentence || wrongSentence"`);
    }
    return { sentence, wrongSentence };
  });
}

function makeLevel(level, title, previewWords, rowsText) {
  const questions = parseRows(level, rowsText).map((row, index) => ({
    id: `L${pad(level)}-Q${pad(index + 1)}`,
    sentence: row.sentence,
    wrongSentence: row.wrongSentence,
    audioFile: `${audioRoot}/level-${pad(level)}/q${pad(index + 1)}.m4a`,
    correctImage: `${imageRoot}/level-${pad(level)}/q${pad(index + 1)}-correct.png`,
    wrongImage: `${imageRoot}/level-${pad(level)}/q${pad(index + 1)}-wrong.png`,
    contactSheet: `${manifestRoot}/level-${pad(level)}.png`,
    theme: title,
    source: "child-english-listening-levels-051-100.md"
  }));

  return { level, title, previewWords, questions };
}

const stageTwoLevels = [
  makeLevel(51, "身体部位：eyes / ears / nose / mouth", ["eyes", "ears", "nose"], `
The girl has two eyes. || The girl has two ears.
The boy has two ears. || The boy has two eyes.
The baby has a nose. || The baby has a mouth.
The child has a mouth. || The child has a nose.
The woman has two hands. || The woman has two feet.
The man has two feet. || The man has two hands.
The girl has long hair. || The girl has short hair.
The boy has short hair. || The boy has long hair.
The child is touching her nose. || The child is touching her ear.
The boy is touching his ear. || The boy is touching his nose.
The baby is touching its head. || The baby is touching its toes.
The child is raising one hand. || The child is raising two hands.
The child is opening its mouth. || The child is closing its mouth.
The child is closing both eyes. || The child is opening both eyes.
The child is washing both hands. || The child is washing both feet.
`),
  makeLevel(52, "脸部与身体动作：look / smile / clap", ["smile", "clap", "look"], `
The girl is smiling. || The girl is crying.
The boy is looking up. || The boy is looking down.
The baby is clapping hands. || The baby is raising hands.
The child is pointing to an eye. || The child is pointing to an ear.
The child is pointing to a nose. || The child is pointing to a mouth.
The girl is brushing her hair. || The girl is brushing her teeth.
The boy is washing his face. || The boy is washing his hands.
The child is drying both hands. || The child is washing both hands.
The baby is waving one hand. || The baby is waving two feet.
The child is standing on one foot. || The child is standing on two feet.
The girl is touching her head. || The girl is touching her toes.
The boy is touching his knee. || The boy is touching his shoulder.
The child is holding a toothbrush. || The child is holding a spoon.
The child is holding a comb. || The child is holding a cup.
The baby is hiding its face. || The baby is showing its face.
`),
  makeLevel(53, "身体综合：head / shoulders / knees / toes", ["head", "knees", "toes"], `
The child is touching the head. || The child is touching the feet.
The girl is touching her shoulders. || The girl is touching her knees.
The boy is touching his knees. || The boy is touching his shoulders.
The baby is touching its toes. || The baby is touching its head.
The child has clean hands. || The child has dirty hands.
The child has wet hands. || The child has dry hands.
The girl has a clean face. || The girl has a dirty face.
The boy has a red nose. || The boy has a red ear.
The child has a bandage on the knee. || The child has a bandage on the hand.
The girl is holding her stomach. || The girl is holding her head.
The boy is stretching his arms. || The boy is crossing his arms.
The child is bending the knees. || The child is raising the hands.
The baby is sitting with bare feet. || The baby is sitting with shoes.
The child is looking in a mirror. || The child is looking at a book.
The child is brushing his teeth. || The child is washing his hair.
`),
  makeLevel(54, "身体数量与颜色复习", ["two hands", "one nose", "hair"], `
The girl has two black eyes. || The girl has two black ears.
The boy has two small ears. || The boy has two small hands.
The baby has one little nose. || The baby has one little mouth.
The child has ten fingers. || The child has ten toes.
The child has two clean hands. || The child has two dirty hands.
The girl has brown hair. || The girl has black shoes.
The boy has a blue cap on his head. || The boy has a blue cap in his hand.
The child has a yellow towel. || The child has a yellow toothbrush.
The girl is raising both hands. || The girl is lowering both hands.
The boy is covering both ears. || The boy is covering both eyes.
The child is touching the left foot. || The child is touching the right hand.
The baby is holding a red comb. || The baby is holding a red cup.
The girl is washing her face. || The girl is washing her shoes.
The boy is drying his hair. || The boy is drying his hands.
The child is smiling with clean teeth. || The child is smiling with dirty hands.
`),
  makeLevel(55, "身体场景复习关", ["body", "wash", "brush"], `
The child is brushing his teeth at the sink. || The child is washing his hands at the sink.
The boy is washing his face in the bathroom. || The boy is washing his shoes in the bathroom.
The girl is combing her hair. || The girl is brushing her teeth.
The baby is touching a soft towel. || The baby is touching a hard ball.
The child is drying his feet with a towel. || The child is drying his hands with a towel.
The girl is looking at her face. || The girl is looking at her shoes.
The boy is putting soap on his hands. || The boy is putting soap on his feet.
The child is opening the mouth for a toothbrush. || The child is closing the mouth.
The baby is waving both hands. || The baby is waving both feet.
The child is clapping clean hands. || The child is clapping dirty hands.
The girl is standing beside a mirror. || The girl is sitting beside a mirror.
The boy is holding a blue toothbrush. || The boy is holding a blue spoon.
The child is touching a knee on the mat. || The child is touching a head on the mat.
The baby is playing with toes. || The baby is playing with a cup.
The child is ready after washing. || The child is messy before washing.
`),
  makeLevel(56, "衣物基础：shirt / trousers / skirt / dress", ["shirt", "trousers", "dress"], `
This is a shirt. || This is a coat.
This is a pair of trousers. || This is a pair of shorts.
This is a skirt. || This is a dress.
This is a dress. || This is a skirt.
This is a coat. || This is a shirt.
This is a jacket. || This is a sweater.
This is a sweater. || This is a jacket.
The girl has a dress. || The girl has a coat.
The boy has a shirt. || The boy has trousers.
The child has a skirt. || The child has a cap.
The woman is holding a coat. || The woman is holding a dress.
The man is holding a jacket. || The man is holding a shirt.
The shirt is on the chair. || The shirt is under the chair.
The dress is on the bed. || The dress is in the bag.
The trousers are on the bed. || The trousers are under the bed.
`),
  makeLevel(57, "衣物配件：hat / cap / shoes / socks", ["hat", "shoes", "socks"], `
This is a hat. || This is a cap.
This is a cap. || This is a hat.
These are shoes. || These are socks.
These are socks. || These are shoes.
These are boots. || These are slippers.
These are slippers. || These are boots.
The girl has a pink hat. || The girl has a pink bag.
The boy has a blue cap. || The boy has a blue cup.
The child has red shoes. || The child has red socks.
The baby has yellow socks. || The baby has yellow shoes.
The shoes are by the door. || The shoes are on the table.
The socks are in the drawer. || The socks are on the chair.
The hat is on the hook. || The hat is under the bed.
The boots are on the mat. || The boots are in the box.
The cap is in the schoolbag. || The cap is on the schoolbag.
`),
  makeLevel(58, "穿脱动作：put on / take off", ["put on", "take off", "shoes"], `
The girl is putting on a hat. || The girl is taking off a hat.
The boy is taking off a cap. || The boy is putting on a cap.
The child is putting on shoes. || The child is taking off shoes.
The child is taking off socks. || The child is putting on socks.
The girl is putting on a coat. || The girl is taking off a coat.
The boy is taking off a jacket. || The boy is putting on a jacket.
The child is putting on a sweater. || The child is taking off a sweater.
The girl is zipping a jacket. || The girl is opening a jacket.
The boy is buttoning a shirt. || The boy is unbuttoning a shirt.
The child is tying a shoe. || The child is holding a shoe.
The baby is pulling off a sock. || The baby is putting on a sock.
The girl is folding a dress. || The girl is wearing a dress.
The boy is hanging up a coat. || The boy is wearing a coat.
The child is packing shoes in a bag. || The child is taking shoes out of a bag.
The child is choosing a shirt. || The child is choosing a toothbrush.
`),
  makeLevel(59, "衣物颜色：red shirt / blue shoes", ["red shirt", "blue shoes", "green coat"], `
The shirt is red. || The shirt is blue.
The shoes are blue. || The shoes are black.
The coat is green. || The coat is yellow.
The dress is purple. || The dress is pink.
The cap is orange. || The cap is white.
The socks are yellow. || The socks are red.
The jacket is black. || The jacket is brown.
The skirt is pink. || The skirt is green.
The girl is wearing a red shirt. || The girl is wearing a blue shirt.
The boy is wearing blue shoes. || The boy is wearing black shoes.
The child is wearing a green coat. || The child is wearing a yellow coat.
The baby is wearing yellow socks. || The baby is wearing blue socks.
The woman is holding a purple dress. || The woman is holding a pink dress.
The man is holding a black jacket. || The man is holding a brown jacket.
The child is choosing a white cap. || The child is choosing an orange cap.
`),
  makeLevel(60, "衣物复习关", ["clothes", "wear", "colors"], `
The girl is wearing a yellow dress. || The girl is wearing a yellow coat.
The boy is wearing a green shirt. || The boy is wearing a green cap.
The child is putting on red shoes. || The child is taking off red shoes.
The baby is holding one sock. || The baby is holding two socks.
The coat is hanging by the door. || The coat is lying on the floor.
The hat is on the child's head. || The hat is in the child's hand.
The shoes are under the chair. || The shoes are on the chair.
The shirt is in the closet. || The shirt is on the table.
The girl is folding a skirt. || The girl is wearing a skirt.
The boy is zipping a blue jacket. || The boy is opening a blue jacket.
The child is packing a sweater. || The child is wearing a sweater.
The socks are beside the shoes. || The socks are inside the shoes.
The boots are near the door. || The boots are near the bed.
The cap is on the schoolbag. || The cap is in the lunch box.
The children are ready in coats. || The children are ready in pajamas.
`),
  makeLevel(61, "学习用品：pencil / ruler / eraser / notebook", ["pencil", "ruler", "eraser"], `
This is a pencil. || This is a ruler.
This is a ruler. || This is a pencil.
This is an eraser. || This is a notebook.
This is a notebook. || This is an eraser.
This is a schoolbag. || This is a lunch box.
This is a pencil case. || This is a cup.
The girl has a pencil. || The girl has a ruler.
The boy has an eraser. || The boy has a notebook.
The student has a schoolbag. || The student has a toy box.
The pencil is on the desk. || The pencil is under the desk.
The ruler is in the pencil case. || The ruler is on the pencil case.
The eraser is beside the notebook. || The eraser is under the notebook.
The notebook is in the schoolbag. || The notebook is on the schoolbag.
The pencil case is open. || The pencil case is closed.
The schoolbag is on the chair. || The schoolbag is under the chair.
`),
  makeLevel(62, "教室物品：desk / chair / board / shelf", ["desk", "chair", "board"], `
This is a desk. || This is a chair.
This is a chair. || This is a desk.
This is a board. || This is a door.
This is a shelf. || This is a table.
This is a classroom clock. || This is a classroom window.
The book is on the desk. || The book is under the desk.
The bag is on the chair. || The bag is under the chair.
The teacher is at the board. || The teacher is at the door.
The student is at a desk. || The student is by a shelf.
The pencils are in a cup. || The pencils are beside a cup.
The books are on the shelf. || The books are under the shelf.
The chair is next to the desk. || The chair is behind the board.
The clock is on the wall. || The clock is on the desk.
The window is behind the teacher. || The window is beside the student.
The classroom is clean. || The classroom is messy.
`),
  makeLevel(63, "课堂动作：read / write / draw / raise hand", ["read", "write", "raise hand"], `
The student is reading a book. || The student is closing a book.
The girl is writing in a notebook. || The girl is drawing in a notebook.
The boy is drawing a sun. || The boy is writing a word.
The child is raising one hand. || The child is hiding one hand.
The teacher is pointing to the board. || The teacher is pointing to the door.
The students are opening their books. || The students are closing their books.
The students are sitting at desks. || The students are standing by desks.
The child is sharpening a pencil. || The child is holding a pencil.
The girl is erasing a line. || The girl is drawing a line.
The boy is putting a book in the bag. || The boy is taking a book out of the bag.
The child is passing a ruler. || The child is holding a ruler.
The teacher is giving out notebooks. || The teacher is collecting notebooks.
The students are listening to the teacher. || The students are looking out the window.
The girl is reading quietly. || The girl is talking loudly.
The boy is writing at the desk. || The boy is eating at the desk.
`),
  makeLevel(64, "教室位置：on / in / under / beside", ["on desk", "in bag", "under chair"], `
The pencil is on the desk. || The pencil is under the desk.
The eraser is in the pencil case. || The eraser is beside the pencil case.
The book is under the chair. || The book is on the chair.
The ruler is beside the notebook. || The ruler is inside the notebook.
The schoolbag is behind the chair. || The schoolbag is on the chair.
The teacher is in front of the board. || The teacher is behind the board.
The student is next to the desk. || The student is under the desk.
The clock is above the board. || The clock is under the board.
The books are between two bags. || The books are beside one bag.
The chair is between two desks. || The chair is behind two desks.
The pencil case is on the shelf. || The pencil case is under the shelf.
The notebook is in the schoolbag. || The notebook is beside the schoolbag.
The eraser is under the notebook. || The eraser is on the notebook.
The board is behind the teacher. || The board is beside the teacher.
The classroom plant is by the window. || The classroom plant is on the board.
`),
  makeLevel(65, "教室复习关", ["classroom", "books", "teacher"], `
The teacher is drawing a star on the board. || The teacher is drawing a star on paper.
The girl is reading at her desk. || The girl is sleeping at her desk.
The boy is writing with a pencil. || The boy is writing with a ruler.
The student is putting an eraser in the pencil case. || The student is putting an eraser under the chair.
The books are neatly on the shelf. || The books are messy on the floor.
The schoolbag is open on the chair. || The schoolbag is closed under the chair.
The child is raising a hand in class. || The child is waving a hat in class.
The teacher is giving a notebook to a student. || The teacher is taking a notebook from a student.
The students are sitting in a row. || The students are standing in a row.
The classroom door is open. || The classroom door is closed.
The window is open in the classroom. || The window is closed in the classroom.
The pencil is beside the ruler. || The pencil is under the ruler.
The chair is pushed under the desk. || The chair is far from the desk.
The child is cleaning the desk. || The child is drawing on the desk.
The class is ready with books open. || The class is ready with bags open.
`),
  makeLevel(66, "朋友与同学：friend / classmate", ["friend", "classmate", "together"], `
This is my friend. || This is my teacher.
This is my classmate. || This is my brother.
The girl is with her friend. || The girl is with her mother.
The boy is with his classmate. || The boy is with his father.
Two friends are smiling. || Two friends are crying.
Two classmates are sitting together. || Two classmates are standing apart.
The friends are waving. || The friends are sleeping.
The classmates are reading together. || The classmates are eating together.
The girl is talking to a friend. || The girl is talking to a baby.
The boy is helping a classmate. || The boy is pushing a classmate.
The friends are sharing a book. || The friends are sharing a ball.
The classmates are walking in a line. || The classmates are running out of line.
The friends are drawing at one table. || The friends are drawing on the floor.
The girl is sitting next to her friend. || The girl is sitting behind her friend.
The boy is standing beside his classmate. || The boy is standing behind his classmate.
`),
  makeLevel(67, "朋友游戏：play / share / take turns", ["play", "share", "turns"], `
Two friends are playing with blocks. || Two friends are throwing blocks.
The children are taking turns on the slide. || The children are waiting by the slide.
The friends are sharing a toy car. || The friends are hiding a toy car.
The classmates are passing a ball. || The classmates are holding a ball.
The girl is giving a crayon to a friend. || The girl is taking a crayon from a friend.
The boy is building with a classmate. || The boy is building alone.
The friends are jumping rope together. || The friends are sitting with a rope.
The children are playing a board game. || The children are reading a storybook.
The classmates are cleaning up toys. || The classmates are spreading out toys.
The friends are laughing on the swing. || The friends are sitting on the swing.
The girl is waiting for her turn. || The girl is cutting the line.
The boy is passing the toy train. || The boy is keeping the toy train.
The friends are clapping for a classmate. || The friends are looking away.
The children are playing in the sandbox. || The children are eating in the sandbox.
The classmates are making a paper chain. || The classmates are tearing a paper chain.
`),
  makeLevel(68, "朋友帮助：help / give / carry", ["help", "give", "carry"], `
The girl is helping a friend stand up. || The girl is running past a friend.
The boy is carrying books for a classmate. || The boy is dropping books for a classmate.
The child is giving water to a friend. || The child is drinking water alone.
The friend is picking up a pencil. || The friend is throwing a pencil.
The classmate is holding the door. || The classmate is closing the door.
Two friends are cleaning the table. || Two friends are making the table messy.
The girl is sharing her umbrella. || The girl is closing her umbrella.
The boy is lending an eraser. || The boy is hiding an eraser.
The friends are carrying a box together. || The friends are sitting beside a box.
The classmates are putting chairs away. || The classmates are pulling chairs out.
The girl is helping with a schoolbag. || The girl is opening a lunch box.
The boy is giving a notebook back. || The boy is keeping a notebook.
The friends are looking at one picture. || The friends are looking at different pictures.
The child is finding a lost cap. || The child is kicking a cap.
The classmates are smiling after helping. || The classmates are frowning after helping.
`),
  makeLevel(69, "简单喜好：likes food / toys", ["likes", "apples", "toys"], `
The girl likes apples. || The girl likes bananas.
The boy likes milk. || The boy likes water.
The child likes noodles. || The child likes rice.
The baby likes soft toys. || The baby likes toy cars.
The girl likes a red ball. || The girl likes a blue ball.
The boy likes a toy train. || The boy likes a toy plane.
The child likes picture books. || The child likes blocks.
The friend likes orange juice. || The friend likes apple juice.
The classmate likes a green pencil. || The classmate likes a yellow pencil.
The girl likes drawing flowers. || The girl likes drawing houses.
The boy likes playing football. || The boy likes playing basketball.
The child likes singing. || The child likes dancing.
The friend likes the blue kite. || The friend likes the red kite.
The classmate likes the small robot. || The classmate likes the big robot.
The children like storybooks. || The children like picture cards.
`),
  makeLevel(70, "朋友与喜好复习关", ["friends", "share", "likes"], `
The girl likes reading with a friend. || The girl likes drawing with a friend.
The boy likes playing ball with a classmate. || The boy likes playing blocks with a classmate.
The friends are sharing apples. || The friends are sharing bananas.
The classmates are holding blue books. || The classmates are holding red books.
The child is giving a toy to a friend. || The child is taking a toy from a friend.
Two friends are sitting on one bench. || Two friends are standing by one bench.
The classmates are walking to class together. || The classmates are running from class together.
The friend likes the yellow hat. || The friend likes the green hat.
The girl is helping a classmate with shoes. || The girl is helping a classmate with books.
The boy is carrying a bag with a friend. || The boy is carrying a ball with a friend.
The children are taking turns with a scooter. || The children are standing beside a scooter.
The friends are clapping together. || The friends are sleeping together.
The classmate is sharing a ruler. || The classmate is hiding a ruler.
The girl is smiling at her friend. || The girl is angry at her friend.
The friends are ready for class. || The friends are ready for lunch.
`),
  makeLevel(71, "餐具物品：plate / bowl / spoon / chopsticks", ["plate", "bowl", "spoon"], `
This is a plate. || This is a bowl.
This is a bowl. || This is a plate.
This is a spoon. || This is a fork.
This is a fork. || This is a spoon.
These are chopsticks. || These are pencils.
This is a cup. || This is a bottle.
This is a lunch box. || This is a schoolbag.
The spoon is in the bowl. || The spoon is beside the bowl.
The fork is on the plate. || The fork is under the plate.
The chopsticks are beside the bowl. || The chopsticks are in the cup.
The cup is on the table. || The cup is under the table.
The bottle is in the bag. || The bottle is on the bag.
The lunch box is open. || The lunch box is closed.
The plate has rice on it. || The plate has fruit on it.
The bowl has noodles in it. || The bowl has soup in it.
`),
  makeLevel(72, "卫生物品：soap / towel / toothbrush", ["soap", "towel", "toothbrush"], `
This is soap. || This is a towel.
This is a towel. || This is soap.
This is a toothbrush. || This is a comb.
This is a comb. || This is a toothbrush.
This is toothpaste. || This is hand cream.
This is a mirror. || This is a window.
The towel is on the hook. || The towel is on the floor.
The soap is beside the sink. || The soap is under the sink.
The toothbrush is in the cup. || The toothbrush is beside the cup.
The comb is on the shelf. || The comb is under the shelf.
The mirror is above the sink. || The mirror is beside the sink.
The child is holding soap. || The child is holding a spoon.
The girl is using a towel. || The girl is using a blanket.
The boy is using a toothbrush. || The boy is using a fork.
The bathroom shelf is clean. || The bathroom shelf is messy.
`),
  makeLevel(73, "卧室物品：bed / pillow / blanket / lamp", ["bed", "pillow", "blanket"], `
This is a bed. || This is a desk.
This is a pillow. || This is a towel.
This is a blanket. || This is a coat.
This is a lamp. || This is a clock.
This is a toy box. || This is a lunch box.
The pillow is on the bed. || The pillow is under the bed.
The blanket is on the bed. || The blanket is on the floor.
The lamp is beside the bed. || The lamp is under the bed.
The toy box is open. || The toy box is closed.
The book is on the pillow. || The book is under the pillow.
The slippers are beside the bed. || The slippers are on the bed.
The pajamas are on the chair. || The pajamas are in the schoolbag.
The child is making the bed. || The child is sleeping in the bed.
The baby is holding a blanket. || The baby is holding a towel.
The bedroom is tidy. || The bedroom is messy.
`),
  makeLevel(74, "日常物品动作：use / put / open", ["use", "open", "put"], `
The child is opening a lunch box. || The child is closing a lunch box.
The girl is putting a spoon in a bowl. || The girl is taking a spoon out of a bowl.
The boy is putting a bottle in a bag. || The boy is taking a bottle out of a bag.
The child is using chopsticks. || The child is using a pencil.
The baby is holding a cup. || The baby is holding a sock.
The girl is folding a towel. || The girl is throwing a towel.
The boy is hanging up a towel. || The boy is dropping a towel.
The child is squeezing toothpaste. || The child is squeezing glue.
The girl is combing her hair with a comb. || The girl is holding a comb.
The boy is closing a toy box. || The boy is opening a toy box.
The child is turning on a lamp. || The child is turning off a lamp.
The baby is pulling a blanket. || The baby is pulling a book.
The girl is packing pajamas. || The girl is wearing pajamas.
The boy is putting slippers by the bed. || The boy is putting slippers on the bed.
The child is cleaning a plate. || The child is cleaning a mirror.
`),
  makeLevel(75, "日常物品复习关", ["soap", "towel", "toothbrush"], `
The toothbrush is in the blue cup. || The toothbrush is beside the blue cup.
The towel is hanging by the sink. || The towel is lying on the floor.
The spoon is in the lunch box. || The spoon is under the lunch box.
The pillow is on the bed. || The pillow is under the bed.
The blanket is folded on the chair. || The blanket is spread on the floor.
The child is using soap at the sink. || The child is using soap at the table.
The girl is putting a comb on the shelf. || The girl is putting a comb in the bowl.
The boy is drinking from a cup. || The boy is eating from a cup.
The baby is holding a soft blanket. || The baby is holding a hard plate.
The lamp is beside the bed. || The lamp is beside the sink.
The plate is on the table. || The plate is under the table.
The bottle is in the schoolbag. || The bottle is in the toy box.
The lunch box has rice inside. || The lunch box has fruit inside.
The toy box has blocks inside. || The toy box has balls inside.
The bathroom things are clean. || The bathroom things are messy.
`),
  makeLevel(76, "上学前：wake up / wash / dress", ["wake", "wash", "dress"], `
The child is waking up. || The child is sleeping.
The girl is making the bed. || The girl is jumping on the bed.
The boy is washing his face. || The boy is washing his shoes.
The child is brushing his teeth. || The child is combing his hair.
The girl is combing her hair. || The girl is washing her hands.
The boy is putting on a shirt. || The boy is taking off a shirt.
The child is putting on shoes. || The child is taking off shoes.
The child is packing a schoolbag. || The child is emptying a schoolbag.
The girl is putting a bottle in the bag. || The girl is taking a bottle out of the bag.
The boy is eating breakfast. || The boy is eating dinner.
The child is drinking milk. || The child is pouring milk.
The child is waiting by the door. || The child is sitting on the bed.
The mother is giving a coat. || The mother is taking a coat.
The father is holding the door open. || The father is closing the door.
The child is ready for school. || The child is ready for bed.
`),
  makeLevel(77, "课堂日常：listen / read / write", ["listen", "read", "write"], `
The students are listening to the teacher. || The students are talking to each other.
The class is opening books. || The class is closing books.
The girl is reading a page. || The girl is drawing a page.
The boy is writing in a notebook. || The boy is eating at a desk.
The child is raising a hand. || The child is hiding a hand.
The teacher is pointing to a picture. || The teacher is pointing to a window.
The students are repeating together. || The students are sleeping together.
The girl is passing a book. || The girl is keeping a book.
The boy is collecting pencils. || The boy is dropping pencils.
The child is cleaning the board. || The child is drawing on the board.
The class is lining up. || The class is running around.
The students are sitting quietly. || The students are jumping loudly.
The teacher is giving a sticker. || The teacher is giving a spoon.
The child is looking at the board. || The child is looking under the desk.
The class is ready for reading. || The class is ready for lunch.
`),
  makeLevel(78, "学校午餐：lunch / tray / rice", ["lunch", "tray", "rice"], `
The students are eating lunch. || The students are drinking water.
The child has a lunch tray. || The child has a pencil case.
The girl is eating rice. || The girl is eating noodles.
The boy is eating noodles. || The boy is eating bread.
The child is drinking soup. || The child is drinking juice.
The apple is on the tray. || The apple is under the tray.
The spoon is beside the bowl. || The spoon is under the bowl.
The lunch box is open. || The lunch box is closed.
The students are sitting at a lunch table. || The students are standing by a lunch table.
The child is cleaning the tray. || The child is eating from the tray.
The girl is putting rubbish in the bin. || The girl is holding rubbish.
The boy is wiping the table. || The boy is drawing on the table.
The children are washing their hands before lunch. || The children are washing their hands after lunch.
The teacher is helping at lunch. || The teacher is reading at lunch.
The class is leaving the lunch room. || The class is entering the classroom.
`),
  makeLevel(79, "放学后：home / gate / walk", ["home", "gate", "walk"], `
The child is waiting at the school gate. || The child is waiting at the classroom door.
The girl is walking home. || The girl is running in class.
The boy is carrying a schoolbag. || The boy is carrying a lunch tray.
The child is holding a parent's hand. || The child is holding a classmate's hand.
The students are leaving school. || The students are entering school.
The bus is waiting by the school. || The bus is driving away.
The child is riding a bike home. || The child is pushing a bike home.
The girl is taking off her shoes at home. || The girl is putting on her shoes at home.
The boy is putting the bag on a chair. || The boy is putting the bag under a bed.
The child is washing his hands after school. || The child is washing his shoes after school.
The child is eating a snack. || The child is eating breakfast.
The girl is reading after school. || The girl is sleeping after school.
The boy is doing a puzzle. || The boy is kicking a ball indoors.
The child is hanging up a coat. || The child is dropping a coat.
The family is sitting together after school. || The family is standing at the door.
`),
  makeLevel(80, "学校日常复习关", ["school", "lunch", "home"], `
The child is packing the schoolbag in the morning. || The child is unpacking the schoolbag at night.
The girl is walking into school. || The girl is walking out of school.
The boy is greeting the teacher. || The boy is hiding from the teacher.
The class is reading books together. || The class is eating snacks together.
The student is writing with a pencil. || The student is drawing with a spoon.
The child is eating lunch at school. || The child is brushing his teeth at school.
The students are washing their hands before lunch. || The students are washing their hands before class.
The girl is waiting in line. || The girl is cutting the line.
The boy is putting rubbish in the bin. || The boy is putting rubbish on the floor.
The child is carrying books to class. || The child is carrying shoes to class.
The schoolbag is on the chair. || The schoolbag is in the sink.
The teacher is helping a student. || The teacher is helping a baby.
The children are leaving the playground. || The children are entering the playground.
The child is going home with a parent. || The child is going home with a teacher.
The child is resting after school. || The child is running after school.
`),
  makeLevel(81, "There is：教室单数物品", ["there is", "desk", "board"], `
There is a book on the desk. || There is a book under the desk.
There is a pencil in the cup. || There is a pencil beside the cup.
There is an eraser on the notebook. || There is an eraser under the notebook.
There is a bag on the chair. || There is a bag under the chair.
There is a clock on the wall. || There is a clock on the desk.
There is a plant by the window. || There is a plant by the door.
There is a ruler in the pencil case. || There is a ruler under the pencil case.
There is a picture on the board. || There is a picture on the floor.
There is a chair beside the desk. || There is a chair behind the door.
There is a box under the table. || There is a box on the table.
There is a red book on the shelf. || There is a blue book on the shelf.
There is a yellow pencil on the desk. || There is a green pencil on the desk.
There is a small ball in the box. || There is a small ball under the box.
There is a clean towel by the sink. || There is a dirty towel by the sink.
There is a schoolbag by the door. || There is a schoolbag by the window.
`),
  makeLevel(82, "There are：教室复数物品", ["there are", "books", "pencils"], `
There are two books on the desk. || There is one book on the desk.
There are three pencils in the cup. || There are three rulers in the cup.
There are four chairs in the classroom. || There are four desks in the classroom.
There are five crayons in the box. || There are five pencils in the box.
There are two bags under the table. || There are two bags on the table.
There are three notebooks on the shelf. || There are three notebooks under the shelf.
There are two students at the board. || There are two teachers at the board.
There are three cups by the sink. || There are three bottles by the sink.
There are four balls in the basket. || There are four blocks in the basket.
There are two rulers beside the notebook. || There are two erasers beside the notebook.
There are five stars on the board. || There are five circles on the board.
There are three pictures on the wall. || There are three pictures on the desk.
There are two coats on the hook. || There are two hats on the hook.
There are four lunch boxes on the table. || There are four schoolbags on the table.
There are five children in line. || There are five children in a circle.
`),
  makeLevel(83, "There is / are：校园场景", ["playground", "library", "line"], `
There is a slide in the playground. || There is a swing in the playground.
There is a swing beside the tree. || There is a swing under the table.
There are two children on the seesaw. || There are two children beside the seesaw.
There are three balls in the basket. || There are three balls under the basket.
There is a teacher by the gate. || There is a teacher by the lunch table.
There are students in a line. || There are students in a circle.
There is a book on the library table. || There is a book on the playground slide.
There are many books on the library shelf. || There are many shoes on the library shelf.
There is a water bottle on the bench. || There is a water bottle under the bench.
There are two friends under the tree. || There are two friends on the tree.
There is a red kite in the sky. || There is a red kite on the ground.
There are clouds above the school. || There are clouds inside the school.
There is a small garden by the classroom. || There is a small garden on the board.
There are children near the sandbox. || There are children in the lunch box.
There is a bus outside the school. || There is a bus inside the classroom.
`),
  makeLevel(84, "There is / are：家庭物品", ["home", "bed", "table"], `
There is a cup on the table. || There is a cup under the table.
There is a pillow on the bed. || There is a pillow under the bed.
There is a towel by the sink. || There is a towel by the sofa.
There is a toothbrush in the cup. || There is a toothbrush in the bowl.
There are two shoes by the door. || There are two shoes on the bed.
There are three apples in the bowl. || There are three apples under the bowl.
There is a book on the sofa. || There is a book in the sink.
There is a toy car in the box. || There is a toy car under the box.
There are two jackets on the hooks. || There are two jackets on the floor.
There is a lamp beside the bed. || There is a lamp under the bed.
There are four spoons in the drawer. || There are four spoons on the bed.
There is a blanket on the chair. || There is a blanket in the lunch box.
There is a bottle in the schoolbag. || There is a bottle on the schoolbag.
There are two towels on the shelf. || There are two towels under the shelf.
There is a family picture on the wall. || There is a family picture on the floor.
`),
  makeLevel(85, "There is / are 复习关", ["there is", "there are", "review"], `
There is a pencil on the desk. || There are two pencils on the desk.
There are two books in the bag. || There is one book in the bag.
There is a coat on the hook. || There is a coat under the hook.
There are three cups on the table. || There are three cups under the table.
There is a ball beside the chair. || There is a ball on the chair.
There are four children in the playground. || There are four children in the kitchen.
There is a towel by the sink. || There is a towel by the bed.
There are two apples in the lunch box. || There are two apples on the lunch box.
There is a teacher in the classroom. || There is a teacher in the bedroom.
There are students in a line. || There are students under a table.
There is a pillow on the bed. || There is a pillow on the board.
There are socks in the drawer. || There are socks in the bowl.
There is a bottle beside the schoolbag. || There is a bottle inside the schoolbag.
There are crayons in the box. || There are crayons under the box.
There is a happy child at the desk. || There is a tired child at the desk.
`),
  makeLevel(86, "状态形容词：clean / dirty / wet / dry", ["clean", "dirty", "wet"], `
The hands are clean. || The hands are dirty.
The shoes are dirty. || The shoes are clean.
The towel is wet. || The towel is dry.
The shirt is dry. || The shirt is wet.
The lunch box is open. || The lunch box is closed.
The door is closed. || The door is open.
The pencil is sharp. || The pencil is broken.
The cup is full. || The cup is empty.
The plate is empty. || The plate is full.
The table is clean. || The table is messy.
The classroom is quiet. || The classroom is noisy.
The child is tired. || The child is excited.
The girl is happy. || The girl is sad.
The boy is surprised. || The boy is angry.
The baby is sleepy. || The baby is excited.
`),
  makeLevel(87, "大小长短：big / small / long / short", ["big", "small", "long"], `
The ball is big. || The ball is small.
The toy car is small. || The toy car is big.
The pencil is long. || The pencil is short.
The ruler is short. || The ruler is long.
The tree is tall. || The tree is short.
The table is low. || The table is high.
The bag is heavy. || The bag is light.
The feather is light. || The feather is heavy.
The snake toy is long. || The snake toy is short.
The train toy is long. || The train toy is short.
The box is big and red. || The box is small and red.
The cup is small and blue. || The cup is big and blue.
The child has a long scarf. || The child has a short scarf.
The girl has short socks. || The girl has long socks.
The boy has a tall tower. || The boy has a short tower.
`),
  makeLevel(88, "喜欢食物：likes apples / noodles", ["likes", "food", "fruit"], `
The girl likes apples. || The girl likes pears.
The boy likes bananas. || The boy likes oranges.
The child likes noodles. || The child likes rice.
The baby likes milk. || The baby likes water.
The friend likes bread. || The friend likes cake.
The classmate likes eggs. || The classmate likes corn.
The girl likes grapes. || The girl likes watermelon.
The boy likes juice. || The boy likes soup.
The child likes vegetables. || The child likes fruit.
The friend likes dumplings. || The friend likes noodles.
The classmate likes rice balls. || The classmate likes sandwiches.
The girl likes a red apple. || The girl likes a green apple.
The boy likes a yellow banana. || The boy likes a yellow pear.
The child likes warm soup. || The child likes cold juice.
The children are eating lunch together. || The children are eating snacks together.
`),
  makeLevel(89, "喜欢玩具与衣物：likes toys / clothes", ["likes toys", "likes clothes", "colors"], `
The girl likes a teddy bear. || The girl likes a toy robot.
The boy likes a toy train. || The boy likes a toy car.
The child likes building blocks. || The child likes picture cards.
The baby likes a soft ball. || The baby likes a soft blanket.
The friend likes a blue kite. || The friend likes a red kite.
The classmate likes a green pencil. || The classmate likes a yellow pencil.
The girl likes the pink dress. || The girl likes the purple dress.
The boy likes the blue shirt. || The boy likes the green shirt.
The child likes the red shoes. || The child likes the black shoes.
The friend likes the yellow cap. || The friend likes the orange cap.
The classmate likes the small robot. || The classmate likes the big robot.
The girl likes drawing flowers. || The girl likes drawing stars.
The boy likes reading animal books. || The boy likes reading vehicle books.
The child likes playing blocks. || The child likes playing cards.
The friends like the same game. || The friends like different games.
`),
  makeLevel(90, "状态与喜欢复习关", ["likes", "clean", "big"], `
The girl likes the clean table. || The girl likes the messy table.
The boy likes the big ball. || The boy likes the small ball.
The child likes the long train. || The child likes the short train.
The baby likes the soft blanket. || The baby likes the hard block.
The friend likes warm soup. || The friend likes cold juice.
The classmate likes the open book. || The classmate likes the closed book.
The girl has dry shoes. || The girl has wet shoes.
The boy has a clean shirt. || The boy has a dirty shirt.
The child is tired after running. || The child is excited after running.
The child is happy with a toy. || The child is sad with a toy.
The cup is full of milk. || The cup is empty.
The lunch box is closed. || The lunch box is open.
The classroom is quiet. || The classroom is noisy.
The pencil is sharp. || The pencil is broken.
The friends like playing together. || The friends like building blocks together.
`),
  makeLevel(91, "书包整理：in / out / pack", ["schoolbag", "pack", "inside"], `
The pencil is in the schoolbag. || The pencil is on the schoolbag.
The book is in the schoolbag. || The book is under the schoolbag.
The bottle is beside the schoolbag. || The bottle is inside the schoolbag.
The lunch box is in the schoolbag. || The lunch box is on the table.
The eraser is in the pencil case. || The eraser is under the pencil case.
The ruler is sticking out of the bag. || The ruler is inside the bag.
The child is zipping the schoolbag. || The child is opening the schoolbag.
The girl is packing a notebook. || The girl is taking out a notebook.
The boy is packing a pencil case. || The boy is taking out a pencil case.
The child is checking the schoolbag. || The child is kicking the schoolbag.
The bag is heavy with books. || The bag is light with one book.
The bag is open on the chair. || The bag is closed on the chair.
The child is putting a cap in the bag. || The child is putting shoes in the bag.
The mother is giving a lunch box. || The mother is giving a towel.
The schoolbag is ready by the door. || The schoolbag is open on the bed.
`),
  makeLevel(92, "教室位置与动作综合", ["classroom", "position", "action"], `
The girl is reading beside the window. || The girl is reading beside the door.
The boy is writing at the front desk. || The boy is writing at the back desk.
The teacher is standing in front of the class. || The teacher is standing behind the class.
The book is open on the desk. || The book is closed on the desk.
The pencil is under the notebook. || The pencil is on the notebook.
The eraser is between two pencils. || The eraser is beside one pencil.
The students are sitting in a circle. || The students are sitting in a line.
The child is putting a book on the shelf. || The child is taking a book from the shelf.
The girl is cleaning the board. || The girl is drawing on the board.
The boy is holding the classroom door. || The boy is closing the classroom door.
There is a red bag under the chair. || There is a red bag on the chair.
There are two rulers on the table. || There are two rulers under the table.
The class is looking at a picture. || The class is looking at the floor.
The student is pointing to the clock. || The student is pointing to the plant.
The teacher is smiling at the class. || The teacher is waving at the door.
`),
  makeLevel(93, "身体与衣物综合", ["body", "clothes", "wear"], `
The girl is putting a hat on her head. || The girl is putting a hat in her bag.
The boy is tying shoes on his feet. || The boy is holding shoes in his hands.
The child is washing his hands before putting on a shirt. || The child is drying his hands before putting on a shirt.
The baby has socks on both feet. || The baby has socks on both hands.
The girl has a scarf around her neck. || The girl has a scarf around her head.
The boy has a cap on his head. || The boy has a cap on his knee.
The child is taking off wet shoes. || The child is putting on wet shoes.
The girl is combing her hair before wearing a dress. || The girl is brushing her teeth before wearing a dress.
The boy is wearing a clean shirt. || The boy is wearing a dirty shirt.
The child is folding a coat with both hands. || The child is kicking a coat with both feet.
The baby is pulling a sock from one foot. || The baby is pulling a sock from one hand.
The girl is looking at shoes in the mirror. || The girl is looking at a toothbrush in the mirror.
The boy is raising one hand with a glove. || The boy is raising one hand without a glove.
The child is putting a jacket on a chair. || The child is putting a jacket in a bowl.
The clothes are ready on the bed. || The clothes are ready in the sink.
`),
  makeLevel(94, "朋友与学校综合", ["friends", "school", "help"], `
The girl is sharing a book with a friend. || The girl is hiding a book from a friend.
The boy is helping a classmate with a bag. || The boy is helping a classmate with a cup.
The friends are walking into the classroom. || The friends are walking into the kitchen.
The classmates are eating lunch together. || The classmates are reading together.
The friend is passing a pencil. || The friend is throwing a pencil.
The classmate is holding the door open. || The classmate is closing the door.
The children are playing ball at break. || The children are reading at break.
The girl is sitting next to her friend. || The girl is sitting under her friend.
The boy is standing behind a classmate. || The boy is standing beside a classmate.
The friends are cleaning their table. || The friends are making their table messy.
The classmates are putting books away. || The classmates are pulling books out.
The children are waiting in a line. || The children are pushing in a line.
The girl is giving water to a friend. || The girl is drinking water alone.
The boy is clapping for a classmate. || The boy is sleeping by a classmate.
The friends are ready for the lesson. || The friends are ready for bed.
`),
  makeLevel(95, "Stage 2 挑战复习关", ["review", "body", "classroom"], `
The child is touching a nose in the mirror. || The child is touching an ear in the mirror.
The girl is wearing a purple dress. || The girl is wearing a purple coat.
The boy is putting a book in the schoolbag. || The boy is putting a shoe in the schoolbag.
There are three pencils in the cup. || There are three spoons in the cup.
The friend likes the blue kite. || The friend likes the red kite.
The towel is wet by the sink. || The towel is dry by the sink.
The shoes are under the chair. || The shoes are on the chair.
The teacher is pointing to the board. || The teacher is pointing to the window.
The classmates are reading together. || The classmates are eating together.
The child is opening a lunch box. || The child is closing a lunch box.
The girl is washing clean hands. || The girl is washing dirty shoes.
The boy has a long ruler. || The boy has a short ruler.
There is a bottle beside the bag. || There is a bottle inside the bag.
The child likes warm soup. || The child likes cold juice.
The class is ready with books open. || The class is ready with bags open.
`),
  makeLevel(96, "早晨在家综合", ["morning", "home", "ready"], `
The child is waking up in bed. || The child is sleeping in bed.
The girl is folding a blanket. || The girl is throwing a blanket.
The boy is washing his face. || The boy is washing his shoes.
The child is brushing his teeth at the sink. || The child is combing his hair at the sink.
The girl is combing her hair by the mirror. || The girl is holding a towel by the mirror.
The boy is putting on a blue shirt. || The boy is taking off a blue shirt.
The child is eating breakfast at the table. || The child is eating lunch at the table.
The baby is drinking milk in a cup. || The baby is drinking water in a cup.
The mother is packing a lunch box. || The mother is opening a toy box.
The father is helping with shoes. || The father is helping with a towel.
The schoolbag is ready by the door. || The schoolbag is open on the floor.
The child is putting a bottle in the bag. || The child is putting a pillow in the bag.
The coat is on the hook. || The coat is under the bed.
The child is waving goodbye. || The child is hiding goodbye.
The family is leaving home in the morning. || The family is coming home in the evening.
`),
  makeLevel(97, "一天课堂综合", ["class", "teacher", "lesson"], `
The students are entering the classroom. || The students are leaving the classroom.
The teacher is greeting the class. || The teacher is greeting a baby.
The class is sitting at desks. || The class is standing on desks.
The girl is opening her notebook. || The girl is closing her notebook.
The boy is writing with a pencil. || The boy is writing with a spoon.
The student is raising one hand. || The student is raising one foot.
There is a book on every desk. || There is a shoe on every desk.
There are crayons in the box. || There are socks in the box.
The teacher is drawing a circle. || The teacher is drawing a triangle.
The class is reading a picture book. || The class is reading a lunch menu.
The child is erasing the board. || The child is washing the board.
The students are lining up for lunch. || The students are lying down for lunch.
The children are eating lunch together. || The children are eating breakfast together.
The class is cleaning up after lunch. || The class is making a mess after lunch.
The students are ready for the next lesson. || The students are ready for sleep.
`),
  makeLevel(98, "操场与运动综合", ["playground", "sports", "play"], `
The children are running on the playground. || The children are sitting on the playground.
The girl is jumping rope. || The girl is holding a rope.
The boy is kicking a football. || The boy is holding a football.
The child is throwing a basketball. || The child is catching a basketball.
The friends are passing a ball. || The friends are hiding a ball.
There is a slide beside the swing. || There is a slide beside the sandbox.
There are two children on the seesaw. || There are two children beside the seesaw.
The child is climbing a ladder. || The child is going down a ladder.
The baby is playing in the sandbox. || The baby is sitting in the sandbox.
The teacher is watching the children. || The teacher is eating lunch.
The boy is drinking water after running. || The boy is eating noodles after running.
The girl is tying her shoes. || The girl is taking off her shoes.
The children are taking turns on the swing. || The children are standing by the swing.
The friend is helping a child stand up. || The friend is running away.
The class is walking back to the classroom. || The class is running to the bus.
`),
  makeLevel(99, "放学回家综合", ["after school", "home", "family"], `
The child is walking home with a parent. || The child is walking home with a teacher.
The girl is putting shoes by the door. || The girl is putting shoes on the table.
The boy is hanging up his coat. || The boy is dropping his coat.
The child is washing his hands after school. || The child is washing his shoes after school.
The schoolbag is on the chair. || The schoolbag is in the sink.
The girl is taking out a notebook. || The girl is taking out a spoon.
The boy is eating an apple snack. || The boy is eating a rice lunch.
The child is drinking water at home. || The child is drinking soup at home.
The mother is reading with the child. || The mother is cooking with the child.
The father is helping with homework. || The father is playing football indoors.
The child is playing with blocks. || The child is playing with chopsticks.
The baby is holding a soft toy. || The baby is holding a school ruler.
There is a book on the sofa. || There is a book in the bathroom sink.
There are toys in the toy box. || There are toys in the lunch box.
The family is sitting together. || The family is standing apart.
`),
  makeLevel(100, "Stage 2 总复习：学校与家庭世界", ["review", "school", "home"], `
The girl has two clean hands. || The girl has two dirty hands.
The boy is wearing a blue shirt. || The boy is wearing a blue cap.
The child is putting a pencil in the schoolbag. || The child is putting a spoon in the schoolbag.
There is a book on the desk. || There is a book under the desk.
There are three crayons in the box. || There are three socks in the box.
The teacher is standing by the board. || The teacher is standing by the bed.
The friend is sharing a toy. || The friend is hiding a toy.
The child likes apples. || The child likes bananas.
The towel is wet by the sink. || The towel is dry by the sink.
The shoes are beside the door. || The shoes are on the bed.
The children are reading in class. || The children are eating in class.
The girl is jumping rope on the playground. || The girl is sleeping on the playground.
The boy is washing his face at home. || The boy is washing his bag at home.
The family is eating dinner at the table. || The family is eating dinner on the bed.
The child is ready for school. || The child is ready for bed.
`)
];

function buildCellItems(level) {
  return level.questions.flatMap((question, index) => [
    {
      cell: index * 2 + 1,
      question: index + 1,
      role: "correct",
      sentence: question.sentence,
      output: question.correctImage
    },
    {
      cell: index * 2 + 2,
      question: index + 1,
      role: "wrong",
      sentence: question.wrongSentence,
      output: question.wrongImage
    }
  ]);
}

function makePrompt(level) {
  const cells = buildCellItems(level).map((cell) => {
    const role = cell.role === "correct" ? "correct" : "distractor";
    return `${String(cell.cell).padStart(2, "0")}. ${role} for Q${String(cell.question).padStart(2, "0")}: ${cell.sentence}`;
  });

  return [
    `## Level ${pad(level.level)} | ${level.title}`,
    "",
    "Use case: illustration-story",
    "Asset type: one contact sheet for a children's English listening app",
    "Primary request: Create ONE clean contact sheet containing exactly 30 independent illustrations for 15 picture-choice questions.",
    "Layout: exactly 6 columns x 5 rows, one illustration per cell, equal cell sizes, straight white gutters between every cell. No extra rows, no extra columns, no merged cells, no overlapping, no collage, no text, no numbers, no labels.",
    "Style/medium: warm bright children's picture-book illustration, same character design across all cells, soft colors, clean outlines, low-detail background, subject large and clear.",
    "Composition/framing: each cell is an independent scene, centered subject, iPad-friendly 4:3 crop, full subject visible with generous padding, no speech bubbles, no writing on books/boards/signs, no watermarks.",
    "Important: The final image itself must contain illustrations only. Do not draw cell numbers or captions.",
    "Cell order is row-major, left to right, top to bottom. Odd-numbered cells are correct pictures. Even-numbered cells are distractor pictures for the previous odd cell.",
    "Within each adjacent pair, keep the two scenes visually similar and change only the one semantic point described.",
    "",
    "Cells:",
    cells.join("\n"),
    "",
    "Quality target: similar clarity to polished kindergarten English picture-card illustrations; every scene should be understandable at small size."
  ].join("\n");
}

function makeSourceMarkdown() {
  const parts = [
    "# 儿童英语听句选图教材｜Level 51-100",
    "",
    "> Stage 2: body, clothes, school, classroom, friends, daily objects, simple likes, and There is / There are.",
    ""
  ];

  for (const level of stageTwoLevels) {
    parts.push(`## Level ${pad(level.level)}｜${level.title}`, "");
    for (const [index, question] of level.questions.entries()) {
      parts.push(`${pad(level.level, 2)}-${pad(index + 1, 2)}. ${question.sentence}`);
    }
    parts.push("");
  }

  return parts.join("\n");
}

function writeOutputs() {
  if (stageOneLevels.length !== 50) {
    throw new Error(`Expected 50 stage one levels, found ${stageOneLevels.length}`);
  }
  if (stageTwoLevels.length !== 50) {
    throw new Error(`Expected 50 stage two levels, found ${stageTwoLevels.length}`);
  }

  for (const level of stageTwoLevels) {
    if (level.questions.length !== 15) {
      throw new Error(`Level ${level.level} has ${level.questions.length} questions`);
    }
    const uniqueSentences = new Set(level.questions.map((question) => question.sentence));
    if (uniqueSentences.size !== 15) {
      throw new Error(`Level ${level.level} has duplicate sentences`);
    }
  }

  const combinedLevels = [...stageOneLevels, ...stageTwoLevels];

  mkdirSync(dirname(dataPath), { recursive: true });
  writeFileSync(
    dataPath,
    `// Generated by scripts/generate-textbook-stage2.mjs.\n` +
      `// Do not edit by hand.\n\n` +
      `export const textbookLevels = ${JSON.stringify(combinedLevels, null, 2)};\n`
  );

  writeFileSync(
    stageTwoDataPath,
    `// Generated by scripts/generate-textbook-stage2.mjs.\n` +
      `// Do not edit by hand.\n\n` +
      `export const stageTwoTextbookLevels = ${JSON.stringify(stageTwoLevels, null, 2)};\n`
  );

  mkdirSync(dirname(sourcePath), { recursive: true });
  writeFileSync(sourcePath, makeSourceMarkdown());

  mkdirSync(manifestRoot, { recursive: true });
  const promptSections = [
    "# Textbook Contact Sheet Prompts | Level 51-100",
    "",
    "> Each level uses one AI-generated 6x5 contact sheet. Crop it with `npm run crop:textbook-sheet -- <level> <sheet-path> 0` after saving the generated sheet.",
    ""
  ];

  for (const level of stageTwoLevels) {
    const cellItems = buildCellItems(level);
    writeFileSync(
      `${manifestRoot}/level-${pad(level.level)}.manifest.json`,
      JSON.stringify(
        {
          level: level.level,
          title: level.title,
          layout: { columns: 6, rows: 5 },
          sheet: `${manifestRoot}/level-${pad(level.level)}.png`,
          cells: cellItems
        },
        null,
        2
      )
    );
    promptSections.push(makePrompt(level), "");
  }

  writeFileSync(promptPath, promptSections.join("\n"));
  console.log(`Generated ${stageTwoLevels.length} stage two levels and ${combinedLevels.length} total levels.`);
}

writeOutputs();

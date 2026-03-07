import { type VocabItem } from "./../src/store/contentStore";

export const INITIAL_DATA: VocabItem[] = [
  // =====================
  // หมวด Animals (1-8)
  // =====================
  {
    id: "1",
    word: "DOG",
    lesson: "Animals",
    ascii:
      "   ,    /-.\n  ((___/ __>\n  /      }\n  \\\\ .--.(    ___\njgs \\\\   \\\\  /___\\\\",
    audioFile: "Dog.mp3",
    choices: { A: "Dog", B: "Wolf", C: "Fox", D: "Bear" },
    correct: "A",
  },
  {
    id: "2",
    word: "CAT",
    lesson: "Animals",
    ascii:
      " |\\\\__/,|   (`\\\\\n |_ _  |.--.) )\n ( T   )     /\n(((^_(((/(((_/",
    audioFile: "Cat.mp3",
    choices: { A: "Tiger", B: "Cat", C: "Lion", D: "Mouse" },
    correct: "B",
  },
  {
    id: "3",
    word: "FISH",
    lesson: "Animals",
    ascii:
      "      /`·.¸\n     /¸...¸`:·\n ¸.·´  ¸   `·.¸.·´)\n: © ):´;     ¸  {\n `·.¸ `·  ¸.·´\\\\`·¸)\n     `\\\\\\\\´´\\\\¸.·´",
    audioFile: "Fish.mp3",
    choices: { A: "Frog", B: "Crab", C: "Fish", D: "Shark" },
    correct: "C",
  },
  {
    id: "4",
    word: "BEAR",
    lesson: "Animals",
    ascii:
      " __         __\n/  \\\\.-\"\"\"-./  \\\\\n\\\\    -   -    /\n |   o   o   |\n \\\\  .-'''-.  /\n  '-\\\\__Y__/-'\n     `---`",
    audioFile: "Bear.mp3",
    choices: { A: "Bear", B: "Lion", C: "Wolf", D: "Gorilla" },
    correct: "A",
  },
  {
    id: "5",
    word: "WHALE",
    lesson: "Animals",
    ascii:
      '       .\n     ":"\n   ___:____     |"\\\\/"|\n ,\'        `.    \\\\  /\n |  O        \\\\___/  |\n~^~^~^~^~^~^~^~^~^~^~^~^~',
    audioFile: "Whale.mp3",
    choices: { A: "Shark", B: "Dolphin", C: "Seal", D: "Whale" },
    correct: "D",
  },
  {
    id: "6",
    word: "GIRAFFE",
    lesson: "Animals",
    ascii:
      "     .-\",\n     `~||\n       ||___\n       (':.)`\n       || ||\njgs    || ||\n       ^^ ^^",
    audioFile: "Giraffe.mp3",
    choices: { A: "Zebra", B: "Giraffe", C: "Camel", D: "Elephant" },
    correct: "B",
  },
  {
    id: "7",
    word: "SPIDER",
    lesson: "Animals",
    ascii: "  / _ \\\\\n\\\\_\\\\(_)/_/\n _//o\\\\\\\\_ Max\n  /   \\\\",
    audioFile: "Spider.mp3",
    choices: { A: "Ant", B: "Spider", C: "Beetle", D: "Fly" },
    correct: "B",
  },
  {
    id: "8",
    word: "DEER",
    lesson: "Animals",
    ascii:
      "(             )\n `--(_   _)--'\n     Y-Y\n    /@@ \\\\\n   /     \\\\\n   `--'.  \\\\             ,\n       |   `.__________/)",
    audioFile: "Deer.mp3",
    choices: { A: "Horse", B: "Goat", C: "Deer", D: "Cow" },
    correct: "C",
  },

  // ===========================
  // หมวด School Objects (9-16)
  // ===========================
  {
    id: "9",
    word: "BOOK",
    lesson: "School Objects",
    ascii:
      '         _______\n        /       /_\n       /  -/-  / /\n      /   /   / /\n     /_______/ /\njgs  ((______| /\n      `"""""""`',
    audioFile: "Book.mp3",
    choices: { A: "Book", B: "Note", C: "Paper", D: "File" },
    correct: "A",
  },
  {
    id: "10",
    word: "PRINTER",
    lesson: "School Objects",
    ascii:
      "   .----.\n   |C>_ |\n __|____|__\n|  ______--|\n`-/.::::.\\\\-'a\n `--------'",
    audioFile: "Printer.mp3",
    choices: { A: "Scanner", B: "Monitor", C: "Printer", D: "Fax" },
    correct: "C",
  },
  {
    id: "11",
    word: "MOUSE",
    lesson: "School Objects",
    ascii: "   /\n __|_\n|____|\n|    |\n|    |\n\\\\____/",
    audioFile: "Mouse.mp3",
    choices: { A: "Keyboard", B: "Mouse", C: "Wire", D: "Pen" },
    correct: "B",
  },
  {
    id: "12",
    word: "CLOCK",
    lesson: "School Objects",
    ascii:
      ".'`~~~~~~~~~~~`'.\n(  .'11 12 1'.  )\n|  :10 \\\\    2:  |\n|  :9   @-> 3:  |\n|  :8       4;  |\n'. '..7 6 5..' .'\n ~-------------~  ldb",
    audioFile: "Clock.mp3",
    choices: { A: "Watch", B: "Clock", C: "Timer", D: "Alarm" },
    correct: "B",
  },
  {
    id: "13",
    word: "CAMERA",
    lesson: "School Objects",
    ascii:
      "         _\n     _n_|_|_,_\n    |===.-.===|\n    |  ((_))  |\njgs '==='-'==='",
    audioFile: "Camera.mp3",
    choices: { A: "Phone", B: "Video", C: "Photo", D: "Camera" },
    correct: "D",
  },
  {
    id: "14",
    word: "PLUG",
    lesson: "School Objects",
    ascii:
      "     ____\n ____|    \\\\\n(____|     `._____\n ____|       _|___\n(____|     .'\n     |____/",
    audioFile: "Plug.mp3",
    choices: { A: "Cable", B: "Plug", C: "Socket", D: "Switch" },
    correct: "B",
  },
  {
    id: "15",
    word: "TV",
    lesson: "School Objects",
    ascii:
      " ___________\n|  .----.  o|\n| |      | o| \n| |      | o|\n|__`----`___|\n `         `\n\nlc",
    audioFile: "Tv.mp3",
    choices: { A: "Radio", B: "Computer", C: "TV", D: "Screen" },
    correct: "C",
  },
  {
    id: "16",
    word: "CALCULATOR",
    lesson: "School Objects",
    ascii:
      ' __________\n| ________ |\n||12345678||\n|""""""""""|\n|[M|#|C][-]|\n|[7|8|9][+]|\n|[4|5|6][x]|\n|[1|2|3][%]|\n|[.|O|:][=]|\n"----------"  hjw',
    audioFile: "Calculator.mp3",
    choices: { A: "Phone", B: "Calculator", C: "Keyboard", D: "Tablet" },
    correct: "B",
  },
  {
    id: "17",
    word: "BASKETBALL",
    lesson: "Sports",
    ascii:
      "           ____|\n        o  \\%/ |~~\\\n  o//              |\n  8                |\n / >               |\n~ ~             ~~~~~~",
    audioFile: "Basketball.mp3",
    choices: { A: "Basketball", B: "Volleyball", C: "Tennis", D: "Baseball" },
    correct: "A",
  },
  {
    id: "18",
    word: "ICE HOCKEY",
    lesson: "Sports",
    ascii:
      "          __O         O__\n          \\/\\         /\\/\n          |\\ \\       / /|\nejm97    /  | \\_ = _/ |  \\\n        ~   ~         ~   ~",
    audioFile: "IceHockey.mp3",
    choices: { A: "Ice Hockey", B: "Skating", C: "Skiing", D: "Snowboard" },
    correct: "A",
  },
  {
    id: "19",
    word: "CHESS",
    lesson: "Sports",
    ascii: "  o\n (^) \n-=H=- BISHOP\n ] [\n/___\\",
    audioFile: "Chess.mp3",
    choices: { A: "Chess", B: "Checkers", C: "Poker", D: "Domino" },
    correct: "A",
  },
  {
    id: "20",
    word: "SOCCER",
    lesson: "Sports",
    ascii:
      "                     ___\n o__        o__     |   |\\\n/|          /\\      |   |X\\\n/ > o        <\\     |   |XX\\",
    audioFile: "Soccer.mp3",
    choices: { A: "Rugby", B: "Soccer", C: "Football", D: "Futsal" },
    correct: "B",
  },
  {
    id: "21",
    word: "JUGGLING",
    lesson: "Sports",
    ascii:
      "     -o\n   o   `o\n   '\n   \\_Q_/\n     I\n    /T\\\n    \\|/\n____=0=____",
    audioFile: "Juggling.mp3",
    choices: { A: "Dancing", B: "Juggling", C: "Gymnastics", D: "Magic" },
    correct: "B",
  },
  {
    id: "22",
    word: "FOOTBALL",
    lesson: "Sports",
    ascii:
      "        _.-=\"\"=-._\n      .'\\\\-++++-//'.\njgs  (  ||      ||  )\n      './/      \\\\.'\n        `'-=..=-'`",
    audioFile: "Football.mp3",
    choices: { A: "Football", B: "Rugby", C: "Soccer", D: "Baseball" },
    correct: "A",
  },
  {
    id: "23",
    word: "FENCING",
    lesson: "Sports",
    ascii:
      "           \\ /\n      |_O   X  O_\\\n        |`-/ \\-'\\\n        |\\     / |\nejm    /  |    |  \\",
    audioFile: "Fencing.mp3",
    choices: { A: "Fencing", B: "Boxing", C: "Karate", D: "Taekwondo" },
    correct: "A",
  },
  {
    id: "24",
    word: "BOWLING",
    lesson: "Sports",
    ascii:
      "         .-.\n      .-.\\ /    .-.\n      \\ /|=|    \\ /\n      |=|   \\   |=|\n     /   \\ ---./   \\\n     |   / ..  \\   |\n     |  |#  '   |  |\njgs   '._\\     /_.'\n          '---'",
    audioFile: "Bowling.mp3",
    choices: { A: "Bowling", B: "Golf", C: "Tennis", D: "Baseball" },
    correct: "A",
  },
  // =====================
  // หมวด Events (25-28)
  // =====================
  {
    id: "25",
    word: "CHRISTMAS",
    lesson: "Events",
    ascii:
      "          *\n         /.\\\n        /..'\\\n        /'.'\\\n       /.''.'\\\n       /.'.'.\\\n\"'\"\"\"\"/'.''.'.\\\"\"'\"'\"\"\n  jgs ^^^[_]^^^",
    audioFile: "Christmas.mp3",
    choices: { A: "Christmas", B: "New Year", C: "Birthday", D: "Halloween" },
    correct: "A",
  },
  {
    id: "26",
    word: "GRADUATION",
    lesson: "Events",
    ascii:
      "      _.-'`'-._\n   .-'    _    '-.\n    `-.__  `\\_.-'\n      |  `-``\\|\njgs   `-.....-A\n              #\n              #",
    audioFile: "Graduation.mp3",
    choices: { A: "Wedding", B: "Festival", C: "Graduation", D: "Meeting" },
    correct: "C",
  },
  {
    id: "27",
    word: "HALLOWEEN",
    lesson: "Events",
    ascii:
      '      __J"L__\n  ,-"`--...--\'"-.\n /  /\\       /\\  \\\nJ  /__\\  _  /__\\  L\n|       / \\       |\nJ    _  """  _    F\n \\   \\/\\_/\\//   /\n  "-._\\/\\_/\\/_,-"Krogg\n      """""""',
    audioFile: "Halloween.mp3",
    choices: { A: "Halloween", B: "Christmas", C: "Carnival", D: "Festival" },
    correct: "A",
  },
  {
    id: "28",
    word: "NEW YEAR",
    lesson: "Events",
    ascii:
      "      _   _\n     ((\\o/))\n.-----//^\\\\-----.\n|    /`| |`\\    |\n|      | |      |\n|      | |      |\n|      | |      |\n'------===------'",
    audioFile: "NewYear.mp3",
    choices: { A: "Birthday", B: "New Year", C: "Christmas", D: "Festival" },
    correct: "B",
  },
];
